import React from 'react'
import Board from './Board.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import StatusModal from './StatusModal.jsx'
import styled from 'styled-components'

const Grid = styled.div`
  display: flex;
`

const Column = styled.div`
  flex: 1;
  margin: 0;
`

const LeftColumn = styled(Column)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export default class Game extends React.Component {
  constructor (props) {
    super(props)

    const urlParams = new URLSearchParams(window.location.search)
    let token = urlParams.get('token')
    let invitationToken = urlParams.get('invitation-token')

    this.state = {
      token: token,
      invitationToken: invitationToken,
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
      const game = JSON.parse(event.data)
      console.log(game)
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
    }

    this.makeMove = this.makeMove.bind(this)
    this.getStatsForDisc = this.getStatsForDisc.bind(this)
  }

  componentDidMount () {
    window.fetch(`/api/game?token=${this.state.token}`)
      .then((resp) => resp.json())
      .then((game) => {
        this.setState({
          game: game.state
        })
      })
      .catch((error) => console.log(error))
  }

  getStatsForDisc (disc) {
    return this.state.game.board.flatMap(x => x).reduce((acc, val) => acc + (val === disc ? 1 : 0))
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

  render () {
    const whitePlayerScore = this.getStatsForDisc(1)
    const blackPlayerScore = this.getStatsForDisc(-1)

    const invitationUrl = `http://${window.location.host}?invitation-token=${this.state.invitationToken}`

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
        <LeftColumn>
          <ScoreBoard item={scores} />
        </LeftColumn>
        <Column>
          <Board item={board} />
        </Column>
        <Column>
          {
            this.state.invitationToken ? <a href={invitationUrl}> {invitationUrl} </a> : <p />
          }
        </Column>
      </Grid>
    )
  }
}
