const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../game/campaign.js'),B=require('../game/bakery-opening.js');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const collision=html.slice(html.indexOf('function collideTiles('),html.indexOf('function update(dt)'));
const api={makeKnight:o=>({r:22,dead:false,falling:0,vx:0,vy:0,fx:{},...o}),redraw(){}};
function scene(kind){
 const c=C.create({storage:null});c.restore(C.normalize({results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true,true,true],attempts:1,best:25}]))}));
 const g={roundId:'community-route',ents:[api.makeKnight({id:0,human:1})],flows:new Map()};
 if(kind==='opening')c.beginPrelude(g,api);else if(kind==='aftermath')c.beginAftermath(g,api);else if(kind==='homecoming')c.beginHomecoming(g,api);else c.begin('puddings',g,api);
 const world={G:g,T:40,OY:80,W:1280,H:800,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),tcol:x=>Math.floor(x/40),trow:y=>Math.floor((y-80)/40),solid:(x,y)=>['#','h','w','x'].includes(g.grid[y]?.[x])};
 vm.runInNewContext(collision,world);return {c,g,world};
}
function reachable(world,start,radius){
 const clear=(x,y)=>{const p={x,y,vx:0,vy:0};world.collideTiles(p,radius,false);return Math.abs(p.x-x)+Math.abs(p.y-y)<1e-7;};
 const queue=[[Math.round(start.x/8)*8,Math.round(start.y/8)*8]],seen=new Set([queue[0].join(',')]);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){
   const nx=x+dx,ny=y+dy,key=nx+','+ny;
   if(nx<62||nx>1218||ny<142||ny>738||seen.has(key)||!clear(nx,ny))continue;
   const actor={x,y,vx:dx*60,vy:dy*60};world.moveInArena(actor,1/60,0,0,radius,false);
   if(Math.abs(actor.x-nx)+Math.abs(actor.y-ny)>1e-7)continue;
   seen.add(key);queue.push([nx,ny]);
  }
 }
 return p=>{if(!clear(p.x,p.y))return false;return queue.some(([x,y])=>{
  if(Math.hypot(x-p.x,y-p.y)>12)return false;
  const actor={x,y,vx:(p.x-x)*60,vy:(p.y-y)*60};world.moveInArena(actor,1/60,0,0,radius,false);
  return Math.hypot(actor.x-p.x,actor.y-p.y)<1e-6;
 });};
}
test('trees preserve full-body routes to every quiet objective, cook and siege station',()=>{
 for(const kind of ['opening','aftermath','homecoming','siege']){
  const {c,g,world}=scene(kind),run=c.run,canReach=reachable(world,run.player,22);
  const targets=[{x:455,y:424},{x:605,y:550},{x:1130,y:500},...(run.staff||[]),...(run.stands||[]),...g.ents];
  if(run.homecoming)targets.push(run.homecoming.bran,run.homecoming.stirling);
  for(const p of targets)assert.ok(canReach(p),`${kind}: full 44px body cannot reach ${p.name||p.label||p.id||'objective'} at ${p.x},${p.y}`);
  if(kind==='siege'){g.ents.slice(1).forEach(e=>e.dead=true);c.tick(.01);for(const p of g.ents.filter(e=>!e.dead))assert.ok(canReach(p),`second wave spawn ${p.x},${p.y}`);}
 }
});
test('planters stop walking and strong impulses using the real tile collision functions',()=>{
 const {g,world}=scene('opening');
 for(const b of B.gardens){
  for(let row=b.r;row<b.r+b.h;row++)for(let col=b.c;col<b.c+b.w;col++)assert.equal(g.grid[row][col],'#');
  const x=b.c*40,y=80+b.r*40,actor={x:x-50,y:y+b.h*20,vx:1200,vy:0};
  world.moveInArena(actor,.2,0,0,19.2,false);
  assert.ok(actor.x<=x-19.2+1e-6,'dash crossed planter');assert.ok(actor.vx<=0,'velocity still enters planter');
 }
});
