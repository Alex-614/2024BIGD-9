import pymongo
import matplotlib.pyplot as plt
from collections import Counter


try:
    # Database Client
    client = pymongo.MongoClient(
        "mongodb://localhost:27017/",
        username="bigdanalysis",
        password="analysis",
        authSource="BigDNews",
    )

    # Database Name
    db = client["BigDNews"]

    # Collection Name
    col = db["news"]

    # Get all titles
    data = col.find({}, {"_id": 0, "tags": 1})

    tagsList = []  # List with all tags from every video (only first iteration)

    for x in data:
        tagsList.append(x["tags"][0]["tags"])

    # put all tags in one single array
    allTags = [tag for sublist in tagsList for tag in sublist]
    
    # count each tag occurence
    tagsCount = Counter(allTags)
    tagsCount.__delitem__("bild")
    tagsCount.__delitem__("bild youtube")
    tagsCount.__delitem__("bild reporter")
    tagsCount.__delitem__("bild news")
    tagsCount.__delitem__("bild aktuell")
    tagsCount.__delitem__("bild nachrichten")
    tagsCount.__delitem__("bild zeitung")
    tagsCount.__delitem__("bild video")
    tagsCount.__delitem__("nachrichten")
    tagsCount.__delitem__("nachrichten aktuell")
    tagsCount.__delitem__("video")

    tagsCountFirst40 = tagsCount.most_common(40)

    tag, count = zip(*tagsCountFirst40)

    plt.figure(figsize=(10, 8))
    plt.bar(tag, count)
    plt.xlabel("Tag")
    plt.ylabel("Anzahl")
    plt.title("Anzahl der Tags in allen Videos")
    plt.xticks(rotation=90)
    plt.tight_layout()

    # save plot as pdf
    plt.savefig("./plot.pdf")
    print("plot was saved as plot.pdf")
    
    # open window to show plot
    #plt.show()

except Exception as e:
    print("Exception occured in analyse.py: " + e)
finally:
    print("analyse.py ended")
