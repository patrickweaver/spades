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
      //alert("ERROR");
      //alert(err);
      console.error(err);
    }.bind(this)
  });
}

function getData(gameId, playerId, callback) {
  $.ajax({
    url: "/api/game/" + gameId + "?playerId=" + playerId,
    dataType: "json",
    cache: false,
    success: function(data) {
      console.log(" !&!&!&!& DATA:");
      console.log(data);
      console.log(" *(@#&*(#&@*($ this:)))");
      console.log(this);
      callback(data);
    }.bind(this),
    error: function(xhr, status, err) {
      console.log("getData() ERROR ~~~~~~~")
      console.error("GameId: " + gameId, "PlayerId: " + playerId, status, err.toString(), xhr.toString());
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
      stage: "loading",
      gameId: "",
      playerId: makeRandString(10)
    }
  }
  // 🚸 Figure out how to not need this, maybe not use strings?
  onChoice(action, par) {
    if (action === "newGame"){
      this.newGame();
    } else if (action === "joinGame"){
      this.joinGame();
    } else if (action === "startGame"){
      this.startGame();
    } else if (action === "sendBid"){
      this.sendBid(par);
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
    var dataToSend = {
      gameId: this.state.gameId,
      playerId: this.state.playerId
    }
    sendData("new", dataToSend, "New Game Created: ");
  }
  
  joinGame() {
    this.setState({
      question: {
        exists: true,
        text: "Game Id:",
        object: "gameId",
        baseURL: "join"
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
    var dataToSend = {
      gameId: this.state.gameId
    }
    sendData("start", dataToSend, "Game started: ");
  }
  
  sendBid(bidAmount) {
    var dataToSend = {
      gameId: this.state.gameId,
      playerId: this.state.playerId,
      bid: bidAmount
    }
    sendData("bid", dataToSend, this.state.playerId + " bids " + bidAmount);
  }
  
  update(gid, stage) {
    //🚸 Use Data variable and update anything?
    console.log("UPDATE!!!!!!!!!!!!!!!!");
    this.setState({
      gameId: gid,
      stage: stage,
      question: {
        exists: false,
        text: "",
        object: "",
        baseURL: ""
      }
    });
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
        <h3>Game: {this.state.gameId} <a href={"/api/game/" + this.state.gameId} target="blank">🔗</a></h3>
        <h4>Player: {this.state.playerId} <a href={"/api/game/" + this.state.gameId + "?playerId=" + this.state.playerId} target="blank">🔗</a></h4>
        <h4>Stage: {this.state.stage}</h4>
        {/*🚸 The logic is doubled here, can probably find a way to only have it once.-->*/}
        <Choices stage={this.state.stage} onChoice={this.onChoice} onStage={"beforeStart"} />
        <Choices stage={this.state.stage} onChoice={this.onChoice} onStage={"waitingForPlayers"} />
        <Choices stage={this.state.stage} onChoice={this.onChoice} onStage={"bidNow"} />
        {question}
        <Messages url="/api/messages/" pollInterval={5000} gameId={this.state.gameId} playerId={this.state.playerId} update={this.update.bind(this)} />
        <Cards url="/api/hand/" pollInterval={1000} gameId={this.state.gameId} playerId={this.state.playerId} />
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
  handleButtonClick(action, text){
    this.props.onChoice(action[0], action[1]);
  }

  render() {
    if (this.props.stage === this.props.onStage){
      if (this.props.stage === "beforeStart"){
        return(
          <div>
            <GameButton text="New Game" action={["newGame"]} onButtonClick={this.handleButtonClick} />
            <GameButton text="Join Game" action={["joinGame"]} onButtonClick={this.handleButtonClick} />
          </div>
        )
      } else if (this.props.stage === "waitingForPlayers"){
        return(
          <div>
            <GameButton text="Start Game" action={["startGame"]} onButtonClick={this.handleButtonClick} />
          </div>
        )
      } else if (this.props.stage === "bidNow"){
          //const cards = this.state.cards.map((card, index) =>
            //<li key={index}><Card suit={card.suit} fullName={card.fullName} /></li>                               
          //);
          // 🚸 Change this to look at your partner's bid?
        const availBids = [1,2,3,4,5,6,7,8,9,10,11,12,13];  
        
        const bids = availBids.map((bid, index) =>
          <GameButton key={index} text={bid} action={["sendBid", bid]} onButtonClick={this.handleButtonClick} />                       
        );
        //🚸 Add blind nil option along with reveal cards button?
        return(
          <div>
            <GameButton text="Nil" action={["sendBid", "nil"]} onButtonClick={this.handleButtonClick} />
            {bids}
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
    var dataToSend = { playerId: this.props.playerId };
    dataToSend[object] = this.state.answer;
    console.log("Data To Send: ");
    for (var i in dataToSend){
      console.log(i + ": " + dataToSend[i]);
    }
    var path = this.props.baseURL;
    console.log("URL: /api/" + path + "/");
    sendData(path, dataToSend, "Question sent: ", this.props.update(this.state.answer, this.props.gameStage));
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
  updateView(){
    //console.log("**");
    var messagesArea = document.getElementById("messages");
    /*
    console.log("Scroll height:");
    console.log(messagesArea.scrollHeight);
    console.log("client Height:");
    console.log(messagesArea.clientHeight);
    console.log("Scroll Top:");
    console.log(messagesArea.scrollTop);
    */
    var isScrolledToBottom = messagesArea.scrollHeight - messagesArea.clientHeight <= messagesArea.scrollTop + 1;
    /*
    console.log("Scrolled to Bottom:");
    console.log(isScrolledToBottom);
    */
    if(!isScrolledToBottom){
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    /*
    isScrolledToBottom = messagesArea.scrollHeight - messagesArea.clientHeight <= messagesArea.scrollTop + 1;
    console.log("Scrolled to Bottom:");
    console.log(isScrolledToBottom);
    console.log("**");
    */
    
  }
  componentDidMount() {
    this.updateView();
  }
  componentWillUnmount() {
  }
  formatDate() {
    var date = new Date(this.props.message.time);
    var time = "" + date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2);
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
        <p className="time">
          {this.formatDate()}
        </p>
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
    var url = "/api/game/" + this.props.gameId + "?playerId=" + this.props.playerId;
    var gameId = this.props.gameId;
    var playerId = this.props.playerId;
    console.log("getMessages() from " + url);
    // 🚸 Change this to use this.props.url (also below in error logging)
    
    function getMessagesCallback(game) {
      var messages;
      var players = [];
      var stage;
      // ****
      console.log("Messages:");
      for (var d in game){
        if (d === "messages") {
          messages = game[d];
        }
        if (d === "players") {
          players = game[d];
        }
        if (d === "stage") {
          stage = game[d];
        }
      }
      // ****
      // 🚸 Don't actually need to be updating gameId
      this.props.update(gameId, stage);
      this.setState({data: messages, players: players});
    }
    getData(gameId, playerId, getMessagesCallback.bind(this));
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
    const classes = "card " + this.props.suit + " c-" + this.props.fullName;
    return (
      <div className={classes}>
        <p>
          {this.props.fullName}
        </p>
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
    // 🚸 Change this to use this.props.url (also below in error logging)
    var url = "/api/game/" + this.props.gameId + "?playerId=" + this.props.playerId;
    console.log("getCards() from " + url);
    
    function getCardsCallback(data) {
      var cards = data.cards;
      var playerHand = [];
      console.log(this.props.playerId + "'s" + " Cards:");
      this.setState({cards: cards});
    }
    
    getData(this.props.gameId, this.props.playerId, getCardsCallback.bind(this));
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