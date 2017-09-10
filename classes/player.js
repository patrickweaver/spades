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
    this.bid = parseInt(bid);
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
    // 🚸 Temporary: play first card:
    //console.log(this.handCards[this.handCards.length - 4]);
    //this.playCard(this.handCards.length - 4, trick);
    this.playCard(0, trick);
  }
  
  playCard(cardIndex, trick) {
    var card = (this.handCards[cardIndex]);
    if (this.isLegalCard(trick, this.handCards, card)) {
      if (card.suit === "♠︎") {
        trick.spadesBroken = true;
      }
      trick.cardsPlayed.push(card);
      this.handCards.splice(cardIndex, 1);
    } else {
      console.log("** ** ERROR: ILLEGAL CARD!!");
      console.log("** ** ERROR: ILLEGAL CARD!!");
      console.log("** ** ERROR: ILLEGAL CARD!!");
      console.log("** ** ERROR: ILLEGAL CARD!!");
      console.log("** ** ERROR: ILLEGAL CARD!!");
      console.log("** ** ERROR: ILLEGAL CARD!!");
    }
  }
  
  
  isLegalCard(trick, handCards, card) {
    if (trick.cardsPlayed.length === 0) {
    // Player is leading trick:  
      if (trick.spadesBroken) {
      // Spades is broken:
        return true;
      } else {
      // Spades is not broken:
        if (card.suit != "♠︎") {
        // Card is not a spade
        // Player can legally lead any suit but spades:
            return true;
        } else {
        // Card is a spade
        // Player can only legally lead spades
        // if they only have spades:
          for (var c in handCards) {
            if (handCards[c].suit != "♠︎") {
            // Player has a non spade, playing spade
            // is illegal card
              return false;
            }
          }
          return true;
        }
      }     
    } else {
    // Player is not leading tick:
      var ledSuit = trick.cardsPlayed[0].suit;
      // Card suit matches ledSuit:
      if (card.suit === ledSuit) {
        return true;
      } else {
      // Card suit does not match ledSuit:  
        var hasLedSuit = false;
        for (var c in handCards) {
          if (handCards[c].suit === ledSuit) {
            hasLedSuit = true;
            break;
          }
        }
        if (hasLedSuit) {
        // But player has led suit in hand
        // Illegal card
          return false;
        } else {
        // Player does not have led suit in hand
          if (handCards.length < 13) {
          // Any card is legal on 2nd to 13th tricks if
          // player doesn't have ledSuit
            return true;
          } else {
          // This is the 1st trick:
            if (card.suit != "♠︎") {
            // Any non-spade is legal on 1st trick if player
            // doesn't have led suit
              return true;
            } else {
            // Card is a spade, 1st trick
            // On 1st trick spades are only legal
            // if player only has spades:
              for (var c in handCards) {
                if (handCards[c].suit != "♠︎") {
                // Card is not a spade, illegal card
                  return false;
                }
              }
              return true;
            }
          }
        } 
      }
    }
    for (var i = 0; i > 100; i++) {
      console.log("ERROR: DID NOT RETURN");
    }
  }


  /*
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
