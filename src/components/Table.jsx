const React = require('react');

const Card = require('./Card');
const Player = require('./Player');

class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    
    function getFlex(index) {
      var align;
      var justify;
      var left = "0px";

      if (index % 2 === 0) {
        justify = "center";
        if (index === 0) {
          align = "flex-end";
          left = "-20px";
        } else {
          align = "flex-start";
          left = "20px";
        }
      } else {
        align = "center";
        if (index === 1) {
          justify = "flex-start";
          
        } else {
          justify = "flex-end";
          
        }
      }
      
      return [align, justify, left];
    }
    
    function getCard(playerId, tricks) {
      if (tricks) {
        const lastTrick = tricks[tricks.length - 1];
        if (lastTrick){
          const cards = lastTrick.cardsPlayed;
          const players = lastTrick.playOrder;
          var index;
          for (var i in players) {
            if (players[i] === playerId) {
              return cards[i];
            }
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    function findSelfInTeam(playerId, teamInfo) {
      if (teamInfo && teamInfo.length === 2) {
        for (var i = 0; i < 2; i++) {
          for (var j = 0; j < 2; j++) {
            if (teamInfo[i].players[j].playerId === playerId) {
              return [i, j];
            }
          }
        }
        // This is here for when the player is not in the game
        return [0, 0];
      }
    }

    function findSelfInOrder(playerId, order) {
      if (order && order.length === 4) {
        for (var i = 0; i < 4; i++) {
          if (playerId === order[i]){
            return i;
          }
        }
        // This is here for when the player is not in the game
        return 0;
      }
    }
    
    function findLeftPlayer(order, orderIndex, teamIndex, teamInfo) {
      var leftPlayerId = order[(orderIndex + 1) % 4];
      var otherTeamIndex = teamIndex[0] * -1 + 1;
      /*
      console.log("findLeftPlayer:");
      console.log("orderIndex: " + orderIndex);
      console.log("teamIndex: " + teamIndex);
      console.log("leftPlayerId: " + leftPlayerId);
      console.log("otherTeamIndex: " + otherTeamIndex);
      */
      if (teamInfo[otherTeamIndex].players[0].playerId === leftPlayerId) {
        return [otherTeamIndex, 0];
      } else {
        return [otherTeamIndex, 1];
      }
    }
    
    function playersDisplayOrder(playerId, teamInfo, order) {
      // 🚸 Display Order does not represent play order,
      // it is to have the UI rotate correctly (upside down)
      var playersOrder = [];
      if (teamInfo && teamInfo.length === 2){
        var teamIndex = findSelfInTeam(playerId, teamInfo);
        var orderIndex = findSelfInOrder(playerId, order);
        var leftIndex = findLeftPlayer(order, orderIndex, teamIndex, teamInfo);

        // 🚸 Might need to use state.players instead of state.teamInfo, not sure yet
        playersOrder = [
          [teamInfo[teamIndex[0]].players[teamIndex[1]], teamInfo[teamIndex[0]]],
          [teamInfo[leftIndex[0]].players[leftIndex[1] * -1 + 1], teamInfo[leftIndex[0]]],
          [teamInfo[teamIndex[0]].players[teamIndex[1] * -1 + 1], teamInfo[teamIndex[0]]],
          [teamInfo[leftIndex[0]].players[leftIndex[1]], teamInfo[leftIndex[0]]]
        ];
      } else {
        console.log("FAIL: " + teamInfo.length);
      }
      if (playersOrder.length > 0){
        console.log("selfID: " + playersOrder[0][0].playerId);
      } else {
        console.log("No Players yet.");
      }
      return playersOrder;
    }
    
    function getWinner(tricks) {
      if (tricks && tricks.length > 0){
        var lastTrick = tricks[tricks.length - 1];
        if (lastTrick.winningCard) {
          return lastTrick.winningCard;
        } else {
          return false;
        }
      } else {
        return false;
      }    
    }

    if (this.props.hand && this.props.hand.tricks.length > 0) {                  
      const tricks = this.props.hand.tricks;   
    } else {
      const tricks = [];
    }
    
    var players = {};
    var playedCards = {};
    if (this.props.teamInfo && this.props.teamInfo.length === 2) {
      var p = playersDisplayOrder(this.props.playerId, this.props.teamInfo, this.props.bidOrder);
      for (var i = 0; i < 4; i++){
        players[i] = <Player player={p[i][0]} team={p[i][1]} />;
        playedCards[i] = <Card card={getCard(p[i][0].playerId, this.props.hand.tricks)} winner={getWinner(this.props.hand.tricks)} />;
      }   
    }
    
    var tableGrid = <table>
          <tbody>
            <tr>
              <td>{players[2]}</td>
              <td><div className="card-container">{playedCards[2]}</div></td>
              <td></td><td><div className="card-container">{playedCards[1]}</div></td>
              <td>{players[1]}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>{players[3]}</td>
              <td><div className="card-container">{playedCards[3]}</div></td>
              <td></td>
              <td><div className="card-container">{playedCards[0]}</div></td>
              <td>{players[0]}</td>
            </tr>
          </tbody>
        </table>;
   
    return (
      <div id="table">
        {tableGrid}
      </div>
    )
  }
}

module.exports = Table;