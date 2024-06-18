import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, S3Event } from "aws-lambda";


async function handler(event: S3Event, context: Context) {

  try {

    const time = event.Records[0].eventTime;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log("Item: ", key, " uploaded at: ", time);


  } catch (err) {
    console.error(err);
  }
}

export { handler };
