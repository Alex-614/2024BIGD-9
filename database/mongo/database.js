// create db
db = db.getSiblingDB('BigDNews'); // alternative to: use BigDNews

// create admin user
db.createUser(
    {
        user: "bigdadmin",
        pwd: "admin",
        roles: [{ role: "root", db: "admin" },
        { role: "dbAdmin", db: "BigDNews" }]
    }
);
console.log("Created user: bigdadmin");

// create user for analysis
db.createUser(
    {
        user: "bigdanalysis",
        pwd: "analysis",
        roles: [{ role: "read", db: "BigDNews" }]
    }
);
console.log("Created user: bigdanalysis");




// convert <name>, <description>, <bsonType> to mongodb validation scheme
function generateValidationScheme(name, description, bsonType) {
    
    name = (name != null ? name : "null");
    bsonType = (bsonType != null ? bsonType : "string");
    description = (description != null ? description : name);

    let scheme = 
    {
        bsonType: "array",
        description: "Array of " + name + " + timestamp",
        items: {
            bsonType: "object",
            properties: {
                [name]: {
                    bsonType: bsonType,
                    description: description
                },
                timestamp: {
                    bsonType: "date",
                    description: "Timestamp of " + name
                }
            }
        }
    }
    return scheme;
}

// generating the validator jsonScheme
let fields = require("/tmp/Fields.json");
let jsonSchema = {
    bsonType: "object",
    required: [],
    properties: null
};
let properties = {}
// adding all changing fields to the validation scheme
for (let field of fields["changingFields"]) {
    properties[field["name"]] = generateValidationScheme(field["name"], field["description"], field["bsonType"]);
    jsonSchema["required"].push(field["name"]);
}
// adding all const fields to the validation scheme
for (let field of fields["constFields"]) {
    properties[field["name"]] = {description: field["description"], bsonType: field["bsonType"]};
    jsonSchema["required"].push(field["name"]);
}
jsonSchema["properties"] = properties;

// create the collection with the validation scheme
db.createCollection("news", {
    validator: {
        $jsonSchema: jsonSchema
    }
});
console.log("Created collection: news");


db.news.createIndex({ [fields["identifier"]]: 1 }, { unique: true });
