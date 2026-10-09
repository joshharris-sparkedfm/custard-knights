'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const battle = require('../game/mass-battle.js');

function seconds(state, count, inputs = {}) {
  for (let i = 0; i < Math.ceil(count * 60); i++) battle.step(state, 1 / 60, inputs);
}
function fixture(mode = 'brawl') {
  const s = battle.create({ mode, teamSize: 4, seed: 11 });
  for (const p of s.players) {
    p.bot = false; p.humanId = p.id; p.alive = false; p.respawn = 999; p.protection = 0;
  }
  const a = s.players[0], b = s.players[4];
  Object.assign(a, { alive: true, x: 1000, y: 900, angle: 0, protection: 0 });
  Object.assign(b, { alive: true, x: 1070, y: 900, angle: Math.PI, protection: 0 });
  return { s, a, b };
}

test('all advertised sizes and modes produce complete stable faction rosters', () => {
  for (const teamSize of [4, 20, 50]) for (const mode of ['brawl', 'ctf', 'siege']) {
    const s = battle.create({ teamSize, mode });
    assert.equal(s.players.length, teamSize * 2);
    assert.equal(new Set(s.players.map(p => p.id)).size, teamSize * 2);
    assert.equal(s.players.filter(p => p.team === 'custardia').length, teamSize);
    assert.ok(s.players.every(p => p.bot && p.alive && p.hp > 0));
    assert.equal(s.castles.length, 2); assert.equal(s.flags.length, 2);
  }
});

test('four named profiles preserve combat stats and legacy numeric practice selection', () => {
  for (const difficulty of ['easy', 'medium', 'hard', 'steve']) for (const mode of ['brawl', 'ctf', 'siege']) for (const teamSize of [4, 20, 50]) {
    const s = battle.create({ difficulty, mode, teamSize });
    assert.equal(s.difficulty, difficulty); assert.equal(battle.snapshot(s).difficulty, difficulty);
    assert.ok(s.players.every(p => p.hp === battle.roles[p.role].hp));
    assert.equal(s.players.length, teamSize * 2);
  }
  assert.equal(battle.create().difficulty, 'medium');
  assert.equal(battle.create({ difficulty: '__proto__' }).difficulty, 'medium');
  for (const [rating, expected] of [[800, 'easy'], [1200, 'medium'], [1600, 'hard'], [2300, 'steve']]) assert.equal(battle.create({ rating }).difficulty, expected);
});

test('harder profiles make faster, more precise decisions without stat bonuses', () => {
  const timings = [], errors = [];
  for (const difficulty of ['easy', 'medium', 'hard', 'steve']) {
    const { s, a, b } = fixture(); s.difficulty = difficulty; a.bot = true; a.role = 'ranger'; b.x = 1400;
    battle.step(s, 1 / 60); timings.push(a.aiTimer); errors.push(Math.abs(Math.atan2(a._ai.aimY, a._ai.aimX)));
    assert.equal(a.maxHp, 130); assert.equal(b.maxHp, 130); // No difficulty touches the initialized health.
  }
  for (let i = 1; i < 4; i++) { assert.ok(timings[i] < timings[i - 1]); assert.ok(errors[i] < errors[i - 1]); }
});

test('every bot role actually uses its ready ability instead of starving behind attacks', () => {
  for (const role of ['vanguard', 'ranger', 'engineer', 'support']) {
    const { s, a } = fixture('siege'); s.difficulty = 'steve'; a.role = role; a.bot = true; a.hp = 50;
    battle.step(s, 1 / 60);
    assert.ok(a.abilityCooldown > 0, role + ' must execute the ability');
    assert.equal(a.attack, null, 'Ready ability gets priority over ordinary attacks');
  }
  const { s, a } = fixture();
  battle.step(s, 1 / 60, { [a.id]: { attack: true, ability: true, aimX: 1 } });
  assert.ok(a.abilityCooldown > 0); assert.equal(a.attack, null);
});

