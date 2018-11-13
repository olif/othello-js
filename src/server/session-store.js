/**
 * sessionStore saves a session to a token in the format {token, gameid, active, ws}
 */

const sessionStore = function () {
  const tokens = {}

  const all = function (predicate) {
    const pred = predicate || ((x) => true)
    return Object.keys(tokens).map(token => tokens[token]).filter(session => pred(session))
  }

  const add = function (token, gameId, ws) {
    tokens[token] = { token: token, gameId: gameId, active: true, ws: ws }
  }

  const get = function (token) {
    return tokens[token]
  }

  const remove = function (token) {
    delete tokens[token]
  }

  return {
    all: all,
    add: add,
    get: get,
    remove: remove
  }
}

module.exports.new = sessionStore
