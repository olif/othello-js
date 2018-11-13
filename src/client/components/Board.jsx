import React from 'react'
import styled from 'styled-components'

const GameBoard = styled.table`
  border-collapse: collapse;
  height: 72vh;
  width: 72vh;
`

const Row = styled.tr`
`

const Frame = styled.td`
  background-color: #226b46;
  box-sizing: border-box;
  color: #339966;
  font-weight: normal;
  text-align: center;
`

const TopFrame = styled(Frame)`
  vertical-align: bottom;
`

const BottomFrame = styled(Frame)`
  vertical-align: top;
`

const Corner = styled(Frame)`
  height: 4vh;
  width: 4vh;
`

const Cell = styled.td`
  border: 1px solid #226b46;
  background-color: #339966;
  text-align: center;
  vertical-align: middle;
  height: 8vh;
  width: 8vh;
  box-sizing: border-box;
`

const Disc = styled.span`
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
  height: 7vh;
  width: 7vh;
  border-radius: 50%;
`

const EmptyDisc = styled(Disc)`
  background: none;
  &:hover {
    background: ${props => props.disc === 1 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  }
`

const WhiteDisc = styled(Disc)`
  background-color: white;
  box-shadow: inset 0px 0px 0px 2px rgba(0,0,0,0.2);
`

const BlackDisc = styled(Disc)`
  background-color: black;
  box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.2);
`

const GridX = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const Board = ({ item: { board, disc, actions } }) => {
  return (
    <GameBoard>
      <thead>
        <Row>
          <Corner />
          {
            GridX.map((char, nr) => <TopFrame key={`head-${char}-${nr}`}>{char}</TopFrame>)
          }
          <Corner />
        </Row>
      </thead>
      <tbody>
        {
          board.map((row, i) => {
            return (
              <Row key={`${i}`}>
                {
                  ['Frame', ...row, 'Frame'].map((col, j) => {
                    return (
                      col === 'Frame'
                        ? <Frame key={`${i}-${j}`}>{i + 1}</Frame>
                        : <Cell key={`${i}-${j}`} onClick={() => actions.makeMove({ x: j - 1, y: i })}>
                          {{
                            0: <BlackDisc />,
                            1: <EmptyDisc disc={disc} />,
                            2: <WhiteDisc />
                          }[col + 1]}
                        </Cell >
                    )
                  })
                }
              </Row>
            )
          })
        }
      </tbody>
      <tfoot>
        <Row>
          <Corner />
          {
            GridX.map((char, nr) => <BottomFrame key={`foot-${char}-${nr}`}>{char}</BottomFrame>)
          }
          <Corner />
        </Row>
      </tfoot>
    </GameBoard>
  )
}

export default Board
