const React = require('react');

class Stats extends React.Component {
  constructor(props) {
    super(props);
  }
  
  getTeamBid(team) {
    var p0 = team.players[0];
    var p1 = team.players[1];
    if (p0.bid && p1.bid) {
      if (p0.bid < 14 && p1.bid < 14) {
        var tricks = p0.tricksTaken + p1.tricksTaken;
        var bids = p0.bid + p1.bid;
        return "Tricks: " + tricks + "/" + bids;
      } else {
        return "Tricks: " + p0.tricksTaken + "/" + p0.bid + " and " + p1.tricksTaken + "/" + p1.bid;
      }
    } else {
      return "";
    }
  }
  
  render() {
    
    
    
    const teams = this.props.teamInfo.map((team, index) =>
      <li key={index} style={{border: "5px solid " + team.teamColor}}>
        <h4>{team.teamName}</h4>
        <h4>Score: {team.score[0] === "0" ? team.score[1] : team.score}{team.bags}</h4>
        <h4>{this.getTeamBid(team)}</h4>
        <ul>
          <li>
            <h6>
              {team.players[0].name}
            </h6>
          </li>
          <li>
            <h6>
              {team.players[1].name}
            </h6>
          </li>
        </ul>
      </li>                                       
    )
    
    var totalBid = 0;
    for (var t in this.props.teamInfo) {
      var bidTeam = this.props.teamInfo[t];
      for (var p in bidTeam.players) {
        var playerBid = parseInt(bidTeam.players[p].bid);
        console.log("Total Bid: " + totalBid + "    Player Bid: " + playerBid);
        if (playerBid > 0 && playerBid < 14) {
          totalBid += playerBid;
        }
      }
    }
    
    var spadesBroken;
    if (this.props.hand && this.props.hand.tricks.length > 0) {                  
      const tricks = this.props.hand.tricks;
      const lastTrick = tricks[tricks.length - 1];
      if (lastTrick.spadesBroken) {
        spadesBroken = <span><strong>Spades Broken!</strong></span>;
      } else {
        spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
      }
    } else {
      spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
    }
    
    
    
    return(
      <div id="stats">
        <ul id="teams-info">
          {teams}
          <li>
            <h4>Trick: {this.props.trickNumber}</h4>
            <h4>Total Bid: {totalBid}</h4>
            <h4>{spadesBroken}</h4> 
          </li>
        </ul>
      </div>
    )
  }
  
}

module.exports = Stats;