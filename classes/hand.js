var Trick = require("./trick.js");
var Card = require("./card.js");
var helpers = require("../helpers.js");
var Helpers = helpers();

class Hand {
  constructor(game) {
    this.game = game;
    this.spadesBroken = false;
    this.tricks = [];
    for (var t in game.teams){
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
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
    for (var suit in suits) {
      for (var name in names) {
        newDeck.push(new Card(suits[suit], names[name]));
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
        for (var i in playerHand) {
          var card = playerHand[i];
          switch (card.suit) {
            case "♦︎":
              sortedHand.diamonds.push(card);
              break;
            case "♣︎":
              sortedHand.clubs.push(card);
              break;
            case "♥︎":
              sortedHand.hearts.push(card);
              break;
            case "♠︎":
              sortedHand.spades.push(card);
              break;
          }
          // 🚸 Sort each section by card.value
          // 🚸 Concatenate each sorted suit back into hand array
          //playerHand =
        }
        c += 13;
        teams[t].players[p].handCards = playerHand;
      }
    }
    // 🚸 Add sorting of hands here. Maybe make this a loop.
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
    if (next > 0) {
      var lastPlayer = this.game.bidOrder[next - 1]
      lastPlayer.stage = "waitingForAllBids";
      lastPlayer.prompt = {};
      this.game.update += 1;
    }
    if (next < 4){
      this.game.bidOrder[next].getBid();
      this.game.update += 1;
      if (this.game.bidOrder[next].bid != 0) {
        this.nextBidder(next + 1);
      }
    } else {
      this.startPlay();
    }
  }

  startPlay() {
    this.tricks.push(new Trick(this));
    this.tricks[this.tricks.length - 1].start();
  }
}




module.exports = Hand;
