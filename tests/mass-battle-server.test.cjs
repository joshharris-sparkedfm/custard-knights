'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { WebSocket: WsClient } = require('ws');
const { createBattleServer, validateInput } = require('../server/mass-battle-server.cjs');
const Wire = require('../game/mass-battle-wire.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function connect(url, options) {
  // Native Node WebSocket proves that no matching custom client is necessary.
  const ws = options ? new WsClient(url, options) : new WebSocket(url);
  const queue = [];
  const readers = new Set();
  const receive = event => {
    let msg;
    try { msg = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString()); } catch { return; }
    const reader = [...readers].find(r => r.predicate(msg));
    if (reader) { readers.delete(reader); clearTimeout(reader.timer); reader.resolve(msg); }
    else { queue.push(msg); if (queue.length > 100) queue.shift(); }
  };
  ws.addEventListener('message', receive);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  return {
    ws,
    send: msg => ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)),
    read(predicate, timeout = 5000) {
      const index = queue.findIndex(predicate);
      if (index >= 0) return Promise.resolve(queue.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        const reader = { predicate, resolve, timer: setTimeout(() => { readers.delete(reader); reject(new Error('Timed out waiting for server message')); }, timeout) };
        readers.add(reader);
      });
    },
    close: () => ws.close(),
  };
}
async function start(t, options = {}) {
  const app = createBattleServer({ port: 0, ...options });
  const addr = await app.listen();
  t.after(() => app.close());
  return { app, url: `ws://127.0.0.1:${addr.port}/battle`, http: `http://127.0.0.1:${addr.port}` };
}
function join(client, fields = {}) {
  client.send({ type: 'join', mode: 'brawl', teamSize: 4, name: 'Test Knight', ...fields });
  return client.read(m => m.type === 'welcome' || m.type === 'error');
}
const axes = { type: 'input', seq: 1, moveX: 1, moveY: 0, aimX: 1, aimY: 0, attack: false, heavy: false, guard: false, dash: false, ability: false };

test('input validator rejects non-finite/invalid types and strips client authority', () => {
  assert.equal(validateInput({ ...axes, moveX: Infinity }), null);
  assert.equal(validateInput({ ...axes, attack: 1 }), null);
  assert.equal(validateInput({ ...axes, seq: -1 }), null);
  assert.equal(validateInput({ ...axes, seq: 1.5 }), null);
  assert.equal(validateInput({ ...axes, moveY: '0' }), null);
  const safe = validateInput({ ...axes, moveX: 999, moveY: -99, damage: 9999, winner: 'rice', rating: 9000 });
  assert.equal(safe.moveX, 1);
  assert.equal(safe.moveY, -1);
  assert.equal('damage' in safe, false);
  assert.equal('winner' in safe, false);
  assert.equal('rating' in safe, false);
});

