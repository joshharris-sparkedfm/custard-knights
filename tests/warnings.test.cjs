'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const W=require('../game/warnings.js'),Mixer=require('../audio/warning-mixer.js');
const banner=(kind,key,extra={})=>({title:key,sub:'Act now',col:'#FF5A4E',t:2.6,max:2.6,kind,key,...extra});

test('hazards/objectives/last life survive lower notifications; equal critical first wins without a queue',()=>{
 for(const kind of ['objective','hazard','lastlife']){
  const first=banner(kind,'first');
  for(const other of ['flavour','reward',kind]){
   const result=W.offer(first,banner(other,'second'));
   assert.equal(result.accepted,false);assert.equal(result.banner.key,'first');
  }
  assert.equal(W.tick(first,3),null);
  assert.equal(W.offer(first,banner('flavour','fresh')).banner.key,'fresh');
 }
 assert.equal(W.offer(banner('objective','hill'),banner('hazard','meteor')).accepted,true);
 assert.equal(W.offer(banner('hazard','meteor'),banner('lastlife','last')).accepted,true);
 assert.equal(W.offer(banner('reward','egg'),banner('reward','pie')).accepted,true);
});

test('coalescing authored keys does not refresh duration or duplicate a live warning cue',()=>{
 let current=banner('hazard','meteor');current=W.tick(current,1.1);
 const same=W.offer(current,banner('hazard','meteor'));
 assert.equal(same.accepted,false);assert.equal(same.banner.t,1.5);
 const keys=W.cueKeys();assert.equal(keys.admit('meteor',0,2.6),true);
 assert.equal(keys.admit('meteor',1.1,2.6),false);
 assert.equal(keys.admit('trapdoor',1.1,1.4),true,'separate hazard can cue even when its banner loses');
 keys.prune(2.6);assert.equal(keys.size,0);
 assert.equal(keys.admit('meteor',3,2.6),true);
 keys.clear();assert.equal(keys.size,0);
});

test('cue dedupe stays bounded, expires silently and never evicts a live key to replay it',()=>{
 const keys=W.cueKeys();for(let i=0;i<32;i++)assert.equal(keys.admit('hazard:'+i,0,3),true);
 assert.equal(keys.admit('overflow',1,2),false);assert.equal(keys.size,32);
 assert.equal(keys.admit('hazard:0',2,3),false);
 keys.prune(3);assert.equal(keys.size,0);assert.equal(keys.admit('fresh',4,2),true);
});

test('guest banner metadata copies bounded fields, constrains expiry and does not carry a cue',()=>{
 const raw=banner('hazard','meteor',{title:'a'.repeat(1000),sub:'b'.repeat(1000),t:90,max:40,col:'url(evil)',cue:'alarm',priority:999,extra:{unbounded:true}});
 const clean=W.clean(raw);assert.deepEqual(Object.keys(clean),['title','sub','col','t','max','key','kind']);
 assert.equal(clean.title.length,100);assert.equal(clean.sub.length,240);assert.equal(clean.t,10);assert.equal(clean.max,10);assert.equal(clean.col,'#FFD23F');
 assert.equal(W.clean(banner('__proto__','bad key')).kind,'flavour');
 assert.equal(W.clean(banner('hazard','bad key')).key,'legacy');
 for(const bad of [null,[],{},banner('hazard','bad',{t:NaN}),banner('hazard','bad',{max:Infinity}),banner('hazard','bad',{t:-1})])assert.equal(W.clean(bad),null);
 raw.title='mutated';assert.equal(clean.title.length,100);
});

test('explicit real hazards and objectives are distinguished from pickup jokes and supply rewards',()=>{
 for(const kind of ['meteors','custard','blackout','swapparty','mirror','jelly'])assert.equal(W.eventKind(kind),'hazard');
 for(const kind of ['trapdoor','catapult','stampede','gust'])assert.equal(W.mayhemKind(kind),'hazard');
 assert.equal(W.eventKind('boss'),'objective');assert.equal(W.mayhemKind('bounty'),'objective');
 assert.equal(W.eventKind('chicken'),'flavour');assert.equal(W.eventKind('disco'),'flavour');
 assert.equal(W.mayhemKind('supply'),'reward');assert.equal(W.mayhemKind('slowmo'),'flavour');
 const warning=banner('hazard','meteor');assert.equal(.23*W.duck(warning),.0805);
 assert.equal(W.duck(warning,false),1);assert.equal(W.duck(W.tick(warning,3)),1);
 assert.equal(W.duck(banner('reward','steve')),1);
});

function graph(){const destination={kind:'destination'},nodes=[];return {destination,currentTime:10,nodes,createGain(){const n={connections:[],gain:{value:1,setValueAtTime(value){this.value=value;}},connect(to){this.connections.push(to);return to;},disconnect(){this.disconnected=true;}};nodes.push(n);return n;}};}
function source(){return {disconnects:0,stops:0,disconnect(){this.disconnects++;},stop(){this.stops++;this.onended();}};}
test('ordinary saturation leaves warning slots under64, all voices clean up exactly once',()=>{
 const context=graph(),m=Mixer.create(context),ordinary=[];
 assert.equal(m.bus.connections[0],context.destination);
 for(let i=0;i<56;i++){assert.equal(m.admit(),true);const s=source();ordinary.push(s);m.track(s,[]);}
 assert.equal(m.admit(),false);
 const warnings=[];for(let i=0;i<8;i++){assert.equal(m.admit(true),true);const s=source(),node=context.createGain();warnings.push({s,node});m.track(s,[node],true);}
 assert.equal(m.admit(true),false);assert.equal(m.stats().active,64);assert.equal(m.stats().droppedOrdinary,1);assert.equal(m.stats().droppedWarning,1);
 m.stopWarnings();assert.equal(m.stats().active,56);assert.equal(m.stats().warning,0);
 for(const {s,node} of warnings){assert.equal(s.stops,1);assert.equal(node.disconnected,true);s.onended();assert.equal(s.disconnects,1);}
 for(const s of ordinary)s.onended();assert.equal(m.stats().active,0);assert.equal(m.admit(),true);
});

test('shared local bus applies SFX volume and mute to already active graphs',()=>{
 const m=Mixer.create(graph());m.settings(.23);assert.equal(m.bus.gain.value,.23);
 m.settings(.23,true);assert.equal(m.bus.gain.value,0);
 m.settings(.23,false);assert.equal(m.bus.gain.value,.23);
 m.settings(0);assert.equal(m.bus.gain.value,0);
});
