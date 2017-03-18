function App() {
  return (
    <div>
      <Button function="alert" text="Start Game" />
      <Button function="alert" text="New Hand" />
      <Button function="alert" text="Pause" />
    
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
            "text": "Game Starting!\nTEAM0: C and D\nTEAM1: B and A"
      }
    }  
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

