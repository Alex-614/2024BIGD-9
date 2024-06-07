use BigDNews;

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

function insertOrUpdateNews(document) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("BigDNews");
        const query = { id: document.id };
        
        dbo.collection("news").findOne(query, function(err, result) {
            if (err) throw err;
            if (result) {
                let appendFields = {};

                // Append new data to array fields if they are differend.
                if (result.title[result.title.length - 1].title !== document.title) {
                    appendFields['title'] = { title: document.title, timestamp: new Date() };
                }
                if (result.commentsEnabled[result.commentsEnabled.length - 1].comments !== document.commentsEnabled) {
                    appendFields['commentsEnabled'] = { comments: document.commentsEnabled, timestamp: new Date() };
                }
                if (result.commentCount[result.commentCount.length - 1].count !== document.commentCount) {
                    appendFields['commentCount'] = { count: document.commentCount, timestamp: new Date() };
                }
                if (result.tags[result.tags.length - 1].tags.join(',') !== document.tags.join(',')) {
                    appendFields['tags'] = { tags: document.tags, timestamp: new Date() };
                }
                if (result.videoLength[result.videoLength.length - 1].length !== document.videoLength) {
                    appendFields['videoLength'] = { length: document.videoLength, timestamp: new Date() };
                }
                if (result.views[result.views.length - 1].views !== document.views) {
                    appendFields['views'] = { views: document.views, timestamp: new Date() };
                }
                if (result.subscribers[result.subscribers.length - 1].count !== document.subscribers) {
                    appendFields['subscribers'] = { count: document.subscribers, timestamp: new Date() };
                }
                if (result.transcript[result.transcript.length - 1].transcript !== document.transcript) {
                    appendFields['transcript'] = { transcript: document.transcript, timestamp: new Date() };
                }
                if (result.likeCount[result.likeCount.length - 1].likeCount !== document.likeCount) {
                    appendFields['likeCount'] = { likeCount: document.likeCount, timestamp: new Date() };
                }
                if (result.categories[result.categories.length - 1].categories.join(',') !== document.categories.join(',')) {
                    appendFields['categories'] = { categories: document.categories, timestamp: new Date() };
                }
                
                // Put insert together.
                if (Object.keys(appendFields).length > 0) {
                    let updateQuery = {};
                    for (let field in appendFields) {
                        updateQuery.$push = updateQuery.$push || {};
                        updateQuery.$push[field] = { $each: appendFields[field] };
                    }

                    dbo.collection("news").updateOne(query, updateQuery, function(err, res) {
                        if (err) throw err;
                        console.log("Document updated");
                        db.close();
                    });
                } else {
                    console.log("No changes detected");
                    db.close();
                }
            } else { //New Video
                document.timestamp = new Date(); 
                dbo.collection("news").insertOne(document, function(err, res) {
                    if (err) throw err;
                    console.log("Document inserted");
                    db.close();
                });
            }
        });
    });
}

