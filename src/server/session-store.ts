/**
 * sessionStore saves a session to a token in the format {token, gameid, active, ws}
 */

export interface Session {
  token: string
  gameId: string
  active: boolean
  socket: any
}

const tokens: { [key: string]: Session } = {}

export function all(predicate?: (n: Session) => boolean) : Session[] {
  const pred = predicate || (() => true)
  return Object.keys(tokens).map(token => tokens[token]).filter(session => pred(session))
}

export function add (session: Session) {
  tokens[session.token] = session
}

export function get (token: string) : Session {
  return tokens[token]
}

export function remove (token: string) {
  delete tokens[token]
}


