var Hand = require("./hand.js");

class Game {
  constructor(teams) {
    this.teams = teams;
    this.hands = [];
    this.newHand();
  }
  
  newHand() {
    this.hands.push(new Hand(this.hands.length, this.teams));
  }
}

module.exports = Game;