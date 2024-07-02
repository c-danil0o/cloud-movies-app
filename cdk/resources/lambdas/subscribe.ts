import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Rating, Subscription} from "../../types";
import {SubscriptionDto} from "../dto/subscription-dto";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {updateFeedInfo} from "./updateFeedInfo";


const SUBS_TABLE_NAME = process.env.SUBS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as SubscriptionDto;
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
        const user_id = item.user_id;
        const existingItem = await db.get({
            TableName: SUBS_TABLE_NAME,
            Key: {
                user_id: user_id
            }
        });
        if(existingItem.Item){
            const existingSub = existingItem.Item as Subscription;
            if (updateSubscription(existingSub, item.type.toLowerCase(), item.value)){
                await db.put({
                    TableName: SUBS_TABLE_NAME,
                    Item: existingSub
                });

                await updateFeedInfo(user_id, item.type.toLowerCase(), item.value)      //type = npr. Actor, value npr. Dicaprio

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
                    body: JSON.stringify({ message: 'Already subscribed!' })
                };
            }
        }
        else{
            const newItem: Subscription = {
                user_id : user_id,
                email: item.email,
                genres: [],
                actors: [],
                directors: [],
            };
            updateSubscription(newItem, item.type.toLowerCase(), item.value);
            await db.put({
                TableName: SUBS_TABLE_NAME,
                Item: newItem,
            });

            await updateFeedInfo(user_id, item.type.toLowerCase()+'Sub', item.value)      //type = npr. Actor, value npr. Dicaprio

            const response: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify({
                    Subscriptions: newItem
                })
            };
            return response;
        }

    }catch(err){
        console.error(err);
        return { statusCode: 500, body: err }
    }



}

function updateSubscription(subscription: Subscription, type: string, value: string){
    if (type == 'genre'){
        if(!subscription.genres.includes(value)){
            subscription.genres.push(value)
            return true;
        }
        return false;
    }
    if (type == 'actor'){
        if(!subscription.actors.includes(value)){
            subscription.actors.push(value)
            return true;
        }
        return false;
    }
    if (type == 'director'){
        if(!subscription.directors.includes(value)){
            subscription.directors.push(value)
            return true;
        }
        return false;
    }
    return true;

}

export {handler}