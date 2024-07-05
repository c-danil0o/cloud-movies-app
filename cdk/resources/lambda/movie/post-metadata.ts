import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Movie } from "../../../types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayProxyEvent, context: Context) {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as Movie;
  const db = DynamoDBDocument.from(new DynamoDB());
  console.log(event)
  try {
    let key = item.id;

    item.id = key;
    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await db.put(params);





    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify("success"
      ),
    };

    return response;

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err }
  }
}

export { handler };