test('CTF bots recover, intercept, escort and return instead of pursuing only kills', () => {
  const f = fixture('ctf'); f.a.bot = true; f.s.difficulty = 'steve'; f.b.x = 2500;
  f.s.flags[0].dropped = true; f.s.flags[0].x = 800; f.s.flags[0].returnTimer = 10;
  battle.step(f.s, 1 / 60); assert.equal(f.a._intent, 'recover');
  f.s.flags[0].dropped = false; f.s.flags[0].carrier = f.b.id; f.a.aiTimer = 0;
  battle.step(f.s, 1 / 60); assert.equal(f.a._intent, 'intercept');
  f.s.flags[0].carrier = null; f.s.flags[1].carrier = f.a.id; f.a.aiTimer = 0;
  battle.step(f.s, 1 / 60); assert.equal(f.a._intent, 'return');
  const escort = f.s.players[1]; Object.assign(escort, { bot: true, alive: true, protection: 0, x: 1150, y: 950, aiTimer: 0 });
  battle.step(f.s, 1 / 60); assert.equal(escort._intent, 'escort');
});

test('siege engineer defends and repairs; support follows a wounded squadmate', () => {
  const f = fixture('siege'); f.a.bot = true; f.a.role = 'engineer'; f.s.difficulty = 'steve'; f.s.castles[0].hp = 200;
  f.a.x = f.s.castles[0].x + 170; f.a.y = 900; f.b.x = 2500;
  battle.step(f.s, 1 / 60); assert.equal(f.a._intent, 'repair'); assert.equal(f.s.castles[0].hp, 255);
  const q = fixture(); q.a.bot = true; q.a.role = 'support'; q.s.difficulty = 'hard'; q.b.x = 2500;
  const mate = q.s.players[1]; Object.assign(mate, { alive: true, x: 1200, y: 900, hp: 30, protection: 0 });
  battle.step(q.s, 1 / 60); assert.equal(q.a._intent, 'support'); assert.ok(q.a.vx > 0);
});

test('human pressure budgets prevent ranged dogpiles without changing human health', () => {
  for (const difficulty of ['easy', 'medium', 'hard', 'steve']) {
    const s = battle.create({ teamSize: 20, difficulty, seed: 31 });
    const human = s.players.find(p => p.team === 'rice');
    for (const p of s.players) { p.alive = p.team === 'custardia' || p === human; p.respawn = 999; p.protection = 0; p.x = p === human ? 1350 : 1000; p.y = 900; p.role = 'ranger'; }
    human.bot = false; human.humanId = 'human';
    battle.step(s, 1 / 60);
    const targeting = s.players.filter(p => p.bot && p._aiTarget === human.id).length;
    assert.ok(targeting > 0 && targeting <= battle.difficulties[difficulty].humanPressure);
    assert.equal(human.hp, human.maxHp);
  }
});

test('STEVE can time a parry and use a dash to close an opening', () => {
  let parries = 0, dashes = 0, heavies = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const f = fixture(); f.s._rng = seed; f.s.difficulty = 'steve'; f.a.bot = true; f.a.abilityCooldown = 99;
    f.b.attack = { kind: 'light', time: .08, angle: Math.PI, hit: [], fired: false, phase: 'windup', progress: .1 };
    seconds(f.s, .14); if (f.s.effects.some(e => e.kind === 'parry')) parries++;
    const d = fixture(); d.s._rng = seed; d.s.difficulty = 'steve'; d.a.bot = true; d.a.abilityCooldown = 99; d.b.x = d.a.x + 230;
    battle.step(d.s, 1 / 60); if (d.a.dashing) dashes++;
    const h = fixture(); h.s._rng = seed; h.s.difficulty = 'steve'; h.a.bot = true; h.a.abilityCooldown = 99; h.b.guarding = true;
    battle.step(h.s, 1 / 60); if (h.a.attack && h.a.attack.kind === 'heavy') heavies++;
  }
  assert.ok(parries > 0); assert.ok(dashes > 0); assert.ok(heavies > 0);
});

