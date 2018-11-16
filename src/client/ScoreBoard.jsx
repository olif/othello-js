import React from 'react'
import Score from './Score.jsx'
import styled from 'styled-components'

const GameStatsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`

const ScoreBoard = ({ item: { whitePlayerScore, blackPlayerScore, turn } }) => {
  const whitePlayerItem = {
    disc: 1,
    score: whitePlayerScore,
    active: turn === 1
  }

  const blackPlayerItem = {
    disc: -1,
    score: blackPlayerScore,
    active: turn === -1
  }

  return (
    <GameStatsWrapper>
      <Score item={whitePlayerItem} />
      <Score item={blackPlayerItem} />
    </GameStatsWrapper>
  )
}

export default ScoreBoard
