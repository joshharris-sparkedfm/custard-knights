'use strict';
// Fixed packets, immutable inputs, alternating implementation order; excludes core/encoding time.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const vm = require('node:vm'), inspector = require('node:inspector');
const assert = require('node:assert/strict'), { performance } = require('node:perf_hooks');
const Battle = require('../game/mass-battle.js');
const currentPath = path.resolve(__dirname, '../game/mass-battle-wire.js');
const baselinePath = path.resolve(process.argv[2] || currentPath);
const output = path.resolve(process.argv[3] || 'qa/results/wire-profile');
fs.mkdirSync(output, { recursive: true });
function load(file) {
  const module = { exports: {} }; const context = vm.createContext({ module });
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return module.exports;
}
const before = load(baselinePath), after = load(currentPath);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const freeze = value => { if (value && typeof value === 'object') { Object.freeze(value); for (const v of Object.values(value)) freeze(v); } return value; };
const batches = [];
for (const mode of ['brawl', 'ctf', 'siege']) {
  const state = Battle.create({ mode, teamSize: 50, seed: 612 });
  const encoder = before.createEncoder(), packets = [], expected = [];
  Battle.join(state, { id: 'person', name: 'Human', role: 'ranger' });
  for (let i = 0; i < 210; i++) {
    Battle.step(state, .05, { person: { moveX: 1, moveY: 0, aimX: 1, aimY: 0, attack: true, ability: i % 20 === 0 } });
    const snapshot = Battle.snapshot(state);
    packets.push(freeze(JSON.parse(JSON.stringify(encoder.encode(snapshot)))));
    expected.push(JSON.stringify(snapshot));
  }
  batches.push({ mode, packets, expected });
}
function run(api, verify = false) {
  let sum = 0;
  for (const batch of batches) {
    const decoder = api.createDecoder();
    for (let i = 0; i < batch.packets.length; i++) {
      const result = decoder.apply(batch.packets[i]);
      if (!result) throw Error(`Decode failed ${batch.mode}:${i}`);
      if (verify) {
        const got = JSON.stringify(result);
        if (got !== batch.expected[i]) {
          fs.writeFileSync(path.join(output, 'mismatch.json'), JSON.stringify({ mode: batch.mode, frame: i, actual: JSON.parse(got), expected: JSON.parse(batch.expected[i]) }, null, 2));
          throw Error(`Lossless comparison failed ${batch.mode}:${i}; see mismatch.json`);
        }
      }
      sum += result.players[0].x;
    }
  }
  return sum;
}
const session = new inspector.Session(); session.connect();
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));
(async () => {
  run(before, true); run(after, true);
  for (let i = 0; i < 3; i++) { run(before); run(after); }
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 100 }); await post('Profiler.start');
  for (let i = 0; i < 6; i++) run(before);
  const { profile } = await post('Profiler.stop'); session.disconnect();
  const nodes = new Map(profile.nodes.map(n => [n.id, n])), costs = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    const frame = nodes.get(profile.samples[i]).callFrame;
    const key = `${frame.functionName || '(anonymous)'} ${frame.url}:${frame.lineNumber + 1}`;
    costs.set(key, (costs.get(key) || 0) + profile.timeDeltas[i]);
  }
  const measurements = [];
  for (let round = 0; round < 8; round++) {
    for (const variant of round % 2 ? ['after', 'before'] : ['before', 'after']) {
      const start = performance.now(); run(variant === 'before' ? before : after);
      measurements.push({ round, variant, milliseconds: performance.now() - start });
    }
  }
  const summarize = variant => {
    const samples = measurements.filter(m => m.variant === variant).map(m => m.milliseconds).sort((a, b) => a - b);
    const medianMs = (samples[3] + samples[4]) / 2;
    return { medianMs, medianPerPacketMs: medianMs / 630, minMs: samples[0], maxMs: samples.at(-1) };
  };
  const result = { node: process.version, platform: process.platform, seed: 612, teamSize: 50, modes: batches.map(b => b.mode), packets: 630,
    baselineSha256: hash(fs.readFileSync(baselinePath)), currentSha256: hash(fs.readFileSync(currentPath)),
    packetsSha256: hash(JSON.stringify(batches.map(b => b.packets))), exactSnapshotsCompared: 1260,
    profileTopSelfMicroseconds: [...costs].sort((a, b) => b[1] - a[1]).slice(0, 20), measurements,
    before: summarize('before'), after: summarize('after'),
    limitation: 'Decode-only fixed immutable packets, excluding network parsing, encoding, simulation, render and input scheduling. Single-host microbenchmark, not WAN or hosted load acceptance.' };
  fs.writeFileSync(path.join(output, 'profile.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
