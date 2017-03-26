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
        console.err(err);
      }.bind(this)
  });
}

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
    this.startGame = this.startGame.bind(this);
    this.state = {
      question: {
        exists: false,
        text: ""
      }
      
    }
  }
  startGame() {
    var names = [
      "HAL", "C-3PO", "R2D2", "T-800", "T-1000", "The Iron Giant", "WALL-E", 
    ]
    var players = [
    ]
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
  render() {
    if (this.state.question.exists){
      var question = <Question text={this.state.question.text} />
    }
    
    
    return (
      <div>
        <Button text="Start Game" function={this.startGame} />
        <Button text="Select Teams" function={selectTeams} />
        <Button text="New Hand" />
        {question}
        <Messages url="/api/messages/" pollInterval={2000} />
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
    console.log("getMessages()");
    $.ajax({
      // 🚸 Change this to use this.props.url (also below in error logging)
      url: "/api/messages/",
      dataType: 'json',
      cache: false,
      success: function(data) {
        
        // ****
        console.log("Messages:");
        for (var d in data){
          console.log(d + ": " + data[d].text);
        }
        // ****
        
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("/api/messages/", status, err.toString(), xhr.toString());
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