import React from 'react'
import styled from 'styled-components'

const StatusLight = styled.span`
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ccc;
`

const Connected = styled(StatusLight)`
    background-color: green;
`

const Disconnected = styled(StatusLight)`
    background-color: red;
`

const PlayerStatus = ({ item: { opponentStatus } }) => {
  return (
    <div>
      {{
        'not connected': <p><StatusLight /> No opponent yet</p>,
        'connected': <p><Connected /> Opponent is connected</p>,
        'disconnected': <p><Disconnected />Opponent has disconnected</p>

      }[opponentStatus]}
    </div>
  )
}

export default PlayerStatus
