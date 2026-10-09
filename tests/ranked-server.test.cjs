'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { WebSocket } = require('ws');
const { createBattleServer } = require('../server/mass-battle-server.cjs');
const { selectMatch, permittedGap } = require('../server/matchmaking.cjs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function fakeStore() {
  const revoked = new Set(), records = [], ratings = new Map();
  return {
    revoked, records, ratings,
    authenticate(token) { return /^token-\d+$/.test(token) && !revoked.has(token) ? { id: token.slice(6), name: `Host ${token.slice(6)}` } : null; },
    profile(id) { return { id, name: `Host ${id}`, rating: ratings.get(id) || 1000, matches: 0, wins: 0, losses: 0, draws: 0, provisional: true }; },
    recordMatch(result) { records.push(result); return { recorded: true, eligible: result.eligible, reason: result.reason, changes: result.eligible ? result.participants.map(p => ({ accountId: p.accountId, before: 1000, after: p.team === result.winner ? 1016 : 984, delta: p.team === result.winner ? 16 : -16 })) : [] }; },
    leaderboard() { return []; }, close() {},
  };
}
async function setup(t, options = {}) {
  const store = options.playerStore || fakeStore();
  const app = createBattleServer({ port: 0, playerStore: store, ...options });
  const address = await app.listen();
  t.after(() => app.close());
  async function connect() {
    const ws = new WebSocket(`ws://127.0.0.1:${address.port}/battle`), messages = [];
    ws.on('message', raw => messages.push(JSON.parse(raw)));
    await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
    return { ws, messages, send: value => ws.send(JSON.stringify(value)), async read(type, predicate = () => true) {
      for (let i = 0; i < 300; i++) { const at = messages.findIndex(m => m.type === type && predicate(m)); if (at >= 0) return messages.splice(at, 1)[0]; await delay(10); }
      throw new Error(`Timed out waiting for ${type}`);
    } };
  }
  return { app, store, connect, address };
}
const join = (c, id, extra = {}) => c.send({ type: 'join', ranked: true, accessToken: `token-${id}`, mode: 'brawl', teamSize: 4, ...extra });
async function launch(connect, extra = {}) {
  const clients = [];
  for (let i = 0; i < 8; i++) { const c = await connect(); clients.push(c); join(c, i, extra); }
  const welcomes = await Promise.all(clients.map(c => c.read('welcome')));
  return { clients, welcomes };
}

test('private queue requires credentials, strips claimed rank, accepts no inputs or bots, and cancels', async t => {
  const { app, connect } = await setup(t);
  const c = await connect();
  c.send({ type: 'join', ranked: true, rating: 2500 });
  assert.equal((await c.read('error')).code, 'AUTH_REQUIRED');
  join(c, 0, { name: 'Forged Host', rating: 2500, steamId: 'forged', room: 'secret' });
  assert.equal((await c.read('error')).code, 'RANKED_QUEUE_ONLY');
  join(c, 0, { rating: 2500 });
  const q = await c.read('queue');
  assert.equal(q.waiting, 1); assert.equal(q.required, 8); assert.equal(q.label, 'Private test ladder');
  assert.equal(app.rooms.size, 0);
  c.send({ type: 'input', seq: 1, moveX: 1, moveY: 0, aimX: 1, aimY: 0 });
  assert.equal((await c.read('error')).code, 'NOT_JOINED');
  c.send({ type: 'cancel' }); await c.read('left');
  c.send({ type: 'leaderboard', ranked: true, mode: 'ctf', teamSize: 20 });
  const board = await c.read('leaderboard'); assert.equal(board.ranked, true); assert.equal(board.mode, 'ctf');
  await delay(60); assert.equal(app.rooms.size, 0);
});

test('one connection per account includes authenticated casual play and never steals a session', async t => {
  const { connect, store } = await setup(t);
  const c = await connect(); join(c, 1, { ranked: false });
  const welcome = await c.read('welcome');
  const second = await connect(); join(second, 1);
  assert.equal((await second.read('error')).code, 'ACCOUNT_ACTIVE');
  second.send({ type: 'join', resumeToken: welcome.resumeToken });
  assert.equal((await second.read('error')).code, 'AUTH_REQUIRED');
  store.revoked.add('token-1');
  join(second, 1, { resumeToken: welcome.resumeToken });
  assert.equal((await second.read('error')).code, 'AUTH_REQUIRED');
  assert.equal(c.ws.readyState, WebSocket.OPEN);
});

