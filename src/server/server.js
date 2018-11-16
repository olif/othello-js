const express = require('express')
const http = require('http')
const url = require('url')
const bodyParser = require('body-parser')
const ws = require('ws')
const shortid = require('shortid')

const games = require('./game')
const sessionStore = require('./session-store')
const common = require('../common.js')

const port = process.env.PORT || 8080

const invitationTokens = {}
const sessions = sessionStore.new()

const app = express()
const server = http.createServer(app)
app.use(bodyParser.json())
app.use(express.static('dist'))
app.use('/game', express.static('dist'))

const resolveStatus = function (session) {
  if (!session) {
    return common.opponentStatus.NOT_CONNECTED
  }
  return session.active ? common.opponentStatus.CONNECTED : common.opponentStatus.OPPONENT_DISCONNECTED
}

const resolveOpponent = function (gameId, playerToken) {
  return sessions.all(x => x.gameId === gameId).filter(x => x.token !== playerToken) || []
}

app.post('/api/new', (req, res) => {
  if (!req.body) {
    res.status(400).send('name must be specified')
    return
  }

  const playerToken = shortid.generate()
  const player = { token: playerToken, name: req.body.name || 'unknown' }

  const [state, err] = games.newGame(player)
  if (err) {
    res.status(400).send(err)
    return
  }
  sessions.add(playerToken, state.id, null)

  const invitationToken = shortid.generate()
  invitationTokens[invitationToken] = state.id

  res.status(200).send({
    invitationToken: invitationToken,
    playerToken: playerToken,
    opponentStatus: common.opponentStatus.NOT_CONNECTED,
    state: state
  })
})

app.get('/api/game', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  const session = sessions.get(token)
  const gameId = session.gameId
  if (!gameId) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  let [state, err] = games.state(gameId, { token: token }, [])
  if (err) {
    res.status(400).send({ msg: err.toString() })
    return
  }

  const status = resolveOpponent(gameId, token).map(resolveStatus)[0]
  res.status(200).send({
    state: state,
    opponentStatus: status || common.opponentStatus.NOT_CONNECTED
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
  const [state, err] = games.join(gameId, player)
  if (err) {
    res.status(500).send({ msg: err })
    return
  }

  delete invitationTokens[invitationToken]
  sessions.add(playerToken, state.id, null)
  res.status(200).send({
    playerToken: playerToken,
    opponentStatus: resolveOpponent(gameId, playerToken).map(resolveStatus)[0],
    state: state
  })
})

app.post('/api/make-move', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: 'invalid token' }, 400)
    return
  }

  const { gameId } = sessions.get(token)
  if (!gameId) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  let [state, err] = games.makeMove(gameId, { token: token }, req.body)
  if (err) {
    res.status(400).send({ msg: err.toString() })
    return
  }

  res.status(200).send(
    {
      state: state,
      opponentStatus: resolveOpponent(gameId, token).map(resolveStatus)[0]
    })
})

new ws.Server({ server }).on('connection', (ws, req) => {
  const uri = url.parse(req.url, true)
  const token = uri.query.token
  const session = sessions.get(token)

  try {
    session.ws = ws
    session.active = true
    resolveOpponent(session.gameId, token)
      .map(session => session.ws.send(JSON.stringify({ event: common.events.OPPONENT_CONNECTED })))

    ws.on('close', () => {
      session.active = false
      try {
        resolveOpponent(session.gameId, token)
          .map(session => session.ws.send(JSON.stringify({ event: common.events.OPPONENT_DISCONNECTED })))
      } catch (err) {
        console.log(err)
      }
    })

    ws.on('message', (data) => {
      const json = JSON.parse(data)
      resolveOpponent(session.gameId, token)
        .map(session => session.ws.send(JSON.stringify({ event: common.events.CHAT_MESSAGE, data: json.data })))
    })
  } catch (err) {
    console.log(err)
  }
})

games.setStateChangedCallback(function (event, state) {
  try {
    sessions.all(session => session.gameId === state.id)
      .filter(session => session.ws)
      .filter(session => session.active)
      .map(session => {
        session.ws.send(JSON.stringify({
          event: common.events.STATE_CHANGED,
          data: state
        }))
      })
  } catch (err) {
    console.log(err)
  }
})

server.listen(port, () => console.log(`Server started on port ${port}`))
