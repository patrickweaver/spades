const React = require('react');
const ReactDOM = require('react-dom');

const App = require('./components/App');

var pollInterval = 1000;
var gameIdLength = 4;
var botGameIdLength = 30;

ReactDOM.render(
  <App 
    pollInterval={pollInterval}
    gameIdLength={gameIdLength}
    botGameIdLength={botGameIdLength}
  />,
  document.getElementById('root')
);
