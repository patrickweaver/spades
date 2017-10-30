var helpers = require("../helpers.js")();

class Trick {
  constructor(hand){
    var lastTrick = hand.currentTrick();
    // 🚸 What is this used for?
    // Now used in player.illegalCardReset()
    this.hand = hand;
    this.trickNumber = hand.tricks.length + 1;
    if (lastTrick) {
      this.spadesBroken = lastTrick.spadesBroken;
    } else {
      this.spadesBroken = false;
    } 
    this.cardsPlayed = [];
    this.winner = false;
    this.winningCard = false;
    this.winIndex = false;
    // If no last trick
    if (hand.tricks.length === 0) {
      this.playOrder = hand.game.bidOrder.slice(1, 4);
      this.playOrder.push(hand.game.bidOrder[0]);
    } else {
      var o = lastTrick.playOrder;
      this.playOrder = o.slice(lastTrick.winIndex, 4).concat(o.slice(0, lastTrick.winIndex));
    }
  }

  start() {
    this.announcePlayOrder();
    for (var player in this.playOrder) {
      this.playOrder[player].setStatus("waitingToPlay", {});
    }
    this.nextPlayer(0);
    this.hand.game.update += 1;
  }

  // 🦄
  announcePlayOrder() {
    var order = "Play Order: ";
    for (var player in this.playOrder){
      order += this.playOrder[player].name + ", ";
    }
    order = order.slice(0, -2);
    //console.log(order);
  }
  
  
  nextPlayer(nextToPlay) {
    var cardsPlayed = this.cardsPlayed.length;
    // If not first player to play set status of previous player to wait:
    if (nextToPlay > 0){
      var lastPlayer = this.playOrder[nextToPlay - 1]
      lastPlayer.stage = "waitingForAllPlays";
      lastPlayer.prompt = {};
      this.hand.game.update += 1;
    }
    // Each player plays a card:
    if (nextToPlay < 4) {
      this.playOrder[nextToPlay].getPlay(this);
    // Once all players have played
    } else {
      this.decideWinner();
      
      var endTrickPrompt = "Next Trick";
      if (this.trickNumber === 13) {
        endTrickPrompt = "Score Hand";
      }
      
      for (var i in this.playOrder) {
        this.playOrder[i].setStatus("allCardsPlayed", {
          question: "Winner: " + this.winner.name,
          type: "options",
          options: [endTrickPrompt]
        });
      }   
      this.hand.game.update += 1;
    }
  }

  decideWinner() {
    this.ledSuit = this.cardsPlayed[0].suit;
    this.winner = this.playOrder[0];
    this.winningCard = this.cardsPlayed[0];
    for (var p in this.cardsPlayed){
      var player = this.playOrder[p];
      var card = this.cardsPlayed[p];
      // Card is following suit
      if (card.suit === this.ledSuit){     
        if (card.suit === this.winningCard.suit) {
          if (card.value > this.winningCard.value) {
            this.winIndex = p;
            this.winner = player;
            this.winningCard = card;
          }
        }
      // Card is breaking suit
      } else if (card.suit === "♠︎"){
        // Card is first of trump suit
        if (card.suit != this.winningCard.suit){
          this.winIndex = p;
          this.winner = player;
          this.winningCard = card;
        } else {
          // Winning card is already trump but new card is higher
          if (card.value > this.winningCard.value) {
            this.winIndex = p;
            this.winner = player;
            this.winningCard = card;
          }
        }
      } else {
        // 🚸 Card is breaking suit but not trump
        // This card can't win.
      }
    }
    this.winner.tricksTaken += 1;
    this.sendTrickWinner(this.winner);

    
    
    //console.log("🌠 " + this.winner.name + " takes trick with " + this.winningCard.fullName);
  }
  
  sendTrickWinner(winner) {
    var postData = {
      winnerId: winner.playerId,
      gameId: winner.gameId,
      handNumber: this.hand.game.hands.length,
      trickNumber: this.hand.tricks.length
    };

    function callback(error, response, body) {
      if (error) {
        console.log("Error (" + response.status + "): " + error);
      }
    }

    helpers.sendToBot("trick-taker", postData, callback.bind(this));

  }
 
}

module.exports = Trick;
