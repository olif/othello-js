import React from 'react'

export default class Start extends React.Component {
  constructor () {
    super()
    this.gotoGame = this.gotoGame.bind(this)
  }

  gotoGame () {
    window.location.href = '/game/123'
  }

  render () {
    return (
      <div>
        <h1>Landingpage</h1>
        <button onClick={this.gotoGame}>Play</button>
      </div>
    )
  }
}
