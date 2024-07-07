import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Movie } from "../../../types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
const TABLE_NAME = process.env.TABLE_NAME || "";
const CREW_TABLE_NAME = process.env.CREW_TABLE_NAME || "";
const IMAGES_BUCKET = process.env.IMAGES_BUCKET || "";

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

    if (item.new_thumbnail) {

      let REGION = "eu-central-1";
      const client = new S3Client({ region: REGION });
      var image = Buffer.from(item.new_thumbnail.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      const putImageCommand = new PutObjectCommand({
        "Body": image,
        "Bucket": IMAGES_BUCKET,
        "Key": `${item.id}.jpeg`
      })
      await client.send(putImageCommand);
      console.log("uploaded thumbnail")
      const encodeFileName = encodeURIComponent(`${item.id}.jpeg`);


      item.new_thumbnail = undefined;
      item.thumbnail = `https://${IMAGES_BUCKET}.s3.amazonaws.com/${encodeFileName}`;
    }

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
