'use strict';
// Bounded real loopback socket load. Not a WAN, visual or minimum-spec test.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { performance } = require('node:perf_hooks');
const WebSocket = require('ws');
const { createBattleServer } = require('../server/mass-battle-server.cjs');
const Wire = require('../game/mass-battle-wire.js');
const duration = Math.min(120, Math.max(1, Number(process.argv[2]) || 60));
const output = process.argv[3] || path.join('qa', 'results', 'mass-battle-load.json');
const percentile = (values, q) => { const ordered = [...values].sort((a, b) => a - b); return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * q))] || 0; };
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source = { coreSha256: hash(path.join(__dirname, '../game/mass-battle.js')), serverSha256: hash(path.join(__dirname, '../server/mass-battle-server.cjs')), wireSha256: hash(path.join(__dirname, '../game/mass-battle-wire.js')) };
const app = createBattleServer({ port: 0 });
const clients = [], errors = [], unexpectedCloses = [];
let stopping = false, packets = 0, bytes = 0, sent = 0, maxClientGap = 0, peakRss = 0;
let deltaPackets = 0, deltaBytes = 0, maxDeltaBytes = 0, fullPackets = 0, referenceFullBytes = 0;
let inputTimer, progressTimer;
(async () => {
  const address = await app.listen();
  const url = `ws://127.0.0.1:${address.port}/battle`;
  for (let batch = 0; batch < 10; batch++) await Promise.all(Array.from({ length: 10 }, (_, i) => new Promise((resolve, reject) => {
    const number = batch * 10 + i;
    const c = { ws: new WebSocket(url), number, seq: 0, state: null, id: null, lastPacket: 0, decoder: Wire.createDecoder() };
    clients.push(c);
    const timeout = setTimeout(() => reject(Error('Join timed out')), 10000);
    c.ws.onopen = () => c.ws.send(JSON.stringify({ type: 'join', room: 'load', mode: 'brawl', teamSize: 50, wire: 1, visor: number % 2 ? 'open' : 'closed', name: `Load ${number}`, role: ['vanguard', 'ranger', 'engineer', 'support'][number % 4] }));
    c.ws.onmessage = event => {
      // Every client parses each snapshot, as real clients must; all run on the same host.
      const msg = JSON.parse(event.data);
      if (msg.type === 'welcome') { c.id = msg.sessionId; clearTimeout(timeout); resolve(); }
      if (msg.type === 'error') { errors.push(msg); clearTimeout(timeout); reject(Error(msg.message)); }
      if (msg.type === 'snapshot' || msg.type === 'delta') {
        const decoded = c.decoder.apply(msg);
        if (!decoded) { errors.push({ client: c.number, type: 'decode', seq: msg.seq }); return; }
        const now = performance.now(); if (c.lastPacket) maxClientGap = Math.max(maxClientGap, now - c.lastPacket);
        c.lastPacket = now; c.state = decoded; packets++; const size = Buffer.byteLength(event.data); bytes += size;
        if (msg.type === 'delta') { deltaPackets++; deltaBytes += size; maxDeltaBytes = Math.max(maxDeltaBytes, size); } else fullPackets++;
        if (c.number === 0) referenceFullBytes += Buffer.byteLength(JSON.stringify({ type: 'snapshot', room: 'load', state: decoded, humans: 100, bots: 0, capacity: 100 }));
      }
    };
    c.ws.onerror = event => { clearTimeout(timeout); reject(Error(event.message || 'Socket error')); };
    c.ws.onclose = event => { if (!stopping) unexpectedCloses.push({ client: number, code: event.code, reason: event.reason }); };
  })));
  const started = performance.now(), initialElapsed = app.rooms.get('load').state.elapsed;
  const gaps = []; let previousInput = started;
  inputTimer = setInterval(() => {
    const now = performance.now(), elapsed = (now - started) / 1000;
    gaps.push(now - previousInput); previousInput = now;
    peakRss = Math.max(peakRss, process.memoryUsage().rss);
    for (const c of clients) {
      if (c.ws.readyState !== WebSocket.OPEN || !c.state) continue;
      const me = c.state.players.find(p => p.humanId === c.id);
      if (!me) continue;
      let target, nearest = Infinity;
      for (const p of c.state.players) if (p.alive && p.team !== me.team) { const d = (p.x - me.x) ** 2 + (p.y - me.y) ** 2; if (d < nearest) { nearest = d; target = p; } }
      target ||= { x: 1600, y: 900 };
      const dx = target.x - me.x, dy = target.y - me.y, length = Math.hypot(dx, dy) || 1;
      const range = me.role === 'ranger' ? 300 : 70;
      const moving = length > range ? 1 : 0;
      const guard = length < 140 && (Math.floor(elapsed * 2) + c.number) % 9 === 0;
      c.ws.send(JSON.stringify({ type: 'input', seq: ++c.seq, moveX: dx / length * moving, moveY: dy / length * moving, aimX: dx / length, aimY: dy / length,
        attack: length < (me.role === 'ranger' ? 500 : 115) && !guard, heavy: me.role !== 'ranger' && length < 125 && (Math.floor(elapsed) + c.number) % 4 === 0,
        guard, dash: length > 150 && (Math.floor(elapsed * 3) + c.number) % 21 === 0, ability: !guard && length < 220 }));
      sent++;
    }
  }, 50);
  progressTimer = setInterval(() => console.log(JSON.stringify({ seconds: Math.round((performance.now() - started) / 1000), inputs: sent, snapshots: packets, disconnects: unexpectedCloses.length })), 15000);
  await new Promise(resolve => setTimeout(resolve, duration * 1000));
  clearInterval(inputTimer); clearInterval(progressTimer);
  const elapsed = (performance.now() - started) / 1000, state = app.rooms.get('load').state;
  const result = {
    status: unexpectedCloses.length || errors.length || state.players.filter(p => !p.bot).length !== 100 ? 'fail' : 'pass',
    date: new Date().toISOString(), durationSeconds: elapsed, clients: 100, inputHzTarget: 20, mode: state.mode, humanCount: state.players.filter(p => !p.bot).length,
    clientTransport: 'ws 8.22.0',
    inputs: sent, receivedSnapshots: packets, receivedPayloadBytes: bytes, aggregateReceiveMbps: bytes * 8 / elapsed / 1e6,
    wireVersion: 1, snapshotHz: 20, fullPackets, deltaPackets, meanDeltaBytes: deltaBytes / Math.max(1, deltaPackets), maxDeltaBytes,
    equivalentFullPayloadMbps: referenceFullBytes * clients.length * 8 / elapsed / 1e6,
    simulationSeconds: state.elapsed - initialElapsed, scores: state.scores, kills: state.players.reduce((sum, p) => sum + p.kills, 0),
    serverTickP95Ms: percentile(app.metrics.tickSamplesMs, .95), serverTickP99Ms: percentile(app.metrics.tickSamplesMs, .99),
    serverTickMaxMs: app.metrics.maxStepMs, serverTickGapMaxMs: app.metrics.maxTickGapMs, maxSnapshotBytes: app.metrics.maxSnapshotBytes,
    clientSnapshotGapMaxMs: maxClientGap, clientInputIntervalP95Ms: percentile(gaps, .95), peakCombinedRssBytes: peakRss,
    unexpectedCloses, errors, rejectedInputs: app.metrics.rejectedInputs, rateLimited: app.metrics.rateLimited,
    host: { cpu: os.cpus()[0].model, memoryBytes: os.totalmem(), platform: process.platform, node: process.version },
    source,
    limitations: 'One Node process runs both server and 100 scripted ws clients on loopback. All clients parse and decode every full/delta frame and actively chase/attack opponents. Equivalent full bandwidth extrapolates client zero state to100 clients. No browser rendering, WAN latency/loss, authenticated people, minimum-hardware or production bandwidth certification.'
  };
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'pass') process.exitCode = 1;
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => {
  stopping = true; clearInterval(inputTimer); clearInterval(progressTimer);
  for (const c of clients) c.ws.close();
  await app.close();
});
