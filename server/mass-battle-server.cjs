'use strict';

// The browser sends intentions; only this process advances combat and objectives.
const http = require('node:http');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { WebSocketServer, WebSocket } = require('ws');
const Battle = require('../game/mass-battle.js');
const Wire = require('../game/mass-battle-wire.js');

const MODES = new Set(['brawl', 'ctf', 'siege']);
const TEAM_SIZES = new Set([4, 20, 50]);
const ROLES = new Set(Object.keys(Battle.roles));
const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const clamp = (x, low, high) => Math.max(low, Math.min(high, x));
const safeName = (x) => typeof x === 'string' ? x.replace(/[\x00-\x1f\x7f<>]/g, '').trim().slice(0, 24) : 'Knight';
const neutral = () => ({ moveX: 0, moveY: 0, aimX: 1, aimY: 0, attack: false, heavy: false, guard: false, dash: false, ability: false });

function validateInput(msg) {
  if (!Number.isSafeInteger(msg.seq) || msg.seq < 0) return null;
  const result = { seq: msg.seq };
  for (const key of ['moveX', 'moveY', 'aimX', 'aimY']) {
    if (!finite(msg[key])) return null;
    result[key] = clamp(msg[key], -1, 1);
  }
  for (const key of ['attack', 'heavy', 'guard', 'dash', 'ability']) {
    if (msg[key] !== undefined && typeof msg[key] !== 'boolean') return null;
    result[key] = msg[key] === true;
  }
  return result;
}

