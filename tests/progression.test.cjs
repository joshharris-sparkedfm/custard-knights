const {test}=require('node:test'),assert=require('node:assert/strict'),P=require('../game/progression.js');
const row=(extra={})=>({id:0,mode:'ffa',won:false,coins:3,parries:0,lava:0,ringouts:0,...extra});
test('migrates a valid legacy save without removing earned rewards',()=>{
 const p=P.normalize({earned:300,matches:9,wins:4,ch:{parry10:12},unlocked:['blade:fish','blade:fish']});
 assert.equal(p.earned,300);assert.equal(p.version,1);assert.equal(p.ch.parry10,10);assert.deepEqual(p.unlocked,['blade:fish']);
});
test('malformed saves normalize safely',()=>{
 for(const raw of [null,[],1,'bad',{earned:-5,matches:Infinity,wins:100,ch:null,unlocked:{},receipts:7},{earned:'300',ch:{lava5:NaN}}]){
  const p=P.normalize(raw);assert.equal(p.earned,0);assert.equal(p.wins,0);assert.ok(Array.isArray(p.unlocked));
 }
});
test('same round cannot grant coins or challenges twice after save reload',()=>{
 const first=P.apply({},'round-1',[row({won:true,parries:5})]);
 const second=P.apply(JSON.parse(JSON.stringify(first.progress)),'round-1',[row({won:true,parries:5})]);
 assert.equal(second.applied,false);assert.deepEqual(first.progress,second.progress);
});
test('guest result grants the combat feats only recorded by host',()=>{
 const r=P.apply({},'guest-round',[row({parries:10,lava:5,ringouts:3})]);
 assert.deepEqual(r.progress.unlocked.sort(),['blade:candy','blade:fish','cape:checker']);
});
test('shared couch save grants one completion and best coins with each seat contributing',()=>{
 const r=P.apply({},'party',[row({coins:8,parries:4,ringouts:2}),row({id:1,coins:10,won:true,parries:6,ringouts:2})]);
 assert.equal(r.progress.matches,1);assert.equal(r.progress.wins,1);assert.equal(r.progress.earned,10);
 assert.equal(r.progress.ch.parry10,10);assert.equal(r.progress.ch.ringout3,2);
});
test('mode wins unlock the matching challenge only',()=>{
 const r=P.apply({},'race',[row({mode:'race',won:true})]);
 assert.ok(r.progress.unlocked.includes('chick:golden'));assert.ok(!r.progress.unlocked.includes('cape:stars'));
});
test('empty and malformed results cannot count as matches',()=>{
 for(const rows of [[],null,[null],[row({coins:Infinity})],[row({coins:-1})],[row({mode:'unknown'})]])assert.equal(P.apply({},'bad',rows).applied,false);
});

test('duplicate knight results cannot multiply challenges',()=>{
 assert.equal(P.apply({},'duplicate',[row({parries:5}),row({parries:5})]).applied,false);
});
test('invalid knight identities and combat counters reject the whole award',()=>{
 for(const extra of [{id:-1},{id:8},{id:'0'},{parries:Infinity},{parries:-1},{ringouts:1.5},{lava:'5'}])assert.equal(P.apply({},'invalid',[row(extra)]).applied,false);
 assert.equal(P.apply({},'mixed',[row(),row({id:1,mode:'race'})]).applied,false);
});
