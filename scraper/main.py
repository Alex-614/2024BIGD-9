from dataclasses import dataclass
from typing import Optional
import dacite
import yt_dlp
import rich

PLAYLIST_URL = "https://youtube.com/playlist?list=PL2QF6_2vxWih_qskqy_t_axr0CtbWJXxh&si=QOl4T_2VQ4xXRCUi"
YTDL_OPTIONS = {
    "quiet": True,
    "logtostderr": False,
    "ignoreerrors": True,
    "no_warnings": True,

    "geo_bypass": True,
    "source_address": "0.0.0.0",

    # this somehow does not work
    # "subtitleslangs": [ "de" ],
    # "writesubtitles": True,
    # "get_comments": True,
    # "dump_single_json": True
}

YTDL_PLAYLIST_OPTIONS = {
    **YTDL_OPTIONS,
    "lazy_playlist": True,
    "extract_flat": True
}

@dataclass
class VideoInfo:
    id: str
    title: str
    fulltitle: str
    description: str
    channel_id: str
    duration: int
    view_count: int
    age_limit: int
    categories: list[str]
    tags: list[str]
    like_count: int
    channel_follower_count: int
    timestamp: int


def extract_playlist(url: str) -> list[str]:
    with yt_dlp.YoutubeDL(YTDL_PLAYLIST_OPTIONS) as ytdl:
        info = ytdl.extract_info(url, download=False)
        assert isinstance(info, dict), "could not fetch info from url"

        return [
            entry.get("url")
            for entry in info.get("entries", [])
            if entry.get("title", "") != "[Private Video]"
        ]


def extract_info(url: str):
    with yt_dlp.YoutubeDL(YTDL_OPTIONS) as ytdl:
        info = ytdl.extract_info(url, download=False)
        assert isinstance(info, dict), "could not fetch info from url"

        return dacite.from_dict(VideoInfo, info)

if __name__ == "__main__":
    urls = extract_playlist(PLAYLIST_URL)
    for url in urls:
        rich.print(extract_info(url))
