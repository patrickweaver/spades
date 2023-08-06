import React from 'react';

import Info from './Info';
import Game from './Game';

import makeRandString from '../helpers/makeRandString';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitPrompt = this.handleSubmitPrompt.bind(this);
    this.refreshData = this.refreshData.bind(this)
    this.getData = this.getData.bind(this);
    this.state = {
      update: 0,
      gameUpdate: "",
      stage: "loading",
      gameId: "",
      playerId: makeRandString(10),
      playerName: "",
      trickNumber: 0,
      prompt: {
        question: "",
        type: "",
        options: []
      },
      handCards: [],
      players: [],
      team: {},
      teamInfo: []
    }
  }

  componentDidMount() {
    this.refreshData()
    setInterval(this.refreshData, this.props.pollInterval);
  }

  refreshData(){
    this.getData(this.setState.bind(this));
  }

  postData(dataToSend) {
    console.log({ dataToSend })
    console.log("postData() -- start");
    dataToSend["stage"] = this.state.stage;
    // Don't add gameId if it was created in this step, it is already in this object.
    if (!dataToSend.gameId){
      dataToSend["gameId"] = this.state.gameId;
    }
    dataToSend["playerId"] = this.state.playerId;

    fetch("/api/game", {
      body: JSON.stringify(dataToSend),
      method: "POST",
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("postData() -- success");
        console.log({ data })
      })
    .catch((error) => {
        console.log("postData() Error:")
        console.error(err);
    })
  }

  getData(callback) {
    console.log("getData() -- start");
    var gameIdAtStart = this.state.gameId;
    const url = "/api/game/" + this.state.gameId + "?" + new URLSearchParams({
        update: this.state.update,
        playerId: this.state.playerId,
        playerName: this.state.playerName,
        stage: this.state.stage
      })
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("getData() -- success");
        if (gameIdAtStart === this.state.gameId){     
          callback(data);
        } else {
          this.getData(this.setState.bind(this));
        }
      })
      .catch((error) => {
        console.error("getData() Error:")
        console.error("GameId: " + this.state.gameId, "PlayerId: " + this.state.playerId)
        console.error({ error })
      })
  }

  handleSubmitPrompt(input) {
    console.log(input);
    console.log(typeof input);
    var postObject = {};
    if (typeof input === "string" || typeof input === "number"){
      postObject = {
        input: input.toString()
      }
      if (postObject.input === "") {
        return;
      }
    } else {
      switch(input["option"]){
          
        case "New Game":
        case "Bot Game":
          if (input["option"] === "Bot Game"){
            var gameId = makeRandString(this.props.botGameIdLength);
          } else {
            var gameId = makeRandString(this.props.gameIdLength);
          }
          
          this.setState({
            gameId: gameId
          });
          postObject = {
            input: input["option"],
            gameId: gameId,
            update: this.state.update
          }
          break;
          
 
        // Play a game with the same players:
        case "Start New Game":
          postObject.newGameId = makeRandString(this.props.gameIdLength);
          break;
  
        default:
          // "Start Game"
          // Submitting which button was pressed;
          postObject = {
            input: input["option"]
          }
          break;
      }
    }
    this.postData(postObject);
    this.setState({
      prompt: {
        question: "",
        type: "",
        options: []
      }
    });
  }
  
  illegalCard() {
    alert("Illegal Card!");
  }
  
  // 🚸 This should be merged with the same function in player.js
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
  
  playCard(card) {
    if (this.state.stage === "playNow") {
      // 🚸 Define these
      var hand = this.state.hand;
      var lastTrick = hand.tricks[hand.tricks.length - 1];
      var handCards = this.state.handCards;
      var playedCard = handCards[card];
      if (this.isLegalCard(lastTrick, handCards, playedCard)) {
        handCards[card].played = true;
        this.setState({
          stage: "justPlayed",
          handCards: handCards
        });
        this.handleSubmitPrompt(card);
      } else {
        this.illegalCard();
      }
    }
  }
  
  showMoreInfo() {
    const otherInfo = document.getElementById("other-info")
    const game = document.getElementById("game")
    otherInfo.style.display = (otherInfo.style.display === "none") ? "block" : "none";

    const infoHeight = game.style.top;
    const appHeight = document.window.height;
    console.log({ infoHeight, appHeight });
    if (parseInt(infoHeight)/parseInt(appHeight) < .21) {
      game.style.top = "50%";
    } else {
      game.style.top = "20%";
    }

    
  }

  render() {
    var playerTeam = {
      teamName: "",
      teamBid: ""
    }
    if (this.state.teamInfo){
      var foundPlayer = false;
      for (var t in this.state.teamInfo) {
        var team = this.state.teamInfo[t];
        for (var p in team.players) {
          var player = team.players[p];
          if (player.playerId === this.state.playerId) {
            playerTeam = team;
            foundPlayer = true;
            break;
          }
        }
        if (foundPlayer) {
          break;
        }
      }
    }
    
    return (
      <div id="app">
        <Info
          update={this.state.update}
          stage={this.state.stage}
          gameId={this.state.gameId}
          playerId={this.state.playerId}
          playerName={this.state.playerName}
          showMoreInfo={this.showMoreInfo}
        />
        <Game
          stage={this.state.stage}
          players={this.state.players}
          playerId={this.state.playerId}
          hand={this.state.hand}
          trickNumber={this.state.trickNumber}
          onPlayCard={this.playCard.bind(this)}
          teamInfo={this.state.teamInfo}
          bidOrder={this.state.bidOrder}
          handCards={this.state.handCards}
          prompt={this.state.prompt}
          onSubmitPrompt={this.handleSubmitPrompt}
        />
      </div>
    )
  }
}

export default App;