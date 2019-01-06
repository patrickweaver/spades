const React = require('react');

class Card extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    if (this.props.winner && this.props.card && this.props.winner.fullName === this.props.card.fullName) {
      var winner = "winner";
    } else {
      var winner = "";
    }
    
    if (this.props.card){
      const legal = this.props.card.legal === false? "illegal" : "legal";
      const played = this.props.card.played ? "played-card" : "";
      
      return(
        <div
          className={"card c-" + this.props.card.fullName + " " + winner + " " + played}
          onClick={this.props.onClickCard}
        >
          <div className={"card-overlay"  + " " + legal}></div>
          <p
            className={"suit-" + this.props.card.suitName}
            
          >
            {this.props.card.fullName}
          </p>
        </div>
      )
    } else {
      return null;
    }
  }
}

module.exports = Card;