(async()=>{
 const A=CK.adventure,C=CKCampaign,K=CK.keys,checks=[],runs=[];
 const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function clear(){for(const k of Object.keys(K))K[k]=false;}
 function move(p,x,y){const dx=x-p.x,dy=y-p.y;K.KeyA=dx< -8;K.KeyD=dx>8;K.KeyW=dy< -8;K.KeyS=dy>8;}
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const save=C.normalize({});for(const n of C.nodes)save.results[n.id]={spoons:[true,false,false],attempts:1,best:100,assisted:false};A.campaign.restore(save);
 // Real-time pause through the actual buttons, not CK.freeze or a mocked clock.
 A.launch('banquet',false);document.getElementById('pauseBtn').click();const pausedAt=A.campaign.run.elapsed;await sleep(300);check(A.campaign.run.elapsed===pausedAt,'Pause freezes the campaign objective clock in real time');document.getElementById('resumeBtn').click();await sleep(250);check(A.campaign.run.elapsed>pausedAt,'Resume restarts the actual campaign simulation');CK.freeze(true);
 function combat(g,p,target,frame){if(!target)return;const d=dist(p,target);move(p,target.x,target.y);if(d<78){K.Space=frame%90<76;if(target.campaignTell&&p.atkCd>0){K.KeyE=true;K.Space=false;}}}
 function drive(id,frame){const r=A.campaign.run,g=CK.G(),p=g.ents[0],enemies=g.ents.filter(e=>!e.human&&!e.dead&&e.falling<=0),nearest=enemies.slice().sort((a,b)=>dist(p,a)-dist(p,b))[0];clear();if(p.dead||p.falling>0)return;
  if(id==='banquet'){if(nearest)combat(g,p,nearest,frame);else move(p,r.zone.x,r.zone.y);}
  if(id==='puddings'||id==='guard')combat(g,p,nearest,frame);
  if(id==='biscuit'){if(p.x<500)move(p,500,440);const arrow=g.proj.find(q=>q.owner!==p&&dist(p,q)<180);K.KeyE=!!arrow;}
  if(id==='bridge'){const gate=r.gates[r.route]||r.zone;move(p,gate.x,gate.y);const gap=[8,16,24].find(c=>p.x>c*40-45&&p.x<c*40+40);K.ShiftLeft=gap!==undefined&&p.dashCd<=0;}
  if(id==='stirling'){if(r.phase===0){const e=enemies[0];if(e){if(dist(p,e)>85)move(p,e.x,e.y);K.KeyE=!!e.campaignTell||e.swing>0;}}else if(r.phase===1)combat(g,p,nearest,frame);else if(nearest&&dist(nearest,r.zone)<130)combat(g,p,nearest,frame);else move(p,r.zone.x,r.zone.y);}
  if(id==='steve'){if(r.eggOpened===undefined){move(p,r.cage.x,r.cage.y);if(dist(p,r.cage)<100)K.Space=frame%40<2;}else if(!p.fx.steve){const egg=g.pickups.find(q=>q.kind==='steve')||r.cage;move(p,egg.x,egg.y);}else{const gate=r.gates[r.route];if(gate)move(p,gate.x,gate.y);}}
  if(id==='rind'){if(r.phase===2){move(p,r.cage.x,r.cage.y);if(dist(p,r.cage)<100)K.Space=frame%40<2;}else{const b=r.boss;if(b.step==='warn'){move(p,b.target.x-190,b.target.y+140);K.ShiftLeft=p.dashCd<=0;}else if(b.step==='exhausted')combat(g,p,b,frame);else if(nearest!==b&&nearest&&dist(nearest,p)<100)combat(g,p,nearest,frame);else move(p,b.x-145,b.y);}}
 }
 for(const id of C.nodes.map(n=>n.id)){
  A.campaign.assist(false);clear();A.launch(id,false);CK.freeze(true);let frame;
  for(frame=0;frame<C.byId[id].limit*60+1&&A.campaign.run.status==='playing';frame++){drive(id,frame);CK.update(1/60);}
  const r=A.campaign.run,p=CK.G().ents[0];runs.push({id,assisted:false,status:r.status,elapsed:+r.elapsed.toFixed(2),hits:r.hits,falls:r.falls,phase:r.phase,objective:A.campaign.objective(),position:{x:+p.x.toFixed(1),y:+p.y.toFixed(1)},reason:r.result&&r.result.reason});
  if(r.status!=='won'){
   A.campaign.assist(true);clear();A.launch(id,false);CK.freeze(true);
   for(frame=0;frame<C.byId[id].limit*60+1&&A.campaign.run.status==='playing';frame++){drive(id,frame);CK.update(1/60);}
   const retry=A.campaign.run;runs.push({id,assisted:true,status:retry.status,elapsed:+retry.elapsed.toFixed(2),hits:retry.hits,falls:retry.falls,phase:retry.phase,objective:A.campaign.objective(),reason:retry.result&&retry.result.reason});
  }
 }
 for(const n of C.nodes)check(runs.some(r=>r.id===n.id&&r.status==='won'),'Real input policy completes '+n.title);
 clear();CK.toMenu();CK.freeze(true);
 return {checks,runs,method:'Automated policy drove only real WASD/Space/Shift/E input after each real campaign launch. No combat damage, positions, crate events, or objective progress was injected during play. Prior chapter completion was loaded solely to select each encounter independently. This is not human playtesting.'};
})()
