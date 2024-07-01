import {APIGatewayEvent, Context} from "aws-lambda";
import {Rating} from "../../types";
import {SubscriptionDto} from "../dto/subscription-dto";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";


const SUBS_TABLE_NAME = process.env.SUBS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as SubscriptionDto;
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
        const user_id = item.user_id;




    }catch(err){
        console.error(err);
        return { statusCode: 500, body: err }
    }



}


export {handler}