import React from 'react'

export default class Start extends React.Component {
  constructor (props) {
    super(props)
    this.gotoGame = this.gotoGame.bind(this)
    this.updateInputValue = this.updateInputValue.bind(this)
    this.createNewGame = props.newGame
    this.state = {
      playerName: ''
    }
  }

  updateInputValue (evt) {
    console.log(evt)
    this.setState({
      playerName: evt.target.value
    })
  }

  gotoGame () {
    window.location.href = '/game/123'
  }

  render () {
    return (
      <div>
        <h1>Landingpage</h1>
        <button onClick={this.gotoGame}>Play</button>
        <br />
        <input type='text' id='playerName' onChange={evt => this.updateInputValue(evt)} value={this.state.playerName} />
        <button onClick={() => this.createNewGame(this.state.playerName)}>Create new game</button>
      </div>
    )
  }
}
