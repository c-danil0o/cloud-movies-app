import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Movie } from "../../../types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
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
    let REGION = "eu-central-1";
    let bucket = BUCKET_NAME;
    let key = "";
    if (!item.id) {
      key = randomUUID();
    } else {
      key = item.id;
    }
    let bucketKey = `${key}/initial.mp4`;

    const client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({ Bucket: bucket, Key: bucketKey });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 500,
    });
    console.log("PresignedUrl: ", presignedUrl);

    item.id = key;
    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await db.put(params);

    // add to crew table
    await putInCastAndCrewTable(item);

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        Url: presignedUrl,
        Key: key,
      }),
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
      Item: { id: actor + "A", movie_id: movie.id },
    });
    for (const director of movie.directors) {
      await db.put({
        TableName: CREW_TABLE_NAME,
        Item: { id: director + "D", movie_id: movie.id },
      });
    }
  }
}

export { handler };
