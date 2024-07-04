import { exec } from 'node:child_process'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs = require('node:fs');
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import * as StreamPromises from 'node:stream/promises';


const execPromise = promisify(exec);
async function handler(event: any, context: any) {
  const BUCKET_NAME = process.env.BUCKET_NAME || '';
  console.log(event)

  const movieId = event.id;
  const id = String(event.id).split("/")[0];
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
    console.log('created folder')

    const data = await client.send(new GetObjectCommand(bucketParams));
    console.log('downloaded')
    const inputStream = data.Body;
    if (inputStream instanceof Readable) {
      const outputStream = fs.createWriteStream(file_path);
      // inputStream.pipe(outputStream);
      await StreamPromises.pipeline(inputStream, outputStream);
      // await new Promise(resolve => outputStream.on('finish', () => {
      //   console.log('saved movie')
      // }));
      console.log('saved')

      // const res_command = `/opt/bin/ffprobe -v quiet -print_format json -show_format -show_streams ${file_path}`
      // var { stdout, stderr } = await execPromise(res_command)
      // console.log(stderr)
      //
      // const output = JSON.parse(stdout);
      // const res = output['streams'][0]['height']
      // console.log(res)
      const command = `/opt/bin/ffmpeg -i ${file_path} -vf scale="-2:${resolution}" -preset ultrafast -crf 23 -c:v libx264 -c:a copy ${output_path}`

      var { stdout, stderr } = await execPromise(command);
      console.log(stderr)
      console.log('transcoded')

      const readStream = fs.createReadStream(output_path);

      const putObject = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${id}/${resolution}.mp4`,
        Body: readStream,
        Tagging: 'transcoded=True'
      })


      await client.send(putObject)
      console.log('uploaded')

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


  return { statusCode: 200, body: event.resolution }
}


export { handler };
