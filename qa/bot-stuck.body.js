// Injected by qa/bot-stuck.cjs. Defines window.STUCK(opts): runs one bots-only match with a seeded
// Math.random, samples every bot twice a second and records "stuck" episodes: a bot that is alive,
// not stunned/falling/dashing/respawning, has somewhere to be (goal, target or wander point more than
// 1.5 tiles away), is not brawling, and stays inside a box smaller than one tile for 3 seconds while
// getting no closer to where it wants to go.
window.STUCK=function(o){
 const {map,mode,size='classic',seed=1,seconds=90,diff='medium'}=o;
 const realRandom=Math.random;let s=seed>>>0||1;
 Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 try{
  const G=CK.begin({map,mode,arenaSize:size,humans:0,diff,chaosSpeed:'normal'});G.time=seconds+5;
  const geo=CK.arenaGeometry(),T=geo.T,OY=geo.OY,COLS=G.grid[0].length,ROWS=G.grid.length,SOLID=new Set(['#','h','w','x']);
  const tc=x=>Math.floor(x/T),tr=y=>Math.floor((y-OY)/T),tile=(c,r)=>r<0||c<0||r>=ROWS||c>=COLS?'#':G.grid[r][c];
  const passable=(c,r)=>{const t=tile(c,r);return !SOLID.has(t)&&t!=='o'&&t!=='L';};
  let falls=0,lavaFrames=0;const fallCauses={},fallLog=[];const bots=G.ents.filter(e=>!e.human),hist=new Map(bots.map(e=>[e,[]])),open=new Map(),episodes=[];let eligibleSamples=0,frames=0;
  const goalOf=e=>{const ai=e.ai;
   if(ai.goal==='race'&&G.cps)return{kind:'race',x:G.cps[e.cp].x,y:G.cps[e.cp].y,near:30};
   if(ai.goal==='peck')return{kind:'peck',x:ai.wx,y:ai.wy,near:40};
   // Fleeing has no destination; it only counts as wanting to move while the threat is close.
   if(ai.goal==='run'){const o=G.ev&&G.ev.owner;return{kind:'run',x:null,y:null,threat:o?Math.hypot(o.x-e.x,o.y-e.y):1e9};}
   if(ai.goal==='go')return{kind:'go',x:ai.gx,y:ai.gy,near:30};
   const Tg=ai.target;
   if(Tg&&!Tg.dead&&!(Tg.falling>0)){ if(ai.flee>0)return{kind:'flee',x:null,y:null,threat:Math.hypot(Tg.x-e.x,Tg.y-e.y)}; return{kind:e.wpn?'chase-'+e.wpn.kind:'chase',x:Tg.x,y:Tg.y,near:e.wpn?520:130}; }
   return{kind:'wander',x:ai.wx,y:ai.wy,near:40};};
  const nbr=(c,r)=>{let out='';for(let dr=-1;dr<=1;dr++){for(let dc=-1;dc<=1;dc++)out+=tile(c+dc,r+dr);out+=dr<1?'/':'';}return out;};
  const frameCount=Math.ceil(seconds*60);
  let simMs=0;
  for(let f=0;f<frameCount&&!G.over;f++){
   const u0=performance.now();CK.update(1/60);simMs+=performance.now()-u0;frames++;
   for(const e of bots){const fell=e.falling>0;if(fell&&!e._wasFalling){falls++;const g=goalOf(e).kind,cause=e.lastHit&&G.clock-e.lastHit.t<1.2?'knocked':e.springCd>0?'spring':e._prevTile==='~'||(G.ev&&G.ev.kind==='custard')?'slid':'walked';fallCauses[cause+':'+g]=(fallCauses[cause+':'+g]||0)+1;if(o.fallLog&&cause!=='knocked'&&fallLog.length<60){const gg=goalOf(e);fallLog.push({cause,goal:g,t:+G.clock.toFixed(2),bot:e.id,x:Math.round(e.x),y:Math.round(e.y),c:tc(e.x),r:tr(e.y+4),vx:Math.round(e.vx/.15),vy:Math.round(e.vy/.15),gx:gg.x===null?null:Math.round(gg.x),gy:gg.y===null?null:Math.round(gg.y),pre:e.ai._pre&&[+e.ai._pre.mx.toFixed(2),+e.ai._pre.my.toFixed(2)],post:e.ai._post&&[+e.ai._post.mx.toFixed(2),+e.ai._post.my.toFixed(2)],ev:G.ev?G.ev.kind:null,mh:G.mayhem?G.mayhem.kind:null,swing:e.swing>0,charge:e.charge>0});}}e._wasFalling=fell;if(!fell)e._prevTile=tile(tc(e.x),tr(e.y+4));if(!e.dead&&!fell&&tile(tc(e.x),tr(e.y+4))==='L')lavaFrames++;}
   if(o.trace&&f%6===5)(o.traceOut=o.traceOut||[]).push(G.clock.toFixed(2)+':'+G.ents.map(e=>e.x.toFixed(1)+','+e.y.toFixed(1)).join(';')+'|'+(G.ev?G.ev.kind:'')+'|'+(G.mayhem?G.mayhem.kind:'')+'|'+(G.rareEvent?G.rareEvent.kind:'')+'|'+G.pickups.length);
   if(f%30!==29)continue;
   for(const e of bots){
    const g=goalOf(e),foeNear=G.ents.some(q=>q!==e&&!q.dead&&!(q.falling>0)&&(!e.team||q.team!==e.team)&&Math.hypot(q.x-e.x,q.y-e.y)<90);
    const eligible=!e.dead&&!(e.falling>0)&&!(e.stun>0)&&!(e.slip>0)&&!(e.dashT>0)&&G.clock-(e.spawnAt||0)>1.2&&!(G.ev&&G.ev.kind==='swapparty');
    const gd=g.x===null||g.x===undefined?null:Math.hypot(g.x-e.x,g.y-e.y),intent=eligible&&(gd===null?(g.threat===undefined||g.threat<260):gd>Math.max(g.near||0,T*1.5));
    if(eligible)eligibleSamples++;
    const h=hist.get(e);h.push({x:e.x,y:e.y,ok:eligible&&intent&&!foeNear,gd});if(h.length>6)h.shift();
    let stuck=false;
    if(h.length===6&&h.every(p=>p.ok)){const xs=h.map(p=>p.x),ys=h.map(p=>p.y),box=Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
     const closer=h[0].gd!==null&&gd!==null?h[0].gd-gd:0;stuck=box<T&&closer<T*.5;}
    const ep=open.get(e);
    if(stuck&&!ep){const c=tc(e.x),r=tr(e.y),gc=g.x===null?null:tc(g.x),gr=g.y===null?null:tr(g.y);
     const rec={map,mode,size,seed,t:+G.clock.toFixed(1),bot:e.id,x:Math.round(e.x),y:Math.round(e.y),c,r,tile:tile(c,r),nbr:nbr(c,r),goal:g.kind,gx:g.x===null?null:Math.round(g.x),gy:g.y===null?null:Math.round(g.y),
      goalTile:gc===null?null:tile(gc,gr),goalPassable:gc===null?null:passable(gc,gr),goalDist:gd===null?null:Math.round(gd),ev:G.ev?G.ev.kind:null,mayhem:G.mayhem?G.mayhem.kind:null,
      chick:!!e.chick,giant:!!(e.fx&&e.fx.giant),steve:!!(e.fx&&e.fx.steve),hold:!!e.ai.hold,dur:3};
     episodes.push(rec);open.set(e,rec);}
    else if(stuck&&ep)ep.dur+=.5;
    else if(!stuck&&ep)open.delete(e);
   }
  }
  const kos=G.log.filter(l=>l.k==='ko');
  return {trace:o.traceOut,map,mode,size,seed,clock:+G.clock.toFixed(1),over:G.over,botSeconds:eligibleSamples/2,falls,lavaSeconds:+(lavaFrames/60).toFixed(1),pitKOs:kos.filter(l=>l.src==='pit').length,selfPitKOs:kos.filter(l=>l.src==='pit'&&l.a<0).length,lavaKOs:kos.filter(l=>l.src==='lava').length,kos:kos.length,simMs:Math.round(simMs),fallCauses,fallLog,episodes};
 }finally{Math.random=realRandom;}
};
0;
