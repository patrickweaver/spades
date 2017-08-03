var pollInterval = 250;

function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}

function sendData(path, data, successLog, callback) {
  $.ajax({
    url: "/api/" + path + "/",
    data: data,
    success: function(data) {
      console.log(successLog + data);
    }.bind(this),
    error: function(xhr, status, err) {
      console.log("sendData() Error:")
      console.error(err);
    }.bind(this)
  });
}

function getData(state, callback) {
  console.log("getData() -- start");
  $.ajax({
    url: "/api/game/" + state.gameId,
    data: {
      playerId: state.playerId,
      stage: state.stage
    },
    dataType: "json",
    cache: false,
    success: function(data) {
      console.log("getData() -- success");
      callback(data);
    }.bind(this),
    error: function(xhr, status, err) {
      console.log("getData() Error:")
      console.error("GameId: " + state.gameId, "PlayerId: " + state.playerId, status, err.toString(), xhr.toString());
    }.bind(this)
  });
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      cards: [],
      players: []
    }
    this.refreshData();
  }
  
  handleSubmitPrompt(input) {
    alert(input);
  }
  
  refreshData(){
    getData(this.state, this.setState.bind(this));
  }
  
  render() {
    return (
      <div id="app">
        <Info
          stage={this.state.stage}
          gameId={this.state.gameId}
          playerId={this.state.playerId}
          playerName={this.state.playerName}
          trickNumber={this.state.trickNumber}
          prompt={this.state.prompt}
          onSubmitPrompt={this.handleSubmitPrompt}
        />
        <Game 
          cards={this.state.cards}
          players={this.state.players}
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
        <h3>Stage: {this.props.stage}</h3>
        <h3>Player Id: {this.props.playerId}</h3>
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
    if (this.props.type === "text"){
      var promptInput =
        <div>
          <input id="prompt-input" type="text" />
          <br/>
          <button
            onClick={() => this.props.onSubmitPrompt( $( "#prompt-input" ).val() )}>
            →
          </button>
        </div>
    } else {
      var promptInput = <p></p>
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
        <h1>Game</h1>
        <Table />
        <Hand />
      </div>
    )
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div id="table">
      
      </div>
    )
  }
}

class Hand extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div id="hand">
        <h2>Hand:</h2>
      </div>
    )
  }
}



ReactDOM.render(
  <App />,
  document.getElementById('root')
);