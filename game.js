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

console.log("Game Starting!");

game = new Game();
team0 = game.teams[0];
team1 = game.teams[1];

console.log("Team 0: " + team0.players[0].name + " and " + team0.players[1].name);
console.log("Team 1: " + team1.players[0].name + " and " + team1.players[1].name);

hand = game.hands[game.hands.length - 1];
var deck = hand.deck;
hand.dealPlayers();

bids = hand.bidOrder;

console.log("\n🃏 Hands Dealt:");
for (player in bids) {
  bids[player].logHand();
}

console.log("\n📒 Bids:");
for (player in bids) {
  bids[player].setBid();
  console.log(bids[player].name + " bids "+ bids[player].bid);
}

var team0bid = team0.getTeamBid();
var team1bid = team1.getTeamBid();
console.log("- - -\n" + team0.name + "'s total bid is " + team0bid)
console.log(team1.name + "'s total bid is " + team1bid)

hand.playHand();

console.log("- - -\n" + team0.name + " got " + team0.getTeamHandScore()[0] + " points and " + team0.getTeamHandScore()[1] + " bags.");
console.log(team1.name + " got " + team1.getTeamHandScore()[0] + " points and " + team1.getTeamHandScore()[1] + " bags.");

team0.updateScore();
team1.updateScore();

console.log("- - -");
console.log(team0.name + "'s score is " + team0.score + team0.bags);
console.log(team1.name + "'s score is " + team1.score + team1.bags);


