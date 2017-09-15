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
