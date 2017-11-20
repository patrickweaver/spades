var Hand = require("./hand.js");
var Player = require("./player.js");
var Team = require("./team.js");
var helpers = require("../helpers.js")();

class Game {
  constructor(gameId, update, gameInGames) {
    console.log("👁 Update at game start: ");
    console.log(update);
    console.log(typeof update);
    this.update = update;
    this.gameId = gameId;
    this.goal = 50;
    this.hands = [];
    this.players = [];
    this.humans = 0;
    this.bidOrder = [];
    this.strictScoring = false;
    this.over = false;
    this.gameInGames = [gameInGames[0], gameInGames[1]];
    this.winningTeam = null;
    console.log("GAME CREATED: " + gameId + ", " + gameInGames[0] + " of " + gameInGames[1]);
  }

  addPlayer(player) {
    for (var p in this.players) {
      if (player.name === this.players[p].name) {
        player.name = player.name + " 2";
      }
    }
    if (this.roomAtTable()){
      this.players.push(player);
      if (player.type === "human") {
        this.humans += 1;
        this.strictScoring = false;
      }
      this.update += 1;
      player.addedToGame(this);
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
    this.addRobots();
    this.selectTeams();

    // Then have players select team name:
    for (var i in this.players) {
      var player = this.players[i];
      if (player.type === "human") {
        player.stage = "pickTeamName";
        player.prompt = {
          question: "Pick one word to include in your team name:",
          type: "options",
          options: helpers.teamNameChoices()
        }
      } else {
        player.setTeamName(this, helpers.teamNameChoices()[0]);
      }
    }
    this.update += 1;
  }

  addRobots() {
    var robot = new Player(helpers.makeRandString(10), helpers.robotName(), "bot", this.gameId);
    if(this.addPlayer(robot)){
      this.addRobots();
    }
  }

  selectTeams() {
    var sides = helpers.shuffleArray([0, 1, 2, 3]);
    var team0 = new Team([this.players[sides[0]], this.players[sides[1]]], 0);
    this.players[sides[0]].team = 0;
    this.players[sides[1]].team = 0;
    var team1 = new Team([this.players[sides[2]], this.players[sides[3]]], 1);
    this.players[sides[2]].team = 1;
    this.players[sides[3]].team = 1;
    this.teams = [team0, team1];
    // After slecting teams randomize bid order:
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
    console.log(" 😎 NEW HAND");
    console.log(this.update);
    console.log(typeof this.update);
    this.hands.push(new Hand(this));
    this.hands[this.hands.length - 1].start();
    this.update += 1;
  }

  currentHand() {
    return this.hands[this.hands.length - 1];
  }

  finish() {
    console.log(this.winningTeam.name + " wins with " + this.winningTeam.score + this.winningTeam.bags);
    // Identify winning team:
    for (var t in this.teams) {
      var team = this.teams[t];
      var winner = false;
      if (team === this.winningTeam) {
        winner = true;
      }

      for (var p in team.players) {
        var player = team.players[p];

        var postData = {
          gameId: this.gameId,
          playerId: player.playerId,
          finalScore: team.score,
          finalBags: team.bags,
          winner: winner
        }
        // Send data on winners/losers
        helpers.sendToBot("final-score", postData, false);
      }
      // Set all players to status "gameOver" with option "New Game"
      for (var player in this.players) {
        this.players[player].setStatus("gameOver", {
          question: "Game Over! " + this.winningTeam.name + " wins!",
          type: "options",
          options: ["New Game"]
        });
      }
      this.over = true;
    }



  }

}

module.exports = Game;
