var Hand = require("./classes/hand.js");
var Trick = require("./classes/trick.js");


var game;
var hand;
var team0;
var team1;
var trick;

class Game {
  constructor(teams) {
    this.teams = teams;
    this.hands = [];
    this.newHand();
  }
  
  newHand() {
    this.hands.push(new Hand(this.hands.length, this.teams));
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
    this.bid = 0;
  }
  dealHand(cards) {
    return cards;
  }
  logHand() {
    var cards = this.name + "'s Hand: ";
    for (var card in this.hand) {
      cards += this.hand[card].fullName + ", ";  
    }
    cards = cards.slice(0, -2);
    console.log(cards);
  }
  setBid() {
    // placeholder algorithm that just counts spades
    for (var card in this.hand) {
      if (this.hand[card].suit === "♠︎") {
        this.bid += 1;
      }
    }
  }
  playCard(card) {
    var index = this.hand.indexOf(card);
    this.hand.splice(index, 1);
    trick.cardsPlayed.push([this, card]);
    console.log(this.name + " plays " + card.fullName);
  }
  pickCard() {
    // 🚸 Make this not random
    // 🚸 Enforce rule about following led suit
    // 🚸 Enforce rule about breaking spades
    var card = this.hand[Math.floor(Math.random() * this.hand.length)];
    return card;
  }
}

class Team {
  constructor(players, name) {
    this.name = name;
    this.players = players;
    for (var p in players) {
      players[p].team = this;
    }
    this.score = 0;
    this.tricks = 0;
    this.bags = 0;
    this.bid = [0, 0, 0];
  }
  
  getTeamBid() {
    var teammates = this.players;
    for (var p in teammates){
      var player = teammates[p];
      this.bid[p] = player.bid;
      this.bid[2] += player.bid;
    }
  }
}

class Card {
  constructor(suit, name) {
    this.suit = suit;
    this.name = name;
    var value;
    if (name.length === 1) {
      value = parseInt(name);
    } else if (name === "10") {
      value = 10;
    } else if (name === "Jack") {
      value = 11;
    } else if (name === "Queen") {
      value = 12;
    } else if (name === "King") {
      value = 13;
    } else if (name === "Ace") {
      value = 14;
    }
    this.value = value;
    if (name === "10") {
      this.fullName = name + suit;
    } else {
      this.fullName = "" + name[0] + suit;
    }
  }
}



console.log("Game Starting!");

var a = new Player("A");
var b = new Player("B");
var c = new Player("C");
var d = new Player("D");

var players = [a,b,c,d];

// 🚸 Move to Game method?
function selectTeams(players) {
  var sides = [0, 1, 2, 3];
  times = sides.length;
  for (var i = 0; i < times; i++) {
   sides.splice(sides.length, 0, sides.splice(Math.floor(Math.random() * sides.length - i), 1)[0]);
  }
  team0 = new Team([players[sides[0]], players[sides[1]]], "Team 0");
  team1 = new Team([players[sides[2]], players[sides[3]]], "Team 1");
  return team0, team1;
}

selectTeams(players, team0, team1);

console.log("Team 0: " + team0.players[0].name + " and " + team0.players[1].name);
console.log("Team 1: " + team1.players[0].name + " and " + team1.players[1].name);

game = new Game([team0, team1]);

function createDeck() {
  newDeck = [];
  suits = ["♦︎", "♣︎", "♥︎", "♠︎"]
  names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
  for (suit in suits) {
    for (name in names) {
      newDeck.push(new Card(suits[suit], names[name]));
    }
  }
  return newDeck;
}

var deck = createDeck();

function shuffleDeck() {
  for (var i = 0; i < 52; i++) {
   deck.splice(52, 0, deck.splice(Math.floor(Math.random() * 52 - i), 1)[0]);
  }
}

shuffleDeck();

function dealHands() {
  a.hand = deck.slice(0, 13);
  b.hand = deck.slice(13, 26);
  c.hand = deck.slice(26, 39);
  d.hand = deck.slice(39, 52);
  hand = game.hands[game.hands.length - 1]; 
}

dealHands();
bids = hand.bidOrder;

console.log("\n🃏 Hands Dealt:");
for (player in bids) {
  bids[player].logHand();
}

console.log("\n📒 Bids:");
for (player in bids) {
  bids[player].setBid();
  // 🚸 Move this to player.announceBid()
  console.log(bids[player].name + " bids "+ bids[player].bid);
}

team0.getTeamBid();
team1.getTeamBid();
// 🚸 Move this to team.announceBid(), add conditional for announcing nils or blind nills;
console.log("- - -\n" + team0.name + "'s total bid is " + team0.bid[2])
console.log(team1.name + "'s total bid is " + team1.bid[2])

hand.newTrick();
trick = hand.tricks[hand.tricks.length - 1];
console.log("\n👉 Trick " + (hand.tricks.length) + ":");
trick.announcePlayOrder();

for (p in trick.playOrder) {
  player = trick.playOrder[p];
  player.playCard(player.pickCard());
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");

hand.newTrick(trick);
trick = hand.tricks[hand.tricks.length - 1];
console.log("\n👉 Trick " + (hand.tricks.length) + ":");
trick.announcePlayOrder();

for (p in trick.playOrder) {
  player = trick.playOrder[p];
  player.playCard(player.pickCard());
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");

hand.newTrick(trick);
trick = hand.tricks[hand.tricks.length - 1];
console.log("\n👉 Trick " + (hand.tricks.length) + ":");
trick.announcePlayOrder();

for (p in trick.playOrder) {
  player = trick.playOrder[p];
  player.playCard(player.pickCard());
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " from " + trick.winner.team.name + " wins the trick with " + trick.winningCard.fullName + ".");

    console.log(team0.name + " has taken " + team0.tricks + " tricks.");
    console.log(team1.name + " has taken " + team1.tricks + " tricks.");


