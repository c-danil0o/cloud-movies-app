import { Context, S3Event } from "aws-lambda";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: S3Event, context: Context) {

  try {

    const time = event.Records[0].eventTime;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log("Item: ", key, " uploaded at: ", time);

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        id: key,
      },
      UpdateExpression: "set upload_status = :newstatus",
      ExpressionAttributeValues: {
        ":newstatus": "available",
      },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    console.log(response);
    return response;



  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err }
  }
}

export { handler };
