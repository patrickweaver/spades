var helpers = require("../helpers.js")();

class Team {
  constructor(players, teamNumber) {
    this.teamNumber = teamNumber;
    this.players = players;
    this.name = "";
    this.hexColor = this.randomFunColor();
    this.score = 0;
    this.scoreChange = "0";
    this.bags = 0;
    this.printableBid = "";
  } 
  
  randomFunColor() {
    var values = [];
    for (var i = 0; i < 3; i ++) {
      values.push(((Math.floor(Math.random() * 6) + this.teamNumber * 2) * 2) + this.teamNumber);
    }
    var sum = values[0] + values[1] + values[2];
    console.log(sum);
    if (sum > 9 && sum < 36) {
      return "#" + values[0].toString(16) + values[1].toString(16) + values[2].toString(16);
    } else {
      return this.randomFunColor();
    } 
  }

  getTeamBid() {
    var teammates = this.players;
    var teamBid = [];
    for (var player in teammates) {
      if (teammates[player].bid){
        teamBid[player] = teammates[player].bid;
      } else {
        teamBid[player] = "";
      }
    }
    var printableBid;
    if (teamBid[0] != "Nil" && teamBid[1] != "Nil") {
      printableBid = teamBid[0] + teamBid[1];
    } else {
      printableBid = teamBid[0].toString() + " and " + teamBid[1].toString(); 
    } 
    return printableBid;
  }
  
  carryBags() {
    for (var i = 0; i < 2; i++){
      if (this.bags > 9) {
        this.score -= 10;
        this.bags -= 10;
      }
    }
  }
  
  tallyNonNill(bid, tricksTaken) {
    var handScore = 0;
    var handBags = 0;
    if (tricksTaken >= bid) {
    // Team made their bid:
      handScore += bid;
      handBags = tricksTaken - bid;      
    } else {
    // Team did not make their bid:
      handScore -= bid;
    }
    this.score += handScore;
    this.bags += handBags;
    this.carryBags();
    
    return [handScore, handBags];
  }
  
  updateAfterHand(handNumber) {
    var tally = [];
    var handScore;
    var handBags;
    var bid = this.getTeamBid();
    if (typeof bid === "number") {
    // Both players have non nil bids:
      var teamTricksTaken = this.players[0].tricksTaken + this.players[1].tricksTaken;
      // tally = [handScore, handBags, playerId];
      var indTally = this.tallyNonNill(bid, teamTricksTaken);
      
      var indTally0 = indTally.slice();
      indTally0.push(this.players[0].playerId);
      indTally0.push(this.players[0].gameId);
      indTally0.push(this.players[0].tricksTaken);
      
      var indTally1 = indTally.slice();
      indTally1.push(this.players[1].playerId);
      indTally1.push(this.players[1].gameId);
      indTally1.push(this.players[1].tricksTaken);

      tally = [indTally0, indTally1];
      
    } else {
    // At least one player has a nil bid:
      var tempTally = [];
      for (var p in this.players) {
        var indTally = this.tallySinglePlayer(this.players[p]);
        indTally.push(this.players[p].playerId);
        indTally.push(this.players[p].gameId);
        indTally.push(this.players[p].tricksTaken);
        tempTally.push(indTally);
      }
      
      tally = [
        [
          tempTally[0][0] + tempTally[1][0],
          tempTally[0][1] + tempTally[1][1],
          tempTally[0][2],
          tempTally[0][3],
          tempTally[0][4]
        ],
        [
          tempTally[0][0] + tempTally[1][0],
          tempTally[0][1] + tempTally[1][1],
          tempTally[1][2],
          tempTally[1][3],
          tempTally[1][4]
        ],
      ]
      
    }
    
    /*
      tally:
      0. hand score
      1. hand bags
      2. playerId
      3. gameId
      4. player tricks taken
    */
    
    this.sendPlayerHandData(tally[0], handNumber);
    this.sendPlayerHandData(tally[1], handNumber);
    
    
  }
  
  tallySinglePlayer(player) {
    if (player.bid === "Nil") {
      var handScore = 0;
      if (player.tricksTaken === 0) {
      // Player made nil
        handScore += 10;
      } else {
      // Player did not make nil
        handScore -= 10;
      }
      this.score += handScore;
      return [handScore, 0];
    } else {
      // When partner goes nil tally score separately:
      return this.tallyNonNill(player.bid, player.tricksTaken);
    }
  }
  
  
  sendPlayerHandData(tally, handNumber) {
    var postData = {
      scoreChange: tally[0],
      bagsChange: tally[1],
      playerId: tally[2],
      gameId: tally[3],
      tricksTaken: tally[4],
      handNumber: handNumber
    };
    
    function callback(error, response, body) {
      if (error) {
        console.log("Error (" + response.status + "): " + error);
      }
    }
    
    helpers.sendToBot("hand-score", postData, false);
  }
}

module.exports = Team;
