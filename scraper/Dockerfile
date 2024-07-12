FROM golang:1.22 as build
WORKDIR /root

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 go build -- *.go

FROM alpine:3.20.1
WORKDIR /root

RUN apk add --no-cache yt-dlp=2024.07.09-r0

COPY --from=build /root/main ./main

RUN ls

CMD [ "./main" ]
