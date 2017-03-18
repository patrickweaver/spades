function App() {
  return (
    <div>
      <Button function="alert" text="Start Game" />
      <Button function="alert" text="New Hand" />
      <Button function="alert" text="Pause" />
    
      <Messages
        messages={messages.message} />
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

function Messages(props) {
  return (
    <div className="messages">
      <Message message={props.messages} />
    </div>
  );
}

const messages = {
  message: {
    text: 'You are now playing spades.',
  }
};
ReactDOM.render(
  App(),
  document.getElementById('root')
);
