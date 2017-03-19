function App() {
  return (
    <div>
      <h1>Spades!</h1>
      <Button text="Start Game" />
      <Button text="New Hand" />
      <Button text="Pause" />
      <Messages url="/api/messages/" pollInterval={2000} numbers={[1,2,3]} />
    </div>
  );
}

function Button(props) {
  return (
    <button onClick={props.function}>
      {props.text}
    </button>
  )
}

function Message(props) {
  return (
    <div className="message">
      {props.message.text}
    </div>
  );
}

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.getMessages = this.getMessages.bind(this)
    this.state = {
      data:[
        {
          "text": "Loading . . ."
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
      <li><Message message={message} /></li>                        
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



/*
function App() {
  return (
    <div>
      <Button function="alert" text="Start Game" />
      <Button function="alert" text="New Hand" />
      <Button function="alert" text="Pause" />
    
      <Messages  />
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: []}
  }
  getMessages() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }
  componentDidMount() {
    this.getMessages();
    setInterval(this.getMessages, this.props.pollInterval);
  }
}

function Button(props) {
  return (
    <button onClick={props.function}>
      {props.text}
    </button>
  )
}

function Message(props) {
  return (
    <div className="message">
      {props.text}
    </div>
  );
}

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "message": {
            "text": "Game Starting!\nTEAM0: C and D\nTEAM1: B and A"
      }
    }  
  }
  
  

  render() {
    return (
      <div>
        <h1>Spades!</h1>
        <div className="messages">
          <Message text={this.state.message.text} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App url="/api/messages" pollInterval={2000}/>,
  document.getElementById('root')
);


*/
