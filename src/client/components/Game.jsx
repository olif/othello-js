import React from 'react'
import Board from './Board.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import StatusModal from './StatusModal.jsx'
import styled from 'styled-components'

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.getBoardStyle = this.getBoardStyle.bind(this)
    this.getStatsForDisc = this.getStatsForDisc.bind(this)

    const urlParams = new URLSearchParams(window.location.search)
    let token = urlParams.get('token')
    let invitationToken = urlParams.get('invitation-token')

    this.state = {
      token: token,
      invitationToken: invitationToken,
      game: {
        disc: 0,
        turn: 0,
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

    const ws = new window.WebSocket(`ws://localhost:3000/api?token=${token}`)
    ws.onmessage = (event) => {
      console.log(event)
      const game = JSON.parse(event.data)

      const board = this.state.game.board
      const disc = this.state.game.disc
      game.discsToFlip.map(val => {
        board[val.y][val.x] = game.board[val.y][val.x]
      })

      this.setState({ game: { board: board, turn: game.turn, disc: disc } })
    }

    this.handleClick = this.handleClick.bind(this)
    this.getAndSetInitialState = this.getAndSetInitialState.bind(this)
  }

  componentWillMount () {
    this.getAndSetInitialState()
  }

  getAndSetInitialState () {
    window.fetch(`/api/game?token=${this.state.token}`)
      .then((resp) => resp.json())
      .then((game) => {
        console.log('setting state')
        this.setState({
          game: game.state
        })
      })
      .catch((error) => console.log(error))
  }

  getStatsForDisc (disc) {
    return this.state.game.board.flatMap(x => x).reduce((acc, val) => acc + (val === disc ? 1 : 0))
  }

  handleClick (x, y) {
    window.fetch(`/api/make-move?token=${this.state.token}`,
      {
        method: 'POST',
        body: JSON.stringify({ x: x, y: y }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then((resp) => resp.json())
      .then((game) => {

      })
      .catch((error) => console.log(error))
  }

  getBoardStyle () {
    switch (this.state.game.disc) {
      case 0:
        return ''
      case 1:
        return 'board-white-player'
      case -1:
        return 'board-black-player'
    }
  }

  render () {
    const statsState = {
      game: this.state.game
    }

    const statsActions = {
      getStatsForDisc: this.getStatsForDisc
    }

    const stats = {
      ...statsState,
      actions: statsActions
    }

    const boardState = {
      board: this.state.game.board,
      disc: this.state.game.disc
    }

    const boardActions = {
      getBoardStyle: this.getBoardStyle,
      handleClick: this.handleClick
    }

    const board = {
      ...boardState,
      actions: boardActions
    }

    const Grid = styled.div`
      display: flex;
    `

    const Column = styled.div`
      flex: 1,
      margin: 0;
    `

    const LeftColumn = styled(Column)`
      display: flex;
      align-items: center;
      justify-content: center;
    `

    return (
      <Grid>
        <LeftColumn>
          <ScoreBoard item={stats} />
        </LeftColumn>
        <Column>
          <Board item={board} />
        </Column>
        <Column>
          rightcol
        </Column>
        <StatusModal game={this.state.game} statsForGameFunc={this.getStatsForDisc} />
      </Grid>
    )
  }
}
