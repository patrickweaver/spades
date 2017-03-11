var Hand = require("./classes/hand.js");
var Trick = require("./classes/trick.js");
var Player = require("./classes/player.js");
var Team = require("./classes/team.js");
var Card = require("./classes/card.js");
var Game = require("./classes/game.js");

var game;
var hand;
var team0;
var team1;
var trick;

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
  player.playCard(player.pickCard(), trick);
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");

hand.newTrick(trick);
trick = hand.tricks[hand.tricks.length - 1];
console.log("\n👉 Trick " + (hand.tricks.length) + ":");
trick.announcePlayOrder();

for (p in trick.playOrder) {
  player = trick.playOrder[p];
  player.playCard(player.pickCard(), trick);
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " wins the trick with " + trick.winningCard.fullName + ".");

hand.newTrick(trick);
trick = hand.tricks[hand.tricks.length - 1];
console.log("\n👉 Trick " + (hand.tricks.length) + ":");
trick.announcePlayOrder();

for (p in trick.playOrder) {
  player = trick.playOrder[p];
  player.playCard(player.pickCard(), trick);
}

trick.decideWinner();
console.log("- - -\n" + trick.winner.name + " from " + trick.winner.team.name + " wins the trick with " + trick.winningCard.fullName + ".");

    console.log(team0.name + " has taken " + team0.tricks + " tricks.");
    console.log(team1.name + " has taken " + team1.tricks + " tricks.");


