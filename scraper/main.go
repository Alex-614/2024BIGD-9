package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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
	CreatedAt       string   `json:"createdAt"`
	CommentsEnabled bool     `json:"commentsEnabled"`
	CommentCount    int      `json:"commentCount"`
	Categories      []string `json:"categories"`
	Tags            []string `json:"tags"`
	VideoLength     int64    `json:"videoLength"`
	Views           int      `json:"views"`
	LikeCount       int      `json:"likeCount"`
	Subscribers     int      `json:"subscribers"`
	Transcript      string   `json:"transcript"`
}

func UnixToISO(unixTime int64) string {
	return time.Unix(int64(unixTime), 0).Format(time.RFC3339)
}

func DatabaseNewsFromVideoInfo(info *VideoInfo) *DatabaseNews {
	commentCount := 0
	if info.Comments != nil {
		commentCount = len(*info.Comments)
	}

	return &DatabaseNews{
		Url:             info.Url,
		Title:           info.Title,
		ChannelId:       info.ChannelId,
		CreatedAt:       UnixToISO(info.UploadDate),
		CommentsEnabled: info.Comments != nil,
		CommentCount:    commentCount,
		Categories:      info.Categories,
		Tags:            info.Tags,
		VideoLength:     info.Duration,
		Views:           info.ViewCount,
		LikeCount:       info.LikeCount,
		Subscribers:     info.ChannelFollower,
		Transcript:      info.Transcript,
	}
}

func sendToServer(info *VideoInfo, apiUrl string) error {
	databaseInfo := DatabaseNewsFromVideoInfo(info)

	body, err := json.Marshal(databaseInfo)
	if err != nil {
		return fmt.Errorf("could not convert info struct to json")
	}

	_, err = http.NewRequest(http.MethodPost, apiUrl, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("could not send json to server")
	}

	return nil
}

func main() {
	config := Config{}
	if err := env.Parse(&config); err != nil {
		fmt.Println("could not parse config from environent variables")
		fmt.Println(err)
		return
	}

	fmt.Println(config)

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
		if playlistUrls, err := getUrlsFromPlaylist(config.PlaylistUrl); err == nil {
			for _, url := range playlistUrls {
				urls <- url
			}
		}

		close(urls)
		waitGroup.Wait()
		close(infos)
	}()

	for info := range infos {
		if err := sendToServer(info, config.PlaylistUrl); err != nil {
			fmt.Println(err)
		}
	}
}
