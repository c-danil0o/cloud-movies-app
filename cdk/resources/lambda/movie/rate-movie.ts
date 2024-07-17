import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Rating} from "../../../types";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {randomUUID} from "crypto";
import {updateFeedInfo} from "./update-feed-info";


const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME || '';

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as Rating;
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
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
            let rating = Items[0] as Rating;
            const previous_grade = rating.grade;
            rating.grade = item.grade;
            const params = {
                TableName: RATINGS_TABLE_NAME,
                Item: rating,
            };
            await db.put(params);
            if(item.grade > previous_grade){
                if(item.grade == 3){
                    await updateFeedInfo(item.user, String(item.grade), item.genre);
                }
                else if(item.grade == 4){
                    if (previous_grade == 3){
                        await updateFeedInfo(item.user, String(previous_grade), item.genre);
                    }else{
                        await updateFeedInfo(item.user, String(item.grade), item.genre);
                    }
                }
                else if(item.grade == 5){
                    if (previous_grade == 4){
                        await updateFeedInfo(item.user, String(previous_grade), item.genre);
                    }else if (previous_grade == 3){
                        await updateFeedInfo(item.user, String(previous_grade+1), item.genre);
                    }else{
                        await updateFeedInfo(item.user, String(item.grade), item.genre);
                    }
                }
            }

        }else{
            item.id = randomUUID();
            const params = {
                TableName: RATINGS_TABLE_NAME,
                Item: item,
            };
            await db.put(params);
            if(item.grade>2){
                await updateFeedInfo(item.user, String(item.grade), item.genre);
            }
        }

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