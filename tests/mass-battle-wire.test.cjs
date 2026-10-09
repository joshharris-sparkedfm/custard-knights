'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Battle = require('../game/mass-battle.js');
const Wire = require('../game/mass-battle-wire.js');
const copy = obj => JSON.parse(JSON.stringify(obj));

test('wire deltas reconstruct exact core snapshots across all modes, roles and periodic baselines', () => {
  for (const mode of ['brawl', 'ctf', 'siege']) {
    const state = Battle.create({ mode, teamSize: 50, seed: 612 });
    Battle.join(state, { id: 'person', name: 'Human', role: 'ranger' });
    const encoder = Wire.createEncoder(), decoder = Wire.createDecoder();
    let fulls = 0, deltas = 0, encodedBytes = 0, fullBytes = 0;
    for (let i = 0; i < 210; i++) {
      Battle.step(state, .05, { person: { moveX: 1, moveY: 0, aimX: 1, aimY: 0, attack: true, ability: i % 20 === 0 } });
      const expected = Battle.snapshot(state), message = encoder.encode(expected);
      if (message.type === 'snapshot') fulls++; else deltas++;
      encodedBytes += JSON.stringify(message).length;
      fullBytes += JSON.stringify(expected).length;
      const actual = decoder.apply(copy(message));
      assert.equal(JSON.stringify(actual), JSON.stringify(expected), `${mode} frame ${i} lossless reconstruction`);
      // A caller modifying its rendered state cannot corrupt the decoder baseline.
      actual.players[0].hp = -999;
    }
    assert.equal(fulls, 2);
    assert.equal(deltas, 208);
    assert.ok(encodedBytes < fullBytes * .55, `${mode} steady-state wire saves at least 45%`);
  }
});

test('new joins/reconnects use canonical full baseline then ordered roster deltas', () => {
  const state = Battle.create({ teamSize: 4 }), encoder = Wire.createEncoder(), original = Wire.createDecoder();
  original.apply(encoder.encode(Battle.snapshot(state)));
  Battle.join(state, { id: 'new', role: 'support' });
  const newClient = Wire.createDecoder();
  assert.equal(newClient.apply(encoder.full()).players.some(p => p.humanId === 'new'), false);
  const joined = encoder.encode(Battle.snapshot(state));
  assert.deepEqual(newClient.apply(joined), original.apply(joined));
  Battle.leave(state, 'new');
  const disconnected = encoder.encode(Battle.snapshot(state));
  assert.deepEqual(newClient.apply(disconnected), copy(Battle.snapshot(state)));
  newClient.reset();
  assert.equal(newClient.apply(disconnected), null);
  assert.deepEqual(newClient.apply(encoder.full()), copy(Battle.snapshot(state)));
});

test('missing, duplicate and malformed deltas preserve baseline until explicit full recovery', () => {
  const state = Battle.create({ teamSize: 4 }), encoder = Wire.createEncoder(), decoder = Wire.createDecoder();
  const first = encoder.encode(Battle.snapshot(state));
  decoder.apply(first);
  Battle.step(state, .05, {}); const missed = encoder.encode(Battle.snapshot(state));
  Battle.step(state, .05, {}); const afterGap = encoder.encode(Battle.snapshot(state));
  assert.equal(decoder.apply(afterGap), null);
  assert.deepEqual(decoder.apply(encoder.full()), copy(Battle.snapshot(state)));
  assert.equal(decoder.apply(afterGap), null);
  assert.equal(decoder.apply(missed), null);
  Battle.step(state, .05, {}); const next = encoder.encode(Battle.snapshot(state));
  for (const bad of [
    { ...next, wire: 2 }, { ...next, base: -1 }, { ...next, seq: Infinity },
    { ...next, patch: { p: [[-1, 0, 'bad']], t: [] } },
    { ...next, patch: { p: [[0, '__proto__', {}]], t: [] } },
    { ...next, patch: { p: [[0, 6, Infinity]], t: [] } },
    { ...next, patch: { p: [[0, 6, 1, 6, 2]], t: [] } },
    { ...next, patch: { p: Array.from({ length: 101 }, () => [0, 6, 2]), t: [] } },
    { ...next, patch: { p: [], t: [[15, Array(161).fill([])]] } },
    { ...next, patch: { p: [], t: [[12, []]] } },
  ]) assert.equal(decoder.apply(bad), null);
  assert.deepEqual(decoder.apply(next), copy(Battle.snapshot(state)), 'bad messages did not damage baseline');
  assert.equal({}.polluted, undefined);
});

test('unsupported/full malformed state fails closed, legacy full snapshots remain readable', () => {
  const state = Battle.snapshot(Battle.create({ teamSize: 4 })), decoder = Wire.createDecoder();
  assert.deepEqual(decoder.apply({ type: 'snapshot', state }), copy(state));
  assert.equal(decoder.apply({ type: 'snapshot', wire: 2, seq: 1, state }), null);
  assert.equal(decoder.apply({ type: 'snapshot', state: { ...state, version: 99 } }), null);
  assert.equal(decoder.apply({ type: 'snapshot', state: { ...state, players: [] } }), null);
  assert.equal(decoder.apply({ type: 'snapshot', state: { ...state, projectiles: Array(161).fill({}) } }), null);
  assert.equal(decoder.apply({ type: 'snapshot', state: { ...state, world: { width: 1e20, height: 10, obstacles: [] } } }), null);
});
