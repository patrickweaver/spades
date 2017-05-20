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


// Routes:
app.get("/api/messages/", function(req, res) {
  console.log("URL: " + req.url);
  data = [{
    "messages": [{
      "text": "Click 'New Game' to start a new game, click 'Join Game' to join with a game id.",
      "time": String(new Date())
    }]
  }];
  res.status(200);
  res.send(data);
});

app.get("/api/:gameId/messages/", function(req, res) {
  var gameId = req.params.gameId;
  for (var g in games){
    // 🚸 Why is this for loop here? Why not just send games[0]?
    if (games[g].gameId === gameId){
      res.status(200);
      res.send([games[g]]);
    }
  }
})


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

app.get("/api/join/", function(req, res) {
  // 🚸 Frequetnly repeated check for gameId on req
  if (req.query.gameId) {
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
    sendError(req, res, "Can't join game, no gameId.");
  }
});

/*
  GET /api/start/
  Front end submits a 'Start Game' request.
  Check if there are 4 players.
  If not add robot players.
  Choose teams, then start the game.
*/

app.get("/api/start/", function(req, res) {
  if (req.query.gameId) {
    var gameId = req.query.gameId;
    var game = null;
    console.log("Starting game: " + gameId);
    for (var g in games) {
      if (gameId === games[g].gameId) {
        game = games[g];
        console.log("Found Game!");
        break;
      }
    }
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

app.get("/api/hand/", function(req, res) {
  console.log(req.query);
  if (req.query.gameId && req.query.playerId) {
    var gameId = req.query.gameId;
    var playerId = req.query.playerId;
    var game = null;
    var player = null;
    var foundGame = false;
    for (var g in games) {
      if (gameId === games[g].gameId) {
        game = games[g];
        foundGame = true;
        var foundPlayer = false;
        for (var p in game.players) {
          if (playerId === game.players[p].id) {
            player = game.players[p];
            res.status(200);
            var hand = {};
            hand.cards = player.hand;
            if (hand.cards){
              res.send(hand);
            } else {
              res.send({"cards": []});
            }
            
            foundPlayer = true;
          }
        }
        if (!foundPlayer) {
          sendError(req, res, {"error": "Can't find player."});
        }
      }
    }
    if (!foundGame) {
      sendError(req, res, {"error": "Can't find game."});
    }
  } else {
    sendError(req, res, {"error": "Can't find game, no gameId or playerId."});
  }
})




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


function sendError(req, res, errorMessage) {
  console.log("ERROR:");
  console.log(errorMessage);
  res.status(400);
  res.send(errorMessage);
}



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



