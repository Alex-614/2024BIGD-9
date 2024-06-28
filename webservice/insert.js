
var mongo = require('mongodb');
var url = process.env.DATABASE_URL;
var client = new mongo.MongoClient(url);

var fields = require("/tmp/Fields.json");

module.exports = {
    insertOrUpdateNews, validate
};

async function validate(document, checkConstFields) {
    let result = true;
    if (checkConstFields) {
        for (let field of fields["constFields"]) {
            if (document[field["name"]] == null) result = false;
        }
    }
    for (let field of fields["changingFields"]) {
        if (document[field["name"]] == null) result = false;
    }
    if (document[fields["identifier"]] == null) result = false;
    return result;
}

var invalidArgumentsErrorMessage = "Error: invalid or missing arguments!";
async function insertOrUpdateNews(document) {

    try {
        const db = await client.db('BigDNews');
        const coll = await db.collection('news');

        var query = { url: document.url };
        
        const result = await coll.findOne(query);

        let valid = (result ? await validate(document, false) : await validate(document, true));
        if (!valid) {
            throw new Error(invalidArgumentsErrorMessage);
        }

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
                });
            } else {
                console.log("No changes detected");
            }
        } else { // New Video

            coll.insertOne(appendFields, (err, res) => {
                if (err) throw err;
                console.log("Document inserted");
            });
            
        }

    } catch (err) {
        console.log(err);
        if (err.message == invalidArgumentsErrorMessage) {
            throw err;
        }
        throw new Error("Error: an unknown error occured!");
    }
}

function makePretty(result, document, changesOnly) {

    let appendFields = {};
    if (result == null) {
        appendFields.url = document.url;
        appendFields.channelId = document.channelId;
        appendFields.createdAt = new Date(document.createdAt);
        appendFields.timestamp = new Date(document.timestamp);
    }
    
    let time = new Date(document.timestamp);
    for (let field of fields["changingFields"]) {
        let fieldName = field["name"];
        let resultField = (result != null ? ((result[fieldName])[result[fieldName].length - 1])[fieldName] : null);
        if (result == null
                || (!Array.isArray(resultField) ? resultField : resultField.join(", ")) !== (!Array.isArray(document[fieldName]) ? document[fieldName] : document[fieldName].join(", ")) /* if array then join(", ") */
                || !changesOnly) {
            appendFields[fieldName] = [{ [fieldName]: document[fieldName], timestamp: time }];
        }
    }

    return appendFields;
    
}
