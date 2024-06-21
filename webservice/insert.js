
var mongo = require('mongodb');
var url = process.env.DATABASE_URL;
var client = new mongo.MongoClient(url);
//db = db.getSiblingDB('BigDNews');

module.exports = {
    insertOrUpdateNews
};

async function insertOrUpdateNews(document) {
    try {
        //const conn = await client.conn();
        const db = await client.db('BigDNews');
        const coll = await db.collection('news');
        //const result = await coll.find().toArray();
        //return result;

        var query = { url: document.url };
        
        const result = await coll.findOne(query);

        let appendFields = makePretty(result, document, false);
        console.log(appendFields);
        if (result) {

            // Put insert together.
            if (Object.keys(appendFields).length > 0) {
                let updateQuery = {};
                for (let field in appendFields) {
                    updateQuery.$push = updateQuery.$push || {};
                    updateQuery.$push[field] = { $each: appendFields[field] };
                }

                coll.updateOne(query, updateQuery, function(err, res) {
                    if (err) throw err;
                    console.log("Document updated");
                    //db.close();
                });
            } else {
                console.log("No changes detected");
                //db.close();
            }
        } else { // New Video

            coll.insertOne(appendFields, (err, res) => {
                if (err) throw err;
                console.log("Document inserted");
                //db.close();
            });
            
        }

    } catch (err) {
        console.log(err);
    }

}

function makePretty(result, document, chnagesOnly) {

    let appendFields = {};
    if (result == null) {
        appendFields.url = document.url;
        appendFields.channelId = document.channelId;
        appendFields.createdAt = new Date(document.createdAt);
        appendFields.timestamp = new Date(document.timestamp);
    }
    // Append new data to array fields if they are differend.
    let time = new Date(document.timestamp);

    // changing fields:
    if (result == null || result.title[result.title.length - 1].title !== document.title || !chnagesOnly) {
        appendFields['title'] = [{ title: document.title, timestamp: time }];
    }
    if (result == null || result.commentsEnabled[result.commentsEnabled.length - 1].comments !== document.commentsEnabled || !chnagesOnly) {
        appendFields['commentsEnabled'] = [{ comments: document.commentsEnabled, timestamp: time }];
    }
    if (result == null || result.commentCount[result.commentCount.length - 1].count !== document.commentCount || !chnagesOnly) {
        appendFields['commentCount'] = [{ count: document.commentCount, timestamp: time }];
    }
    if (result == null || result.tags[result.tags.length - 1].tags.join(',') !== document.tags.join(',') || !chnagesOnly) {
        appendFields['tags'] = [{ tags: document.tags, timestamp: time }];
    }
    if (result == null || result.videoLength[result.videoLength.length - 1].length !== document.videoLength || !chnagesOnly) {
        appendFields['videoLength'] = [{ length: document.videoLength, timestamp: time }];
    }
    if (result == null || result.views[result.views.length - 1].views !== document.views || !chnagesOnly) {
        appendFields['views'] = [{ views: document.views, timestamp: time }];
    }
    if (result == null || result.subscribers[result.subscribers.length - 1].count !== document.subscribers || !chnagesOnly) {
        appendFields['subscribers'] = [{ count: document.subscribers, timestamp: time }];
    }
    if (result == null || result.transcript[result.transcript.length - 1].transcript !== document.transcript || !chnagesOnly) {
        appendFields['transcript'] = [{ transcript: document.transcript, timestamp: time }];
    }
    if (result == null || result.likeCount[result.likeCount.length - 1].likeCount !== document.likeCount || !chnagesOnly) {
        appendFields['likeCount'] = [{ likeCount: document.likeCount, timestamp: time }];
    }
    if (result == null || result.categories[result.categories.length - 1].categories.join(',') !== document.categories.join(',') || !chnagesOnly) {
        appendFields['categories'] = [{ categories: document.categories, timestamp: time }];
    }


    return appendFields;
    
}
