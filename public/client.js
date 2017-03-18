function App() {
  return (
    <div>
      <Button text="Start Game" />
      <Button text="New Hand" />
      <Button text="Pause" />
    
      <Messages url="/api/messages" pollInterval={2000} />
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
      {props.text}
    </div>
  );
}

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "message": {
            "text": "Loading . . ."
      }
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
        this.setState({message: data[0].message});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("/api/messages", status, err.toString(), xhr.toString());
      }.bind(this)
    });
  }
  componentDidMount() {
    this.getMessages();
    //url = String(console.log(this.props.url));
    setInterval(this.getMessages(), this.props.pollInterval);
  }
  componentWillUnmount() {

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
  <App />,
  document.getElementById('root')
);

