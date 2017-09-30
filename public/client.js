var pollInterval = 1250;
var gameIdLength = 4;

function makeRandString(stringLength) {
  var randString = "";
  //var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var characters = "abcdefghijklmnopqrstuvwxyz";
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
  
  checkCard(trick, handCards, card) {
    alert("Check!");
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
        callback(data);
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
     } else {
      switch(input["option"]){
        case "New Game":
          var gameId = makeRandString(gameIdLength);
          postObject = {
            input: input["option"],
            gameId: gameId,
            update: this.state.update
          }
          this.setState({
            gameId: gameId
          });
          break;
          
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
        this.setState({
          stage: "justPlayed"
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
          gameUpdate={this.state.gameUpdate}
          stage={this.state.stage}
          gameId={this.state.gameId}
          playerId={this.state.playerId}
          playerName={this.state.playerName}
          playerTeam={playerTeam}
          trickNumber={this.state.trickNumber}
          bid={this.state.bid}
          tricksTaken={this.state.tricksTaken}
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
              <h1>Spades!</h1>
            </li>
            <li>
              <h4>
                Player Id: {this.props.playerId}&nbsp;
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
          <h3>Update: {this.props.update}</h3>
          <h3>GameUpdate: {this.props.gameUpdate}</h3>
          <h3>Stage: {this.props.stage}</h3>

          <h3>
            Team Name: {this.props.playerTeam.teamName}
          </h3>
          <h3>
            Bid: {this.props.bid}
          </h3>
          <h3>
            Team Bid: {this.props.playerTeam.teamBid}
          </h3>
          <h3>
            Tricks Taken: {this.props.tricksTaken}
          </h3>
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
        <Prompt
          question={this.props.prompt.question}
          type={this.props.prompt.type}
          options={this.props.prompt.options}
          onSubmitPrompt={this.props.onSubmitPrompt}
        />
      </div>
    )
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    
    const teams = this.props.teamInfo.map((team, index) =>
      <li key={index}>
        <h2>Team {team.teamName}</h2>
        <h3>Score: {team.score[0] === "0" ? team.score[1] : team.score}{team.bags}</h3>
        <h4>Bid: {team.teamBid}&nbsp;&nbsp;&nbsp;&nbsp;Tricks Taken: {
          team.players[0].bid < 14 && team.players[1].bid < 14 ?
          team.players[0].tricksTaken + team.players[1].tricksTaken :
          team.players[0].tricksTaken + " and " + team.players[1].tricksTaken
        }</h4>
        <ul>
          <li>
            <strong>
              {team.players[0].name}
            </strong>
            {
              team.players[0].bid == 0 ?
              "":
              "  |  Bid: " + team.players[0].bid + "  |  Tricks Taken: " + team.players[0].tricksTaken
            }
          </li>
          <li>
            <strong>
              {team.players[1].name}
            </strong>
            {
              team.players[1].bid == 0 ?
              "" :
              "  |  Bid: " + team.players[1].bid + "  |  Tricks Taken: " + team.players[1].tricksTaken
            }
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
    
    function getFlex(index) {
      var align;
      var justify;
      var left = "0px";

      if (index % 2 === 0) {
        justify = "center";
        if (index === 0) {
          align = "flex-end";
          left = "-50px";
        } else {
          align = "flex-start";
          left = "50px";
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
      //if (this.props.hand && this.props.hand.tricks.length > 0){
        //const tricks = this.props.hand.tricks;
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
      }
    }
    
    function findSelfInOrder(playerId, order) {
      if (order && order.length === 4) {
        for (var i = 0; i < 4; i++) {
          if (playerId === order[i]){
            return i;
          }
        }
      }
    }
    
    function findLeftPlayer(order, orderIndex, teamIndex, teamInfo) {
      var leftPlayerId = order[(orderIndex + 1) % 4];
      var otherTeamIndex = teamIndex[0] * -1 + 1;
      console.log("findLeftPlayer:");
      console.log("orderIndex: " + orderIndex);
      console.log("teamIndex: " + teamIndex);
      console.log("leftPlayerId: " + leftPlayerId);
      console.log("otherTeamIndex: " + otherTeamIndex);
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
          teamInfo[teamIndex[0]].players[teamIndex[1]],
          teamInfo[leftIndex[0]].players[leftIndex[1] * -1 + 1],
          teamInfo[teamIndex[0]].players[teamIndex[1] * -1 + 1],
          teamInfo[leftIndex[0]].players[leftIndex[1]] 
        ];
      } else {
        console.log("FAIL: " + teamInfo.length);
      }
      if (playersOrder.length > 0){
        console.log("selfID: " + playersOrder[0].playerId);
      } else {
        console.log("No Players yet.");
      }
      return playersOrder;
    }
    
    function getWinner (tricks) {
      if (tricks.length > 0){
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
    
    var players;
    if (this.props.teamInfo && this.props.teamInfo.length === 2) {
      players = playersDisplayOrder(this.props.playerId, this.props.teamInfo, this.props.bidOrder).map((player, index) =>

        <li key={index} style={{alignSelf: getFlex(index)[0], justifySelf: getFlex(index)[1], order: index === 1 ? 1 : index * -1, left: getFlex(index)[2]}}>
          <Player id={"player-" + index} player={player} index={index} />
          <h4>align: {getFlex(index)[0]}</h4>
          <h4>justify: {getFlex(index)[1]}</h4>
          <div>
            <Card
              card={getCard(player.playerId, this.props.hand.tricks)}
              winner={getWinner(this.props.hand.tricks)}
            />
          </div>
        </li>
      )
    } else {
      players = this.props.players.map((player, index) =>
        <li key={index}>                                      
          <Player id={"player-" + index} player={player} index={index} />
        </li>
      )
    }
    
    
    
    var ledSuit;
    var spadesBroken;
    var trick;
    var winner;
    if (this.props.hand && this.props.hand.tricks.length > 0) {                  
      const tricks = this.props.hand.tricks;
      const lastTrick = tricks[tricks.length - 1];
      if (lastTrick.cardsPlayed.length > 0) {
        ledSuit = lastTrick.cardsPlayed[0].suit;                  
      }
      if (lastTrick.spadesBroken) {
        spadesBroken = <span><strong>Spades Broken!</strong></span>;
      } else {
        spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
      }
    } else {
      const tricks = [];
      spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
    }

    
    return (
      <div id="table">
        <ul id="teams-info">
          <li>
            <h2>Total Bids:</h2>
            <h4>{totalBid}</h4>
          </li>
          <li>
            <h2>{spadesBroken}</h2>
            <h4>Trick Number: {this.props.trickNumber}</h4>
          </li>
          <br />
          {teams}
        </ul>
        <h3>ME: {findSelfInTeam(this.props.playerId, this.props.teamInfo)}</h3>
        <h3>Led Suit: {ledSuit ? ledSuit : ""}</h3>
        <ul id="players">
          {players}
        </ul>
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
        <Card
          card={card}
          onClickCard={() => this.props.playCard(index)}
        />
      </li>
    )
    return (
      <div id="hand">
        <h2>Hand:</h2>
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
      return(
        <div
          className={"card c-" + this.props.card.fullName + " " + winner}
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
    return(
      <div>
        <ul className="player-info">
          <li>
            {this.props.player.name} | {this.props.index}
            <br / >
            Bid: {this.props.player.bid}
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
        →
      </button>
    switch(this.props.type) {
    case "text":
      var promptInput =
        <div>
          <input id="prompt-input" type="text" />
          <br/>
          {submit}
        </div>
      break;
    case "options":
      const options = this.props.options.map((option, index) =>
        <button
          className="prompt-button"
          key={index}
          onClick={() => this.props.onSubmitPrompt( {option} )}
        >{option}</button>
      );
      var promptInput =
        <div>
          {options}
        </div>
      break;
    }

    return (
      <div id="prompt">
        <h2>Prompt:</h2>
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
