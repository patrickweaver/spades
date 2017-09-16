class Team {
  constructor(players) {
    this.players = players;
    this.name = "";
    this.score = 0;
    this.bags = 0;
    this.printableBid = "";
  } 

  getTeamBid() {
    var teammates = this.players;
    var teamBid = [];
    for (var player in teammates) {
      teamBid[player] = teammates[player].bid;
    }
    var printableBid;
    if (typeof teamBid[0] === "number" && typeof teamBid[1] === "number") {
      printableBid = teamBid[0] + teamBid[1];
    } else {
      printableBid = teamBid[0].toString() + " and " + teamBid[1].toString(); 
    } 
    return printableBid;
  }
  
  carryBags() {
    for (var i = 0; i < 2; i++){
      if (this.bags > 9) {
        this.score -= 10;
        this.bags -= 10;
      }
    }
  }
  
  getHandScore() {
    if (typeof this.getTeamBid() === "number") {
    // Both players have non nil bids:
      var bid = this.getTeamBid();
      var tricksTaken = this.players[0].tricksTaken + this.players[1].tricksTaken;
      if (tricksTaken >= bid) {
      // Team made their bid:
        this.score += bid;
        this.bags += tricksTaken - bid;
        this.carryBags();
      } else {
      // Team did not make their bid:
        this.score -= bid;
      }      
    } else {
    // At least one player has a nil bid:
      for (var p in this.players) {
        var player = this.players[p];
        if (player.bid === "Nil") {
          if (player.tricksTaken === 0) {
          // Player made nil
            this.score += 10;
          } else {
          // Player did not make nil
            this.score -= 10;
          }
        } else {
          if (player.tricksTaken >= player.bid) {
          // Player made their bid
            this.score += player.bid;
            this.bags += player.tricksTaken - player.bid;
          } else {
          // Player did not make their bid:
            this.score -= player.bid;
          }
        }
      }   
    }
    var gameOver = false;
    if (this.score >= 50) {
      gameOver = true;
    }
    return gameOver;
  }
  
  /*
  getTeamTricks() {
    var teammates = this.players;
    var teamTricks = 0;
    for (var player in teammates) {
      // ❗️ Tricks taken by a player with a Nil bid do not count toward team total.
      if (teammates[player].bid > 0){
        teamTricks += teammates[player].tricks;
      }
    }
    return teamTricks;
  }
  getTeamHandScore() {
    var teammates = this.players;
    var teamHandScore = 0;
    var teamHandBags = 0;
    // Calculate nil bids separately
    for (var p in teammates) {
      var player = teammates[p];
      if (player.bid === 0) {
        if (player.tricks === 0) {
          teamHandScore += 10;
        } else {
          teamHandScore -= 10;
        }
      // All non nil bids
      }
    }
    if (this.getTeamTricks() < this.getTeamBid()){
      teamHandScore -= this.getTeamBid();
    } else {
      teamHandScore += this.getTeamBid();
      teamHandBags += (this.getTeamTricks() - this.getTeamBid());
    }
    return [teamHandScore, teamHandBags];
  }
  updateScore() {
    this.score += this.getTeamHandScore()[0];
    this.bags += this.getTeamHandScore()[1];
  }

  */

}

module.exports = Team;