test('queues partition by mode and capacity; revoked queued accounts cannot launch', async t => {
  const { app, connect, store } = await setup(t);
  const c = await connect(); join(c, 0); await c.read('queue'); store.revoked.add('token-0');
  const others = [];
  for (let i = 1; i < 8; i++) { const p = await connect(); others.push(p); join(p, i); await p.read('queue'); }
  assert.equal((await c.read('error')).code, 'AUTH_REQUIRED');
  await delay(100); assert.equal(app.rooms.size, 0);
  const large = await connect(); join(large, 20, { mode: 'ctf', teamSize: 20 });
  assert.equal((await large.read('queue')).required, 40);
  const largest = await connect(); join(largest, 21, { mode: 'siege', teamSize: 50 });
  assert.equal((await largest.read('queue')).required, 100);
  assert.equal(app.rooms.size, 0);
});

test('eight authenticated humans launch balanced using stored ratings; finished host fixture persists roster once', async t => {
  const { app, connect, store } = await setup(t);
  for (let i = 0; i < 8; i++) store.ratings.set(String(i), 950 + i * 20);
  const { clients, welcomes } = await launch(connect, { rating: 2500, name: 'Forged', winner: 'rice' });
  assert.ok(welcomes.every(w => w.ranked && w.rankingLabel === 'Private test ladder'));
  const room = app.rooms.get(welcomes[0].room);
  assert.equal(room.state.players.filter(p => p.bot).length, 0);
  assert.equal(room.roster.length, 8);
  assert.ok(room.state.players.every(p => p.name.startsWith('Host ')));
  const totals = ['custardia', 'rice'].map(team => room.state.players.filter(p => p.team === team).reduce((n, p) => n + p.rating, 0));
  assert.ok(Math.abs(totals[0] - totals[1]) <= 20);
  const intruder = await connect(); intruder.send({ type: 'join', room: room.id });
  assert.ok(['BAD_ROOM', 'RANKED_QUEUE_ONLY'].includes((await intruder.read('error')).code));
  clients[0].send({ type: 'input', seq: 1, moveX: 0, moveY: 0, aimX: 1, aimY: 0, winner: 'rice', rating: 9999 });
  await delay(40); assert.equal(store.records.length, 0);
  // Authoritative terminal fixture: this is not a claimed completed human playthrough.
  room.state.status = 'finished'; room.state.winner = 'custardia'; room.state.finishReason = 'test_fixture';
  const updates = await Promise.all(clients.map(c => c.read('rating')));
  assert.ok(updates.every(r => r.eligible && Math.abs(r.changes.delta) === 16));
  await delay(100); assert.equal(store.records.length, 1); assert.equal(store.records[0].participants.length, 8);
});

test('disconnect permanently disqualifies full roster despite bot refill; abandoned rooms record once', async t => {
  const { app, connect, store } = await setup(t, { roomIdleMs: 20 });
  const { clients, welcomes } = await launch(connect);
  const room = app.rooms.get(welcomes[0].room);
  clients[0].ws.close(); await delay(60);
  assert.equal(room.state.players.filter(p => p.bot).length, 1);
  room.state.status = 'finished'; room.state.winner = 'rice';
  const result = await clients[1].read('rating');
  assert.equal(result.eligible, false); assert.equal(result.reason, 'participant_disconnected'); assert.equal(result.changes, null);
  assert.equal(store.records[0].participants.length, 8);
  for (const c of clients.slice(1)) c.ws.close();
  await delay(100); assert.equal(store.records.length, 1); assert.equal(app.rooms.size, 0);
});

test('storage failure never reports rating success and does not stop simulation', async t => {
  const { app, connect, store, address } = await setup(t);
  const { clients, welcomes } = await launch(connect);
  store.recordMatch = () => { throw new Error('disk failed'); };
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  assert.equal((await clients[0].read('error')).code, 'RATING_UNAVAILABLE');
  const before = app.metrics.steps; await delay(100); assert.ok(app.metrics.steps > before);
  assert.equal(clients[0].messages.some(m => m.type === 'rating'), false);
  const health = await (await fetch(`http://127.0.0.1:${address.port}/health`)).json();
  assert.equal(health.privateRanked, false);
});

test('casual blank rooms automatically route around full and finished rooms while explicit codes stay strict', async t => {
  const { app, connect } = await setup(t);
  let first;
  for (let i = 0; i < 8; i++) { const c = await connect(); c.send({ type: 'join', room: '', ranked: false }); const w = await c.read('welcome'); first ||= w.room; assert.equal(w.room, first); }
  const next = await connect(); next.send({ type: 'join' }); const w = await next.read('welcome'); assert.notEqual(w.room, first);
  app.rooms.get(w.room).state.status = 'finished';
  const last = await connect(); last.send({ type: 'join' }); assert.notEqual((await last.read('welcome')).room, w.room);
  const strict = await connect(); strict.send({ type: 'join', room: first }); assert.equal((await strict.read('error')).code, 'ROOM_FULL');
});

