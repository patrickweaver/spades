class Trick {
  constructor(hand, lastTrick){
    this.hand = hand;
    this.cardsPlayed = [];
    this.playOrder = hand.bidOrder.slice(0);
    if (!lastTrick) {
      this.playOrder.splice(this.playOrder.length, 0, this.playOrder.splice(0, 1)[0]);
    } else {
      var moveToEnd = this.playOrder.splice(0, this.playOrder.indexOf(lastTrick.winner));
      for (player in moveToEnd){
        this.playOrder.push(moveToEnd[player]);
      }
    }
  }
  announcePlayOrder() {
    var order = "Play Order: "
    for (player in this.playOrder){
      order += this.playOrder[player].name + ", ";
    }
    order = order.slice(0, -2);
    console.log(order);
  }
  decideWinner() {
    this.winner = this.cardsPlayed[0][0];
    this.winningCard = this.cardsPlayed[0][1];
    for (var p in this.cardsPlayed){
      var player = this.cardsPlayed[p][0];
      var card = this.cardsPlayed[p][1];
      // 🚸 Make this take the led suit into account.
      // 🚸 Make this take the trump suit into account.
      if (card.value > this.winningCard.value){
        this.winner = player;
        this.winningCard = card;
      }
    }
    this.winner.tricks += 1;
  }
}

module.exports = Trick;