test('projectile-aware bot turns its guard toward incoming arrows', () => {
  let guarded = 0, missed = 0;
  for(let seed=1;seed<=32;seed++){
    const f = fixture(); f.s._rng = seed; f.s.difficulty = 'steve'; f.a.bot = true; f.a.abilityCooldown = 99; f.b.x = 2500;
    f.s.projectiles.push({ id: 900, owner: f.b.id, team: f.b.team, kind: 'arrow', x: f.a.x + 160, y: f.a.y, angle: Math.PI, speed: 680, radius: 5, life: .8, damage: 16, powered: false, hit: [] });
    battle.step(f.s, 1 / 60);
    if(!f.a._ai.guard){missed++;continue;}
    guarded++;assert.ok(f.a._ai.aimX > .99);
    // Isolate the selected guard through impact; decision probability is checked separately.
    f.a.aiTimer=.4;seconds(f.s,.3);assert.ok(f.a.hp > f.a.maxHp - 16);
  }
  assert.ok(guarded>0);assert.ok(missed>0,'STEVE must retain its non-perfect guard probability');
});

test('support and repair score only useful restoration; self-healing cannot farm support points', () => {
  const f = fixture(); f.a.role = 'support'; f.a.hp = 50; f.b.x = 2500;
  const ally = f.s.players[1]; Object.assign(ally, { alive: true, x: 1080, y: 900, hp: 70, maxHp: 85, protection: 0 });
  battle.step(f.s, 1 / 60, { [f.a.id]: { ability: true } }); assert.equal(f.a.score, 8);
  f.a.abilityCooldown = 0;
  battle.step(f.s, 1 / 60, { [f.a.id]: { ability: true } }); assert.equal(f.a.score, 8);
  const g = fixture('siege'); g.a.role = 'engineer'; g.a.x = g.s.castles[0].x + 150; g.s.castles[0].hp -= 10;
  battle.step(g.s, 1 / 60, { [g.a.id]: { ability: true } }); assert.equal(g.a.score, 5);
});

test('human joins balance human counts and trusted ratings; leave refills exact slot', () => {
  const s = battle.create({ teamSize: 4 });
  const ids = s.players.map(p => p.id);
  for (let i = 0; i < 8; i++) {
    assert.equal(battle.join(s, { id: 'human-' + i, name: '<Alice>', rating: 700 + i * 200 }).ok, true);
    const c = s.players.filter(p => !p.bot && p.team === 'custardia').length;
    const r = s.players.filter(p => !p.bot && p.team === 'rice').length;
    assert.ok(Math.abs(c - r) <= 1);
  }
  assert.equal(battle.join(s, { id: 'ninth' }).ok, false);
  const slot = s.players.find(p => p.humanId === 'human-0').id;
  assert.equal(battle.leave(s, 'human-0'), true);
  assert.equal(s.players.find(p => p.id === slot).bot, true);
  assert.deepEqual(s.players.map(p => p.id), ids);
  assert.equal(battle.join(s, { id: 'replacement', rating: NaN }).slot, slot);
  assert.equal(battle.join(s, { id: 'replacement' }).slot, slot);
  assert.equal(s.players[0].name.includes('<'), false);
});

test('bot ratings adapt to humans without accepting them from input packets', () => {
  const s = battle.create({ teamSize: 20 });
  battle.join(s, { id: 'a', rating: 1800 }); battle.join(s, { id: 'b', rating: 1200 });
  const totals = ['custardia', 'rice'].map(t => s.players.filter(p => p.team === t).reduce((n, p) => n + p.rating, 0));
  assert.ok(Math.abs(totals[0] - totals[1]) < 20);
  const rating = s.players.find(p => p.humanId === 'a').rating;
  battle.step(s, .1, { a: { rating: 2500, hp: 9999, team: 'rice' } });
  assert.equal(s.players.find(p => p.humanId === 'a').rating, rating);
});

test('independent saved visors are sanitized, snapshotted and reset on bot refill', () => {
  const s = battle.create({ teamSize: 4 });
  const a = battle.join(s, { id: 'open-human', visor: 'open' });
  const b = battle.join(s, { id: 'closed-human', visor: 'closed' });
  const c = battle.join(s, { id: 'invalid-human', visor: { malicious: 'open' } });
  const snapshot = battle.snapshot(s);
  assert.equal(snapshot.players.find(p => p.id === a.slot).visor, 'open');
  assert.equal(snapshot.players.find(p => p.id === b.slot).visor, 'closed');
  assert.equal(snapshot.players.find(p => p.id === c.slot).visor, 'closed');
  battle.step(s, .1, { 'closed-human': { visor: 'open' } });
  assert.equal(s.players.find(p => p.id === b.slot).visor, 'closed');
  battle.leave(s, 'open-human'); assert.equal(s.players.find(p => p.id === a.slot).visor, 'closed');
});

