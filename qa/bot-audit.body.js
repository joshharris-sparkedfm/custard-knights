(()=>{
 const checks=[],samples=[];
 const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
 const setup=(mode='ffa',diff='medium')=>{CK.setSeats([{dev:'kb1'}]);CK.begin({humans:1,map:'courtyard',mode,diff});const g=CK.G();g.ev=g.mayhem=null;g.spawnT=999;g.pickups=[];return g;};
 for(const diff of ['easy','medium','hard','steve'])for(const mode of Object.keys(CK.MODES)){
  const g=setup(mode,diff),bots=g.ents.filter(e=>!e.human),initial=bots.map(e=>({x:e.x,y:e.y}));
  check(g.diff===CK.DIFFS[diff],`${mode}/${diff} selected`);
  for(let k=0;k<360;k++)CK.update(1/60);
  check(g.ents.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.hp)),`${mode}/${diff} finite simulation`);
  check(bots.some((e,i)=>Math.hypot(e.x-initial[i].x,e.y-initial[i].y)>15),`${mode}/${diff} bots navigate`);
  samples.push({mode,diff,bots:bots.length,kills:g.stats.kills,dashes:g.stats.dashes,clock:g.clock});
 }
 for(const diff of ['easy','medium','hard','steve']){
  const g=setup('ffa',diff),p=g.ents[0],e=g.ents.find(e=>!e.human);g.ents=[p,e];
  for(const q of [p,e])Object.assign(q,{x:600,y:400,fx:{},chick:false,hot:false,wpn:null,inv:0,protect:0,swing:0,blocking:false,charge:0});p.x=660;
  check(CK.speedOf(e)===CK.speedOf(p),`${diff} equal movement speed`);
  e.stun=.3;const input=CK.botInput(e,1/60);check(!input.atk&&!input.dash&&!input.block&&input.mx===0&&input.my===0,`${diff} respects stun`);
 }
 const random=Math.random;
 try{
  Math.random=()=>.01;
  const g=setup('flags','steve'),p=g.ents[0],e=g.ents.find(e=>e.team!==p.team);g.ents=[p,e];
  Object.assign(p,{x:650,y:400,protect:0,inv:0});Object.assign(e,{x:600,y:400,atkCd:0,stun:0,wpn:null,bashCd:0});Object.assign(e.ai,{think:1,target:p,goal:'go',gx:900,gy:400,hold:false,react:0,blockT:0,holdAtk:0,tellT:0});
  check(CK.botInput(e,1/60).atk,'objective runner can attack a nearby enemy');
  e.ai.think=0;p.blocking=true;e.ai.goal=null;e.ai.react=0;const bash=CK.botInput(e,1/60);check(bash.atk&&bash.block,'STEVE chooses bash against guarded opponent');
  p.blocking=false;e.riposte=1;e.ai.think=0;e.ai.holdAtk=0;e.ai.blockT=.3;check(CK.botInput(e,1/60).atk,'STEVE spends earned riposte');
 }finally{Math.random=random;}
 check(document.querySelectorAll('[data-k="diff"] button').length===4,'four arena difficulty buttons');
 CK.adventure.open();check([...document.querySelectorAll('[aria-label="Story difficulty"] button')].map(x=>x.textContent).join(',')==='Easy,Medium,Hard,STEVE','four story difficulty buttons');
 CK.adventure.stop();return {checks,samples,limitations:'Six simulated seconds per arena mode/profile; targeted mechanics assertions. Not human difficulty calibration or exhaustive emergent-behaviour acceptance.'};
})()
