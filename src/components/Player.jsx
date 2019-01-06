const React = require('react');

class Player extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    
    const displayBid = !this.props.player.bid || this.props.player.bid === 0 ? "" : this.props.player.tricksTaken + "/" + this.props.player.bid;
    
    return(
      <div style={{border: "3px solid " + this.props.team.teamColor}}>
        <ul className="player-info">
          <li>
            {this.props.player.name}
            <br />
            {displayBid}
          </li>
        </ul>
      </div>
    )
  }
}

module.exports = Player;