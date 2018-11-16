import React from 'react'
import Game from './Game.jsx'
import Start from './Start.jsx'
import './app.css'

export default class App extends React.Component {
  render () {
    return (
      <React.Fragment>
        {window.location.pathname.match('^/game?(.*)$') && <Game />}
        {window.location.pathname.match('^/$') && <Start />}
      </React.Fragment>
    )
  }
}