test('matchmaking expands rating gaps by wait with a hard bound', () => {
  const entries = Array.from({ length: 8 }, (_, i) => ({ profile: { rating: 800 + 60 * i }, joinedAt: 0 }));
  assert.equal(selectMatch(entries, 8, 0), null);
  assert.equal(selectMatch(entries, 8, 45000).length, 8);
  assert.equal(permittedGap(1e9), 800);
  entries[7].profile.rating = 2000; assert.equal(selectMatch(entries, 8, 1e9), null);
});

test('simultaneous authenticated casual joins reserve only one connection', async t => {
  const { connect, store } = await setup(t);
  const original = store.authenticate;
  store.authenticate = async token => { await delay(30); return original(token); };
  const a = await connect(), b = await connect();
  join(a, 0, { ranked: false }); join(b, 0, { ranked: false });
  await delay(120);
  const results = [...a.messages, ...b.messages];
  assert.equal(results.filter(m => m.type === 'welcome').length, 1);
  assert.equal(results.filter(m => m.code === 'ACCOUNT_ACTIVE').length, 1);
});

test('revocation after launch records an ineligible terminal audit; abandoning active game also records', async t => {
  const { app, connect, store } = await setup(t, { roomIdleMs: 20 });
  const { clients, welcomes } = await launch(connect);
  store.revoked.add('token-0');
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  const rating = await clients[1].read('rating');
  assert.equal(rating.eligible, false); assert.equal(rating.reason, 'credential_revoked');
  for (const c of clients) c.ws.close();
  await delay(100);
  store.revoked.clear();
  const again = await launch(connect);
  for (const c of again.clients) c.ws.close();
  await delay(120);
  assert.equal(store.records.length, 2);
  assert.equal(store.records[1].eligible, false);
  assert.equal(store.records[1].participants.length, 8);
});

test('SQLite-backed terminal fixture persists ratings across store restart and scoped leaderboard', async t => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
  const { createPlayerStore } = require('../server/player-store.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ck-ranked-server-'));
  const filename = path.join(directory, 'players.sqlite');
  let store = createPlayerStore({ filename });
  const accounts = Array.from({ length: 8 }, (_, i) => store.issue(`Player ${i}`));
  const { app, connect } = await setup(t, { playerStore: store });
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const clients = [];
  for (const account of accounts) { const c = await connect(); clients.push(c); join(c, 0, { accessToken: account.token }); }
  const welcomes = await Promise.all(clients.map(c => c.read('welcome')));
  const room = app.rooms.get(welcomes[0].room);
  // Direct host-state fixture verifies persistence, not a completed human play session.
  room.state.status = 'finished'; room.state.winner = 'custardia';
  const ratings = await Promise.all(clients.map(c => c.read('rating')));
  assert.ok(ratings.every(r => r.profile.matches === 1));
  clients[0].send({ type: 'leaderboard', ranked: true, mode: 'brawl', teamSize: 4 });
  assert.equal((await clients[0].read('leaderboard')).entries.length, 8);
  store.close(); store = createPlayerStore({ filename });
  assert.equal(store.profile(accounts[0].accountId, 'brawl-4').matches, 1);
  assert.equal(store.profile(accounts[0].accountId, 'ctf-4').matches, 0);
});

for (const teamSize of [20, 50]) test(`ranked ${teamSize}v${teamSize} waits for every human slot before launch`, async t => {
  const { app, connect } = await setup(t);
  const clients = [];
  for (let i = 0; i < teamSize * 2 - 1; i++) {
    const c = await connect(); clients.push(c); join(c, i, { teamSize });
    await c.read('queue');
  }
  assert.equal(app.rooms.size, 0);
  const last = await connect(); clients.push(last); join(last, teamSize * 2 - 1, { teamSize });
  const welcomes = await Promise.all(clients.map(c => c.read('welcome')));
  const room = app.rooms.get(welcomes[0].room);
  assert.equal(room.roster.length, teamSize * 2);
  assert.equal(room.state.players.filter(p => p.bot).length, 0);
  assert.equal(room.state.players.filter(p => p.team === 'rice' && !p.bot).length, teamSize);
});

