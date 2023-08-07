import React from 'react';
import App from './components/App';

var pollInterval = 6000;

export default function AppContainer() {
  return (<App 
    pollInterval={pollInterval}
  />)
}
