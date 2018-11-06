const shortid = require('shortid')

const games = {}
const boardSize = 8
const EMPTY_DISC = 0
const BLACK_DISC = -1
const WHITE_DISC = 1

const STATUS_FINISHED = 'finished'
const STATUS_PENDING = 'pending'
const STATUS_WAITING_FOR_OPPONENT = 'waiting for opponent'

const EVENT_GAME_CREATED = 'game-created'
const EVENT_GAME_JOINED = 'game-joined'
const EVENT_STATE_CHANGED = 'game-state-changed'
const EVENT_GAME_FINISHED = 'game-finished'

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

let stateChangedCallback = function (event, state) { }

const setStateChangedCallback = function (cb) {
  stateChangedCallback = cb
}

const notify = function (event, state) {
  if (stateChangedCallback) {
    stateChangedCallback(event, state)
  }
  return state
}

const newGame = function (whitePlayer, initState, initDisc) {
  let game = {
    id: shortid.generate(),
    whitePlayer: whitePlayer,
    blackPlayer: null,
    status: STATUS_WAITING_FOR_OPPONENT,
    turn: initDisc || WHITE_DISC,
    board: initState || defaultState()
  }

  games[game.id] = game
  return notify(EVENT_GAME_CREATED, state(game.id))
}

const state = function (id, discsToFlip) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }
  return [{
    id: id,
    whitePlayer: game.whitePlayer ? game.whitePlayer.name : '',
    blackPlayer: game.blackPlayer ? game.blackPlayer.name : '',
    status: game.status,
    turn: game.turn,
    discsToFlip: discsToFlip || [],
    board: game.board
  }, null]
}

const join = function (id, player) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }

  if (game.blackPlayer) {
    return [null, new Error('Cannot join already joined game')]
  }

  game.blackPlayer = player
  game.status = STATUS_PENDING
  return notify(EVENT_GAME_JOINED, state(game.id))
}

const makeMove = function (id, player, position) {
  const game = games[id]
  if (!game) {
    return [null, new Error('Game not found')]
  }

  let disc = getDiscForPlayer(game, player)

  if (game.turn !== disc) {
    return [null, new Error('Not players turn')]
  }

  const { x, y } = position
  const discsToFlip = checkDiscsToFlip(game, disc, position) || []

  if (discsToFlip.length > 0) {
    discsToFlip.push({ x, y })
  }

  discsToFlip.forEach(({ x, y }) => {
    game.board[y][x] = disc
  })

  if (discsToFlip.length > 0) {
    game.turn = discForNextTurn(game)
    if (game.turn === EMPTY_DISC) {
      game.status = STATUS_FINISHED
      return notify(EVENT_GAME_FINISHED, state(game.id, discsToFlip))
    }
  }

  game.discsToFlip = discsToFlip
  return notify(EVENT_STATE_CHANGED, state(game.id, discsToFlip))
}

const getDiscForPlayer = function (game, player) {
  let disc = EMPTY_DISC
  if (player.token === game.whitePlayer.token) {
    disc = WHITE_DISC
  } else if (player.token === game.blackPlayer.token) {
    disc = BLACK_DISC
  }
  return disc
}

const checkDiscsToFlip = function (game, disc, position) {
  let discsToFlip = []

  if (game.board[position.y][position.x] !== EMPTY_DISC) {
    return discsToFlip
  }

  directions.forEach(direction => {
    let discstoFlipInDirection = []
    let board = game.board
    let dX = direction[0]
    let dY = direction[1]
    let xPos = position.x
    let yPos = position.y
    for (let i = 0; i < board.length; i++) {
      xPos += dX
      yPos += dY
      if (!isPositionWithinBoundaries(xPos, yPos) || board[yPos][xPos] === EMPTY_DISC) {
        discstoFlipInDirection = []
        break
      }
      if (board[yPos][xPos] === disc) {
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

const discForNextTurn = function (game) {
  let maybeNextTurnDisc = game.turn * -1
  if (discHasMove(game, maybeNextTurnDisc)) {
    return maybeNextTurnDisc
  } else if (discHasMove(game, game.turn)) {
    return game.turn
  } else {
    return EMPTY_DISC // Game finised
  }
}

const discHasMove = function (game, disc) {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      let discsToFlip = checkDiscsToFlip(game, disc, { x: x, y: y })
      if (discsToFlip.length > 0) {
        return true
      }
    }
  }
  return false
}

module.exports.EMPTY_DISC = EMPTY_DISC
module.exports.BLACK_DISC = BLACK_DISC
module.exports.WHITE_DISC = WHITE_DISC
module.exports.STATUS_FINISHED = STATUS_FINISHED
module.exports.STATUS_PENDING = STATUS_PENDING
module.exports.STATUS_WAITING_FOR_OPPONENT = STATUS_WAITING_FOR_OPPONENT
module.exports.newGame = newGame
module.exports.join = join
module.exports.state = state
module.exports.makeMove = makeMove
module.exports.setStateChangedCallback = setStateChangedCallback
