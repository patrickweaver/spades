function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}


/*
var selectTeams = function() {
  var teams = {
    team0: "WE ARE TEAM 0",
    team1: "Team 1 is best"
  }
  $.ajax({
      url: "/games/new-teams/",
      data: teams,
      success: function(data) {
        console.log("New Teams Created: " + data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(err);
      }.bind(this)
  });
}

*/



/*
var startGame2 = function() {
  var names = [
    "HAL", "C-3PO", "R2D2", "T-800", "T-1000", "The Iron Giant", "WALL-E", 
  ]
  gameId = makeRandString(30);
  console.log(gameId);
  var players = [];
  var game = {id: gameId};
  for (var g in game){
    console.log(g + ": " + game[g]);
  }
  $.ajax({
    url: "/games/new/",
    data: game,
    success: function(data) {
      console.log("New Teams Game Started: " + data);
    }.bind(this),
    error: function(xhr, status, err) {
      console.error(err);
    }.bind(this)
  });
  console.log("Start Game!");
  for (var n in names){
    console.log(n + ": " + names[n]);
  }
  this.setState({
    question: {  
      exists: true,
      text: "What is Team 1's name?"
    }
  });

}
  */

function App() {
  return (
    <div>
      <h1>Spades!</h1>
      <Interface />
    </div>
  );
}

class Interface extends React.Component {
  constructor(props) {
    super(props);
    this.joinGame = this.joinGame.bind(this);
    this.onChoice = this.onChoice.bind(this);
    this.state = {
      question: {
        exists: false,
        text: "",
        object: ""
      },
      stage: "beforeStart",
      gameId: "",
      playerId: makeRandString(10)
    }
  }
  onChoice(action) {
    if (action === "newGame"){
      this.newGame();
    } else if (action === "joinGame"){
      this.joinGame();
    }
  }
  
  newGame() {
    this.setState(
      {
        gameId: makeRandString(30)
      },
      this.sendNewGame
    );   
  }
  
  sendNewGame(){
    $.ajax({
        url: "/api/new/",
        data: {gameId: this.state.gameId, playerId: this.state.playerId},
        success: function(data) {
          console.log("New Game Created: " + data);
          this.setState({
            stage: "gameStarted"
          });
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(err);
        }.bind(this)
    });
  }
  
  joinGame() {
    this.setState({
      question: {
        exists: true,
        text: "Game Id:",
        object: "gameId",
        baseURL: "/api/join/"
      }
    }) 
  }
  
  updateGameId(gid) {
    //🚸 Use Data variable and update anything?
    this.setState({
      gameId: gid
    })
  }
  render() {
    if (this.state.question.exists){
      var question = <QuestionForm
        text={this.state.question.text}
        object={this.state.question.object}
        baseURL={this.state.question.baseURL}
        playerId={this.state.playerId}
        updateGameId={this.updateGameId.bind(this)} />
    }
    return (
      <div>
        <h3>Game: {this.state.gameId}</h3>
        <h4>Stage: {this.state.stage}</h4>
        <Choices stage={this.state.stage} onChoice={this.onChoice} />
        {question}
        <Messages url="/api/messages/" pollInterval={4000} gameId={this.state.gameId} />
      </div>
    )
  }
}


class Choices extends React.Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.state = {
      stage: this.props.stage
    }
  }
  handleButtonClick(action){
    this.props.onChoice(action)
  }

  render() {
    if (this.state.stage === "beforeStart"){
      return(
        <div>
          <GameButton text="New Game" action={"newGame"} onButtonClick={this.handleButtonClick} />
          <GameButton text="Join Game" action={"joinGame"} onButtonClick={this.handleButtonClick} />
        </div>
      )
    } else {
      return(
        <div>
        </div>
      )
    }
  }
}




/*
<Button text="Select Teams" function={selectTeams} />
<Button text="New Hand" />
*/


class GameButton extends React.Component {
  constructor(props) {
    super(props);
    this.clicked = this.clicked.bind(this);
    this.state = {
      show: true
    }
  }
  clicked(clickedFunction) {
    if (clickedFunction){
      clickedFunction(this.props.action);
    }
    this.setState({show: false})
  }
  render() {
    if (this.state.show){ 
      return(
        <button onClick={() => this.clicked(this.props.onButtonClick)}>
          {this.props.text}
        </button>
      )
    } else {
      return(
        <div>
        </div>
      );
    }
  }
}


class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answer: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    this.setState({answer: e.target.value});
  }
  handleSubmit(e) {
    //alert('An answer was submitted: ' + this.state.answer);
    e.preventDefault();
    var object = String(this.props.object);
    var data = { playerId: this.props.playerId };
    data[object] = this.state.answer;
    var url = this.props.baseURL;
    console.log("URL: " + url);
    $.ajax({
      url: url,
      data: data,
      success: function(data) {
        console.log("Question sent: " + data);
        if (object === "gameId"){
          this.props.updateGameId(this.state.answer);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("ERRRRRROR!");
        console.error(err);
      }.bind(this)
    });
  }
  
  render() {
    return(
      <form onSubmit={this.handleSubmit}>
        <label>{this.props.text}</label>
        <input value={this.state.answer} onChange={this.handleChange} type="text" />
        <input type="submit" value="submit" />
      </form>
    
    )
  }


}




class Message extends React.Component {
  constructor(props) {
    super(props);
  }
  formatDate() {
    var date = new Date(this.props.message.time);
    var time = "" + date.getHours() + ":" + date.getMinutes();
    return time;
  }
  escapeNewLines() {
    console.log("** ESCAPE! **");
    console.log(this.props.message.text);
    var newText = "<span>"
    newText += (this.props.message.text)
    console.log(newText);
    return newText;
  }
  render() {
    return (
      <div className="message">
        {nl2br(this.props.message.text)}
        <br />
        <span className="time">
          {this.formatDate()}
        </span>
      </div>
    );
  }
}

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.getMessages = this.getMessages.bind(this)
    this.state = {
      data:[
        {
          "text": "Loading . . .",
          "time": String(new Date())
        }
      ]
    }
  }
  
  getMessages() {
    console.log("getMessages() from /api/" + this.props.gameId + "/messages/");
    $.ajax({
      // 🚸 Change this to use this.props.url (also below in error logging)
      url: "/api/" + this.props.gameId + "/messages/",
      dataType: 'json',
      cache: false,
      success: function(data) {
        var game = data[0];
        var messages;
        // ****
        console.log("Messages:");
        for (var d in game){
          if (d = "messages"){
            messages = game[d];
          }
          if (game[d].text){
            console.log(d + ": " + game[d].text);
          } else {
            console.log(d + ": " + game[d]);
          }
        }
        // ****
        this.setState({data: messages});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("/api/" + gameId + "/messages/", status, err.toString(), xhr.toString());
      }.bind(this)
    });
  }
  componentDidMount() {
    //this.getMessages();
    //url = String(console.log(this.props.url));
    setInterval(this.getMessages, this.props.pollInterval);
  }
  componentWillUnmount() {

  }


  render() {
    const messages = this.state.data.map((message, index) =>
      <li key={index}><Message message={message} /></li>                        
    );
    return (
      <div className="messages">
        <ul>
          {messages}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);