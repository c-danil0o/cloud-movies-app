import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
async function handler(event: any, context: any) {
  const TABLE_NAME = process.env.TABLE_NAME || "";
  try {
    console.log(event)
    const id = String(event['input'][0]['id']).split("/")[0];
    console.log(id)
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        id: id,
      },
      UpdateExpression: "set upload_status = :newstatus",
      ExpressionAttributeValues: {
        ":newstatus": "failed",
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

