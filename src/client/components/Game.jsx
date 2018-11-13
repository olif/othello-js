import React from 'react'
import Board from './Board.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import StatusModal from './StatusModal.jsx'
import PlayerStatus from './PlayerStatus.jsx'

import styled from 'styled-components'

const Grid = styled.div`
  display: flex;
  height: 100%;
`

const Column = styled.div`
  flex: 1;
  margin: 0;
  height: 100%;
`

const CenterColum = styled(Column)`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50%;
`

const InvitationSection = styled.div`
  height: 20%;
  font-weight: bold;
  position: relative;
  margin: 5% 5%;
`

const InvitationLink = styled.textarea`
  font-size: 12px;
  cursor: pointer;
  border: none;
  width: 100%;
  resize: none;
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

    const ws = new window.WebSocket(`ws://${window.location.host}/api?token=${token}`)
    ws.onmessage = (event) => {
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
      }
    }

    this.makeMove = this.makeMove.bind(this)
    this.getStatsForDisc = this.getStatsForDisc.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)
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

    const opponentStatus = {
      opponentStatus: this.state.opponentStatus
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
          <PlayerStatus item={opponentStatus} />
        </Column>
      </Grid >
    )
  }
}
