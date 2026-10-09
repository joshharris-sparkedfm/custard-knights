(()=>{
 const cases=[];
 for(const mode of Object.keys(CK.MODES))for(const map of Object.keys(CK.MAPS))for(const edge of ['left','right','top','bottom'])for(const empowered of [false,true]){
  for(const key of Object.keys(CK.keys))delete CK.keys[key];
  CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);CK.begin({humans:2,map,mode});CK.freeze(true);
  const g=CK.G();g.ents=g.ents.slice(0,2);g.pickups=[];g.pads=[];g.spawnT=999;g.mayhem=null;g.ev=null;
  const [victim,attacker]=g.ents,dx=edge==='left'?-1:edge==='right'?1:0,dy=edge==='top'?-1:edge==='bottom'?1:0;
  Object.assign(victim,{x:edge==='left'?80:edge==='right'?1200:edge==='top'||edge==='bottom'?60:640,y:edge==='top'?160:edge==='bottom'?720:140,vx:0,vy:0,hp:3,protect:0,inv:0,hitLock:0,stun:0,face:Math.atan2(dy,dx),fx:{}});
  Object.assign(attacker,{x:640,y:440,vx:0,vy:0,fx:empowered?{bouncy:10,giant:10}:{},riposte:empowered?1:0});
  if(empowered)g.ev={kind:'jelly',owner:attacker,t:10};
  const key=dx<0?'KeyA':dx>0?'KeyD':dy<0?'KeyW':'KeyS';CK.keys[key]=true;CK.keys.KeyG=true;
  for(let i=0;i<8;i++)CK.update(1/60);
  delete CK.keys[key];delete CK.keys.KeyG;
  const before={x:victim.x,y:victim.y,dashT:victim.dashT};
  CK.hurt(victim,attacker,1,{dx,dy,kb:820,src:'heavy'});
  const impulse={vx:victim.vx,vy:victim.vy};let escaped=false,firstEscape=null;
  for(let i=0;i<180;i++){CK.update(1/60);const bad=!Number.isFinite(victim.x)||!Number.isFinite(victim.y)||victim.x<40||victim.x>1240||victim.y<120||victim.y>760;if(bad){escaped=true;firstEscape??={frame:i,x:victim.x,y:victim.y};}}
  cases.push({mode,map,edge,empowered,before,impulse,escaped,firstEscape,final:{x:victim.x,y:victim.y,dead:victim.dead,falling:victim.falling}});
 }
 // Regression fixtures use the real update path, including its post-pair pass.
 // Keep hazards/timers dormant so containment failures cannot be hidden by a KO.
 function regression(name,map,positions,bouncy=false){
  for(const key of Object.keys(CK.keys))delete CK.keys[key];
  CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);CK.begin({humans:2,map,mode:'ffa'});CK.freeze(true);
  const g=CK.G();g.ents=g.ents.slice(0,positions.length);g.pickups=[];g.pads=[];g.spawnT=999;g.mayhem=null;g.mayhemAt=999;g.ev=null;g.norrAt=999;g.steveDone=true;
  g.ents.forEach((e,i)=>Object.assign(e,{x:positions[i].x,y:positions[i].y,vx:0,vy:0,hp:99,protect:999,inv:999,hitLock:0,stun:0,dashT:0,falling:0,dead:false,fx:{},...positions[i]}));
  if(bouncy)g.ev={kind:'jelly',owner:g.ents[0],t:10,max:10};
  const before=g.ents.map(e=>({x:e.x,y:e.y,vx:e.vx,vy:e.vy}));
  let escaped=false,firstEscape=null;
  function invalid(e){
   const size=(e.fx.giant?1.65:1)*(e.fx.steve?1.3:1)*(e.fx.norr?1.3:1),rt=Math.min(e.r*size*.8,40*.48),eps=1e-7;
   if(![e.x,e.y,e.vx,e.vy].every(Number.isFinite))return 'nonfinite';
   if(e.x<40+rt-eps||e.x>1240-rt+eps||e.y<120+rt-eps||e.y>760-rt+eps)return 'outside-radius-bound';
   // Check the full collision circle, not just its centre or the outer walls.
   const c0=Math.floor((e.x-rt)/40),c1=Math.floor((e.x+rt)/40),r0=Math.floor((e.y-rt-80)/40),r1=Math.floor((e.y+rt-80)/40);
   for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
    if(!['#','h','w','x'].includes(g.grid[r]?.[c]))continue;
    const nx=Math.max(c*40,Math.min((c+1)*40,e.x)),ny=Math.max(80+r*40,Math.min(80+(r+1)*40,e.y));
    if(Math.hypot(e.x-nx,e.y-ny)<rt-eps)return 'solid-overlap';
   }
   return null;
  }
  for(let frame=0;frame<90;frame++){
   CK.update(1/60);
   for(const e of g.ents){const reason=invalid(e);if(reason){escaped=true;firstEscape??={frame,id:e.id,x:e.x,y:e.y,reason};}}
  }
  cases.push({regression:name,map,bouncy,before,escaped,firstEscape,final:g.ents.map(e=>({x:e.x,y:e.y,vx:e.vx,vy:e.vy})),pairDistance:g.ents.length===2?Math.hypot(g.ents[0].x-g.ents[1].x,g.ents[0].y-g.ents[1].y):null});
 }
 for(const bouncy of [false,true]){
  // Factory col8,row1 crate touches the top border. Both points have zero
  // circle-to-AABB distance: nearest-face resolution must choose an open exit.
  regression('embedded-top-crate-clamped','factory',[{x:340,y:137.6}],bouncy);
  regression('embedded-top-crate-centre','factory',[{x:340,y:140}],bouncy);
  regression('embedded-interior-crate-centre','courtyard',[{x:340,y:260}],bouncy);
  for(const edge of ['left','right','top','bottom']){
   const x=edge==='left'?59.2:edge==='right'?1220.8:60,y=edge==='top'?139.2:edge==='bottom'?740.8:440;
   const dx=edge==='left'?1:edge==='right'?-1:0,dy=edge==='top'?1:edge==='bottom'?-1:0;
   regression('pair-wall-crowding-'+edge,'courtyard',[{x,y,fx:{giant:10}},{x:x+dx*20,y:y+dy*20,fx:{giant:10}}],bouncy);
  }
  for(const [name,x,y,vx,vy] of [['top-left',60,140,-1800,-1800],['top-right',1220,140,1800,-1800],['bottom-left',60,740,-1800,1800],['bottom-right',1220,740,1800,1800]]){
   regression('corner-impulse-'+name,'courtyard',[{x,y,vx,vy,stun:1}],bouncy);
  }
  regression('zero-distance-pair-at-corner','courtyard',[{x:60,y:140},{x:60,y:140}],bouncy);
 }
 return {cases};
})()
