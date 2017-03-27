var gameId = "";

function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}

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

var newGame = function() {
  gameId = makeRandString(30);
  var game = {
    gameId: gameId
  }
  $.ajax({
      url: "/games/new/",
      data: game,
      success: function(data) {
        console.log("New Game Created: " + data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(err);
      }.bind(this)
  });
}

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
    this.state = {
      question: {
        exists: false,
        text: ""
      }
    }
  }

  render() {
    if (this.state.question.exists){
      var question = <Question text={this.state.question.text} />
    }
    
    
    return (
      <div>
        <Button text="Start Game" function={newGame} />
        <Button text="Select Teams" function={selectTeams} />
        <Button text="New Hand" />
        {question}
        <Messages url="/api/messages/" pollInterval={4000} />
      </div>
    )
  }
}

class Question extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      answer: ""
    };
  }
  handleChange(e) {
    this.setState({answer: e.target.value});
  }
  render() {
    var answer = this.state.answer;
    return(
      <div>
        <p>{this.props.text}</p>
        <input value={answer} onChange={this.handleChange} type="text" />
      </div>
    
    )
  }


}


class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true
    }
  }
  clicked(clickedFunction) {
    if (clickedFunction){
      clickedFunction();
    }
    this.setState({show: false})
  }
  render() {
    if (this.state.show){ 
      return(
        <button onClick={() => this.clicked(this.props.function)}>
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
    console.log("getMessages() from /api/messages/" + gameId);
    $.ajax({
      // 🚸 Change this to use this.props.url (also below in error logging)
      url: "/api/messages/" + gameId,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var messages;
        // ****
        console.log("Messages:");
        for (var d in data){
          if (d = "messages"){
            messages = data[d];
          }
          if (data[d].text){
            console.log(d + ": " + data[d].text);
          } else {
            console.log(d + ": " + data[d]);
          }
        }
        // ****
        if (messages) {
          this.setState({data: messages});
        } else {
          this.setState({data: [{
            "text": "Click to start.",
            "time": String(new Date())
            }]
          });              
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("/api/messages/" + gameId, status, err.toString(), xhr.toString());
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
    const messages = this.state.data.map((message) =>
      <li key={message.time}><Message message={message} /></li>                        
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