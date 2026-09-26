// Player personas for the QA harness. Each one drives the human knight (slot 1) through the
// real key state, so the game sees them exactly like a person on WASD/Space/Shift/E.
// Injected into index.html?qa=1 by run.js. Everything here is plain browser JS.
(()=>{
const K=CK.keys, W=1280, H=800, T=40, OY=80;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function setMove(dx,dy){ K.KeyW=dy<-.3; K.KeyS=dy>.3; K.KeyA=dx<-.3; K.KeyD=dx>.3; }
function clearKeys(){ for(const k of ['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','KeyE']) K[k]=false; }
function nearestEnemy(G,me){ let b=null,bd=1e9; for(const o of G.ents){ if(o===me||o.dead||o.falling>0||(G.mode==='teams'&&o.team===me.team))continue; const d=dist(o,me); if(d<bd){bd=d;b=o} } return {e:b,d:bd}; }
function nearestThing(G,me){ let b=null,bd=1e9; for(const p of G.pickups){ const d=dist(p,me); if(d<bd){bd=d;b=p} } for(const p of G.pads){ if(!p.item)continue; const d=dist(p,me); if(d<bd){bd=d;b=p} } return {p:b,d:bd}; }
// crude steering with stuck detection, so personas can get round walls without pathfinding
function steerTo(me,tx,ty,st){
 const dx=tx-me.x, dy=ty-me.y, d=Math.hypot(dx,dy)||1;
 if(st.stuckT>0){ st.stuckT-=1/60; setMove(st.sx,st.sy); return; }
 if(st.last&&Math.hypot(me.x-st.last.x,me.y-st.last.y)<.4*60/60){ st.still=(st.still||0)+1; } else st.still=0;
 st.last={x:me.x,y:me.y};
 if(st.still>45){ const a=Math.random()*Math.PI*2; st.sx=Math.cos(a); st.sy=Math.sin(a); st.stuckT=.5; st.still=0; }
 setMove(dx/d,dy/d);
}
const P={
 rusher:{ tick(G,me,st){ const {e,d}=nearestEnemy(G,me); if(!e){clearKeys();return} steerTo(me,e.x,e.y,st); K.Space=d<80; K.ShiftLeft=d>200&&d<360&&me.dashCd<=0; K.KeyE=false; } },
 camper:{ tick(G,me,st){ if(!st.home) st.home={x:me.x,y:me.y}; const {e,d}=nearestEnemy(G,me); const dh=dist(me,st.home);
   if(dh>60) steerTo(me,st.home.x,st.home.y,st); else clearKeys(); K.KeyE=!!e&&d<120&&d>60; K.Space=!!e&&d<=70; } },
 collector:{ tick(G,me,st){ const {p,d}=nearestThing(G,me); const en=nearestEnemy(G,me);
   if(p&&d<600){ steerTo(me,p.x,p.y,st); K.Space=en.e&&en.d<70; K.ShiftLeft=d>200&&me.dashCd<=0; }
   else if(en.e){ steerTo(me,en.e.x,en.e.y,st); K.Space=en.d<80; } else clearKeys(); K.KeyE=false; } },
 pacifist:{ tick(G,me,st){ const {e,d}=nearestEnemy(G,me); if(!e){clearKeys();return}
   const ax=me.x+(me.x-e.x), ay=me.y+(me.y-e.y); steerTo(me,Math.max(80,Math.min(W-80,ax)),Math.max(OY+80,Math.min(H-80,ay)),st);
   K.Space=false; K.ShiftLeft=d<140&&me.dashCd<=0; K.KeyE=d<90; } },
 fuzzer:{ tick(G,me,st){ st.t=(st.t||0)-1; if(st.t<=0){ st.t=5+Math.random()*40; clearKeys(); for(const k of ['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','KeyE']) K[k]=Math.random()<.35; } } },
 idle:{ tick(){ clearKeys(); } },
 // a competent player: rush with block reads and dodge dashes, grab weapons on the way
 pro:{ tick(G,me,st){ const {e,d}=nearestEnemy(G,me); const th=nearestThing(G,me);
   if(!e){clearKeys();return}
   if(th.p&&th.d<220&&d>150){ steerTo(me,th.p.x,th.p.y,st); K.Space=false; K.KeyE=false; K.ShiftLeft=th.d>150&&me.dashCd<=0; return; }
   const threat=e.swing>0&&d<120;
   if(threat&&me.dashCd<=0&&Math.random()<.5){ K.ShiftLeft=true; const dx=me.x-e.x,dy=me.y-e.y,l=Math.hypot(dx,dy)||1; setMove(-dy/l,dx/l); K.Space=false; K.KeyE=false; return; }
   K.ShiftLeft=false; K.KeyE=threat&&me.dashCd>0;
   if(me.wpn){ steerTo(me,e.x,e.y,st); if(d<220){ setMove(0,0); } K.Space=d<420&&Math.abs(Math.atan2(e.y-me.y,e.x-me.x)-me.face)<.5; return; }
   steerTo(me,e.x,e.y,st); K.Space=d<78&&!K.KeyE; } },
};
window.QA={
 personas:Object.keys(P),
 // run one full match with a persona in the human slot; returns a compact result object
 runMatch(opts){
  const {persona='rusher',map='courtyard',diff='spicy',mode='ffa',humans=1,seconds=180,dtScale=1}=opts;
  clearKeys(); const errors=[]; const onerr=ev=>errors.push(String(ev.message||ev.reason||ev).slice(0,300));
  addEventListener('error',onerr); addEventListener('unhandledrejection',onerr);
  const G=CK.begin({map,diff,mode,humans}); G.time=seconds;
  const me=G.ents.find(e=>e.human===1), st={}; const agent=P[persona]||P.idle;
  const frames=Math.ceil(seconds*60), t0=performance.now(); let evT={};
  for(let f=0;f<frames;f++){
   if(me){ if(me.dead) clearKeys(); else agent.tick(G,me,st); }
   try{ CK.update(1/60); }catch(e){ errors.push('update: '+(e.stack||e).toString().slice(0,300)); break; }
   if(G.over) break;
  }
  removeEventListener('error',onerr); removeEventListener('unhandledrejection',onerr);
  const ms=performance.now()-t0;
  const ents=G.ents.map(e=>({id:e.id,name:e.name,human:e.human,score:e.score,deaths:e.deaths,team:e.team}));
  return {persona,map,diff,mode,humans,seconds,simMs:Math.round(ms),errors,ents,stats:G.stats,log:G.log,over:G.over,timeLeft:G.time};
 }
};
})();
