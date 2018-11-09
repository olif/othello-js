import React from 'react'
import styled from 'styled-components'

export default class Score extends React.Component {
  render () {
    const ScoreField = styled.div`
      padding: 20px;
      background-color: ${props => props.active ? '#ccc' : 'none'};
    `

    const Disc = styled.span`
      display: inline-block;
      height: 30px;
      width: 30px;
      border-radius: 30px;
      margin: 0 20px;
      vertical-align: middle;
    `

    const BlackDisc = styled(Disc)`
      background-color: black;
      box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.2);
    `

    const WhiteDisc = styled(Disc)`
      background-color: white;
      box-shadow: inset 0px 0px 0px 2px rgba(0,0,0,0.2);
    `

    const Points = styled.span`
      font-size: 30px;
      vertical-align: middle;
    `

    return (
      <ScoreField active={this.props.item.active}>
        {
          this.props.item.disc === 1 ? <WhiteDisc /> : <BlackDisc />
        }
        <Points>{this.props.item.score}</Points>
      </ScoreField>
    )
  }
}
