import React from 'react'
import Board from './Board.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import StatusModal from './StatusModal.jsx'
import Chat from './Chat.jsx'

import styled from 'styled-components'

const GamePage = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`

const Grid = styled.div`
  display: flex;
  flex: 1;
`

const Column = styled.div`
  flex: 1;
`

const CenterColum = styled(Column)`
  flex: 2;
`

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60%;
`

const InvitationSection = styled.div`
  height: 20%;
  font-weight: bold;
  position: relative;
`

const InvitationLink = styled.textarea`
  font-size: 12px;
  cursor: pointer;
  border: none;
  width: 100%;
  resize: none;
  box-sizing: border-box;
`

const resolveOpponentStatus = function (gameStatus, opponentStatus) {
  console.log(gameStatus)
  console.log(opponentStatus)
  if (gameStatus === 'pending' && opponentStatus === 'not connected') return 'disconnected'
  else return opponentStatus
}

export default class Game extends React.Component {
  constructor (props) {
    super(props)

    const urlParams = new URLSearchParams(window.location.search)
    let token = urlParams.get('token')
    let invitationToken = urlParams.get('invitation-token')

    this.state = {
      token: token,
      invitationToken: invitationToken,
      opponentStatus: 'not connected',
      conversation: [],
      game: {
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
    }

    this.ws = new window.WebSocket(`ws://${window.location.host}/api?token=${token}`)
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.event) {
        case 'state-changed':
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
        case 'opponent-connected':
          this.setState({ opponentStatus: 'connected' })
          break
        case 'opponent-disconnected':
          this.setState({ opponentStatus: 'disconnected' })
          break
        case 'message':
          console.log(message)
          this.setState(prevState => ({
            conversation: [...prevState.conversation, { player: 'their', message: message.data }]
          }))
      }
    }

    this.makeMove = this.makeMove.bind(this)
    this.getStatsForDisc = this.getStatsForDisc.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount () {
    window.fetch(`/api/game?token=${this.state.token}`)
      .then((resp) => resp.json())
      .then((game) => {
        console.log(game)
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

  copyToClipboard (e) {
    e.target.select()
    document.execCommand('copy')
  }

  render () {
    const invitationUrl = `http://${window.location.host}?invitation-token=${this.state.invitationToken}`
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
          <StatusModal item={status} />
          <Column>
            <InvitationSection>
              Link to invite opponent. Click to copy.
              {
                this.state.invitationToken ? <InvitationLink readOnly onClick={this.copyToClipboard} value={invitationUrl} /> : <p />
              }
            </InvitationSection>
            <ScoreSection>
              <ScoreBoard item={scores} />
            </ScoreSection>
          </Column>
          <CenterColum>
            <Board item={board} />
          </CenterColum>
          <Column>
            <Chat item={chat} />
          </Column>
        </Grid >
      </GamePage>
    )
  }
}
