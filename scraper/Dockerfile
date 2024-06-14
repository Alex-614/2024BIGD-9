FROM golang:1.22
WORKDIR /root

RUN \
	apt-get update && \
	apt-get install --yes yt-dlp=2023.03.04-1 && \
	rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./

RUN go mod download

COPY main.go youtube.go ./

RUN go build main.go youtube.go

ENTRYPOINT [ "./main" ]
