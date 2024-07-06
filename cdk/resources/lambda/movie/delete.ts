import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
const TABLE_NAME = process.env.TABLE_NAME || "";
const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME || "";
const CREW_TABLE_NAME = process.env.CREW_TABLE_NAME || "";

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const itemId = event.pathParameters?.id;
  const deleteType = event.queryStringParameters?.deleteType;
  console.log(event);

  if (!itemId || !deleteType) {
    return {
      statusCode: 400,
      body: JSON.stringify("Error: You are missing the path parameter id"),
    };
  }
  try {
    let REGION = "eu-central-1";
    const client = new S3Client({ region: REGION });
    const dbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(dbClient);
    // if full delete then delete dependencies
    if (deleteType == "full") {
      const query = new QueryCommand({
        TableName: RATINGS_TABLE_NAME,
        IndexName: "MovieIndex",
        KeyConditionExpression: "#movie_id = :movie_id",
        ExpressionAttributeNames: {
          "#movie_id": "movie_id",
          "#id": "id",
        },
        ExpressionAttributeValues: {
          ":movie_id": itemId,
        },
        ProjectionExpression: "#id",
      });
      const response = await docClient.send(query);
      if (response && response.Items) {
        console.log(response.Items);
        for (const rating of response.Items) {
          const dbCommand = new DeleteCommand({
            TableName: RATINGS_TABLE_NAME,
            Key: {
              id: rating.id,
            },
          });
          await docClient.send(dbCommand);
          console.log("deleted rating: " + rating.id);
        }
      }
    }
    if (deleteType == "full" || deleteType == "table-file") {
      // delete from s3
      const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: [
            { Key: `${itemId}/initial.mp4` },
            { Key: `${itemId}/720.mp4` },
            { Key: `${itemId}/480.mp4` },
            { Key: `${itemId}/360.mp4` },
          ],
        },
      });
      const { Deleted } = await client.send(command);
      console.log(Deleted);
    }

    if (
      deleteType == "full" ||
      deleteType == "table-file" ||
      deleteType == "table"
    ) {
      // delete from dynamo

      const dbCommand = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: itemId,
        },
      });

      const deleteDb = await docClient.send(dbCommand);
      console.log(deleteDb);

      // delete from crew table
      const query = new QueryCommand({
        TableName: CREW_TABLE_NAME,
        IndexName: "MovieIndex",
        KeyConditionExpression: "#movie_id = :movie_id",
        ExpressionAttributeNames: {
          "#movie_id": "movie_id",
          "#user_id": "user_id",
        },
        ExpressionAttributeValues: {
          ":movie_id": itemId,
        },
        ProjectionExpression: "#user_id",
      });
      const response = await docClient.send(query);
      if (response && response.Items) {
        console.log(response.Items);
        for (const actor of response.Items) {
          const dbCommand = new DeleteCommand({
            TableName: CREW_TABLE_NAME,
            Key: {
              user_id: actor.user_id,
              movie_id: itemId,
            },
          });
          await docClient.send(dbCommand);
          console.log("deleted actor: " + actor.user_id);
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify("Success: Delete success") };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: JSON.stringify("Error: Deleting failed") };
  }
}

export { handler };
