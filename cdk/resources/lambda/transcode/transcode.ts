import { exec } from 'node:child_process'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs = require('node:fs');
import { Readable } from 'node:stream';
import { promisify } from 'node:util';

const execPromise = promisify(exec);
async function handler(event: any, context: any) {
  const BUCKET_NAME = process.env.BUCKET_NAME || '';
  console.log(event)

  const id = event.id
  const movieId = `${id}/initial.mp4`;
  const resolution = event.resolution;

  const download_path = '/tmp/movie/'
  const file_path = download_path + 'initial.mp4'
  const output_path = `/tmp/movie/${resolution}.mp4`

  try {
    let region = 'eu-central-1';
    const client = new S3Client({ region: region });

    const bucketParams = {
      Bucket: BUCKET_NAME,
      Key: movieId,
    }

    if (!fs.existsSync(download_path)) {
      fs.mkdirSync(download_path)
    }

    const data = await client.send(new GetObjectCommand(bucketParams));
    const inputStream = data.Body;
    if (inputStream instanceof Readable) {
      const outputStream = fs.createWriteStream(file_path);
      inputStream.pipe(outputStream);
      await new Promise(resolve => outputStream.on('finish', () => {
        console.log('downloaded movie')
      }));

      const res_command = `/opt/bin/ffprobe -v quiet -print_format json -show_format -show_streams ${file_path}`
      var { stdout, } = await execPromise(res_command)

      const output = JSON.parse(stdout);
      const res = output['streams'][0]['height']
      const command = `/opt/bin/ffmpeg -i ${download_path} -vf "scale=${res}:${resolution}" -c:a copy ${output_path}`

      var { stdout, stderr } = await execPromise(command);

      const readStream = fs.createReadStream(output_path);

      const putObject = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `id/${resolution}.mp4`,
        Body: readStream,
        Tagging: 'transcoded=True'
      })


      await client.send(putObject)

      fs.rm(output_path, err => {
        console.log(err)
      })
      fs.rm(download_path, err => {
        console.log(err)
      })
    }


  } catch (error) {
    console.log(error)
    throw (error)
  }



  return event;
}


export { handler };
