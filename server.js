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
  console.log("GET: No Game Id");
  var playerId = req.query.playerId;
  var update = parseInt(req.query.update);
  var data = false;
  
  var getPlayerNameData = {
    stage: "getPlayerName",
    prompt: {
      "question": "What is your name?",
      "type": "text",
      "options": []
    }
  }
  
  var getKindOfGameData = {
    stage: "beforeGame",
    prompt: {
      "question": "Do you want to start a new game or join a game?",
      "type": "options",
      "options": ["New Game", "Join Game"]
    }
  }
  
  if (req.query.stage === "loading") {
    data = getPlayerNameData;
    data["update"] = 1;
  } else {
    if (update === 1){
      // stage: getPlayerName
      data = getPlayerNameData;
      
    } else if (update === 2) {
      // stage: beforeGame
      data = getKindOfGameData;
    }
  }
  if (data) {
    res.status(200);
    res.send(data);
  }
  
});

app.get("/api/game/:gameId", function(req, res) {
  console.log("GET: With Game Id -- " + req.query.stage);
  var gameId = req.params.gameId;
  var update = req.query.update;
  var playerId = req.query.playerId;
  var stage = req.query.stage;
  var game = false;
  var data = false;
  game = findGame(gameId);
  if (game){
    if (game.update < update){
      switch(stage) {
        case "beforeGame":
          // 🚸 Add in New game or Join Game logic here
          // New Game:
          var player = findPlayer(game, playerId);
          if (player){
            data = {
              stage: "waitingForPlayers",
              prompt: {
                "question": "Start game now with bots:",
                "type": "options",
                "options": ["Start Game"]
              },
              gameUpdate: game.update + 1
            }
          }
          break;
        case "waitingForPlayers":
           var player = findPlayer(game, playerId);
            if (player){
              var teamWords = [
                "apple", "banana", "carrot", "donut", "egg", "fritter",
                "grape", "halva", "ice", "juice", "kelp", "mustard", "noodle",
                "orange", "peanut", "quince", "radish", "spice", "tomato",
                "umbrella", "vet", "weird", "x", "yam", "zimp"
              ];
              var wordsPicked = [];
              for (var i = 0; i < 5; i++){
                var word = teamWords[Math.floor(Math.random() * teamWords.length)];
                if (wordsPicked.indexOf(word) === -1) {
                  wordsPicked.push(word);
                } else {
                  i -= 1;
                }
              }            
              data = {
                stage: "startingGame",
                prompt: {
                  "question": "Pick a team name word:",
                  "type": "options",
                  "options": wordsPicked
                },
                gameUpdate: game.update + 1
              }
            }        
          break;
        case "startingGame":
          
          
        default:
          console.log("DEFAULT STAGE");
      }
    } else {
      data = {};
    }
  }
  if (game && data){
    if (data.stage){
      game.update += 1;
    }
    res.status(200);
    res.send(data);    
  } else {
    sendError(req, res, "Game not found.");
  }
});


app.post("/api/game/", function(req, res) {
  console.log("POST: " + req.body.stage);
  var input = req.body.input;
  var playerId = req.body.playerId;
  var gameId = req.body.gameId;
  var stage = req.body.stage;
  if (stage) {   
    switch(stage) {
      case "getPlayerName":
        console.log("POST: GET PLAYER NAME")
        break;
      case "beforeGame":
        console.log("POST: GAME ID: " + gameId);
        if (input && gameId) {
          if (input === "New Game") {
            var game = Gameplay.newGame(gameId, playerId, "human");
            games.push(game);
          }
        } else if (input === "Join Game") {
          console.log(input);
        }
        break;
      case "waitingForPlayers":
        // 🚸 Add logic for automatically starting when tables is full.
        var game = findGame(gameId);
        if (input === "Start Game") {
          game.start();
          
        }  
        break;
      case "startingGame":
        var game = findGame(gameId);
        var player = findPlayer(game, playerId);
        // 🚸 How can we tell if all humans have picked words?
        
      default: 
        console.log("POST: Default");
    }
    res.status(200);
    res.send("OK");
  } else {
    console.log("POST: NO STAGE");
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



