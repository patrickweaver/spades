/*
  var names = [
    "HAL", "C-3PO", "R2D2", "T-800", "T-1000", "The Iron Giant", "WALL-E", 
  ]
*/

class Player {
  constructor(playerId, name, type) {
    this.playerId = playerId;
    this.name = name;
    this.type = type;
    this.card = -1;
  }
  
  
  /*
  dealHand(cards) {
    return cards;
  }
  logHand() {
    // 🚸 Put in logic to log a player's team
    //var cards = this.name + "'s Hand [" + this.team.name + "]: ";
    var cards = this.name + "'s Hand: ";
    for (var card in this.hand) {
      cards += this.hand[card].fullName + ", ";
    }
    cards = cards.slice(0, -2);
    console.log(cards);
  }
  setBid() {
    this.stage = "bidNow";
    if (this.type === "bot"){
      this.stage = "doneBidding";
      // 🚸 placeholder algorithm that just counts spades
      for (var card in this.hand) {
        if (this.hand[card].suit === "♠︎") {
          this.bid += 1;
        }
      } 
      return true;
    } else if (this.type === "human"){
      if (this.bid === 0){
        var d = new Date();
        console.log("Waiting for Human Bid at " + d);
        return false;
      } else {
        this.stage = "doneBidding";
        return true;
      }
    }
  }
  
  
  playCard(trick, card) {
    this.stage = "playNow";
    if (this.type === "bot"){
      this.stage = "donePlaying";
      var card = this.pickCard(trick);
      var index = this.hand.indexOf(card);
      //this.hand.splice(index, 1);
      this.hand[index] = {};
      trick.cardsPlayed.push([this, card]);
      
      
      🚸 Find a way to do this with update()
      if (!trick.hand.spadesBroken && card.suit === "♠︎"){
        trick.hand.spadesBroken = true;
        console.log(this.name + " is breaking spades!");
      }

      
      
      return true;
      
    } else if (this.type === "human"){
      if (this.card === -1){
        var d = new Date();
        console.log("Waiting for Human Card at " + d);
        return false;
      } else {
        this.stage = "donePlaying";
        card = this.hand[this.card];
        this.hand.splice(this.card, 1);
        trick.cardsPlayed.push([this, card]);
        this.card = -1;
        return true;
      }
    }
  }
  pickCard(trick) {
    console.log("*** pickCard()    from " + this.hand.length + " cards");
    var card;
    var spadesBroken = trick.hand.spadesBroken;
    var firstTrick = (trick === trick.hand.tricks[0]) ? true : false;
    var leading = (trick.cardsPlayed[0]) ? false : true;
    if (!leading){
      var suitLed = trick.cardsPlayed[0][1].suit;
    } else {
      var suitLed = "";
    }
    var haveSuitLed = false;
    var cardsInSuitLed = [];
    for (var c in this.hand){
      if (this.hand[c].suit === suitLed){
        cardsInSuitLed.push(this.hand[c]);
        haveSuitLed = true;
      }
    }
    var nonSpades = [];
    for (var c in this.hand){
      if (this.hand[c].suit != "♠︎"){
        nonSpades.push(this.hand[c]);
      }
    }
    
    if (haveSuitLed){
      // Follow suit
      card = this.pickFromCards(cardsInSuitLed);
    } else if (!nonSpades[0]) {
      // Only have spades
      card = this.pickFromCards(this.hand);
    } else {
      if (firstTrick){
        // Lead or break suit on first trick, avoid spades
        card = this.pickFromCards(nonSpades);
      } else {
        if (leading){
          if (spadesBroken) {
            // Leading and spades have been broken, pick any card.
            card = this.pickFromCards(this.hand);
          } else {
            card = this.pickFromCards(nonSpades)
          }
        } else {
          // Out of suit led, not first trick, and not leading, pick any card including spades
          card = this.pickFromCards(this.hand);
        }
      }
    }
    return card;
  }
  pickFromCards(cards) {
    // 🚸 Make this not random
    return cards[Math.floor(Math.random() * cards.length)];
  }
  */
}

module.exports = Player;