'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),F=require('../game/first-fight.js'),P=require('../game/product-events.js');
test('density comparison changes only total combatants',()=>{
 const a=F.assign('density',()=>0),b=F.assign('density',()=>.999);
 assert.equal(a.totalKnights,4);assert.equal(b.totalKnights,8);assert.deepEqual(a.config,b.config);
 assert.equal(a.config.map,'courtyard');assert.equal(a.config.length,90);assert.equal(a.config.players,1);
});
test('arena comparison changes only map selection; equal duration, bots, density and chaos',()=>{
 const a=F.assign('arena',()=>.499),b=F.assign('arena',()=>.5);
 assert.equal(a.variant,'curated');assert.equal(b.variant,'random');assert.equal(a.totalKnights,b.totalKnights);
 assert.deepEqual({...a.config,map:null},{...b.config,map:null});assert.equal(a.config.map,'courtyard');assert.equal(b.config.map,'random');
});
test('assignment is immutable, restore does not reroll, invalid factors are rejected',()=>{
 const a=F.variant('density','four');assert.ok(Object.isFrozen(a));assert.ok(Object.isFrozen(a.config));
 assert.deepEqual(a,F.variant('density','four'));
 for(const args of [['density','random'],['arena','four'],['unknown','curated']])assert.throws(()=>F.variant(...args));
 for(const n of [-1,1,NaN,Infinity])assert.throws(()=>F.assign('arena',()=>n));
});
function recorder(qa=false){let i=0;const e=P.create({build:'0.3.0-beta.6',qa,storage:null,id:()=> (++i).toString(16).padStart(32,'0')});e.setConsent(true);return e;}
const fields={trialId:'a'.repeat(32),experiment:'density',variant:'four',totalKnights:4,humanCount:1};
test('experiment reports distinguish assignment, terminal outcome and self-report without invented participants',()=>{
 const e=recorder();assert.equal(e.record('experiment_assigned',fields),true);
 assert.equal(e.record('experiment_assigned',fields),false);
 assert.equal(e.record('experiment_outcome',{...fields,outcome:'completed',elapsedMs:90000}),true);
 assert.equal(e.record('experiment_outcome',{...fields,outcome:'abandoned'}),false);
 e.record('experiment_outcome',{...fields,outcome:'recognised'});assert.equal(e.record('experiment_outcome',{...fields,outcome:'not_recognised'}),false);
 const m=e.report().experiments[0];assert.equal(m.assigned,1);assert.equal(m.completed,1);assert.equal(m.abandoned,0);assert.equal(m.recognised,1);assert.equal(m.unobserved,0);
 assert.equal(Object.hasOwn(m,'uniquePlayers'),false);
});
test('orphaned, QA and bot experiment outcomes do not create denominators',()=>{
 const e=recorder();e.record('experiment_outcome',{...fields,outcome:'completed'});assert.equal(e.report().experiments.length,0);
 const q=recorder(true);q.record('experiment_assigned',fields);q.record('experiment_outcome',{...fields,outcome:'completed'});assert.equal(q.report().experiments.length,0);
 const b=recorder();b.record('experiment_assigned',{...fields,humanCount:0,botOnly:true});assert.equal(b.report().experiments.length,0);
});
test('invalid study combinations and arbitrary self-report text are rejected',()=>{
 const e=recorder();for(const changes of [{variant:'random'},{totalKnights:8},{experiment:'private study name'},{trialId:'private identifier'},{outcome:'felt amazing'},{elapsedMs:-1}])assert.equal(e.record('experiment_assigned',{...fields,...changes}),false);
 assert.equal(e.record('experiment_outcome',{...fields}),false);
});

test('continuation requires a later normal offline round, not rematch intent or another trial',()=>{
 const e=recorder();e.record('experiment_assigned',fields);
 const r={...fields,roundId:'b'.repeat(32),format:'arena',humanCount:1};
 e.record('round_started',r);e.record('first_meaningful_action',{...r,action:'move'});
 e.record('experiment_outcome',{...fields,outcome:'completed'});
 e.record('rematch_selected',r);
 e.record('round_started',{...r,roundId:'c'.repeat(32)});
 e.record('round_started',{roundId:'d'.repeat(32),format:'arena',humanCount:1,online:true});
 assert.equal(e.report().experiments[0].normalRoundContinuation,0);
 e.record('round_started',{roundId:'e'.repeat(32),format:'arena',humanCount:1,online:false});
 assert.equal(e.report().experiments[0].normalRoundContinuation,1);
 assert.equal(e.report().experiments[0].firstActionObserved,1);
});
