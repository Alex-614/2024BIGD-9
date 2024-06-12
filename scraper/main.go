package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
	"sync"
)

type CommentInfo struct {
	Id string `json:"id"`
	AuthorId string `json:"autor_id"`
	AuthorName string `json:"author"`
	Text string `json:"text"`
	LikeCount int `json:"like_count"`
	Timestamp int `json:"timestamp"`
}

type VideoInfo struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	ChannelId string `json:"channel_id"`
	Duration int `json:"duration"`
	ViewCount int `json:"view_count"`
	Categories []string `json:"categories"`
	Tags []string `json:"tags"`
	LikeCount int `json:"like_count"`
	ChannelFollower int `json:"channel_follower_counter"`
	UploadDate int `json:"Timestamp"`
	Comments []CommentInfo `json:"comments"`
	Transcript string
}

var REGEXP_SUBTITLE_TEXT = regexp.MustCompile("<font.*>(.*)</font>")
var REGEXP_ID_FROM_URL = regexp.MustCompile("\\/watch\\?v=(.*)\\/?")

func getUrlsFromPlaylist(url string) ([]string, error) {
	result := []string {}
	command := exec.Command(
		"yt-dlp",
		"--flat-playlist",
		"--dump-single-json",
		url,
	)

	output, err := command.Output();
	if (err != nil) {
		return result, err
	}

	type PlaylistEntryInfo struct {
		Title string `json:"title"`
		Url string `json:"url"`
	}

	type PlaylistInfo struct {
		Entries []PlaylistEntryInfo `json:"entries"`
	}

	playlistInfo := new(PlaylistInfo)
	if err := json.Unmarshal(output, playlistInfo); err != nil {
		return result, err
	}

	for _, entry := range playlistInfo.Entries {
		if (entry.Title != "[Private video]") {
			result = append(result, entry.Url)
		}
	}

	return result, nil;
}

func getSubtitleFile(tempDir string, url string) (string, error) {
	filename := REGEXP_ID_FROM_URL.FindStringSubmatch(url)[1]

	cmd := exec.Command(
		"yt-dlp",
		"--write-subs",
		"--write-auto-subs",
		"--skip-download",
		"--sub-langs", "de",
		"--sub-format", "ttml",
		"--convert-subs", "srt",
		"--output", path.Join(tempDir, filename),
		url,
	)

	if err := cmd.Run(); err != nil {
		return "", err
	}

	return path.Join(tempDir, filename + ".de.srt"), nil
}

func convertSubtitleFile(subtitlePath string) (string, error) {
	file, err := os.ReadFile(subtitlePath)
	if (err != nil) {
		return "", err
	}

	matches := REGEXP_SUBTITLE_TEXT.FindAllStringSubmatch(string(file), -1)
	result := []string {};

	for _, match := range matches {
		if match != nil {
			result = append(result, match[1])
		}
	}

	return strings.Join(result, "\n"), nil
}

func getSubtitles(url string, temporyDirectory string) (string, error) {
	subtitleFile, err := getSubtitleFile(temporyDirectory, url)
	if (err != nil) {
		return "", err
	}

	subtitle, err := convertSubtitleFile(subtitleFile)
	if (err != nil) {
		return "", err
	}

	return subtitle, nil
}

func getInfoStruct(url string, tempDir string) (*VideoInfo, error) {
	command := exec.Command(
		"yt-dlp",
		"--dump-single-json",
		"--write-comments",
		url,
	)

	output, err := command.Output()
	if (err != nil) {
		return nil, err
	}

	info := new(VideoInfo)
	if err := json.Unmarshal(output, info); err != nil {
		return nil, err
	}

	subtitles, err := getSubtitles(url, tempDir)
	if err != nil {
		return nil, err
	}

	info.Transcript = subtitles

	return info, nil
}

func main() {
	fmt.Println("scraper started...")
	playlistUrl := "https://youtube.com/playlist?list=PL2QF6_2vxWih_qskqy_t_axr0CtbWJXxh&si=QOl4T_2VQ4xXRCUi"
	urls, err := getUrlsFromPlaylist(playlistUrl)
	if (err != nil) {
		fmt.Println("could not get urls from playlist")
		fmt.Println(err)
		os.Exit(1);
	}

	type AtomicInfos struct {
		Infos []VideoInfo
		Mutex sync.Mutex
	}

	waitGroup := sync.WaitGroup{}
	infos := AtomicInfos{
		Infos: []VideoInfo{},
		Mutex: sync.Mutex{},
	}

	temporyDirectory, err := os.MkdirTemp("", "bild-scraper")
	if (err != nil) {
		fmt.Println("could not create temporary directory")
		fmt.Println(err)
		os.Exit(2);
	}

	defer os.RemoveAll(temporyDirectory);

	for _, url := range urls {
		waitGroup.Add(1)

		go func(url string) {
			defer waitGroup.Done()
			info, err := getInfoStruct(url, temporyDirectory)

			if (err != nil) {
				fmt.Println("could not get info struct")
				fmt.Println(err)
				return
			}

			infos.Mutex.Lock()
			infos.Infos = append(infos.Infos, *info)
			fmt.Printf("%d/%d\n", len(infos.Infos), len(urls))
			infos.Mutex.Unlock()
		}(url)
	}

	waitGroup.Wait()
	fmt.Println(infos.Infos)
	fmt.Println(infos)



	fmt.Println("scraper finished.")
}
