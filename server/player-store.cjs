'use strict';

// Host-issued identities for the private test ladder. This is not Steam identity.
const crypto = require('node:crypto');
const MODES = new Set(['brawl', 'ctf', 'siege']);
const SIZES = new Set([4, 20, 50]);
const TEAMS = new Set(['custardia', 'rice']);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function validateQueue(key) {
  if (typeof key !== 'string' || !/^(brawl|ctf|siege)-(4|20|50)$/.test(key)) throw new Error('Invalid ladder queue');
}

function createPlayerStore({ filename } = {}) {
  if (typeof filename !== 'string' || !filename.trim()) throw new Error('A player database filename is required');
  // Keep importing the default, unranked server possible on older Node runtimes.
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(filename);
  try {
    db.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
        revoked INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ratings (
        account_id TEXT NOT NULL REFERENCES accounts(id), queue_key TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 1000 CHECK(rating BETWEEN 500 AND 2500),
        matches INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0, draws INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY(account_id, queue_key)
      );
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY, queue_key TEXT NOT NULL, mode TEXT NOT NULL,
        team_size INTEGER NOT NULL, winner TEXT, eligible INTEGER NOT NULL,
        reason TEXT, payload TEXT NOT NULL, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS match_players (
        match_id TEXT NOT NULL REFERENCES matches(id), account_id TEXT NOT NULL REFERENCES accounts(id),
        team TEXT NOT NULL, before_rating INTEGER NOT NULL, after_rating INTEGER NOT NULL,
        PRIMARY KEY(match_id, account_id)
      );
      CREATE TABLE IF NOT EXISTS pending_results (
        id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at INTEGER NOT NULL
      );
    `);
  } catch (error) { db.close(); throw error; }

  const account = db.prepare('SELECT id, name, revoked FROM accounts WHERE id = ?');
  const getRating = db.prepare('SELECT rating, matches, wins, losses, draws FROM ratings WHERE account_id = ? AND queue_key = ?');
  const getMatch = db.prepare('SELECT payload, eligible, reason FROM matches WHERE id = ?');
  const getPending = db.prepare('SELECT payload FROM pending_results WHERE id = ?');
  const deletePending = db.prepare('DELETE FROM pending_results WHERE id = ?');
  const insertMatch = db.prepare('INSERT INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertPlayer = db.prepare('INSERT INTO match_players VALUES (?, ?, ?, ?, ?)');
  const saveRating = db.prepare(`INSERT INTO ratings (account_id, queue_key, rating, matches, wins, losses, draws)
    VALUES (?, ?, ?, 1, ?, ?, ?) ON CONFLICT(account_id, queue_key) DO UPDATE SET
    rating = excluded.rating, matches = ratings.matches + 1, wins = ratings.wins + excluded.wins,
    losses = ratings.losses + excluded.losses, draws = ratings.draws + excluded.draws`);

  function profile(id, queueKey) {
    validateQueue(queueKey);
    const user = typeof id === 'string' ? account.get(id) : null;
    if (!user) throw new Error('Unknown player account');
    const stats = getRating.get(id, queueKey) || { rating: 1000, matches: 0, wins: 0, losses: 0, draws: 0 };
    return { id: user.id, name: user.name, ...stats, provisional: stats.matches < 10 };
  }

  function normalizeMatch(input) {
    if (!input || typeof input !== 'object') throw new Error('Invalid match');
    const { id, queueKey, mode, teamSize, eligible } = input;
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_:.\-]{1,128}$/.test(id)) throw new Error('Invalid match ID');
    validateQueue(queueKey);
    if (!MODES.has(mode) || !SIZES.has(teamSize) || queueKey !== `${mode}-${teamSize}`) throw new Error('Match queue does not match its settings');
    if (typeof eligible !== 'boolean') throw new Error('Match eligibility must be explicit');
    const winner = input.winner === 'draw' ? null : input.winner;
    if (winner !== null && !TEAMS.has(winner)) throw new Error('Invalid match winner');
    const reason = eligible ? null : input.reason;
    if (!eligible && (typeof reason !== 'string' || !reason.trim() || reason.length > 256)) throw new Error('Ineligible matches require a reason');
    if (!Array.isArray(input.participants) || input.participants.length > teamSize * 2) throw new Error('Invalid participant count');
    const seen = new Set(), counts = { custardia: 0, rice: 0 };
    const participants = input.participants.map(p => {
      if (!p || typeof p.accountId !== 'string' || !TEAMS.has(p.team) || seen.has(p.accountId)) throw new Error('Invalid or duplicate match participant');
      seen.add(p.accountId);
      if (++counts[p.team] > teamSize) throw new Error('Match team is over capacity');
      return { accountId: p.accountId, team: p.team };
    }).sort((a, b) => a.accountId.localeCompare(b.accountId));
    if (eligible && (counts.custardia !== teamSize || counts.rice !== teamSize)) throw new Error('Ladder matches require two complete human teams');
    return { id, queueKey, mode, teamSize, winner, eligible, reason, participants };
  }

  function matchingPayload(existing, payload) {
    if (existing && existing.payload !== payload) throw new Error('Match ID already exists with a conflicting result');
  }

  function stageMatchResult(input) {
    const canonical = normalizeMatch(input), payload = JSON.stringify(canonical);
    db.exec('BEGIN IMMEDIATE');
    try {
      const existing = getMatch.get(canonical.id), pending = getPending.get(canonical.id);
      matchingPayload(existing, payload);
      matchingPayload(pending, payload);
      if (existing || pending) {
        if (existing) deletePending.run(canonical.id);
        db.exec('COMMIT');
        return { staged: false, recorded: Boolean(existing) };
      }
      // Eligibility is validated once, before the terminal result becomes durable.
      // Later credential revocation cannot erase an already staged result.
      for (const p of canonical.participants) {
        const user = account.get(p.accountId);
        if (!user) throw new Error('Unknown match participant');
        if (canonical.eligible && user.revoked) throw new Error('Revoked account cannot receive ladder results');
      }
      db.prepare('INSERT INTO pending_results VALUES (?, ?, ?)').run(canonical.id, payload, Date.now());
      db.exec('COMMIT');
      return { staged: true, recorded: false };
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }

  function pendingResults() {
    return Object.freeze(db.prepare('SELECT id, payload FROM pending_results ORDER BY created_at, rowid').all().map(row => {
      const canonical = normalizeMatch(JSON.parse(row.payload));
      if (canonical.id !== row.id || JSON.stringify(canonical) !== row.payload) throw new Error('Invalid pending match result');
      for (const p of canonical.participants) {
        if (!account.get(p.accountId)) throw new Error('Unknown pending match participant');
        Object.freeze(p);
      }
      Object.freeze(canonical.participants);
      return Object.freeze(canonical);
    }));
  }

  function recordMatch(input) {
    const canonical = normalizeMatch(input);
    const { id, queueKey, mode, teamSize, winner, eligible, reason, participants } = canonical;
    const payload = JSON.stringify(canonical);

    db.exec('BEGIN IMMEDIATE');
    try {
      const existing = getMatch.get(id);
      const pending = getPending.get(id);
      matchingPayload(pending, payload);
      if (existing) {
        matchingPayload(existing, payload);
        deletePending.run(id);
        db.exec('COMMIT');
        return { recorded: false, eligible: Boolean(existing.eligible), reason: existing.reason, changes: [] };
      }
      // Validate and snapshot every participant inside the same write transaction.
      const players = participants.map(p => {
        const user = account.get(p.accountId);
        if (!user) throw new Error('Unknown match participant');
        if (eligible && user.revoked && !pending) throw new Error('Revoked account cannot receive ladder results');
        return { ...p, before: (getRating.get(p.accountId, queueKey) || { rating: 1000 }).rating };
      });
      let delta = 0;
      if (eligible) {
        const sum = { custardia: 0, rice: 0 };
        for (const p of players) sum[p.team] += p.before;
        const expected = 1 / (1 + 10 ** ((sum.rice - sum.custardia) / teamSize / 400));
        const score = winner === null ? 0.5 : winner === 'custardia' ? 1 : 0;
        delta = Math.round(32 * (score - expected));
      }
      insertMatch.run(id, queueKey, mode, teamSize, winner, Number(eligible), reason, payload, Date.now());
      const changes = [];
      for (const p of players) {
        const after = eligible ? Math.max(500, Math.min(2500, p.before + (p.team === 'custardia' ? delta : -delta))) : p.before;
        insertPlayer.run(id, p.accountId, p.team, p.before, after);
        if (eligible) {
          saveRating.run(p.accountId, queueKey, after, Number(winner === p.team), Number(winner !== null && winner !== p.team), Number(winner === null));
          changes.push({ accountId: p.accountId, before: p.before, after, delta: after - p.before });
        }
      }
      deletePending.run(id);
      db.exec('COMMIT');
      return { recorded: true, eligible, reason, changes };
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }

  return {
    issue(name) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 24 || /[\x00-\x1f\x7f<>]/.test(name)) throw new Error('Player names must contain 1–24 printable characters without angle brackets');
      const accountId = crypto.randomUUID(), token = crypto.randomBytes(32).toString('hex');
      const displayName = name.trim();
      db.prepare('INSERT INTO accounts (id, name, token_hash, created_at) VALUES (?, ?, ?, ?)').run(accountId, displayName, hash(token), Date.now());
      return { accountId, token, name: displayName };
    },
    authenticate(token) {
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
      const row = db.prepare('SELECT id, name FROM accounts WHERE token_hash = ? AND revoked = 0').get(hash(token));
      return row ? { id: row.id, name: row.name } : null;
    },
    profile,
    stageMatchResult,
    pendingResults,
    recordMatch,
    leaderboard(queueKey, limit = 50) {
      validateQueue(queueKey);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Leaderboard limit must be between 1 and 100');
      return db.prepare(`SELECT a.id, a.name, r.rating, r.matches, r.wins, r.losses, r.draws
        FROM ratings r JOIN accounts a ON a.id = r.account_id WHERE r.queue_key = ? AND a.revoked = 0
        ORDER BY r.rating DESC, r.wins DESC, a.id ASC LIMIT ?`).all(queueKey, limit)
        .map(row => ({ ...row, provisional: row.matches < 10 }));
    },
    revoke(id) {
      if (typeof id !== 'string') throw new Error('Invalid player account ID');
      return db.prepare('UPDATE accounts SET revoked = 1 WHERE id = ? AND revoked = 0').run(id).changes > 0;
    },
    close() { db.close(); }
  };
}

module.exports = { createPlayerStore };
