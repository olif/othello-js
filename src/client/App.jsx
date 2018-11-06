'use strict'
import React from 'react'
import GameBoard from './GameBoard.jsx'
import Start from './Start.jsx'
import './app.css'

export default class App extends React.Component {
  createNewGame (playerName) {
    console.log(playerName)
  }

  render () {
    return (
      <React.Fragment>
        {console.log(window.location.pathname)}
        {window.location.pathname.match('^/$') && <Start newGame={this.createNewGame} />}
        {window.location.pathname.match('^/game/(.*)$') && <GameBoard />}
      </React.Fragment>
    )
  }
}