test('real socket join, authoritative snapshots, malformed input, stale-input timeout and bot refill', async t => {
  const { app, url, http } = await start(t);
  const health = await (await fetch(`${http}/health`)).json();
  assert.equal(health.ranked, false);
  assert.equal(health.stepHz, 30);
  assert.equal(health.snapshotHz, 20);
  assert.equal((await fetch(`${http}/../../package.json`)).status, 404);
  const client = await connect(url);
  client.send(axes);
  assert.equal((await client.read(m => m.type === 'error')).code, 'NOT_JOINED');
  client.send('{broken');
  assert.equal((await client.read(m => m.type === 'error')).code, 'BAD_JSON');
  client.send('null');
  assert.equal((await client.read(m => m.type === 'error')).code, 'BAD_MESSAGE');
  const welcome = await join(client, { room: 'smoke', rating: 9999 });
  assert.equal(welcome.type, 'welcome');
  assert.equal(welcome.ranked, false);
  assert.equal(welcome.resumeToken.length, 48);
  const snap = await client.read(m => m.type === 'snapshot');
  assert.equal(snap.humans, 1);
  assert.equal(snap.bots, 7);
  assert.equal(snap.state.players.length, 8);
  const room = app.rooms.get('smoke');
  const human = room.state.players.find(p => p.humanId === welcome.sessionId);
  assert.ok(human, 'real core assigned a human slot');
  assert.equal(human.rating, 1000, 'client rating cannot affect team balance');
  client.send({ ...axes, moveX: 'bad' });
  assert.equal((await client.read(m => m.type === 'error')).code, 'BAD_INPUT');
  client.send({ ...axes, seq: 10, moveX: 999, damage: 100000 });
  await delay(80);
  assert.equal(room.inputs.get(welcome.sessionId).moveX, 1);
  client.send({ ...axes, seq: 9, moveX: -1 });
  await delay(50);
  assert.equal(room.inputs.get(welcome.sessionId).moveX, 1, 'stale sequence ignored');
  await delay(400);
  assert.equal(room.inputs.get(welcome.sessionId).moveX, 0, 'lost input stops movement');
  client.close();
  await delay(70);
  assert.equal(room.state.players.filter(p => p.humanId).length, 0);
  assert.equal(room.state.players.length, 8, 'disconnect preserves total slots');
  assert.equal(room.inputs.size, 0);
});

test('session resumption replaces old connection without duplicate humans', async t => {
  const { app, url } = await start(t);
  const first = await connect(url);
  const a = await join(first, { room: 'resume' });
  const second = await connect(url);
  const b = await join(second, { room: 'resume', resumeToken: a.resumeToken });
  assert.equal(b.sessionId, a.sessionId);
  await delay(70);
  assert.equal(app.rooms.get('resume').state.players.filter(p => p.humanId).length, 1);
  assert.equal((await second.read(m => m.type === 'snapshot')).humans, 1);
  second.send({ type: 'leaderboard' });
  const ladder = await second.read(m => m.type === 'leaderboard');
  assert.equal(ladder.ranked, false);
  assert.deepEqual(ladder.entries, []);
});

test('mode/room validation, human team balance, eight-human room capacity', async t => {
  const { app, url } = await start(t);
  const clients = [];
  for (let i = 0; i < 9; i++) clients.push(await connect(url));
  assert.equal((await join(clients[0], { teamSize: 100 })).code, 'BAD_MODE');
  assert.equal((await join(clients[0], { room: '../bad' })).code, 'BAD_ROOM');
  assert.equal((await join(clients[0], { role: 'administrator' })).code, 'BAD_ROLE');
  const teams = {};
  for (let i = 0; i < 8; i++) {
    const result = await join(clients[i], { room: 'full' });
    assert.equal(result.type, 'welcome');
    teams[result.team] = (teams[result.team] || 0) + 1;
    const n = Object.values(teams);
    assert.ok(Math.abs((n[0] || 0) - (n[1] || 0)) <= 1);
  }
  assert.deepEqual(Object.values(teams).sort(), [4, 4]);
  assert.equal(app.rooms.get('full').state.players.filter(p => p.humanId).length, 8);
  assert.equal((await join(clients[8], { room: 'full' })).code, 'ROOM_FULL');
  assert.equal((await join(clients[8], { room: 'full', mode: 'ctf' })).code, 'ROOM_SETTINGS');
  clients[0].close();
  await delay(60);
  assert.equal((await join(clients[8], { room: 'full' })).type, 'welcome');
});

test('40- and 100-combatant bot-filled rooms run with real client snapshots', async t => {
  const { app, url } = await start(t);
  for (const teamSize of [20, 50]) {
    const client = await connect(url);
    const room = `scale-${teamSize}`;
    assert.equal((await join(client, { room, teamSize, mode: teamSize === 20 ? 'ctf' : 'siege' })).type, 'welcome');
    const snap = await client.read(m => m.type === 'snapshot');
    assert.equal(snap.capacity, teamSize * 2);
    assert.equal(snap.bots, teamSize * 2 - 1);
    assert.equal(snap.state.players.length, teamSize * 2);
    client.send(axes);
  }
  await delay(500);
  assert.ok(app.metrics.steps > 0);
  assert.equal(app.rooms.size, 2);
  // This is bounded local bot simulation, not a claim of 100-human network capacity.
});

