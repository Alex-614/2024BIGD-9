db = db.getSiblingDB('BigDNews'); // alternative to: use BigDNews

db.createUser(
  {
    user: "bigdadmin",
    pwd: "admin",
    roles: [ { role: "root", db: "admin" },
              { role: "readWrite", db: "BigDNews" } ]
  }
);

db.createCollection("news", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["url", "title", "channelId", "createdAt", "commentsEnabled", "commentCount", "categories", "tags", "videoLength", "views", "likeCount", "subscribers", "timestamp", "transcript"],
      properties: {
        url: {
          bsonType: "string",
          description: "Url of the video"
        },
        title: {
          bsonType: "array",
          description: "Array of titles + timestamp",
          items: {
            bsonType: "object",
            properties: {
              title: {
                bsonType: "string",
                description: "The title"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the title"
              }
            }
          }
        },
        channelId: {
          bsonType: "string",
          description: "From which Newsoutlet the news was pulled"
        },
        createdAt: {
          bsonType: "date",
          description: "Date and time of the video release"
        },
        commentsEnabled: {
          bsonType: "array",
          description: "Array of bools + timestamp",
          items: {
            bsonType: "object",
            properties: {
              comments: {
                bsonType: "bool",
                description: "True= comments enabled, False= comments disabled"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the comment"
              }
            }
          }
        },
        commentCount: {
          bsonType: "array",
          description: "Array of commentcount + timestamp",
          items: {
            bsonType: "object",
            properties: {
              count: {
                bsonType: "int",
                description: "Number of comments"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the comment"
              }
            }
          }
        },
        categories: {
          bsonType: "array",
          description: "Array of categories + timestamp",
          items: {
            bsonType: "object",
            properties: {
              categories: {
                bsonType: "array",
                description: "Categories from the video"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the categories"
              }
            }
          }
        },
        tags: {
          bsonType: "array",
          description: "Array of tags + timestamp",
          items: {
            bsonType: "object",
            properties: {
              tags: {
                bsonType: "array",
                description: "Tags from the video"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the tags"
              }
            }
          }
        },
        videoLength: {
          bsonType: "array",
          description: "Array of videoLengths + timestamp",
          items: {
            bsonType: "object",
            properties: {
              length: {
                bsonType: "int",
                description: "Length of the video in seconds"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the length"
              }
            }
          }
        },
        views: {
          bsonType: "array",
          description: "Array of views + timestamp",
          items: {
            bsonType: "object",
            properties: {
              views: {
                bsonType: "int",
                description: "Number of views"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the views"
              }
            }
          }
        },
        likeCount: {
          bsonType: "array",
          description: "Array of likeCount + timestamp",
          items: {
            bsonType: "object",
            properties: {
              likeCount: {
                bsonType: "int",
                description: "Number of likes"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the likeCount"
              }
            }
          }
        },
        subscribers: {
          bsonType: "array",
          description: "Array of subscribers + timestamp",
          items: {
            bsonType: "object",
            properties: {
              count: {
                bsonType: "int",
                description: "Number of subscribers"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the count"
              }
            }
          }
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp of when the data was inserted"
        },
        transcript: {
          bsonType: "array",
          description: "Array of transcripts + timestamp",
          items: {
            bsonType: "object",
            properties: {
              transcript: {
                bsonType: "string",
                description: "The transcript"
              },
              timestamp: {
                bsonType: "date",
                description: "Timestamp of the transcript"
              }
            }
          }
        }
      }
    }
  }
});

db.news.createIndex({ "url": 1 }, { unique: true });
