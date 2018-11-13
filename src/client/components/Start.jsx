import React from 'react'
import styled from 'styled-components'

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
const joinGame = function (invitationToken) {
  window.fetch(`api/join?token=${invitationToken}`, {
    method: 'POST'
  })
    .then((resp) => resp.json())
    .then((game) => {
      window.location = `/game?token=${game.playerToken}`
    })
    .catch((error) => console.log(error))
}

const createNewGame = function () {
  window.fetch('api/new', { method: 'POST' })
    .then((resp) => resp.json())
    .then((game) => {
      window.location = `/game?token=${game.playerToken}&invitation-token=${game.invitationToken}`
    }).catch((error) => {
      console.log(`Error: ${error}`)
    })
}

const Start = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const invitationToken = urlParams.get('invitation-token')
  if (invitationToken) {
    console.log(invitationToken)
    joinGame(invitationToken)
  }

  return (
    <Box>
      <Header>Othello-js.</Header>
      <PlayButton onClick={createNewGame}>Play</PlayButton>
    </Box>
  )
}

export default Start
