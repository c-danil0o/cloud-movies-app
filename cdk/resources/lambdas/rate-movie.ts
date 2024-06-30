import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Rating} from "../../types";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {randomUUID} from "crypto";


const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as Rating;
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
        item.id = randomUUID();
        const params = {
            TableName: RATINGS_TABLE_NAME,
            Item: item,
        };
        await db.put(params);

        const response: APIGatewayProxyResult = {
            statusCode: 200,
            body: JSON.stringify({item})
        }
        return response;

    }catch(err){
        console.error(err);
        return { statusCode: 500, body: err }
    }

}



export {handler}