function createBattleServer(options = {}) {
  const host = options.host ?? process.env.CK_BATTLE_HOST ?? '127.0.0.1';
  const port = Number(options.port ?? process.env.CK_BATTLE_PORT ?? 8787);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid battle server port');
  const stepHz = 30;
  const snapshotHz = clamp(Number(options.snapshotHz ?? process.env.CK_BATTLE_SNAPSHOT_HZ) || 20, 10, 30);
  const maxRooms = clamp(Number(options.maxRooms) || 8, 1, 32);
  const maxConnections = clamp(Number(options.maxConnections) || 128, 1, 512);
  const idleMs = options.roomIdleMs ?? 60_000;
  const sessionTtlMs = options.sessionTtlMs ?? 60 * 60_000;
  const allowedOrigins = options.allowedOrigins ?? (process.env.CK_BATTLE_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const rooms = new Map();
  const sessions = new Map();
  const connections = new Set();
  let timer, stopped = false;
  let lastTick = performance.now();
  let snapshotElapsed = 0;
  const metrics = { steps: 0, maxStepMs: 0, totalStepMs: 0, tickSamplesMs: [], maxTickGapMs: 0, maxSnapshotBytes: 0, snapshots: 0, rejectedInputs: 0, rateLimited: 0 };

  function originAllowed(origin) {
    // The desktop's standard custom protocol sends its exact custard://game origin.
    // Native clients may omit Origin; file-based browser clients send "null".
    // This is a cross-site browser guard, not authentication.
    if (!origin) return true;
    if (allowedOrigins.length) return allowedOrigins.includes(origin);
    if (origin === 'null' || origin === 'custard://game') return true;
    try { const u = new URL(origin); return ['http:', 'https:'].includes(u.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname); }
    catch { return false; }
  }
  function send(ws, object) {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (ws.bufferedAmount > 512 * 1024) { ws.close(1013, 'Connection too slow'); return; }
    ws.send(typeof object === 'string' ? object : JSON.stringify(object));
  }
  function error(ws, code, message) { send(ws, { type: 'error', code, message }); }
  function counts(room) {
    let humans = 0;
    for (const c of connections) if (c.room === room.id) humans++;
    return { humans, bots: room.teamSize * 2 - humans, capacity: room.teamSize * 2 };
  }
  function detach(c) {
    const room = rooms.get(c.room);
    if (room && c.session) {
      Battle.leave(room.state, c.session.id);
      room.inputs.delete(c.session.id);
      room.lastActive = performance.now();
    }
    c.room = null;
    c.input = neutral();
    c.lastSeq = -1;
    if (c.session) { c.session.lastSeen = Date.now(); if (c.session.connection === c) c.session.connection = null; }
  }
  function join(c, msg) {
    const now = performance.now();
    if (now - c.joinWindow > 60_000) { c.joinWindow = now; c.joins = 0; }
    if (++c.joins > 10) { error(c.ws, 'JOIN_RATE', 'Please wait before changing rooms again.'); return; }
    const mode = msg.mode ?? 'brawl';
    if (msg.wire !== undefined && msg.wire !== 1) { error(c.ws, 'BAD_PROTOCOL', 'Unsupported battle replication version.'); return; }
    const teamSize = msg.teamSize ?? 4;
    if (!MODES.has(mode) || !TEAM_SIZES.has(teamSize)) { error(c.ws, 'BAD_MODE', 'Choose brawl, ctf or siege and 4, 20 or 50 players per team.'); return; }
    if (msg.role !== undefined && !ROLES.has(msg.role)) { error(c.ws, 'BAD_ROLE', 'Unknown battle role.'); return; }
    if (msg.room !== undefined && (typeof msg.room !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(msg.room))) { error(c.ws, 'BAD_ROOM', 'Room codes use 1–32 letters, numbers, dashes or underscores.'); return; }
    const roomId = msg.room || `${mode}-${teamSize}`;
    let room = rooms.get(roomId);
    const difficulty = msg.difficulty ?? room?.difficulty ?? 'medium';
    if (!['easy', 'medium', 'hard', 'steve'].includes(difficulty)) { error(c.ws, 'BAD_DIFFICULTY', 'Choose easy, medium, hard or steve bots.'); return; }
    if (room && room.difficulty !== difficulty) { error(c.ws, 'ROOM_SETTINGS', 'This room uses a different bot difficulty.'); return; }
    if (room && (room.mode !== mode || room.teamSize !== teamSize)) { error(c.ws, 'ROOM_SETTINGS', 'This room uses different mode or team size settings.'); return; }
    if (room && room.state.status === 'finished') { error(c.ws, 'MATCH_FINISHED', 'This match has ended. Choose another room code.'); return; }
    if (!room && rooms.size >= maxRooms) { error(c.ws, 'ROOM_LIMIT', 'This server has no free battle rooms.'); return; }
    if (c.room === roomId) { error(c.ws, 'ALREADY_JOINED', 'You are already in this room.'); return; }
    let session = c.session;
    if (session && !sessions.has(session.token)) session = null;
    if (msg.resumeToken !== undefined) {
      if (typeof msg.resumeToken !== 'string' || !/^[a-f0-9]{48}$/.test(msg.resumeToken)) { error(c.ws, 'BAD_SESSION', 'Invalid resume token.'); return; }
      session = sessions.get(msg.resumeToken);
      if (!session) { error(c.ws, 'BAD_SESSION', 'This session has expired. Join without a resume token.'); return; }
    }
    if (room && counts(room).humans >= teamSize * 2 && session?.connection?.room !== roomId) { error(c.ws, 'ROOM_FULL', 'This room is full.'); return; }
    if (!session) {
      if (sessions.size >= 2048) { error(c.ws, 'SESSION_LIMIT', 'This server is busy. Try again later.'); return; }
      session = { id: crypto.randomUUID(), token: crypto.randomBytes(24).toString('hex'), name: safeName(msg.name) || 'Knight', rating: 1000, matches: 0, wins: 0, score: 0, lastSeen: Date.now(), connection: null };
      sessions.set(session.token, session);
    }
    if (!room) {
      room = { id: roomId, mode, teamSize, difficulty, state: Battle.create({ mode, teamSize, difficulty, seed: crypto.randomBytes(4).readUInt32LE(0) }), inputs: new Map(), lastActive: now, recorded: false, humanOnly: true, encoder: Wire.createEncoder() };
      rooms.set(roomId, room);
    }
    // Validate destination before disturbing an existing match.
    if (session.connection && session.connection !== c) { const prior = session.connection; detach(prior); prior.ws.close(4001, 'Session resumed elsewhere'); }
    detach(c);
    const result = Battle.join(room.state, { id: session.id, name: safeName(msg.name) || session.name, rating: session.rating, role: msg.role, visor: msg.visor === 'open' ? 'open' : 'closed' });
    if (!result || !result.ok) { error(c.ws, 'JOIN_FAILED', result?.error || 'Unable to join this battle.'); return; }
    c.session = session;
    session.connection = c;
    session.lastSeen = Date.now();
    session.name = safeName(msg.name) || session.name;
    c.room = roomId;
    c.wire = msg.wire === 1;
    c.team = result.team;
    c.lastInputAt = now;
    room.inputs.set(session.id, neutral());
    room.lastActive = now;
    send(c.ws, { type: 'welcome', protocol: 1, wire: c.wire ? 1 : 0, snapshotHz, sessionId: session.id, resumeToken: session.token, room: roomId, playerId: result.id || session.id, slot: result.slot, team: result.team, ranked: false, rankingLabel: 'Unranked — anonymous session' });
    if (c.wire) {
      // New clients start from the exact common baseline. Their join appears in
      // the next ordered delta, never against a different per-client baseline.
      const full = room.encoder.full() || room.encoder.encode(Battle.snapshot(room.state));
      send(c.ws, { ...full, room: roomId, ...counts(room) });
    } else send(c.ws, { type: 'snapshot', room: roomId, state: Battle.snapshot(room.state), ...counts(room) });
  }
  function leaderboard(c) {
    const entries = [...sessions.values()].filter(s => s.matches > 0).map(s => ({ id: s.id, name: s.name, matches: s.matches, wins: s.wins, score: s.score })).sort((a, b) => b.score - a.score || b.wins - a.wins).slice(0, 50);
    send(c.ws, { type: 'leaderboard', ranked: false, label: 'Session results — unranked', entries });
  }
  function handle(c, raw, isBinary) {
    if (isBinary) { c.ws.close(1003, 'JSON text required'); return; }
    const now = performance.now();
    c.tokens = Math.min(120, c.tokens + (now - c.tokenTime) * 0.06);
    c.tokenTime = now;
    if (c.tokens < 1) { metrics.rateLimited++; c.ws.close(1008, 'Message rate exceeded'); return; }
    c.tokens--;
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { error(c.ws, 'BAD_JSON', 'Expected a JSON object.'); return; }
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) { error(c.ws, 'BAD_MESSAGE', 'Expected a JSON object.'); return; }
    if (msg.type === 'join') return join(c, msg);
    if (msg.type === 'input') {
      if (!c.room || !c.session) { error(c.ws, 'NOT_JOINED', 'Join a room first.'); return; }
      const input = validateInput(msg);
      if (!input) { metrics.rejectedInputs++; error(c.ws, 'BAD_INPUT', 'Input requires finite axes, an increasing integer sequence, and boolean actions.'); return; }
      if (input.seq <= c.lastSeq) return;
      c.lastSeq = input.seq;
      c.lastInputAt = now;
      c.input = input;
      rooms.get(c.room)?.inputs.set(c.session.id, input);
      return;
    }
    if (msg.type === 'leave') { detach(c); send(c.ws, { type: 'left' }); return; }
    if (msg.type === 'resync') {
      const room = rooms.get(c.room);
      if (!room || !c.wire) { error(c.ws, 'NOT_JOINED', 'Join a versioned battle room first.'); return; }
      if (c.lastResyncAt !== undefined && now - c.lastResyncAt < 500) return;
      c.lastResyncAt = now;
      const full = room.encoder.full() || room.encoder.encode(room.finalSnapshot || Battle.snapshot(room.state));
      send(c.ws, { ...full, room: room.id, ...counts(room) }); return;
    }
    if (msg.type === 'leaderboard') return leaderboard(c);
    if (msg.type === 'ping') { send(c.ws, { type: 'pong', time: Date.now() }); return; }
    error(c.ws, 'BAD_TYPE', 'Unknown message type.');
  }
  function tick() {
    if (stopped) return;
    const now = performance.now();
    metrics.maxTickGapMs = Math.max(metrics.maxTickGapMs, now - lastTick);
    const dt = Math.min(0.1, Math.max(0, (now - lastTick) / 1000));
    lastTick = now;
    snapshotElapsed += dt;
    const broadcast = snapshotElapsed >= 1 / snapshotHz;
    if (broadcast) snapshotElapsed %= 1 / snapshotHz;
    const stepStarted = performance.now();
    for (const c of connections) {
      if (c.room && now - c.lastInputAt > 350 && c.session) rooms.get(c.room)?.inputs.set(c.session.id, neutral());
    }
    for (const room of rooms.values()) {
      const present = [...connections].filter(c => c.room === room.id);
      if (!present.length) { if (now - room.lastActive > idleMs) rooms.delete(room.id); continue; }
      room.lastActive = now;
      if (room.state.status !== 'finished') {
        if (present.length !== room.teamSize * 2) room.humanOnly = false;
        Battle.step(room.state, dt, Object.fromEntries(room.inputs));
      }
      if (room.state.status === 'finished' && !room.recorded) {
        room.recorded = true;
        room.finalSnapshot = Battle.snapshot(room.state);
        // Session participation is deliberately not a competitive rating or MMR.
        // Bot-assisted victories never award ladder points.
        const allHuman = room.humanOnly && present.length === room.teamSize * 2;
        for (const c of present) {
          c.session.matches++;
          if (allHuman && c.team === room.state.winner) c.session.wins++;
          // Scores reflect only complete human matches; no bot-farming ladder.
          if (allHuman) {
            const p = room.state.players.find(p => p.humanId === c.session.id || p.id === c.session.id);
            c.session.score += Math.max(0, Math.min(10000, Number(p?.score) || 0));
          }
        }
      }
      if (broadcast) {
        const state = room.finalSnapshot || Battle.snapshot(room.state), summary = counts(room);
        const payload = JSON.stringify({ ...room.encoder.encode(state), room: room.id, ...summary });
        const legacy = present.some(c => !c.wire) ? JSON.stringify({ type: 'snapshot', room: room.id, state, ...summary }) : null;
        metrics.maxSnapshotBytes = Math.max(metrics.maxSnapshotBytes, Buffer.byteLength(payload), legacy ? Buffer.byteLength(legacy) : 0);
        metrics.snapshots++;
        for (const c of present) send(c.ws, c.wire ? payload : legacy);
      }
    }
    for (const [token, session] of sessions) if (!session.connection && Date.now() - session.lastSeen > sessionTtlMs) sessions.delete(token);
    const cost = performance.now() - stepStarted;
    metrics.steps++; metrics.maxStepMs = Math.max(metrics.maxStepMs, cost); metrics.totalStepMs += cost;
    metrics.tickSamplesMs.push(cost); if (metrics.tickSamplesMs.length > 3600) metrics.tickSamplesMs.shift();
  }
  const server = http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, protocol: 1, ranked: false, rooms: rooms.size, connections: connections.size, maxRooms, maxConnections, stepHz, snapshotHz }));
    } else { res.writeHead(404); res.end('Not found'); }
  });
  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  const wss = new WebSocketServer({ noServer: true, maxPayload: 2048, perMessageDeflate: false });
  server.on('upgrade', (req, socket, head) => {
    if (stopped || !['/', '/battle'].includes(req.url) || !originAllowed(req.headers.origin) || connections.size >= maxConnections) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); return;
    }
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  });
  wss.on('connection', ws => {
    const now = performance.now();
    const c = { ws, session: null, room: null, input: neutral(), lastSeq: -1, lastInputAt: now, tokenTime: now, tokens: 120, joinWindow: now, joins: 0, alive: true };
    connections.add(c);
    ws.on('message', (raw, binary) => handle(c, raw, binary));
    ws.on('pong', () => { c.alive = true; });
    ws.on('error', () => {});
    ws.on('close', () => { detach(c); connections.delete(c); });
  });
  let heartbeat;
  return {
    server, rooms, metrics,
    address: () => server.address(),
    async listen() {
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, () => { server.removeListener('error', reject); resolve(); }); });
      lastTick = performance.now();
      timer = setInterval(tick, 1000 / stepHz);
      heartbeat = setInterval(() => { for (const c of connections) { if (!c.alive) c.ws.terminate(); else { c.alive = false; c.ws.ping(); } } }, 15_000);
      timer.unref(); heartbeat.unref();
      return server.address();
    },
    async close() {
      stopped = true; clearInterval(timer); clearInterval(heartbeat);
      for (const c of connections) c.ws.terminate();
      await new Promise(resolve => wss.close(resolve));
      await new Promise(resolve => server.close(resolve));
    },
  };
}

if (require.main === module) {
  const app = createBattleServer();
  app.listen().then(address => console.log(`Custard Knights unranked battle server: ws://${address.address}:${address.port}/battle`)).catch(err => { console.error(err.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close().then(() => process.exit(0)));
}

module.exports = { createBattleServer, validateInput };
