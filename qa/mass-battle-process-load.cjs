'use strict';
// Isolated event loops, shared hardware: node qa/mass-battle-process-load.cjs 60 output.json 4
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { fork } = require('node:child_process');
const { performance, monitorEventLoopDelay } = require('node:perf_hooks');
const percentile = (values, q) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] || 0; };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const publish = message => process.send(message);
function measurement() {
  const delay = monitorEventLoopDelay({ resolution: 10 }); delay.enable();
  const started = performance.now(), cpu = process.cpuUsage();
  return () => {
    const seconds = (performance.now() - started) / 1000, used = process.cpuUsage(cpu); delay.disable();
    return { seconds, cpuSeconds: (used.user + used.system) / 1e6, cpuPercentOfOneCore: (used.user + used.system) / (seconds * 10000), eventLoopP95Ms: delay.percentile(95) / 1e6, eventLoopMaxMs: delay.max / 1e6, rssBytes: process.memoryUsage().rss };
  };
}
async function serverChild() {
  const { createBattleServer } = require('../server/mass-battle-server.cjs');
  const app = createBattleServer({ port: 0, host: '127.0.0.1' });
  const address = await app.listen(); let finish, initialElapsed;
  process.on('message', async message => {
    if (message.type === 'start') {
      initialElapsed = app.rooms.get('load').state.elapsed;
      Object.assign(app.metrics, { steps: 0, maxStepMs: 0, totalStepMs: 0, tickSamplesMs: [], maxTickGapMs: 0, maxSnapshotBytes: 0, snapshots: 0, rejectedInputs: 0, rateLimited: 0 });
      finish = measurement(); publish({ type: 'started' });
    }
    if (message.type === 'result') {
      const state = app.rooms.get('load').state, measured = finish();
      publish({ type: 'result', ...measured, simulationSeconds: state.elapsed - initialElapsed, humans: state.players.filter(p => !p.bot).length,
        matchStatus: state.status, scores: state.scores, kills: state.players.reduce((sum, p) => sum + p.kills, 0),
        tickP95Ms: percentile(app.metrics.tickSamplesMs, .95), tickP99Ms: percentile(app.metrics.tickSamplesMs, .99),
        metrics: { ...app.metrics, tickSamplesMs: undefined } });
    }
    if (message.type === 'stop') { await app.close(); process.disconnect(); }
  });
  publish({ type: 'ready', url: `ws://127.0.0.1:${address.port}/battle` });
}
async function clientChild() {
  const WebSocket = require('ws'), Wire = require('../game/mass-battle-wire.js');
  const clients = [], errors = [], unexpectedCloses = [];
  let measuring = false, stopping = false, inputTimer, previousInput, started, finish;
  let bytes = 0, packets = 0, sent = 0, fullPackets = 0, deltaPackets = 0, deltaBytes = 0, maxDeltaBytes = 0, maxGap = 0;
  const inputGaps = [];
  process.on('message', async message => {
    if (message.type === 'join') {
      try {
        await Promise.all(Array.from({ length: message.count }, (_, i) => new Promise((resolve, reject) => {
          const number = message.offset + i;
          const c = { ws: new WebSocket(message.url), number, seq: 0, state: null, id: null, lastPacket: 0, packets: 0, sent: 0, decoder: Wire.createDecoder() }; clients.push(c);
          const timeout = setTimeout(() => reject(Error(`Join timed out: ${number}`)), 15000);
          c.ws.on('open', () => c.ws.send(JSON.stringify({ type: 'join', room: 'load', mode: 'brawl', teamSize: 50, wire: 1, visor: number % 2 ? 'open' : 'closed', name: `Load ${number}`, role: ['vanguard', 'ranger', 'engineer', 'support'][number % 4] })));
          c.ws.on('message', data => {
            try {
              const msg = JSON.parse(data);
              if (msg.type === 'welcome') { c.id = msg.sessionId; clearTimeout(timeout); resolve(); }
              if (msg.type === 'error') { errors.push(msg); clearTimeout(timeout); reject(Error(msg.message)); }
              if (msg.type === 'snapshot' || msg.type === 'delta') {
                const state = c.decoder.apply(msg);
                if (!state) { errors.push({ type: 'decode', client: number, seq: msg.seq }); return; }
                c.state = state;
                if (!measuring) return;
                const now = performance.now(), size = data.length;
                if (c.lastPacket) maxGap = Math.max(maxGap, now - c.lastPacket);
                c.lastPacket = now; c.packets++; packets++; bytes += size;
                if (msg.type === 'delta') { deltaPackets++; deltaBytes += size; maxDeltaBytes = Math.max(maxDeltaBytes, size); } else fullPackets++;
              }
            } catch (error) { errors.push({ type: 'decode-exception', client: number, message: error.message }); }
          });
          c.ws.on('error', error => { errors.push({ type: 'socket', client: number, message: error.message }); clearTimeout(timeout); reject(error); });
          c.ws.on('close', (code, reason) => { clearTimeout(timeout); if (!stopping) unexpectedCloses.push({ client: number, code, reason: reason.toString() }); });
        })));
        publish({ type: 'ready', clients: clients.length });
      } catch (error) { publish({ type: 'fatal', message: error.stack }); }
    }
    if (message.type === 'start') {
      started = previousInput = performance.now(); finish = measurement(); measuring = true;
      inputTimer = setInterval(() => {
        const now = performance.now(), elapsed = (now - started) / 1000; inputGaps.push(now - previousInput); previousInput = now;
        for (const c of clients) {
          if (c.ws.readyState !== WebSocket.OPEN || !c.state) continue;
          const me = c.state.players.find(p => p.humanId === c.id); if (!me) continue;
          let target, nearest = Infinity;
          for (const p of c.state.players) if (p.alive && p.team !== me.team) { const d = (p.x - me.x) ** 2 + (p.y - me.y) ** 2; if (d < nearest) { nearest = d; target = p; } }
          target ||= { x: 1600, y: 900 };
          const dx = target.x - me.x, dy = target.y - me.y, length = Math.hypot(dx, dy) || 1;
          const moving = length > (me.role === 'ranger' ? 300 : 70) ? 1 : 0;
          const guard = length < 140 && (Math.floor(elapsed * 2) + c.number) % 9 === 0;
          c.ws.send(JSON.stringify({ type: 'input', seq: ++c.seq, moveX: dx / length * moving, moveY: dy / length * moving, aimX: dx / length, aimY: dy / length,
            attack: length < (me.role === 'ranger' ? 500 : 115) && !guard, heavy: me.role !== 'ranger' && length < 125 && (Math.floor(elapsed) + c.number) % 4 === 0,
            guard, dash: length > 150 && (Math.floor(elapsed * 3) + c.number) % 21 === 0, ability: !guard && length < 220 }));
          c.sent++; sent++;
        }
      }, 50);
      setTimeout(() => {
        clearInterval(inputTimer); measuring = false; const measured = finish();
        publish({ type: 'result', ...measured, clients: clients.length, inputs: sent, packets, bytes, fullPackets, deltaPackets, meanDeltaBytes: deltaBytes / Math.max(1, deltaPackets), maxDeltaBytes, maxSnapshotGapMs: maxGap,
          inputIntervalP95Ms: percentile(inputGaps, .95), minClientSnapshotHz: Math.min(...clients.map(c => c.packets / measured.seconds)), maxClientSnapshotHz: Math.max(...clients.map(c => c.packets / measured.seconds)),
          minClientInputHz: Math.min(...clients.map(c => c.sent / measured.seconds)), errors, unexpectedCloses });
      }, message.duration * 1000);
    }
    if (message.type === 'stop') { stopping = true; clearInterval(inputTimer); for (const c of clients) c.ws.terminate(); process.disconnect(); }
  });
}
async function supervisor() {
  const duration = Math.min(120, Math.max(1, Number(process.argv[2]) || 60));
  const output = path.resolve(process.argv[3] || 'qa/results/process-load.json');
  const workers = Number(process.argv[4]) || 4;
  if (![1, 2, 4, 5, 10].includes(workers)) throw Error('Client process count must divide 100: 1, 2, 4, 5 or 10');
  const children = [], exits = []; let stopping = false, deadline;
  let rejectFailure; const failure = new Promise((_, reject) => { rejectFailure = reject; }); failure.catch(() => {});
  const startChild = role => {
    const child = fork(__filename, [role], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'], windowsHide: true });
    const queue = [], waiting = new Map();
    child.on('message', msg => {
      if (msg.type === 'fatal') { rejectFailure(Error(msg.message)); return; }
      const resolve = waiting.get(msg.type); if (resolve) { waiting.delete(msg.type); resolve(msg); } else queue.push(msg);
    });
    child.on('error', rejectFailure);
    child.on('exit', (code, signal) => { exits.push({ role, pid: child.pid, code, signal }); if (!stopping) rejectFailure(Error(`${role} ${child.pid} exited: ${code} / ${signal}`)); });
    const wait = type => {
      const index = queue.findIndex(msg => msg.type === type);
      return index >= 0 ? Promise.resolve(queue.splice(index, 1)[0]) : Promise.race([new Promise(resolve => waiting.set(type, resolve)), failure]);
    };
    const handle = { child, wait }; children.push(handle); return handle;
  };
  const source = Object.fromEntries(['game/mass-battle.js', 'game/mass-battle-wire.js', 'server/mass-battle-server.cjs', 'qa/mass-battle-process-load.cjs'].map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', file))).digest('hex')]));
  const result = { status: 'fail', date: new Date().toISOString(), durationTarget: duration, clients: 100, clientProcesses: workers, host: { cpu: os.cpus()[0].model, logicalCpus: os.cpus().length, platform: process.platform, node: process.version }, source,
    limitations: 'Server and client workers have independent event loops but share host CPU, memory and loopback. Each client decodes every frame and chases/attacks opponents. Measurement excludes joins; worker windows start on IPC receipt. Random room seed and join ordering differ from earlier shared-process runs, so this is contention attribution, not a controlled gameplay benchmark. Protocol status is separate from timing observations. No browser rendering, WAN, human responsiveness, ranked-service or minimum-spec acceptance.' };
  try {
    deadline = setTimeout(() => rejectFailure(Error('Load harness deadline exceeded')), (duration + 60) * 1000);
    const server = startChild('--server'), ready = await server.wait('ready');
    const clients = Array.from({ length: workers }, (_, i) => { const c = startChild('--clients'); c.child.send({ type: 'join', url: ready.url, count: 100 / workers, offset: i * 100 / workers }); return c; });
    await Promise.all(clients.map(c => c.wait('ready'))); await sleep(500);
    server.child.send({ type: 'start' }); await server.wait('started');
    for (const c of clients) c.child.send({ type: 'start', duration });
    result.workers = await Promise.all(clients.map(c => c.wait('result')));
    server.child.send({ type: 'result' }); result.server = await server.wait('result');
    result.status = result.server.humans === 100 && result.server.matchStatus !== 'finished' && !result.server.metrics.rejectedInputs && !result.server.metrics.rateLimited && result.workers.every(c => c.packets > 0 && c.inputs > 0 && !c.errors.length && !c.unexpectedCloses.length) ? 'pass' : 'fail';
    result.timing = { inputHzTarget: 20, snapshotHzTarget: 20, minClientSnapshotHz: Math.min(...result.workers.map(c => c.minClientSnapshotHz)), minClientInputHz: Math.min(...result.workers.map(c => c.minClientInputHz)), serverBroadcastHz: result.server.metrics.snapshots / result.server.seconds, simulationToWallRatio: result.server.simulationSeconds / result.server.seconds,
      aggregateReceiveMbps: result.workers.reduce((sum, c) => sum + c.bytes * 8 / c.seconds / 1e6, 0) };
    result.timing.withinFivePercent = result.timing.minClientSnapshotHz >= 19 && result.timing.minClientInputHz >= 19 && result.timing.simulationToWallRatio >= .98;
  } catch (error) { result.error = error.stack; }
  finally {
    stopping = true; clearTimeout(deadline);
    for (const { child } of children) if (child.connected) child.send({ type: 'stop' });
    await sleep(300);
    for (const { child } of children) if (child.exitCode === null && child.signalCode === null) child.kill();
    result.processExits = exits;
    fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result, null, 2)); if (result.status !== 'pass') process.exitCode = 1;
  }
}
const task = process.argv[2] === '--server' ? serverChild : process.argv[2] === '--clients' ? clientChild : supervisor;
task().catch(error => { if (process.send) publish({ type: 'fatal', message: error.stack }); else console.error(error); process.exitCode = 1; });
