(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};
 const A=CK.adventure,C=CKCampaign;
 check(!!A,'Campaign adapter is exposed in opt-in QA');
 CK.NET.role=null;A.stop();CK.freeze(true);
 const initial=C.normalize({});A.campaign.restore(initial);A.open();
 check(!document.getElementById('campaignMap').hidden,'Fresh save opens the winding chapter map');
 check(document.querySelectorAll('.campaign-node').length===8,'Exactly eight chapter encounters appear on the map');
 check(document.querySelectorAll('.campaign-node:disabled').length===7,'A fresh save unlocks only the banquet');
 document.querySelector('.campaign-brief button').click();
 check(!document.getElementById('campaignStory').hidden,'Story exchange is shown before first play');
 [...document.querySelectorAll('#campaignStory button')].find(b=>b.textContent==='Skip story').click();
 CK.freeze(true);check(CK.G().mode==='campaign'&&CK.G().ents.length===3,'Banquet starts one human and two authored guards');
 const normalMatches=CK.PROG.matches,normalCoins=CK.PROG.earned,normalCollection=CK.collection().completed;
 function clearKeys(){for(const k of Object.keys(CK.keys))CK.keys[k]=false;}
 function step(n){CK.adv(n);}
 function launch(id,resume=false){clearKeys();A.launch(id,resume);CK.freeze(true);const g=CK.G();for(const e of g.ents){e.inv=0;e.protect=0;e.hitLock=0;e.stun=0;}return g;}
 function bonk(e,amount=1,src='heavy'){e.inv=0;e.protect=0;e.hitLock=0;e.dashT=0;CK.hurt(e,CK.G().ents[0],amount,{src,kb:0});}
 function clearEnemies(){for(const e of CK.G().ents.slice(1))if(!e.dead)bonk(e,99);}
 function place(p,x,y){p.x=x;p.y=y;p.vx=0;p.vy=0;p.falling=0;p.stun=0;p.slip=0;p.inv=0;p.protect=0;}
 // Verify accepted melee contacts through doHit rather than synthesizing events.
 let g=CK.G(),p=g.ents[0],guard=g.ents[1];place(p,430,350);place(guard,480,350);p.face=0;guard.blocking=false;CK.startSwing(p,'light');CK.doHit(p,.12);
 check(guard.hp===1,'Actual sword collision damages the banquet guard');
 clearEnemies();place(p,1100,440);step(100);
 check(A.campaign.run.status==='won','Guard combat followed by pantry capture completes encounter one');
 check(A.campaign.save.results.banquet.spoons[0],'Completion saves the first spoon');
 check(document.getElementById('campaignResult').hidden===false,'Campaign result screen replaces party standings');
 check(A.campaign.unlocked('puddings'),'First encounter unlocks pudding defence');
 check(CK.PROG.matches===normalMatches&&CK.PROG.earned===normalCoins,'Campaign result never pays ordinary match coins');
 // Scripted arena verification. Damage/teleports are QA setup; success triggers
 // still run through real simulation, collision, objective and save hooks.
 g=launch('puddings');p=g.ents[0];clearEnemies();step(1);check(A.campaign.run.wave===2&&g.ents.filter(e=>!e.human&&!e.dead).length===2,'Defence clears wave one and spawns a distinct second wave');clearEnemies();step(1);check(A.campaign.run.status==='won','Pudding defence completes only after both waves');
 g=launch('guard');p=g.ents[0];guard=g.ents[1];place(p,guard.x-55,guard.y);p.face=0;guard.face=Math.PI;guard.blocking=true;guard.guard=1.5;CK.startSwing(p,'heavy');CK.doHit(p,.12);
 check(guard.guardLock>0&&guard.hp===4,'Actual heavy contact breaks the rice guard shield and damages him');
 bonk(guard,99);step(1);check(A.campaign.run.status==='won','Shield duel completes from accepted combat KO');check(A.campaign.unlocked('bridge')&&A.campaign.unlocked('biscuit'),'Main bridge and optional toll both unlock after guard');
 g=launch('biscuit');p=g.ents[0];const archer=g.ents[1];place(p,500,440);place(archer,840,440);p.face=0;
 // A reflected training arrow physically contacts a facing, blocking knight.
 for(let i=0;i<5;i++){p.guard=1.5;p.guardLock=0;p.inv=0;p.protect=0;p.hitLock=0;p.face=0;p.blocking=true;CK.keys.KeyE=true;g.proj=[{k:'arrow',x:p.x+30,y:p.y,vx:-390,vy:0,owner:archer,life:4,r:6,hit:[]}];step(2);CK.keys.KeyE=false;}
 check(A.campaign.run.reflects===5,'Five actual projectile collisions fire five reflection hooks');step(1);check(A.campaign.run.status==='won'&&A.campaign.run.result.spoons[1],'Biscuit trial awards the five-reflection optional spoon');
 g=launch('bridge');p=g.ents[0];place(p,300,440);p.dashT=.16;p.vx=680;step(8);check(A.campaign.run.gapDash,'Actual dash over the marked gap records the movement feat');for(const gate of A.campaign.run.gates){place(p,gate.x,gate.y);step(1);}step(181);check(A.campaign.run.status==='won','Bridge checkpoints and far-end capture complete encounter five');
 g=launch('stirling');p=g.ents[0];let examiner=g.ents[1];place(p,400,440);place(examiner,460,440);p.face=0;examiner.face=Math.PI;
 // Force warned examiner swings to collide with a held guard through doHit.
 for(let i=0;i<3;i++){p.guard=1.5;p.guardLock=0;p.protect=0;p.hitLock=0;p.inv=0;p.blocking=true;p.blockAge=.3;examiner.stun=0;CK.startSwing(examiner,'light');CK.doHit(examiner,.12);step(1);}
 check(A.campaign.run.phase===1,'Three actual blocked sword contacts pass Stirling defence');
 clearEnemies();step(1);check(A.campaign.run.phase===2,'Defeating Stirling starts the pie-hold test');clearEnemies();place(p,640,440);step(481);check(A.campaign.run.status==='won','Uncontested pie holding completes the third examination test');
 g=launch('steve');p=g.ents[0];const cage=A.campaign.run.cage;place(p,cage.x-54,cage.y);p.face=0;
 for(let i=0;i<3;i++){p.atkCd=0;p.swing=0;p.hitLock=0;CK.startSwing(p,'light');CK.doHit(p,.12);}
 check(g.grid[cage.r][cage.c]==='.'&&g.pickups.some(q=>q.kind==='steve'),'Three actual sword/crate contacts break Steve cage and create the guaranteed egg');
 place(p,cage.x,cage.y);step(1);check(p.fx.steve>0,'Real pickup collision mounts Steve');clearEnemies();for(const gate of A.campaign.run.gates){place(p,gate.x,gate.y);step(1);}check(A.campaign.run.status==='won','Mounted gate route completes Steve rescue');
 g=launch('rind');p=g.ents[0];const boss=A.campaign.run.boss;place(p,600,440);place(boss,800,440);step(146);check(boss.step==='warn'&&!!boss.target,'Marshal marks a fixed slam target before attacking');const marked={...boss.target};place(p,200,600);step(70);check(boss.step==='exhausted'&&boss.target.x===marked.x,'Player evasion leaves the original warning circle and opens a punish window');
 bonk(boss,4);step(1);check(A.campaign.run.phase===1&&g.ents.filter(e=>e.campaignRole==='shield').length===2,'Half-health transition summons two shield guards');
 const shield=g.ents.find(e=>e.campaignRole==='shield');place(p,650,440);place(shield,650,440);shield.inv=0;shield.protect=0;step(146);place(p,200,600);shield.inv=0;shield.protect=0;shield.hitLock=0;place(shield,650,440);step(70);
 check(A.campaign.run.guardsHit>0,'Marshal sweep explicitly damages his own shield formation');
 bonk(boss,99);step(1);check(A.campaign.run.phase===2&&A.campaign.run.status==='playing','Boss defeat starts a playable trapped-soldier rescue');const skin=A.campaign.run.cage;place(p,skin.x-54,skin.y);p.face=0;
 for(let i=0;i<3;i++){p.atkCd=0;p.swing=0;CK.startSwing(p,'light');CK.doHit(p,.12);}
 check(A.campaign.run.status==='won','Real sword/crate rescue completes Marshal encounter');
 check(C.nodes.every(n=>A.campaign.save.results[n.id]&&A.campaign.save.results[n.id].spoons[0]),'All eight distinct playable encounters completed by scripted engine QA');
 check(CK.collection().completed===normalCollection+8,'Campaign collection pays exactly once per completed encounter');
 check(CK.owned('helm','riceGuard')&&CK.owned('pose','steveStrut'),'Chapter and Steve milestones unlock their real wardrobe rewards');
 check(CK.PROG.matches===normalMatches&&CK.PROG.earned===normalCoins,'Whole campaign bypasses generic party economy');
 // Failure and reload/checkpoint behavior use the same engine path.
 g=launch('banquet');p=g.ents[0];CK.hurt(p,g.ents[1],99,{src:'sword',kb:0,force:true});check(A.campaign.run.status==='failed'&&!document.getElementById('campaignResult').hidden,'Real player KO offers immediate failure recovery');
 check(CK.collection().completed===normalCollection+8,'Failed encounters do not increment collection completion goals');
 const retry=[...document.querySelectorAll('#campaignResult button')].find(b=>b.textContent==='Retry now');retry.click();CK.freeze(true);check(A.campaign.run.status==='playing'&&CK.G().ents.length===3,'Retry button launches a clean encounter');
 g=launch('bridge');p=g.ents[0];place(p,440,440);step(1);CK.hurt(p,null,99,{src:'pit',how:'fell in a pit',force:true,kb:0});step(110);check(A.campaign.run.status==='playing'&&Math.abs(p.x-440)<1,'Bridge death respawns at the reached checkpoint');
 g=launch('rind');bonk(A.campaign.run.boss,4);step(1);const durable=JSON.parse(localStorage.getItem(C.KEY));check(durable.checkpoint.id==='rind'&&durable.checkpoint.phase===1,'Boss phase checkpoint is persisted before retry');
 const reloaded=C.create();check(reloaded.save.checkpoint.phase===1,'A new campaign instance resumes the persisted checkpoint');
 launch('rind',true);check(A.campaign.run.phase===1&&A.campaign.run.boss.hp===4,'Resume rebuilds the second boss phase without stale timers');
 A.open();check(A.campaign.save.results.steve.spoons[0]&&!document.getElementById('campaignMap').hidden,'Completed spoons and chapter map survive return from a battle');
 CK.start();CK.freeze(true);check(!CK.G().campaign&&A.campaign.run===null&&document.getElementById('campaignMap').hidden,'Quick brawl exit clears campaign runtime and overlays');
 clearKeys();return {passed,method:'Scripted engine integration QA: real combat, projectile and crate collision hooks; teleports and direct damage used as deterministic setup. No human playtest or duration validation claimed.'};
})()
