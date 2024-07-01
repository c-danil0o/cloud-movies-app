import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// @ts-ignore
async function handler(event: APIGatewayProxyEvent, context: Context) {

  const BUCKET_NAME = process.env.BUCKET_NAME || '';

  const requestedItemId = event.pathParameters?.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  try {

    let REGION = 'eu-central-1';
    let bucket = BUCKET_NAME;
    let key = requestedItemId;
    const client = new S3Client({ region: REGION });
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 500 });


    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
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
