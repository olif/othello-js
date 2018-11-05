const shortid = require('shortid')

const games = {}
const boardSize = 8
const emptyDisc = 0

const STATUS_FINISHED = 'finished'
const STATUS_PENDING = 'pending'
const STATUS_WAITING_FOR_OPPONENT = 'waiting for opponent'

const defaultState = function () {
  return [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, -1, 0, 0, 0],
    [0, 0, 0, -1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
}

const directions = [
  [1, 0], // Right
  [1, 1], // Down right
  [1, -1], // Up right
  [-1, 0], // Left
  [-1, 1], // Down left
  [-1, -1], // Up left
  [0, 1], // Down
  [0, -1] // Up
]

const newGame = function (player1, initState, initTurn) {
  let game = {
    id: shortid.generate(),
    player1: player1,
    player2: null,
    status: STATUS_WAITING_FOR_OPPONENT,
    turn: initTurn || 1,
    board: initState || defaultState()
  }

  games[game.id] = game
  return state(game.id)
}

const state = function (id) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }
  return [game, null]
}

const join = function (id, player) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }

  if (game.player2) {
    return [null, new Error('Cannot join already joined game')]
  }

  game.player2 = player
  game.status = STATUS_PENDING
  return state(id)
}

const makeMove = function (id, move) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }

  if (game.turn !== move.color) {
    return [null, new Error('Not players turn')]
  }

  const { x, y, color } = move
  const discsToFlip = checkDiscsToFlip(game, move) || []

  if (discsToFlip.length > 0) {
    discsToFlip.push({ x, y })
    game.turn = colorForNextTurn(game)
    if (game.turn === emptyDisc) {
      game.status = STATUS_FINISHED
    }
  }

  discsToFlip.forEach(({ x, y }) => {
    game.board[y][x] = color
  })

  return [discsToFlip, null]
}

const checkDiscsToFlip = function (game, move) {
  let discsToFlip = []

  if (game.board[move.y][move.x] !== emptyDisc) {
    return discsToFlip
  }

  directions.forEach(direction => {
    let discstoFlipInDirection = []
    let board = game.board
    let dX = direction[0]
    let dY = direction[1]
    let xPos = move.x
    let yPos = move.y
    for (let i = 0; i < board.length; i++) {
      xPos += dX
      yPos += dY
      if (!isPositionWithinBoundaries(xPos, yPos) || board[yPos][xPos] === emptyDisc) {
        discstoFlipInDirection = []
        break
      }
      if (board[yPos][xPos] === move.color) {
        break
      }
      discstoFlipInDirection.push({ x: xPos, y: yPos })
    }
    discsToFlip = [...discsToFlip, ...discstoFlipInDirection]
  })

  return discsToFlip
}

const isPositionWithinBoundaries = function (x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize
}

const colorForNextTurn = function (game) {
  let maybeNextTurnColor = game.turn * -1
  if (colorHasMove(game, maybeNextTurnColor)) {
    return maybeNextTurnColor
  } else if (colorHasMove(game, game.turn)) {
    return game.turn
  } else {
    return 0 // Game finised
  }
}

const colorHasMove = function (game, color) {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      let discsToFlip = checkDiscsToFlip(game, { x: x, y: y, color: color })
      if (discsToFlip.length > 0) {
        return true
      }
    }
  }
  return false
}

module.exports.STATUS_FINISHED = STATUS_FINISHED
module.exports.STATUS_PENDING = STATUS_PENDING
module.exports.STATUS_WAITING_FOR_OPPONENT = STATUS_WAITING_FOR_OPPONENT
module.exports.newGame = newGame
module.exports.join = join
module.exports.state = state
module.exports.makeMove = makeMove
