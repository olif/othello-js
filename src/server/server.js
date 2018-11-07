const express = require('express')
const http = require('http')
const url = require('url')
const bodyParser = require('body-parser')
const ws = require('ws')
const shortid = require('shortid')

const games = require('./game')
const app = express()
const port = process.env.PORT || 8080

const invitationTokens = {}
const playerTokens = {}
const sockets = {}

const server = http.createServer(app)

app.use(bodyParser.json())

app.post('/api/new', (req, res) => {
  if (!req.body) {
    res.status(400).send('name must be specified')
    return
  }

  let playerToken = shortid.generate()
  let invitationToken = shortid.generate()
  let player = { token: playerToken, name: req.body.name || 'unknown' }

  let [state, err] = games.newGame(player)

  if (err) {
    res.status(400).send(err)
    return
  }

  invitationTokens[invitationToken] = state.id
  playerTokens[playerToken] = state.id

  res.status(200).send({
    invitationToken: invitationToken,
    playerToken: playerToken,
    state: state
  })
})

app.get('/api/game', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  let gameId = playerTokens[token]
  if (!gameId) {
    res.status(400).send({ msg: `invalid token: ${token}` })
    return
  }

  let [state, err] = games.state(gameId, { token: token }, [])
  if (err) {
    res.status(400).send({ msg: err.toString() })
    return
  }

  res.status(200).send({ state: state })
})

app.post('/api/join', (req, res) => {
  let invitationToken = req.query.token
  if (!invitationToken) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  let gameId = invitationTokens[invitationToken]
  if (!gameId) {
    res.status(400).send({ msg: `no game registered for token: ${invitationToken}` })
    return
  }

  let playerToken = shortid.generate()
  let player = { token: playerToken, name: req.body.name || 'unknown' }
  let [state, err] = games.join(gameId, player)
  if (err) {
    res.status(500).send({ msg: err })
    return
  }

  delete invitationTokens[invitationToken]
  playerTokens[playerToken] = state.id

  res.status(200).send({
    playerToken: playerToken,
    state: state
  })
})

app.post('/api/make-move', (req, res) => {
  let token = req.query.token
  if (!token) {
    res.status(400).send({ msg: 'invalid token' }, 400)
    return
  }

  let gameId = playerTokens[token]
  if (!gameId) {
    res.status(400).send({ msg: 'invalid token' })
    return
  }

  let [state, err] = games.makeMove(gameId, { token: token }, req.body)
  if (err) {
    res.status(400).send({ msg: err.toString() })
    return
  }

  res.status(200).send(state)
})

// let server = app.listen(port, () => console.log(`Listening on port ${port}`))

let wss = new ws.Server({ server }).on('connection', (ws, req) => {
  const uri = url.parse(req.url, true)
  const token = uri.query.token
  sockets[token] = ws
})

games.setStateChangedCallback(function (event, state) {
  let players = Object.keys(playerTokens).filter((key) => playerTokens[key] === state.id)
  if (players) {
    players.map(token => {
      let ws = sockets[token]
      console.log(ws)
      ws.send(JSON.stringify(state))
    })
  }
})

server.listen(port, () => console.log(`Server started on port ${port}`))
