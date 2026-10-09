'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const { createPlayerStore } = require('../server/player-store.cjs');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ck-player-store-'));
  const filename = path.join(dir, 'players.sqlite');
  let store = createPlayerStore({ filename });
  t.after(() => { store.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  const accounts = Array.from({ length: 8 }, (_, i) => store.issue(`Knight ${i}`));
  const participants = accounts.map((a, i) => ({ accountId: a.accountId, team: i < 4 ? 'custardia' : 'rice' }));
  return { filename, accounts, participants, get store() { return store; }, reopen() { store.close(); store = createPlayerStore({ filename }); } };
}
function result(f, extra = {}) {
  return { id: 'match-1', queueKey: 'brawl-4', mode: 'brawl', teamSize: 4, winner: 'custardia', participants: f.participants, eligible: true, ...extra };
}

test('host-issued credentials persist, contain 256 bits, are hashed and can be revoked', t => {
  const f = fixture(t), user = f.accounts[0];
  assert.match(user.token, /^[a-f0-9]{64}$/);
  assert.equal(new Set(f.accounts.map(a => a.token)).size, 8);
  assert.deepEqual(f.store.authenticate(user.token), { id: user.accountId, name: user.name });
  for (const token of [null, {}, '', 'a'.repeat(63), 'g'.repeat(64), 'a'.repeat(64)]) assert.equal(f.store.authenticate(token), null);
  const inspect = new DatabaseSync(f.filename);
  const row = inspect.prepare('SELECT * FROM accounts WHERE id = ?').get(user.accountId);
  assert.equal(row.token_hash, crypto.createHash('sha256').update(user.token).digest('hex'));
  assert.equal(JSON.stringify(row).includes(user.token), false);
  inspect.close();
  f.reopen();
  assert.equal(f.store.authenticate(user.token).id, user.accountId);
  assert.equal(f.store.revoke(user.accountId), true);
  assert.equal(f.store.revoke(user.accountId), false);
  f.reopen();
  assert.equal(f.store.authenticate(user.token), null);
  assert.throws(() => f.store.recordMatch(result(f)), /Revoked/);
});

test('equal teams receive symmetric Elo updates and queue-specific durable statistics', t => {
  const f = fixture(t), id = f.accounts[0].accountId;
  assert.deepEqual(f.store.profile(id, 'brawl-4'), { id, name: 'Knight 0', rating: 1000, matches: 0, wins: 0, losses: 0, draws: 0, provisional: true });
  const recorded = f.store.recordMatch(result(f));
  assert.equal(recorded.recorded, true);
  assert.equal(recorded.eligible, true);
  assert.equal(recorded.changes.length, 8);
  assert.equal(recorded.changes.reduce((n, c) => n + c.delta, 0), 0);
  for (const [i, user] of f.accounts.entries()) {
    const p = f.store.profile(user.accountId, 'brawl-4');
    assert.equal(p.rating, i < 4 ? 1016 : 984);
    assert.equal(p.wins, i < 4 ? 1 : 0);
    assert.equal(p.losses, i < 4 ? 0 : 1);
    assert.equal(p.matches, 1);
  }
  f.reopen();
  assert.equal(f.store.profile(id, 'brawl-4').rating, 1016);
  assert.equal(f.store.profile(id, 'ctf-4').rating, 1000);
  assert.equal(f.store.profile(id, 'brawl-20').matches, 0);
  assert.deepEqual(f.store.leaderboard('ctf-4'), []);
  assert.equal(f.store.leaderboard('brawl-4', 3).length, 3);
  f.store.revoke(id);
  assert.equal(f.store.leaderboard('brawl-4').length, 7);
});

test('draws count, equal draws do not change ratings, provisional ends after ten', t => {
  const f = fixture(t);
  for (let i = 0; i < 10; i++) f.store.recordMatch(result(f, { id: `draw-${i}`, winner: i % 2 ? null : 'draw' }));
  const p = f.store.profile(f.accounts[0].accountId, 'brawl-4');
  assert.equal(p.rating, 1000);
  assert.equal(p.draws, 10);
  assert.equal(p.matches, 10);
  assert.equal(p.provisional, false);
});

test('identical retries are idempotent across reopen and conflicting results fail', t => {
  const f = fixture(t);
  f.store.recordMatch(result(f));
  f.reopen();
  assert.deepEqual(f.store.recordMatch(result(f, { participants: [...f.participants].reverse() })), { recorded: false, eligible: true, reason: null, changes: [] });
  assert.throws(() => f.store.recordMatch(result(f, { winner: 'rice' })), /conflicting/);
  assert.equal(f.store.profile(f.accounts[0].accountId, 'brawl-4').matches, 1);
  assert.throws(() => f.store.recordMatch(result(f, { eligible: false, reason: 'bots' })), /conflicting/);
});

test('bot and abandoned results persist without ladder awards', t => {
  const f = fixture(t);
  const input = result(f, { eligible: false, reason: 'bots present', participants: f.participants.slice(0, 1) });
  assert.deepEqual(f.store.recordMatch(input), { recorded: true, eligible: false, reason: 'bots present', changes: [] });
  f.reopen();
  assert.equal(f.store.recordMatch(input).recorded, false);
  assert.equal(f.store.profile(f.accounts[0].accountId, 'brawl-4').matches, 0);
  assert.deepEqual(f.store.leaderboard('brawl-4'), []);
  assert.equal(f.store.recordMatch(result(f, { id: 'empty', eligible: false, reason: 'no humans', participants: [] })).recorded, true);
  const inspect = new DatabaseSync(f.filename);
  assert.equal(inspect.prepare('SELECT COUNT(*) AS n FROM matches').get().n, 2);
  assert.equal(inspect.prepare('SELECT COUNT(*) AS n FROM match_players').get().n, 1);
  inspect.close();
});

test('malformed or forged identities, settings and rosters fail before changing ratings', t => {
  const f = fixture(t);
  const invalid = [
    { id: '' }, { id: 'bad/id' }, { queueKey: 'brawl-20' }, { mode: 'fake' }, { teamSize: 5 },
    { winner: 'fake' }, { winner: undefined }, { eligible: 1 }, { eligible: false },
    { participants: null }, { participants: f.participants.slice(1) },
    { participants: f.participants.map(p => ({ ...p, team: 'rice' })) },
    { participants: [f.participants[0], ...f.participants.slice(0, 7)] },
    { participants: [{ accountId: 'forged', team: 'custardia' }, ...f.participants.slice(1)] },
    { participants: [{ ...f.participants[0], team: '__proto__' }, ...f.participants.slice(1)] }
  ];
  for (const change of invalid) assert.throws(() => f.store.recordMatch(result(f, change)));
  assert.equal(f.store.profile(f.accounts[0].accountId, 'brawl-4').matches, 0);
  assert.throws(() => f.store.issue('<script>'));
  assert.throws(() => f.store.profile('missing', 'brawl-4'));
  assert.throws(() => f.store.leaderboard('brawl:4'));
  assert.throws(() => f.store.leaderboard('brawl-4', Infinity));
  // Caller-supplied rating fields are ignored: only the authoritative outcome is consumed.
  const recorded = f.store.recordMatch(result(f, { rating: 2500, delta: 1000 }));
  assert.equal(recorded.changes.find(c => c.accountId === f.accounts[0].accountId).after, 1016);
});

test('a mid-write SQLite failure rolls back both history and every rating', t => {
  const f = fixture(t);
  const inspect = new DatabaseSync(f.filename);
  // Fail after the first roster insert to exercise a partially executed transaction.
  inspect.exec(`CREATE TRIGGER injected_failure BEFORE INSERT ON match_players
    WHEN (SELECT COUNT(*) FROM match_players) >= 1 BEGIN SELECT RAISE(ABORT, 'injected write failure'); END;`);
  assert.throws(() => f.store.recordMatch(result(f)), /injected write failure/);
  for (const table of ['matches', 'match_players', 'ratings']) assert.equal(inspect.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n, 0);
  inspect.exec('DROP TRIGGER injected_failure');
  inspect.close();
  assert.equal(f.store.recordMatch(result(f)).recorded, true);
});

test('larger complete teams are supported and repeated wins remain bounded', t => {
  const f = fixture(t);
  for (const teamSize of [20, 50]) {
    const participants = Array.from({ length: teamSize * 2 }, (_, i) => ({ accountId: f.store.issue(`Large ${i}`).accountId, team: i < teamSize ? 'custardia' : 'rice' }));
    const r = f.store.recordMatch(result(f, { id: `large-${teamSize}`, queueKey: `siege-${teamSize}`, mode: 'siege', teamSize, participants }));
    assert.equal(r.changes.length, teamSize * 2);
  }
  for (let i = 0; i < 200; i++) f.store.recordMatch(result(f, { id: `bounded-${i}` }));
  for (const user of f.accounts) {
    const rating = f.store.profile(user.accountId, 'brawl-4').rating;
    assert.ok(rating >= 500 && rating <= 2500);
  }
});

test('operator CLI requires explicit database, issues once, profiles and revokes', t => {
  const f = fixture(t);
  const cli = path.join(__dirname, '..', 'scripts', 'player-admin.cjs');
  function run(args) { return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); }
  assert.equal(run(['issue', 'Alice']).status, 1);
  const issued = run(['--db', f.filename, 'issue', 'Alice']);
  assert.equal(issued.status, 0, issued.stderr);
  const user = JSON.parse(issued.stdout);
  const profile = run(['--db', f.filename, 'profile', user.accountId, 'brawl-4']);
  assert.equal(profile.status, 0, profile.stderr);
  assert.equal(JSON.parse(profile.stdout).rating, 1000);
  assert.equal(profile.stdout.includes(user.token), false);
  assert.equal(JSON.parse(run(['--db', f.filename, 'revoke', user.accountId]).stdout).revoked, true);
  assert.equal(f.store.authenticate(user.token), null);
});
