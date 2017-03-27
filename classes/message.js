class Message {
  constructor(text) {
    this.text = text;
    this.time = new Date;
  }
  post(game) {
    console.log("message.post");
    console.log(this.text);
    game.messages.push(this);
    return game.messages;
  }
}

module.exports = Message;