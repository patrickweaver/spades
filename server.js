// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helpers = require("./helpers.js");
var Helpers = helpers();
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

  if (req.query.stage === "loading") {
    data = getPlayerNameData;
  } else {
    var player = findPlayer(playerId);
    //var playerUpdate = player.update;

    if (!player) {
      // stage: getPlayerName
      data = getPlayerNameData;

    } else {
      // stage: beforeGame
      data = {
        update: player.update,
        gameId: player.gameId,
        stage: player.stage,
        prompt: player.prompt
      }
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
  var clientStage = req.query.stage;
  var player = false;
  var game = false;
  var data = false;

  // Find player and game
  player = findPlayer(playerId);
  game = findGame(gameId);

  var stage = player.stage;

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
      stage: player.stage,
      prompt: player.prompt,
      update: game.update,
      players: game.players,
    }

    if (game.teams && game.teams.length === 2 && game.teams[0].name && game.teams[1].name) {
      data["teamName"] = game.teams[player.team].name;
    } else {
      console.log("**** FALSE!");
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
});


app.post("/api/game/", function(req, res) {
  console.log("POST: " + req.body.stage);
  var input = req.body.input;
  var playerId = req.body.playerId;
  var gameId = req.body.gameId;
  var game = false;
  if (gameId) {
    game = findGame(gameId);
  }
  var stage = req.body.stage;
  var player = false;
  if (stage != "getPlayerName") {
    player = findPlayer(playerId);
  }
  /*
  console.log();
  for (var i in req.body) {
    console.log(i + ": " + req.body[i]);
  }
  console.log();
  */
  if (stage) {
    switch(stage) {

      case "getPlayerName":
        console.log("POST: GET PLAYER NAME");
        if (input) {
          player = new Player(playerId, input, "human", "");
          players.push(player);
        } else {
          console.log("INPUT: " + input);
          sendError(req, res, "Missing information.");
          return;
        }

        break;

      case "beforeGame":
        console.log("POST: GAME ID: " + gameId);
        if (input && gameId && player) {

          // If player selected "New Game"
          if (input === "New Game") {
            var game = new Game(gameId, player);
            games.push(game);
            player.update += 1;
            player.addToGame(game);
          }
          // If player selected "Join Game"
        } else if (input === "Join Game") {
          player.update += 1;
          player.stage = "inputGameId";
          player.prompt = {
            question: "What is the id of the game you want to join?",
            type: "text",
            options: []
          };
        }
        break;

      case "inputGameId":
        if (input && player) {
          var gameId = input;
          game = findGame(gameId);
          if (game) {
            var added = game.addPlayer(player);
            if (!added) {
              sendError(req, res, "No space in game " + gameId);
              return;
            }
          } else {
            sendError(req, res, "Game not found.");
            return;
          }
        }
        break;

      case "waitingForPlayers":
        if (input && player && game) {
          if (input === "Start Game") {
            game.start();
            for (var i in game.players) {
              var player = game.players[i];
              if (player.type === "human") {
                player.stage = "pickTeamName";
                player.prompt = {
                  question: "Pick one word to include in your team name:",
                  type: "options",
                  options: Helpers.teamNameChoices()
                }
              } else {
                player.teamNameChoice = Helpers.teamNameChoices()[0];
              }
            }
            break;
          }
        } else {
          sendError(req, res, "Error starting game.");
          return;
        }
        break;

      case "pickTeamName":
        if (input && player && game) {
          player.teamNameChoice = input;
          var allTeamNamesChosen = true;
          // When a player chooses a team name, check to see if all players now have team names.
          for (var i in game.players) {
            if (!game.players[i].teamNameChoice) {
              allTeamNamesChosen = false;
              break;
            }
          }
          // 🚸 Move this out of server.js?
          if (allTeamNamesChosen) {
            console.log("<< All teams have names");
            for (var i in game.teams) {
              game.teams[i].name = game.teams[i].players[0].teamNameChoice + " " + game.teams[i].players[1].teamNameChoice;
              /*
              for (var j in game.teams[i].players) {
                game.teams[i].players[j].prompt = {
                  // 🚸 Add next stage prompt
                }
              }
              */
              game.update += 1;
            }
            game.newHand();
            console.log("After new hand()");
          } else {
            console.log(">> Not all teams have names.");
          }

        } else {
          sendError(req, res, "Error starting game.");
          return;
        }
        break;

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
