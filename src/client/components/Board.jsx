import React from 'react'
import styled from 'styled-components'

const GameBoard = styled.table`
  border-collapse: collapse;
  margin: 0 auto;
`

const BoardRow = styled.tr``

const BoardCell = styled.td`
  border: 1px solid #226b46;
  background-color: #339966;
  text-align: center;
  vertical-align: middle;
`

const FrameCell = styled.th`
  background-color: #226b46;
  padding: 10px 20px;
  color: #339966;
  font-weight: normal;
`

const Disc = styled.span`
  display: inline-block;
  width: 50px;
  height: 50px;
  margin: 5px;
  border-radius: 50px;
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

const GridX = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '']

const Board = ({ item: { board, disc, actions } }) => {
  return (
    <GameBoard>
      <thead>
        <BoardRow>
          {
            GridX.map((char, nr) => <FrameCell key={`head-${char}-${nr}`}>{char}</FrameCell>)
          }
        </BoardRow>
      </thead>
      <tbody>
        {
          board.map((row, i) => {
            return (
              <BoardRow key={`${i}`}>
                {
                  ['Frame', ...row, 'Frame'].map((col, j) => {
                    return (
                      col === 'Frame'
                        ? <FrameCell key={`${i}-${j}`}>{i + 1}</FrameCell>
                        : <BoardCell key={`${i}-${j}`} onClick={() => actions.makeMove({ x: j - 1, y: i })}>
                          {{
                            0: <BlackDisc />,
                            1: <EmptyDisc disc={disc} />,
                            2: <WhiteDisc />
                          }[col + 1]}
                        </BoardCell >
                    )
                  })
                }
              </BoardRow>
            )
          })
        }
      </tbody>
      <tfoot>
        <BoardRow>
          {
            GridX.map((char, nr) => <FrameCell key={`foot-${char}-${nr}`}>{char}</FrameCell>)
          }
        </BoardRow>
      </tfoot>
    </GameBoard>
  )
}

export default Board
