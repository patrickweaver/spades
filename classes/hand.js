var Trick = require("./trick.js"); 
var Card = require("./card.js");

class Hand {
  constructor(game) {
    var handNumber = game.hands.length;
    var teams = game.teams;
    
    this.handNumber = handNumber;
    this.deck = this.createDeck();
    this.getBidOrder(handNumber, teams);
    this.spadesBroken = false;
    this.tricks = [];
    this.teams = teams;
    for (var t in teams){
      teams[t].score = 0;
      teams[t].bags = 0;
      // 🚸 Have to figure out how to cycle through players without circular json
      for (var p in game.players){
        var player = game.players[p];
        var team;
        for (var t in game.teams){
          for (var s in game.teams[t].players){
            if (player = game.teams[t].players[s]){
              team = game.teams[t];
              break;
            }
          }
        }
        console.log("**** On new Hand " + player.name + " from team " + team + "'s bid is " + player.bid);
        
        player.bid = 0;
        player.tricks = 0;
        player.hand = [];
      }
    }
    this.dealPlayers();
    this.logDeal();
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
  addToBidOrder(bidOrder, player){
    bidOrder.push(player);
    player.bid = 0;
  }
  
  
  getBidOrder(handNumber, teams) {
    var bidOrder = [];
    var turn = handNumber % 4;
    var team = turn % 2;
    var partner = Math.floor(turn/2);
    console.log("TEAM: " + team);
    console.log("PARTNER: " + partner);
    
    // 🚸 This is dumb, should be a loop.
    
    this.addToBidOrder(bidOrder, teams[team].players[partner]);
    teams[team].players[partner].stage = "bidding";
    
    this.addToBidOrder(bidOrder, teams[1 - team].players[partner]);
    teams[1 - team].players[partner].stage = "waitingToBid";
    
    this.addToBidOrder(bidOrder, teams[team].players[1 - partner]);
    teams[team].players[1 - partner].stage = "waitingToBid";
    
    this.addToBidOrder(bidOrder, teams[1 - team].players[1 - partner]);
    teams[1 - team].players[1 - partner].stage = "waitingToBid";
    
    this.bidOrder = bidOrder;
  }
  setBids(bidder){
    var bid = this.bidOrder[bidder].setBid(bidder);
  }
  
  /*
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
  */
  
  nextTrick(){
    // 🚸 This is making bots play undefined cards
    var lastTrick = false;
    if (this.tricks.length > 0) {
      lastTrick = this.tricks[this.tricks.length - 1];
    }
    this.tricks.push(new Trick(this, lastTrick)); 
    return this.tricks[this.tricks.length - 1];
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
    // 🚸 Add info about nils
    console.log("- - -");
    for (var t in this.teams){
      var team = this.teams[t];
      console.log(team.name + " took " + team.getTeamTricks() + " tricks on a bid of " + team.getTeamBid() + ".");
      console.log(team.name + " gets " + this.teams[t].getTeamHandScore()[0] + " points and " + this.teams[t].getTeamHandScore()[1] + " bags.");
    }
  }
  end() {
    
  }
  logEnd(){
    console.log("- - -");
    console.log("After " + (this.handNumber + 1) + " hands:");
    console.log(this.teams[0].name + "'s score is " + this.teams[0].score + this.teams[0].bags);
    console.log(this.teams[1].name + "'s score is " + this.teams[1].score + this.teams[1].bags);
  }
}




module.exports = Hand;