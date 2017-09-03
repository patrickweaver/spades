class Trick {
  constructor(hand){
    var lastTrick = hand.tricks[hand.tricks.length - 1];
    this.hand = hand;
    this.cardsPlayed = [];
    this.winner = false;
    // If no last trick
    if (hand.tricks.length === 0) {
      this.playOrder = hand.game.bidOrder.slice(1, 4);
      this.playOrder.push(hand.game.bidOrder[0]);
    } else {
      this.playOrder = lastTrick.playOrder.slice(1, 4);
      this.playOrder.push(lastTrick.playOrder[0]);
    }
  }

  start() {
    this.announcePlayOrder();
    for (var player in this.playOrder) {
      this.playOrder[player].setStatus("waitingToPlay", {});
    }
    this.nextPlayer(0);
  }

  // 🦄
  announcePlayOrder() {
    var order = "Play Order: ";
    for (var player in this.playOrder){
      order += this.playOrder[player].name + ", ";
    }
    order = order.slice(0, -2);
    console.log(order);
  }
  
  
  nextPlayer(next) {
    var cardsPlayed = this.cardsPlayed.length;
    // If not first player to play set status of previous player to wait:
    if (next > 0){
      var lastPlayer = this.playOrder[next - 1]
      lastPlayer.stage = "waitingForAllPlays";
      lastPlayer.prompt = {};
      this.hand.game.update += 1;
    }
    // Each player plays a card:
    if (next < 4) {
      this.playOrder[next].getPlay(this);
      // Make sure a card has been played:
      if (this.cardsPlayed.length === cardsPlayed + 1) {
        this.nextPlayer(next + 1);
      }
    // Once all players have played
    } else {
      
    }
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
        // 🚸 Card is breaking suit but not trump
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
