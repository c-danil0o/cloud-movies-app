import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DynamoDBDocument, DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {MovieDto} from "../dto/movie-dto";


const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayProxyEvent ,context: Context){
    try {
        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        const command = new ScanCommand({
            ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number",
            ExpressionAttributeNames: {
                "#id" :"id",
                "#name": "name",
                "#description": "description",
                "#year": "year",
                "#director": "director",
                "#genre": "genre",
                "#duration": "duration",
                "#rating": "rating",
                "#fileSize": "fileSize",
                "#actors": "actors",
                "#episode_number" : "episode_number",
            },
            TableName: TABLE_NAME,
        });

        const response = await docClient.send(command);
        const movies : MovieDto[] = []
        // @ts-ignore
        for (const movie of response.Items) {
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
                actors: movie.actors
            });
        }
        console.log(movies);

        const final_response: APIGatewayProxyResult = {
            statusCode: 200,
            body: JSON.stringify({
                Movies : movies
            }),
        };
        return final_response;
    } catch (err){
        console.error(err);
        return {statusCode: 500, body:err}
    }
}

export {handler}