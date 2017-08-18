class Team {
  constructor(players) {
    this.players = players;
    this.score = 0;
    this.bags = 0;
    // 🚸 The team property of players property of team is used later in the pre-built logic,
    // but the recursiveness breaks the front end.
    /*
    for (var p in players) {
      players[p].team = this;
    }
    */
  }


  /*

  getTeamBid() {
    var teammates = this.players;
    var teamBid = 0;
    for (var player in teammates) {
      teamBid += teammates[player].bid;
    }
    return teamBid;
  }

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
