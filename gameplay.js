var gameplay = function() {

  var Hand = require("./classes/hand.js");
  var Trick = require("./classes/trick.js");
  var Player = require("./classes/player.js");
  var Team = require("./classes/team.js");
  var Card = require("./classes/card.js");
  var Game = require("./classes/game.js");
  var Message = require("./classes/message.js");

  function update(game, text) {
    var message = new Message(text);
    message.post(game);
  }

  function newGame(gameId, playerId) {
    console.log("Gameplay.newGame()");
    var game = new Game(gameId, playerId);
    update(game, "Game Starting!");
    update(game, game.start());
    update(game, game.currentPlayers());
    return game;
  }
  
  function joinGame(game, playerId) {
    var updatedGame = game.addPlayer(playerId);
    update(game, "Added player " + playerId);
    update(game, game.currentPlayers());
  }
  
  function startGame(game) {
    if (game.players.length < 4) {
      for (var p = game.players.length; p < 4; p++) {
        var playerId = makeRandString(10)
        joinGame(game, playerId);
      }
    }
    newTeams(game, ["Team 0", "Team 1"]);
    // 🚸 Fix frontend output of dealing hands
    update(game, JSON.stringify(newHand(game)));
  }
  
  function newTeams(game, teamNames) {
    var m = game.newTeams(teamNames);
    update(game, m);
  }

  function newHand(game) {
    var hands = game.newHand();
    update(game, hands);
  }
  
  return {
    update: update,
		newGame: newGame,
    joinGame: joinGame,
    startGame: startGame,
    newTeams: newTeams,
    newHand: newHand

	}
}


// Move below to helpers file:


// Figure out how to use the public version of this function
function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}

module.exports = gameplay;



  /*
  
    //var team0 = game.teams[0];
    //var team1 = game.teams[1];
  
  
  game.newHand();
  var hand = game.hands[game.hands.length - 1];
  hand.setBids();
  hand.logBids();

  hand.playHand();

  hand.logResult();

  team0.updateScore();
  team1.updateScore();
  hand.logEnd();
  game.checkIfOver();
  */
  