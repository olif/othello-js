import React from 'react'

export default class StatusModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
    this.isVisible = this.isVisible.bind(this)
    this.getMessage = this.getMessage.bind(this)
    this.onNewGameBtn = this.onNewGameBtn.bind(this)

    console.log(props.statsForGameFunc)

    this.state = {
      game: props.game,
      statsForGameFunc: props.statsForGameFunc
    }
  }

  isVisible () {
    return this.state.game.status === 'finished'
  }

  handleClose (e) {
    this.setState({ visible: false })
  }

  getMessage () {
    if (this.state.game.status !== 'finished') {
      return 'Game not finished'
    }

    const myDisc = this.state.game.disc
    const whitePlayerPoints = this.state.statsForGameFunc(1)
    const blackPlayerPoints = this.state.statsForGameFunc(-1)

    if (whitePlayerPoints > blackPlayerPoints) {
      if (myDisc === 1) {
        return 'You win'
      } else if (myDisc === -1) {
        return 'You loose'
      }
    } else if (blackPlayerPoints > whitePlayerPoints) {
      if (myDisc === -1) {
        return 'You win'
      } else if (myDisc === 1) {
        return 'You loose'
      }
    } else {
      return 'Draw'
    }
  }

  onNewGameBtn () {
    window.location.href = '/'
  }

  componentWillReceiveProps (nextProps, nextState) {
    this.setState({ game: nextProps.game })
  }

  render () {
    return (
      <div className={'modal' + (this.isVisible() ? ' visible' : ' hidden')}>
        <div className='modal-content'>
          <span className='close' onClick={this.handleClose}>&times;</span>
          <p>{this.getMessage()}</p>
          <button onClick={this.onNewGameBtn}>New Game</button>
        </div>
      </div>
    )
  }
}
