import React from 'react'
import styled from 'styled-components'

const ScoreField = styled.div`
  padding: 20px;
  background-color: ${props => props.active ? '#eee' : 'none'};
  border-radius: 4px;
`

const Disc = styled.span`
  display: inline-block;
  height: 9vh;
  width: 9vh;
  border-radius: 50%;
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
  font-size: 24px;
  vertical-align: middle;
`

const Score = ({ item: { active, disc, score } }) => {
  return (
    <ScoreField active={active}>
      {
        disc === 1 ? <WhiteDisc /> : <BlackDisc />
      }
      <Points>{score}</Points>
    </ScoreField>
  )
}

export default Score
