import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDBDocument, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { MovieDto } from "../../dto/movie-dto";

const MOVIES_TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the parameter body",
    };
  }
  let params = JSON.parse(event.body);
  let search_value =
    params.title +
    '%' +
    params.description +
    '%' +
    params.actors.join(',') +
    '%' +
    params.directors.join(',') +
    '%' +
    params.genre;
  try {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    let response;
    const command = new QueryCommand({
      TableName: MOVIES_TABLE_NAME,
      IndexName: 'SearchIndex',
      KeyConditionExpression: "#seach_field = :search_field",
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
        "#thumbnail": "thumbnail",
        "#search_field": "search_field"
      },
      ExpressionAttributeValues: {
        ":search_field": search_value
      },
      ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail,#upload_status, #search_field"
    });
    response = await docClient.send(command);


    const movies: MovieDto[] = []
    // @ts-ignore
    if (response.Items) {
      for (const movie of response.Items) {
        if (movie.upload_status == "available")
          movies.push({
            id: movie.id,
            name: movie.name,
            description: movie.description,
            year: movie.year,
            episode_number: movie.episode_number,
            genre: movie.genre,
            director: movie.director,
            duration: movie.duration,
            rating: movie.rating,
            fileSize: movie.fileSize,
            actors: movie.actors,
            thumbnail: movie.thumbnail,
            upload_status: movie.upload_status,
          });
      }
    }
    console.log(movies);

    const final_response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        Movies: movies
      }),
    };
    return final_response;


  } catch (error) {
    console.log(error);
    return { statusCode: 500, body: error }
  }
}


export { handler }
