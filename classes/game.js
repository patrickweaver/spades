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
  }
  
  /*
  

  
  
  
  
  
    


  
  newHand() {
    this.hands.push(new Hand(this));
    return this.hands;
  }
  
  
  
  checkIfOver(){
    if (false){
      this.logEnd();
    }
  }
  logEnd(){
    // 🚸 Change this to final results
    console.log("- - -");
    console.log(this.teams[0].name + "'s score is " + this.teams[0].score + this.teams[0].bags);
    console.log(this.teams[1].name + "'s score is " + this.teams[1].score + this.teams[1].bags);
  }
  */
}

module.exports = Game;