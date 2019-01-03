import React from 'react'
import styled from 'styled-components'

const Modal = styled.div`
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #226b46;
  background-color: rgba(85, 112, 101, 0.5);
  display: ${props => props.visible ? 'block' : 'none'};
`

const ModalContent = styled.div`
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border-radius: 4px;
  width: 80%;
`

const CloseBtn = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  &:after {
    content: '\00d7';
  }

  &:hover, &:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
`

const Text = styled.p`
  display: block;
  float: clear;
  text-align: center;
  padding: 20px;
  font-size: 18px;
`

const Actions = styled.div`
  display: flex;
`

const ActionBtn = styled.button`
  display: block;
  flex-grow: 1;
  padding: 16px 20px;
  border: none;
  font-size: 18px;
  background-color: ${props => props.primary ? '#008CBA' : props.secondary ? '#32CD32' : '#f44336'};
  color: white;
`

export default class StatusModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = { closed: false }

    this.closeModal = this.closeModal.bind(this)
    this.isVisible = this.isVisible.bind(this)
    this.getMessage = this.getMessage.bind(this)
    this.onRematchBtn = this.onRematchBtn.bind(this)
    this.onNewGameBtn = this.onNewGameBtn.bind(this)
    this.getRematchAction = this.getRematchAction.bind(this)
  }

  isVisible () {
    return !this.state.closed && this.props.item.status === 'finished'
  }

  closeModal () {
    this.setState({ closed: true })
  }

  getMessage () {
    if(this.props.item.status === 'pendning' || this.props.item.status === 'waiting for opponent'){
      return 'Game is not finished yet!'
    }
    const myDisc = this.props.item.disc
    const whitePlayerScore = this.props.item.whitePlayerScore
    const blackPlayerScore = this.props.item.blackPlayerScore

    let scoreDiff = myDisc * (whitePlayerScore - blackPlayerScore)
    if (scoreDiff > 0) {
      return 'You win'
    } else if (scoreDiff < 0) {
      return 'You loose'
    } else {
      return 'Draw'
    }
  }

  onRematchBtn () {
    this.props.onRematch(this.props.item.status === 'finished' ? 'request' : 'accept');
  }

  onNewGameBtn () {
    window.location.href = '/'
  }

  getRematchAction (status) {
    switch (status) {
      case 'finished':
        return 'Request rematch'

      case 'rematch requested':
        return 'Accept rematch request'

      case 'await rematch response':
        return 'Awaiting response'
    }
  }

  render () {
    return (
      <Modal visible={!this.state.closed && (this.props.item.status === 'finished' || this.props.item.status === 'rematch requested' || this.props.item.status === 'await rematch response')}>
        <ModalContent>
          <CloseBtn onClick={this.closeModal} />
          <Text>
            {
              this.getMessage()
            }
          </Text>
          <Actions>
            <ActionBtn primary onClick={this.onRematchBtn} disabled={this.props.item.status === 'await rematch response'}> {this.getRematchAction(this.props.item.status)} </ActionBtn>
            <ActionBtn secondary onClick={this.onNewGameBtn}>New Game</ActionBtn>
            <ActionBtn onClick={this.onNewGameBtn}>Quit</ActionBtn>
          </Actions>
        </ModalContent>
      </Modal>
    )
  }
}
