'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const Weapons = require('../game/weapons.js');
const knight = (kind, extra = {}) => ({ id: 1, x: 100, y: 100, face: 0, dead: false, wpn: { kind, lvl: 1, ammo: 3 }, ...extra });
function advance(p, dt = 1 / 60) {
  const active = Weapons.updateProjectile(p, dt);
  if (active) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  return active && p.life > 0;
}

test('new pickups have distinct ranged tradeoffs without changing existing weapons or actor state', () => {
  assert.deepEqual(Object.keys(Weapons.definitions), ['crossbow', 'croissant']);
  const actor = knight('crossbow'), before = JSON.stringify(actor), shot = Weapons.createShot(actor);
  assert.equal(JSON.stringify(actor), before);
  assert.equal(shot.projectiles.length, 1);
  assert.equal(shot.projectiles[0].k, 'bolt');
  assert.equal(shot.projectiles[0].pierce, true);
  assert.equal(shot.projectiles[0].owner, actor);
  assert.ok(shot.cooldown > 0.7 && shot.projectiles[0].vx > 820);
  assert.equal(Weapons.createShot(knight('bow')), null);
  assert.equal(Weapons.isRanged('bow'), false);
  assert.equal(Weapons.ai('crossbow').approach > Weapons.ai('croissant').approach, true);
  assert.equal(Weapons.definitions.crossbow.ammo, 4);
  assert.equal(Weapons.definitions.croissant.ammo, 3);
});

test('returning croissant travels out then returns to and is caught by a stationary owner', () => {
  const actor = knight('croissant'), p = Weapons.createShot(actor).projectiles[0];
  let furthest = p.x, turned = false, frames = 0;
  while (advance(p) && frames++ < 200) { furthest = Math.max(furthest, p.x); if (p.returning) turned = true; }
  assert.ok(furthest > actor.x + 240 && furthest < actor.x + 320);
  assert.equal(turned, true);
  assert.equal(p.life, 0);
  assert.ok(p.returnAge < Weapons.maxReturnLife);
  assert.ok(Math.hypot(p.x - actor.x, p.y - actor.y) <= 35);
});

test('return path follows a moving owner, never resets existing per-enemy hit history', () => {
  const actor = knight('croissant'), p = Weapons.createShot(actor).projectiles[0];
  p.hit.push(7);
  for (let i = 0; i < 32; i++) advance(p);
  actor.y += 180;
  assert.equal(Weapons.updateProjectile(p, 1 / 60), true);
  assert.ok(p.returning && p.vx < 0 && p.vy > 0);
  assert.deepEqual(p.hit, [7]);
  assert.ok(Math.abs(Math.hypot(p.vx, p.vy) - 700) < 0.0001);
});

test('reflection changes return ownership without replenishing lifespan or clearing hit history', () => {
  const actor = knight('croissant'), p = Weapons.createShot(actor).projectiles[0];
  for (let i = 0; i < 18; i++) advance(p);
  const priorAge = p.returnAge;
  const defender = { id: 2, x: p.x + 30, y: p.y, dead: false };
  p.owner = defender; p.vx = -p.vx; p.vy = -p.vy; p.hit.push(3);
  assert.equal(advance(p), true);
  assert.equal(p.returnOwner, defender);
  assert.equal(p.returning, false);
  assert.ok(p.returnAge > priorAge);
  for (let i = 0; i < 30 && p.life > 0; i++) advance(p);
  assert.ok(p.returning && p.vx > 0);
  assert.deepEqual(p.hit, [3]);
  // Repeated reflectors cannot exploit the arena's minimum reflected life.
  for (let i = 0; i < 200 && p.life > 0; i++) {
    p.life = 99;
    p.owner = { id: i + 10, x: 10000, y: 10000, dead: false };
    advance(p);
  }
  assert.equal(p.life, 0);
  assert.ok(p.returnAge >= Weapons.maxReturnLife && p.returnAge < Weapons.maxReturnLife + 0.02);
});

test('owner loss and malformed motion expire safely without NaN velocities', () => {
  for (const ownerChange of [{ dead: true }, { falling: 0.5 }, { x: NaN }, { y: Infinity }]) {
    const actor = knight('croissant'), p = Weapons.createShot(actor).projectiles[0];
    Object.assign(actor, ownerChange);
    assert.equal(Weapons.updateProjectile(p, 1 / 60), false);
    assert.equal(p.life, 0);
    assert.ok(Number.isFinite(p.vx) && Number.isFinite(p.vy));
  }
  const p = Weapons.createShot(knight('croissant')).projectiles[0];
  p.owner = null;
  assert.equal(Weapons.updateProjectile(p, 1 / 60), false);
  assert.equal(Weapons.createShot(knight('croissant', { face: NaN })), null);
  assert.equal(Weapons.createShot(knight('croissant', { wpn: { kind: 'croissant', ammo: 0 } })), null);
  assert.equal(Weapons.createShot(knight('croissant', { wpn: { kind: 'croissant', ammo: NaN } })), null);
});