test('message rate and oversized payload enforcement close real connections', async t => {
  const { app, url } = await start(t);
  const spam = await connect(url);
  const closed = new Promise(resolve => spam.ws.addEventListener('close', resolve, { once: true }));
  for (let i = 0; i < 140; i++) spam.send({ type: 'ping' });
  assert.equal((await closed).code, 1008);
  assert.ok(app.metrics.rateLimited > 0);
  const large = await connect(url);
  const largeClosed = new Promise(resolve => large.ws.addEventListener('close', resolve, { once: true }));
  large.send('x'.repeat(4096));
  assert.equal((await largeClosed).code, 1009);
});

test('100 real local sockets fill 50v50, reject overflow, and refill disconnected slots', async t => {
  const { app, url } = await start(t);
  const clients = [];
  for (let batch = 0; batch < 10; batch++) {
    const next = await Promise.all(Array.from({ length: 10 }, () => connect(url)));
    clients.push(...next);
    const joined = await Promise.all(next.map((c, i) => join(c, { room: 'hundred', teamSize: 50, name: `Knight ${batch * 10 + i}`, role: 'support' })));
    assert.ok(joined.every(m => m.type === 'welcome'));
  }
  const room = app.rooms.get('hundred');
  assert.equal(room.state.players.filter(p => p.humanId).length, 100);
  assert.equal(room.state.players.filter(p => p.humanId && p.team === 'custardia').length, 50);
  assert.equal(room.state.players.filter(p => p.humanId && p.team === 'rice').length, 50);
  const extra = await connect(url);
  assert.equal((await join(extra, { room: 'hundred', teamSize: 50 })).code, 'ROOM_FULL');
  for (const client of clients) client.send({ ...axes, attack: true });
  const snap = await clients[99].read(m => m.type === 'snapshot' && m.humans === 100);
  assert.equal(snap.bots, 0);
  assert.equal(snap.state.players.length, 100);
  // One genuine server broadcast with 100 simultaneous loopback clients; not a WAN soak.
  for (const client of clients.slice(0, 10)) client.close();
  await delay(150);
  assert.equal(room.state.players.filter(p => p.humanId).length, 90);
  assert.equal(room.state.players.filter(p => p.bot).length, 10);
  assert.equal(room.state.players.length, 100);
});

test('browser origin policy and connection ceiling reject upgrade', async t => {
  const { url } = await start(t, { maxConnections: 1 });
  const hostile = new WsClient(url, { origin: 'https://untrusted.example' });
  const [err] = await once(hostile, 'error');
  assert.match(err.message, /403/);
  await connect(url);
  const overflow = new WsClient(url);
  const [fullError] = await once(overflow, 'error');
  assert.match(fullError.message, /403/);
});

test('desktop custom origin is accepted exactly and explicit origin lists still override defaults', async t => {
  const { url } = await start(t);
  const desktop = new WsClient(url, { origin: 'custard://game' });
  await once(desktop, 'open'); desktop.close(); await once(desktop, 'close');
  for (const origin of ['custard://other', 'custard://game.evil.example', 'https://game', 'custard://game:1234']) {
    const hostile = new WsClient(url, { origin });
    const [error] = await once(hostile, 'error'); assert.match(error.message, /403/, origin);
  }
  const restricted = await start(t, { allowedOrigins: ['https://approved.example'] });
  const blocked = new WsClient(restricted.url, { origin: 'custard://game' });
  assert.match((await once(blocked, 'error'))[0].message, /403/);
  const configured = await start(t, { allowedOrigins: ['custard://game'] });
  const permitted = new WsClient(configured.url, { origin: 'custard://game' });
  await once(permitted, 'open'); permitted.close(); await once(permitted, 'close');
});

