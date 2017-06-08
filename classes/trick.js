class Trick {
  constructor(hand, lastTrick){
    this.hand = hand;
    this.cardsPlayed = [];
    this.playOrder = hand.bidOrder.slice(0);
    if (!lastTrick) {
      this.playOrder.splice(this.playOrder.length, 0, this.playOrder.splice(0, 1)[0]);
    } else {
      var moveToEnd = this.playOrder.splice(0, this.playOrder.indexOf(lastTrick.winner));
      for (var player in moveToEnd){
        this.playOrder.push(moveToEnd[player]);
      }
    }
  }
  announcePlayOrder() {
    var order = "Play Order: ";
    for (var player in this.playOrder){
      order += this.playOrder[player].name + ", ";
    }
    order = order.slice(0, -2);
    //console.log(order);
    return order;
  }
  decideWinner() {
    this.ledSuit = this.cardsPlayed[0][1].suit;
    this.winner = this.cardsPlayed[0][0];
    this.winningCard = this.cardsPlayed[0][1];
    for (var p in this.cardsPlayed){
      var player = this.cardsPlayed[p][0];
      var card = this.cardsPlayed[p][1];
      if (card.suit === this.ledSuit){
        // Card is following suit or trump has already been played
        if (card.suit === this.winningCard.suit){
          if (card.value > this.winningCard.value){
            this.winner = player;
            this.winningCard = card;
          }
        } else {
          
        }
      } else if (card.suit === "♠︎"){
        // Card is first of trump suit
        if (card.suit != this.winningCard.suit){
          this.winner = player;
          this.winningCard = card;
        }
      } else {
        // Card is breaking suit but not trump
        // This card can't win.
      }
    }
    this.winner.tricks += 1;
    var win = {
      player: this.winner,
      card: this.winningCard
    }
    return win;
  }
}

module.exports = Trick;