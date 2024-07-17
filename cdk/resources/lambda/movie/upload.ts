import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Movie } from "../../../types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { DynamoDBDocument, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
const TABLE_NAME = process.env.TABLE_NAME || "";
const CREW_TABLE_NAME = process.env.CREW_TABLE_NAME || "";
const MOVIES_TABLE_NAME = process.env.TABLE_NAME || "";
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
    let REGION = "eu-central-1";
    let bucket = BUCKET_NAME;
    let key = "";
    if (!item.id) {
      key = randomUUID();
    } else {
      key = item.id;
    }
    let bucketKey = `${key}/initial.mp4`;
    if (item.episode_number != -1) {
      const command = new QueryCommand({
        TableName: MOVIES_TABLE_NAME,
        IndexName: 'TitleIndex',
        KeyConditionExpression: "#name = :name",
        ExpressionAttributeNames: {
          "#upload_status": "upload_status",
          "#id": "id",
          "#name": "name",
          "#description": "description",
          "#year": "year",
          "#director": "director",
          "#genre": "genre",
          "#duration": "duration",
          "#rating": "rating",
          "#fileSize": "fileSize",
          "#actors": "actors",
          "#episode_number": "episode_number",
          "#thumbnail": "thumbnail"
        },
        ExpressionAttributeValues: {
          ":name": item.name
        },
        ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail,#upload_status"
      });
      let response = await db.send(command);
      if (response.Items) {
        for (const series of response.Items) {
          if (series.episode_number == item.episode_number || series.genre != item.genre) {
            return {
              statusCode: 400, body: JSON.stringify({
                error: "Error adding episode! Episode number already exists or genre is not matching!"
              })
            };

          }
        }

      }

    }

    const client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({ Bucket: bucket, Key: bucketKey });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 500,
    });
    console.log("PresignedUrl: ", presignedUrl);
    console.log(item)

    item.id = key;
    // upload image first
    if (item.new_thumbnail) {
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
