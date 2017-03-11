class Team {
  constructor(players, name) {
    this.name = name;
    this.players = players;
    for (var p in players) {
      players[p].team = this;
    }
    this.score = 0;
    this.bags = 0;
  }
  
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
    for (var p in teammates) {
      var player = teammates[p];
      if (player.bid === 0) {
        if (player.tricks === 0) {
          teamHandScore += 10;
        } else {
          teamHandScore -= 10;
        }
      } else {
        if (player.tricks < player.bid) {
          teamHandScore -= player.bid;
        } else {
          teamHandScore += player.bid;
          teamHandBags += (player.tricks - player.bid);
        }
      }
    }
    return [teamHandScore, teamHandBags];
  }
  updateScore() {
    var handScore = this.getTeamHandScore();
    this.score += handScore[0];
    this.bags += handScore[1];
  }
  
}

module.exports = Team;