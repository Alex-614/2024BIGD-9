package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
)

var REGEXP_SUBTITLE_TEXT = regexp.MustCompile("<font.*>(.*)</font>")

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
	Url string `json:"webpage_url"`
	Title string `json:"title"`
	Description string `json:"description"`
	ChannelId string `json:"channel_id"`
	Duration int64 `json:"duration"`
	ViewCount int `json:"view_count"`
	Categories []string `json:"categories"`
	Tags []string `json:"tags"`
	LikeCount int `json:"like_count"`
	ChannelFollower int `json:"channel_follower_count"`
	UploadDate int64 `json:"Timestamp"`
	Comments *[]CommentInfo `json:"comments"`
	Transcript string
}

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

func getSubtitleFile(tempDir string, url string, filename string) (string, error) {
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

	subtitlePath := path.Join(tempDir, filename + ".de.srt")
	if _, err := os.Stat(subtitlePath); err != nil {
		os.Create(subtitlePath)
	}

	return subtitlePath, nil
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

func getSubtitles(url string, temporyDirectory string, filename string) (string, error) {
	subtitleFile, err := getSubtitleFile(temporyDirectory, url, filename)
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

	subtitles, err := getSubtitles(url, tempDir, info.Id)
	if err != nil {
		return nil, err
	}

	info.Transcript = subtitles

	return info, nil
}
