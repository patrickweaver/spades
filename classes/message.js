class Message {
  constructor(text) {
    this.text = text;
    this.time = new Date;
  }
  post(data) {
    data.push(this);
    return data;
  }
}

module.exports = Message;