import { SQSEvent, Context, SQSHandler, SQSRecord } from "aws-lambda";
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'
import { S3Client, GetObjectTaggingCommand } from '@aws-sdk/client-s3'


async function handler(event: SQSEvent, context: Context) {
  const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN || '';
  const BUCKET_NAME = process.env.BUCKET_NAME || '';
  for (const message of event.Records) {
    await processMessageAsync(message, STATE_MACHINE_ARN, BUCKET_NAME);
  }
  console.info("done");

}

async function processMessageAsync(message: SQSRecord, arn: string, bucket: string): Promise<any> {
  try {
    console.log(`Processed message ${message.body}`);
    let obj = JSON.parse(message.body)
    if (obj["Records"]) {
      let id = obj["Records"][0]["s3"]["object"]["key"]

      let region = 'eu-central-1';
      const s3Client = new S3Client({ region: region })
      const res = await s3Client.send(new GetObjectTaggingCommand({ Bucket: bucket, Key: id }));
      if (res.TagSet) {
        for (let i = 0; i < res.TagSet?.length; i++) {
          if (res.TagSet[i].Key == 'transcoded')
            return;
        }

      }
      const client = new SFNClient();
      const input = {
        stateMachineArn: arn,
        input: JSON.stringify(
          {
            "input":
              [
                {
                  "id": id,
                  "resolution": "720"
                },
                {
                  "id": id,
                  "resolution": "480"
                },
                {
                  "id": id,
                  "resolution": "360"
                },

              ],
            "transcodeOutput": {},
            "output": {}
          }
        )
      }
      const command = new StartExecutionCommand(input);
      console.log(message)
      const response = client.send(command);
      await Promise.resolve(response);
    }

  } catch (err) {
    console.error("An error occurred");
    throw err;
  }
}
export { handler }

