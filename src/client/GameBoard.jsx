import React from 'react'

export default class GameBoard extends React.Component {
  constructor () {
    super()
    this.state = {
      currentState: [
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

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (i, j) {
    let newState = this.state.currentState.slice()
    newState[i][j] = 1
    this.setState({ currentState: newState })
  }

  render () {
    return (
      <table className='gameboard board-white-player'>
        <tbody>
          {
            this.state.currentState.map((row, i) => {
              return (
                <tr key={i}>
                  {
                    row.map((col, j) => {
                      return (
                        <td key={`${i},${j}`} onClick={() => this.handleClick(i, j)}>
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
