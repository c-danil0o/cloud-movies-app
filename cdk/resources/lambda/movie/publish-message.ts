import {Context, S3Event} from "aws-lambda";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {Movie} from "../../../types";
import {SNS} from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME || '';

async function handler(event: S3Event, context: Context) {
    try{
        const db = DynamoDBDocument.from(new DynamoDB());
        const time = event.Records[0].eventTime;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        const movieItem = await db.get({
            TableName: TABLE_NAME,
            Key: {
                id: key
            }
        });

        if(movieItem.Item){
            const movie = movieItem.Item as Movie;
            const message: string = `New ${movie.genre} movie directed by ${movie.director} with ${movie.actors} is now available on MOVIFLIX. \n Visit our site and watch it now!`

            await publishToTopic(movie.genre, "genre", message);
            await publishToTopic(movie.director, "director", message);
            console.log(movie.actors);              //videti kako ih cita

        }


    }catch(err){
        console.log(err);
    }
}

async function publishToTopic(subscribeItemName: string, type: string, message: string){
    // Check if the topic exists
    const sns = new SNS();
    let topicArn;
    const nameForTopic=subscribeItemName.replace(/\s+/g, '');
    const topicName = `${nameForTopic}Topic`;
    try {
        const topics = await sns.listTopics().promise();
        const topic = topics.Topics?.find(t => t.TopicArn?.endsWith(`:${topicName}`));
        topicArn = topic ? topic.TopicArn : null;
    } catch (error) {
        console.error('Error listing topics:', error);
        return
    }
    if (!topicArn) {
        return;
    }

    const subject = generateSubject(type, subscribeItemName)

    try {
        await sns.publish({
            TopicArn: topicArn,
            Subject: subject,
            Message: message,
        }).promise();
    } catch (error) {
        console.error('Error publishing to topic:', error);
    }

}

function generateSubject(type: string, subscribeName: string){
    if (type == "genre"){
        return `NEW ${subscribeName.toUpperCase()} IS AVAILABLE ON MOVIFLIX`;
    }
    if (type == "actor"){
        return `NEW MOVIE WITH ${subscribeName.toUpperCase()} IS AVAILABLE ON MOVIFLIX`;
    }
    if(type == "director"){
        return `NEW ${subscribeName.toUpperCase()} MOVIE IS AVAILABLE ON MOVIFLIX`;
    }else{
        return ""
    }
}


export {handler}