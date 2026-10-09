/* Versioned, ordered delta snapshots. Combat always uses the unmodified server state. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CKMassBattleWire = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const PLAYER = ['id', 'humanId', 'name', 'bot', 'team', 'role', 'x', 'y', 'vx', 'vy', 'angle', 'hp', 'maxHp', 'alive', 'respawn', 'stamina', 'stun', 'protection', 'guarding', 'dashing', 'abilityCooldown', 'dashCooldown', 'kills', 'deaths', 'score', 'attack', 'visor'];
  const TOP = ['version', 'mode', 'teamSize', 'duration', 'time', 'elapsed', 'status', 'winner', 'finishReason', 'scores', 'scoreLimit', 'world', 'control', 'flags', 'castles', 'projectiles', 'effects', 'difficulty'];
  const ATTACK = ['kind', 'phase', 'phaseProgress', 'progress', 'angle', 'elapsed', 'windup', 'active', 'recovery'];
  const PACKED = {
    control: ['x', 'y', 'radius', 'progress', 'owner', 'tick'],
    scores: ['custardia', 'rice'],
    flags: ['team', 'x', 'y', 'homeX', 'homeY', 'carrier', 'dropped', 'returnTimer'],
    castles: ['team', 'x', 'y', 'radius', 'hp', 'maxHp'],
    projectiles: ['id', 'team', 'x', 'y', 'angle', 'kind', 'radius'],
    effects: ['id', 'kind', 'x', 'y', 'radius', 'team', 'life'],
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  // Validated wire states contain only bounded JSON records, arrays and scalars.
  // Copy without an intermediate JSON string; never expose the decoder baseline.
  function copyRecord(value) {
    const result = {};
    for (const key of Object.keys(value)) {
      const field = value[key];
      if (field !== undefined) result[key] = field === 0 ? 0 : field;
    }
    return result;
  }
  function copyValidated(state) {
    const result = copyRecord(state);
    result.players = state.players.map(player => {
      const copy = copyRecord(player);
      copy.attack = player.attack === null ? null : copyRecord(player.attack);
      return copy;
    });
    result.world = copyRecord(state.world);
    result.world.obstacles = [];
    result.scores = copyRecord(state.scores);
    result.control = copyRecord(state.control);
    for (const key of ['flags', 'castles', 'projectiles', 'effects']) result[key] = state[key].map(copyRecord);
    return result;
  }
  const number = n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1e10;
  const team = value => value === 'custardia' || value === 'rice';
  const string = (value, max) => typeof value === 'string' && value.length <= max;
  const plain = value => value && typeof value === 'object' && !Array.isArray(value);
  const same = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
  const fields = (value, keys) => Object.keys(value).every(k => keys.includes(k));
  function finiteFields(obj, keys) { return keys.every(key => number(obj[key])); }
  function validate(state) {
    if (!plain(state) || !fields(state, TOP.concat('players')) || state.version !== 1 || !['brawl', 'ctf', 'siege'].includes(state.mode) || ![4, 20, 50].includes(state.teamSize)) return false;
    if (state.difficulty !== undefined && !['easy', 'medium', 'hard', 'steve'].includes(state.difficulty)) return false;
    if (!finiteFields(state, ['duration', 'time', 'elapsed', 'scoreLimit']) || !['playing', 'finished'].includes(state.status) || !(state.winner === null || state.winner === 'draw' || team(state.winner))) return false;
    if (!(state.finishReason === null || string(state.finishReason, 32)) || !plain(state.scores) || !fields(state.scores, PACKED.scores) || !finiteFields(state.scores, PACKED.scores)) return false;
    if (!plain(state.world) || !fields(state.world, ['width', 'height', 'obstacles']) || !finiteFields(state.world, ['width', 'height']) || state.world.width < 1 || state.world.height < 1 || state.world.width > 10000 || state.world.height > 10000 || !Array.isArray(state.world.obstacles) || state.world.obstacles.length !== 0) return false;
    if (!plain(state.control) || !fields(state.control, PACKED.control) || !finiteFields(state.control, ['x', 'y', 'radius', 'progress', 'tick']) || !(state.control.owner === null || team(state.control.owner))) return false;
    if (!Array.isArray(state.players) || state.players.length !== state.teamSize * 2) return false;
    const ids = new Set();
    for (const p of state.players) {
      if (!plain(p) || !fields(p, PLAYER) || !string(p.id, 80) || !p.id || ids.has(p.id) || !(p.humanId === null || string(p.humanId, 80)) || !string(p.name, 24) || !team(p.team) || !['vanguard', 'ranger', 'engineer', 'support'].includes(p.role)) return false;
      ids.add(p.id);
      if (p.visor !== undefined && p.visor !== 'closed' && p.visor !== 'open') return false;
      if (!['bot', 'alive', 'guarding', 'dashing'].every(k => typeof p[k] === 'boolean') || !finiteFields(p, ['x', 'y', 'vx', 'vy', 'angle', 'hp', 'maxHp', 'respawn', 'stamina', 'stun', 'protection', 'abilityCooldown', 'dashCooldown', 'kills', 'deaths', 'score'])) return false;
      if (p.attack !== null) {
        const a = p.attack;
        if (!plain(a) || !fields(a, ATTACK) || !['light', 'heavy', 'arrow'].includes(a.kind) || !['windup', 'active', 'recovery'].includes(a.phase) || !ATTACK.slice(2).every(k => a[k] === undefined || number(a[k]))) return false;
      }
    }
    for (const [key, limit] of [['flags', 2], ['castles', 2], ['projectiles', 160], ['effects', 96]]) {
      if (!Array.isArray(state[key]) || state[key].length > limit) return false;
      for (const value of state[key]) {
        if (!plain(value) || !fields(value, PACKED[key])) return false;
        for (const field of PACKED[key]) {
          if (field === 'team') { if (!(team(value[field]) || key === 'effects' && value[field] === null)) return false; }
          else if (field === 'carrier') { if (!(value[field] === null || string(value[field], 80))) return false; }
          else if (field === 'dropped') { if (typeof value[field] !== 'boolean') return false; }
          else if (field === 'kind') { if (!string(value[field], 24)) return false; }
          else if (!number(value[field])) return false;
        }
      }
    }
    return true;
  }
  function packObject(object, keys) { return keys.map(k => object[k] === undefined ? null : object[k]); }
  function unpackObject(values, keys, optional) {
    if (!Array.isArray(values) || values.length !== keys.length) throw Error('Invalid packed object');
    const object = {};
    keys.forEach((key, i) => { if (!(optional && values[i] === null)) object[key] = values[i]; });
    return object;
  }
  function packTop(key, value) {
    if (!PACKED[key]) return value;
    if (key === 'control' || key === 'scores') return packObject(value, PACKED[key]);
    return value.map(v => packObject(v, PACKED[key]));
  }
  function unpackTop(key, value) {
    if (!PACKED[key]) return value;
    if (key === 'control' || key === 'scores') return unpackObject(value, PACKED[key]);
    const max = key === 'projectiles' ? 160 : key === 'effects' ? 96 : 2;
    if (!Array.isArray(value) || value.length > max) throw Error('Invalid packed list');
    return value.map(v => unpackObject(v, PACKED[key]));
  }
  function packPlayer(key, value) { return key === 'attack' && value ? packObject(value, ATTACK) : value; }
  function unpackPlayer(key, value) { return key === 'attack' && value ? unpackObject(value, ATTACK, true) : value; }
  function createEncoder() {
    let previous = null, seq = 0;
    function full() { return previous ? { type: 'snapshot', wire: 1, seq, state: clone(previous) } : null; }
    return {
      full,
      encode(snapshot) {
        if (!validate(snapshot)) throw Error('Invalid battle snapshot');
        const next = clone(snapshot), base = seq++;
        if (!previous || seq % 200 === 0 || next.players.some((p, i) => previous.players[i]?.id !== p.id) || next.players.length !== previous.players.length) { previous = next; return full(); }
        const patch = { p: [], t: [] };
        for (let i = 0; i < next.players.length; i++) {
          const row = [i];
          PLAYER.forEach((key, index) => { if (!same(previous.players[i][key], next.players[i][key])) row.push(index, packPlayer(key, next.players[i][key])); });
          if (row.length > 1) patch.p.push(row);
        }
        TOP.forEach((key, index) => { if (!same(previous[key], next[key])) patch.t.push([index, packTop(key, next[key])]); });
        previous = next;
        return { type: 'delta', wire: 1, seq, base, patch };
      },
    };
  }
  function createDecoder() {
    let previous = null, seq = null;
    return {
      reset() { previous = null; seq = null; },
      apply(message) {
        try {
          if (!plain(message)) return null;
          if (message.type === 'snapshot') {
            if (message.wire !== undefined && (message.wire !== 1 || !Number.isSafeInteger(message.seq) || message.seq < 1)) return null;
            if (!validate(message.state)) return null;
            previous = copyValidated(message.state); seq = message.wire === 1 ? message.seq : null;
            return copyValidated(previous);
          }
          if (message.type !== 'delta' || message.wire !== 1 || !previous || seq === null || message.base !== seq || message.seq !== seq + 1 || !Number.isSafeInteger(message.seq)) return null;
          const patch = message.patch;
          if (!plain(patch) || !fields(patch, ['p', 't']) || !Array.isArray(patch.p) || patch.p.length > 100 || !Array.isArray(patch.t) || patch.t.length > TOP.length) return null;
          const next = { ...previous, players: previous.players.slice() }, seenPlayers = new Set(), seenTop = new Set();
          for (const row of patch.p) {
            if (!Array.isArray(row) || row.length < 3 || row.length > 1 + PLAYER.length * 2 || row.length % 2 !== 1 || !Number.isInteger(row[0]) || row[0] < 0 || row[0] >= next.players.length || seenPlayers.has(row[0])) return null;
            seenPlayers.add(row[0]); next.players[row[0]] = { ...previous.players[row[0]] }; const seenFields = new Set();
            for (let i = 1; i < row.length; i += 2) {
              const field = row[i];
              if (!Number.isInteger(field) || field < 0 || field >= PLAYER.length || seenFields.has(field)) return null;
              seenFields.add(field); next.players[row[0]][PLAYER[field]] = unpackPlayer(PLAYER[field], row[i + 1]);
            }
          }
          for (const row of patch.t) {
            if (!Array.isArray(row) || row.length !== 2 || !Number.isInteger(row[0]) || row[0] < 0 || row[0] >= TOP.length || seenTop.has(row[0])) return null;
            seenTop.add(row[0]); const value = unpackTop(TOP[row[0]], row[1]); next[TOP[row[0]]] = value && typeof value === 'object' ? clone(value) : value;
          }
          if (!validate(next)) return null;
          previous = next; seq = message.seq; return copyValidated(previous);
        } catch { return null; }
      },
    };
  }
  return Object.freeze({ version: 1, createEncoder, createDecoder, validate });
});
