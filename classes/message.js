class Message {
  constructor(text) {
    this.text = text;
    this.time = new Date;
  }
  post(data) {
    data.push(message);
    for (var d in data){
      console.log(d + ": " + data[d].text);
    }
    return data;
  }
}

module.exports = Message;