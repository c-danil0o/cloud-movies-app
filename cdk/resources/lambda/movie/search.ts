import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DynamoDBDocument, DynamoDBDocumentClient, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {MovieDto} from "../../dto/movie-dto";

const MOVIES_TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    const params = event.queryStringParameters;
    if(params){
        const searchType = params['field'];
        const searchValue = params['value'];
        const db = DynamoDBDocument.from(new DynamoDB());
        try{
            const client = new DynamoDBClient({});
            const docClient = DynamoDBDocumentClient.from(client);
            let response;
            if (searchType?.toLowerCase() == 'title') {
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
                        ":name": searchValue
                    },
                    ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail"
                });
                response = await docClient.send(command);
            }
            else if (searchType?.toLowerCase() == 'genre'){
                const command = new QueryCommand({
                    TableName: MOVIES_TABLE_NAME,
                    IndexName: 'GenreIndex',
                    KeyConditionExpression: "#genre = :genre",
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
                        ":genre": searchValue
                    },
                    ProjectionExpression: "#id, #name, #description, #year, #director, #genre, #duration, #rating, #fileSize, #actors, #episode_number, #thumbnail"
                });
                response = await docClient.send(command);
            }


            const movies: MovieDto[] = []
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
                    actors: movie.actors,
                    thumbnail: movie.thumbnail,
                    upload_status: movie.upload_status,
                });
            }
            console.log(movies);

            const final_response: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify({
                    Movies: movies
                }),
            };
            return final_response;


        }catch(error){
            console.log(error);
            return { statusCode: 500, body: error }
        }
    }else{
        return { statusCode: 500, body: JSON.stringify({ message: "Bad Request" }) }
    }
}


export {handler}