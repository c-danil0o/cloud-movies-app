import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Rating } from "../../../types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";


const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context) {
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as Rating;
    const db = DynamoDBDocument.from(new DynamoDB());
    try {
        const checkParams = {
            TableName: RATINGS_TABLE_NAME,
            IndexName: 'UsersIndex', // Assuming the GSI for user is named 'UserIndex'
            KeyConditionExpression: '#usr = :user AND movie_id = :movie_id',
            ExpressionAttributeNames: {
                '#usr': 'user'
            },
            ExpressionAttributeValues: {
                ':user': item.user,
                ':movie_id': item.movie_id
            }
        };
        console.log(checkParams);
        const { Items } = await db.query(checkParams);
        console.log(Items)
        if (Items && Items.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User has already rated this movie' })
            };
        }


        item.id = randomUUID();
        const params = {
            TableName: RATINGS_TABLE_NAME,
            Item: item,
        };
        await db.put(params);

        const response: APIGatewayProxyResult = {
            statusCode: 200,
            body: JSON.stringify({ item })
        }
        return response;

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: err }
    }

}



export { handler }
