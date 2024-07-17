import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {FeedInfo, Subscription} from "../../../types"

const FEED_TABLE_NAME =  process.env.FEED_TABLE_NAME || '';

async function updateFeedInfo(user_id: string, type: string, value: string) {
    const db = DynamoDBDocument.from(new DynamoDB());
    try{
        const existingItem = await db.get({
            TableName: FEED_TABLE_NAME,
            Key: {
                user_id: user_id
            }
        });
        console.log("RADIMMMMMMMMM");
        console.log("RADIMMMMMMMMM");
        console.log(FEED_TABLE_NAME);
        console.log(type);

        if(existingItem.Item){
            const existingFeed = existingItem.Item as FeedInfo;
            if (type == '3') addPointsToGenre(existingFeed, value, 1);
            else if (type == '4') addPointsToGenre(existingFeed, value, 2);
            else if (type == '5') addPointsToGenre(existingFeed, value, 3);
            else if (type == 'genreSub') addPointsToGenre(existingFeed, value, 10);
            else if (type == 'actorSub') addPointsToActor(existingFeed, value, 10);
            else if (type == 'directorSub') addPointsToDirector(existingFeed, value, 10);
            else if (type == 'genreUnsub') addPointsToGenre(existingFeed, value, -10);
            else if (type == 'actorUnsub') addPointsToActor(existingFeed, value, -10);
            else if (type == 'directorUnsub') addPointsToDirector(existingFeed, value, -10);
            else if (type == 'download') addPointsToGenre(existingFeed, value, 1);

            await db.put({
                TableName: FEED_TABLE_NAME,
                Item: existingFeed
            });
            return;

        }else{
            const newFeedInfo: FeedInfo = {
                user_id: user_id,
                //email mozda
                genres: [],
                actors: [],
                directors: []
            };
            if (type == '3') newFeedInfo.genres.push({genre: value, points: 1});
            else if (type == '4') newFeedInfo.genres.push({genre: value, points: 2});
            else if (type == '5') newFeedInfo.genres.push({genre: value, points: 3});
            else if (type == 'genreSub') newFeedInfo.genres.push({genre: value, points: 10});
            else if (type == 'actorSub') newFeedInfo.actors.push({actor: value, points: 10});
            else if (type == 'directorSub') newFeedInfo.directors.push({director: value, points: 10});
            else if (type == 'genreUnsub') newFeedInfo.genres.push({genre: value, points: -10});
            else if (type == 'actorUnsub') newFeedInfo.actors.push({actor: value, points: -10});
            else if (type == 'directorUnsub') newFeedInfo.directors.push({director: value, points: -10});
            else if (type == 'download') newFeedInfo.genres.push({genre: value, points: 1});
            else{
                console.log("nista uradio nije")
            }

            await db.put({
                TableName: FEED_TABLE_NAME,
                Item: newFeedInfo,
            });
            return;
        }
    }catch (err){
        console.log(err);
        return
    }


}

function addPointsToGenre(feedInfo: FeedInfo ,name: string, pointsToAdd: number){
    const genre = feedInfo.genres.find(g => g.genre == name);
    if (genre) {
        genre.points += pointsToAdd;
    }else{
        feedInfo.genres.push({genre: name, points: pointsToAdd});
    }
}

function addPointsToActor(feedInfo: FeedInfo ,name: string, pointsToAdd: number){
    const actor = feedInfo.actors.find(a => a.actor == name);
    if (actor) {
        actor.points += pointsToAdd;
    }else{
        feedInfo.actors.push({actor: name, points: pointsToAdd});
    }
}

function addPointsToDirector(feedInfo: FeedInfo ,name: string, pointsToAdd: number){
    const director = feedInfo.directors.find(d => d.director == name);
    if (director) {
        director.points += pointsToAdd;
    }else{
        feedInfo.directors.push({director: name, points: pointsToAdd});
    }
}

export { updateFeedInfo }