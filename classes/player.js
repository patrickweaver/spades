var helpers = require("../helpers.js")();

class Player {
  constructor(playerId, name, type, gameId) {
    this.playerId = playerId;
    this.gameId = gameId;
    this.update = 2;
    this.stage = "beforeGame";
    this.prompt = {
            "question": "Do you want to start a new game or join a game?",
            "type": "options",
            "options": ["New Game", "Join Game", "Bot Game"]
          };
    this.name = name;
    this.type = type;
    this.handCards = [];
    this.bid = false;
    this.card = -1;
    this.attempts = 0;
    this.confirmed = false;
    // Wake up API:
    helpers.sendToBot("", {}, function(error, response, body) {
    });
  }

  addedToGame(game) {
    this.gameId = game.gameId;
    this.setStatus("waitingForPlayers", {
      question: "Click Start Game to fill seats with bots.",
      type: "options",
      options: ["Start Game"]
    });
    game.update += 1;
  }

  setStatus(stage, prompt) {
    this.stage = stage;
    this.prompt = prompt;
  }

  setTeamName(game, teamNameChoice){
    this.teamNameChoice = teamNameChoice;
    var allTeamNamesChosen = true;
    // When a player chooses a team name, check to see if all players now have team names.
    for (var i in game.players) {
      if (!game.players[i].teamNameChoice) {
        allTeamNamesChosen = false;
        break;
      }
    }
    if (allTeamNamesChosen) {
      for (var i in game.teams) {
        game.teams[i].name = game.teams[i].players[0].teamNameChoice + " " + game.teams[i].players[1].teamNameChoice;
        game.update += 1;
      }
      // If all team names are chosen create a new hand
      game.newHand();
    }
  }


  getBid(hand) {
    this.stage = "bidNow";
    if (this.type === "bot") {
      this.botBid(hand);
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

  //✌️ But this time it's the whole player not just the id in game.bidorder
  findSelfInOrder(playerId, order) {
    if (order && order.length === 4) {
      for (var i = 0; i < 4; i++) {
        if (playerId === order[i].playerId){
          return i;
        }
      }
      // This is here for when the player is not in the game
      return 0;
    }
  }

  //✌️
  findSelfInTeam(playerId, teamInfo) {
    if (teamInfo && teamInfo.length === 2) {
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
          if (teamInfo[i].players[j].playerId === playerId) {
            return [i, j];
          }
        }
      }
      // This is here for when the player is not in the game
      return [0, 0];
    }
  }

  cardValues() {
    var handValues = [];
    for (var c in this.handCards) {
      var card = this.handCards[c];
      handValues.push({
        value: card.fullValue,
        legal: card.legal
      })
    }
    return handValues;
  }

  collectBotInfo(infoType, hand) {
    // infoType should either be "bid" or "play"

    var strategy;
    if (infoType === "bid") {
      //strategy = "nn";
      strategy = "numberOfSpades";
    } else if (infoType === "play") {
      strategy = "random";
    }

    var game = hand.game;
    var handNumber = game.hands.length;
    var selfInBidOrder = this.findSelfInOrder(this.playerId, game.bidOrder);
    var selfInTeam = this.findSelfInTeam(this.playerId, game.teams);
    var selfTeam = game.teams[selfInTeam[0]];
    var otherTeam = game.teams[selfInTeam[0] * -1 + 1];
    var self = this;
    var partner = game.bidOrder[(selfInBidOrder + 2) % 4];
    var left = game.bidOrder[(selfInBidOrder + 1) % 4];
    var right = game.bidOrder[(selfInBidOrder + 3) % 4];
    var handValues = this.cardValues()


    var postData = {
      strategy: strategy,
      gameId: this.gameId,
      handNumber: handNumber,
      playerId: this.playerId,
      handCards: handValues,
      bidSelfOrder: selfInBidOrder + 1,
      bidSelfBid: this.bid,
      bidPartnerBid: partner.bid,
      bidLeftBid: left.bid,
      bidRightBid: right.bid,
      scoreSelfTeamScore: selfTeam.score,
      scoreSelfTeamBags: selfTeam.bags,
      scoreOtherTeamScore: otherTeam.score,
      scoreOtherTeamBags: otherTeam.bags
    }

    if (infoType === "play") {
      var trick = hand.currentTrick();

      postData.spadesBroken = trick.spadesBroken;
      postData.trickNumber = hand.tricks.length;


      function getIfCard(playOrder) {
        if (playOrder < trick.cardsPlayed.length) {
          return trick.cardsPlayed[playOrder].fullValue;
        } else {
          return false;
        }
      }


      var selfInPlayOrder = this.findSelfInOrder(this.playerId, trick.playOrder);
      postData.playSelfOrder = selfInPlayOrder + 1;
      postData.playSelfPlay = getIfCard(selfInPlayOrder);

      var partnerPlayOrder = (selfInPlayOrder + 2) % 4;
      postData.playPartnerPlay = getIfCard(partnerPlayOrder);

      var leftPlayOrder = (selfInPlayOrder + 1) % 4;
      postData.playLeftPlay = getIfCard(leftPlayOrder);

      var rightPlayOrder = (selfInPlayOrder + 3) % 4;
      postData.playRightPlay = getIfCard(rightPlayOrder);
    }

    return postData;
  }




