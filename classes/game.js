var Hand = require("./hand.js");
var Player = require("./player.js");
var Team = require("./team.js");
var helpers = require("../helpers.js");
var Helpers = helpers();

class Game {
  constructor(gameId, player) {
    this.update = player.update + 1;
    this.gameId = gameId;
    this.hands = [];
    this.players = [player];
    console.log("GAME CREATED: " + gameId);
  }

  addPlayer(player) {
    if (this.roomAtTable()){
      this.players.push(player);
      this.update += 1;
      player.addToGame(this);
      return true;
    } else {
      return false;
    }
  }

  roomAtTable(){
    if (this.players.length < 4) {
      return true;
    } else{
      return false;
    }
  }

  start() {
    console.log("Starting Game Id: " + this.gameId);
    this.addRobots();
    this.selectTeams();
    this.update += 1;
  }

  addRobots() {
    var robot = new Player(Helpers.makeRandString(10), Helpers.robotName(), "bot", this.gameId);
    if(this.addPlayer(robot)){
      this.addRobots();
    }
  }

  selectTeams() {
    var sides = Helpers.shuffleArray([0, 1, 2, 3]);
    var team0 = new Team([this.players[sides[0]], this.players[sides[1]]]);
    this.players[sides[0]].team = 0;
    this.players[sides[1]].team = 0;
    var team1 = new Team([this.players[sides[2]], this.players[sides[3]]]);
    this.players[sides[2]].team = 1;
    this.players[sides[3]].team = 1;
    this.teams = [team0, team1];
    this.getSeedBidOrder();
  }

  getSeedBidOrder() {
    var randomTeam = Math.floor(Math.random() * 2);
    var startTeam = this.teams[randomTeam];
    var otherTeam = this.teams[(randomTeam * -1) + 1];
    this.bidOrder = [
      startTeam.players[0],
      otherTeam.players[0],
      startTeam.players[1],
      otherTeam.players[1]
    ];
  }
  newHand() {
    this.hands.push(new Hand(this));
    this.hands[this.hands.length - 1].start();
    this.update += 1;
  }
  
}

module.exports = Game;
