FROM go:1.22
WORKDIR /root

COPY go.mod main.go ./

RUN go build main.go

ENTRYPOINT [ "./main" ]
