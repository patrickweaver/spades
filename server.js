// init project
var express = require('express');
var app = express();
var gameplay = require("./gameplay.js");
var Gameplay = gameplay();

var data = [];
Gameplay.newGame(data);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// Routes:
app.get("/api/messages/", function(req, res) {
  res.status(200);
  res.send(data);
});
app.get("/games/new-teams/", function(req, res) {
  var query = {};
  if (req.query.team0){
    query.team0 = req.query.team0;
    if (req.query.team1){
      query.team1 = req.query.team1;
    }
  }
  if (query.team0 && query.team1){
    Gameplay.newTeams(data, [query.team0, query.team1]);
    res.status(200);
    res.send("New Teams!");
  } else {
    res.status(400);
    res.send("Please select 2 team names.");
  }
});
app.get("/games/new-hand/", function(req, res) {
  Gameplay.newHand(data);
  res.status(200);
  res.send("New Hand!");
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
