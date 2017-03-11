class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
    this.bid = 0;
  }
  dealHand(cards) {
    return cards;
  }
  logHand() {
    var cards = this.name + "'s Hand: ";
    for (var card in this.hand) {
      cards += this.hand[card].fullName + ", ";  
    }
    cards = cards.slice(0, -2);
    console.log(cards);
  }
  setBid() {
    // placeholder algorithm that just counts spades
    for (var card in this.hand) {
      if (this.hand[card].suit === "♠︎") {
        this.bid += 1;
      }
    }
  }
  playCard(card, trick) {
    var index = this.hand.indexOf(card);
    this.hand.splice(index, 1);
    trick.cardsPlayed.push([this, card]);
    console.log(this.name + " plays " + card.fullName);
  }
  pickCard() {
    // 🚸 Make this not random
    // 🚸 Enforce rule about following led suit
    // 🚸 Enforce rule about breaking spades
    var card = this.hand[Math.floor(Math.random() * this.hand.length)];
    return card;
  }
}

module.exports = Player;