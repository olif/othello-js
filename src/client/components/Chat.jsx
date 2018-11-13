import React from 'react'
import styled from 'styled-components'

import PlayerStatus from './PlayerStatus.jsx'

const ChatArea = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`

const Conversation = styled.ul`
    list-style: none;
    padding: 2em 0;
    margin: 0;
    overflow-y: scroll;
    max-height: 400px;
    flex: 1;
`

const MyMessage = styled.li`
    text-align: right;
    padding: 0 0.75em;
    margin-bottom: .375em;
    > span {
        background-color: rgba(177,217,164,.5);
        border-radius: 3px;
        display: inline-block;
        max-width: 75%;
        padding: 0.5em;
    }
`

const TheirMessage = styled.li`
    text-align: left;
    padding: 0 0.75em;
    margin-bottom: .375em;
    > span {
        background-color: rgba(204, 240, 255, .5);
        border-radius: 3px;
        display: inline-block;
        max-width: 75%;
        padding: 0.5em;
    }
`

const InputText = styled.textarea`
    border: 1px solid #ccc;
    font-size: 1em;
    padding: 0.75em;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    margin: 2em 0;
`

const Chat = ({ item: { conversation, opponentStatus, actions } }) => {
  const sendMessage = function (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      actions.sendMessage(e.target.value)
      e.target.value = ''
    }
  }

  return (
    <ChatArea>
      <PlayerStatus item={{ opponentStatus: opponentStatus }} />
      <Conversation>
        {
          conversation.map((item, i) => {
            return (
              item.player === 'mine'
                ? <MyMessage key={i}><span>{item.message}</span></MyMessage>
                : <TheirMessage key={i}><span>{item.message}</span></TheirMessage>
            )
          })
        }
      </Conversation>
      <InputText placeholder='Write and press enter to send message' onKeyPress={sendMessage} />
    </ChatArea>
  )
}

export default Chat
