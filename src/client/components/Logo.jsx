import React from 'react'
import styled from 'styled-components'

const Disc = styled.span`
  display: inline-block;
  width: 60px;
  height: 60px;
  margin: 6px;
  border-radius: 60px;
`
const WhiteDisc = styled(Disc)`
  background-color: white;
  box-shadow: inset 0px 0px 0px 2px rgba(0,0,0,0.2);
`

const BlackDisc = styled(Disc)`
  background-color: black;
  box-shadow: inset 0px 0px 0px 2px rgba(255,255,255,0.2);
`

export default class Logo extends React.Component {
  render () {
    return (
      <table>
        <tbody>
          <tr>
            <td><WhiteDisc /></td>
            <td><BlackDisc /></td>
          </tr>
          <tr>
            <td><BlackDisc /></td>
            <td><WhiteDisc /></td>
          </tr>
        </tbody>
      </table>
    )
  }
}
