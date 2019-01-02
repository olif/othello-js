import React from 'react'
import Board from './Board.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import StatusModal from './StatusModal.jsx'
import Chat from './Chat.jsx'

import styled from 'styled-components'

const common = require('../common.js')

const GamePage = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Grid = styled.div`
  display: flex;
  flex: 1;
`

const Column = styled.div`
  flex: 1;
  margin 0 auto;
`

const ScoreSection = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const resolveOpponentStatus = function (gameStatus, opponentStatus) {
  return gameStatus === common.gameStatus.STATUS_PENDING &&
    opponentStatus === common.opponentStatus.NOT_CONNECTED
    ? common.opponentStatus.DISCONNECTED
    : opponentStatus
}

const gameInitStats = {
  disc: 0,
  turn: 0,
  status: null,
  board: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, -1, 0, 0, 0],
    [0, 0, 0, -1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
}

export default class Game extends React.Component {
  constructor (props) {
    super(props)

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const invitationToken = urlParams.get('invitation-token')
    const invitationUrl = `http://${window.location.host}/join?invitation-token=${invitationToken}`
    const botMsg = invitationToken ? [
      { player: 'bot', message: 'Invite opponent by sending them this link:' },
      { player: 'bot', message: invitationUrl }
    ] : [{ player: 'bot', message: 'Welcome!' }]

    this.state = {
      token: token,
      invitationToken: invitationToken,
      opponentStatus: common.opponentStatus.NOT_CONNECTED,
      conversation: botMsg,
      game: gameInitStats
    }

    this.ws = new window.WebSocket(`ws://${window.location.host}/api?token=${token}`)
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.event) {
        case common.events.STATE_CHANGED:
          const game = message.data
          const board = this.state.game.board
          const disc = this.state.game.disc

          game.discsToFlip.map(val => {
            board[val.y][val.x] = game.board[val.y][val.x]
          })

          this.setState({
            game: {
              board: board,
              turn: game.turn,
              disc: disc,
              status: game.status
            }
          })
          break
        case common.events.OPPONENT_CONNECTED:
          this.setState({ opponentStatus: common.opponentStatus.CONNECTED })
          break
        case common.events.OPPONENT_DISCONNECTED:
          this.setState({ opponentStatus: common.opponentStatus.DISCONNECTED })
          break
        case common.events.CHAT_MESSAGE:
          this.setState(prevState => ({
            conversation: [...prevState.conversation, { player: 'their', message: message.data }]
          }))
        case common.events.REMATCH:
          this.setState({ game: gameInitStats })
      }
    }

    this.makeMove = this.makeMove.bind(this)
    this.getStatsForDisc = this.getStatsForDisc.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.rematch = this.rematch.bind(this)
  }

  componentDidMount () {
    window.fetch(`/api/game?token=${this.state.token}`)
      .then((resp) => resp.json())
      .then((game) => {
        this.setState({
          game: game.state,
          opponentStatus: resolveOpponentStatus(game.state.status, game.opponentStatus)
        })
      })
      .catch((error) => console.log(error))
  }

  getStatsForDisc (disc) {
    let counter = 0
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.state.game.board[i][j] === disc) {
          counter++
        }
      }
    }
    return counter
  }

  makeMove (position) {
    window.fetch(`/api/make-move?token=${this.state.token}`,
      {
        method: 'POST',
        body: JSON.stringify(position),
        headers: { 'Content-Type': 'application/json' }
      })
      .catch((error) => console.log(error))
  }

  sendMessage (message) {
    this.ws.send(JSON.stringify({ type: 'chat', data: message }))
    this.setState(prevState => ({
      conversation: [...prevState.conversation, { player: 'mine', message: message }]
    }))
  }

  rematch () {
    window.fetch(`/api/rematch?token=${this.state.token}`,
      {
        method: 'POST',
        body: JSON.stringify({ name: 'mine'}),
        headers: { 'Content-Type': 'application/json' }
      })
      .catch((error) => console.log(error))
  }

  render () {
    const whitePlayerScore = this.getStatsForDisc(1)
    const blackPlayerScore = this.getStatsForDisc(-1)

    const scores = {
      turn: this.state.game.turn,
      whitePlayerScore: whitePlayerScore,
      blackPlayerScore: blackPlayerScore
    }

    const status = {
      disc: this.state.game.disc,
      whitePlayerScore: whitePlayerScore,
      blackPlayerScore: blackPlayerScore,
      status: this.state.game.status
    }

    const chatState = {
      conversation: this.state.conversation,
      opponentStatus: this.state.opponentStatus
    }

    const chatActions = {
      sendMessage: this.sendMessage
    }

    const chat = {
      ...chatState,
      actions: chatActions
    }

    const boardState = {
      board: this.state.game.board,
      disc: this.state.game.disc
    }

    const boardActions = {
      makeMove: this.makeMove
    }

    const board = {
      ...boardState,
      actions: boardActions
    }

    return (
      <GamePage>
        <Grid>
          <StatusModal item={status} onRematch={this.rematch} />
          <Column>
            <ScoreSection>
              <ScoreBoard item={scores} />
            </ScoreSection>
          </Column>
          <Column>
            <Board item={board} />
          </Column>
          <Column>
            <Chat item={chat} />
          </Column>
        </Grid >
      </GamePage>
    )
  }
}
