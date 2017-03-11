var Trick = require("./trick.js"); 

class Hand {
  constructor(handNumber, teams) {
    this.handNumber = handNumber;
    this.getBidOrder(handNumber, teams);
    this.spadesBroken = false;
    this.tricks = [];
    this.teams = teams;
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
      this.newTrick();
      trick = this.tricks[this.tricks.length - 1];
      console.log("\n👉 Trick " + (this.tricks.length) + ":");
      trick.announcePlayOrder();

      for (var p in trick.playOrder) {
        player = trick.playOrder[p];
        player.playCard(player.pickCard(), trick);
      }

      trick.decideWinner();
      console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");
      console.log(this.teams[0].name + " has taken " + this.teams[0].tricks + " tricks.");
      console.log(this.teams[1].name + " has taken " + this.teams[1].tricks + " tricks.");
    }
  }
}




module.exports = Hand;