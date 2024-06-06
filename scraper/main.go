package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
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
		if (entry.Title != "[Private Video]") {
			result = append(result, entry.Url)
		}
	}

	return result, nil;
}

func getSubtitleFile(tempDir string, url string) (string, error) {
	cmd := exec.Command(
		"yt-dlp",
		"--write-subs",
		"--write-auto-subs",
		"--skip-download",
		"--sub-langs", "de",
		"--sub-format", "ttml",
		"--convert-subs", "srt",
		"--output", path.Join(tempDir, "subs"),
		url,
	)

	if err := cmd.Run(); err != nil {
		return "", err
	}

	return path.Join(tempDir, "subs.de.srt"), nil
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

func getInfoStruct(url string) (*VideoInfo, error) {
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

	return info, nil
}

func main() {
	playlistUrl := "https://youtube.com/playlist?list=PL2QF6_2vxWih_qskqy_t_axr0CtbWJXxh&si=QOl4T_2VQ4xXRCUi"
	urls, err := getUrlsFromPlaylist(playlistUrl)
	if (err != nil) {
		fmt.Println("could not get urls from playlist")
		fmt.Println(err)
		os.Exit(1);
	}

	infos := []VideoInfo {}

	for i, url := range urls {
		fmt.Printf("%d/%d\n", i + 1, len(urls))

		temporyDirectory, err := os.MkdirTemp("", "bild-scraper")
		if (err != nil) {
			fmt.Println("could not create temporary directory")
			fmt.Println(err)
			os.Exit(1);
		}

		defer os.RemoveAll(temporyDirectory);
		subtitleFile, err := getSubtitleFile(temporyDirectory, url)
		if (err != nil) {
			fmt.Println("could not fetch subtitle file")
			fmt.Println(err)
			os.Exit(2)
		}

		subtitle, err := convertSubtitleFile(subtitleFile)
		if (err != nil) {
			fmt.Println("could not parse subtitle file")
			fmt.Println(err)
			os.Exit(2)
		}

		info, err := getInfoStruct(url)
		if (err != nil) {
			fmt.Println("could not get info struct")
			fmt.Println(err)
			os.Exit(3)
		}

		info.Transcript = subtitle
		infos = append(infos, *info)
	}
}
