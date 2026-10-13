/* One live banner, no backlog. World/HUD tells remain independent of arbitration. */
(function(root){
 'use strict';
 const priorities=Object.freeze({flavour:0,reward:1,objective:2,hazard:3,lastlife:4});
 const eventHazards=new Set(['meteors','custard','blackout','swapparty','mirror','jelly']);
 const mayhemHazards=new Set(['trapdoor','catapult','stampede','gust']);
 function clean(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  if(!Number.isFinite(raw.t)||!Number.isFinite(raw.max)||raw.t<=0||raw.max<=0)return null;
  const max=Math.min(10,raw.max),kind=Object.hasOwn(priorities,raw.kind)?raw.kind:'flavour';
  const key=typeof raw.key==='string'&&/^[a-zA-Z0-9:_-]{1,96}$/.test(raw.key)?raw.key:'legacy';
  return {title:typeof raw.title==='string'?raw.title.slice(0,100):'',sub:typeof raw.sub==='string'?raw.sub.slice(0,240):'',col:typeof raw.col==='string'&&/^#[0-9a-f]{6}$/i.test(raw.col)?raw.col:'#FFD23F',t:Math.min(raw.t,max),max,key,kind};
 }
 function critical(b){return !!b&&b.t>0&&priorities[b.kind]>=priorities.objective;}
 function offer(current,raw){
  const next=clean(raw),live=clean(current);
  if(!next)return {banner:live,accepted:false};
  if(live&&(live.key===next.key||priorities[live.kind]>priorities[next.kind]||critical(live)&&priorities[live.kind]===priorities[next.kind]))return {banner:live,accepted:false};
  return {banner:next,accepted:true};
 }
 function tick(b,dt){if(!b)return null;if(Number.isFinite(dt)&&dt>0)b.t=Math.max(0,b.t-dt);return b.t>0?b:null;}
 // Bounded cue dedupe is only a set of live keys; it never queues messages or sound.
 function cueKeys(limit=32){
  const keys=new Map();
  function prune(clock){for(const [k,end] of keys)if(end<=clock)keys.delete(k);}
  return {admit(key,clock,ttl){prune(clock);if(keys.has(key)||keys.size>=limit)return false;keys.set(key,clock+ttl);return true;},prune,clear(){keys.clear();},get size(){return keys.size;}};
 }
 const api={priorities,clean,critical,offer,tick,cueKeys,duck:(b,enabled=true)=>enabled&&critical(b) ? .35 : 1,eventKind:k=>eventHazards.has(k)?'hazard':k==='boss'?'objective':'flavour',mayhemKind:k=>mayhemHazards.has(k)?'hazard':k==='bounty'?'objective':k==='supply'?'reward':'flavour'};
 if(typeof module==='object'&&module.exports)module.exports=api;root.CKWarnings=api;
})(typeof globalThis!=='undefined'?globalThis:this);
