const {test}=require('node:test');
const assert=require('node:assert/strict');
const S=require('../game/story-scenes.js');
const C=require('../game/campaign.js');

function canvas(width=1000,height=560){
 const calls=[],poses=[];let depth=0;
 const ctx=new Proxy({}, {get(target,key){
  if(key in target)return target[key];
  return (...args)=>{
   for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),`${String(key)} received ${value}`);
   if(key==='save')depth++;if(key==='restore')assert.ok(--depth>=0,'balanced drawing state');
   if(key==='ellipse')assert.ok(args[2]>=0&&args[3]>=0,'ellipse radii must be nonnegative');
   calls.push([key,...args]);
   if(key==='createLinearGradient'||key==='createRadialGradient')return {addColorStop(){}};
  };
 }});
 return {width,height,getContext:()=>ctx,calls,poses,depth:()=>depth,drawKnight(_ctx,pose){for(const k of ['x','y','scale','face','walk'])assert.ok(Number.isFinite(pose[k]),`${k} pose must be finite`);poses.push(pose);}};
}

test('each campaign encounter has a complete, nonoverlapping intro and outro subtitle track',()=>{
 assert.deepEqual(Object.keys(S.scenes),C.nodes.map(n=>n.id));
 for(const id of Object.keys(S.scenes))for(const phase of Object.keys(S.scenes[id])){
  const b=S.scenes[id][phase];assert.ok(b.duration>=6&&b.duration<=24);
  let end=0;for(const cue of b.cues){assert.equal(cue.start,end);assert.ok(cue.end>cue.start);assert.ok(cue.speaker&&cue.text);assert.equal(S.captions(id,phase,cue.start),cue);end=cue.end;}
  assert.equal(end,S.duration(id,phase));assert.equal(S.captions(id,phase,end),null);
 }
 assert.equal(S.duration('unknown'),0);assert.equal(S.captions('unknown'),null);
});

test('all scenes render finite operations, valid knight poses and balanced context state at every half second',()=>{
 for(const id of Object.keys(S.scenes))for(const phase of Object.keys(S.scenes[id]))for(let t=0;t<=S.duration(id,phase);t+=.5){
  const c=canvas();assert.equal(S.render(c,t,{id,phase,drawKnight:c.drawKnight}),true,`${id}/${phase}/${t}`);
  assert.ok(c.poses.length,`${id} must show the actual game knights`);assert.equal(c.depth(),0);
  assert.ok(!c.calls.some(x=>['fillText','strokeText'].includes(x[0])),'no stage text competes with subtitles');
 }
});

test('time is deterministic, reduced motion holds the same tableau within a subtitle beat',()=>{
 const a=canvas(),b=canvas();S.render(a,13,{id:'banquet'});S.render(b,13,{id:'banquet'});assert.deepEqual(a.calls,b.calls);
 const c=canvas(),d=canvas();S.render(c,12,{id:'banquet',reducedMotion:true});S.render(d,14,{id:'banquet',reducedMotion:true});assert.deepEqual(c.calls,d.calls);
 const before=canvas(),after=canvas();S.render(before,6,{id:'banquet'});S.render(after,17,{id:'banquet'});assert.notDeepEqual(before.calls,after.calls,'the theft changes the stage');
});

test('portrait, wide and invalid canvas inputs do not produce invalid drawing coordinates',()=>{
 for(const size of [[390,250],[390,600],[2000,400]])for(const id of Object.keys(S.scenes)){
  const c=canvas(...size);assert.equal(S.render(c,8,{id}),true);assert.equal(c.depth(),0);
 }
 assert.equal(S.render(null),false);assert.equal(S.render(canvas(0,0)),false);
 assert.equal(S.render(canvas(),NaN,{id:'missing'}),true);
});
test('Rind alliance theatre recognizes the crossing guard and leaves the bowl threat unresolved',()=>{
 const crossing=canvas(),rescue=canvas();S.render(crossing,8,{id:'guard',phase:'outro',drawKnight:crossing.drawKnight});S.render(rescue,8,{id:'rind',phase:'outro',drawKnight:rescue.drawKnight});
 assert.ok(crossing.poses.some(p=>p.guardName===C.crossingGuard.name));assert.ok(rescue.poses.some(p=>p.guardName===C.crossingGuard.name));assert.ok(rescue.poses.some(p=>p.role==='marshal'&&!p.attack&&!p.block));
 assert.ok(S.scenes.rind.outro.cues.some(c=>c.speaker===C.crossingGuard.name));const text=S.scenes.rind.outro.cues.map(c=>c.text).join(' ');assert.match(text,/winch side.*still aimed at our ovens.*open that channel/);assert.doesNotMatch(text,/chapter ends|bakery is safe|saved the bakery/i);
});
