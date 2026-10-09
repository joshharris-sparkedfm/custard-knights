#!/usr/bin/env node
'use strict';

const { createPlayerStore } = require('../server/player-store.cjs');

const usage = `Private test ladder account administration (Node 24+).
  node scripts/player-admin.cjs --db PATH issue "Player name"
  node scripts/player-admin.cjs --db PATH revoke ACCOUNT_ID
  node scripts/player-admin.cjs --db PATH profile ACCOUNT_ID QUEUE
  node scripts/player-admin.cjs --db PATH leaderboard QUEUE [LIMIT]
  node scripts/player-admin.cjs --db PATH pending
  node scripts/player-admin.cjs --db PATH retry-pending
QUEUE: brawl-4, ctf-20, siege-50, or any supported mode/size combination.
The issue command prints a secret credential once. Deliver it privately; do not put it in logs.
Back up the stopped server's database before maintenance.
Run retry-pending only with the server stopped. It applies durably staged terminal results;
it cannot recover live matches or results that could not be staged to disk.`;

function main(args) {
  if (args.includes('--help') || args.includes('-h')) { console.log(usage); return; }
  const dbIndex = args.indexOf('--db');
  if (dbIndex < 0 || !args[dbIndex + 1] || args[dbIndex + 1].startsWith('--')) throw new Error('An explicit --db PATH is required. Use --help for commands.');
  const filename = args[dbIndex + 1];
  args = [...args.slice(0, dbIndex), ...args.slice(dbIndex + 2)];
  const [command, ...values] = args;
  const arity = { issue: [1, 1], revoke: [1, 1], profile: [2, 2], leaderboard: [1, 2], pending: [0, 0], 'retry-pending': [0, 0] }[command];
  if (!Array.isArray(arity) || values.length < arity[0] || values.length > arity[1] || values.some(x => x.startsWith('--'))) throw new Error('Invalid command arguments. Use --help for commands.');
  const store = createPlayerStore({ filename });
  try {
    let result;
    if (command === 'issue') result = store.issue(values[0]);
    if (command === 'revoke') result = { accountId: values[0], revoked: store.revoke(values[0]) };
    if (command === 'profile') result = store.profile(values[0], values[1]);
    if (command === 'leaderboard') result = store.leaderboard(values[0], values[1] === undefined ? 50 : Number(values[1]));
    if (command === 'pending') {
      const pending = store.pendingResults();
      result = { count: pending.length, ids: pending.map(input => input.id) };
    }
    if (command === 'retry-pending') {
      const completed = [];
      for (const input of store.pendingResults()) {
        const applied = store.recordMatch(input);
        completed.push({ id: input.id, recorded: applied.recorded, eligible: applied.eligible });
      }
      result = { count: completed.length, results: completed };
    }
    console.log(JSON.stringify(result, null, 2));
  } finally { store.close(); }
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`Player administration failed: ${error.message}`); process.exitCode = 1; }
}
module.exports = { main };
