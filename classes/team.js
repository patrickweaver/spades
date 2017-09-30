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
      if (teammates[player].bid){
        teamBid[player] = teammates[player].bid;
      } else {
        teamBid[player] = "";
      }
    }
    var printableBid;
    if (typeof teamBid[0] != "Nil" && typeof teamBid[1] != "Nil") {
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
  
  updateAfterHand(goal) {
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
    if (this.score >= goal) {
      gameOver = true;
    }
    return gameOver;
  }

}

module.exports = Team;
