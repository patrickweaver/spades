var Hand = require("./hand.js");
var Player = require("./player.js");
var Team = require("./team.js");
var gameplay = require("../gameplay.js");
var Gameplay = gameplay();

class Game {
  constructor(gameId, player) {
    this.update = 3;
    this.gameId = gameId;
    this.hands = [];
    this.players = [player];
    console.log("GAME CREATED: " + gameId);
  }
  
  addPlayer(player) {
    
    if (this.roomAtTable()){
      this.players.push(player);
      console.log("PLAYER ADDED: " + player.playerId);
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
  
  /*
  

  addRobots(){
    if(this.addPlayer(Gameplay.makeRandString(10), "bot")){
      this.addRobots();
    } else {
      console.log(this.players.length);
    }
  }
  
  
  
  start() {
    console.log("Starting Game Id: " + this.gameId);
    this.addRobots();
  }
    
  newTeams(teamNames) {
    this.teams = this.selectTeams(teamNames);
    return this.logTeams();
  }
  selectTeams(teamNames) {
    var sides = [0, 1, 2, 3];
    var times = sides.length;
    for (var i = 0; i < times; i++) {
      sides.splice(sides.length, 0, sides.splice(Math.floor(Math.random() * sides.length - i), 1)[0]);
    }
    var team0 = new Team([this.players[sides[0]], this.players[sides[1]]], teamNames[0]);
    var team1 = new Team([this.players[sides[2]], this.players[sides[3]]], teamNames[1]);
    return [team0, team1];
  }
  logTeams(){
    var message = "";
    var teams = this.teams;
    message += teams[0].name + ": " + teams[0].players[0].name + " and " + teams[0].players[1].name + ". Score is: " + teams[0].score;
    message += "\n" + teams[1].name + ": " + teams[1].players[0].name + " and " + teams[1].players[1].name + ". Score is: " + teams[1].score;
    return message;
  }
  
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