const games = require('./game')

test('can create a new game', () => {
  let [state, err] = games.newGame({ name: 'Arne' })

  expect(err).toBeNull()
  expect(state.player1.name).toBe('Arne')
  expect(state.status).toBe(games.STATUS_WAITING_FOR_OPPONENT)
})

test('can join game', () => {
  let [state, err] = games.newGame({ name: 'Arne' });

  ([state, err] = games.join(state.id, { name: 'Bengan' }))

  expect(err).toBeNull()
  expect(state.player2.name).toBe('Bengan')
  expect(state.status).toBe(games.STATUS_PENDING)
})

test('cannot join already joined game', () => {
  let [state] = games.newGame({ name: 'Arne' })
  games.join(state.id, { name: 'Bengan' })

  let [, failedJoinErr] = games.join(state.id, { name: 'Pelle' });
  ([state] = games.state(state.id))

  expect(failedJoinErr).toMatchObject(new Error('Cannot join already joined game'))
  expect(state.turn).toBe(1)
  expect(state.player2.name).toBe('Bengan')
})

test('can make opening move', () => {
  let [state] = games.newGame({ name: 'Arne' })
  let [discsToFlip, err] = games.makeMove(state.id, { x: 4, y: 2, color: 1 })

  expect(err).toBeNull()
  expect(discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 4, y: 2 }])
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
    ]//   0    1    2    3    4    5    6    7
  ))
})

test('cannot make simple invalid move', () => {
  let [state] = games.newGame({ name: 'Arne' })
  let [discsToFlip, err] = games.makeMove(state.id, { x: 4, y: 6, color: 1 });
  ([state] = games.state(state.id))

  expect(err).toBeNull()
  expect(discsToFlip).toMatchObject([])
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
  let [state] = games.newGame({ name: 'Arne' })
  let [discsToFlip, err] = games.makeMove(state.id, { x: 5, y: 4, color: -1 })

  expect(err).toMatchObject(new Error('Not players turn'))
  expect(discsToFlip).toBeNull()
})

test('can make multiple moves', () => {
  let [state] = games.newGame({ name: 'Arne' })
  // games.makeMove(state.id, { x: 4, y: 5, color: 1 })
  let [discsToFlip, err] = games.makeMove(state.id, { x: 5, y: 3, color: 1 });
  ([state] = games.state(state.id))

  expect(err).toBeNull()
  expect(discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 5, y: 3 }])
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
  );

  ([discsToFlip, err] = games.makeMove(state.id, { x: 5, y: 2, color: -1 }));
  ([state] = games.state(state.id))

  expect(err).toBeNull()
  expect(discsToFlip).toMatchObject([{ x: 4, y: 3 }, { x: 5, y: 2 }])
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
  let [state] = games.newGame({ name: 'Arne' }, fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 3
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ] // 0    1    2    3    4    5    6    7))
  ), -1)

  games.makeMove(state.id, { x: 7, y: 0, color: -1 });
  ([state] = games.state(state.id))
  expect(state.board).toMatchObject(fromPrettyBoard([
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 0
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'], // 2
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O'], // 3
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 4
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 5
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // 6
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] // 7
  ]))
  expect(state.turn).toBe(-1)
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
