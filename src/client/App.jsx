'use strict'
import React, { Component } from 'react'
import GameBoard from './GameBoard.jsx'
import Start from './Start.jsx'
import './app.css'

export default class App extends React.Component {
  render () {
    return (
      <React.Fragment>
        {console.log(window.location.pathname)}
        {window.location.pathname.match('^/$') && <Start />}
        {window.location.pathname.match('^/game/(.*)$') && <GameBoard />}
      </React.Fragment>
    )
  }
}
