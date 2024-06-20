import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { NewMovie } from "../../types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayProxyEvent, context: Context) {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as NewMovie;
  const db = DynamoDBDocument.from(new DynamoDB());
  console.log(event)
  try {
    let REGION = 'eu-central-1';
    let bucket = BUCKET_NAME;
    let key = randomUUID();

    const client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn: 500 });
    console.log("PresignedUrl: ", presignedUrl);

    item.id = key;
    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await db.put(params);





    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({
        Url: presignedUrl,
        Key: key,
      }),
    };

    return response;

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err }
  }
}

export { handler };

