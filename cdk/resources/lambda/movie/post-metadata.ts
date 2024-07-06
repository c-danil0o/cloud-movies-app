import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Movie } from "../../../types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const TABLE_NAME = process.env.TABLE_NAME || "";
const CREW_TABLE_NAME = process.env.CREW_TABLE_NAME || "";

async function handler(event: APIGatewayProxyEvent, context: Context) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the parameter body",
    };
  }
  const item =
    typeof event.body == "object"
      ? event.body
      : (JSON.parse(event.body) as Movie);
  const db = DynamoDBDocument.from(new DynamoDB());
  console.log(event);
  try {
    let key = item.id;

    item.id = key;
    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await db.put(params);

    await putInCastAndCrewTable(item);

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify("success"),
    };

    return response;
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err };
  }
}

async function putInCastAndCrewTable(movie: Movie) {
  const db = DynamoDBDocument.from(new DynamoDB());
  for (const actor of movie.actors) {
    await db.put({
      TableName: CREW_TABLE_NAME,
      Item: { user_id: actor + "A", movie_id: movie.id },
    });
    for (const director of movie.directors) {
      await db.put({
        TableName: CREW_TABLE_NAME,
        Item: { user_id: director + "D", movie_id: movie.id },
      });
    }
  }
}
export { handler };
