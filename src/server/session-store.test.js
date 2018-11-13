const sessionStore = require('./session-store.js')

test('can create new session', () => {
  const store = sessionStore.new()
  const session = { token: 'abc', gameId: '123', active: true, ws: null }
  store.add(session.token, session.gameId, null)

  expect(store.get('abc')).toMatchObject(session)
})

test('can get all sessions sessions', () => {
  const store = sessionStore.new()
  const session1 = { token: 'abc', gameId: '123', active: true, ws: null }
  const session2 = { token: 'cba', gameId: '123', active: true, ws: null }
  store.add(session1.token, session1.gameId, null)
  store.add(session2.token, session2.gameId, null)

  expect((store.all(null)).length).toBe(2)
})

test('can run predicate on sessions', () => {
  const store = sessionStore.new()
  const session1 = { token: 'abc', gameId: '123', active: true, ws: null }
  const session2 = { token: 'cba', gameId: '123', active: true, ws: null }
  store.add(session1.token, session1.gameId, null)
  store.add(session2.token, session2.gameId, null)

  expect(store.all(x => x.token === 'cba')).toMatchObject([session2])
})
