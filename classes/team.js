class Team {
  constructor(players, name) {
    this.name = name;
    this.players = players;
    for (var p in players) {
      players[p].team = this;
    }
    this.score = 0;
    this.tricks = 0;
    this.bags = 0;
    this.bid = [0, 0, 0];
  }
  
  getTeamBid() {
    var teammates = this.players;
    for (var p in teammates){
      var player = teammates[p];
      this.bid[p] = player.bid;
      this.bid[2] += player.bid;
    }
  }
}

module.exports = Team;