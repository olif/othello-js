import * as shortid from 'shortid'
import { gameStatus } from '../common'
import * as log from './log'

const games: { [key: string]: Game } = {}
const boardSize = 8

export enum Disc {
  BLACK_DISC = -1,
  EMPTY_DISC = 0,
  WHITE_DISC = 1
}

export const EVENT_GAME_CREATED = 'game-created'
export const EVENT_GAME_JOINED = 'game-joined'
export const EVENT_STATE_CHANGED = 'game-state-changed'
export const EVENT_GAME_FINISHED = 'game-finished'
export const EVENT_GAME_REMATCH_REQUESTED = 'game-rematch-requested'
export const EVENT_GAME_REMATCH_ACCEPTED = 'game-rematch-accepted'

export interface State {
  readonly id: string
  status: string
  turn: number
  disc: Disc
  readonly discsToFlip: ReadonlyArray<Position>
  readonly board: Board
}

interface Game {
  id: string
  readonly whitePlayer: Player
  blackPlayer: Player | undefined,
  status: string,
  turn: Disc,
  board: Board
}

type Board = number[][]

interface Player {
  readonly token: string
  name?: string
}

interface Position {
  readonly x: number
  readonly y: number
}

type Result = State | Error

const defaultState = function () : Board {
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

const directions : Disc[][] = [
  [1, 0], // Right
  [1, 1], // Down right
  [1, -1], // Up right
  [-1, 0], // Left
  [-1, 1], // Down left
  [-1, -1], // Up left
  [0, 1], // Down
  [0, -1] // Up
]

let stateChangedCallback = function (event: string, state: State) { }

export function isOk(obj: any): obj is State {
  return obj.id !== undefined
}

export function isError(obj: any): obj is Error {
  return obj instanceof Error
}

export function setStateChangedCallback (cb: (event: string, state: State) => void) {
  stateChangedCallback = cb
}

const notify = function (event: string, result: Result) : Result {
  if (stateChangedCallback && isOk(result)) {
    stateChangedCallback(event, result)
  }
  return result
}

export function newGame (whitePlayer: Player, initState?: Board, initDisc?: Disc) : Result {
  let game = {
    id: shortid.generate(),
    whitePlayer: whitePlayer,
    blackPlayer: undefined,
    status: gameStatus.STATUS_WAITING_FOR_OPPONENT,
    turn: initDisc || Disc.WHITE_DISC,
    board: initState || defaultState()
  }

  games[game.id] = game
  log.info(`Created new game with id: ${game.id}`)
  return notify(EVENT_GAME_CREATED, state(game.id, whitePlayer))
}

export function reMatch (gameId: string, action: string) : Result {
  if(action === 'accept'){
    let game = {
      id: gameId,
      whitePlayer: games[gameId].whitePlayer,
      blackPlayer: games[gameId].blackPlayer,
      status: gameStatus.STATUS_PENDING,
      turn: 
      // initDisc || previous winner begins?
      Disc.WHITE_DISC,
      board: defaultState()
    }
    games[gameId] = game
    log.info(`Reset game board and scores for rematch in game: ${gameId}`)
  }
  
  return notify(action === 'request' ? EVENT_GAME_REMATCH_REQUESTED : EVENT_GAME_REMATCH_ACCEPTED, state(gameId, games[gameId].whitePlayer))
}

export function state (id: string, player: Player, discsToFlip?: Position[]) : Result {
  const game = games[id]
  if (!game) {
    return new Error('Game not found')
  }

  return {
    id: id,
    status: game.status,
    turn: game.turn,
    disc: getDiscForPlayer(game, player),
    discsToFlip: discsToFlip || [],
    board: game.board
  } 
}

export function join (id: string, player: Player) : Result {
  const game = games[id]
  if (!game) {
    return new Error('Game not found')
  }

  if (game.blackPlayer) {
    return new Error('Cannot join already joined game')
  }

  game.blackPlayer = player
  game.status = gameStatus.STATUS_PENDING
  log.info(`Game with id: ${game.id} was joined`)
  return notify(EVENT_GAME_JOINED, state(game.id, player))
}

export function makeMove (id: string, player: Player, position: Position) : Result {
  const game = games[id]
  if (!game) {
    return new Error('Game not found')
  }

  let disc = getDiscForPlayer(game, player)
  if (!isPlayersTurn(game, disc)) {
    return new Error('Not players turn')
  }

  const discsToFlip = getDiscsToFlip(game, disc, position)
  discsToFlip.forEach(({ x, y }) => { game.board[y][x] = disc })

  if (discsToFlip.length > 0) {
    toogleTurn(game)
  }

  game.status = resolveStatus(game)
  const event = game.status === gameStatus.STATUS_FINISHED
    ? EVENT_GAME_FINISHED
    : EVENT_STATE_CHANGED

  return notify(event, state(game.id, player, discsToFlip))
}

const isPlayersTurn = function (game: Game, disc: Disc) {
  return game.turn === disc
}

const resolveStatus = function (game: Game) {
  return game.turn === Disc.EMPTY_DISC
    ? gameStatus.STATUS_FINISHED
    : EVENT_STATE_CHANGED
}

const getDiscForPlayer = function (game: Game, player: Player): Disc {
  let disc: Disc = Disc.EMPTY_DISC
  if (!player.token) {
    throw new Error('Player has no token')
  }

  if (player.token === game.whitePlayer.token) {
    disc = Disc.WHITE_DISC
  } else if (game.blackPlayer !== undefined && player.token === game.blackPlayer.token) {
    disc = Disc.BLACK_DISC
  }
  return disc
}

const getDiscsToFlip = function (game: Game, disc: Disc, position: Position) : Position[] {
  let discsToFlip: Position[] = []

  if (game.board[position.y][position.x] !== Disc.EMPTY_DISC) {
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
      if (!isPositionWithinBoundaries(xPos, yPos) || board[yPos][xPos] === Disc.EMPTY_DISC) {
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

  if (discsToFlip.length > 0) {
    discsToFlip = [position, ...discsToFlip]
  }

  return discsToFlip
}

const isPositionWithinBoundaries = function (x: number, y: number) : boolean {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize
}

const toogleTurn = function (game: Game) {
  let maybeNextTurnDisc = flipDisc(game.turn)
  if (discHasMove(game, maybeNextTurnDisc)) {
    game.turn = maybeNextTurnDisc
  } else if (discHasMove(game, game.turn)) {
  } else {
    game.turn = Disc.EMPTY_DISC // Game finished
  }
}

const flipDisc = function (disc: Disc): Disc {
  return disc === Disc.WHITE_DISC ? Disc.BLACK_DISC : Disc.WHITE_DISC
}

const discHasMove = function (game: Game, disc: Disc) : boolean {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      let discsToFlip = getDiscsToFlip(game, disc, { x: x, y: y })
      if (discsToFlip.length > 0) {
        return true
      }
    }
  }
  return false
}
