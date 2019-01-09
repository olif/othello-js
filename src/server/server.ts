import * as express from 'express'
import * as http from 'http'
import { parse as urlParse } from 'url'
import { json } from 'body-parser'
import { Server as WsServer } from 'ws'
import * as shortid from 'shortid'

import * as games from './game'
import * as sessionStore from './session-store'
import { opponentStatus, events } from '../common'
import * as log from './log'

const port = process.env.PORT || 8080

const invitationTokens: { [keys: string]: string } = {}

const app = express()
const server = http.createServer(app)
app.use(json())
app.use(express.static('dist'))
app.use('/game', express.static('dist'))

const resolveStatus = function (session: sessionStore.Session): string {
  if (!session) {
    return opponentStatus.NOT_CONNECTED
  }
  return session.active ? opponentStatus.CONNECTED : opponentStatus.DISCONNECTED
}

const resolveOpponent = function (gameId: string, playerToken: string) {
  return sessionStore.all(x => x.gameId == gameId).filter(x => x.token !== playerToken) || []
}

app.post('/api/new', (req, res) => {
  if (!req.body) {
    res.status(400).send('name must be specified')
    return
  }

  const playerToken = shortid.generate()
  const player = { token: playerToken, name: req.body.name || 'unknown' }

  const result = games.newGame(player)
  if (games.isError(result)) {
    res.status(400).send(result)
    return
  }
  sessionStore.add({ token: playerToken, gameId: result.id, active: true, socket: null })

  const invitationToken = shortid.generate()
  invitationTokens[invitationToken] = result.id

  res.status(200).send({
    invitationToken: invitationToken,
    playerToken: playerToken,
    opponentStatus: opponentStatus.NOT_CONNECTED,
    state: result
  })
})

app.get('/api/game', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  const session = sessionStore.get(token)
  const gameId = session.gameId
  if (!gameId) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  const result = games.state(gameId, { token: token }, [])
  if (games.isError(result)) {
    res.status(400).send({ msg: result.toString() })
    return
  }

  const status = resolveOpponent(gameId, token).map(resolveStatus)[0]
  res.status(200).send({
    state: result,
    opponentStatus: status || opponentStatus.NOT_CONNECTED
  })
})

app.post('/api/join', (req, res) => {
  const invitationToken = req.query.token
  if (!invitationToken) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  const gameId = invitationTokens[invitationToken]
  if (!gameId) {
    res.status(400).send({ msg: `no game registered for token: ${invitationToken}` })
    return
  }

  const playerToken = shortid.generate()
  const player = { token: playerToken, name: req.body.name || 'unknown' }
  const result = games.join(gameId, player)
  if (games.isError(result)) {
    res.status(500).send({ msg: result.toString() })
    return
  }

  delete invitationTokens[invitationToken]
  sessionStore.add({ token: playerToken, gameId: result.id, active: true, socket: null })
  res.status(200).send({
    playerToken: playerToken,
    opponentStatus: resolveOpponent(gameId, playerToken).map(resolveStatus)[0],
    state: result
  })
})

app.post('/api/make-move', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  const { gameId } = sessionStore.get(token)
  if (!gameId) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  const result = games.makeMove(gameId, { token: token }, req.body)
  if (games.isError(result)) {
    res.status(400).send({ msg: result.toString() })
    return
  }

  res.status(200).send(
    {
      state: result,
      opponentStatus: resolveOpponent(gameId, token).map(resolveStatus)[0]
    })
})

app.post('/api/requestRematch', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }
  const { gameId } = sessionStore.get(token)
  if (!gameId) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }
  games.reMatch(gameId, 'request')

  res.status(200).send()
})

app.post('/api/acceptRematch', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }
  const { gameId } = sessionStore.get(token)
  if (!gameId) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }
  games.reMatch(gameId, 'accept')
  
  res.status(200).send()
})

new WsServer({ server }).on('connection', (ws: any, req: any) => {
  const uri = urlParse(req.url, true)
  const token = Array.isArray(uri.query.token) ? uri.query.token[0] : uri.query.token
  const session = sessionStore.get(token)

  try {
    session.socket = ws
    session.active = true
    resolveOpponent(session.gameId, token)
      .map(session => session.socket.send(JSON.stringify({ event: events.OPPONENT_CONNECTED })))

    ws.on('close', () => {
      session.active = false
      try {
        resolveOpponent(session.gameId, token)
          .map(session => session.socket.send(JSON.stringify({ event: events.OPPONENT_DISCONNECTED })))
      } catch (err) {
        log.warn(err)
      }
    })

    ws.on('message', (data: any) => {
      const json = JSON.parse(data)
      resolveOpponent(session.gameId, token)
        .map(session => session.socket.send(JSON.stringify({ event: events.CHAT_MESSAGE, data: json.data })))
    })
  } catch (err) {
    log.warn(err)
  }
})

games.setStateChangedCallback(function (event, state) {
  let currentEvent = events.STATE_CHANGED;
  
  switch (event) {
    case 'game-rematch-requested':
      currentEvent = events.REMATCH_REQUESTED
      break;
    case 'game-rematch-accepted':
      currentEvent = events.REMATCH_ACCEPTED
      break;
  }
  try {
    sessionStore.all(session => session.gameId === state.id)
      .filter(session => session.socket)
      .filter(session => session.active)
      .map(session => {
        session.socket.send(JSON.stringify({
          event: currentEvent,
          data: state
        }))
      })
  } catch (err) {
    log.warn(err)
  }
})

server.listen(port, () => log.info(`Server started on port ${port}`))