  botBid(hand){

    var postData = this.collectBotInfo("bid", hand);

    function callback(hand, error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        // console.log("BID: " + info.bid);
        this.setBid(info.bid);
        hand.game.update += 1;
        var nextBidderIndex = hand.findNextBidder(this.playerId);
        hand.nextBidder(nextBidderIndex);
      } else {
        console.log("ERROR " + error);
        for (var i in error) {
          for (var j in error[i]){
            for (var k in error[i][j]);
            console.log(i + " ^ " + j + " * " + k + ":  " + error[i][j][k]);
          }

        }
      }
    }
    helpers.sendToBot("bid", postData, callback.bind(this, hand));
  }

  setBid(bid){
    if (bid === "Nil") {
      this.bid = bid;
    } else {
      this.bid = parseInt(bid);
    }
    //console.log(this.name + " bids: " + this.bid);
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
    var postData = this.collectBotInfo("play", trick.hand);


    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        // console.log("INDEX: " + info.index);
        this.playCard(info.index, trick);
      } else {
        console.log("ERROR " + error);
      }
    }

    helpers.sendToBot("play", postData, callback.bind(this));
  }

  playCard(cardIndex, trick) {
    var card = (this.handCards[cardIndex]);
    if (this.isLegalCard(trick, this.handCards, card)) {
      //console.log("🎴 " + this.name + " plays " + card.fullName);
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
      setTimeout(function() {
        this.checkConfirm(trick.hand.game);
        trick.nextPlayer(i + 1);

      }.bind(this), 0);
    } else {
      console.log("⛔️ Illegal Card "  + this.attempts);
      this.illegalCardReset(trick);
    }
  }

  confirmPlay(game){
    this.confirmed = true;
    this.checkConfirm(game);
  }

  checkConfirm(game) {
    if (this.type === "bot") {
      this.confirmed = true;
    }
    var waitList= [];
    var toWhat;
    var trick = game.currentHand().currentTrick();

    if (trick.cardsPlayed.length === 4) {
      var allConfirmed = true;

      for (var p in game.players) {
        if (game.players[p].confirmed === false) {
          allConfirmed = false;
          waitList.push(game.players[p].name);
        }
      }
      toWhat = "confirm";
    } else {
      var numberCardsPlayed = trick.cardsPlayed.length;
      for (var i = (numberCardsPlayed); i < 4; i++) {
        waitList.push(trick.playOrder[i].name);
      }
      toWhat = "play";
    }




    if (allConfirmed){
      for (var p in game.players) {
        game.players[p].confirmed = false;
      }
      var hand = game.currentHand();
      if (hand.tricks.length < 13){
        hand.startTrick();
      } else {
        hand.finish();
      }
    } else {
      this.waitingFor(waitList, toWhat);
      game.update += 1;
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

  waitingFor(waitList, toWhat) {
    var waitNames = "";
    for (var n in waitList) {
      waitNames += " " + waitList[n] + ",";
    }
    waitNames = waitNames.slice(0, -1);

    this.setStatus("waitingForConfirms", {
      "question": "Waiting for" + waitNames + " to " + toWhat + ".",
      "type": "options",
      "options": []
    });
  }


}

module.exports = Player;
