import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DynamoDBDocument, DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {MovieDto} from "../dto/movie-dto";


const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: APIGatewayProxyEvent, context: Context) {
    const db = DynamoDBDocument.from(new DynamoDB());

    try{
        const id = event.pathParameters?.id;

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);


        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                id: id,
            },
        })

        const response = await docClient.send(command);
        console.log(response);

        return response;
    }catch(err){
        console.log(err);
        return{statusCode: 500, body: err}
    }
}

export {handler};