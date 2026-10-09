(()=>{
 const checks=[],add=(name,pass,details)=>checks.push({name,pass:!!pass,details});
 const clear=()=>{for(const key of Object.keys(CK.keys))delete CK.keys[key];};
 const tick=n=>{for(let i=0;i<n;i++)CK.update(1/60);};
 function fixture(count=1,map='courtyard'){clear();CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);CK.begin({humans:Math.min(2,count),map,mode:'ffa'});CK.freeze(true);const g=CK.G();g.ents=g.ents.slice(0,count);g.pickups=[];g.qaPads=g.pads;g.pads=[];g.spawnT=g.mayhemAt=g.norrAt=1e9;g.steveDone=true;g.ev=g.mayhem=null;for(const [i,e] of g.ents.entries())Object.assign(e,{x:400+i*180,y:140,vx:0,vy:0,protect:0,inv:0,hp:3,face:i?Math.PI:0,ai:{...e.ai,think:999},human:i<2?i+1:0});return {g,p:g.ents[0],q:g.ents[1]};}
 for(const [kind,ammo,cooldown,projectile] of [['crossbow',4,.95,'bolt'],['croissant',3,.9,'croissant']]){
  let {g,p}=fixture();CK.giveWeapon(p,kind);add(kind+' pickup grants its declared ammunition',p.wpn?.kind===kind&&p.wpn.ammo===ammo&&p.wpn.lvl===1);
  CK.keys.KeyF=true;tick(1);add(kind+' actual attack input fires one projectile and consumes one round',g.proj.length===1&&g.proj[0].k===projectile&&p.wpn.ammo===ammo-1&&Math.abs(p.fireCd-cooldown)<1e-6,{ammo:p.wpn.ammo,fireCd:p.fireCd});
  tick(20);add(kind+' holding attack cannot bypass reload',p.wpn.ammo===ammo-1);clear();tick(50);CK.keys.KeyF=true;tick(1);clear();add(kind+' attack fires again after reload',p.wpn?.ammo===ammo-2);
  while(p.wpn){p.fireCd=0;CK.fire(p);}add(kind+' final round unequips the exhausted weapon',p.wpn===null);
  ({g,p}=fixture());CK.giveWeapon(p,kind);CK.giveWeapon(p,kind);add(kind+' duplicate pickup upgrades and refills',p.wpn.lvl===2&&p.wpn.ammo===ammo*2);
  ({g,p}=fixture());p.x=260;p.y=260;CK.giveWeapon(p,kind);const before=g.crateHp[4*32+8];CK.fire(p);tick(20);add(kind+' piercing projectile stops at an actual crate and damages it once',g.proj.length===0&&g.crateHp[4*32+8]===before-1,{before,after:g.crateHp[4*32+8]});
  ({g,p}=fixture());p.x=1180;CK.giveWeapon(p,kind);CK.fire(p);tick(20);add(kind+' projectile stops at outer wall',g.proj.length===0);
  let q;({g,p,q}=fixture(2));CK.giveWeapon(p,kind);q.x=580;q.face=Math.PI;CK.keys.KeyL=true;CK.fire(p);let reflected=false,originalDamaged=false;
  for(let i=0;i<85;i++){CK.update(1/60);reflected ||= g.proj.some(s=>s.owner===q&&s.vx<0);originalDamaged ||= p.hp<3;}
  clear();add(kind+' real block reflects ownership and can hit original shooter',reflected&&q.hp===3&&originalDamaged,{reflected,defenderHp:q.hp,shooterHp:p.hp});
 }
 let {g,p,q}=fixture(2);CK.giveWeapon(p,'crossbow');const third=CK.mkKnight({id:2,x:740,y:140,hp:3,human:3,ai:{think:999},kit:{helm:'great',plume:'feather',metal:'steel'}});g.ents.push(third);CK.fire(p);tick(30);add('Crossbow bolt pierces two real enemy collisions',q.hp===2&&third.hp===2,{hp:[q.hp,third.hp]});
 ({g,p}=fixture());CK.giveWeapon(p,'croissant');CK.fire(p);let returning=false,followed=false;CK.keys.KeyS=true;
 for(let i=0;i<95;i++){CK.update(1/60);const shot=g.proj[0];returning ||= !!shot?.returning;followed ||= !!shot?.returning&&shot.vy>0;}clear();add('Croissant turns and follows a moving owner before being caught',returning&&followed&&g.proj.length===0&&p.hp===3,{returning,followed,projectiles:g.proj.length});
 ({g,p,q}=fixture(2));CK.giveWeapon(p,'croissant');CK.fire(p);let seenReturn=false,contactedReturn=false,firstHit=false;
 for(let i=0;i<95;i++){CK.update(1/60);const shot=g.proj[0];if(q.hp<3){firstHit=true;q.inv=0;q.hitLock=0;}if(shot?.returning){seenReturn=true;if(Math.hypot(shot.x-q.x,shot.y-q.y)<q.r+shot.r)contactedReturn=true;}}
 add('Croissant cannot damage the same enemy twice on outbound/return after hit immunity is cleared',firstHit&&seenReturn&&contactedReturn&&q.hp===2,{hp:q.hp,contactedReturn});
 ({g,p}=fixture());CK.giveWeapon(p,'croissant');CK.fire(p);CK.hurt(p,null,99,{force:true,kb:0});tick(1);add('Croissant expires when its owner dies through real damage',p.dead&&g.proj.length===0);
 ({g,p}=fixture());CK.giveWeapon(p,'croissant');CK.fire(p);let maxAge=0;for(let i=0;i<120;i++){CK.update(1/60);for(const s of g.proj)maxAge=Math.max(maxAge,s.returnAge||0);}add('Croissant is gone within its finite lifetime',g.proj.length===0&&maxAge<=1.8,{maxAge});

 for(const kind of ['crossbow','croissant']){({g,p}=fixture());g.pads=[g.qaPads[0]];const pad=g.pads[0];pad.item=kind;p.x=pad.x-65;p.y=pad.y;CK.keys.KeyD=true;for(let i=0;i<35&&!p.wpn;i++)CK.update(1/60);clear();add(kind+' walking into a real map weapon pad collects the weapon',p.wpn?.kind===kind&&pad.item===null,{x:p.x,y:p.y});}
 ({g,p}=fixture(1,'roof'));p.x=100;p.y=260;CK.giveWeapon(p,'croissant');CK.fire(p);CK.keys.KeyD=true;for(let i=0;i<60&&!p.falling;i++)CK.update(1/60);clear();tick(1);add('Croissant expires when owner walks into an actual pit',p.falling>0&&g.proj.length===0,{falling:p.falling});
 ({g,p,q}=fixture(2));CK.giveWeapon(p,'croissant');CK.keys.KeyL=true;CK.fire(p);let reflectedOwner=false,returnedDefender=false;for(let i=0;i<100;i++){CK.update(1/60);for(const s of g.proj){reflectedOwner ||= s.owner===q;returnedDefender ||= s.owner===q&&s.returning&&s.vx>0;}}clear();add('Reflected croissant returns to the blocking defender rather than original shooter',reflectedOwner&&returnedDefender&&g.proj.length===0,{reflectedOwner,returnedDefender});
 ({g,p,q}=fixture(2));CK.giveWeapon(p,'croissant');CK.keys.KeyH=true;CK.keys.KeyL=true;CK.fire(p);let reflections=0,lastOwner=p,lastAge=0,expiredAge=0;for(let i=0;i<120;i++){const prior=g.proj[0];if(prior)lastAge=prior.returnAge;CK.update(1/60);const shot=g.proj[0];if(shot&&shot.owner!==lastOwner){reflections++;lastOwner=shot.owner;}if(prior&&!shot)expiredAge=prior.returnAge;}clear();add('Repeated real shield reflections do not extend croissant absolute lifetime',reflections>=2&&expiredAge>=1.79&&expiredAge<=1.82&&g.proj.length===0,{reflections,expiredAge,lastAge});
 // The final actual arena scene is also the screenshot fixture: both held weapons,
 // both projectile types, and real weapon pads, followed by a snapshot round trip.
 ({g,p,q}=fixture(2));p.x=420;p.y=440;q.x=860;q.y=440;p.face=0;q.face=Math.PI;CK.giveWeapon(p,'crossbow');CK.giveWeapon(q,'croissant');CK.fire(p);CK.fire(q);g.pads=g.qaPads.slice(0,2);g.pads[0].item='crossbow';g.pads[1].item='croissant';g.tips=[];g.tip=null;g.tipT=0;g.banner=null;g.floaters=[];g.parts=[];g.shake=0;const snap=CK.snapshot();CK.applySnap(snap);CK.draw();
 add('Snapshot round trip retains held weapons, projectile kinds and pad items',g.ents[0].wpn.kind==='crossbow'&&g.ents[1].wpn.kind==='croissant'&&g.proj.some(s=>s.k==='bolt')&&g.proj.some(s=>s.k==='croissant')&&g.pads.map(s=>s.item).join(',')==='crossbow,croissant');
 add('Both new weapons draw in the actual arena after snapshot hydration',true);
 return {checks,limitations:'Fresh isolated browser. Controlled positions on actual map terrain and real engine input/fire/collision/damage/snapshot paths. Hit immunity cleared only in the once-per-throw test to distinguish hit history from temporary protection. Screenshot reviewed separately; no network transport acceptance implied.'};
})()
