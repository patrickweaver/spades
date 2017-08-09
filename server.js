// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gameplay = require("./gameplay.js");
var Gameplay = gameplay();
var Game = require("./classes/game.js");
var games = [];
var Player = require("./classes/player.js");
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

function findPlayer(playerId){
  var foundPlayer = false;
  for (var p in players){
    if (playerId === players[p].playerId) {
      var player = players[p];
      foundPlayer = true;
      break;
    }
  }
  if (foundPlayer){
    return player;
  } else {
    console.log("Error: Could not find player " + playerId);
    return null;
  }
}

// Placeholder API endpoint for before game starts
app.get("/api/game", function(req, res) {
  console.log("GET: No Game Id");
  var playerId = req.query.playerId;
  var data = {};
  
  var getPlayerNameData = {
    update: 1,
    stage: "getPlayerName",
    prompt: {
      "question": "What is your name?",
      "type": "text",
      "options": []
    }
  }
  
  var getKindOfGameData = {
    update: 2,
    stage: "beforeGame",
    prompt: {
      "question": "Do you want to start a new game or join a game?",
      "type": "options",
      "options": ["New Game", "Join Game"]
    }
  }
  
  if (req.query.stage === "loading") {
    data = getPlayerNameData;
  } else {
    var player = findPlayer(playerId);
    var playerUpdate = player.update;
    
    if (playerUpdate === 1){
      // stage: getPlayerName
      data = getPlayerNameData;
      
    } else if (playerUpdate === 2) {
      // stage: beforeGame
      data = getKindOfGameData;
    }
  }
  
  res.status(200);
  res.send(data);
  
});

app.get("/api/game/:gameId", function(req, res) {
  console.log("GET: With Game Id -- " + req.query.stage);
  var gameId = req.params.gameId;
  var update = req.query.update;
  var playerId = req.query.playerId;
  // 🚸 Need to decide where stage is coming from.
  //   Since source of truth should be backend either
  //   put it in player or game?
  var stage = req.query.stage;
  var player = false;
  var game = false;
  var data = false;
  
  // Find player and game
  player = findPlayer(playerId);
  game = findGame(gameId);
  
  // If player is not in game, or player is not found, or game is not found send error.
  if (!player){
    sendError(req, res, "Player not found.");
    return;
  }  
  if (!game){
    sendError(req, res, "Game not found.");
    return;
  }
  if (game.players.indexOf(player) < 0) {
    sendError(req, res, "Player is not in game");
    return;
  }
  
  //console.log("Client Update: " + update);
  //console.log("Server Update: " + game.update);
  
  
  // If the server has newer information than the client, send new data:
  if (game.update > update) {

    data = {
      update: game.update
    }
    
    switch (stage) {
      // Player selected "New Game"
      case "beforeGame":
        
        break;
        
      case "joiningGame":
        
        break;
        
      default:
        break;              
    }
    
    
  } else {
    data = {};
  }
  
  // If there is data (even empty), send data.
  if (data){
    res.status(200);
    res.send(data);
    return;
  } else {
    sendError(req, res, "No data.");
    return;
  }
  
  
  
  
  /*
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
  */
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
        console.log("POST: GET PLAYER NAME");
        var player = new Player(playerId, input, "human");
        players.push(player);
        break;    
      case "beforeGame":
        console.log("POST: GAME ID: " + gameId);
        var player = findPlayer(playerId);
        if (input && gameId && player) {
          if (input === "New Game") {
            var game = new Game(gameId, player);
            // 🚸 Should game or player store stage?
            games.push(game);
          }
        } else if (input === "Join Game") {
          // 🚸 Add logic to join a game
          console.log(input);
        }
        break;
      /*
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
        break;
      */
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



