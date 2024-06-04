use BigDNews

db.createCollection("news", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["url", "title", "source", "createdAt", "commentsEnabled", "commentCount", "tags", "videoLength", "views", "subscribers", "timestamp", "transcript"],
      properties: {
        url: {
          bsonType: "string",
          description: "URL of the video"
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
        source: {
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
        tags: {
          bsonType: "array",
          description: "Array of tags + timestamp",
          items: {
            bsonType: "object",
            properties: {
              tags: {
                bsonType: ["array"],
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
})

db.news.createIndex({ "url": 1 }, { unique: true })
