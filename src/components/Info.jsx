const React = require('react');

class Info extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="info">
        <div id="top-info">
          <ul>
            <li>
              <h4>♠︎ Spades!</h4>
            </li>
            <li>
              <h4>
                Name: {this.props.playerName}
              </h4>
            </li>
            <li>
              <h4>
                Player Id: {this.props.playerId}
                <a href={
                  "/api/game/" +
                  this.props.gameId +
                  "?playerId=" +
                  this.props.playerId +
                  "&update=" +
                  (this.props.update - 1)
                } target="_blank">
                  ✈️
                </a>
              </h4>
            </li>
            <li>
              <h4>
                Game Id: {this.props.gameId}
              </h4>
            </li>
            <li>
              <h4 id="show-more" onClick={this.props.showMoreInfo} >
                ⚙️
              </h4>
            </li>
          </ul>
        </div>
        <div id="other-info">
          <ul>
          <li>
            Update: {this.props.update}
          </li>
          <li>
            Stage: {this.props.stage}
          </li>
          </ul>      
        </div>
      </div>
    )
  }
}

module.exports = Info;