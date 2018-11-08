import React from 'react'

export default class Start extends React.Component {
  constructor () {
    super()
    const urlParams = new URLSearchParams(window.location.search)
    let invitationToken = urlParams.get('invitation-token')
    if (invitationToken) {
      this.joinGame(invitationToken)
    }

    this.createNewGame = this.createNewGame.bind(this)
  }

  joinGame (invitationToken) {
    window.fetch(`api/join?token=${invitationToken}`, {
      method: 'POST'
    })
      .then((resp) => resp.json())
      .then((game) => {
        window.location = `/game?token=${game.playerToken}`
      })
      .catch((error) => console.log(error))
  }

  createNewGame () {
    window.fetch('api/new', { method: 'POST' })
      .then((resp) => resp.json())
      .then((game) => {
        window.location = `/game?token=${game.playerToken}&invitation-token=${game.invitationToken}`
      }).catch((error) => {
        console.log(`Error: ${error}`)
      })
  }
  render () {
    return (
      <div className='start-page'>
        <h1>Huskutlir</h1>
        <button onClick={this.createNewGame}>Play</button>
      </div>
    )
  }
}