test('rating publication waits for durable recordMatch completion', async t => {
  const { app, connect, store } = await setup(t);
  const { clients, welcomes } = await launch(connect);
  let release;
  const original = store.recordMatch;
  store.recordMatch = async input => { await new Promise(resolve => { release = resolve; }); return original(input); };
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  await delay(80);
  assert.equal(store.records.length, 0);
  assert.equal(clients[0].messages.some(m => m.type === 'rating'), false);
  release();
  assert.equal((await clients[0].read('rating')).eligible, true);
  assert.equal(store.records.length, 1);
});

test('a fresh middle-rated entrant does not block an eligible older roster', () => {
  const older = [1000, 1000, 1400, 1400, 1400, 1400, 1400, 1400].map(rating => ({ profile: { rating }, joinedAt: 0 }));
  const fresh = { profile: { rating: 1200 }, joinedAt: 30000 };
  const selected = selectMatch([...older, fresh], 8, 30000);
  assert.equal(selected.length, 8); assert.equal(selected.includes(fresh), false);
});

test('transient write failures retry immutable payload and preserve ambiguous committed outcomes idempotently', async t => {
  const { app, connect, store } = await setup(t);
  const { clients, welcomes } = await launch(connect);
  const original = store.recordMatch, seen = [], committed = new Map();
  store.recordMatch = input => {
    seen.push(input);
    if (seen.length === 1) throw new Error('SQLITE_BUSY');
    if (committed.has(input.id)) return { ...committed.get(input.id), recorded: false, changes: [] };
    const result = original(input); committed.set(input.id, result);
    throw new Error('Ambiguous error after commit');
  };
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  const rating = await clients[0].read('rating');
  assert.equal(rating.eligible, true); assert.equal(seen.length, 3); assert.equal(store.records.length, 1);
  assert.ok(seen.every(payload => payload === seen[0] && Object.isFrozen(payload)));
  assert.equal(room.recorded, true); assert.equal(room.persistenceError, false);
});

test('exhausted writes retain the failed room after disconnect and host can retry it', async t => {
  const { app, connect, store, address } = await setup(t, { roomIdleMs: 20 });
  const { clients, welcomes } = await launch(connect);
  const original = store.recordMatch; let calls = 0;
  store.recordMatch = () => { calls++; throw new Error('disk unavailable'); };
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  const failure = await clients[0].read('error');
  assert.equal(failure.code, 'RATING_UNAVAILABLE'); assert.equal(failure.room, room.id); assert.equal(calls, 3);
  for (const c of clients) c.ws.close();
  await delay(100); assert.equal(app.rooms.has(room.id), true);
  const health = await (await fetch(`http://127.0.0.1:${address.port}/health`)).json();
  assert.equal(health.pendingRankedResults, 1); assert.equal(health.privateRanked, false);
  store.recordMatch = original;
  await app.retryRankedResults();
  assert.equal(room.recorded, true); assert.equal(store.records.length, 1);
  await delay(60); assert.equal(app.rooms.has(room.id), false);
  const recovered = await (await fetch(`http://127.0.0.1:${address.port}/health`)).json();
  assert.equal(recovered.privateRanked, true); assert.equal(recovered.pendingRankedResults, 0);
});

test('profile read failure after commit reports saved result with scoped profile error', async t => {
  const { app, connect, store } = await setup(t);
  const { clients, welcomes } = await launch(connect);
  store.profile = () => { throw new Error('profile read unavailable'); };
  const room = app.rooms.get(welcomes[0].room); room.state.status = 'finished'; room.state.winner = 'rice';
  const problem = await clients[0].read('error');
  assert.equal(problem.code, 'RATING_PROFILE_UNAVAILABLE'); assert.equal(problem.room, room.id); assert.match(problem.message, /was saved/);
  const rating = await clients[0].read('rating');
  assert.equal(rating.profile, null); assert.equal(rating.eligible, true); assert.ok(rating.changes);
  assert.equal(room.recorded, true); assert.equal(store.records.length, 1);
  assert.equal(clients[0].messages.some(m => m.code === 'RATING_UNAVAILABLE'), false);
});

test('authenticated casual rooms use stored skill for human and bot balance without awarding rank', async t => {
  const { app, connect, store } = await setup(t);
  store.ratings.set('0', 1800);
  const c = await connect(); join(c, 0, { ranked: false, rating: 500 });
  const welcome = await c.read('welcome'), room = app.rooms.get(welcome.room);
  assert.equal(welcome.ranked, false); assert.equal(welcome.profile.rating, 1800);
  assert.equal(room.state.players.find(p => !p.bot).rating, 1800);
  assert.ok(room.state.players.filter(p => p.bot).every(p => p.rating === 1800));
  room.state.status = 'finished'; room.state.winner = 'rice';
  await delay(70); assert.equal(store.records.length, 0);
});
