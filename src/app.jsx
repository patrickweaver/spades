const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');

var pollInterval = 1000;
var gameIdLength = 4;
var botGameIdLength = 30;

function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //var characters = "abcdefghijklmnopqrstuvwxyz";
  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitPrompt = this.handleSubmitPrompt.bind(this);
    this.getData = this.getData.bind(this);
    this.state = {
      update: 0,
      gameUpdate: "",
      stage: "loading",
      gameId: "",
      playerId: makeRandString(10),
      playerName: "",
      trickNumber: 0,
      prompt: {
        question: "",
        type: "",
        options: []
      },
      handCards: [],
      players: [],
      team: {},
      teamInfo: []
    }
  }

  componentDidMount() {
    setInterval(this.refreshData.bind(this), pollInterval);
  }

  refreshData(){
    this.getData(this.setState.bind(this));
  }

  postData(dataToSend) {
    console.log("postData() -- start");
    dataToSend["stage"] = this.state.stage;
    // Don't add gameId if it was created in this step, it is already in this object.
    if (!dataToSend.gameId){
      dataToSend["gameId"] = this.state.gameId;
    }
    dataToSend["playerId"] = this.state.playerId;


    $.ajax({
      url: "/api/game/",
      data: dataToSend,
      method: "POST",
      success: function(data) {
        console.log("postData() -- success");
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("postData() Error:")
        console.error(err);
      }.bind(this)
    });
  }

  getData(callback) {
    console.log("getData() -- start");
    var gameIdAtStart = this.state.gameId;
    $.ajax({
      url: "/api/game/" + this.state.gameId,
      data: {
        update: this.state.update,
        playerId: this.state.playerId,
        playerName: this.state.playerName,
        stage: this.state.stage
      },
      dataType: "json",
      cache: false,
      success: function(data) {
        console.log("getData() -- success");
        if (gameIdAtStart === this.state.gameId){     
          callback(data);
        } else {
          this.getData(this.setState.bind(this));
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("getData() Error:")
        console.error("GameId: " + this.state.gameId, "PlayerId: " + this.state.playerId, status, err.toString(), xhr.toString());
      }.bind(this)
    });
  }

  handleSubmitPrompt(input) {
    console.log(input);
    console.log(typeof input);
    var postObject = {};
    if (typeof input === "string" || typeof input === "number"){
      postObject = {
        input: input.toString()
      }
      if (postObject.input === "") {
        return;
      }
    } else {
      switch(input["option"]){
          
        case "New Game":
        case "Bot Game":
          if (input["option"] === "Bot Game"){
            var gameId = makeRandString(botGameIdLength);
          } else {
            var gameId = makeRandString(gameIdLength);
          }
          
          this.setState({
            gameId: gameId
          });
          postObject = {
            input: input["option"],
            gameId: gameId,
            update: this.state.update
          }
          break;
          
 
        // Play a game with the same players:
        case "Start New Game":
          postObject.newGameId = makeRandString(gameIdLength);
          break;
  
        default:
          // "Start Game"
          // Submitting which button was pressed;
          postObject = {
            input: input["option"]
          }
          break;
      }
    }
    this.postData(postObject);
    this.setState({
      prompt: {
        question: "",
        type: "",
        options: []
      }
    });
  }
  
  illegalCard() {
    alert("Illegal Card!");
  }
  
  // 🚸 This should be merged with the same function in player.js
  isLegalCard(trick, handCards, card) {
    if (trick.cardsPlayed.length === 0) {
    // Player is leading trick:  
      if (trick.spadesBroken) {
      // Spades is broken:
        return true;
      } else {
      // Spades is not broken:
        if (card.suit != "♠︎") {
        // Card is not a spade
        // Player can legally lead any suit but spades:
            return true;
        } else {
        // Card is a spade
        // Player can only legally lead spades
        // if they only have spades:
          for (var c in handCards) {
            if (handCards[c].suit != "♠︎") {
            // Player has a non spade, playing spade
            // is illegal card
              return false;
            }
          }
          return true;
        }
      }     
    } else {
    // Player is not leading tick:
      var ledSuit = trick.cardsPlayed[0].suit;
      // Card suit matches ledSuit:
      if (card.suit === ledSuit) {
        return true;
      } else {
      // Card suit does not match ledSuit:  
        var hasLedSuit = false;
        for (var c in handCards) {
          if (handCards[c].suit === ledSuit) {
            hasLedSuit = true;
            break;
          }
        }
        if (hasLedSuit) {
        // But player has led suit in hand
        // Illegal card
          return false;
        } else { 
        // Player does not have led suit in hand
          if (handCards.length < 13) {
          // Any card is legal on 2nd to 13th tricks if
          // player doesn't have ledSuit
            return true;
          } else {
          // This is the 1st trick:
            if (card.suit != "♠︎") {
            // Any non-spade is legal on 1st trick if player
            // doesn't have led suit
              return true;
            } else {
            // Card is a spade, 1st trick
            // On 1st trick spades are only legal
            // if player only has spades:
              for (var c in handCards) {
                if (handCards[c].suit != "♠︎") {
                // Card is not a spade, illegal card
                  return false;
                }
              }
              return true;
            }
          }
        } 
      }
    }
    for (var i = 0; i > 100; i++) {
      console.log("ERROR: DID NOT RETURN");
    }
  }
  
  playCard(card) {
    if (this.state.stage === "playNow") {
      // 🚸 Define these
      var hand = this.state.hand;
      var lastTrick = hand.tricks[hand.tricks.length - 1];
      var handCards = this.state.handCards;
      var playedCard = handCards[card];
      if (this.isLegalCard(lastTrick, handCards, playedCard)) {
        handCards[card].played = true;
        this.setState({
          stage: "justPlayed",
          handCards: handCards
        });
        this.handleSubmitPrompt(card);
      } else {
        this.illegalCard();
      }
    }
  }
  
  showMoreInfo() {
    $( "#other-info" ).toggle();
    var infoHeight = $( "#game" ).css("top");
    var appHeight = $( document ).height();
    if (parseInt(infoHeight)/parseInt(appHeight) < .21) {
      $( "#game" ).css("top", "50%");
    } else {
      $( "#game" ).css("top", "20%");
    }
    
  }

  render() {
    var playerTeam = {
      teamName: "",
      teamBid: ""
    }
    if (this.state.teamInfo){
      var foundPlayer = false;
      for (var t in this.state.teamInfo) {
        var team = this.state.teamInfo[t];
        for (var p in team.players) {
          var player = team.players[p];
          if (player.playerId === this.state.playerId) {
            playerTeam = team;
            foundPlayer = true;
            break;
          }
        }
        if (foundPlayer) {
          break;
        }
      }
    }
    
    return (
      <div id="app">
        <Info
          update={this.state.update}
          stage={this.state.stage}
          gameId={this.state.gameId}
          playerId={this.state.playerId}
          playerName={this.state.playerName}
          showMoreInfo={this.showMoreInfo}
        />
        <Game
          stage={this.state.stage}
          players={this.state.players}
          playerId={this.state.playerId}
          hand={this.state.hand}
          trickNumber={this.state.trickNumber}
          onPlayCard={this.playCard.bind(this)}
          teamInfo={this.state.teamInfo}
          bidOrder={this.state.bidOrder}
          handCards={this.state.handCards}
          prompt={this.state.prompt}
          onSubmitPrompt={this.handleSubmitPrompt}
        />
      </div>
    )
  }
}



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

