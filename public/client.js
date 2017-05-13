function makeRandString(stringLength) {
  var randString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < stringLength; i++ )
      randString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randString;
}

/*
  var names = [
    "HAL", "C-3PO", "R2D2", "T-800", "T-1000", "The Iron Giant", "WALL-E", 
  ]
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
    // 🚸 Figure out if this is necessary or not
    this.joinGame = this.joinGame.bind(this);
    this.startGame = this.startGame.bind(this);
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
  // 🚸 Figure out how to not need this, maybe not use strings?
  onChoice(action) {
    if (action === "newGame"){
      this.newGame();
    } else if (action === "joinGame"){
      this.joinGame();
    } else if (action === "startGame"){
      this.startGame();
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
        data: {
          gameId: this.state.gameId,
          playerId: this.state.playerId
        },
        success: function(data) {
          console.log("New Game Created: " + data);
          this.setState({
            stage: "waitingForPlayers"
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
    });
  }
  
  /*
  When the 'Start Game' button is clicked send a message to the backend to start the game.
  If there are fewer than 4 players the backend will add robot players.
  🚸 Need to make sure you cannot add more than 4 players.
  */
  startGame() {
    console.log("*********** Start Game");
    // 🚸 Combine ajax calls into a funciton
    $.ajax({
      url: "/api/start/",
      data: {
        gameId: this.state.gameId
      },
      success: function(data) {
        console.log("Game started: " + data);
        this.setState({
          stage: "waitingForBids"
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(err);
      }.bind(this)
    });
  }
  
  update(gid, stage) {
    //🚸 Use Data variable and update anything?
    if (stage === "beforeStart"){
      this.setState({
        gameId: gid,
        stage: "waitingForPlayers",
        question: {
          exists: false,
          text: "",
          object: "",
          baseURL: ""
        }
        
      });
    }
  }
  render() {
    if (this.state.question.exists){
      var question = <QuestionForm
        text={this.state.question.text}
        object={this.state.question.object}
        baseURL={this.state.question.baseURL}
        playerId={this.state.playerId}
        gameStage={this.state.stage}
        update={this.update.bind(this)} />
    }
    return (
      <div>
        <h3>Game: {this.state.gameId}</h3>
        <h4>Stage: {this.state.stage}</h4>
        {/*🚸 The logic is doubled here, can probably find a way to only have it once.-->*/}
        <Choices stage={this.state.stage} onChoice={this.onChoice} onStage={"beforeStart"} />
        <Choices stage={this.state.stage} onChoice={this.onChoice} onStage={"waitingForPlayers"} />
        {question}
        <Messages url="/api/messages/" pollInterval={4000} gameId={this.state.gameId} />
        <Cards url="/api/hand/" pollInterval={4000} gameId={this.state.gameId} playerId={this.state.playerId} />
      </div>
    )
  }
}


class Choices extends React.Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    var show
    console.log("this.props.stage: " + this.props.stage + " (" + typeof this.props.stage + ")");
    console.log("this.props.onStage: " + this.props.onStage + " (" + typeof this.props.onStage + ")");
  }
  handleButtonClick(action){
    this.props.onChoice(action)
  }

  render() {
    if (this.props.stage === this.props.onStage){
      if (this.props.stage === "beforeStart"){
        return(
          <div>
            <GameButton text="New Game" action={"newGame"} onButtonClick={this.handleButtonClick} />
            <GameButton text="Join Game" action={"joinGame"} onButtonClick={this.handleButtonClick} />
          </div>
        )
      } else if (this.props.stage === "waitingForPlayers"){
        return(
          <div>
            <GameButton text="Start Game" action={"startGame"} onButtonClick={this.handleButtonClick} />
          </div>
        )
      }
    } else {
      return(
        <div>
        </div>
      )
    }
  }
}

class GameButton extends React.Component {
  constructor(props) {
    super(props);
    this.clicked = this.clicked.bind(this);
  }
  clicked(clickedFunction) {
    if (clickedFunction){
      clickedFunction(this.props.action);
    }
  }
  render() {
    return(
      <button onClick={() => this.clicked(this.props.onButtonClick)}>
        {this.props.text}
      </button>
    );
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
        this.props.update(this.state.answer, this.props.gameStage);
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
  componentDidMount() {
    /*
    var messagesArea = document.getElementById("messages");
    console.log("Scroll height:")
    console.log(messagesArea.scrollHeight);
    console.log("client Height:")
    console.log(messagesArea.clientHeight);
    console.log("Scroll Top:")
    console.log(messagesArea.scrollTop);
    var isScrolledToBottom = messagesArea.scrollHeight - messagesArea.clientHeight <= messagesArea.scrollTop + 1;
    console.log("Scrolled to Bottom:")
    console.log(isScrolledToBottom);
    if(isScrolledToBottom){
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    */
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
    this.getMessages = this.getMessages.bind(this);
    this.state = {
      data:[
        {
          "text": "Loading . . .",
          "time": String(new Date())
        }
      ],
      players: []
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
        var players = [];
        // ****
        console.log("Messages:");
        for (var d in game){
          if (d === "messages") {
            messages = game[d];
          }
          if (d === "players") {
            players = game[d];
          }
          /*
          if (game[d].text){
            console.log(d + ": " + game[d].text);
          } else {
            console.log(d + ": " + game[d]);
          }
          */
        }
        // ****
        this.setState({data: messages, players: players});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("/api/" + this.props.gameId + "/messages/", status, err.toString(), xhr.toString());
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
      <div>
        <div id="messages">
          <ul>
            {messages}
          </ul>
        </div>
        <div className="players">
          <h4>Players: {this.state.players.length}</h4>
        </div>
      </div>
    );
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);
    
  }
  
  render() {
    const classes = "card " + this.props.suit
    
    return (
      <div className={classes}>
        {this.props.fullName}
      </div>
    );
  }
}


class Cards extends React.Component {
  constructor(props) {
    super(props);
    this.getCards = this.getCards.bind(this);
    this.state = {
      cards:[
      ]
    }
  }
  
  getCards(){
    console.log("getCards() from /api/hand?gameId=" + this.props.gameId + "&playerId=" + this.props.playerId);
    $.ajax({
      // 🚸 Change this to use this.props.url (also below in error logging)
      url: "/api/hand?gameId=" + this.props.gameId + "&playerId=" + this.props.playerId,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var cards = data.cards;
        var playerHand = [];
        console.log(this.props.playerId + "'s" + " Cards:");
        this.setState({cards: cards});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(
          "/api/hand?gameId=" + this.props.gameId + "&playerId=" + this.props.playerId, status, err.toString(), xhr.toString()
        );
      }.bind(this)
    });
  }
  componentDidMount() {
    setInterval(this.getCards, this.props.pollInterval);
  }
  componentWillUnmount() {

  }
  
  render() {
    const cards = this.state.cards.map((card, index) =>
      <li key={index}><Card suit={card.suit} fullName={card.fullName} /></li>                               
    );
    if (cards.length > 0) {
      return(
        <div id="cards">
          <h4>Cards:</h4>
          <ul>
            {cards}
          </ul>
        </div>
      );
    } else {
      return(
        <div id="cards">
          <h4>Cards:</h4>
          <p>No Cards</p>
        </div>
      );
    }
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);