test('seeded simulation is repeatable and snapshots cannot mutate live state', () => {
  const a = battle.create({ mode: 'ctf', teamSize: 20, seed: 801 });
  const b = battle.create({ mode: 'ctf', teamSize: 20, seed: 801 });
  seconds(a, 12); seconds(b, 12);
  assert.deepEqual(battle.snapshot(a), battle.snapshot(b));
  const view = battle.snapshot(a); view.players[0].hp = -100; view.castles[0].hp = 0; view.scores.rice = 999;
  assert.notEqual(a.players[0].hp, -100); assert.ok(a.castles[0].hp > 0); assert.notEqual(a.scores.rice, 999);
  assert.equal('_rng' in view, false); assert.equal('rating' in view.players[0], false);
});

test('hostile input and long frame stalls cannot teleport or poison simulation', () => {
  const { s, a } = fixture(); const x = a.x, y = a.y;
  battle.step(s, Infinity, { [a.id]: { moveX: Infinity, aimY: NaN } });
  assert.equal(s.elapsed, 0);
  battle.step(s, 50, { [a.id]: { moveX: 999, moveY: -999, aimX: Infinity, aimY: NaN, dash: 'yes' } });
  assert.ok(s.elapsed <= .100001);
  assert.ok(Math.hypot(a.x - x, a.y - y) < 20);
  assert.ok(Number.isFinite(a.angle));
  const previous = a.x; battle.step(s, -1); assert.equal(a.x, previous);
});

test('light attack has visible windup, one directional hit, and recovery', () => {
  const { s, a, b } = fixture();
  const behind = s.players[5]; Object.assign(behind, { alive: true, x: 930, y: 900, protection: 0 });
  const hp = b.hp;
  seconds(s, .1, { [a.id]: { attack: true, aimX: 1 } });
  assert.equal(b.hp, hp); assert.equal(a.attack.phase, 'windup');
  seconds(s, .22, {});
  assert.equal(b.hp, hp - battle.roles.vanguard.damage);
  assert.equal(behind.hp, behind.maxHp);
  assert.equal(a.attack.phase, 'recovery');
  seconds(s, .22); assert.equal(a.attack, null);
});

test('heavy has longer windup and finite forward arc', () => {
  const { s, a, b } = fixture(); const hp = b.hp;
  const rear = s.players[5]; Object.assign(rear, { alive: true, x: 940, y: 900, protection: 0 });
  seconds(s, .3, { [a.id]: { heavy: true, aimX: 1 } }); assert.equal(b.hp, hp);
  seconds(s, .3); assert.equal(b.hp, hp - 36); assert.equal(rear.hp, rear.maxHp);
});

test('same-tick opposing swings trade instead of favouring roster order', () => {
  for (const reverse of [false, true]) {
    const { s, a, b } = fixture(); if (reverse) s.players.reverse();
    seconds(s, .20, { [a.id]: { attack: true, aimX: 1 }, [b.id]: { attack: true, aimX: -1 } });
    assert.equal(a.hp, a.maxHp - 20); assert.equal(b.hp, b.maxHp - 20);
  }
});

test('front guard reduces damage while rear guard does not', () => {
  const front = fixture();
  seconds(front.s, .2, { [front.b.id]: { guard: true, aimX: -1 } });
  seconds(front.s, .35, { [front.a.id]: { attack: true, aimX: 1 }, [front.b.id]: { guard: true, aimX: -1 } });
  assert.equal(front.b.hp, front.b.maxHp - 6);
  const rear = fixture();
  seconds(rear.s, .2, { [rear.b.id]: { guard: true, aimX: 1 } });
  seconds(rear.s, .35, { [rear.a.id]: { attack: true, aimX: 1 }, [rear.b.id]: { guard: true, aimX: 1 } });
  assert.equal(rear.b.hp, rear.b.maxHp - 20);
});

