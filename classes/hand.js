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
    deck.sort(function(a,b){
      return a.shuffle - b.shuffle;
    })
  }
  dealPlayers() {
    var c = 0;
    for (var p = 0; p < 2; p++){
      for (var t = 0; t < 2; t++){
        this.teams[t].players[p].hand = this.deck.slice(c, c + 13);
        c += 13;
      }
    }
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
  setBids(){
    for (var player in this.bidOrder) {
      this.bidOrder[player].setBid();
    }
  }
  playHand(){
    var trick;
    for (var t = 0; t < 13; t++){
      this.newTrick(trick);
      trick = this.tricks[this.tricks.length - 1];
      console.log("\n👉 Trick " + (this.tricks.length) + ":");
      trick.announcePlayOrder();

      for (var p in trick.playOrder) {
        var player = trick.playOrder[p];
        player.playCard(player.pickCard(trick));
      }

      trick.decideWinner();
      console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");
      console.log(this.teams[0].name + " has taken " + this.teams[0].getTeamTricks() + " tricks.");
      console.log(this.teams[1].name + " has taken " + this.teams[1].getTeamTricks() + " tricks.");
    }
  }
  logDeal(){
    console.log("\n🃏 Hands Dealt:");
    for (var player in this.bidOrder) {
      this.bidOrder[player].logHand();
    }
  }
  logBids(){
    console.log("\n📒 Bids:");
    for (var player in this.bidOrder) {
      console.log(this.bidOrder[player].name + " bids "+ this.bidOrder[player].bid);
    }
    console.log("- - -\n" + this.teams[0].name + "'s total bid is " + this.teams[0].getTeamBid());
    console.log(this.teams[1].name + "'s total bid is " + this.teams[1].getTeamBid());
  }
  logResult(){
    console.log("- - -\n" + this.teams[0].name + " got " + this.teams[0].getTeamHandScore()[0] + " points and " + this.teams[0].getTeamHandScore()[1] + " bags.");
    console.log(this.teams[1].name + " got " + this.teams[1].getTeamHandScore()[0] + " points and " + this.teams[1].getTeamHandScore()[1] + " bags.");
  }
}




module.exports = Hand;