var Trick = require("./trick.js");
var Card = require("./card.js");
var helpers = require("../helpers.js")();

class Hand {
  constructor(game) {
    this.game = game;
    this.tricks = [];
    for (var t in game.teams) {
      game.teams[t].scoreChange = "0";
      for (var p in game.teams[t].players) {
        var player = game.teams[t].players[p];
        player.bid = 0;
        player.tricksTaken = 0;
        player.handCards = [];
      }
    }
    // this.deck
    this.createDeck();
    this.dealPlayers(game.teams);
    game.bidOrder = this.rotateBid(game.bidOrder);
  }

  createDeck() {
    var newDeck = [];
    var suits = ["♦︎", "♣︎", "♥︎", "♠︎"]
    var suitNames = ["diamonds", "clubs", "hearts", "spades"];;
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
    var fullValue = 1;
    for (var suit in suits) {
      for (var name in names) {
        newDeck.push(new Card(suits[suit], suitNames[suit], names[name], fullValue));
        fullValue += 1;
      }
    }
    var shuffledDeck = helpers.shuffleArray(newDeck);
    var deckString = "";
    for (var card in shuffledDeck) {
      deckString += shuffledDeck[card].fullName + ", ";
    }
    this.deck = shuffledDeck;
  }

  dealPlayers(teams) {
    var c = 0;
    for (var p = 0; p < 2; p++){
      for (var t = 0; t < 2; t++){
        var playerHand = teams[t].players[p].handCards;
        playerHand = this.deck.slice(c, c + 13);
        var sortedHand = {
          diamonds: [],
          clubs: [],
          hearts: [],
          spades: []
        }

        c += 13;
        teams[t].players[p].handCards = playerHand.sort(
          function(a,b) {
            return a.fullValue - b.fullValue;
          }
        )
      }
    }
  }

  rotateBid(order) {
    var newOrder = order.slice(1, 4);
    newOrder.push(order[0]);
    return newOrder;
  }

  start() {
    for (var player in this.game.bidOrder) {
      this.game.bidOrder[player].setStatus("waitingToBid", {});
    }
    this.game.update += 1;
    this.nextBidder(0);
  }
  
  findNextBidder(playerIdWhoJustBid){
    var nextBidder = 1;
    for (var p in this.game.bidOrder) {
      if (this.game.bidOrder[p].playerId != playerIdWhoJustBid) {
        nextBidder += 1;
      } else {
        break;
      }
    }
    return nextBidder;
  }

  nextBidder(next) {
    // If not first bidder, change stage of previous bidder:
    if (next > 0) {
      var lastPlayer = this.game.bidOrder[next - 1]
      lastPlayer.stage = "waitingForAllBids";
      lastPlayer.prompt = {};
      this.game.update += 1;
    }
    // If less than the number of players, get player bid:
    if (next < 4){
      this.game.bidOrder[next].getBid(this);
      //this.game.update += 1;
      // Make sure player has bid (0 bid is not nil):
      if (this.game.bidOrder[next].bid != 0) {
        this.nextBidder(next + 1);
      }  
    } else {
    // All players have bid, start first trick.
      this.startTrick();
    }
  }
  
  currentTrick() {
    return this.tricks[this.tricks.length - 1];
  }

  startTrick() {
    if (this.tricks.length < 13) {
      this.tricks.push(new Trick(this));
      this.currentTrick().start();
    }
  }
  
  finish() {
    var teams = this.game.teams;
    var oldScores = [
      {score: teams[0].score, bags: teams[0].bags},
      {score: teams[1].score, bags: teams[1].bags}
    ];
    var gameWinner = false;
    var gameOver = false;
    for (var t = 0; t < 2; t++) {
      teams[t].updateAfterHand(this.game.hands.length);
      var score = teams[t].score;
      var otherTeamScore = teams[t * -1 + 1].score;
      var goal = this.game.goal;
      if (this.game.strictScoring){
        if (score > goal) {
          gameOver = true;
        }
      } else {
        if (score > goal || -score > goal || (score - otherTeamScore) > goal) {
          gameOver = true;
        }        
      }
      
           
      if (gameOver) {
        if (score > otherTeamScore) {
          gameWinner = teams[t];
          console.log("💑 Game Over")
        } 
      }
    }
    
    var scoreChanges = [
      {score: teams[0].score - oldScores[0].score, bags: teams[0].bags - oldScores[0].bags, baggedOut: false},
      {score: teams[1].score - oldScores[1].score, bags: teams[1].bags - oldScores[1].bags, baggedOut: false}
    ]
    
    for (var i in scoreChanges) {
      if (scoreChanges[i].bags < 0) {
        scoreChanges[i].bags += 10;
        scoreChanges[i].score += 10;
        scoreChanges[i].baggedOut = true;
      }
    }
    
    var promptText =
      teams[0].name + " got " + scoreChanges[0].score + scoreChanges[0].bags + " points. " +
      teams[1].name + " got " + scoreChanges[1].score + scoreChanges[1].bags + " points."
    
    for (var i = 0; i < 2; i++) {
      if (scoreChanges[i].baggedOut) {
        promptText += " " + teams[i].name + " bagged out for -100 points."
      }
    }
    
    if (gameWinner){
      this.game.winningTeam = gameWinner;
      this.game.finish();
    } else {
      if (this.game.humans > 0){
          for (var player in this.game.players) {
            this.game.players[player].setStatus("handOver", {
              question: promptText,
              type: "options",
              options: ["Start Next Hand"]
            });
          }
      } else {
        this.game.newHand();
      }
    }
    this.game.update += 1;
  }
  
}


module.exports = Hand;
