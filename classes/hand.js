var Trick = require("./trick.js"); 

class Hand {
  constructor(handNumber, teams) {
    this.handNumber = handNumber;
    this.getBidOrder(handNumber, teams);
    this.spadesBroken = false;
    this.tricks = [];
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
}




module.exports = Hand;