use BigDNews;

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

function insertOrUpdateNews(document) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("BigDNews");
        const query = { url: document.url };
        
        dbo.collection("news").findOne(query, function(err, result) {
            if (err) throw err;
            if (result) {
                let appendFields = {};

                // Append new data to array fields if they are differend.
                if (JSON.stringify(result.title) !== JSON.stringify(document.title)) {
                    appendFields['title'] = { title: document.title, timestamp: new Date() };
                }
                if (JSON.stringify(result.commentsEnabled) !== JSON.stringify(document.commentsEnabled)) {
                    appendFields['commentsEnabled'] = { comments: document.commentsEnabled, timestamp: new Date() };
                }
                if (JSON.stringify(result.commentCount) !== JSON.stringify(document.commentCount)) {
                    appendFields['commentCount'] = { count: document.commentCount, timestamp: new Date() };
                }
                if (JSON.stringify(result.tags) !== JSON.stringify(document.tags)) {
                    appendFields['tags'] = { tags: document.tags, timestamp: new Date() };
                }
                if (JSON.stringify(result.videoLength) !== JSON.stringify(document.videoLength)) {
                    appendFields['videoLength'] = { length: document.videoLength, timestamp: new Date() };
                }
                if (JSON.stringify(result.views) !== JSON.stringify(document.views)) {
                    appendFields['views'] = { views: document.views, timestamp: new Date() };
                }
                if (JSON.stringify(result.subscribers) !== JSON.stringify(document.subscribers)) {
                    appendFields['subscribers'] = { count: document.subscribers, timestamp: new Date() };
                }
                if (JSON.stringify(result.transcript) !== JSON.stringify(document.transcript)) {
                    appendFields['transcript'] = { transcript: document.transcript, timestamp: new Date() };
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
                //document.timestamp = new Date();
                dbo.collection("news").insertOne(document, function(err, res) {
                    if (err) throw err;
                    console.log("Document inserted");
                    db.close();
                });
            }
        });
    });
}

module.exports = { insertOrUpdateNews };
