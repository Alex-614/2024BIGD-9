import pymongo
import json
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from collections import Counter


def dailyViews(colNews):
    # Get all views arrays
    data = colNews.find({}, {"_id": 0, "views": 1})

    # From each array take the last entry of views per day and sum up to total views per date
    dateWithViews = {}
    for video in data:  # for every video
        latest_per_date = {}
        videoViewCount = video["views"]
        for views in videoViewCount:  # for each entry in the views array
            date_str = str(views["timestamp"]).split(" ")[
                0
            ]  # split timestamp only save date not time
            if (
                date_str not in latest_per_date
                or views["timestamp"] > latest_per_date[date_str]["timestamp"]
            ):  # only save highest time per day
                latest_per_date[date_str] = views
        for key, value in latest_per_date.items():  # sum up to total views per date
            if key not in dateWithViews:
                dateWithViews[key] = value["views"]
            else:
                dateWithViews[key] = dateWithViews[key] + value["views"]

    plt.figure(figsize=(10, 8))
    plt.plot(dateWithViews.keys(), dateWithViews.values())
    plt.ylim(bottom=45000000)  # y axis offset
    plt.xlabel("Datum")
    plt.ylabel("Views")
    plt.title("Anzahl der Gesamtviews pro Tag")
    plt.xticks(rotation=90)
    formatter = ticker.ScalarFormatter(useOffset=False)
    formatter.set_scientific(False)
    plt.gca().yaxis.set_major_formatter(formatter)
    plt.savefig("./totalViewsPerDate.pdf")


def tagsFromAllVideos(colNews):
    # Get all titles
    data = colNews.find({}, {"_id": 0, "tags": 1})

    tagsList = []  # List with all tags from every video (only first iteration)

    for x in data:
        tagsList.append(x["tags"][0]["tags"])

    # put all tags in one single array
    allTags = [tag for sublist in tagsList for tag in sublist]

    # count each tag occurence
    tagsCount = Counter(allTags)
    """tagsCount.__delitem__("bild")
    tagsCount.__delitem__("bild youtube")
    tagsCount.__delitem__("bild reporter")
    tagsCount.__delitem__("bild news")
    tagsCount.__delitem__("bild aktuell")
    tagsCount.__delitem__("bild nachrichten")
    tagsCount.__delitem__("bild zeitung")
    tagsCount.__delitem__("bild video")
    tagsCount.__delitem__("nachrichten")
    tagsCount.__delitem__("nachrichten aktuell")
    tagsCount.__delitem__("video")"""

    tagsCountFirst40 = tagsCount.most_common(40)

    tag, count = zip(*tagsCountFirst40)

    plt.figure(figsize=(10, 8))
    plt.bar(tag, count)
    plt.xlabel("Tag")
    plt.ylabel("Anzahl")
    plt.title("Anzahl der Tags in allen Videos")
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.show()
    # plt.savefig("./plot.pdf")

    # open window to show plot
    # plt.show()


def wordsFromTitles(colNews):
    # Get all titles arrays
    data = colNews.find({}, {"_id": 0, "title": 1})

    allTitles = ""
    for video in data:  # put all titles in one long string
        allTitles += " " + video["title"][0]["title"]

    words = allTitles.split()  # split string on empty space
    wordFrequencies = Counter(words)  # count words
    upperCaseWordFrequencies = {}
    sortedWordFrequencies = wordFrequencies.most_common()  # sort to most common
    upperCaseWordFrequencies = [
        (key, value) for key, value in sortedWordFrequencies if key[0].isupper()
    ]  # only select upper key words
    wordFreq60 = dict(
        upperCaseWordFrequencies[:60]
    )  # only pick first 60 words for plotting

    plt.figure(figsize=(16, 8))
    plt.bar(wordFreq60.keys(), wordFreq60.values())
    plt.xlabel("Wort")
    plt.ylabel("Anzahl")
    plt.title("Häufigkeit Wörter im Titel")
    plt.xticks(rotation=90)
    plt.savefig("./wordsInTitle.pdf")


def uploadsPerDay(colNews):
    # get all createdAt arrays
    data = colNews.find({}, {"_id": 0, "createdAt": 1})

    counter = {}
    for video in data:
        dateStr = str(video["createdAt"]).split(" ")[0]  # split only to date string
        if dateStr not in counter:  # count the dates
            counter[dateStr] = 1
        else:
            counter[dateStr] = counter[dateStr] + 1

    sortedCounter = {key: counter[key] for key in sorted(counter)}  # sort per date

    plt.figure(figsize=(16, 12))
    plt.plot(sortedCounter.keys(), sortedCounter.values())
    plt.xlabel("Datum")
    allTicks = plt.xticks()[0]
    selectedTicks = allTicks[::6]
    plt.xticks(selectedTicks)
    plt.ylabel("Anzahl")
    plt.title("Uploads pro Tag")
    plt.xticks(rotation=90)
    plt.savefig("./uploadsPerDay.pdf")


def tagsPerWeekday(colNews):
    # get all tag arrays
    data = colNews.find({}, {"_id": 0, "createdAt": 1, "tags": 1})

    tagsPerDay = {}
    for video in data:
        dateStr = video["createdAt"].weekday()  # split only to date string
        if dateStr not in tagsPerDay:  # count the dates
            tagsPerDay[dateStr] = video["tags"][0]["tags"]
        else:
            tagsPerDay[dateStr] = tagsPerDay[dateStr] + video["tags"][0]["tags"]

    for day, tags in tagsPerDay.items():
        countMonday = Counter(tags)  # count how often tag appears
        sortedCountMonday = dict(
            sorted(countMonday.items(), key=lambda item: item[1], reverse=True)
        )
        sortedCountMonday60 = {
            key: sortedCountMonday[key] for key in list(sortedCountMonday.keys())[:60]
        }  # only pick first 60 words for plotting
        plt.figure(figsize=(16, 12))
        plt.plot(sortedCountMonday60.keys(), sortedCountMonday60.values())
        plt.xlabel("Tag")
        plt.ylabel("Anzahl")
        plt.title("Tags pro Wochentag")
        plt.xticks(rotation=90)
        plt.savefig("./tagsPerWeekday/tagsPerWeekday" + str(day) + ".pdf")


