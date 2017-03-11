var Hand = require("./hand.js");
var Player = require("./player.js");
var Team = require("./team.js");

class Game {
  constructor() {
    this.hands = [];
    this.players = this.selectPlayers();
    this.teams = this.selectTeams();
    this.newHand();
  }
  selectPlayers() {
    var a = new Player("A");
    var b = new Player("B");
    var c = new Player("C");
    var d = new Player("D");

    return [a,b,c,d];
  }
  selectTeams() {
    var sides = [0, 1, 2, 3];
    var times = sides.length;
    for (var i = 0; i < times; i++) {
      sides.splice(sides.length, 0, sides.splice(Math.floor(Math.random() * sides.length - i), 1)[0]);
    }
    var team0 = new Team([this.players[sides[0]], this.players[sides[1]]], "Team 0");
    var team1 = new Team([this.players[sides[2]], this.players[sides[3]]], "Team 1");
    return [team0, team1];
  }
  newHand() {
    this.hands.push(new Hand(this.hands.length, this.teams));
  }
}

module.exports = Game;