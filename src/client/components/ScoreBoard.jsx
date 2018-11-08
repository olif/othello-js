import React from 'react'
import Score from './Score.jsx'
import styled from 'styled-components'

export default class ScoreBoard extends React.Component {
  render () {
    const GameStatsWrapper = styled.div`
      display: block;
    `

    const whitePlayerItem = {
      disc: 1,
      score: this.props.item.actions.getStatsForDisc(1),
      active: this.props.item.game.turn === 1
    }

    const blackPlayerItem = {
      disc: -1,
      score: this.props.item.actions.getStatsForDisc(-1),
      active: this.props.item.game.turn === -1
    }

    return (
      <GameStatsWrapper>
        <Score item={whitePlayerItem} />
        <Score item={blackPlayerItem} />
      </GameStatsWrapper>
    )
  }
}
