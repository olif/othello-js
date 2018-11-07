const games = require('./game')

test('can create a new game', () => {
  let [state, err] = games.newGame({ name: 'WhitePlayer', token: 'abc' })

  expect(err).toBeNull()
  expect(state.whitePlayer).toBe('WhitePlayer')
  expect(state.status).toBe(games.STATUS_WAITING_FOR_OPPONENT)
})

test('can join game', () => {
  let [state, err] = games.newGame({ name: 'WhitePlayer', token: 'abc' });

  ([state, err] = games.join(state.id, { name: 'BlackPlayer', token: 'cba' }))

  expect(err).toBeNull()
  expect(state.blackPlayer).toBe('BlackPlayer')
  expect(state.status).toBe(games.STATUS_PENDING)
})

test('cannot join already joined game', () => {
  let [state] = games.newGame({ name: 'WhitePlayer', token: 'abc' })
  games.join(state.id, { name: 'BlackPlayer', token: 'bca' })

  let [, failedJoinErr] = games.join(state.id, { name: 'BlackPlayer', token: 'cccc' });
  ([state] = games.state(state.id, { token: 'bca' }))

  expect(failedJoinErr).toMatchObject(new Error('Cannot join already joined game'))
  expect(state.turn).toBe(1)
  expect(state.blackPlayer).toBe('BlackPlayer')
})

test('can make opening move', () => {
  let player = { name: 'Arne', token: 'Abcs' }
  let [state, err] = games.newGame(player);
  ([state, err] = games.makeMove(state.id, player, { x: 4, y: 2 }))

  expect(err).toBeNull()
  expect(state.discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 4, y: 2 }])
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
  let player = { name: 'Arne', token: 'adasca' }
  let [state, err] = games.newGame(player);
  ([state, err] = games.makeMove(state.id, player, { x: 4, y: 6 }))

  expect(err).toBeNull()
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
  let player = { name: 'Arne', token: 'testsa' }
  let [state, err] = games.newGame(player, null, games.BLACK_DISC);
  ([state, err] = games.makeMove(state.id, player, { x: 5, y: 4 }))

  expect(err).toMatchObject(new Error('Not players turn'))
  expect(state).toBeNull()
})

test('can make multiple moves', () => {
  let whitePlayer = { name: 'White player', token: 'testsa' }
  let blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let [state, err] = games.newGame(whitePlayer);
  ([state, err] = games.makeMove(state.id, whitePlayer, { x: 5, y: 3 }))

  expect(err).toBeNull()
  expect(state.discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 5, y: 3 }])
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
  ([state, err] = games.makeMove(state.id, blackPlayer, { x: 5, y: 2 }))

  expect(err).toBeNull()
  expect(state.discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 5, y: 2 }])
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
  let whitePlayer = { name: 'White player', token: 'testsa' }
  let blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let [state] = games.newGame(whitePlayer, fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 3
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7))
  ), -1)

  games.join(state.id, blackPlayer)

  games.makeMove(state.id, blackPlayer, { x: 7, y: 0 });
  ([state] = games.state(state.id, { token: 'testsa' }))
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
  expect(state.turn).toBe(games.BLACK_DISC)
})

test('game is finished when no player can make a move', () => {
  let whitePlayer = { name: 'White player', token: 'testsa' }
  let blackPlayer = { name: 'Black player', token: 'cascsdc' }
  let [state, err] = games.newGame(whitePlayer, fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 1
    [' ', ' ', 'X', ' ', 'X', ' ', ' ', ' '], // 2
    [' ', ' ', 'X', 'O', 'X', ' ', ' ', ' '], // 3
    [' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]// 0    1    2    3    4    5    6    7
  ), games.BLACK_DISC)
  games.join(state.id, blackPlayer);

  ([state, err] = games.makeMove(state.id, blackPlayer, { x: 3, y: 2 }))

  expect(err).toBeNull()
  expect(state.discsToFlip).toMatchObject([{ x: 3, y: 3 }, { x: 3, y: 2 }])
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
  expect(state.status).toBe(games.STATUS_FINISHED)
})

const fromPrettyBoard = function (arr) {
  let unprettyBoard = []
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
