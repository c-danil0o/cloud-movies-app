import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {DynamoDBDocument, DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDB, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Subscription} from "../../types";

const SUBS_TABLE_NAME = process.env.SUBS_TABLE_NAME;

async function handler(event: APIGatewayProxyEvent, context: Context){
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
        const user_id = event.pathParameters?.id;
        const existingItem = await db.get({
            TableName: SUBS_TABLE_NAME,
            Key: {
                user_id: user_id
            }
        });
        if (existingItem.Item){
            const existingSub = existingItem.Item as Subscription;
            const response: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify({
                    Subscriptions: existingSub
                })
            };
            return response;
        }else{
            return {
                statusCode:400,
                body: JSON.stringify({message: "No subscriptions"})
            };
        }


    }catch (err){
        console.log(err);
        return {statusCode: 500, body: err};
    }
}

export {handler}







