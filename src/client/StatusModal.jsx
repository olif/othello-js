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
  background-color: ${props => props.primary ? '#008CBA' : '#f44336'};
  color: white;
`

export default class StatusModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = { closed: false }

    this.closeModal = this.closeModal.bind(this)
    this.isVisible = this.isVisible.bind(this)
    this.getMessage = this.getMessage.bind(this)
    this.onNewGameBtn = this.onNewGameBtn.bind(this)
  }

  isVisible () {
    return !this.state.closed && this.props.item.status === 'finished'
  }

  closeModal () {
    this.setState({ closed: true })
  }

  getMessage () {
    if (this.props.item.status !== 'finished') {
      return 'Game is not finished'
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

  onNewGameBtn () {
    window.location.href = '/'
  }

  render () {
    return (
      <Modal visible={!this.state.closed && this.props.item.status === 'finished'}>
        <ModalContent>
          <CloseBtn onClick={this.closeModal} />
          <Text>
            {
              this.getMessage()
            }
          </Text>
          <Actions>
            <ActionBtn primary onClick={this.onNewGameBtn}>New Game</ActionBtn>
            <ActionBtn onClick={this.onNewGameBtn}>Quit</ActionBtn>
          </Actions>
        </ModalContent>
      </Modal>
    )
  }
}
