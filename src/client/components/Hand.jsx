import React from "react";

import Card from "./Card";

function Hand(props) {
  const handCards = props.handCards.map((card, index) => (
    <li key={index}>
      <div className="card-container">
        <Card card={card} onClickCard={() => props.playCard(index)} />
      </div>
    </li>
  ));
  return (
    <div id="hand">
      <ul>{handCards}</ul>
    </div>
  );
}

export default Hand;
