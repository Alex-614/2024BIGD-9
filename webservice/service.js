var http = require('http');
const hostname = '127.0.0.1';
const port = process.env.PORT;


var tools = require('./insert.js');

const server = http.createServer(function(req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log("received request: " + body);
    tools.insertOrUpdateNews(JSON.parse(body));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write('Data saved!');
    res.end();
  });
});


server.listen(port, function(error) {
  if(error) {
    console.log("Error! ", error);
  } else {
    console.log("Listening: " + port);
  }
});

