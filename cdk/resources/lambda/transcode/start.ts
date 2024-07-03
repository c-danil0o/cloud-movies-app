import { SQSEvent, Context, SQSHandler, SQSRecord } from "aws-lambda";
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'


async function handler(event: SQSEvent, context: Context) {
  const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN || '';
  for (const message of event.Records) {
    await processMessageAsync(message, STATE_MACHINE_ARN);
  }
  console.info("done");

}

async function processMessageAsync(message: SQSRecord, arn: string): Promise<any> {
  try {
    console.log(`Processed message ${message.body}`);
    let obj = JSON.parse(message.body)
    if (obj["Records"]) {
      const client = new SFNClient();
      let id = obj["Records"][0]["s3"]["object"]["key"]
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
            "transcodeOutput": {}
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

