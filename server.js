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
  Helpers.testBot();
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
    //console.log("Error: Could not find player " + playerId);
    return null;
  }
}

function createGame(gameId, update, player, input, gameInGames) {
  var game = new Game(gameId, update, gameInGames);
  games.push(game);
  if (input != "Bot Game") {
    game.addPlayer(player);
  } else {
    game.start();
  }
  game.update += 1;
  return game;
}

// Placeholder API endpoint for before game starts
app.get("/api/game", function(req, res) {
  //console.log("GET: No Game Id");
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

    if (player) {
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

  //console.log("GET: With Game Id -- " + req.query.stage);
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
  if (game){
    // Use this to send response if game is over and player is in game
    var waitToStartNewGame = false;
    // Save update number:
    var savedUpdate = game.update;
    if (game.over){
      console.log("🎃 Client asked and Game is over")
      var gameInGames = game.gameInGames;
      var gameId = game.gameId;
      var gameUpdate = game.update;
      var playerInGame = false;
      for (var p in game.players){
        if (game.players[p].playerId === player.playerId){
          playerInGame = true;
          break;
        }
      }
      if (playerInGame){
        // If player watching send response with "New Game" option
        waitToStartNewGame = true;
      } else {
      // If player is watching a bot game:
      // Remove it from games array
        var gameIndex = games.indexOf(game);
        games.splice(gameIndex, 1);
      // Check if it should play more games:
        if (gameInGames[0] < gameInGames[1]) {
          var newGameId = Helpers.makeRandString(30);
          createGame(newGameId, savedUpdate, null, "Bot Game", [gameInGames[0] + 1, gameInGames[1]]);
          //createGame(gameId, player, input, gameInGames)
        }
       data = {
          gameId: newGameId,
          update: savedUpdate
        }

        if (data){
          res.status(200);
          res.send(data);
          return;
        } else {
          sendError(req, res, "No data.");
          return;
        }

      }

    }
    if (!game.over ||  waitToStartNewGame) {
      var stage = player.stage;

      // If player is not found, or game is not found send error.
      if (!player){
        sendError(req, res, "Player not found.");
        return;
      }
      if (!game){
        if (waitToStartNewGame) {
          console.log("Giving option to start new game")
          player.update = savedUpdate;
          data = {
            gameId: "",
            update: savedUpdate,
            playerName: player.name,
            prompt: player.prompt
          }

          if (data){
            res.status(200);
            res.send(data);
            return;
          } else {
            sendError(req, res, "No data.");
            return;
          }


        } else {
          // Game not over and not found
          sendError(req, res, "Game not found.");
          return;
        }
      }

      // If the server has newer information than the client, send new data:
      if (game.update > clientUpdate) {
        var hand;
        var tricks = [];
        var handData;
        if (game.hands.length > 0) {
          hand = game.hands[game.hands.length - 1];
          for (var t in hand.tricks) {
            var thisTrick = hand.tricks[t];
            var trick = {
              cardsPlayed: thisTrick.cardsPlayed,
              spadesBroken: thisTrick.spadesBroken,
              winner: thisTrick.winner.playerId,
              winningCard: thisTrick.winningCard,
              winIndex: thisTrick.winIndex
            };

            var playOrder = [];
            for (var i in thisTrick.playOrder) {
              playOrder.push(thisTrick.playOrder[i].playerId);
            }

            trick.playOrder = playOrder;


            tricks.push(trick);
          }
          handData = {
            tricks: tricks
          }
          var trickNumber = handData.tricks.length;
        } else {
          handData = false;
          var trickNumber = 0;
        }

        var bidOrder = [];
        if (game.bidOrder.length > 0){
          for (var i = 0; i < 4; i++) {
            bidOrder.push(game.bidOrder[i].playerId);
          }
        }


        data = {
          gameId: game.gameId,
          gameNumber: game.gameInGames,
          stage: player.stage,
          playerName: player.name,
          prompt: player.prompt,
          trickNumber: trickNumber,
          handCards: player.handCards,
          bid: player.bid,
          tricksTaken: player.tricksTaken,
          bidOrder: bidOrder,
          update: game.update,
          humans: game.humans,
          hand: handData
        }

        if (game.players && game.players.length > 0) {
          data["players"] = [];
          for (var i in game.players) {

            var apiPlayer = {}
            var player = game.players[i];
            apiPlayer.playerId = player.playerId;
            apiPlayer.name = player.name;
            apiPlayer.type = player.type;
            data.players.push(apiPlayer);
          }
        }

        function getTeamPlayerInfo(team) {
          var teamPlayers = [];
          for (var i in team.players) {
            var p = team.players[i];
            var player = {
              playerId: p.playerId,
              name: p.name,
              type: p.type,
              team: p.team,
              bid: p.bid,
              tricksTaken: p.tricksTaken,
              confirmed: p.confirmed
            }
            teamPlayers.push(player);
          }
          return teamPlayers;
        }

        var teamInfo;
        if (game.teams && game.teams.length === 2) {
          teamInfo = [
            {
              teamName: game.teams[0].name,
              teamColor: game.teams[0].hexColor,
              teamBid: game.teams[0].getTeamBid(),
              players: getTeamPlayerInfo(game.teams[0]),
              score: "" + game.teams[0].score + game.teams[0].bags
            },
            {
              teamName: game.teams[1].name,
              teamColor: game.teams[1].hexColor,
              teamBid: game.teams[1].getTeamBid(),
              players: getTeamPlayerInfo(game.teams[1]),
              score: "" + game.teams[1].score + game.teams[1].bags
            }
          ];

            //{game.teams[player.team].name;}
        } else {
          teamInfo = [];
        }

        data.teamInfo = teamInfo;

      } else {
        data = {};
      }

      // If there is data (even empty), send data.
      // ✌️
      if (data){
        res.status(200);
        res.send(data);
        return;
      } else {
        sendError(req, res, "No data.");
        return;
      }
    }
  } else {
    sendError(req, res, "No Game Found.");
  }
});

// API POST endpoint:
app.post("/api/game/", function(req, res) {
  console.log("POST: " + req.body.stage + " -- " + req.body.input);
  var input = req.body.input;
  var clientUpdate = req.body.update;
  var newGameId = req.body.newGameId;
  var playerId = req.body.playerId;
  var clientUpdate = parseInt(req.body.update);
  var gameId = req.body.gameId;
  var game = false;
  if (gameId) {
    game = findGame(gameId);
  }
  var stage = req.body.stage;
  var player = false;
  if (stage != "getPlayerName" && stage != "botGame") {
    player = findPlayer(playerId);
    player.stage = "waiting";
    player.prompt = {};
  }

  if (stage) {
    switch(stage) {

      case "getPlayerName":
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
      case "gameOver":
        console.log("POST: GAME ID: " + gameId);
        if (input && gameId && player) {
          console.log("Before start game player.update: " + player.update);

          if (input === "New Game") {
            // If player selected "New Game"
            createGame(gameId, clientUpdate + 1, player, input, [1,1]);
          } else if (input === "Bot Game"){
            // If player selected "Bot Game"
            player.setStatus("botGame", {});
            createGame(gameId, clientUpdate + 1, player, input, [1,100]);
            player.update += 1;
            game.update += 1;
          }

          // If player selected "Join Game"
        } else if (input === "Join Game") {
          player.update += 1;
          player.setStatus("inputGameId", {
            question: "What is the id of the game you want to join?",
            type: "text",
            options: []
          });
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
          }
        } else {
          sendError(req, res, "Error starting game.");
          return;
        }
        break;

      case "pickTeamName":
        if (input && player && game) {
          player.setTeamName(game, input);
        }
        break;

      case "bidNow":
        player.setBid(input);
        var hand = game.hands[game.hands.length - 1];
        var nextBidderIndex = hand.findNextBidder(player.playerId);
        hand.nextBidder(nextBidderIndex);
        break;

      case "playNow":
        var justPlayed = 0;
        var hand = game.hands[game.hands.length - 1];
        var trick = hand.tricks[hand.tricks.length - 1];
        var cardsPlayed = trick.cardsPlayed.length;
        player.playCard(input, trick);
        break;

      case "allCardsPlayed":
        if (input === "nextTrick" || "Next Trick") {
          player.confirmPlay(game);
        }
        break;

      case "handOver":
        if (input === "Start Next Hand") {
          game.newHand();
        }
        break;
      /*
      case "gameOver":
        if (input === "New Game") {
          createGame(gameId, player.update + 1, player, input, [1,1]);
        } else {
          sendError(req, res, "Error starting game.");
          return;
        }
        break;
      */
      default:
        sendError(req, res, "Invalid game stage");
    }
    res.status(200);
    res.send("OK");
  } else {
    sendError(req, res, "Missing game stage");
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
