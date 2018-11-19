import * as store from './session-store'

test('can create new session', () => {
  const session = { token: 'abc', gameId: '123', active: true, socket: null }
  store.add(session)

  expect(store.get('abc')).toMatchObject(session)
})

test('can get all sessions sessions', () => {
  const session1 = { token: 'abc', gameId: '123', active: true, socket: null }
  const session2 = { token: 'cba', gameId: '123', active: true, socket: null }
  store.add(session1)
  store.add(session2)

  expect((store.all()).length).toBe(2)
})

test('can run predicate on sessions', () => {
  const session1 = { token: 'abc', gameId: '123', active: true, socket: null }
  const session2 = { token: 'cba', gameId: '123', active: true, socket: null }
  store.add(session1)
  store.add(session2)

  expect(store.all(x => x.token === 'cba')).toMatchObject([session2])
})