test('timed parry interrupts attacker and stun blocks dash', () => {
  const { s, a, b } = fixture();
  seconds(s, .10, { [a.id]: { attack: true, aimX: 1 } });
  seconds(s, .09, { [b.id]: { guard: true, aimX: -1 } });
  assert.equal(b.hp, b.maxHp); assert.ok(a.stun > 0); assert.equal(a.attack, null);
  const x = a.x; seconds(s, .08, { [a.id]: { moveX: 1, dash: true } });
  assert.equal(a.x, x); assert.equal(a.dashing, false);
});

test('empty guard meter does not disable ordinary attacks or a ready dash', () => {
  const a = fixture(); a.a.stamina = 0;
  battle.step(a.s, 1 / 60, { [a.a.id]: { heavy: true, aimX: 1 } });
  assert.equal(a.a.attack.kind, 'heavy');
  const b = fixture(); b.a.stamina = 0; const x = b.a.x;
  battle.step(b.s, 1 / 60, { [b.a.id]: { dash: true, moveX: 1 } });
  assert.ok(b.a.x > x); assert.equal(b.a.dashing, true);
});

test('vanguard bash only damages and stuns its frontal cone', () => {
  const { s, a, b } = fixture();
  const rear = s.players[5]; Object.assign(rear, { alive: true, x: 930, y: 900, protection: 0 });
  battle.step(s, 1 / 60, { [a.id]: { ability: true, aimX: 1 } });
  assert.equal(b.hp, b.maxHp - 12); assert.ok(b.stun > .4);
  assert.equal(rear.hp, rear.maxHp); assert.ok(a.abilityCooldown > 8);
});

test('support heals allies only and cannot spam cooldown; engineer repairs own castle', () => {
  const { s, a, b } = fixture('siege'); a.role = 'support'; a.hp = 50; b.hp = 50;
  battle.step(s, 1 / 60, { [a.id]: { ability: true } });
  assert.equal(a.hp, 82); assert.equal(b.hp, 50);
  battle.step(s, 1 / 60, { [a.id]: { ability: true } }); assert.equal(a.hp, 82);
  a.role = 'engineer'; a.abilityCooldown = 0; a.x = s.castles[0].x; a.y = 900;
  s.castles[0].hp -= 100; const hp = s.castles[0].hp;
  battle.step(s, 1 / 60, { [a.id]: { ability: true, aimX: 1 } });
  assert.equal(s.castles[0].hp, hp + 55); assert.equal(s.projectiles[0].kind, 'bomb');
});

test('ranger uses bounded projectiles and kills award only once', () => {
  const { s, a, b } = fixture(); a.role = 'ranger'; b.x = 1200; b.hp = 10;
  seconds(s, 1, { [a.id]: { attack: true, aimX: 1 } });
  assert.equal(b.alive, false); assert.equal(a.kills, 1); assert.equal(b.deaths, 1); assert.equal(s.scores.custardia, 1);
  seconds(s, 1, { [a.id]: { attack: true, aimX: 1 } }); assert.equal(a.kills, 1);
});

test('death respawns with protection and role may change only during respawn', () => {
  const { s, a, b } = fixture(); b.hp = 1;
  seconds(s, .4, { [a.id]: { attack: true, aimX: 1 }, [b.id]: { role: 'ranger' } });
  assert.equal(b.alive, false); assert.equal(b.role, 'ranger');
  seconds(s, 5.1); assert.equal(b.alive, true); assert.equal(b.maxHp, 85); assert.ok(b.protection > 2);
  battle.step(s, 1 / 60, { [b.id]: { role: 'engineer' } }); assert.equal(b.role, 'ranger');
});

test('CTF requires own flag home, captures score, and victory freezes simulation', () => {
  const { s, a, b } = fixture('ctf'); b.alive = false;
  const own = s.flags[0], enemy = s.flags[1];
  for (let capture = 0; capture < 3; capture++) {
    a.x = enemy.homeX; a.y = enemy.homeY; battle.step(s, 1 / 60);
    assert.equal(enemy.carrier, a.id);
    a.x = own.homeX; a.y = own.homeY;
    if (!capture) {
      own.dropped = true; own.x = 800; own.returnTimer = 10;
      battle.step(s, 1 / 60); assert.equal(s.scores.custardia, 0);
      own.dropped = false; own.x = own.homeX;
    }
    battle.step(s, 1 / 60); assert.equal(s.scores.custardia, capture + 1);
  }
  assert.equal(s.winner, 'custardia'); assert.equal(s.finishReason, 'flags');
  const elapsed = s.elapsed; seconds(s, 1); assert.equal(s.elapsed, elapsed);
});