class Game extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="game">
        <Stats
          stage={this.props.stage}
          trickNumber={this.props.trickNumber}
          players={this.props.players}
          playerId={this.props.playerId}
          teamInfo={this.props.teamInfo}
          bidOrder={this.props.bidOrder}
          hand={this.props.hand}
        />
        <div id="table-hand-container">
          <Table
            stage={this.props.stage}
            trickNumber={this.props.trickNumber}
            players={this.props.players}
            playerId={this.props.playerId}
            teamInfo={this.props.teamInfo}
            bidOrder={this.props.bidOrder}
            hand={this.props.hand}
          />
          <Hand
            handCards={this.props.handCards}
            playCard={this.props.onPlayCard}
          />
        </div>
        <div id="prompt-container">
          <Prompt
            question={this.props.prompt.question}
            type={this.props.prompt.type}
            options={this.props.prompt.options}
            onSubmitPrompt={this.props.onSubmitPrompt}
          />
        </div>
      </div>
    )
  }
}

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

class Hand extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const handCards = this.props.handCards.map((card, index) =>
      <li key={index} >
        <div className="card-container">
          <Card
            card={card}
            onClickCard={() => this.props.playCard(index)}
          />
        </div>
      </li>
    )
    return (
      <div id="hand">
        <ul>
          {handCards}
        </ul>
      </div>
    )
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    if (this.props.winner && this.props.card && this.props.winner.fullName === this.props.card.fullName) {
      var winner = "winner";
    } else {
      var winner = "";
    }
    
    if (this.props.card){
      const legal = this.props.card.legal === false? "illegal" : "legal";
      const played = this.props.card.played ? "played-card" : "";
      
      return(
        <div
          className={"card c-" + this.props.card.fullName + " " + winner + " " + played}
          onClick={this.props.onClickCard}
        >
          <div className={"card-overlay"  + " " + legal}></div>
          <p
            className={"suit-" + this.props.card.suitName}
            
          >
            {this.props.card.fullName}
          </p>
        </div>
      )
    } else {
      return null;
    }
  }
}



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

class Prompt extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const submit =
      <button className="prompt-button"
        onClick={() => this.props.onSubmitPrompt( $( "#prompt-input" ).val() )}>
        &nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;
      </button>
    switch(this.props.type) {
    case "text":
      var options =
        <div>
          <input id="prompt-input" type="text" />
          <br/>
          {submit}
        </div>
      break;
        
    case "options":
      var options = this.props.options.map((option, index) =>
        <button
          className="prompt-button"
          key={index}
          onClick={() => this.props.onSubmitPrompt( {option} )}
        >{option}</button>
      );
      break;
                                             
    }
    
    var promptInput =
      <div id="options-container">
        {options}
      </div>
                                             

    return (
      <div id="prompt">
        <p>{this.props.question}</p>
        {promptInput}

      </div>
    )
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
