var gameplay = function() {

  var Hand = require("./classes/hand.js");
  var Trick = require("./classes/trick.js");
  var Player = require("./classes/player.js");
  var Team = require("./classes/team.js");
  var Card = require("./classes/card.js");
  var Game = require("./classes/game.js");
  var Message = require("./classes/message.js");
  var game;

  var update = function (data, text) {
    var message = new Message(text);
    message.post(data);
  }

  newGame = function (data) {
    game = new Game();
    update(data, game.start());
  }
  
  newTeams = function (data, teamNames) {
    update(data, game.newTeams(teamNames));
  }

  newHand = function (data) {
    game.newHand();
  }
  
  return {
    update: update,
		newGame: newGame,
    newTeams: newTeams,
    newHand: newHand
	}
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
  