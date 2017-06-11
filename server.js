// init project
var express = require('express');
var app = express();
var gameplay = require("./gameplay.js");
var Gameplay = gameplay();
var data = [];
var games = [];

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
  data = {
    "messages": [{
      "text": "Click 'New Game' to start a new game, click 'Join Game' to join with a game id.",
      "time": String(new Date())
    }],
    "cards": [],
    "stage": "beforeStart"
  };
  res.status(200);
  res.send(data);
});

// 🚸 Might need to change this URL to make the routes more regular
// Get for messages, status and cards
app.get("/api/game/:gameId", function(req, res) {
  var gameId = req.params.gameId;
  var playerId = req.query.playerId;
  for (var g in games){
    // 🚸 Why is this for loop here? Why not just send games[0]?
    if (games[g].gameId === gameId){
      var game = games[g];
      var gameData = {};
      gameData.gameId = game.gameId;
      gameData.messages = game.messages;
      gameData.cards = [];
      gameData.players = game.players;
      if (playerId){
        var player;
        var foundPlayer = false;
        for (var p in game.players){
          if (game.players[p].id === playerId){
            foundPlayer = true;
            player = game.players[p];
            gameData.stage = player.stage;
            if (player.hand){
              gameData.cards = player.hand;
            }
            break;
          }
        }
        if (foundPlayer) {
          res.status(200);
          res.send(gameData);
        } else {
          sendError(req, res, {"error": "Can't find player."});
        }
      }
    }
  }
});

// 🚸 Should be POST for starting new game
app.get("/api/new/", function(req, res) {
  console.log("ReQ: !! /api/new/ !!");
  if (req.query.gameId) {
    var gameId = req.query.gameId;
    if (gameId.length === 30) {
      console.log("New Game Id: " + gameId);
      if (req.query.playerId){
        var playerId = req.query.playerId;
        console.log("First Player: " + playerId);
        games.push(Gameplay.newGame(gameId, playerId, "human"));
        res.status(200);
        res.send("OK");
      } else {
        sendError(req, res, "Invalid playerId.")
      }
    } else {
      sendError(req, res, "Invalid gameId.");
    }
  } else {
    sendError(req, res, "Invalid game start, please provide gameId.");
  }
});

// 🚸 Should be POST for joining game
app.get("/api/join/", function(req, res) {
  // 🚸 Frequetnly repeated check for gameId on req
  if (req.query.gameId && req.query.playerId) {
    var gameId = req.query.gameId;
    var game = null;
    console.log("Join request for game: " + gameId);
    // 🚸 Frequently repeated find game from game Id.
    for (var g in games) {
      if (gameId === games[g].gameId) {
        game = games[g];
        console.log("Found Game!");
        break;
      }
    }
    if (game) {
      Gameplay.joinGame(game, req.query.playerId, "human");
      res.status(200);
      res.send("OK");
    } else {
      sendError(req, res, "Can't join game, invalid gameId.");
    }
  } else {
    sendError(req, res, "Can't join game, no gameId or playerId.");
  }
});

/*
  🚸 Should be POST: /api/start/
*/

app.get("/api/start/", function(req, res) {
  if (req.query.gameId) {
    var gameId = req.query.gameId;
    console.log("Starting game: " + gameId);
    var game = findGame(gameId);
    if (game) {
      // 🚸 Need to make sure game can't start with more than 4 players either.
      Gameplay.startGame(game);
      res.status(200);
      res.send("OK");
    } else {
      sendError(req, res, "Can't join game, invalid gameId.");
    }
  } else {
    sendError(req, res, "Can't start game, no gameId.");
  }
});

// 🚸 Should be POST: /api/bid/

app.get("/api/bid/", function(req, res) {
  if (req.query.gameId && req.query.playerId && req.query.bid){
    var gameId = req.query.gameId;
    var playerId = req.query.playerId;
    var bid = req.query.bid;
    var game = findGame(gameId);
    if (game) {
      var player = findPlayer(game, playerId);
      if (player) {
        player.bid = parseInt(bid);
        res.status(200);
        res.send("OK");
      } else {
        sendError(req, res, "Can't bid, invalid playerId.");
      }
    } else {
      sendError(req, res, "Can't join game, invalid gameId.");
    }
  } else {
    sendError(req, res, "Can't join game, no gameId, playerId or bid.");
  }
});

app.get("/api/play/", function(req, res) {
  if (req.query.gameId && req.query.playerId && req.query.card){
    var gameId = req.query.gameId;
    var playerId = req.query.playerId;
    var card = req.query.card;
    var game = findGame(gameId);
    if (game) {
      var player = findPlayer(game, playerId);
      if (player) {
        player.card = card;
        res.status(200);
        res.send("OK");
      } else {
        sendError(req, res, "Can't play, invalid playerId.");
      }
    }
  } else {
    sendError(req, res, "Can't play card, no gameId, playerId, or card.")
  }
})

/*
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
    sendError(req, res, "Please select 2 team names.");
  }
});

app.get("/games/new-hand/", function(req, res) {
  Gameplay.newHand(data);
  res.status(200);
  res.send("New Hand!");
});
*/

function sendError(req, res, errorMessage) {
  console.log("API ERROR:");
  console.log(errorMessage);
  res.status(400);
  res.send(errorMessage);
}


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



