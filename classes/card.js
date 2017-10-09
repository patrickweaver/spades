class Card {
  constructor(suit, suitName, name, fullValue) {
    this.suit = suit;
    this.suitName = suitName
    this.name = name;
    this.shuffle = Math.random();
    var value;
    if (name.length === 1) {
      value = parseInt(name);
    } else if (name === "10") {
      value = 10;
    } else if (name === "Jack") {
      value = 11;
    } else if (name === "Queen") {
      value = 12;
    } else if (name === "King") {
      value = 13;
    } else if (name === "Ace") {
      value = 14;
    }
    this.value = value;
    if (name === "10") {
      this.fullName = name + suit;   
    } else {
      this.fullName = "" + name[0] + suit;
    }
    this.fullPrintableName = name + " of " + suitName;
    this.fullValue = fullValue;
    this.legal = null;
    this.playedBy = "";
  }
}

module.exports = Card;
