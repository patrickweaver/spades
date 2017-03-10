// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var assets = require('./assets');
var game = require("./game.js");

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// https://gomix.com/#!/project/assets-lib
app.use("/assets", assets);

// handle 404s
app.use(function(req, res) {
  res.status(400);
  res.sendFile(__dirname + '/public/404.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
