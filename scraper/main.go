package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	ApiUrl      string `env:"API_URL,required"`
	PlaylistUrl string `env:"PLAYLIST_URL,required"`
	Threads     int    `env:"THREADS" envDefault:"10"`
}

type DatabaseNews struct {
	Url             string   `json:"url"`
	Title           string   `json:"title"`
	ChannelId       string   `json:"channelId"`
	CreatedAt       int64    `json:"createdAt"`
	CommentsEnabled bool     `json:"commentsEnabled"`
	CommentCount    int      `json:"commentCount"`
	Categories      []string `json:"categories"`
	Tags            []string `json:"tags"`
	VideoLength     int64    `json:"videoLength"`
	Views           int      `json:"views"`
	LikeCount       int      `json:"likeCount"`
	Subscribers     int      `json:"subscribers"`
	Transcript      string   `json:"transcript"`
	Timestamp       int64    `json:"timestamp"`
}

func DatabaseNewsFromVideoInfo(info *VideoInfo) *DatabaseNews {
	commentsEnabled := info.Comments != nil
	commentCount := 0

	if commentsEnabled {
		commentCount = len(*info.Comments)
	}

	return &DatabaseNews{
		Url:             info.Url,
		Title:           info.Title,
		ChannelId:       info.ChannelId,
		CreatedAt:       info.UploadDate,
		CommentsEnabled: commentsEnabled,
		CommentCount:    commentCount,
		Categories:      info.Categories,
		Tags:            info.Tags,
		VideoLength:     info.Duration,
		Views:           info.ViewCount,
		LikeCount:       info.LikeCount,
		Subscribers:     info.ChannelFollower,
		Transcript:      info.Transcript,
		Timestamp:       time.Now().Unix(),
	}
}

func sendToServer(info *VideoInfo, apiUrl string, client *http.Client) error {
	databaseInfo := DatabaseNewsFromVideoInfo(info)

	body, err := json.Marshal(databaseInfo)
	if err != nil {
		return fmt.Errorf("could not convert info struct to json")
	}

	req, err := http.NewRequest(http.MethodPost, apiUrl, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("could not create request to server")
	}

	fmt.Println(string(body))
	res, err := client.Do(req)
	if err != nil {
		return err;
	}

	fmt.Println(res)

	return nil
}

func main() {
	config := Config{}
	if err := env.Parse(&config); err != nil {
		fmt.Println("could not parse config from environent variables")
		fmt.Println(err)
		return
	}

	temporyDirectory, err := os.MkdirTemp("", "bild-scraper")
	if err != nil {
		fmt.Println("could not create temporary directory")
		fmt.Println(err)
		return
	}

	defer os.RemoveAll(temporyDirectory)

	infos, urls := make(chan *VideoInfo), make(chan string)
	waitGroup := sync.WaitGroup{}

	for i := 0; i < config.Threads; i++ {
		waitGroup.Add(1)

		go func() {
			defer waitGroup.Done()

			for url := range urls {
				fmt.Printf("processing %s\n", url)
				info, err := getInfoStruct(url, temporyDirectory)

				if err != nil {
					fmt.Println("could not get info struct")
					fmt.Println(err)
					return
				}

				infos <- info
			}
		}()
	}

	go func() {
		for _, playlistUrl := range strings.Split(config.PlaylistUrl, ",") {
			if playlistUrls, err := getUrlsFromPlaylist(playlistUrl); err == nil {
				for _, url := range playlistUrls {
					urls <- url
				}
			}
		}

		close(urls)
		waitGroup.Wait()
		close(infos)
	}()

	client := http.Client {
	 Timeout: 30 * time.Second,
  }

	for info := range infos {
		if err := sendToServer(info, config.ApiUrl, &client); err != nil {
			fmt.Println(err)
		}
	}
}
