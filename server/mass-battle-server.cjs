'use strict';

// The browser sends intentions; only this process advances combat and objectives.
const http = require('node:http');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { WebSocketServer, WebSocket } = require('ws');
const Battle = require('../game/mass-battle.js');
const Wire = require('../game/mass-battle-wire.js');
const { queueKey, selectMatch } = require('./matchmaking.cjs');

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
  const accounts = new Map();
  const queues = new Map();
  const pendingResults = new Set();
  let playerStore = options.playerStore || null;
  let ownsStore = false, storeFailure = false, matchmakingBusy = false;
  let lastMatchmakeAt = -Infinity;
  const databasePath = options.playerDb ?? process.env.CK_PLAYER_DB;
  function store() {
    if (!playerStore && databasePath) {
      playerStore = require('./player-store.cjs').createPlayerStore({ filename: databasePath });
      ownsStore = true;
    }
    if (!playerStore) throw new Error('Private ladder unavailable');
    return playerStore;
  }
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
  function queueStatus(key) {
    const entries = queues.get(key) || [];
    for (const entry of entries) send(entry.c.ws, { type: 'queue', ranked: true, label: 'Private test ladder', waiting: entries.length, required: entry.teamSize * 2, mode: entry.mode, teamSize: entry.teamSize });
  }
  function detach(c, reason = 'participant_left') {
    if (c.queued) {
      const key = c.queued.key;
      queues.set(key, (queues.get(key) || []).filter(e => e.c !== c));
      c.queued = null;
      queueStatus(key);
      if (!queues.get(key).length) queues.delete(key);
    }
    const room = rooms.get(c.room);
    if (room && c.session) {
      if (room.ranked && !room.terminal) { room.eligible = false; room.ineligibleReason ||= reason; }
      Battle.leave(room.state, c.session.id);
      room.inputs.delete(c.session.id);
      room.lastActive = performance.now();
    }
    c.room = null;
    c.input = neutral();
    c.lastSeq = -1;
    if (c.session) { c.session.lastSeen = Date.now(); if (c.session.connection === c) c.session.connection = null; }
    void matchmake();
  }
  async function authenticate(c, token) {
    if (typeof token !== 'string' || !token.length || token.length > 1024) { error(c.ws, 'AUTH_REQUIRED', 'A host-issued private ladder credential is required.'); return null; }
    let account;
    try { account = await store().authenticate(token); }
    catch { storeFailure = true; error(c.ws, 'RANKED_UNAVAILABLE', 'Private ladder storage is unavailable.'); return null; }
    if (!account) { error(c.ws, 'AUTH_REQUIRED', 'This private ladder credential is invalid or revoked.'); return null; }
    if (accounts.has(account.id) && accounts.get(account.id) !== c) { error(c.ws, 'ACCOUNT_ACTIVE', 'This account is already connected.'); return null; }
    if (c.account && c.account.id !== account.id) { error(c.ws, 'ACCOUNT_ACTIVE', 'Reconnect before changing accounts.'); return null; }
    return account;
  }
  function bindAccount(c, account, token) {
    if (!account) return;
    c.account = account; c.accessToken = token; accounts.set(account.id, c);
  }
  function welcome(c, room, result, profile) {
    send(c.ws, { type: 'welcome', protocol: 1, wire: c.wire ? 1 : 0, snapshotHz, sessionId: c.session.id, resumeToken: c.session.token, room: room.id, playerId: result.id || c.session.id, slot: result.slot, team: result.team, ranked: !!room.ranked, rankingLabel: room.ranked ? 'Private test ladder' : 'Unranked — anonymous session', ...(profile ? { profile } : {}) });
    if (c.wire) {
      const full = room.encoder.full() || room.encoder.encode(Battle.snapshot(room.state));
      send(c.ws, { ...full, room: room.id, ...counts(room) });
    } else send(c.ws, { type: 'snapshot', room: room.id, state: Battle.snapshot(room.state), ...counts(room) });
  }
  function recordRanked(room, reason, retry = false) {
    if (room.recorded || room.persistencePending || (room.terminal && !retry)) return;
    if (!room.terminal) {
      room.terminal = true;
      room.frozenResult = Object.freeze({
        id: room.id, queueKey: room.queueKey, mode: room.mode, teamSize: room.teamSize,
        winner: room.state.status === 'finished' ? room.state.winner : null,
        participants: Object.freeze(room.roster.map(p => Object.freeze({ accountId: p.accountId, team: p.team }))),
        eligible: room.eligible && room.state.status === 'finished',
        reason: room.eligible && room.state.status === 'finished' ? (room.state.finishReason || 'completed') : room.ineligibleReason || reason || 'match_removed',
      });
    }
    room.persistencePending = true;
    const task = (async () => {
      let result;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (!room.resultPayload) {
            let eligible = room.frozenResult.eligible, resultReason = room.frozenResult.reason;
            if (eligible) for (const p of room.roster) {
              const account = await store().authenticate(p.c.accessToken);
              if (!account || account.id !== p.accountId) { eligible = false; resultReason = 'credential_revoked'; break; }
            }
            room.resultPayload = Object.freeze({ ...room.frozenResult, eligible, reason: resultReason });
          }
          // Every retry uses exactly the same match ID and immutable payload.
          result = await store().recordMatch(room.resultPayload);
          room.recorded = true; room.persistenceError = false;
          break;
        } catch {
          room.persistenceError = true;
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
      room.persistencePending = false;
      if (!room.recorded) {
        for (const p of room.roster) send(p.c.ws, { type: 'error', room: room.id, code: 'RATING_UNAVAILABLE', message: 'The match result could not be confirmed saved. It is retained for retry; private ladder results are unavailable.' });
        return;
      }
      // A profile read failure cannot undo a committed result or report it unsaved.
      try {
        for (const participant of room.roster) {
          let profile = null;
          try { profile = await store().profile(participant.accountId, room.queueKey); }
          catch { send(participant.c.ws, { type: 'error', room: room.id, code: 'RATING_PROFILE_UNAVAILABLE', message: 'The result was saved, but your updated profile is temporarily unavailable.' }); }
          const change = result.changes?.find(x => x.accountId === participant.accountId);
          send(participant.c.ws, { type: 'rating', ranked: true, room: room.id, eligible: result.eligible, reason: result.reason, changes: change ? { before: change.before, after: change.after, delta: change.delta } : null, profile });
        }
      } catch { /* The durable result remains saved if a socket closes during delivery. */ }
    })();
    pendingResults.add(task); task.finally(() => pendingResults.delete(task));
    return task;
  }
  async function matchmake() {
    if (matchmakingBusy || stopped) return;
    matchmakingBusy = true;
    lastMatchmakeAt = performance.now();
    try {
      for (const key of queues.keys()) {
        while (!stopped && rooms.size < maxRooms) {
          const entries = queues.get(key) || [];
          if (!entries.length) break;
          const selected = selectMatch(entries, entries[0]?.teamSize * 2, performance.now());
          if (!selected) break;
          let valid = true;
          for (const e of selected) {
            let account;
            try { account = await store().authenticate(e.c.accessToken); }
            catch { storeFailure = true; error(e.c.ws, 'RANKED_UNAVAILABLE', 'Private ladder storage is unavailable.'); }
            if (!account || account.id !== e.c.account?.id || e.c.queued !== e || e.c.ws.readyState !== WebSocket.OPEN) {
              if (e.c.queued === e) { detach(e.c); error(e.c.ws, 'AUTH_REQUIRED', 'Your private ladder credential is no longer valid.'); }
              valid = false;
            }
          }
          if (stopped || !valid || selected.some(e => e.c.queued !== e)) break;
          const { mode, teamSize } = selected[0];
          const room = { id: `ranked-${crypto.randomUUID()}`, mode, teamSize, difficulty: 'medium', state: Battle.create({ mode, teamSize, difficulty: 'medium', seed: crypto.randomBytes(4).readUInt32LE(0) }), inputs: new Map(), lastActive: performance.now(), recorded: false, humanOnly: true, encoder: Wire.createEncoder(), ranked: true, eligible: true, queueKey: key, roster: [] };
          const joined = [];
          // All slots become human synchronously before the room is visible to tick.
          for (const e of selected) {
            const c = e.c;
            const result = Battle.join(room.state, { id: c.session.id, name: c.account.name, rating: e.profile.rating, role: e.role, visor: e.visor });
            if (!result.ok) throw new Error('Unable to fill ranked roster');
            c.queued = null; c.room = room.id; c.team = result.team; c.lastInputAt = performance.now();
            room.inputs.set(c.session.id, neutral());
            room.roster.push({ accountId: c.account.id, team: result.team, c });
            joined.push({ c, result, profile: e.profile });
          }
          const remaining = (queues.get(key) || []).filter(e => !selected.includes(e));
          if (remaining.length) queues.set(key, remaining); else queues.delete(key);
          rooms.set(room.id, room);
          for (const j of joined) welcome(j.c, room, j.result, j.profile);
          queueStatus(key);
        }
      }
    } catch { storeFailure = true; }
    finally { matchmakingBusy = false; }
  }
  async function join(c, msg) {
    const now = performance.now();
    if (now - c.joinWindow > 60_000) { c.joinWindow = now; c.joins = 0; }
    if (++c.joins > 10) { error(c.ws, 'JOIN_RATE', 'Please wait before changing rooms again.'); return; }
    const mode = msg.mode ?? 'brawl';
    if (msg.wire !== undefined && msg.wire !== 1) { error(c.ws, 'BAD_PROTOCOL', 'Unsupported battle replication version.'); return; }
    const teamSize = msg.teamSize ?? 4;
    if (!MODES.has(mode) || !TEAM_SIZES.has(teamSize)) { error(c.ws, 'BAD_MODE', 'Choose brawl, ctf or siege and 4, 20 or 50 players per team.'); return; }
    if (msg.role !== undefined && !ROLES.has(msg.role)) { error(c.ws, 'BAD_ROLE', 'Unknown battle role.'); return; }
    if (msg.ranked !== undefined && typeof msg.ranked !== 'boolean') { error(c.ws, 'BAD_RANKED', 'Ranked must be true or false.'); return; }
    if (msg.room !== undefined && (typeof msg.room !== 'string' || (msg.room !== '' && !/^[a-zA-Z0-9_-]{1,32}$/.test(msg.room)))) { error(c.ws, 'BAD_ROOM', 'Room codes use 1–32 letters, numbers, dashes or underscores.'); return; }
    if (msg.room?.toLowerCase().startsWith('ranked-') || (msg.ranked && msg.room)) { error(c.ws, 'RANKED_QUEUE_ONLY', 'Private ladder games can only be entered through matchmaking.'); return; }
    let account = null;
    if (msg.ranked || msg.accessToken !== undefined || c.account) {
      account = await authenticate(c, msg.accessToken ?? c.accessToken);
      if (!account || c.ws.readyState !== WebSocket.OPEN) return;
    }
    if (c.room && rooms.get(c.room)?.ranked && !rooms.get(c.room).terminal) { error(c.ws, 'ALREADY_JOINED', 'Leave your current match before joining again.'); return; }
    const compatible = !msg.room && !msg.ranked ? [...rooms.values()].find(r => !r.ranked && r.mode === mode && r.teamSize === teamSize && r.difficulty === (msg.difficulty || 'medium') && r.state.status !== 'finished' && counts(r).humans < teamSize * 2 && r.id !== c.room) : null;
    const defaultId = `${mode}-${teamSize}`;
    const roomId = msg.room || compatible?.id || (rooms.has(defaultId) ? `${defaultId}-${crypto.randomBytes(4).toString('hex')}` : defaultId);
    let room = msg.ranked ? undefined : rooms.get(roomId);
    const difficulty = msg.difficulty ?? room?.difficulty ?? 'medium';
    if (!['easy', 'medium', 'hard', 'steve'].includes(difficulty)) { error(c.ws, 'BAD_DIFFICULTY', 'Choose easy, medium, hard or steve bots.'); return; }
    if (room && room.difficulty !== difficulty) { error(c.ws, 'ROOM_SETTINGS', 'This room uses a different bot difficulty.'); return; }
    if (room && (room.mode !== mode || room.teamSize !== teamSize)) { error(c.ws, 'ROOM_SETTINGS', 'This room uses different mode or team size settings.'); return; }
    if (room && room.state.status === 'finished') { error(c.ws, 'MATCH_FINISHED', 'This match has ended. Choose another room code.'); return; }
    if (!msg.ranked && !room && rooms.size >= maxRooms) { error(c.ws, 'ROOM_LIMIT', 'This server has no free battle rooms.'); return; }
    if (c.room === roomId) { error(c.ws, 'ALREADY_JOINED', 'You are already in this room.'); return; }
    let session = c.session;
    if (session && !sessions.has(session.token)) session = null;
    if (msg.resumeToken !== undefined) {
      if (typeof msg.resumeToken !== 'string' || !/^[a-f0-9]{48}$/.test(msg.resumeToken)) { error(c.ws, 'BAD_SESSION', 'Invalid resume token.'); return; }
      session = sessions.get(msg.resumeToken);
      if (!session) { error(c.ws, 'BAD_SESSION', 'This session has expired. Join without a resume token.'); return; }
    }
    if (session?.accountId && session.accountId !== account?.id) { error(c.ws, 'AUTH_REQUIRED', 'This session requires its private ladder credential.'); return; }
    if (session?.connection && session.connection !== c && (account || session.accountId)) { error(c.ws, 'ACCOUNT_ACTIVE', 'This account is already connected.'); return; }
    let profile;
    if (account) {
      try { profile = await store().profile(account.id, queueKey(mode, teamSize)); }
      catch { storeFailure = true; error(c.ws, 'RANKED_UNAVAILABLE', 'Private ladder storage is unavailable.'); return; }
      if (c.ws.readyState !== WebSocket.OPEN) return;
      if (accounts.has(account.id) && accounts.get(account.id) !== c) { error(c.ws, 'ACCOUNT_ACTIVE', 'This account is already connected.'); return; }
    }
    if (room && counts(room).humans >= teamSize * 2 && session?.connection?.room !== roomId) { error(c.ws, 'ROOM_FULL', 'This room is full.'); return; }
    if (account && accounts.has(account.id) && accounts.get(account.id) !== c) { error(c.ws, 'ACCOUNT_ACTIVE', 'This account is already connected.'); return; }
    if (!session) {
      if (sessions.size >= 2048) { error(c.ws, 'SESSION_LIMIT', 'This server is busy. Try again later.'); return; }
      session = { id: crypto.randomUUID(), token: crypto.randomBytes(24).toString('hex'), name: safeName(msg.name) || 'Knight', rating: 1000, matches: 0, wins: 0, score: 0, lastSeen: Date.now(), connection: null };
      sessions.set(session.token, session);
    }
    bindAccount(c, account, msg.accessToken ?? c.accessToken);
    if (account) { session.accountId = account.id; session.rating = profile.rating; }
    if (msg.ranked) {
      detach(c);
      c.session = session; session.connection = c; session.lastSeen = Date.now(); c.wire = msg.wire === 1;
      const key = queueKey(mode, teamSize);
      const entry = { c, key, mode, teamSize, profile, joinedAt: performance.now(), role: msg.role, visor: msg.visor };
      c.queued = entry;
      if (!queues.has(key)) queues.set(key, []);
      queues.get(key).push(entry); queueStatus(key);
      void matchmake(); return;
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
    welcome(c, room, result, profile);
  }
  async function leaderboard(c, msg) {
    if (msg.ranked === true || c.queued || rooms.get(c.room)?.ranked) {
      const mode = msg.mode ?? c.queued?.mode ?? rooms.get(c.room)?.mode ?? 'brawl';
      const teamSize = msg.teamSize ?? c.queued?.teamSize ?? rooms.get(c.room)?.teamSize ?? 4;
      if (!MODES.has(mode) || !TEAM_SIZES.has(teamSize)) { error(c.ws, 'BAD_MODE', 'Choose a valid ladder queue.'); return; }
      const account = await authenticate(c, c.accessToken);
      if (!account) return;
      try {
        const entries = await store().leaderboard(queueKey(mode, teamSize), 50);
        send(c.ws, { type: 'leaderboard', ranked: true, label: 'Private test ladder', mode, teamSize, entries });
      } catch { storeFailure = true; error(c.ws, 'RANKED_UNAVAILABLE', 'Private ladder storage is unavailable.'); }
      return;
    }
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
    if (msg.type === 'leave' || msg.type === 'cancel') { detach(c); send(c.ws, { type: 'left' }); return; }
    if (msg.type === 'resync') {
      const room = rooms.get(c.room);
      if (!room || !c.wire) { error(c.ws, 'NOT_JOINED', 'Join a versioned battle room first.'); return; }
      if (c.lastResyncAt !== undefined && now - c.lastResyncAt < 500) return;
      c.lastResyncAt = now;
      const full = room.encoder.full() || room.encoder.encode(room.finalSnapshot || Battle.snapshot(room.state));
      send(c.ws, { ...full, room: room.id, ...counts(room) }); return;
    }
    if (msg.type === 'leaderboard') return leaderboard(c, msg);
    if (msg.type === 'ping') { send(c.ws, { type: 'pong', time: Date.now() }); return; }
    error(c.ws, 'BAD_TYPE', 'Unknown message type.');
  }
  function tick() {
    if (stopped) return;
    const now = performance.now();
    // Bands widen every 15 seconds. Queue changes trigger immediately; unchanged
    // queues only need a periodic check, not a search on every combat step.
    if (now - lastMatchmakeAt >= 1000) void matchmake();
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
      if (!present.length) { if (now - room.lastActive > idleMs) { if (room.ranked) recordRanked(room, 'room_abandoned'); if (!room.ranked || room.recorded) rooms.delete(room.id); } continue; }
      room.lastActive = now;
      if (room.state.status !== 'finished') {
        if (present.length !== room.teamSize * 2) room.humanOnly = false;
        Battle.step(room.state, dt, Object.fromEntries(room.inputs));
      }
      if (room.state.status === 'finished' && !room.recorded) {
        room.finalSnapshot = Battle.snapshot(room.state);
        if (room.ranked) recordRanked(room, 'completed');
        else {
        room.recorded = true;
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
      const unresolvedResults = [...rooms.values()].filter(r => r.ranked && r.terminal && !r.recorded);
      res.end(JSON.stringify({ ok: true, protocol: 1, ranked: false, privateRanked: !!(playerStore || databasePath) && !storeFailure && !unresolvedResults.some(r => r.persistenceError), pendingRankedResults: unresolvedResults.length, rooms: rooms.size, connections: connections.size, maxRooms, maxConnections, stepHz, snapshotHz }));
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
    c.messages = Promise.resolve();
    ws.on('message', (raw, binary) => { c.messages = c.messages.then(() => { if (ws.readyState === WebSocket.OPEN) return handle(c, raw, binary); }).catch(() => error(ws, 'SERVER_ERROR', 'This request could not be completed.')); });
    ws.on('pong', () => { c.alive = true; });
    ws.on('error', () => {});
    ws.on('close', () => { detach(c, 'participant_disconnected'); if (c.account && accounts.get(c.account.id) === c) accounts.delete(c.account.id); connections.delete(c); });
  });
  let heartbeat;
  return {
    server, rooms, metrics,
    // Host integration can retry retained failures after restoring database access.
    async retryRankedResults() {
      await Promise.allSettled([...rooms.values()].filter(r => r.ranked && r.terminal && !r.recorded).map(r => recordRanked(r, undefined, true)));
    },
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
      for (const room of rooms.values()) if (room.ranked && !room.recorded) {
        if (!room.terminal) { room.eligible = false; room.ineligibleReason ||= 'server_shutdown'; }
        recordRanked(room, 'server_shutdown', true);
      }
      for (const c of connections) c.ws.terminate();
      await new Promise(resolve => wss.close(resolve));
      await new Promise(resolve => server.close(resolve));
      await Promise.allSettled([...pendingResults]);
      if (ownsStore) playerStore.close();
    },
  };
}

if (require.main === module) {
  const app = createBattleServer();
  app.listen().then(address => console.log(`Custard Knights unranked battle server: ws://${address.address}:${address.port}/battle`)).catch(err => { console.error(err.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close().then(() => process.exit(0)));
}

module.exports = { createBattleServer, validateInput };
