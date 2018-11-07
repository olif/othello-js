import React from 'react'

export default class GameBoard extends React.Component {
  constructor (props) {
    super(props)
    this.getBoardStyle = this.getBoardStyle.bind(this)
    const urlParams = new URLSearchParams(window.location.search)
    let token = urlParams.get('token')
    let invitationToken = urlParams.get('invitation-token')

    this.state = {
      token: token,
      invitationToken: invitationToken,
      game: {
        disc: 0,
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
      let newState = this.state.game
      game.discsToFlip.map(val => {
        newState.board[val.y][val.x] = game.board[val.y][val.x]
      })
      this.setState({ game: newState })
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
        this.setState({
          game: game.state,
          disc: game.state.disc
        })
      })
      .catch((error) => console.log(error))
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
    return (
      <div>
        <table className={'gameboard ' + (this.getBoardStyle())}>
          <tbody>
            {
              this.state.game.board.map((row, i) => {
                return (
                  <tr key={i}>
                    {
                      row.map((col, j) => {
                        return (
                          <td key={`${i},${j}`} onClick={() => this.handleClick(j, i)}>
                            <Disk key={`${i},${j}`} value={col} />
                          </td>
                        )
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <a href={'../?invitation-token=' + this.state.invitationToken}>{this.state.invitationToken}</a>
      </div>
    )
  }
}

class Disk extends React.Component {
  constructor () {
    super()

    this.getClassName = this.getClassName.bind(this)
  }

  getClassName () {
    switch (this.props.value) {
      case 1:
        return 'disk white'
      case -1:
        return 'disk black'
      default:
        return 'disk none'
    }
  }

  render () {
    return (
      <span className={this.getClassName()} />
    )
  }
}
