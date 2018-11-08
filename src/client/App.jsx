import React from 'react'
import Game from './components/Game.jsx'
import Start from './components/Start.jsx'
import './app.css'

export default class App extends React.Component {
  render () {
    return (
      <React.Fragment>
        {window.location.pathname.match('^/$') && <Start />}
        {window.location.pathname.match('^/game?(.*)$') && <Game />}
      </React.Fragment>
    )
  }
}
