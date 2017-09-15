var Trick = require("./trick.js");
var Card = require("./card.js");
var helpers = require("../helpers.js");
var Helpers = helpers();

class Hand {
  constructor(game) {
    this.game = game;
    this.tricks = [];
    for (var t in game.teams) {
      for (var p in game.teams[t].players) {
        var player = game.teams[t].players[p];
        player.bid = 0;
        player.tricksTaken = 0;
        player.handCards = [];
      }
    }
    // this.deck
    this.createDeck();
    this.dealPlayers(game.teams);
    game.bidOrder = this.rotateBid(game.bidOrder);
  }

  createDeck() {
    var newDeck = [];
    var suits = ["♦︎", "♣︎", "♥︎", "♠︎"]
    var suitNames = ["diamonds", "clubs", "hearts", "spades"];;
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
    var fullValue = 1;
    for (var suit in suits) {
      for (var name in names) {
        newDeck.push(new Card(suits[suit], suitNames[suit], names[name], fullValue));
        fullValue += 1;
      }
    }
    var shuffledDeck = Helpers.shuffleArray(newDeck);
    var deckString = "";
    for (var card in shuffledDeck) {
      deckString += shuffledDeck[card].fullName + ", ";
    }
    this.deck = shuffledDeck;
  }

  dealPlayers(teams) {
    var c = 0;
    for (var p = 0; p < 2; p++){
      for (var t = 0; t < 2; t++){
        var playerHand = teams[t].players[p].handCards;
        playerHand = this.deck.slice(c, c + 13);
        var sortedHand = {
          diamonds: [],
          clubs: [],
          hearts: [],
          spades: []
        }

        c += 13;
        teams[t].players[p].handCards = playerHand.sort(
          function(a,b) {
            return a.fullValue - b.fullValue;
          }
        )
      }
    }
  }

  rotateBid(order) {
    var newOrder = order.slice(1, 4);
    newOrder.push(order[0]);
    return newOrder;
  }

  start() {
    for (var player in this.game.bidOrder) {
      this.game.bidOrder[player].setStatus("waitingToBid", {});
    }
    this.game.update += 1;
    this.nextBidder(0);
  }

  nextBidder(next) {
    // If not first bidder, change stage of previous bidder:
    if (next > 0) {
      var lastPlayer = this.game.bidOrder[next - 1]
      lastPlayer.stage = "waitingForAllBids";
      lastPlayer.prompt = {};
      this.game.update += 1;
    }
    // If less than the number of players, get player bid:
    if (next < 4){
      this.game.bidOrder[next].getBid();
      this.game.update += 1;
      // Make sure player has bid (0 bid is not nil):
      if (this.game.bidOrder[next].bid != 0) {
        this.nextBidder(next + 1);
      }
    // All players have bid, start first trick.
    } else {
      this.startTrick();
    }
  }

  startTrick() {
    if (this.tricks.length < 13) {
      this.tricks.push(new Trick(this));
      this.tricks[this.tricks.length - 1].start();
    }
  }
  
  carryBags() {
    for (var i = 0; i < 2; i++){
      if (this.bags > 9) {
        this.score -= 10;
        this.bags -= 10;
      }
    }
  }
  
  finish() {
    for (var t in this.game.teams) {
      var team = this.game.teams[t];
      if (typeof team.getTeamBid() === "number") {
      // Both players have non nil bids:
        var bid = team.getTeamBid();
        var tricksTaken = team.players[0].tricksTaken + team.players[1].tricksTaken;
        if (tricksTaken >= bid) {
        // Team made their bid:
          team.score += bid;
          team.bags += tricksTaken - bid;
          this.carryBags();
        } else {
        // Team did not make their bid:
          team.score -= bid;
        }      
      } else {
      // At least one player has a nil bid:
        for (var p in team.players) {
          var player = team.players[p];
          if (player.bid === "Nil") {
            if (player.tricksTaken === 0) {
            // Player made nil
              team.score += 10;
            } else {
            // Player did not make nil
              team.score -= 10;
            }
          } else {
            if (player.tricksTaken >= player.bid) {
            // Player made their bid
              team.score += player.bid;
              team.bags += player.tricksTaken - player.bid;
            } else {
            // Player did not make their bid:
              team.score -= player.bid;
            }
          }
        }   
      }     
    }
    for (var player in this.game.players) {
      this.game.players[player].setStatus("handOver", {});
    }
    this.game.update += 1;
  }
}




module.exports = Hand;
