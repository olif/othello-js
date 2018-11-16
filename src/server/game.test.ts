import * as games from './game'
import { gameStatus } from '../common'

test('can create a new game', () => {
  const state = games.newGame({ name: 'WhitePlayer', token: 'abc' }) as games.State

  expect(state.status).toBe(gameStatus.STATUS_WAITING_FOR_OPPONENT)
})

test('can join game', () => {
  let state = games.newGame({ name: 'WhitePlayer', token: 'abc' }) as games.State

  state = games.join(state.id, { name: 'BlackPlayer', token: 'cba' }) as games.State

  expect(state.status).toBe(gameStatus.STATUS_PENDING)
})

test('cannot join already joined game', () => {
  let state = games.newGame({ name: 'WhitePlayer', token: 'abc' }) as games.State
  games.join(state.id, { name: 'BlackPlayer', token: 'bca' })

  const maybeJoinErr = games.join(state.id, { name: 'BlackPlayer', token: 'cccc' });
  state = games.state(state.id, { token: 'bca' }) as games.State

  expect(games.isError(maybeJoinErr)).toBeTruthy()
  expect(maybeJoinErr).toMatchObject(new Error('Cannot join already joined game'))
  expect(state.turn).toBe(1)
})

test('can make opening move', () => {
  const player = { name: 'Arne', token: 'Abcs' }
  let state = games.newGame(player) as games.State
  state = games.makeMove(state.id, player, { x: 4, y: 2 }) as games.State

  expect(state.discsToFlip).toMatchObject([{ x: 4, y: 2 }, { x: 4, y: 3 }])
  expect(state.turn).toBe(-1)
  expect(state.board).toMatchObject(fromPrettyBoard(
    [
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
      [' ', ' ', ' ', ' ', 'O', ' ', ' ', ' '], // 2
      [' ', ' ', ' ', 'O', 'O', ' ', ' ', ' '], // 3
      [' ', ' ', ' ', 'X', 'O', ' ', ' ', ' '], // 4
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
    ]// 0    1    2    3    4    5    6    7
  ))
})

test('cannot make simple invalid move', () => {
  const player = { name: 'Arne', token: 'adasca' }
  let state = games.newGame(player) as games.State
  state = games.makeMove(state.id, player, { x: 4, y: 6 }) as games.State

  expect(state.discsToFlip).toMatchObject([])
  expect(state.turn).toBe(1)
  expect(state.board).toMatchObject(fromPrettyBoard(
    [
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
      [' ', ' ', ' ', 'O', 'X', ' ', ' ', ' '], // 3
      [' ', ' ', ' ', 'X', 'O', ' ', ' ', ' '], // 4
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
    ])//  0    1    2    3    4    5    6    7
  )
})

test('cannot make move when it is not players turn', () => {
  const player = { name: 'Arne', token: 'testsa' }
  let state = games.newGame(player, undefined, games.Disc.BLACK_DISC) as games.State
  const error = games.makeMove(state.id, player, { x: 5, y: 4 })

  expect(games.isError(error)).toBeTruthy()
  expect(games.isOk(error)).toBeFalsy()
  expect(error).toMatchObject(new Error('Not players turn'))
})

test('can make multiple moves', () => {
  const whitePlayer = { name: 'White player', token: 'testsa' }
  const blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let state = games.newGame(whitePlayer) as games.State
  state = games.makeMove(state.id, whitePlayer, { x: 5, y: 3 }) as games.State

  expect(state.discsToFlip).toMatchObject([{ x: 5, y: 3 }, { x: 4, y: 3 }])
  expect(state.turn).toBe(-1)
  expect(state.board).toMatchObject(fromPrettyBoard(
    [
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 2
      [' ', ' ', ' ', 'O', 'O', 'O', ' ', ' '], // 3
      [' ', ' ', ' ', 'X', 'O', ' ', ' ', ' '], // 4
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
    ])//  0    1    2    3    4    5    6    7
  )

  games.join(state.id, blackPlayer);
  state = games.makeMove(state.id, blackPlayer, { x: 5, y: 2 }) as games.State

  expect(state.discsToFlip).toMatchObject([{ x: 5, y: 2 }, { x: 4, y: 3 }])
  expect(state.turn).toBe(1)
  expect(state.board).toMatchObject(fromPrettyBoard(
    [
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
      [' ', ' ', ' ', ' ', ' ', 'X', ' ', ' '], // 2
      [' ', ' ', ' ', 'O', 'X', 'O', ' ', ' '], // 3
      [' ', ' ', ' ', 'X', 'O', ' ', ' ', ' '], // 4
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
    ])//  0    1    2    3    4    5    6    7
  )
})

test('player can make multiple moves if there is no valid move for opponent', () => {
  const whitePlayer = { name: 'White player', token: 'testsa' }
  const blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let state = games.newGame(whitePlayer, fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 3
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7))
  ), -1) as games.State

  games.join(state.id, blackPlayer)

  games.makeMove(state.id, blackPlayer, { x: 7, y: 0 });
  state = games.state(state.id, { token: 'testsa' }) as games.State
  expect(state.board).toMatchObject(fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 3
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7
  ))

  expect(state.turn).toBe(games.Disc.BLACK_DISC)
})

test('game is finished when no player can make a move', () => {
  const whitePlayer = { name: 'White player', token: 'testsa' }
  const blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let state = games.newGame(whitePlayer, fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
    [' ', ' ', 'X', ' ', 'X', ' ', ' ', ' '], // 2
    [' ', ' ', 'X', 'O', 'X', ' ', ' ', ' '], // 3
    [' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7
  ), games.Disc.BLACK_DISC) as games.State
  games.join(state.id, blackPlayer);

  state = games.makeMove(state.id, blackPlayer, { x: 3, y: 2 }) as games.State

  expect(state.discsToFlip).toMatchObject([{ x: 3, y: 2 }, { x: 3, y: 3 }])
  expect(state.board).toMatchObject(fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
    [' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '], // 2
    [' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '], // 3
    [' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7
  ))
  expect(state.status).toBe(gameStatus.STATUS_FINISHED)
})

const fromPrettyBoard = function (arr: any) {
  let unprettyBoard: number[][] = []
  for (let i = 0; i < arr.length; i++) {
    unprettyBoard[i] = []
    for (let j = 0; j < arr.length; j++) {
      switch (arr[i][j]) {
        case ' ':
          unprettyBoard[i][j] = 0
          break
        case 'O':
          unprettyBoard[i][j] = 1
          break
        case 'X':
          unprettyBoard[i][j] = -1
          break
      }
    }
  }
  return unprettyBoard
}
