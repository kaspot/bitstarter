var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');

app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(request, response) {
    var text = fs.readFileSync('index.html');
  response.send(text.toString('utf8'));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
