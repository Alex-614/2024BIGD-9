var http = require('http');
const hostname = '127.0.0.1';
const port = process.env.PORT;


var tools = require('./insert.js');

const server = http.createServer(function (req, res) {
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        res.setHeader('Content-Type', 'text/plain');
        tools.insertOrUpdateNews(JSON.parse(body)).then(result => {
                res.statusCode = 200;
                res.write('Data saved!');
                res.end();
            }).catch(error => {
                res.statusCode = 400;
                res.write(error.message);
                res.end();
            });
    });
});


server.listen(port, function (error) {
    if (error) {
        console.log("Error! ", error);
    } else {
        console.log("Listening on " + port);
    }
});

