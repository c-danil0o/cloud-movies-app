import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const itemId = event.pathParameters?.id;
  console.log(event)

  if (!itemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }
  try {
    let REGION = 'eu-central-1';

    const client = new S3Client({ region: REGION });
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: [{ Key: `${itemId}/initial.mp4` }, { Key: `${itemId}/720.mp4` }, { Key: `${itemId}/480.mp4` }, { Key: `${itemId}/360.mp4` }],
      }
    })
    const { Deleted } = await client.send(command);
    console.log(Deleted)

    const dbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(dbClient);

    const dbCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        id: itemId
      }
    });

    const deleteDb = await docClient.send(dbCommand)
    console.log(deleteDb)

    return { statusCode: 200, body: `Success: Delete success` };




  } catch (err) {
    console.log(err)
    return { statusCode: 500, body: `Error: Deleting failed` };
  }
}

export { handler };

