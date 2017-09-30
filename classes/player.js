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
    this.attempts = 0;
    this.confirmed = false;
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
    
    if (bid > 0) {
      bid -= 1;
    }
    
    if (bid === 0) {
      // 🚸 Is this how we want to indicate nil?
      bid = "Nil";
    }
    this.setBid(bid);
  }

  setBid(bid){
    if (bid === "Nil") {
      this.bid = bid;
    } else {
      this.bid = parseInt(bid);
    }
    console.log(this.name + " bids: " + this.bid);
  }
  
  getPlay(trick) {
    if (this.attempts < 13) {
      this.stage = "playNow";
      for (var card in this.handCards) {
        if (this.isLegalCard(trick, this.handCards, this.handCards[card])) {
          this.handCards[card].legal = true;
        } else {
          this.handCards[card].legal = false;
        }
      }
      if (this.type === "bot") {
        this.botPlay(trick);
      } else if (this.type === "human") {
        if (this.attempts === 0) {
          this.setStatus("playNow", {
            "question": "It's your turn!",
            "type": "cards",
            "options": []
          });   
        } else {
          this.setStatus("playNow", {
            "question": "Invalid card, it's still your turn!",
            "type": "cards",
            "options": []
          }); 
        }
      }
    } else {
      this.stage = "Error";
      this.setStatus("Error", {
        "questoin": "Error: Too many invalid plays.",
        "type": "options",
        "options": []
      });
    }
  }
  
  botPlay(trick) {
    /*
    // 🚸 Temporary: play first legal card:
    this.playCard(this.attempts, trick);
    */
    
    // Play random legal card:
    var legalCards = [];
    for (var c = 0; c < this.handCards.length; c++) {
      if (this.handCards[c].legal) {
        console.log(c + ": " + this.handCards[c].fullName);
        legalCards.push(c);
      }
    }
    console.log("%% LENGTH: " + legalCards.length);
    var randindex = Math.floor(Math.random() * legalCards.length);
    console.log("^^ INDEX: " + randindex);
    this.playCard(legalCards[randindex], trick);
    this.confirmed = true;
  }
  
  playCard(cardIndex, trick) {
    var card = (this.handCards[cardIndex]);
    console.log("🎴 " + this.name + " wants to play " + card.fullName);
    if (this.isLegalCard(trick, this.handCards, card)) {
      console.log("✅ Card played.");
      if (card.suit === "♠︎") {
        trick.spadesBroken = true;
      }
      card.playedBy = this.playerId;
      trick.cardsPlayed.push(card);
      this.handCards.splice(cardIndex, 1);
      this.attempts = 0;
      for (var card in this.handCards) {
        this.handCards[card].legal = null;
      }
      var i = this.findPlayerInPlayOrder(trick);
      console.log("BEFORE i is: " + i);
      setTimeout(function() {
        console.log("AFTER i is: " + i);
        trick.nextPlayer(i + 1)
      }, 0);
    } else {
      console.log("⛔️ Illegal Card "  + this.attempts);
      this.illegalCardReset(trick);
    }
  }
  
  findPlayerInPlayOrder(trick) {
    for (var i = 0; i < trick.playOrder.length; i ++) {
      if (trick.playOrder[i] === this) {
        return i;
      }
    }
  }
  
  illegalCardReset(trick){
    trick.hand.game.update += 1;
    this.attempts += 1;
    var i = this.findPlayerInPlayOrder(trick);
    setTimeout(function() {
      trick.nextPlayer(i);
    }, 0);
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
  
  waitingFor(waitList) {
    var waitNames = "";
    for (var n in waitList) {
      waitNames += " " + waitList[n] + ",";
    }
    this.setStatus("waitingForConfirms", {
      "question": "Waiting for" + waitNames + " to confirm.",
      "type": "options",
      "options": []
    }); 
  }
  
  
}

module.exports = Player;
