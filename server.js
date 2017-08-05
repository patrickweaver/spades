// init project
var express = require('express');
var app = express();
var gameplay = require("./gameplay.js");
var Gameplay = gameplay();
var games = [];
var players = [];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// *******
// Routes:
// *******
// 🚸 Combine these two find functions into one?
function findGame(gameId){
  var foundGame = false;
  for (var g in games) {
    if (gameId === games[g].gameId) {
      var game = games[g];
      foundGame = true;
      break;
    }
  }
  if (foundGame) {
    return game;
  } else {
    console.log("Error: Could not find game " + gameId);
    return null;
  }
}

function findPlayer(game, playerId){
  var foundPlayer = false;
  for (var p in game.players){
    if (playerId === game.players[p].id) {
      var player = game.players[p];
      foundPlayer = true;
      break;
    }
  }
  if (foundPlayer){
    return player;
  } else {
    console.log("Error: Could not find player " + playerId + " in game " + game.gameId);
    return null;
  }
}

// Placeholder API endpoint for before game starts
app.get("/api/game", function(req, res) {
  console.log(req.query.playerId);
  console.log(req.query.stage);
  var playerId = req.query.playerId;
  var data = false;
  switch(req.query.stage) {
    case "loading":
      players.push({
        playerId: playerId
      })
      data = {
        stage: "getPlayerName",
        prompt: {
          "question": "What is your name?",
          "type": "text",
          "options": []
        }
      };
      break;
    case "getPlayerName":
      for (var i in players) {
        if (players[i]["playerId"] === playerId) {
          players[i]["name"] = req.query.playerName;
        }
      }
      data = {
        stage: "joinGame",
        prompt: {
          "question": "Create or join a game to start:",
          "type": "options",
          "options": ["Start Game", "Join Game"]
        }
      }
      break;
    case "joinGame":
      if (req.query.input.option === "Start Game") {
        data = {
          stage: "waitingForPlayers",
          prompt: {
            "question": "Start game now with bots:",
            "type": "options",
            "options": ["Start Game"]
          }
        }
      } else if (req.query.input.option === "Join Game") {
        data = {
          stage: "waitingForPlayers",
          prompt: {
            "question": "",
            "type": "options",
            "options": []
          }
        }
      }
      break;
  }
  if (data) {
    res.status(200);
    res.send(data);
  } else {
    sendError(req, res, "Invalid game stage.");
  }
  
});

// 🚸 Might need to change this URL to make the routes more regular
// Get for messages, status and cards
app.get("/api/game/:gameId", function(req, res) {
  var gameId = req.params.gameId;
  var playerId = req.query.playerId;
  var game = false;
  for (var g in games){
    if (games[g].gameId === gameId){
      game = games[g];
    }
  }
  
  if (game){
    
    
    
    
  } else {
    sendError(req, res, "Game not found.");
  }
  

});

// 🚸 Should be POST for starting new game
app.get("/api/new/", function(req, res) {

});

// 🚸 Should be POST for joining game
app.get("/api/join/", function(req, res) {

});

// 🚸 Should change to use gameId in url
app.get("/api/start/", function(req, res) {

});

// 🚸 Should be POST: /api/bid/
app.get("/api/bid/", function(req, res) {
});

app.get("/api/play/", function(req, res) {
});

function sendError(req, res, errorMessage) {
  console.log("** API ERROR: **");
  console.log(errorMessage);
  res.status(400);
  res.send(errorMessage);
}


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



