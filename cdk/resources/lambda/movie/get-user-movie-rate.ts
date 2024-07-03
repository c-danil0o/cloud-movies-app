import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";

const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    const params = event.queryStringParameters;
    if(params){
        const user_id = params['user_id'];
        const movie_id = params['movie_id'];
        const db = DynamoDBDocument.from(new DynamoDB());

        try{
            const findRate = {
                TableName: RATINGS_TABLE_NAME,
                IndexName: 'UsersIndex', // Assuming the GSI for user is named 'UserIndex'
                KeyConditionExpression: '#usr = :user AND movie_id = :movie_id',
                ExpressionAttributeNames: {
                    '#usr': 'user'
                },
                ExpressionAttributeValues: {
                    ':user': user_id,
                    ':movie_id': movie_id
                }
            };
            const { Items } = await db.query(findRate);
            console.log(Items)
            if (Items && Items.length > 0){
                const response: APIGatewayProxyResult = {
                    statusCode: 200,
                    body: JSON.stringify({
                        Rate: Items[0].grade,
                    })
                }
                return response;
            }
            const response: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify({
                    Rate: null,
                })
            }
            return response;

        }catch (err){
            console.log(err);
            return { statusCode: 500, body: err }
        }


    }else{
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Bad Request" })
        };
    }
}


export {handler}