const events = {
  STATE_CHANGED: 'state-changed',
  OPPONENT_CONNECTED: 'opponent-connected',
  OPPONENT_DISCONNECTED: 'opponent-disconnected',
  CHAT_MESSAGE: 'chat-message',
  REMATCH: 'rematch'
}

const opponentStatus = {
  NOT_CONNECTED: 'not connected',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected'
}

const gameStatus = {
  STATUS_FINISHED: 'finished',
  STATUS_PENDING: 'pending',
  STATUS_WAITING_FOR_OPPONENT: 'waiting for opponent'
}

module.exports.events = events
module.exports.opponentStatus = opponentStatus
module.exports.gameStatus = gameStatus
