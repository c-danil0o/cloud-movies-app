import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDBDocument, DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { MovieDto } from "../../dto/movie-dto";
import { FeedInfo } from "../../../types";
import { type } from "node:os";


const MOVIES_TABLE_NAME = process.env.TABLE_NAME || '';
const FEED_TABLE_NAME = process.env.FEED_TABLE_NAME || '';


async function handler(event: APIGatewayProxyEvent, context: Context) {
  const db = DynamoDBDocument.from(new DynamoDB());
  try {
    const user_id = event.pathParameters?.user_id;
    const feed_item = await db.get({
      TableName: FEED_TABLE_NAME,
      Key: {
        user_id: user_id
      }
    });
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    // const command = new ScanCommand({
    //     ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail",
    //     ExpressionAttributeNames: {
    //         "#id": "id",
    //         "#name": "name",
    //         "#description": "description",
    //         "#year": "year",
    //         "#director": "director",
    //         "#genre": "genre",
    //         "#duration": "duration",
    //         "#rating": "rating",
    //         "#fileSize": "fileSize",
    //         "#actors": "actors",
    //         "#episode_number": "episode_number",
    //         "#thumbnail": "thumbnail"
    //     },
    //     TableName: MOVIES_TABLE_NAME,
    // });
    const command = new QueryCommand({
      TableName: MOVIES_TABLE_NAME,
      IndexName: 'UploadStatusIndex',
      KeyConditionExpression: "#upload_status = :upload_status",
      ExpressionAttributeNames: {
        "#upload_status": "upload_status",
        "#id": "id",
        "#name": "name",
        "#description": "description",
        "#year": "year",
        "#directors": "directors",
        "#genre": "genre",
        "#duration": "duration",
        "#rating": "rating",
        "#fileSize": "fileSize",
        "#actors": "actors",
        "#episode_number": "episode_number",
        "#thumbnail": "thumbnail"
      },
      ExpressionAttributeValues: {
        ":upload_status": "available"
      },
      ProjectionExpression: "#id, #name, #description, #year, #directors, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail"
    });
    const response = await docClient.send(command);
    if (response) {
      console.log(response.Items);
      let movie_list = [];
      if (feed_item.Item) {
        const user_feed = feed_item.Item as FeedInfo;

        type PointsAndMovie = { points: number, movie: MovieDto };
        let movieRankingList: PointsAndMovie[] = [];

        // @ts-ignore
        for (const movie of response.Items) {
          const movieDto: MovieDto = { id: movie.id, name: movie.name, description: movie.description, year: movie.year, episode_number: movie.episode_number, genre: movie.genre, director: movie.directors, duration: movie.duration, rating: movie.rating, fileSize: movie.fileSize, actors: movie.actors, thumbnail: movie.thumbnail, upload_status: movie.upload_status };
          movieRankingList.push({ points: calculatePoints(user_feed, movieDto), movie: movieDto });
        }
        movieRankingList.sort((a, b) => b.points - a.points);
        movie_list = movieRankingList.map(pair => pair.movie);
      } else {
        // @ts-ignore
        for (const movie of response.Items) {
          movie_list.push({ id: movie.id, name: movie.name, description: movie.description, year: movie.year, episode_number: movie.episode_number, genre: movie.genre, director: movie.directors, duration: movie.duration, rating: movie.rating, fileSize: movie.fileSize, actors: movie.actors, thumbnail: movie.thumbnail });
        }
      }

      const final_response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify({
          Movies: movie_list
        }),
      };
      return final_response;
    } else {
      const final_response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify({
          Movies: []
        }),
      };
      return final_response;
    }

  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err }
  }
}

function calculatePoints(user_feed: FeedInfo, movie: MovieDto) {
  let points = 0;
  for (let i = 0; i < user_feed.genres.length; i++) {
    if (user_feed.genres[i].genre == movie.genre) {
      points += user_feed.genres[i].points;
      break; // Exit the loop once the target genre is found and updated
    }
  }
  // console.log(movie.actors);
  // console.log(typeof movie.actors);
  //
  // const actors: string[] = movie.actors.split(",");
  for (const actor of movie.actors) {
    for (let i = 0; i < user_feed.actors.length; i++) {
      if (user_feed.actors[i].actor == actor) {
        points += user_feed.actors[i].points;
        break;
      }
    }
  }
  for (const director of movie.director) {
    for (let i = 0; i < user_feed.directors.length; i++) {
      if (user_feed.directors[i].director == director) {
        points += user_feed.directors[i].points;
        break;
      }
    }
  }
  return points;
}



export { handler }
