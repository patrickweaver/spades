var Trick = require("./trick.js");
var Card = require("./card.js");
var helpers = require("../helpers.js");
var Helpers = helpers();

class Hand {
  constructor(game) {
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
    console.log("Old Order: ");
    for (var p in game.bidOrder) {
      console.log(game.bidOrder[p].name);

    }
    game.bidOrder = this.rotateBid(game.bidOrder);
    console.log("New Order: ");
    for (var p in game.bidOrder) {
      console.log(game.bidOrder[p].name);
      console.log(game.bidOrder[p].handCards);
    }
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
      }
    }
    // 🚸 Add sorting of hands here. Maybe make this a loop.
  }

  rotateBid(order) {
    var newOrder = order.slice(1, 4);
    newOrder.push(order[0]);
    return newOrder;
  }

  /*
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
  */

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
