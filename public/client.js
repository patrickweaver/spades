var pollInterval = 1250;

function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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
          var gameId = makeRandString(30);
          this.setState({
            gameId: gameId
          });
          postObject = {
            input: input["option"],
            gameId: gameId
          }
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
  
  nextTrick(){
    this.setState({
      stage: "waitingForNextTrick"
    });
    this.handleSubmitPrompt("nextTrick");
  }
  
  playCard(card) {
    if (this.state.stage === "playNow") {
      this.setState({
        stage: "justPlayed"
      });
      this.handleSubmitPrompt(card);
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
          prompt={this.state.prompt}
          onSubmitPrompt={this.handleSubmitPrompt}
          bid={this.state.bid}
          tricksTaken={this.state.tricksTaken}
        />
        <Game
          stage={this.state.stage}
          players={this.state.players}
          hand={this.state.hand}
          onPlayCard={this.playCard.bind(this)}
          nextTrick={this.nextTrick.bind(this)}
          teamInfo={this.state.teamInfo}
          handCards={this.state.handCards}
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
        <h1>Spades!</h1>
        <h3>Update: {this.props.update}</h3>
        <h3>GameUpdate: {this.props.gameUpdate}</h3>
        <h3>Stage: {this.props.stage}</h3>
        <h3>
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
        </h3>
        <h3>
          Game Id: {this.props.gameId}
        </h3>
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

class Prompt extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const submit =
      <button
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

class Game extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="game">
        <Table
          stage={this.props.stage}
          players={this.props.players}
          teamInfo={this.props.teamInfo}
          hand={this.props.hand}
          nextTrick={this.props.nextTrick}
        />
        <Hand
          handCards={this.props.handCards}
          playCard={this.props.onPlayCard}
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
        <h4>Bid: {team.teamBid}</h4>
        <ul>
          <li>{team.players[0].name} {team.players[0].bid == 0 ? "" : "bids " + team.players[0].bid + "  |  Tricks Taken: " + team.players[0].tricksTaken}</li>
          <li>{team.players[1].name} {team.players[1].bid == 0 ? "" : "bids " + team.players[1].bid + "  |  Tricks Taken: " + team.players[1].tricksTaken}</li>
        </ul>
      </li>                                       
    )
    
    var totalBid = 0;
    for (var p in this.props.players) {
      var playerBid = parseInt(this.props.players[p].bid)
      if (playerBid > 0 && playerBid < 14) {
        totalBid += playerBid;
      }
    }
    const players = this.props.players.map((player, index) =>
      <li key={index}>
        <Player player={player} />
      </li>
    )
    var spadesBroken;
    var trick;
    var winner;
    if (this.props.hand && this.props.hand.tricks.length > 0){
      const tricks = this.props.hand.tricks;
      const lastTrick = tricks[tricks.length - 1];
      if (lastTrick.cardsPlayed.length > 0) {
        trick = lastTrick.cardsPlayed.map((card, index) =>
          <li key={index}>                                        
            <Card card={card} />
          </li>
        );
      }
      if (lastTrick.spadesBroken) {
        spadesBroken = <span><strong>Spades Broken!</strong></span>;
      } else {
        spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
      }
      if (lastTrick.winner && this.props.stage === "allCardsPlayed") {
        winner =
        <div>
          <h3>
            Winner: {lastTrick.winner.name}
          </h3>
          <button onClick={this.props.nextTrick}>
            OK
          </button>
        </div>;
      }
    } else {
      const tricks = [];
      trick = false;
      winner = false;
      spadesBroken = <span>Spades <strong>NOT</strong> broken.</span>;
    }

    
    return (
      <div id="table">
        <ul id="teams-info">
          <li>
            <h2>Total Bid:</h2>
            <h4>{totalBid}</h4>
          </li>
          <li>
            <h2>{spadesBroken}</h2>
          </li>
          {teams}
        </ul>
        <ul id="players">
          {players}
        </ul>
        <ul id="trick">
          {trick}
        </ul>
        {winner}
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
      <li key={index} className={"card c-" + card.fullName}>
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
    return(
      <p
        className={"suit-" + this.props.card.suitName}
        onClick={this.props.onClickCard}
      >
        {this.props.card.fullName}
      </p>
    )
  }
}



class Player extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const handCards = this.props.player.handCards.map((card, index) =>
      <li key={index} className={"suit-" + card.suitName}>
        {card.fullName}
      </li>
    )
    return(
      <div>
        <ul className="player-info">
          <li>{this.props.player.name}</li>
          <li><ul className="players-hands">{handCards}</ul></li>
          <li>Bid: {this.props.player.bid}</li>
        </ul>
      </div>
    )
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