test('dropped flag defender recovery wins a simultaneous enemy pickup', () => {
  const { s, a, b } = fixture('ctf'); const f = s.flags[0];
  f.dropped = true; f.x = 1000; f.y = 900; f.returnTimer = 10;
  a.x = 980; b.x = 1020;
  battle.step(s, 1 / 60); assert.equal(f.carrier, null); assert.equal(f.x, f.homeX); assert.equal(f.dropped, false);
});

test('leaving flag carrier drops objective, removes old shots, and fills a bot', () => {
  const s = battle.create({ mode: 'ctf' }); const result = battle.join(s, { id: 'human' });
  const p = s.players.find(p => p.id === result.slot); p.x = 1600; p.y = 900;
  s.flags[1].carrier = p.id;
  s.projectiles.push({ owner: p.id });
  battle.leave(s, 'human'); assert.equal(s.flags[1].carrier, null); assert.equal(s.flags[1].x, 1600);
  assert.equal(s.flags[1].dropped, true); assert.equal(s.projectiles.length, 0); assert.equal(p.bot, true);
});

test('siege forward strikes destroy castles; central control rewards ownership', () => {
  const { s, a, b } = fixture('siege'); b.alive = false;
  const c = s.castles[1]; a.x = c.x - c.radius - 60; a.y = c.y; c.hp = 10;
  seconds(s, .4, { [a.id]: { attack: true, aimX: 1 } });
  assert.equal(c.hp, 0); assert.equal(s.winner, 'custardia'); assert.equal(s.finishReason, 'castle');
  const f = fixture(); f.b.alive = false; f.a.x = 1600; f.a.y = 900;
  seconds(f.s, 12); assert.equal(f.s.control.owner, 'custardia'); assert.ok(f.s.scores.custardia > 0);
});

test('time expiry resolves score, siege castle health, and ties honestly', () => {
  for (const mode of ['brawl', 'ctf', 'siege']) {
    const { s } = fixture(mode); s.elapsed = s.duration - .02; s.time = .02;
    seconds(s, .1); assert.equal(s.status, 'finished'); assert.equal(s.winner, 'draw');
  }
  const { s } = fixture('siege'); s.castles[1].hp -= 1; s.elapsed = s.duration - .02; s.time = .02;
  seconds(s, .1); assert.equal(s.winner, 'custardia');
});

test('simultaneous objective thresholds resolve as draws for either roster order', () => {
  const a = fixture('brawl'); a.s.scores.custardia = a.s.scoreLimit; a.s.scores.rice = a.s.scoreLimit;
  battle.step(a.s, 1 / 60); assert.equal(a.s.winner, 'draw');
  const b = fixture('siege'); b.s.castles.forEach(c => { c.hp = 0; });
  battle.step(b.s, 1 / 60); assert.equal(b.s.winner, 'draw');
});

test('100-participant bots pursue objectives with bounded finite state', () => {
  for (const mode of ['brawl', 'ctf', 'siege']) {
    const s = battle.create({ teamSize: 50, mode, seed: 199 });
    seconds(s, 35);
    assert.ok(s.players.some(p => p.kills > 0));
    assert.ok(s.players.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.hp)));
    assert.ok(s.projectiles.length <= 160); assert.ok(s.effects.length <= 96);
    assert.equal(s.players.length, 100);
  }
});

test('50v50 objective squads complete flag captures and castle assaults', () => {
  for (const mode of ['ctf', 'siege']) {
    const s = battle.create({ teamSize: 50, mode, seed: 123, duration: 600 });
    seconds(s, 600.1);
    assert.equal(s.status, 'finished', mode + ' must make objective progress, not only fight in the centre');
    if (mode === 'ctf') assert.ok(s.scores.custardia + s.scores.rice > 0);
    else assert.ok(s.castles.some(c => c.hp < c.maxHp));
  }
});
