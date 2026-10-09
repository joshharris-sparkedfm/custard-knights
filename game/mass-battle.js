/* Isolated faction battles. The host owns this state; clients submit intentions only. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CKMassBattle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TEAMS = ['custardia', 'rice'];
  const ROLES = {
    vanguard: { hp: 130, speed: 184, damage: 20, reach: 92, cooldown: 9 },
    ranger: { hp: 85, speed: 204, damage: 15, reach: 80, cooldown: 8 },
    engineer: { hp: 110, speed: 174, damage: 18, reach: 88, cooldown: 12 },
    support: { hp: 95, speed: 196, damage: 15, reach: 86, cooldown: 10 }
  };
  const SWINGS = {
    light: { windup: .16, active: .12, recovery: .24, arc: 1.02 },
    heavy: { windup: .42, active: .16, recovery: .38, arc: 1.24 },
    arrow: { windup: .26, active: .04, recovery: .50, arc: .10 }
  };
  // Difficulty changes decisions, not health, movement, damage, range or cooldowns.
  const DIFFICULTIES = Object.freeze({
    easy: Object.freeze({ label: 'Easy', reaction: .50, jitter: .12, aimError: .24, lead: .05, guard: .15, heavy: .12, ability: .45, dash: .12, coordination: .15, humanPressure: 1 }),
    medium: Object.freeze({ label: 'Medium', reaction: .30, jitter: .08, aimError: .13, lead: .30, guard: .40, heavy: .25, ability: .72, dash: .30, coordination: .45, humanPressure: 2 }),
    hard: Object.freeze({ label: 'Hard', reaction: .18, jitter: .05, aimError: .065, lead: .65, guard: .68, heavy: .40, ability: .92, dash: .55, coordination: .75, humanPressure: 3 }),
    steve: Object.freeze({ label: 'STEVE (insane)', reaction: .10, jitter: .025, aimError: .025, lead: .88, guard: .88, heavy: .52, ability: 1, dash: .78, coordination: 1, humanPressure: 4 })
  });
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const number = (n, fallback) => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  const other = team => team === 'custardia' ? 'rice' : 'custardia';
  const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const facing = (a, b, arc) => Math.cos(a.angle) * (b.x - a.x) + Math.sin(a.angle) * (b.y - a.y) >= Math.sqrt(dist2(a, b)) * Math.cos(arc);
  function random(s) { let x = s._rng; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; s._rng = x >>> 0; return s._rng / 4294967296; }
  function roleFor(slot) { return ['vanguard', 'ranger', 'engineer', 'support', 'vanguard'][slot % 5]; }
  function castle(s, team) { return s.castles.find(c => c.team === team); }
  function flag(s, team) { return s.flags.find(f => f.team === team); }
  function spawn(s, p) {
    const spec = ROLES[p.role];
    p.x = p.team === 'custardia' ? 150 + random(s) * 170 : 2880 + random(s) * 170;
    p.y = 390 + (p.slot % 3) * 480 + random(s) * 100;
    p.angle = p.team === 'custardia' ? 0 : Math.PI; p.vx = 0; p.vy = 0;
    p.maxHp = spec.hp; p.hp = spec.hp; p.alive = true; p.respawn = 0;
    p.stamina = 100; p.stun = 0; p.protection = 2.5; p.attack = null;
    p.guarding = false; p.dashing = false; p.dashTime = 0; p.dashCooldown = 0;
    p.abilityCooldown = 0; p.guardTime = 0; p.aiTimer = 0; p._ai = {};
  }
  function create(options) {
    options = options || {};
    const size = [4, 20, 50].includes(options.teamSize) ? options.teamSize : 4;
    const mode = ['brawl', 'ctf', 'siege'].includes(options.mode) ? options.mode : 'brawl';
    const duration = clamp(number(options.duration, 600), 30, 3600);
    const legacyRating = number(options.rating, 1000);
    const difficulty = Object.hasOwn(DIFFICULTIES, options.difficulty) ? options.difficulty : options.difficulty === undefined && typeof options.rating === 'number' ? legacyRating <= 900 ? 'easy' : legacyRating < 1500 ? 'medium' : legacyRating < 2100 ? 'hard' : 'steve' : 'medium';
    const s = { version: 1, mode, teamSize: size, difficulty, duration, time: duration, elapsed: 0,
      status: 'playing', winner: null, finishReason: null, scores: { custardia: 0, rice: 0 },
      scoreLimit: mode === 'ctf' ? 3 : Math.max(40, size * 8),
      world: { width: 3200, height: 1800, obstacles: [] },
      control: { x: 1600, y: 900, radius: 190, progress: 0, owner: null, tick: 0 },
      players: [], flags: [], castles: [], projectiles: [], effects: [],
      _rng: (number(options.seed, 12345) >>> 0) || 12345, _nextId: 0, _baseBotRating: clamp(legacyRating, 500, 2500) };
    for (const team of TEAMS) {
      s.castles.push({ team, x: team === 'custardia' ? 260 : 2940, y: 900, radius: 110,
        hp: 600 + size * 36, maxHp: 600 + size * 36 });
      const x = team === 'custardia' ? 420 : 2780;
      s.flags.push({ team, x, y: 900, homeX: x, homeY: 900, carrier: null, dropped: false, returnTimer: 0 });
      for (let slot = 0; slot < size; slot++) {
        const p = { id: (team === 'custardia' ? 'c-' : 'r-') + slot, slot, team,
          humanId: null, name: team === 'custardia' ? 'Custard ' + (slot + 1) : 'Rice ' + (slot + 1),
          bot: true, role: roleFor(slot), visor: 'closed', rating: s._baseBotRating, kills: 0, deaths: 0, score: 0 };
        spawn(s, p); s.players.push(p);
      }
    }
    return s;
  }
  function balanceBots(s) {
    const humans = s.players.filter(p => !p.bot);
    const mean = humans.length ? humans.reduce((sum, p) => sum + p.rating, 0) / humans.length : s._baseBotRating;
    for (const team of TEAMS) {
      const members = s.players.filter(p => p.team === team), bots = members.filter(p => p.bot);
      const humanTotal = members.filter(p => !p.bot).reduce((sum, p) => sum + p.rating, 0);
      const target = bots.length ? clamp((mean * s.teamSize - humanTotal) / bots.length, mean - 250, mean + 250) : mean;
      for (const p of bots) p.rating = clamp(Math.round(target), 500, 2500);
    }
  }
  function join(s, person) {
    if (!person || typeof person.id !== 'string' || !person.id.length || person.id.length > 80) return { ok: false, error: 'Invalid participant ID' };
    const existing = s.players.find(p => p.humanId === person.id);
    if (existing) return { ok: true, id: person.id, team: existing.team, slot: existing.id };
    if (s.status !== 'playing') return { ok: false, error: 'Match has ended' };
    const available = s.players.filter(p => p.bot);
    if (!available.length) return { ok: false, error: 'Match is full' };
    const rating = clamp(number(person.rating, 1000), 500, 2500);
    const counts = {}, totals = {};
    for (const team of TEAMS) {
      const hs = s.players.filter(p => p.team === team && !p.bot);
      counts[team] = hs.length; totals[team] = hs.reduce((sum, p) => sum + p.rating, 0);
    }
    let team = counts.custardia < counts.rice ? 'custardia' : counts.rice < counts.custardia ? 'rice' :
      Math.abs(totals.custardia + rating - totals.rice) <= Math.abs(totals.rice + rating - totals.custardia) ? 'custardia' : 'rice';
    let p = available.find(p => p.team === team) || available[0];
    dropFlag(s, p); s.projectiles = s.projectiles.filter(shot => shot.owner !== p.id); p.bot = false; p.humanId = person.id;
    p.name = String(person.name || 'Knight').replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 24) || 'Knight';
    p.rating = rating; p.kills = 0; p.deaths = 0; p.score = 0; p.visor = person.visor === 'open' ? 'open' : 'closed';
    if (Object.hasOwn(ROLES, person.role)) p.role = person.role;
    spawn(s, p); balanceBots(s);
    return { ok: true, id: person.id, team: p.team, slot: p.id };
  }
  function leave(s, id) {
    const p = s.players.find(p => p.humanId === id);
    if (!p) return false;
    dropFlag(s, p); s.projectiles = s.projectiles.filter(shot => shot.owner !== p.id); p.bot = true; p.humanId = null; p.name = (p.team === 'custardia' ? 'Custard ' : 'Rice ') + (p.slot + 1);
    p.role = roleFor(p.slot); p.visor = 'closed'; p.kills = 0; p.deaths = 0; p.score = 0;
    spawn(s, p); balanceBots(s); return true;
  }
  function effect(s, kind, x, y, radius, team, life) {
    if (s.effects.length < 96) s.effects.push({ id: ++s._nextId, kind, x, y, radius, team, life: life || .3 });
  }
  function dropFlag(s, p) {
    for (const f of s.flags) if (f.carrier === p.id) { f.carrier = null; f.x = p.x; f.y = p.y; f.dropped = true; f.returnTimer = 20; }
  }
  function resetFlag(f) { f.x = f.homeX; f.y = f.homeY; f.carrier = null; f.dropped = false; f.returnTimer = 0; }
  function finish(s, winner, reason) { if (s.status === 'playing') { s.status = 'finished'; s.winner = winner; s.finishReason = reason; } }
  function damage(s, target, amount, attacker, directional, extraStun) {
    if (!target.alive || target.protection > 0 || target.team === attacker.team) return false;
    if (s._pendingHits) { s._pendingHits.push({ target, amount, attacker, directional, extraStun }); return true; }
    if (target.guarding && target.stamina > 0 && (!directional || facing(target, attacker, 1.22))) {
      if (target.guardTime < .16 && attacker.id && attacker.alive) {
        attacker.stun = Math.max(attacker.stun, .38); attacker.attack = null;
        target.stamina = Math.max(0, target.stamina - 10); effect(s, 'parry', target.x, target.y, 40, target.team); return false;
      }
      target.stamina = Math.max(0, target.stamina - amount * 1.1); amount *= .30;
      if (target.stamina <= 0) { target.guarding = false; target.stun = .45; }
    }
    target.hp = Math.max(0, target.hp - amount); target.stun = Math.max(target.stun, extraStun || .10);
    effect(s, 'hit', target.x, target.y, 24, attacker.team);
    if (target.hp <= 0) {
      target.alive = false; target.deaths++; target.respawn = 5; target.attack = null; target.guarding = false; target.dashing = false;
      dropFlag(s, target);
      const owner = attacker.owner ? s.players.find(p => p.id === attacker.owner) : attacker;
      if (owner && owner.team === attacker.team) { owner.kills++; owner.score += 100; }
      if (s.mode !== 'ctf') s.scores[attacker.team]++;
      effect(s, 'defeat', target.x, target.y, 45, attacker.team, .6);
    }
    return true;
  }
  function castleDamage(s, c, amount, p) {
    if (s.mode !== 'siege' || c.team === p.team || c.hp <= 0) return;
    amount *= s.control.owner === p.team ? 1.3 : 1;
    c.hp = Math.max(0, c.hp - amount); p.score += Math.round(amount);
    effect(s, 'siege', c.x, c.y, c.radius, p.team);
  }
  function projectile(s, p, kind, powered) {
    if (s.projectiles.length >= 160) return;
    const bomb = kind === 'bomb';
    s.projectiles.push({ id: ++s._nextId, owner: p.id, team: p.team, kind,
      x: p.x + Math.cos(p.angle) * 25, y: p.y + Math.sin(p.angle) * 25,
      angle: p.angle, speed: bomb ? 300 : 680, radius: bomb ? 9 : 5,
      life: bomb ? .72 : .9, damage: bomb ? 33 : powered ? 35 : 16, powered: !!powered, hit: [] });
  }
  function startAttack(s, p, heavy) {
    if (p.attack || p.dashing || p.stun > 0 || p.guarding) return;
    p.protection = 0;
    const kind = !heavy && p.role === 'ranger' ? 'arrow' : heavy ? 'heavy' : 'light';
    p.attack = { kind, time: 0, angle: p.angle, hit: [], fired: false, phase: 'windup', progress: 0 };
  }
  function ability(s, p) {
    if (p.abilityCooldown > 0 || p.stun > 0 || p.attack || p.dashing) return;
    p.abilityCooldown = ROLES[p.role].cooldown; p.protection = 0; p.guarding = false;
    if (p.role === 'ranger') projectile(s, p, 'arrow', true);
    if (p.role === 'engineer') {
      projectile(s, p, 'bomb', false);
      const home = castle(s, p.team);
      if (dist2(p, home) < 240 ** 2 && s.mode === 'siege') { const restored = Math.min(55, home.maxHp - home.hp); home.hp += restored; p.score += Math.round(restored * .5); effect(s, 'repair', home.x, home.y, 110, p.team, .7); }
    }
    if (p.role === 'support') {
      for (const q of s.players) if (q.alive && q.team === p.team && dist2(p, q) < 180 ** 2) { const restored = Math.min(32, q.maxHp - q.hp); q.hp += restored; if (q !== p) p.score += Math.round(restored * .5); }
      effect(s, 'heal', p.x, p.y, 180, p.team, .7);
    }
    if (p.role === 'vanguard') {
      for (const q of s.players) if (q.alive && q.team !== p.team && dist2(p, q) < 110 ** 2 && facing(p, q, .8)) {
        damage(s, q, 12, p, true, .55);
      }
      effect(s, 'bash', p.x + Math.cos(p.angle) * 55, p.y + Math.sin(p.angle) * 55, 55, p.team);
    }
  }
  function advanceAttack(s, p, dt) {
    const a = p.attack;
    if (!a) return;
    const spec = SWINGS[a.kind]; a.time += dt;
    a.phase = a.time < spec.windup ? 'windup' : a.time < spec.windup + spec.active ? 'active' : 'recovery';
    a.phaseProgress = clamp(a.phase === 'windup' ? a.time / spec.windup : a.phase === 'active' ? (a.time - spec.windup) / spec.active : (a.time - spec.windup - spec.active) / spec.recovery, 0, 1);
    a.progress = clamp(a.time / (spec.windup + spec.active + spec.recovery), 0, 1);
    if (a.phase === 'active') {
      if (a.kind === 'arrow') { if (!a.fired) { projectile(s, p, 'arrow', false); a.fired = true; } }
      else {
        const reach = ROLES[p.role].reach + (a.kind === 'heavy' ? 24 : 0);
        const origin = { x: p.x, y: p.y, angle: a.angle };
        for (const q of s.players) if (q.alive && q.team !== p.team && !a.hit.includes(q.id) && dist2(p, q) <= (reach + 15) ** 2 && facing(origin, q, spec.arc)) {
          a.hit.push(q.id); damage(s, q, ROLES[p.role].damage * (a.kind === 'heavy' ? 1.8 : 1), p, true);
          if (p.stun > .15) return;
        }
        for (const c of s.castles) if (c.team !== p.team && !a.hit.includes(c.team) && dist2(p, c) <= (reach + c.radius) ** 2 && facing(origin, c, spec.arc)) {
          a.hit.push(c.team); castleDamage(s, c, a.kind === 'heavy' ? 29 : 15, p);
        }
      }
    }
    if (a.progress >= 1) p.attack = null;
  }
  function cleanInput(raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    let x = clamp(number(raw.moveX, 0), -1, 1), y = clamp(number(raw.moveY, 0), -1, 1);
    const len = Math.hypot(x, y); if (len > 1) { x /= len; y /= len; }
    return { moveX: x, moveY: y, aimX: clamp(number(raw.aimX, 0), -1, 1), aimY: clamp(number(raw.aimY, 0), -1, 1),
      attack: raw.attack === true, heavy: raw.heavy === true, guard: raw.guard === true, dash: raw.dash === true,
      ability: raw.ability === true, role: Object.hasOwn(ROLES, raw.role) ? raw.role : null };
  }
  function botInput(s, p, dt) {
    p.aiTimer -= dt;
    if (p.aiTimer > 0) return p._ai;
    const profile = DIFFICULTIES[s.difficulty] || DIFFICULTIES.medium;
    const ratingScale = clamp(1 - (p.rating - 1000) / 6000, .75, 1.12);
    p.aiTimer = profile.reaction * ratingScale + random(s) * profile.jitter;
    let target = s.control, enemy = null, distance = Infinity, goal = 'control', priority = Infinity;
    const carrying = s.flags.some(f => f.carrier === p.id);
    const runner = s.mode !== 'brawl' && (s.teamSize >= 20 ? p.slot % 2 === 1 : p.slot % 4 === 3);
    for (const q of s.players) if (q.alive && q.team !== p.team && q.protection <= 0) {
      const d = dist2(p, q);
      // A soft pressure budget limits dogpiles on humans without granting immunity:
      // a bot still defends itself against a human who comes within melee range.
      if (!q.bot && d > 135 ** 2) {
        let assigned = 0;
        for (const mate of s.players) if (mate !== p && mate.bot && mate.alive && mate.team === p.team && mate._aiTarget === q.id && dist2(mate, q) < 650 ** 2) assigned++;
        if (assigned >= profile.humanPressure) continue;
      }
      const carrier = s.flags.some(f => f.carrier === q.id);
      const score = Math.sqrt(d) - profile.coordination * (carrier ? 180 : (1 - q.hp / q.maxHp) * 70);
      if (score < priority) { priority = score; distance = d; enemy = q; }
    }
    if (s.mode === 'ctf') {
      const home = flag(s, p.team), away = flag(s, other(p.team));
      const thief = home.carrier ? s.players.find(q => q.id === home.carrier) : null;
      const escort = away.carrier ? s.players.find(q => q.id === away.carrier) : null;
      if (carrying) { target = thief || home; goal = thief ? 'intercept' : 'return'; }
      else if ((thief || home.dropped) && (p.slot % 3 === 0 || dist2(p, thief || home) < 500 ** 2)) {
        target = thief || home; goal = thief ? 'intercept' : 'recover';
      } else if (escort && (p.slot % 3 !== 0 || p.role === 'support')) {
        const side = p.slot % 2 ? 1 : -1;
        target = { x: clamp(escort.x + (p.team === 'custardia' ? 60 : -60), 30, 3170), y: clamp(escort.y + side * 65, 30, 1770) };
        goal = 'escort';
      } else { target = away; goal = 'capture'; }
    } else if (s.mode === 'siege') {
      target = p.slot % 5 === 0 && s.control.owner !== p.team ? s.control : castle(s, other(p.team));
      goal = target === s.control ? 'control' : 'assault';
      const home = castle(s, p.team);
      if (p.role === 'engineer' && home.hp < home.maxHp * (.72 + profile.coordination * .20) && (p.slot % 2 === 0 || home.hp < home.maxHp * .35)) {
        target = home; goal = 'repair';
      }
    }
    if (p.role === 'support' && !carrying && !runner && goal !== 'recover') {
      const injured = s.players.filter(q => q !== p && q.team === p.team && q.alive && q.hp < q.maxHp - 28 && dist2(p, q) < 600 ** 2)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || dist2(p, a) - dist2(p, b))[0];
      if (injured) { target = injured; goal = 'support'; }
    }
    const engage = enemy && distance < (carrying ? 65 : runner || ['repair', 'escort', 'support', 'recover'].includes(goal) ? 150 : p.role === 'ranger' ? 530 : 330) ** 2;
    if (engage && !runner && !carrying && !['repair', 'escort', 'support', 'recover', 'intercept'].includes(goal)) { target = enemy; goal = 'engage'; }
    let dx = target.x - p.x, dy = target.y - p.y, d = Math.hypot(dx, dy) || 1;
    let mx = dx / d, my = dy / d;
    // Objective squads retain flank routes instead of becoming endless centre fights.
    if (!engage && Math.abs(dx) > (runner || carrying ? 420 : 850) && (runner || carrying || Math.abs(p.x - 1600) > 650)) {
      const lane = runner || carrying ? (p.team === 'custardia' ? 260 : 1540) : 430 + (p.slot % 3) * 470;
      my = clamp((lane - p.y) / 230, -1, 1); const length = Math.hypot(mx, my); mx /= length; my /= length;
    }
    const reach = ROLES[p.role].reach;
    const stop = target === s.control ? 70 : goal === 'support' ? 120 : goal === 'escort' ? 35 : target.radius ? target.radius + reach * .7 : target === enemy && p.role === 'ranger' ? 350 : target === enemy ? reach * .68 : 10;
    if (d < stop) { mx = 0; my = 0; }
    if (target === enemy && p.role === 'ranger' && d < 210) { mx = -dx / d; my = -dy / d; }
    const combat = engage ? enemy : target;
    let aimDx = combat.x - p.x, aimDy = combat.y - p.y;
    const aimDistance = Math.hypot(aimDx, aimDy) || 1;
    if (p.role === 'ranger' && engage) {
      const lead = Math.min(.75, .26 + aimDistance / 680) * profile.lead;
      aimDx += number(enemy.vx, 0) * lead; aimDy += number(enemy.vy, 0) * lead;
    }
    let aimAngle = Math.atan2(aimDy, aimDx) + (random(s) * 2 - 1) * profile.aimError * ratingScale;
    const attackThreat = engage && enemy.attack && enemy.attack.phase !== 'recovery' && aimDistance < 150 && facing(enemy, p, 1.5);
    let arrowThreat = null;
    if (profile.coordination >= .4) for (const shot of s.projectiles) {
      if (shot.team === p.team || shot.kind !== 'arrow' || dist2(shot, p) > 220 ** 2) continue;
      const along = (p.x - shot.x) * Math.cos(shot.angle) + (p.y - shot.y) * Math.sin(shot.angle);
      const across = Math.abs((p.x - shot.x) * Math.sin(shot.angle) - (p.y - shot.y) * Math.cos(shot.angle));
      if (along > 0 && across < 40) { arrowThreat = shot; break; }
    }
    const threat = attackThreat || arrowThreat;
    const guard = !!(threat && p.stamina >= 20 && random(s) < profile.guard);
    if (guard && arrowThreat) aimAngle = Math.atan2(arrowThreat.y - p.y, arrowThreat.x - p.x);
    const wantsAttack = engage && aimDistance < (p.role === 'ranger' ? 570 : reach + 18) || target.team && target.maxHp && target.team !== p.team && d < target.radius + reach;
    const opening = engage && (enemy.stun > .2 || enemy.guarding || enemy.attack && enemy.attack.phase === 'recovery');
    const heavy = !!(wantsAttack && !guard && (p.role !== 'ranger' || aimDistance < 80) && random(s) < profile.heavy * (opening ? 1.35 : .65));
    const needsHeal = p.role === 'support' && s.players.some(q => q.team === p.team && q.alive && q.hp < q.maxHp - 25 && dist2(p, q) < 180 ** 2);
    const repair = goal === 'repair' && d < 240;
    const useAbility = !!(p.abilityCooldown <= 0 && (needsHeal || repair || p.role === 'engineer' && (engage && aimDistance < 330 || goal === 'assault' && d < 340) || p.role === 'ranger' && engage || p.role === 'vanguard' && engage && aimDistance < 100) && random(s) < profile.ability);
    let dash = false;
    if (!p.attack && !carrying && p.dashCooldown <= 0 && !guard && random(s) < profile.dash) {
      if (threat && profile.coordination >= .4) {
        // Move across the incoming line, rather than dashing deeper into the attack.
        const sign = p.slot % 2 ? 1 : -1; mx = -Math.sin(aimAngle) * sign; my = Math.cos(aimAngle) * sign; dash = true;
      } else if (engage && aimDistance > 160 && aimDistance < 280 && p.role === 'vanguard') dash = true;
    }
    if (!dash && !guard && target === enemy && profile.coordination >= .7 && p.role !== 'ranger' && d < 160 && !p.attack) {
      const side = p.slot % 2 ? 1 : -1;
      mx += -Math.sin(aimAngle) * side * .35; my += Math.cos(aimAngle) * side * .35;
    }
    const movementLength = Math.hypot(mx, my); if (movementLength > 1) { mx /= movementLength; my /= movementLength; }
    p._intent = goal; p._aiTarget = engage ? enemy.id : null;
    p._ai = { moveX: mx, moveY: my, aimX: Math.cos(aimAngle), aimY: Math.sin(aimAngle),
      attack: !!(wantsAttack && !heavy && !guard && !useAbility), heavy: heavy && !useAbility, guard, dash,
      ability: useAbility };
    return p._ai;
  }
  function movePlayer(s, p, input, dt) {
    p.vx = 0; p.vy = 0; p._abilityRequested = false;
    if (!p.alive) {
      if (input.role) p.role = input.role;
      p.respawn = Math.max(0, p.respawn - dt); if (p.respawn <= 0) spawn(s, p); return;
    }
    p.stun = Math.max(0, p.stun - dt); p.protection = Math.max(0, p.protection - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt); p.abilityCooldown = Math.max(0, p.abilityCooldown - dt);
    if (p.stun > 0) { p.guarding = false; p.dashing = false; p.dashTime = 0; p.attack = null; return; }
    if (!p.attack && Math.hypot(input.aimX || 0, input.aimY || 0) > .05) p.angle = Math.atan2(input.aimY, input.aimX);
    const wasGuard = p.guarding;
    p.guarding = !!input.guard && !p.attack && !p.dashing && p.stamina >= (wasGuard ? .01 : 12);
    p.guardTime = p.guarding ? wasGuard ? p.guardTime + dt : 0 : 0;
    p.stamina = clamp(p.stamina + (p.guarding ? -7 : p.attack ? 3 : 22) * dt, 0, 100);
    if (input.dash && !p.attack && !p.guarding && p.dashCooldown <= 0) {
      p.dashTime = .16; p.dashCooldown = 1.4;
      const len = Math.hypot(input.moveX, input.moveY);
      p.dashX = len > .1 ? input.moveX / len : Math.cos(p.angle); p.dashY = len > .1 ? input.moveY / len : Math.sin(p.angle);
    }
    p.dashing = p.dashTime > 0;
    const carrying = s.flags.some(f => f.carrier === p.id);
    const speed = ROLES[p.role].speed * (carrying ? .88 : 1) * (p.guarding ? .45 : p.attack ? .65 : 1);
    const oldX = p.x, oldY = p.y;
    p.x += (p.dashing ? p.dashX * 560 : input.moveX * speed) * dt;
    p.y += (p.dashing ? p.dashY * 560 : input.moveY * speed) * dt;
    p.dashTime = Math.max(0, p.dashTime - dt);
    p.x = clamp(p.x, 30, s.world.width - 30); p.y = clamp(p.y, 30, s.world.height - 30);
    p.vx = (p.x - oldX) / dt; p.vy = (p.y - oldY) / dt;
    p._abilityRequested = !!input.ability && p.abilityCooldown <= 0 && !p.attack && !p.dashing;
    if (!p._abilityRequested && (input.heavy || input.attack)) startAttack(s, p, !!input.heavy);
  }
  function advanceProjectiles(s, dt) {
    for (const shot of s.projectiles) {
      shot.x += Math.cos(shot.angle) * shot.speed * dt; shot.y += Math.sin(shot.angle) * shot.speed * dt; shot.life -= dt;
      if (shot.kind === 'bomb') {
        if (shot.life <= 0) {
          for (const q of s.players) if (q.alive && q.team !== shot.team && dist2(q, shot) < 120 ** 2) damage(s, q, shot.damage, shot, true);
          const owner = s.players.find(p => p.id === shot.owner);
          if (owner) for (const c of s.castles) if (dist2(c, shot) < (c.radius + 90) ** 2) castleDamage(s, c, 22, owner);
          effect(s, 'blast', shot.x, shot.y, 120, shot.team, .5);
        }
      } else {
        for (const q of s.players) if (q.alive && q.team !== shot.team && !shot.hit.includes(q.id) && dist2(q, shot) < 24 ** 2) {
          shot.hit.push(q.id); damage(s, q, shot.damage, shot, true);
          if (!shot.powered || shot.hit.length >= 2) { shot.life = 0; break; }
        }
        if (shot.life > 0) for (const c of s.castles) if (c.team !== shot.team && dist2(c, shot) < c.radius ** 2) {
          const owner = s.players.find(p => p.id === shot.owner); if (owner) castleDamage(s, c, 6, owner); shot.life = 0; break;
        }
      }
      if (shot.x < 0 || shot.y < 0 || shot.x > s.world.width || shot.y > s.world.height) shot.life = 0;
    }
    s.projectiles = s.projectiles.filter(p => p.life > 0);
  }
  function objectives(s, dt) {
    const control = s.control;
    const counts = { custardia: 0, rice: 0 };
    for (const p of s.players) if (p.alive && dist2(p, control) <= control.radius ** 2) counts[p.team]++;
    const delta = counts.custardia - counts.rice;
    if (delta) control.progress = clamp(control.progress + Math.sign(delta) * dt / 6 * Math.min(3, Math.abs(delta)), -1, 1);
    if (control.progress >= 1) control.owner = 'custardia';
    else if (control.progress <= -1) control.owner = 'rice';
    else if (control.owner === 'custardia' && control.progress < .01 || control.owner === 'rice' && control.progress > -.01) control.owner = null;
    if (s.mode === 'brawl' && control.owner) {
      control.tick += dt; if (control.tick >= 5) { control.tick -= 5; s.scores[control.owner]++; }
    } else control.tick = 0;
    if (s.mode === 'ctf') for (const f of s.flags) {
      if (f.carrier) {
        const p = s.players.find(p => p.id === f.carrier);
        if (!p || !p.alive) { f.carrier = null; f.dropped = true; f.returnTimer = 20; continue; }
        f.x = p.x; f.y = p.y;
        const home = flag(s, p.team);
        if (!home.carrier && !home.dropped && (p.x - home.homeX) ** 2 + (p.y - home.homeY) ** 2 < 65 ** 2) {
          s.scores[p.team]++; p.score += 500; effect(s, 'capture', p.x, p.y, 100, p.team, 1); resetFlag(f);
        }
      } else {
        if (f.dropped) { f.returnTimer -= dt; if (f.returnTimer <= 0) resetFlag(f); }
        const nearby = s.players.filter(p => p.alive && dist2(p, f) < 43 ** 2);
        // A defender touching a dropped flag wins a simultaneous recovery/pickup.
        const defender = nearby.find(p => p.team === f.team);
        if (f.dropped && defender) { defender.score += 75; resetFlag(f); }
        else { const p = nearby.find(p => p.team !== f.team); if (p) { f.carrier = p.id; f.dropped = false; f.returnTimer = 0; p.protection = 0; } }
      }
    }
    if (s.mode === 'siege') {
      const cDown = castle(s, 'custardia').hp <= 0, rDown = castle(s, 'rice').hp <= 0;
      if (cDown || rDown) finish(s, cDown && rDown ? 'draw' : cDown ? 'rice' : 'custardia', 'castle');
    } else {
      const cWon = s.scores.custardia >= s.scoreLimit, rWon = s.scores.rice >= s.scoreLimit;
      if (cWon || rWon) finish(s, cWon && rWon ? 'draw' : cWon ? 'custardia' : 'rice', s.mode === 'ctf' ? 'flags' : 'score');
    }
    if (s.time <= 0) {
      let difference = s.scores.custardia - s.scores.rice;
      if (s.mode === 'siege') difference = castle(s, 'custardia').hp - castle(s, 'rice').hp || difference;
      finish(s, difference === 0 ? 'draw' : difference > 0 ? 'custardia' : 'rice', 'time');
    }
  }
  function separate(s) {
    const ps = s.players;
    for (let i = 0; i < ps.length; i++) if (ps[i].alive) for (let j = i + 1; j < ps.length; j++) if (ps[j].alive) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
      if (d2 >= 28 ** 2) continue;
      const d = Math.sqrt(d2), ux = d > .001 ? dx / d : 1, uy = d > .001 ? dy / d : 0, push = (28 - d) * .32;
      a.x = clamp(a.x - ux * push, 30, s.world.width - 30); b.x = clamp(b.x + ux * push, 30, s.world.width - 30);
      a.y = clamp(a.y - uy * push, 30, s.world.height - 30); b.y = clamp(b.y + uy * push, 30, s.world.height - 30);
    }
  }
  function step(s, delta, inputs) {
    if (!s || s.status !== 'playing') return s;
    let remaining = clamp(number(delta, 0), 0, .1);
    if (!remaining) return s;
    inputs = inputs && typeof inputs === 'object' ? inputs : {};
    const humanInputs = new Map();
    for (const p of s.players) if (!p.bot) humanInputs.set(p.id, cleanInput(Object.hasOwn(inputs, p.humanId) ? inputs[p.humanId] : null));
    while (remaining > 1e-7 && s.status === 'playing') {
      const dt = Math.min(remaining, 1 / 60, s.time); remaining -= dt;
      s.elapsed += dt; s.time = Math.max(0, s.duration - s.elapsed);
      for (const p of s.players) movePlayer(s, p, p.bot ? botInput(s, p, dt) : humanInputs.get(p.id), dt);
      separate(s);
      // Resolve simultaneous contacts together, so roster order cannot cancel the
      // opposing faction's attack before it receives its turn to simulate.
      s._pendingHits = [];
      for (const p of s.players) if (p.alive) { if (p._abilityRequested) ability(s, p); advanceAttack(s, p, dt); }
      advanceProjectiles(s, dt);
      const hits = s._pendingHits; s._pendingHits = null;
      for (const hit of hits) damage(s, hit.target, hit.amount, hit.attacker, hit.directional, hit.extraStun);
      objectives(s, dt);
      for (const e of s.effects) e.life -= dt;
      s.effects = s.effects.filter(e => e.life > 0);
    }
    return s;
  }
  function snapshot(s) {
    return { version: s.version, mode: s.mode, teamSize: s.teamSize, difficulty: s.difficulty, duration: s.duration,
      time: s.time, elapsed: s.elapsed, status: s.status, winner: s.winner, finishReason: s.finishReason,
      scores: { ...s.scores }, scoreLimit: s.scoreLimit,
      world: { width: s.world.width, height: s.world.height, obstacles: [] }, control: { ...s.control },
      players: s.players.map(p => ({ id: p.id, humanId: p.humanId, name: p.name, bot: p.bot, team: p.team, role: p.role, visor: p.visor,
        x: p.x, y: p.y, vx: p.vx, vy: p.vy, angle: p.angle, hp: p.hp, maxHp: p.maxHp, alive: p.alive, respawn: p.respawn,
        stamina: p.stamina, stun: p.stun, protection: p.protection, guarding: p.guarding, dashing: p.dashing,
        abilityCooldown: p.abilityCooldown, dashCooldown: p.dashCooldown, kills: p.kills, deaths: p.deaths, score: p.score,
        attack: p.attack ? { kind: p.attack.kind, phase: p.attack.phase, phaseProgress: p.attack.phaseProgress, progress: p.attack.progress, angle: p.attack.angle,
          elapsed: p.attack.time, windup: SWINGS[p.attack.kind].windup, active: SWINGS[p.attack.kind].active,
          recovery: SWINGS[p.attack.kind].recovery } : null })),
      flags: s.flags.map(f => ({ ...f })), castles: s.castles.map(c => ({ ...c })),
      projectiles: s.projectiles.map(p => ({ id: p.id, team: p.team, x: p.x, y: p.y, angle: p.angle, kind: p.kind, radius: p.radius })),
      effects: s.effects.map(e => ({ ...e })) };
  }
  return Object.freeze({ create, join, leave, step, snapshot, difficulties: DIFFICULTIES, roles: Object.freeze(ROLES), swings: Object.freeze(SWINGS) });
});
