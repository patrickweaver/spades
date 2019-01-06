const React = require('react');

const Card = require('./Card');

class Hand extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const handCards = this.props.handCards.map((card, index) =>
      <li key={index} >
        <div className="card-container">
          <Card
            card={card}
            onClickCard={() => this.props.playCard(index)}
          />
        </div>
      </li>
    )
    return (
      <div id="hand">
        <ul>
          {handCards}
        </ul>
      </div>
    )
  }
}

module.exports = Hand;