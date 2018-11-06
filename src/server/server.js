const express = require('express')
const bodyParser = require('body-parser')
const ws = require('ws')
const shortid = require('shortid')

const games = require('./game')
const app = express()
const port = process.env.PORT || 8080

const invitationTokens = {}
const playerTokens = {}

app.use(bodyParser.json())

games.setStateChangedCallback(function (event, state) {
  console.log(`${event}`)
})

app.post('/new', (req, res) => {
  if (!req.body) {
    res.status(400).send('name must be specified')
    return
  }

  let playerToken = shortid.generate()
  let invitationToken = shortid.generate()
  let player = { token: playerToken, name: req.body.name }

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

app.post('/join', (req, res) => {
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
  let player = { token: playerToken, name: req.body.name }
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

app.post('/make-move', (req, res) => {
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

const server = app.listen(port, () => console.log(`Listening on port ${port}`))

new ws.Server({ server }).on('connection', () => {
  console.log('hello')
})
