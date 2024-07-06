import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {SubscriptionDto} from "../../dto/subscription-dto";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {Subscription} from "../../../types";
import {updateFeedInfo} from "./update-feed-info";
import {SNS} from "aws-sdk";
import { SNSClient, ListSubscriptionsByTopicCommand } from "@aws-sdk/client-sns";

const SUBS_TABLE_NAME = process.env.SUBS_TABLE_NAME || '';
const client = new SNSClient({ region: 'eu-central-1' });

async function handler(event: APIGatewayEvent, context: Context){
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body) as SubscriptionDto;
    const db = DynamoDBDocument.from(new DynamoDB());
    try {
        const sns = new SNS();
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

            if(item.email){
                for(const arnItem of existingSub.arns){
                    if (arnItem.name == item.value && arnItem.type == item.type){
                        const topicArn = arnItem.topic_arn;
                        console.log(topicArn);
                        console.log(item.email);
                        const subscriptionArn = await getSubscriptionArnByEmail(topicArn, item.email);
                        console.log(subscriptionArn);
                        if (subscriptionArn == "PendingConfirmation"){
                            break;
                        }
                        if (subscriptionArn){
                            await sns.unsubscribe({
                                SubscriptionArn: subscriptionArn,
                            }).promise();
                            existingSub.arns = existingSub.arns.filter(sub => sub.topic_arn !== arnItem.topic_arn);
                        }
                    }
                }
            }

            await db.put({
                TableName: SUBS_TABLE_NAME,
                Item: existingSub
            });

            await updateFeedInfo(user_id, item.type.toLowerCase()+'Unsub', item.value)

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

async function getSubscriptionArnByEmail(topicArn: string, email: string): Promise<string | null> {
    let nextToken: string | undefined;
    do {
        const input = {
            TopicArn: topicArn,
            NextToken: nextToken,
        };

        const command = new ListSubscriptionsByTopicCommand(input);
        const response = await client.send(command);

        const subscription = response.Subscriptions?.find(sub => sub.Endpoint === email);
        if (subscription) {
            return subscription.SubscriptionArn ?? null;
        }

        nextToken = response.NextToken;
    } while (nextToken);

    return null;
}

export {handler}