import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SubscriptionDto } from "../../dto/subscription-dto";
import { updateFeedInfo } from "./update-feed-info";

// @ts-ignore
async function handler(event: APIGatewayProxyEvent, context: Context) {

  const BUCKET_NAME = process.env.BUCKET_NAME || '';

  const requestedItemId = event.pathParameters?.id;
  const resolution = event.queryStringParameters?.resolution;
  console.log(event)

  if (!requestedItemId || !resolution) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as SubscriptionDto;

  try {

    let REGION = 'eu-central-1';
    let bucket = BUCKET_NAME;
    let key = `${requestedItemId}/${resolution}.mp4`;
    const client = new S3Client({ region: REGION });
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 500 });
    if (item)
      await updateFeedInfo(item.user_id, item.type, item.value);
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        url: signedUrl,
      }),
    };
    return response;
  } catch (err) {
    console.error(err);
  }
}

export { handler };
