playGame = function() {
  var Hand = require("./classes/hand.js");
  var Trick = require("./classes/trick.js");
  var Player = require("./classes/player.js");
  var Team = require("./classes/team.js");
  var Card = require("./classes/card.js");
  var Game = require("./classes/game.js");

  var game;
  var hand;
  var team0;
  var team1;
  game = new Game()

  var team0 = game.teams[0];
  var team1 = game.teams[1];
  var hand = game.hands[game.hands.length - 1];
  var deck = hand.deck;

  game.logStart();
  hand.dealPlayers();
  hand.logDeal();
  hand.setBids();
  hand.logBids();

  hand.playHand();

  hand.logResult();

  team0.updateScore();
  team1.updateScore();

  game.logEnd();
}

