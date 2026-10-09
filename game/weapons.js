(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CKWeapons = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const MAX_RETURN_LIFE = 1.8;
  const definitions = Object.freeze({
    crossbow: Object.freeze({ name: 'Crossbow', ammo: 4, tip: 'Crossbow: one fast bolt pierces a line of knights. Aim carefully: the reload is slower than a bow. Blocks reflect it.' }),
    croissant: Object.freeze({ name: 'Returning Croissant', ammo: 3, tip: 'Croissant: throw, then reposition as it returns. One hit per enemy. Walls stop it; blocks reflect it.' })
  });
  const ranges = Object.freeze({
    crossbow: Object.freeze({ retreat: 190, approach: 360, attack: 520 }),
    croissant: Object.freeze({ retreat: 100, approach: 230, attack: 340 })
  });
  const known = kind => Object.hasOwn(definitions, kind);
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const level = value => Math.max(1, Math.min(3, Math.floor(finite(value) ? value : 1)));

  // Descriptors only: the existing arena owns ammo consumption, damage,
  // collisions, reflection and snapshots. No saves or actor fields are changed.
  function createShot(actor) {
    if (!actor || !actor.wpn || !known(actor.wpn.kind) || !finite(actor.wpn.ammo) || actor.wpn.ammo <= 0 || ![actor.x, actor.y, actor.face].every(finite)) return null;
    const kind = actor.wpn.kind, lvl = level(actor.wpn.lvl);
    const ca = Math.cos(actor.face), sa = Math.sin(actor.face);
    const speed = kind === 'crossbow' ? 1000 + 40 * (lvl - 1) : 560 + 20 * lvl;
    const projectile = {
      k: kind === 'crossbow' ? 'bolt' : 'croissant',
      x: actor.x + ca * 26, y: actor.y + sa * 26,
      vx: ca * speed, vy: sa * speed, owner: actor,
      life: kind === 'crossbow' ? 0.82 : MAX_RETURN_LIFE,
      r: kind === 'crossbow' ? 6 : 12, pierce: true, hit: [], lvl
    };
    if (kind === 'croissant') Object.assign(projectile, {
      returnAge: 0, returnPhaseAge: 0, returnOwner: actor, returning: false
    });
    return {
      projectiles: [projectile],
      cooldown: kind === 'crossbow' ? 0.95 - (lvl - 1) * 0.08 : 0.9 - (lvl - 1) * 0.04,
      recoil: kind === 'crossbow' ? 65 : 0,
      sound: kind === 'crossbow' ? 'shoot' : 'swing'
    };
  }

  function expire(projectile) { projectile.life = 0; return false; }

  // Call before the arena's normal position update. The total age never resets,
  // even if its normal reflection handler extends p.life or changes p.owner.
  function updateProjectile(projectile, dt) {
    if (!projectile || projectile.k !== 'croissant') return true;
    if (!finite(dt) || dt < 0 || ![projectile.x, projectile.y, projectile.vx, projectile.vy].every(finite)) return expire(projectile);
    const owner = projectile.owner;
    if (!owner || owner.dead || owner.falling > 0 || ![owner.x, owner.y].every(finite)) return expire(projectile);
    projectile.returnAge = (finite(projectile.returnAge) ? projectile.returnAge : 0) + dt;
    if (projectile.returnAge >= MAX_RETURN_LIFE) return expire(projectile);
    if (projectile.returnOwner !== owner) {
      // Reflection belongs to the defender. Give the reversed shot an outbound
      // leg before it returns to that defender; retain its original hit history.
      projectile.returnOwner = owner;
      projectile.returnPhaseAge = 0;
      projectile.returning = false;
    }
    projectile.returnPhaseAge = (finite(projectile.returnPhaseAge) ? projectile.returnPhaseAge : 0) + dt;
    const outwardTime = 0.43 + level(projectile.lvl) * 0.02;
    if (projectile.returnPhaseAge >= outwardTime) projectile.returning = true;
    if (projectile.returning) {
      const dx = owner.x - projectile.x, dy = owner.y - projectile.y;
      const distance = Math.hypot(dx, dy);
      const speed = 700;
      if (distance <= Math.max(22, speed * dt)) return expire(projectile);
      projectile.vx = dx / distance * speed;
      projectile.vy = dy / distance * speed;
    }
    // No hit-list reset: piercing hits and reflections never allow a second hit
    // against the same entity during this throw.
    return true;
  }

  function pastry(ctx, size) {
    ctx.fillStyle = '#F6BD54'; ctx.strokeStyle = '#37233F'; ctx.lineWidth = Math.max(1.5, size * 0.11);
    ctx.beginPath(); ctx.moveTo(size, -size * 0.57);
    ctx.bezierCurveTo(-size * 0.8, -size * 1.3, -size * 1.05, size * 1.1, size * 0.86, size * 0.65);
    ctx.bezierCurveTo(size * 0.02, size * 0.32, -size * 0.09, -size * 0.22, size, -size * 0.57);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#A76E32'; ctx.lineWidth = Math.max(1.2, size * 0.08);
    for (const y of [-0.38, 0, 0.38]) {
      ctx.beginPath(); ctx.moveTo(-size * 0.64, y * size); ctx.lineTo(-size * 0.14, (y + 0.12) * size); ctx.stroke();
    }
  }

  // Local-coordinate drawings; caller positions/rotates them at the hand or pad.
  // Every style and transform change is enclosed in save/restore.
  function drawWeapon(ctx, kind, size = 22, lvl = 1) {
    if (!known(kind)) return false;
    ctx.save();
    try {
      if (kind === 'croissant') { pastry(ctx, size * 0.65); return true; }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#37233F'; ctx.lineWidth = size * 0.36;
      ctx.beginPath(); ctx.moveTo(-size * 0.7, 0); ctx.lineTo(size * 0.8, 0); ctx.stroke();
      ctx.strokeStyle = '#B77843'; ctx.lineWidth = size * 0.23; ctx.stroke();
      ctx.strokeStyle = '#37233F'; ctx.lineWidth = size * 0.24;
      ctx.beginPath(); ctx.moveTo(size * 0.4, -size * 0.8); ctx.quadraticCurveTo(size * 1.02, 0, size * 0.4, size * 0.8); ctx.stroke();
      ctx.strokeStyle = level(lvl) > 1 ? '#F3CB73' : '#CED9E4'; ctx.lineWidth = size * 0.13; ctx.stroke();
      ctx.strokeStyle = '#FFF3DC'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(size * 0.4, -size * 0.8); ctx.lineTo(-size * 0.14, 0); ctx.lineTo(size * 0.4, size * 0.8); ctx.stroke();
      ctx.strokeStyle = '#E8EDF3'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-size * 0.05, 0); ctx.lineTo(size * 1.05, 0); ctx.stroke();
      return true;
    } finally { ctx.restore(); }
  }

  function drawProjectile(ctx, projectile, time = 0) {
    if (!projectile || !['bolt', 'croissant'].includes(projectile.k)) return false;
    ctx.save();
    try {
      if (projectile.k === 'croissant') {
        ctx.rotate((finite(time) ? time : 0) * 12);
        pastry(ctx, finite(projectile.r) ? projectile.r : 12);
      } else {
        ctx.lineCap = 'round'; ctx.strokeStyle = '#37233F'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.strokeStyle = '#C9D9E7'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#E9F4FF'; ctx.strokeStyle = '#37233F'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(7, -5); ctx.lineTo(7, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#76C9CE'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-12, -5); ctx.lineTo(-5, 0); ctx.lineTo(-12, 5); ctx.stroke();
      }
      return true;
    } finally { ctx.restore(); }
  }

  return Object.freeze({
    definitions, createShot, updateProjectile, drawWeapon, drawProjectile,
    isRanged: known, ai: kind => known(kind) ? ranges[kind] : null,
    tip: kind => known(kind) ? definitions[kind].tip : null,
    maxReturnLife: MAX_RETURN_LIFE
  });
});
