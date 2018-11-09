import React from 'react'
import styled from 'styled-components'

import Logo from './Logo.jsx'

const Box = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #339966;
  align-items: center;
  justify-content: center;
`

const Header = styled.h1`
  text-align: center;
  color: white;
`

const PlayButton = styled.button`
  padding: 15px 32px;
  border: none;
  font-size: 18px;
  background-color: white;
  color: black;
  font-weight: bold;
  box-shadow: inset 0px 0px 0px 2px rgba(0,0,0,0.2);
`

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
      <Box>
        <Logo />
        <Header>Huskutlir</Header>
        <PlayButton onClick={this.createNewGame}>Play</PlayButton>
      </Box>
    )
  }
}
