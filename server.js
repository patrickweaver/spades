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
        prompt: player.prompt,
        hand: false
      }
    }
  }

  res.status(200);
  res.send(data);

});


// General API endpoint for player information:
app.get("/api/game/:gameId", function(req, res) {
  console.log("GET: With Game Id -- " + req.query.stage);
  var clientGameId = req.params.gameId;
  var clientUpdate = req.query.update;
  var clientPlayerId = req.query.playerId;
  var clientStage = req.query.stage;
  var player = false;
  var game = false;
  var data = false;

  // Find player and game
  player = findPlayer(clientPlayerId);
  game = findGame(clientGameId);

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
  
  // If the server has newer information than the client, send new data:
  if (game.update > clientUpdate) {
    
    var handData;
    if (game.hands.length > 0) {
      var hand = game.hands[game.hands.length - 1];
      var tricks = [];
      for (var t in hand.tricks) {
        var trick = {
          cardsPlayed: hand.tricks[t].cardsPlayed,
          winner: hand.tricks[t].winner,
          winningCard: hand.tricks[t].winningCard,
          winIndex: hand.tricks[t].winIndex
        };
        tricks.push(trick);
      }
      handData = {
        spadesBroken: hand.spadesBroken,
        tricks: tricks
        
      }
    } else {
      handData = false;
    }

    data = {
      stage: player.stage,
      prompt: player.prompt,
      handCards: player.handCards,
      bid: player.bid,
      tricksTaken: player.tricksTaken,
      update: game.update,
      players: game.players,
      hand: handData
    }

    if (game.teams && game.teams.length === 2 && game.teams[0].name && game.teams[1].name) {
      data["teamInfo"] = {
        team0: {
          teamName: game.teams[0].name,
          teamBid: game.teams[0].getTeamBid(),
          players: game.teams[0].players
        },
        team1: {
          teamName: game.teams[1].name,
          teamBid: game.teams[1].getTeamBid(),
          players: game.teams[1].players
        }
      };
        {game.teams[player.team].name;}
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

// API POST endpoint:
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
    player.stage = "waiting";
    player.prompt = {};
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
      case "waiting":
        // Don't do anything, this stage is while the server is working.
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
            // Start game:
            game.start();
            // Then have players select team name:
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
              game.update += 1;
            }
            // If all team names are chosen create a new hand
            game.newHand();
          } else {
            console.log(">> Not all teams have names.");
          }

        } else {
          sendError(req, res, "Error starting game.");
          return;
        }
        break;

      case "bidNow":
        player.setBid(input);
        // 🚸 This is repeated in player.botBid();
        var bidder = 0;
        // 🚸 Should bidOrder be in hand?
        for (var p in game.bidOrder) {
          if (game.bidOrder[p] != player) {
            bidder += 1;
          } else {
            break;
          }
        }
        game.hands[game.hands.length - 1].nextBidder(bidder + 1);
        break;
      case "playNow":
        var justPlayed = 0;
        var hand = game.hands[game.hands.length - 1];
        var trick = hand.tricks[hand.tricks.length - 1];
        player.playCard(input, trick);
        for (var p in trick.playOrder) {
          if (trick.playOrder[p] != player) {
            justPlayed += 1;
          } else {
            break;
          }
        }
        trick.nextPlayer(justPlayed + 1);
        break;
      case "allCardsPlayed":
        if (input === "nextTrick") {
          var hand = game.hands[game.hands.length - 1];
          hand.startTrick();
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
