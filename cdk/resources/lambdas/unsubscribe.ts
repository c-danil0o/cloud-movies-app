import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {SubscriptionDto} from "../dto/subscription-dto";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {Subscription} from "../../types";

const SUBS_TABLE_NAME = process.env.SUBS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as SubscriptionDto;
    const db = DynamoDBDocument.from(new DynamoDB());
    try {
        const user_id = item.user_id;
        const existingItem = await db.get({
            TableName: SUBS_TABLE_NAME,
            Key: {
                user_id: user_id
            }
        });
        if(existingItem.Item){
            const existingSub = existingItem.Item as Subscription;
            const type = item.type;
            if(type.toLowerCase() == 'genre'){
                existingSub.genres = existingSub.genres.filter(value => value != item.value);
            }
            else if(type.toLowerCase() == 'actor'){
                existingSub.actors = existingSub.actors.filter(value => value != item.value);
            }
            else if(type.toLowerCase() == 'director'){
                existingSub.directors = existingSub.directors.filter(value => value != item.value);
            }
            else{
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Invalid type of subscription!' })
                };
            }
            await db.put({
                TableName: SUBS_TABLE_NAME,
                Item: existingSub
            });
            const response: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify({
                    Subscriptions: existingSub
                })
            };
            return response;

        }else{
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Bad request!' })
            };
        }


    }catch (err){
        console.error(err);
        return { statusCode: 500, body: err }
    }
}

export {handler}