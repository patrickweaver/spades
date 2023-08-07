import React from "react";
import styled from "styled-components";

const StyledCard = styled.div.attrs((props) => props)`
  background-image: ${(props) =>
    `url("/card-svg/${props.name}_of_${props.suitName}.svg")`};
  min-width: 62px;
  min-height: 90px;
  padding: 8px;
  border: 1px solid green;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  background-color: ${(props) =>
    props.isIllegal
      ? "#888"
      : props.isPlayed
      ? "green"
      : props.isWinner
      ? "yellow"
      : "none"};
  border-width: 4px;
  border-style: solid;
  border-color: ${(props) => (props.isWinner ? "orange" : "none")};
  opacity: ${(props) => (props.isIllegal || props.isPlayed ? 0.7 : 1.0)};
`;

const StyledLabel = styled.label.attrs((props) => props)`
  display: none;
  color: ${(props) => props.suitColor};
`;

function Card(props) {
  if (!props.card) return null;
  const isWinner =
    props.winner?.fullName && props.winner?.fullName === props.card?.fullName;
  const isIllegal = props.card.legal === false;
  const isPlayed = props.card.played;
  const suitColor =
    props.card.suitName === "hearts" || props.card.suitName === "diamonds"
      ? "red"
      : "black";

  return (
    <StyledCard
      isWinner={isWinner}
      isIllegal={isIllegal}
      isPlayed={isPlayed}
      onClick={props.onClickCard}
      name={props.card.name.toLowerCase()}
      suitName={props.card.suitName.toLowerCase()}
    >
      <StyledLabel suitColor={suitColor}>{props.card.fullName}</StyledLabel>
    </StyledCard>
  );
}

export default Card;
