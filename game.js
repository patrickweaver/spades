console.log("Game!");

class Hand {
  constructor(handNumber, teams) {
    this.handNumber= handNumber;
    this.firstBid = this.getFirstBidder(handNumber, teams);
  }
  getFirstBidder(handNumber, teams) {
    var turn = handNumber % 4;
    var team = turn % 2;
    var partner = Math.floor(turn/2);
    return teams[team].players[partner];
  }
}

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
  }
  dealHand(cards) {
    return cards;
  }
}

class Team {
  constructor(players) {
    this.players = players;
    this.score = 0;
    this.bags = 0;
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
      this.fullName = suit + name;
    } else {
      this.fullName = suit + "" + name[0];
    }
  }
}

class PlayerHand {
  constructor(hand, cards, bid) {
    this.hand = hand;
    this.cards = cards;
  }
}

var a = new Player("a");
var b = new Player("b");
var c = new Player("c");
var d = new Player("d");

var players = [a,b,c,d];

function selectTeams(players) {
  var sides = [0, 1, 2, 3];
  times = sides.length;
  for (var i = 0; i < times; i++) {
   sides.splice(sides.length, 0, sides.splice(Math.floor(Math.random() * sides.length - i), 1)[0]);
  }
  team1 = new Team([players[sides[0]], players[sides[1]]]);
  team2 = new Team([players[sides[2]], players[sides[3]]]);
  return team1, team2;
}

var team1;
var team2;
selectTeams(players, team1, team2);

console.log("Team 1: ");
console.log(team1.players);
console.log("Team 2: ");
console.log(team2.players);

var game = new Game([team1, team2]);

console.log("GAME:");
console.log(game.teams[0]);
console.log(game.teams[1]);
console.log(game.hands);

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
}

dealHands();

/*
console.log("A's Hand:");
console.log(a.hand);
console.log("B's Hand:");
console.log(b.hand);
console.log("C's Hand:");
console.log(c.hand);
console.log("D's Hand:");
console.log(d.hand);
*/

//Start a round
//Figure out who is first bid
//Bid