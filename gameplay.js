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

  function newGame(gameId, playerId, type) {
    console.log("Gameplay.newGame()");
    var game = new Game(gameId, playerId, type);
    update(game, "Game Starting!");
    update(game, game.start());
    update(game, game.currentPlayers());
    return game;
  }
  
  function joinGame(game, playerId, type) {
    var updatedGame = game.addPlayer(playerId, type);
    // 🚸 Find a way to not send this message if the player is over the 4th and not added.
    update(game, "Added player " + playerId + " (" + type + ")");
    update(game, game.currentPlayers());
  }
  
  function startGame(game) {
    if (game.players.length < 4) {
      for (var p = game.players.length; p < 4; p++) {
        var playerId = makeRandString(10)
        joinGame(game, playerId, "bot");
      }
    }
    newTeams(game, ["Team 0", "Team 1"]);
    // 🚸 Fix frontend output of dealing hands
    newHand(game);
  }
  
  function newTeams(game, teamNames) {
    var m = game.newTeams(teamNames);
    update(game, m);
  }
  
  function getBids(game, hand, bidder){
    var player = hand.bidOrder[bidder];
    var bid = player.setBid();
    if (bid){
      update(game, player.name + " bids " + player.bid);
      if (bidder < 3) {
        (getBids(game, hand, bidder + 1))
      } else {
        announceBids(game);
        var trick = hand.nextTrick(hand.tricks.length);
        update(game, trick.announcePlayOrder());
        getCard(game, hand);
      }
      return;
    } else {
      (function checkBidAgain(game, hand, bidder) {
        setTimeout(function() {
          getBids(game, hand, bidder);
        }, 500);
      })(game, hand, bidder);
      return;
    }
  }
    
  function announceBids(game){
    for (var t in game.teams){
      var teamBid = game.teams[t].getTeamBid();
      update(game, "Team " + game.teams.name + " bids " + teamBid);
    }
  }

  function getCard(game, hand){
    var trick = hand.tricks[hand.tricks.length - 1];
    var cardsPlayed = trick.cardsPlayed.length;
    if (cardsPlayed < 4){
      var player = trick.playOrder[cardsPlayed];
      var card = player.playCard(trick);
      if (card){
        update(game, player.name + " plays " + trick.cardsPlayed[cardsPlayed][1].fullName);
        if (cardsPlayed < 3) {
          (getCard(game, hand));
        } else {
          // 🚸 Figure out what to do with winnner
        }
        return;
      } else {
        (function checkCardAgain(game, hand) {
          setTimeout(function() {
            getCard(game, hand);
          }, 500);
        })(game, hand);
      }
    }
    return;
  }
  
  

  function newHand(game) {
    var hands = game.newHand();
    var handNumber = game.hands.length;
    var hand = game.hands[game.hands.length - 1];
    var firstBid = hand.bidOrder[0];
    update(game, "Hand " + handNumber + " dealt. " + firstBid.name + " bids first.");
    getBids(game, hand, 0);
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
  