'use strict';
const test = require('node:test'), a = require('node:assert/strict');
const Chaos = require('../game/chaos.js');
const opts = extra => ({ authoritative: true, mode: 'ffa', length: 180, chaosSpeed: 'normal', ...extra });
const human = (id, extra) => ({ id, human: 1, dead: false, falling: 0, ...extra });
const context = extra => ({ authoritative: true, clock: 30, players: [human(1)], ...extra });
function samples(...values) { let calls = 0; const rng = () => { a.ok(calls < values.length, 'unexpected random reroll'); return values[calls++]; }; rng.calls = () => calls; return rng; }

test('saved speed names migrate and Normal retains existing clock and lives-mode pacing', () => {
  for (const value of ['fast', 'unhinged', 'insane']) a.equal(Chaos.normalize(value), 'insane');
  for (const value of [null, '__proto__', 'normal', {}, undefined]) a.equal(Chaos.normalize(value), 'normal');
  a.equal(Chaos.settings('normal', 'ffa').initial, 0);
  a.equal(Chaos.settings('normal', 'ffa').rate, 115);
  a.equal(Chaos.settings('normal', 'lks').rate, 57.5);
  a.equal(Chaos.settings('normal', 'hotpie').rate, 57.5);
  a.equal(Chaos.settings('insane', 'ffa').initial, .33);
  a.equal(Chaos.settings('insane', 'ffa').rate, 45);
});

test('Simple opts out of escalating events even with KOs while Insane stays capped', () => {
  const simple = Chaos.settings('simple', 'ffa');
  for (const key of ['escalation', 'mayhem', 'globalEvents', 'specialPickups', 'rareEvents']) a.equal(simple[key], false);
  a.equal(Chaos.progress(.9, 300, simple, 100), 0);
  a.equal(Chaos.progress(.33, 300, Chaos.settings('insane', 'ffa'), 100), 1);
  a.equal(Chaos.progress(0, 0, Chaos.settings('normal', 'ffa'), 1), .025);
});

test('ineligible modes and contexts never consume a rare-event roll', () => {
  const rng = samples();
  for (const extra of [{chaosSpeed:'simple'}, {demo:true}, {campaign:{}}, {ranked:true}, {faction:true}, {authoritative:false}, {mode:'race'}, {mode:'brawl'}, {mode:'unknown'}, {length:20}]) {
    a.equal(Chaos.createMatch(opts(extra), rng).done, true);
    a.equal(Chaos.createMatch(opts(extra), rng).kind, null);
  }
  a.equal(rng.calls(), 0);
});

test('one partitioned per-match roll gives exactly 1 percent each without overlap', () => {
  const counts = { nae: 0, mcginley: 0, none: 0 };
  for (let i = 0; i < 10000; i++) {
    const state = Chaos.createMatch(opts(), samples((i + .5) / 10000, .5));
    counts[state.kind || 'none']++;
  }
  a.deepEqual(counts, { nae: 100, mcginley: 100, none: 9800 });
  a.equal(Chaos.createMatch(opts(), samples(.01, 0)).kind, 'mcginley');
  a.equal(Chaos.createMatch(opts(), samples(.02)).kind, null);
});

test('scheduled event chooses a single living human, emits once, and mutates no actors', () => {
  const state = Chaos.createMatch(opts(), samples(0, 0));
  const players = [human(0,{human:0}), human(1,{dead:true}), human(2,{falling:1}), human(3,{eliminated:true}), human(6,{chick:true}), human(4), human(5)];
  const before = JSON.stringify(players), rng = samples(.999);
  const result = Chaos.advance(state, context({players}), rng);
  a.equal(result.event.ownerId, 5); a.equal(result.event.weapon, 'ak47');
  a.equal(result.event.ammo, 30); a.equal(result.event.endsAt, 42);
  a.equal(JSON.stringify(players), before); a.equal(state.done, false);
  a.equal(Chaos.advance(result.state, context(), samples()).event, null);
  a.equal(rng.calls(), 1); a.ok(Object.isFrozen(result.event));
});

test('busy periods and absent recipients delay only the original plan until its deadline', () => {
  const state = Chaos.createMatch(opts({length:90}), samples(.015, 0));
  for (const extra of [{clock:1}, {busy:true}, {players:[]}, {authoritative:false}]) {
    const result = Chaos.advance(state, context(extra), samples());
    a.equal(result.state, state); a.equal(result.event, null);
  }
  const result = Chaos.advance(state, context(), samples(0));
  a.equal(result.event.kind, 'mcginley'); a.equal(result.event.maxStrikes, 8);
  a.equal(result.event.interval * result.event.maxStrikes, result.event.duration);
  a.equal(Chaos.advance(state, context({clock:75}), samples()).state.reason, 'expired');
  a.equal(Chaos.advance(state, context({over:true}), samples()).event, null);
});

test('every eligible arena has bounded scheduling with no late-match event overflow', () => {
  for (const mode of ['ffa','teams','lks','kotp','heist','flags','hotpie']) {
    for (const length of [40,90,180,300]) {
      const state = Chaos.createMatch(opts({mode,length}), samples(0,.999));
      a.ok(state.at >= 18 && state.at <= Math.min(75,length-20));
      a.ok(state.deadline + Chaos.rare.nae.duration <= length);
    }
  }
  a.throws(() => Chaos.createMatch(opts(), samples(NaN)), RangeError);
});