def subscriberPerDate(colNews):
    # Get all subscribers arrays
    data = colNews.find({}, {"_id": 0, "subscribers": 1})

    # From each array take the last entry of views per day and sum up to total views per date
    dateWithViews = {}
    for video in data:  # for every video
        latest_per_date = {}
        videoViewCount = video["subscribers"]
        for views in videoViewCount:  # for each entry in the views array
            date_str = str(views["timestamp"]).split(" ")[0]  # split timestamp only save date not time
            if (
                date_str not in latest_per_date
                or views["timestamp"] > latest_per_date[date_str]["timestamp"]
            ):  # only save highest time per day
                latest_per_date[date_str] = views
        for key, value in latest_per_date.items():  # sum up to total views per date
            if key not in dateWithViews:
                dateWithViews[key] = value["count"]

    print(dateWithViews)
    plt.figure(figsize=(10, 8))
    plt.plot(dateWithViews.keys(), dateWithViews.values())
    plt.xlabel("Datum")
    plt.ylabel("Subscriber")
    plt.title("Anzahl der Subscriber")
    plt.xticks(rotation=90)
    formatter = ticker.ScalarFormatter(useOffset=False)
    formatter.set_scientific(False)
    plt.gca().yaxis.set_major_formatter(formatter)
    plt.savefig("./subscriberPerDate.pdf")
    
def commentsPerDate(colNews):
    # Get all comments arrays
    data = colNews.find({}, {"_id": 0, "commentCount": 1})
    dateWithComments = {}
    for video in data:  # for every video
        latest_per_date = {}
        videoCommentCount = video["commentCount"]
        for commentCount in videoCommentCount:  # for each entry in the views array
            date_str = str(commentCount["timestamp"]).split(" ")[0]  # split timestamp only save date not time
            if (
                date_str not in latest_per_date
                or commentCount["timestamp"] > latest_per_date[date_str]["timestamp"]
            ):  # only save highest time per day
                latest_per_date[date_str] = commentCount
        for key, value in latest_per_date.items():  # sum up to total views per date
            if key not in dateWithComments:
                dateWithComments[key] = value["count"]
            else:
                dateWithComments[key] = dateWithComments[key] + value["count"]        
    
    plt.figure(figsize=(10, 8))
    plt.plot(dateWithComments.keys(), dateWithComments.values())
    plt.xlabel("Datum")
    plt.ylabel("Anzahl")
    plt.title("Anzahl der Gesamtkommentare pro Tag")
    plt.xticks(rotation=90)
    formatter = ticker.ScalarFormatter(useOffset=False)
    formatter.set_scientific(False)
    plt.gca().yaxis.set_major_formatter(formatter)
    plt.savefig("./totalCommentsPerDate.pdf")
    
def countCommentsDisabled(colNews):
    # Get all commentsEnabled array
    data = colNews.find({}, {"_id": 0, "commentsEnabled": 1})
    enabledCount = 0
    disabledCount = 0
    for video in data:
        commentEnabled = video["commentsEnabled"][len(video["commentsEnabled"]) - 1]["comments"]
        if commentEnabled:
            enabledCount = enabledCount + 1
        else:
            disabledCount = disabledCount + 1
    
    plotDict = {"Aktiviert":enabledCount, "Deaktiviert":disabledCount}
    plt.figure(figsize=(10, 8))
    plt.bar(plotDict.keys(), plotDict.values())
    plt.xlabel("Datum")
    plt.ylabel("Anzahl")
    plt.title("Anzahl der Videos mit Aktivierten / Deaktivierten Kommentaren")
    plt.xticks(rotation=90)
    formatter = ticker.ScalarFormatter(useOffset=False)
    formatter.set_scientific(False)
    plt.gca().yaxis.set_major_formatter(formatter)
    plt.savefig("./countCommentsDisabled.pdf")
    
def countTitlesChanged(colNews):
     # Get all titles arrays
    data = colNews.find({}, {"_id": 0, "title": 1})
    
    counter = 0
    titleChanged = {}
    for video in data:
        allTitles = video["title"]
        lastTitle = allTitles[0]["title"]
        for title in allTitles:
            if title["title"] != lastTitle:
                counter = counter + 1
                titleChanged[lastTitle] = title["title"]
            lastTitle = title["title"]
    
    with open('changedTitles.txt', 'w') as file:
        for key, value in titleChanged.items():
            file.write(key + "  --->>>   " + value + "\n")


try:
    # Database Client
    client = pymongo.MongoClient(
        "mongodb://143.93.91.44:27017/",
        username="bigdanalysis",
        password="analysis",
        authSource="BigDNews",
    )

    # Database Name
    db = client["BigDNews"]

    # Collection Name
    colNews = db["news"]

    # dailyViews(colNews)
    # tagsFromAllVideos(colNews) #nicht interessant?
    # wordsFromTitles(colNews)
    # uploadsPerDay(colNews)
    # tagsPerWeekday(colNews)
    # subscriberPerDate(colNews)
    # commentsPerDate(colNews)
    # countCommentsDisabled(colNews)
    countTitlesChanged(colNews)


except Exception as e:
    print("Exception occured in analyse.py: " + e)
finally:
    print("analyse.py ended")
