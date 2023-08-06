import React from 'react';

import Stats from './Stats';
import Table from './Table';
import Hand from './Hand';
import Prompt from './Prompt';


class Game extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="game">
        <Stats
          stage={this.props.stage}
          trickNumber={this.props.trickNumber}
          players={this.props.players}
          playerId={this.props.playerId}
          teamInfo={this.props.teamInfo}
          bidOrder={this.props.bidOrder}
          hand={this.props.hand}
        />
        <div id="table-hand-container">
          <Table
            stage={this.props.stage}
            trickNumber={this.props.trickNumber}
            players={this.props.players}
            playerId={this.props.playerId}
            teamInfo={this.props.teamInfo}
            bidOrder={this.props.bidOrder}
            hand={this.props.hand}
          />
          <Hand
            handCards={this.props.handCards}
            playCard={this.props.onPlayCard}
          />
        </div>
        <div id="prompt-container">
          <Prompt
            question={this.props.prompt.question}
            type={this.props.prompt.type}
            options={this.props.prompt.options}
            onSubmitPrompt={this.props.onSubmitPrompt}
          />
        </div>
      </div>
    )
  }
}

export default Game;