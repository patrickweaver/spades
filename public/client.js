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
  }
  
  componentDidMount() {
    setInterval(this.refreshData.bind(this), pollInterval);  
  }
  
  refreshData(){
    this.getData(this.setState.bind(this));
  }
  
  postData(dataToSend) {
    dataToSend["stage"] = this.state.stage;
    dataToSend["playerId"] = this.state.playerId;
    $.ajax({
      url: "/api/game/" + this.state.gameId,
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
        playerId: this.state.playerId,
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
    var postObject = {};
    if (typeof input === "string"){
      postObject = {
        input: input
      }
    } else {
      // Do client side logic based on input:
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
          // Submitting which button was pressed;
          postObject = {
            input: input["option"]
          }
          break;
      }      
    } 
    this.postData(postObject);
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
        <h3>
          Player Id: {this.props.playerId}
          <a href={
            "/api/game/" +
            this.props.gameId +
            "?playerId=" +
            this.props.playerId
          } target="_blank">
            ✈️
          </a>
        </h3>
        <h3>
          Game Id: {this.props.gameId}
          <a href={
            "/api/game/" +
            this.props.gameId
          }
          target="_blank">
            ✈️
          </a>
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
        <button key={index} onClick={() => this.props.onSubmitPrompt( {option} )} >{option}</button>  
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