import React from 'react'
import styled from 'styled-components'

import PlayerStatus from './PlayerStatus.jsx'

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 72vh;
  margin: 0 2em;
`

const Conversation = styled.ul`
  list-style: none;
  overflow-y: scroll;
  flex: 1;
  padding: 1em;
`

const Message = styled.li`
    padding: 0 0.75em;
    margin-bottom: .375em;
    > span {
        background-color: rgba(177,217,164,.5);
        border-radius: 3px;
        display: inline-block;
        padding: 0.5em;
    }
`

const MyMessage = styled(Message)`
    text-align: right;
    > span {
        background-color: rgba(177,217,164,.5);
        max-width: 75%;
    }
`

const BotMessage = styled(Message)`
    text-align: center;
    > span {
        background-color: rgba(255,204,204,.5);
        max-width: 75%;
    }
`

const TheirMessage = styled(Message)`
    text-align: left;
    > span {
        background-color: rgba(204, 240, 255, .5);
        max-width: 75%;
    }
`

const InputText = styled.textarea`
    border: 2px solid #eee;
    font-size: 1em;
    padding: 0.75em;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    margin: 0;
    resize: none;
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
              {
                'mine': <MyMessage key={i}><span>{item.message}</span></MyMessage>,
                'their': <TheirMessage key={i}><span>{item.message}</span></TheirMessage>,
                'bot': <BotMessage key={i}><span>{item.message}</span></BotMessage>
              }[item.player]
            )
          })
        }
      </Conversation>
      <InputText placeholder='Write and press enter to send message' onKeyPress={sendMessage} />
    </ChatArea>
  )
}

export default Chat
