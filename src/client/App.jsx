import React from 'react'
import Game from './Game.jsx'
import Start from './Start.jsx'
import './app.css'

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

const urlParams = new URLSearchParams(window.location.search)
const invitationToken = urlParams.get('invitation-token')
if (invitationToken && window.location.pathname.match('/join?(.*)')) {
  console.log(invitationToken)
  joinGame(invitationToken)
}

export default class App extends React.Component {
  render () {
    return (
      <>
        {window.location.pathname.match('^/game?(.*)$') && <Game />}
        {window.location.pathname.match('^/$') && <Start />}
      </>
    )
  }
}
