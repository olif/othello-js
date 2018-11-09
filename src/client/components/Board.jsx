import React from 'react'
import styled from 'styled-components'

export default class Board extends React.Component {
  render () {
    const Board = styled.table`
      background-color: #339966;
      width: 600px;
      height: 600px;
      border-collapse: collapse;
      border: 1px solid #206040;
    `

    const BoardRow = styled.tr`
    `

    const BoardCell = styled.td`
      text-align: center;
      vertical-align: middle;
      border: 1px solid #206040;
    `

    const Disc = styled.span`
      display: inline-block;
      width: 60px;
      height: 60px;
      margin: 6px;
      border-radius: 60px;
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

    return (
      <Board>
        <tbody>
          {
            this.props.item.board.map((row, i) => {
              return (
                <BoardRow key={`${i}`}>
                  {
                    row.map((col, j) => {
                      return (
                        <BoardCell key={`${i}-${j}`} onClick={() => this.props.item.actions.makeMove({ x: j, y: i })}>
                          {{
                            1: <EmptyDisc disc={this.props.item.disc} />,
                            2: <WhiteDisc />,
                            0: <BlackDisc />
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
      </Board>
    )
  }
}
