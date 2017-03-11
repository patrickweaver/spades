var Trick = require("./trick.js"); 
var Card = require("./card.js");

class Hand {
  constructor(handNumber, teams) {
    this.handNumber = handNumber;
    this.deck = this.createDeck();
    this.getBidOrder(handNumber, teams);
    this.spadesBroken = false;
    this.tricks = [];
    this.teams = teams;
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
    this.shuffleDeck(newDeck);
    return newDeck;
  }
  shuffleDeck(deck) {
    for (var i = 0; i < 52; i++) {
     deck.splice(52, 0, deck.splice(Math.floor(Math.random() * 52 - i), 1)[0]);
    }
  }
  dealPlayers() {
    this.teams[0].players[0].hand = this.deck.slice(0, 13);
    this.teams[1].players[0].hand = this.deck.slice(13, 26);
    this.teams[0].players[1].hand = this.deck.slice(26, 39);
    this.teams[1].players[1].hand = this.deck.slice(39, 52);
    // 🚸 Add sorting of hands here. Maybe make this a loop.
  }
  getBidOrder(handNumber, teams) {
    var bidOrder = [];
    var turn = handNumber % 4;
    var team = turn % 2;
    var partner = Math.floor(turn/2);
    bidOrder.push(teams[team].players[partner]);
    bidOrder.push(teams[team = 1 - team].players[partner]);
    bidOrder.push(teams[team = 1 - team].players[partner = 1 - partner]);
    bidOrder.push(teams[team = 1 - team].players[partner]);
    this.bidOrder = bidOrder;
  }
  newTrick(lastTrick) {
    var nextTrick = this.tricks.push(new Trick(this, lastTrick));
    return nextTrick;
  }
  playHand(){
    var trick;
    for (var t = 0; t < 13; t++){
      this.newTrick(trick);
      trick = this.tricks[this.tricks.length - 1];
      console.log("\n👉 Trick " + (this.tricks.length) + ":");
      trick.announcePlayOrder();

      for (var p in trick.playOrder) {
        player = trick.playOrder[p];
        player.playCard(player.pickCard(trick));
      }

      trick.decideWinner();
      console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");
      console.log(this.teams[0].name + " has taken " + this.teams[0].getTeamTricks() + " tricks.");
      console.log(this.teams[1].name + " has taken " + this.teams[1].getTeamTricks() + " tricks.");
    }
  }
}




module.exports = Hand;