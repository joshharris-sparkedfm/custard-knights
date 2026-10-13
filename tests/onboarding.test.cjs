'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const onboarding=require('../game/onboarding.js');
const storage=entries=>({getItem:k=>Object.hasOwn(entries,k)?entries[k]:null});
test('only a readable, entirely fresh profile receives automatic setup',()=>{
 assert.equal(onboarding.shouldOffer(storage({})),true);
 for(const key of ['ck-played','ck-cfg','ck-settings','ck-progress','ck-collection','ck-profile','ck-profile2','ck-profile4','ck-name','ck-taught','ck-hits','ck-campaign-v1',onboarding.KEY])assert.equal(onboarding.shouldOffer(storage({[key]:'malformed'})),false,key);
 assert.equal(onboarding.shouldOffer({getItem(){throw Error('blocked');}}),false);
});
test('movement requires both real displacement and deliberate movement',()=>{
 const a=onboarding.create(100,200);
 for(let i=0;i<100;i++){a.action('swing');a.action('guard');a.action('dash');a.action('fire');a.aim(1,'mouse');}
 assert.equal(a.state().stage,'move');
 a.move(155,200,{mx:0,my:0});assert.equal(a.state().stage,'move');
 a.move(154,200,{mx:1,my:0});assert.equal(a.state().stage,'move');
 a.move(155,200,{mx:1,my:0});assert.equal(a.state().stage,'swing');
});
test('observed actions must be performed in their contextual order',()=>{
 const a=onboarding.create(0,0);a.move(60,0,{mx:1});
 a.action('dash');a.action('guard');assert.equal(a.state().stage,'swing');
 a.action('swing');assert.equal(a.state().stage,'guard');
 a.action('swing');assert.equal(a.state().stage,'guard');
 a.action('guard');a.action('dash');assert.equal(a.state().stage,'ranged');
 a.action('fire');assert.equal(a.state().completed,false);
});
for(const source of ['mouse','pad','move'])test(`${source}: a changed real aim followed by a shot completes practice`,()=>{
 const a=onboarding.create(0,0);a.move(60,0,{mx:1});a.action('swing');a.action('guard');a.action('dash');
 a.aim(0,source);a.aim(.05,source);a.action('fire');assert.equal(a.state().completed,false);
 a.aim(.5,source);assert.equal(a.state().aimed,true);assert.equal(a.state().completed,false);
 a.action('fire');assert.equal(a.state().completed,true);
 a.action('fire');assert.equal(a.state().stage,'complete');
 assert.equal(Object.isFrozen(a.state()),true);
});
test('nonfinite, unrelated and wraparound jitter never counts as changed aim',()=>{
 const a=onboarding.create(0,0);a.move(60,0,{mx:1});a.action('swing');a.action('guard');a.action('dash');
 a.aim(NaN,'mouse');a.aim(Infinity,'pad');a.aim(0,'unowned');a.aim(Math.PI-.01,'pad');a.aim(-Math.PI+.01,'pad');
 a.action('fire');assert.equal(a.state().completed,false);assert.equal(a.state().aimed,false);
 a.aim(0,'pad');a.action('fire');assert.equal(a.state().completed,true);
});
test('retry creates a fresh lesson and cannot carry completed actions',()=>{
 const a=onboarding.create(0,0);a.move(60,0,{mx:1});a.action('swing');a.action('guard');a.action('dash');a.aim(0,'mouse');a.aim(1,'mouse');a.action('fire');
 const b=onboarding.create(200,300);assert.equal(b.state().stage,'move');assert.equal(b.state().aimed,false);assert.equal(b.state().completed,false);
});
