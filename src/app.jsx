const React = require('react');
const ReactDOMClient = require('react-dom/client');

const App = require('./components/App');

var pollInterval = 1000;
var gameIdLength = 4;
var botGameIdLength = 30;

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);

root.render(
  <App 
    pollInterval={pollInterval}
    gameIdLength={gameIdLength}
    botGameIdLength={botGameIdLength}
  />,
);