test('upgrades remain bounded, while unrelated arena projectiles pass through unchanged', () => {
  for (const kind of ['crossbow', 'croissant']) for (const lvl of [-10, 1, 2, 3, 999, NaN]) {
    const p = Weapons.createShot(knight(kind, { wpn: { kind, lvl, ammo: 4 } }));
    assert.ok(p.cooldown >= 0.7 && p.cooldown <= 1);
    assert.ok(p.projectiles[0].life <= Weapons.maxReturnLife);
    assert.ok(Number.isFinite(p.projectiles[0].vx));
  }
  const legacy = { k: 'arrow', vx: 820, vy: 0, life: 1.1 }, copy = { ...legacy };
  assert.equal(Weapons.updateProjectile(legacy, 1 / 60), true);
  assert.deepEqual(legacy, copy);
});

test('AK47 is event-only with fixed rapid single shots and no actor mutation', () => {
  assert.deepEqual(Object.keys(Weapons.definitions), ['crossbow', 'croissant']);
  assert.deepEqual(Object.keys(Weapons.eventDefinitions), ['ak47']);
  assert.ok(Object.isFrozen(Weapons.eventDefinitions.ak47));
  assert.equal(Weapons.eventDefinitions.ak47.ammo, 30);
  assert.equal(Weapons.isRanged('ak47'), true);
  assert.ok(Weapons.tip('ak47').includes('30 rounds'));
  assert.equal(Weapons.ai('ak47').attack, 560);
  const actor = knight('ak47', { face: Math.PI / 2, wpn: { kind: 'ak47', lvl: 999, ammo: 30 } });
  const before = JSON.stringify(actor), shot = Weapons.createShot(actor), p = shot.projectiles[0];
  assert.equal(JSON.stringify(actor), before);
  assert.equal(shot.projectiles.length, 1);
  assert.equal(shot.cooldown, 0.12);
  assert.equal(shot.recoil, 24);
  assert.equal(p.k, 'bullet');
  assert.equal(p.owner, actor);
  assert.equal(p.lvl, 1);
  assert.equal(p.pierce, false);
  assert.equal(p.life, 0.65);
  assert.equal(p.r, 4);
  assert.ok(Math.abs(Math.hypot(p.vx, p.vy) - 1100) < 0.0001);
  assert.ok(Math.abs(p.x - actor.x) < 0.0001 && p.y === actor.y + 30);
  assert.deepEqual(p.hit, []);
});

test('AK47 refuses missing, nonfinite, fractional and empty ammo without consuming valid ammo', () => {
  for (const ammo of [undefined, null, '30', NaN, Infinity, -1, 0, 0.5]) {
    assert.equal(Weapons.createShot(knight('ak47', { wpn: { kind: 'ak47', lvl: 1, ammo } })), null);
  }
  const actor = knight('ak47', { wpn: { kind: 'ak47', lvl: 1, ammo: 1 } });
  assert.ok(Weapons.createShot(actor));
  assert.equal(actor.wpn.ammo, 1);
});

test('bullets retain reflected ownership but expire within their original flight budget', () => {
  const p = Weapons.createShot(knight('ak47')).projectiles[0];
  for (let i = 0; i < 10; i++) advance(p);
  const defender = knight('bow', { id: 2 });
  p.owner = defender; p.vx = -p.vx; p.vy = -p.vy; p.life = 0.8;
  assert.equal(Weapons.updateProjectile(p, 1 / 60), true);
  assert.equal(p.owner, defender);
  assert.ok(p.vx < 0);
  let frames = 0;
  while (p.life > 0 && frames++ < 100) { p.life = 0.8; advance(p); }
  assert.equal(p.life, 0);
  assert.ok(p.bulletAge >= 0.65 && p.bulletAge < 0.67);
  const malformed = Weapons.createShot(knight('ak47')).projectiles[0];
  assert.equal(Weapons.updateProjectile(malformed, NaN), false);
  assert.equal(malformed.life, 0);
});

test('event weapon and bullet drawing restore caller styles, including on drawing failure', () => {
  const original = { fillStyle: 'purple', strokeStyle: 'orange', lineWidth: 9, lineCap: 'butt', lineJoin: 'miter' };
  const stack = [], ctx = { ...original, save() { stack.push(Object.fromEntries(Object.keys(original).map(k => [k, this[k]]))); }, restore() { Object.assign(this, stack.pop()); } };
  for (const key of ['beginPath', 'moveTo', 'lineTo', 'closePath', 'fill', 'stroke', 'quadraticCurveTo', 'fillRect', 'strokeRect']) ctx[key] = () => {};
  for (const draw of [() => Weapons.drawWeapon(ctx, 'ak47'), () => Weapons.drawProjectile(ctx, { k: 'bullet' })]) {
    assert.equal(draw(), true);
    assert.deepEqual(Object.fromEntries(Object.keys(original).map(k => [k, ctx[k]])), original);
    assert.equal(stack.length, 0);
  }
  ctx.stroke = () => { throw Error('canvas failure'); };
  assert.throws(() => Weapons.drawWeapon(ctx, 'ak47'), /canvas failure/);
  assert.deepEqual(Object.fromEntries(Object.keys(original).map(k => [k, ctx[k]])), original);
  assert.equal(stack.length, 0);
});
