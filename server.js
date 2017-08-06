// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gameplay = require("./gameplay.js");
var Gameplay = gameplay();
var games = [];
var players = [];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
  //console.log(req.query.playerId);
  // console.log(req.query.stage);
  var playerId = req.query.playerId;
  var data = false;
  switch(req.query.stage) {
    case "getPlayerName":
    case "beforeGame":
      if (req.query.playerId){
        var sharedData = {
          stage: "beforeGame",
          prompt: {
            "question": "Create or join a game to start:",
            "type": "options",
            "options": ["New Game", "Join Game"]
          }
        }
        for (var player in players){
          console.log(player);
          if (players[player].playerId === req.query.playerId){
            data = sharedData;
            break;
          }
        }
      } else {
        if (req.query.state === "beforeGame"){
          data = sharedData;
        }      
      }
      break;
    default:
      data = {
        stage: "getPlayerName",
        prompt: {
          "question": "What is your name?",
          "type": "text",
          "options": []
        }
      }
  }
  if (data) {
    res.status(200);
    res.send(data);
  }
  
});

app.get("/api/game/:gameId", function(req, res) {
  console.log("GAME ID: " + req.params.gameId);
  var gameId = req.params.gameId;
  var playerId = req.query.playerId;
  var game = false;
  var data = false;
  if (gameId) {
    for (var game in games) {
      if (games[game].gameId === gameId){
        game = games[game];
      }
    }
    
    switch(req.query.stage) {
      case "beforeGame":
      case "waitingForPlayers":
        // 🚸 Add in New game or Join Game logic here
        if (req.query.playerId){
          for (var player in players) {
            if (players[player].playerId === req.query.playerId){
              data = {
                stage: "waitingForPlayers",
                prompt: {
                  "question": "Start game now with bots:",
                  "type": "options",
                  "options": ["Start Game"]
                }
              }
              break;
            }
          }
        }
      //case "waitingForPlayers":
      //  break;

    }
  }  
  if (game && data){
    res.status(200);
    res.send(data);    
  } else {
    sendError(req, res, "Game not found.");
  }
  

});


app.post("/api/game/", function(req, res) {
  console.log("POST: " + req.body.stage);
  console.log();
  for (var i in req.body) {
    console.log(i + ": " + req.body[i]);
  }
  console.log();
  if (req.body.stage){    
    switch(req.body.stage){
      case "getPlayerName":
        var player = {
          playerId: req.body.playerId,
          playerName: req.body.input
        }
        players.push(player);
        break;
      case "beforeGame":
        console.log("POST: GAME ID: " + req.body.gameId);
        if (req.body.input && req.body.gameId) {
          if (req.body.input === "New Game") {
            // 🚸 Make a new game for real.
            var game = {
              gameId: req.body.gameId
            }
            games.push(game);
            console.log("START GAME!!");
          }
        } else if (req.body.input === "Join Game") {
          console.log(req.body.input);
        }
        break;
    }
    res.status(200);
    res.send("OK");
  } else {
    sendError(req, res, "Invalid game stage");
  }  
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