test('negotiated deltas preserve two visor choices, detect gaps and resync over real sockets', async t => {
  const { app, url } = await start(t);
  const a = await connect(url), b = await connect(url), decoder = Wire.createDecoder();
  const wa = await join(a, { room: 'wire', wire: 1, visor: 'open' });
  assert.equal(wa.wire, 1);
  assert.equal(wa.snapshotHz, 20);
  assert.ok(decoder.apply(await a.read(m => m.type === 'snapshot')));
  const wb = await join(b, { room: 'wire', wire: 1, visor: 'closed' });
  let state;
  for (let i = 0; i < 10; i++) {
    const message = await a.read(m => m.type === 'delta' || m.type === 'snapshot');
    state = decoder.apply(message);
    assert.ok(state);
    if (state.players.some(p => p.humanId === wb.sessionId)) break;
  }
  assert.equal(state.players.find(p => p.humanId === wa.sessionId).visor, 'open');
  assert.equal(state.players.find(p => p.humanId === wb.sessionId).visor, 'closed');
  await a.read(m => m.type === 'delta'); // Deliberately discard one baseline-dependent packet.
  assert.equal(decoder.apply(await a.read(m => m.type === 'delta')), null);
  a.send({ type: 'resync' });
  assert.ok(decoder.apply(await a.read(m => m.type === 'snapshot')));
  assert.ok(decoder.apply(await a.read(m => m.type === 'delta')));
  b.close();
  await delay(80);
  assert.equal(app.rooms.get('wire').state.players.find(p => p.id === wb.slot).visor, 'closed');
});

test('room bot difficulty is fixed at creation and cannot be changed by a joining client', async t => {
  const { app, url } = await start(t, { snapshotHz: 100 });
  const a = await connect(url), b = await connect(url);
  assert.equal((await join(a, { room: 'skills', difficulty: 'admin' })).code, 'BAD_DIFFICULTY');
  const welcome = await join(a, { room: 'skills', difficulty: 'steve', wire: 1 });
  assert.equal(welcome.snapshotHz, 30, 'configured cadence is bounded');
  assert.equal((await a.read(m => m.type === 'snapshot')).state.difficulty, 'steve');
  assert.equal((await join(b, { room: 'skills', difficulty: 'easy' })).code, 'ROOM_SETTINGS');
  assert.equal((await join(b, { room: 'skills' })).type, 'welcome', 'omitted difficulty inherits established room');
  assert.equal(app.rooms.get('skills').state.difficulty, 'steve');
});

test('empty rooms expire, and bot matches do not earn ladder wins or score', async t => {
  const { app, url } = await start(t, { roomIdleMs: 50 });
  const client = await connect(url);
  await join(client, { room: 'expire' });
  await delay(100);
  const room = app.rooms.get('expire');
  assert.equal(room.humanOnly, false);
  const participant = room.state.players.find(p => p.humanId);
  participant.score = 75;
  // Force only the terminal core state to exercise server bookkeeping without a long soak.
  room.state.status = 'finished';
  room.state.winner = room.state.players.find(p => p.humanId).team;
  await delay(70);
  assert.equal(room.finalSnapshot.players.find(p => p.id === participant.id).score, 75);
  client.send({ type: 'leaderboard' });
  const results = await client.read(m => m.type === 'leaderboard');
  assert.equal(results.entries[0].matches, 1);
  assert.equal(results.entries[0].wins, 0);
  assert.equal(results.entries[0].score, 0);
  await delay(60);
  client.send({ type: 'leaderboard' });
  assert.equal((await client.read(m => m.type === 'leaderboard')).entries[0].matches, 1);
  client.send({ type: 'leave' });
  await client.read(m => m.type === 'left');
  assert.equal(room.finalSnapshot.players.find(p => p.id === participant.id).score, 75, 'departures preserve final scoreboard');
  assert.equal(room.state.players.find(p => p.id === participant.id).score, 0, 'live slot still refills as bot');
  await delay(120);
  assert.equal(app.rooms.size, 0);
});
