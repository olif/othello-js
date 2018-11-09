import React from 'react'
import Score from './Score.jsx'
import styled from 'styled-components'

const GameStatsWrapper = styled.div`
  display: block;
`

export default class ScoreBoard extends React.Component {
  render () {
    const whitePlayerItem = {
      disc: 1,
      score: this.props.item.whitePlayerScore,
      active: this.props.item.turn === 1
    }

    const blackPlayerItem = {
      disc: -1,
      score: this.props.item.blackPlayerScore,
      active: this.props.item.turn === -1
    }

    return (
      <GameStatsWrapper>
        <Score item={whitePlayerItem} />
        <Score item={blackPlayerItem} />
      </GameStatsWrapper>
    )
  }
}
