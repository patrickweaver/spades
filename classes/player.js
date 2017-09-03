class Player {
  constructor(playerId, name, type, gameId) {
    this.playerId = playerId;
    this.gameId = gameId;
    this.update = 2;
    this.stage = "beforeGame";
    this.prompt = {
            "question": "Do you want to start a new game or join a game?",
            "type": "options",
            "options": ["New Game", "Join Game"]
          };
    this.name = name;
    this.type = type;
    this.handCards = [];
    this.card = -1;
  }

  addToGame(game) {
    this.gameId = game.gameId;
    this.stage = "waitingForPlayers";
    this.prompt = {
      question: "Click Start Game to fill seats with bots.",
      type: "options",
      options: ["Start Game"]
    }
    game.update += 1;
  }

  setStatus(stage, prompt) {
    this.stage = stage;
    this.prompt = prompt;
  }

  getBid() {
    this.stage = "bidNow";
    if (this.type === "bot") {
      this.botBid();
    } else if (this.type === "human") {
      this.setStatus("bidNow", {
        question: "What is your bid?",
        type: "options",
        options: [
          "1", "2", "3", "4", "5",
          "6", "7", "8", "9", "10",
          "11", "12", "13", "Nil"
        ]
      });
    }
  }
  
  botBid(){
    var bid = 0;
    for (var card in this.handCards) {
      if (this.handCards[card].suit === "♠︎") {
        bid += 1;
      }
    }
    if (bid === 0) {
      // 🚸 Is this how we want to indicate nil?
      bid = 100;
    }
    this.setBid(bid);
  }

  setBid(bid){
    this.bid = bid;
    console.log(this.name + " bids: " + this.bid);
  }
  
  getPlay(trick) {
    this.stage = "playNow";
    if (this.type === "bot") {
      this.botPlay(trick);
    } else if (this.type === "human") {
      this.setStatus("playNow", {
        "question": "It's your turn!",
        "type": "cards",
        "options": []
      });
      
  
    }
  }
  
  botPlay(trick) {
    // 🚸 Temporary play first card:
    var playCard = [this.handCards[0], this];
    trick.cardsPlayed.push(playCard);
    this.handCards = this.handCards.splice(1);
  }


  /*



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
