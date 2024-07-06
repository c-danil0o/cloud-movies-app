import { Movie } from "../../../types";
import { SNS } from "aws-sdk";


async function handler(event: any, context: any) {
    try {
        const movie = event['Payload']['Attributes'] as Movie;
        console.log("got movie");

        const message: string = `New ${movie.genre} movie named ${movie.name} directed by ${movie.directors} with ${movie.actors} is now available on MOVIFLIX. \n Visit our site and watch it now!`

        await publishToTopic(movie.genre, "genre", message);
        console.log(movie.actors);              //
        for (const actor of movie.actors) {
            await publishToTopic(actor, "actor", message);
        }
        for (const director of movie.directors) {
            await publishToTopic(director, "director", message);
        }
        return { statusCode: 200, body: message };

    } catch (err) {
        console.log(err);
        return { statusCode: 502, body: err }
    }
}

async function publishToTopic(subscribeItemName: string, type: string, message: string) {
    // Check if the topic exists
    const sns = new SNS();
    let topicArn;
    const nameForTopic = subscribeItemName.replace(/\s+/g, '');
    let addition: string = "Topic";
    if (type == 'actor') {
        addition = "ATopic";
    }
    if (type == 'director') {
        addition = "DTopic";
    }
    const topicName = `${nameForTopic}${addition}`;
    console.log(topicName);
    try {
        const topics = await sns.listTopics().promise();
        const topic = topics.Topics?.find(t => t.TopicArn?.endsWith(`:${topicName}`));
        console.log(topic);
        topicArn = topic ? topic.TopicArn : null;
    } catch (error) {
        console.error('Error listing topics:', error);
        return
    }
    console.log(topicArn);
    if (!topicArn) {
        console.log("topicArn is null")
        return;
    }

    const subject = generateSubject(type, subscribeItemName);
    console.log(subject);

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

function generateSubject(type: string, subscribeName: string) {
    if (type == "genre") {
        return `NEW ${subscribeName.toUpperCase()} MOVIE IS AVAILABLE ON MOVIFLIX`;
    }
    if (type == "actor") {
        return `NEW MOVIE WITH ${subscribeName.toUpperCase()} IS AVAILABLE ON MOVIFLIX`;
    }
    if (type == "director") {
        return `NEW ${subscribeName.toUpperCase()} MOVIE IS AVAILABLE ON MOVIFLIX`;
    } else {
        return ""
    }
}


export { handler }
