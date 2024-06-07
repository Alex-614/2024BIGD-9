FROM golang:1.22
WORKDIR /root

RUN \
	apt-get update && \
	apt-get install --yes yt-dlp=2023.03.04-1 && \
	rm -rf /var/lib/apt/lists/*

COPY go.mod main.go ./

RUN go build main.go

ENTRYPOINT [ "./main" ]
