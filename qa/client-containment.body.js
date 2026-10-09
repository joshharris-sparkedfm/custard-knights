(()=>{
 const cases=[],solid=t=>['#','h','w','x'].includes(t),eps=1e-6;
 const point=e=>({x:e.x,y:e.y,tx:e.tx,ty:e.ty});
 const same=(a,b)=>Object.keys(a).every(k=>Math.abs(a[k]-b[k])<eps);
 function invalid(g,x,y,rt){
  if(![x,y].every(Number.isFinite))return 'nonfinite';
  if(x<40+rt-eps||x>1240-rt+eps||y<120+rt-eps||y>760-rt+eps)return 'outside-radius-bound';
  for(let r=Math.floor((y-rt-80)/40);r<=Math.floor((y+rt-80)/40);r++)for(let c=Math.floor((x-rt)/40);c<=Math.floor((x+rt)/40);c++){
   if(!solid(g.grid[r]?.[c]))continue;
   const nx=Math.max(c*40,Math.min((c+1)*40,x)),ny=Math.max(80+r*40,Math.min(80+(r+1)*40,y));
   if(Math.hypot(x-nx,y-ny)<rt-eps)return 'solid-overlap';
  }
  return null;
 }
 function placement(g,edge){
  if(edge==='wall'){
   for(let r=2;r<16;r++)for(let c=2;c<30;c++)if(solid(g.grid[r][c])){
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(g.grid[r+dy]?.[c+dx]==='.'){
     const p={x:(c+dx)*40+20,y:80+(r+dy)*40+20,dx:-dx,dy:-dy};
     if(!invalid(g,p.x,p.y,17.6))return p;
    }
   }
   throw Error('No internal-wall fixture on '+g.mapKey);
  }
  return {x:edge==='left'?60:edge==='right'?1220:640,y:edge==='top'?140:edge==='bottom'?740:440,dx:edge==='left'?-1:edge==='right'?1:0,dy:edge==='top'?-1:edge==='bottom'?1:0};
 }
 function run(mode,map,edge,speed,ts,delayedFrame=false){
  CK.NET.role=null;CK.begin({humans:1,map,mode});CK.freeze(true);
  const g=CK.G(),e=g.ents[0],p=placement(g,edge),failures=[];
  Object.assign(e,{x:p.x,y:p.y,vx:p.dx*speed,vy:p.dy*speed,dead:false,falling:0,protect:0,inv:0,fx:{}});g.ts=ts;
  const packet=CK.snapshot(),before=point(e),gameplay=JSON.stringify([g.roundId,e.hp,e.score,e.deaths,e.lives,e.dead,e.falling]),rt=17.6;
  CK.NET.role='client';CK.NET.me=0;CK.clientRecv(packet);
  let firstEscape=null,atCap=null,maxDistance=0;
  const check=frame=>{
   for(const [label,x,y] of [['render',e.x,e.y],['target',e.tx,e.ty]]){const reason=invalid(g,x,y,rt);if(reason)firstEscape??={frame,label,reason,x,y};}
   if(e.vx!==p.dx*speed||e.vy!==p.dy*speed)failures.push('authoritative-velocity-changed');
   if(JSON.stringify([g.roundId,e.hp,e.score,e.deaths,e.lives,e.dead,e.falling])!==gameplay)failures.push('gameplay-changed');
   maxDistance=Math.max(maxDistance,Math.hypot(e.tx-before.x,e.ty-before.y));
  };
  if(delayedFrame){CK.clientTick(.1,1);check(1);atCap=point(e);if(Math.abs(g.predictionAge-.15)>eps)failures.push('delayed-frame-budget');}
  for(let frame=1;frame<=180;frame++){
   CK.clientTick(1/60);check(frame);
   if(frame===12)atCap??=point(e);
   if(frame>12&&!same(atCap,point(e)))failures.push('movement-after-cap');
  }
  const afterStall=point(e);
  if(maxDistance>speed*.15*ts+eps)failures.push('excess-prediction-distance');
  // Wrong round and incomplete/nonfinite snapshots cannot buy another budget.
  CK.clientRecv({...packet,roundId:'obsolete-round'});CK.clientTick(1/60);
  if(!same(afterStall,point(e))||g.predictionAge!==.15)failures.push('wrong-round-reset');
  const malformed=structuredClone(packet);malformed.e[0][0]=NaN;CK.clientRecv(malformed);CK.clientTick(1/60);
  if(!same(afterStall,point(e))||g.predictionAge!==.15)failures.push('invalid-packet-reset');
  CK.clientRecv({...packet,e:packet.e.slice(1)});CK.clientTick(1/60);
  if(!same(afterStall,point(e))||g.predictionAge!==.15)failures.push('incomplete-packet-reset');
  const stationary=structuredClone(packet);stationary.e[0][2]=stationary.e[0][3]=0;CK.clientRecv(stationary);
  if(g.predictionAge!==0)failures.push('valid-packet-no-reset');
  for(let i=0;i<12;i++)CK.clientTick(1/60);
  const recoveryError=Math.hypot(e.x-before.x,e.y-before.y);
  if(recoveryError>eps)failures.push('stationary-recovery-error');
  CK.clientRecv(packet);CK.clientTick(1/60);
  const resumedDistance=Math.hypot(e.tx-before.x,e.ty-before.y);
  if(resumedDistance<=eps||g.predictionAge<=0||g.predictionAge>=.15)failures.push('prediction-did-not-resume');
  // Matching duplicate packets retain existing protocol semantics, but restart
  // from packet coordinates rather than adding another journey to the old target.
  for(let duplicate=0;duplicate<2;duplicate++){
   CK.clientRecv(packet);for(let i=0;i<12;i++)CK.clientTick(1/60);check(180+duplicate);
   if(Math.hypot(e.tx-atCap.tx,e.ty-atCap.ty)>eps||g.predictionAge!==.15)failures.push('duplicate-packet-drift');
  }
  cases.push({mode,map,edge,speed,ts,delayedFrame,escaped:!!firstEscape,firstEscape,failures:[...new Set(failures)],before,atCap,afterStall,maxDistance,recoveryError,resumedDistance});
 }
 for(const mode of Object.keys(CK.MODES))for(const map of Object.keys(CK.MAPS))for(const edge of ['left','right','top','bottom','wall'])for(const speed of [235,2400])for(const ts of [1,.45])run(mode,map,edge,speed,ts);
 for(const ts of [1,.45])run('ffa','courtyard','left',235,ts,true);
 CK.NET.role=null;CK.freeze(true);
 return {cases,method:'960 mode/map/edge/speed/slow-motion cases plus2 delayed-animation-frame cases. Real clientRecv and clientTick; valid snapshot,3s packet stall, rejected packets, valid stationary recovery and renewed prediction. Isolated browser; no peer service.'};
})()
