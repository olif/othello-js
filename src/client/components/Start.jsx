import React from 'react'
import styled from 'styled-components'

import Logo from './Logo.jsx'

const Box = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #226b46;
  align-items: center;
  justify-content: center;
`

const Header = styled.h1`
  text-align: center;
  color: white;
  font-size: 4em;
  margin: 20px;
  font-family: 'Satisfy', cursive;
`

const PlayButton = styled.button`
  font-size: 24px;
  padding: 8px 20px;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-family: 'Lato', sans-serif;

  &:hover {
    cursor: pointer;
    background-color: #eee;
  }
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
        <Header>Othello.</Header>
        <PlayButton onClick={this.createNewGame}>Play</PlayButton>
      </Box>
    )
  }
}
