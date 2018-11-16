const events = {
  STATE_CHANGED: 'state-changed',
  OPPONENT_CONNECTED: 'opponent-connected',
  OPPONENT_DISCONNECTED: 'opponent-disconnected',
  CHAT_MESSAGE: 'chat-message'
}

const opponentStatus = {
  NOT_CONNECTED: 'not connected',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected'
}

module.exports.events = events
module.exports.opponentStatus = opponentStatus
