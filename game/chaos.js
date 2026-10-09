(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CKChaos = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const ARENA_MODES = Object.freeze(['ffa', 'teams', 'lks', 'kotp', 'heist', 'flags', 'hotpie']);
  const RARE = Object.freeze({
    nae: Object.freeze({ kind: 'nae', title: 'OH NAE NAE!', duration: 12, weapon: 'ak47', ammo: 30, music: 'oh-nae-nae' }),
    mcginley: Object.freeze({ kind: 'mcginley', title: 'THE POWER OF McGINLEY', duration: 10, interval: 1.25, maxStrikes: 8, range: 300, damage: 1 })
  });
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  function normalize(value) {
    if (value === 'simple') return 'simple';
    if (value === 'insane' || value === 'fast' || value === 'unhinged') return 'insane';
    return 'normal';
  }
  function settings(value, mode) {
    const name = normalize(value), enabled = name !== 'simple';
    const lifeMode = mode === 'lks' || mode === 'hotpie';
    return Object.freeze({ name, initial: name === 'insane' ? 0.33 : 0,
      rate: (name === 'insane' ? 45 : 115) / (lifeMode ? 2 : 1),
      escalation: enabled, mayhem: enabled, globalEvents: enabled, specialPickups: enabled,
      rareEvents: enabled, max: enabled ? 1 : 0 });
  }
  // Both clock growth and KO bonuses must pass here, so Simple cannot escalate.
  function progress(current, dt, policy, knockouts = 0) {
    if (!policy || !policy.escalation) return 0;
    const elapsed = finite(dt) && dt > 0 ? dt : 0;
    const count = finite(knockouts) && knockouts > 0 ? Math.floor(knockouts) : 0;
    return clamp((finite(current) ? current : 0) + elapsed / policy.rate + count * 0.025, 0, policy.max);
  }
  function eligible(options) {
    return !!options && options.authoritative === true && options.demo !== true &&
      !options.campaign && !options.ranked && !options.faction &&
      ARENA_MODES.includes(options.mode) && normalize(options.chaosSpeed) !== 'simple' &&
      finite(options.length) && options.length >= 40;
  }
  function sample(rng) {
    const value = rng();
    if (!finite(value) || value < 0 || value >= 1) throw new RangeError('Random sample must be in [0, 1)');
    return value;
  }
  // Create exactly once per arena round on its authority, after context is known.
  // One partitioned roll gives each event exactly 1%, with no overlap or retries.
  function createMatch(options, rng = Math.random) {
    if (!eligible(options)) return Object.freeze({ kind: null, done: true, reason: 'ineligible' });
    const roll = sample(rng), kind = roll < 0.01 ? 'nae' : roll < 0.02 ? 'mcginley' : null;
    if (!kind) return Object.freeze({ kind: null, done: true, reason: 'not_selected' });
    const deadline = options.length - 15, latest = Math.min(75, options.length - 20);
    return Object.freeze({ kind, at: 18 + sample(rng) * (latest - 18), deadline, done: false });
  }
  function recipient(actor) {
    return !!actor && (typeof actor.id === 'string' || finite(actor.id)) && !!actor.human &&
      !actor.dead && finite(actor.falling) && actor.falling <= 0 && !actor.eliminated && !actor.chick && !actor.chicken;
  }
  // Pure transition. Keep returned state on G. Clients only consume snapshots.
  // A busy arena or temporarily absent human delays the SAME plan, never rerolls it.
  function advance(state, context, rng = Math.random) {
    if (!state || state.done) return { state, event: null };
    if (!context || context.authoritative !== true || !finite(context.clock)) return { state, event: null };
    if (context.over || context.clock >= state.deadline) return {
      state: Object.freeze({ ...state, done: true, reason: 'expired' }), event: null
    };
    if (context.clock < state.at || context.busy) return { state, event: null };
    const candidates = Array.isArray(context.players) ? context.players.filter(recipient) : [];
    if (!candidates.length) return { state, event: null };
    const owner = candidates[Math.floor(sample(rng) * candidates.length)];
    return {
      state: Object.freeze({ ...state, done: true, reason: 'activated' }),
      event: Object.freeze({ ...RARE[state.kind], ownerId: owner.id,
        startedAt: context.clock, endsAt: context.clock + RARE[state.kind].duration })
    };
  }
  return Object.freeze({ normalize, settings, progress, eligible, createMatch, advance, rare: RARE });
});
