import React from 'react';
import App from './components/App';

var pollInterval = 1000;
var gameIdLength = 4;
var botGameIdLength = 30;

export default function AppContainer() {
  return (<App 
    pollInterval={pollInterval}
    gameIdLength={gameIdLength}
    botGameIdLength={botGameIdLength}
  />)
}
