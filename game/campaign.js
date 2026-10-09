/* The Great Pudding War: authored encounters, independent spoons and local saves. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKCampaign=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const difficulties={easy:{label:'Easy',pace:.8},medium:{label:'Medium',pace:1},hard:{label:'Hard',pace:1.18},steve:{label:'STEVE',pace:1.4}};
 const KEY='ck-campaign-v1';
 const nodes=[
  {id:'banquet',title:'Somebody Has Thrown a Pie',region:'Custardia',map:'courtyard',at:[10,70],requires:[],objective:'Bonk both guards, then reach the pantry door.',spoons:['Escape through the pantry','Finish without being bonked','Escape within 90 seconds'],tip:'Face the guard, tap Swing, and dash away while your sword recovers.',dialogue:['Sir Stirling: Your mission is to restore peace.','Recruit: With this sword?','Sir Stirling: We tried a letter. They ate it.'],outro:['The pantry staff escape. Outside, a siege bowl is heading for your family bakery.','Sir Stirling: Congratulations. You’re the army.'],limit:180},
  {id:'puddings',title:'Protect the Puddings',region:'Custardia',map:'courtyard',at:[25,52],requires:['banquet'],objective:'Protect three pudding stands through two waves. One must survive.',spoons:['Clear both waves with a stand remaining','Keep all three stands intact','Block or parry three attacks'],tip:'Watch the red warning over a stand. Bonk that raider before the warning fills.',dialogue:['Cook: Save the puddings! We can replace the chairs.','Recruit: Which chairs?','Cook: All of them.'],outro:['Beneath the table you find a leathery scrap. The Golden Spoon is missing.'],limit:210},
  {id:'guard',title:'A Spoon at a Sword Fight',region:'Rice border',map:'courtyard',at:[40,65],requires:['puddings'],objective:'Defeat the rice guard. Charge a heavy swing or circle behind his shield.',spoons:['Defeat the rice guard','Land a heavy attack or shield bash','Finish without being bonked'],tip:'Hold Swing after the first attack recovers, then release for a heavy. Attack + Block also bashes.',dialogue:['Rice Guard: Our lumps are structural integrity.','Recruit: So is that shield.'],outro:['The guard steps aside. Beyond him, the bridge leads to Sir Stirling’s examination yard.'],limit:180},
  {id:'biscuit',title:'The Biscuit Toll',region:'Optional training',map:'courtyard',at:[45,24],requires:['guard'],optional:true,objective:'Reflect three training arrows by facing the archer and blocking.',spoons:['Reflect three arrows','Reflect five arrows before leaving','Finish without being bonked'],tip:'Face the archer and release Block between shots so your guard refills. Reflections count on contact.',dialogue:['Biscuit Keeper: The toll is three returned arrows.','Recruit: You take your biscuits seriously.'],outro:['Biscuit Keeper: Passage granted. Please leave the arrows where you found them.'],limit:180},
  {id:'bridge',title:'A Bridge Too Flan',region:'Custardia',map:'frost',at:[56,53],requires:['guard'],objective:'Reach three bridge checkpoints and hold the far end for three seconds.',spoons:['Capture the far end','Cross without falling','Use a dash to cross a marked gap'],tip:'Dash straight across the narrow gaps. The outer path is safe; checkpoints save your position.',dialogue:['Sir Stirling: The bridge is perfectly safe.','Recruit: It appears to have holes.','Sir Stirling: Perfectly regulated holes.'],outro:['You cross the flan bridge. Sir Stirling has prepared three forms and one sword.'],limit:210},
  {id:'stirling',title:'Your Knighthood Is Pending',region:'Custardia',map:'courtyard',at:[68,67],requires:['bridge'],objective:'Pass three tests: block three attacks, defeat Stirling, and hold the pie.',spoons:['Pass all three tests','Parry at least one attack','Pass without being bonked'],tip:'During defence, face Stirling and block the warned swing. During the pie test, move enemies out of the circle.',dialogue:['Sir Stirling: First, defend. Then counter. Finally, protect lunch.','Recruit: Is lunch compulsory?','Sir Stirling: The most compulsory part.'],outro:['Sir Stirling: Your knighthood is approved, pending the usual paperwork.','A distant BAWK interrupts the ceremony.'],limit:300},
  {id:'steve',title:'Release the Chicken',region:'Custardia',map:'courtyard',at:[80,44],requires:['stirling'],objective:'Break Steve’s cage, collect the golden egg, then ride through three gates.',spoons:['Release and ride Steve','Ride the route within 60 seconds of opening the cage','Finish without being bonked'],tip:'Swing at the marked wooden cage. Collect the egg, then visit the gates in order. More eggs appear if the ride ends.',dialogue:['Narrator: From the dawn of time came a creature of unimaginable power.','Sir Stirling: That’s Steve. He was in the shed.'],outro:['Steve carries you to the rice fortress. He mainly appears interested in the banners.'],limit:210},
  {id:'rind',title:'Skin in the Game',region:'Rice Pudding Kingdom',map:'courtyard',at:[91,65],requires:['steve'],objective:'Bait Marshal Rind’s marked slams, defeat him, then break the skin trapping a soldier.',spoons:['Defeat Rind and free the soldier','Make Rind’s sweep strike one of his shield guards','Win without being bonked'],tip:'The red circle stays where the slam was aimed. Dash out, then attack while the spoon is stuck. Lure the sweep into a guard.',dialogue:['Marshal Rind: We do not run.','Recruit: Because of your honour?','Marshal Rind: Because of our consistency.'],outro:['Marshal Rind: That isn’t ours.','The living skin recoils from your sword. Across the lake, entire fountains have stopped flowing.','Sir Stirling: When did anyone last stir this?','The rice road opens. The Golden Spoon is still missing. This chapter ends here.'],limit:360}
 ];
 const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
 const factions=[{name:'Custardia',text:'Custard is the meal. Everyone else is decoration.'},{name:'Rice Pudding Kingdom',text:'Proud shield knights. Lumps are structural integrity.'},{name:'Angelic Delight Empire',text:'Pink cloud palaces; lightly whipped, never beaten.'},{name:'Wobbling Court',text:'The Jelly Marshes have never taken a firm position.'},{name:'Crumble miners',text:'The topping is the important part.'},{name:'Lord Skin',text:'A creeping membrane from every pudding nobody stirred.'}];
 const count=n=>Number.isFinite(n)?Math.max(0,Math.min(100000,Math.floor(n))):0;
 const checkpointLabel=cp=>cp?({stirling:{1:'Counter test',2:'Protect lunch'},rind:{1:'Shield wall',2:'Soldier rescue'}}[cp.id]||{})[cp.phase]||'Saved checkpoint':'';
 function normalize(raw){
  raw=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};const results={};
  for(const n of nodes){const r=raw.results&&raw.results[n.id];if(r&&typeof r==='object')results[n.id]={spoons:[0,1,2].map(i=>!!(Array.isArray(r.spoons)&&r.spoons[i]===true)),attempts:count(r.attempts),best:Number.isFinite(r.best)&&r.best>=0?Math.min(3600,r.best):null,assisted:r.assisted===true};}
  const checkpoint=raw.checkpoint&&['stirling','rind'].includes(raw.checkpoint.id)&&[1,2].includes(raw.checkpoint.phase)?{id:raw.checkpoint.id,phase:raw.checkpoint.phase}:null;
  return {version:1,results,selected:byId[raw.selected]?raw.selected:'banquet',assist:raw.assist===true,difficulty:Object.hasOwn(difficulties,raw.difficulty)?raw.difficulty:'medium',checkpoint,receipts:[...new Set((Array.isArray(raw.receipts)?raw.receipts:[]).filter(x=>typeof x==='string'&&x.length<=120))].slice(-128)};
 }
 function unlocked(save,id){const n=byId[id];return !!n&&n.requires.every(p=>save.results[p]&&save.results[p].spoons[0]);}
 function next(save){return nodes.find(n=>!n.optional&&unlocked(save,n.id)&&!(save.results[n.id]&&save.results[n.id].spoons[0]))||null;}
 function merge(rawA,rawB){const a=normalize(rawA),b=normalize(rawB),save=normalize(a);for(const n of nodes){const x=a.results[n.id],y=b.results[n.id];if(!y)continue;if(!x){save.results[n.id]=y;continue;}save.results[n.id]={spoons:x.spoons.map((s,i)=>s||y.spoons[i]),attempts:Math.max(x.attempts,y.attempts),best:x.best===null?y.best:y.best===null?x.best:Math.min(x.best,y.best),assisted:x.assisted||y.assisted};}save.receipts=[...new Set([...a.receipts,...b.receipts])].slice(-128);save.checkpoint=[a.checkpoint,b.checkpoint].find(cp=>cp&&unlocked(save,cp.id)&&!(save.results[cp.id]&&save.results[cp.id].spoons[0]))||null;save.selected=(next(save)||byId[a.selected]).id;return save;}
 function award(raw,id,run){const save=normalize(raw),n=byId[id];if(!n||!unlocked(save,id)||!run||typeof run.receipt!=='string'||!run.receipt||save.receipts.includes(run.receipt))return {save,added:[],applied:false};
  const prior=save.results[id]||{spoons:[false,false,false],attempts:0,best:null,assisted:false};const earned=Array.isArray(run.spoons)?run.spoons.map(x=>x===true):[];const added=[];
  const spoons=prior.spoons.map((s,i)=>{if(!s&&earned[i])added.push(i);return s||earned[i];});const won=earned[0]===true;
  save.results[id]={spoons,attempts:prior.attempts+1,best:won&&Number.isFinite(run.elapsed)?(prior.best===null?run.elapsed:Math.min(prior.best,run.elapsed)):prior.best,assisted:prior.assisted||(won&&run.assisted===true)};
  save.receipts.push(run.receipt);save.receipts=save.receipts.slice(-128);if(won){if(save.checkpoint&&save.checkpoint.id===id)save.checkpoint=null;save.selected=(next(save)||n).id;}return {save,added,applied:true};
 }
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const living=e=>e&&!e.dead&&!(e.falling>0);
 const noInput=()=>({mx:0,my:0,atk:false,dash:false,block:false,faceTo:null});
 function create(options={}){
  const storage=options.storage===undefined?(typeof localStorage!=='undefined'?localStorage:null):options.storage;
  let save;try{save=normalize(JSON.parse(storage&&storage.getItem(KEY)||'{}'));}catch{save=normalize({});}
  let run=null,engine=null,serial=0,saveError=false;
  function persist(){try{if(storage)storage.setItem(KEY,JSON.stringify(save));saveError=!storage;}catch{saveError=true;}options.onSave&&options.onSave(save,saveError);}
  function select(id){if(unlocked(save,id)){save.selected=id;persist();return true;}return false;}
  function assist(value){save.assist=!!value;persist();}
  function difficulty(value){save.difficulty=Object.hasOwn(difficulties,value)?value:'medium';persist();}
  function pace(){return difficulties[run.difficulty].pace;}
  function checkpoint(phase){save.checkpoint={id:run.node.id,phase};persist();}
  function banner(title,sub){run.g.banner={title,sub,col:'#FFD23F',t:3,max:3};}
  function spawn(role,x,y,hp=3,name){const g=run.g;const e=engine.makeKnight({id:g.ents.length,name:name||'Rice raider',human:0,team:'blue',x,y,color:'#CFE6FF',plume:'#FFD23F',hp,campaignMaxHp:hp,campaignRole:role,springCd:0,portalCd:0,holdT:0,charge:0,dashAtkT:0,blockAge:99,bashCd:0,hitLock:0,guardLock:0,whiffT:0,spawnAt:g.clock,atkWas:false,comboT:-9,protect:1,inv:1,kit:{helm:'great',plume:'feather',metal:'steel'},ai:{parryOk:false},fx:{},lvl:{}});g.ents.push(e);return e;}
  function freshArena(g,node){
   const player=g.ents.find(e=>e.human&&!e.netId)||g.ents[0];player.human=1;player.team='red';player.netId=null;player.chick=false;player.hp=save.assist?5:3;player.campaignMaxHp=player.hp;player.x=180;player.y=440;player.face=0;player.fx={};player.lvl={};player.carry=null;player.protect=2;player.inv=2;
   g.ents=[player];g.mode='campaign';g.campaign=true;g.demo=false;g.over=false;g.time=node.limit;g.clock=0;g.chaos=0;g.chaosRate=1e12;g.tierShown=0;g.spawnT=1e12;g.mayhemAt=1e12;g.norrAt=1e12;g.steveDone=true;g.ev=null;g.mayhem=null;g.pickups=[];g.proj=[];g.pads=[];g.holes=[];g.bananas=[];g.mines=[];g.bees=[];g.bombs=[];g.flock=[];
  }
  function grid(g){g.grid=Array.from({length:18},(_,r)=>Array.from({length:32},(_,c)=>r===0||r===17||c===0||c===31?'#':'.'));g.crateHp={};g.floor=[];g.portals=[];g.flows.clear();g.spawns=[{x:180,y:440},{x:1100,y:440}];g.left=[g.spawns[0]];g.right=[g.spawns[1]];g.spawnCands=[];g.spawnUsed=new Map();}
  function rebuild(){const g=run.g;g.floor=[];for(let r=1;r<17;r++)for(let c=1;c<31;c++)if(g.grid[r][c]==='.')g.floor.push({x:c*40+20,y:80+r*40+20});engine.redraw&&engine.redraw();}
  function cage(c,r,label){const g=run.g;g.grid[r][c]='x';g.crateHp[r*32+c]=3;run.cage={c,r,x:c*40+20,y:80+r*40+20,label};rebuild();}
  function cancelStandAttack(e){e.standTimer=0;e.standTarget=null;run.warnings=run.warnings.filter(w=>w.actor!==e.id);}
  function testPhase(phase){const g=run.g;run.phase=phase;run.phaseT=0;g.ents=g.ents.slice(0,1);g.proj=[];run.warnings=[];run.contested=false;run.player.hp=run.player.campaignMaxHp;run.player.inv=1;run.player.x=360;run.player.y=440;run.player.vx=run.player.vy=0;run.hold=0;run.testBlocks=0;
   if(phase===0){spawn('examiner',470,440,20,'Sir Stirling');banner('TEST ONE: DEFEND','Face Stirling. Block or parry three swings.');}
   if(phase===1){spawn('shield',660,440,3,'Sir Stirling');banner('TEST TWO: COUNTER','Charge a heavy, bash, or circle behind his shield.');checkpoint(1);}
   if(phase===2){run.zone={x:640,y:440,r:85,label:'Hold the pie'};spawn('raider',960,330,2);spawn('raider',960,550,2);banner('TEST THREE: LUNCH','Hold the pie circle for eight uncontested seconds.');checkpoint(2);}
  }
  function bossPhase(phase){run.phase=phase;run.boss.phase=phase;run.boss.step='stalk';run.boss.timer=2.4;run.boss.blocking=false;run.boss.target=null;if(phase===1){spawn('shield',800,320,2,'Shield guard');spawn('shield',800,560,2,'Shield guard');checkpoint(1);banner('THE SHIELD WALL','His wide sweep can knock his own guards down.');}}
  function rescue(){run.phase=2;run.skinTimer=2;run.skinWarn=false;run.g.ents.filter(e=>!e.human).forEach(e=>{e.dead=true;e.respawn=Infinity;});run.player.hp=run.player.campaignMaxHp;run.player.inv=2;cage(22,8,'Trapped rice soldier');checkpoint(2);banner('THAT ISN’T OURS','Break the living skin patch to free the soldier. Watch for its warned lash.');}
  function begin(id,g,api,resume=false){if(!unlocked(save,id))throw Error('Campaign encounter is locked: '+id);engine=api;const n=byId[id];freshArena(g,n);grid(g);
   const receipt=(g.roundId||'campaign')+':'+id+':'+(++serial);run={node:n,g,difficulty:save.difficulty,player:g.ents[0],receipt,elapsed:0,phase:0,phaseT:0,status:'playing',hits:0,falls:0,blocks:0,parries:0,reflects:0,heavies:0,dashes:0,hold:0,route:0,checkpoint:{x:180,y:440},wave:1,guardsHit:0,bonus:[false,false],warnings:[],effects:[],result:null};
   save.selected=id;const cp=resume&&save.checkpoint&&save.checkpoint.id===id?save.checkpoint.phase:0;run.resumed=cp>0;if(!resume&&save.checkpoint&&save.checkpoint.id===id)save.checkpoint=null;persist();
   if(id==='banquet'){spawn('raider',480,350,2,'Banquet guard');spawn('raider',640,540,2,'Banquet guard');run.zone={x:1100,y:420,r:70,label:'Pantry door'};g.grid[7][26]='h';g.grid[9][26]='h';}
   if(id==='puddings'){run.stands=[{x:460,y:300,hp:4,label:'Vanilla'},{x:640,y:440,hp:4,label:'Chocolate'},{x:460,y:580,hp:4,label:'Strawberry'}];spawn('stand-raider',1060,300,2);spawn('stand-raider',1060,580,2);}
   if(id==='guard')run.guard=spawn('shield',720,440,5,'Rice guard');
   if(id==='biscuit'){run.archer=spawn('archer',840,440,50,'Biscuit Keeper');run.arrowT=1.5;run.exitT=null;}
   if(id==='bridge'){for(const c of [8,16,24])for(let r=4;r<=14;r++)g.grid[r][c]='o';for(let c=3;c<29;c++)g.grid[3][c]='~';run.gates=[{x:440,y:440,r:65},{x:760,y:440,r:65},{x:1100,y:440,r:70}];run.zone={...run.gates[2],label:'Far end'};}
   if(id==='stirling')testPhase(Math.min(2,cp));
   if(id==='steve'){cage(9,8,'Steve’s cage');run.gates=[{x:580,y:300,r:65},{x:820,y:540,r:65},{x:1100,y:440,r:75}];spawn('raider',680,420,2,'Cage guard');spawn('raider',980,530,2,'Cage guard');run.eggT=0;}
   if(id==='rind'){run.boss=spawn('marshal',800,440,8,'Marshal Rind');run.boss.r=28;run.boss.blade='spoon';run.boss.kit={helm:'crest',plume:'brush',metal:'steel'};run.boss.emblem='crown';if(cp===2)rescue();else if(cp){run.boss.hp=4;bossPhase(1);}else bossPhase(0);}
   rebuild();banner(n.title,n.objective);return run;
  }
  function finish(won,reason){if(!run||run.status!=='playing')return null;run.status=won?'won':'failed';run.g.over=true;const id=run.node.id;let bonus;
   if(id==='banquet')bonus=[run.hits===0&&run.falls===0,run.elapsed<=90];
   if(id==='puddings')bonus=[run.stands.every(s=>s.hp===4),run.blocks>=3];
   if(id==='guard')bonus=[run.heavies>0,run.hits===0&&run.falls===0];
   if(id==='biscuit')bonus=[run.reflects>=5,run.hits===0];
   if(id==='bridge')bonus=[run.falls===0,run.gapDash===true];
   if(id==='stirling')bonus=[run.parries>0,!run.resumed&&run.hits===0&&run.falls===0];
   if(id==='steve')bonus=[run.eggOpened!==undefined&&run.elapsed-run.eggOpened<=60,run.hits===0&&run.falls===0];
   if(id==='rind')bonus=[run.guardsHit>0,!run.resumed&&run.hits===0&&run.falls===0];
   const spoons=[won,won&&bonus[0],won&&bonus[1]];const reward=award(save,id,{receipt:run.receipt,spoons,elapsed:run.elapsed,assisted:save.assist});save=reward.save;persist();
   run.result={id,won,reason:reason||'',spoons,added:reward.added,elapsed:run.elapsed,assisted:save.assist,outro:won?run.node.outro:[run.node.tip],next:(next(save)||{}).id||null,checkpoint:save.checkpoint&&save.checkpoint.id===id?save.checkpoint:null};
   // Reward callbacks contain durable spoon provenance, never generic party-match coins.
   if(reward.applied&&reward.added.length&&options.onReward)options.onReward(run.result,save);if(options.onFinish)options.onFinish(run.result);return run.result;
  }
  function attackCircle(x,y,r,source,allies=false){const g=run.g;for(const e of g.ents){if(e===source||!living(e)||distance(e,{x,y})>r+e.r||e.dashT>.06||e.inv>0||e.protect>0||e.hitLock>0)continue;if(e.human||allies){const before=e.hp;engine.hurt(e,source,1,{src:'heavy',kb:allies?650:300,dx:e.x-x,dy:e.y-y});if(!e.human&&e.hp<before)run.guardsHit++;}}}
  function tick(dt){if(!run||run.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;run.elapsed+=dt;run.phaseT+=dt;const g=run.g,p=run.player,id=run.node.id;run.warnings=run.warnings.filter(w=>(w.t-=dt)>0&&(w.actor===undefined||living(g.ents[w.actor])&&!(g.ents[w.actor].stun>0)));run.effects=run.effects.filter(f=>(f.t-=dt)>0);
   if(g.time<=0){finish(false,'Time ran out. '+run.node.tip);return;}
   if(!living(p))return;
   const enemies=g.ents.filter(e=>!e.human&&living(e));
   if(id==='banquet'&&enemies.length===0){run.hold=distance(p,run.zone)<run.zone.r?run.hold+dt:0;if(run.hold>=1.5)finish(true);}
   if(id==='puddings'){if(!run.stands.some(s=>s.hp>0)){finish(false,'All pudding stands were smashed.');return;}if(enemies.length===0){if(run.wave===1){run.wave=2;spawn('stand-raider',1040,280,3);spawn('stand-raider',1040,600,3);banner('SECOND HELPINGS','Two more raiders. Keep a pudding stand standing.');}else finish(true);}}
   if(id==='guard'&&enemies.length===0)finish(true);
   if(id==='biscuit'){run.archer.hp=50;run.archer.campaignMaxHp=50;run.archer.dead=false;run.arrowT-=dt;if(run.arrowT<=0){run.arrowT=(save.assist?2.5:2)/pace();const a=run.archer,angle=Math.atan2(p.y-a.y,p.x-a.x),speed=save.assist?300:390;g.proj.push({k:'arrow',x:a.x-28,y:a.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,owner:a,life:4,r:6,hit:[]});}if(run.reflects>=3){if(run.exitT===null){run.exitT=run.elapsed+7;banner('TOLL PAID','Seven seconds to earn two extra reflections.');}if(run.elapsed>=run.exitT||run.reflects>=5)finish(true);}}
   if(id==='bridge'){const gate=run.gates[run.route];if(gate&&distance(p,gate)<gate.r){run.checkpoint={x:gate.x,y:gate.y};run.route++;banner('CHECKPOINT '+run.route,run.route<3?'The next gold gate is ahead.':'Hold the far end for three seconds.');}if(run.route>=3){run.hold=distance(p,run.zone)<run.zone.r?run.hold+dt:0;if(run.hold>=3)finish(true);}if(p.dashT>0&&p.y>=260&&p.y<=680){for(const c of [8,16,24]){const left=c*40,right=left+40;if(!run.dashGap&&Math.abs(p.x-(left+20))<65&&(p.x<left||p.x>right))run.dashGap={c,side:p.x<left?-1:1};if(run.dashGap&&run.dashGap.c===c&&((run.dashGap.side<0&&p.x>right)||(run.dashGap.side>0&&p.x<left)))run.gapDash=true;}}else run.dashGap=null;}
   if(id==='stirling'){if(run.phase===0&&run.testBlocks>=3)testPhase(1);else if(run.phase===1&&enemies.length===0)testPhase(2);else if(run.phase===2){run.contested=enemies.some(e=>distance(e,run.zone)<110);if(distance(p,run.zone)<run.zone.r&&!run.contested)run.hold+=dt;if(run.hold>=8)finish(true);}}
   if(id==='steve'&&run.eggOpened!==undefined){run.eggT-=dt;if(!p.fx.steve&&!g.pickups.some(q=>q.kind==='steve')&&run.eggT<=0){g.pickups.push({x:run.cage.x,y:run.cage.y,kind:'steve',tier:4,t:0});run.eggT=2;}if(p.fx.steve){const gate=run.gates[run.route];if(gate&&distance(p,gate)<gate.r){run.route++;if(run.route>=3)finish(true);}}}
   if(id==='rind'&&run.phase<2){const b=run.boss;if(b.dead){rescue();}else if(run.phase===0&&b.hp<=4)bossPhase(1);else{b.timer-=dt;if(b.timer<=0){if(b.step==='stalk'){b.step='warn';b.target={x:p.x,y:p.y};b.timer=(save.assist?1.5:1.15)/pace();b.warnMax=b.timer;banner(run.phase?'SPOON SWEEP':'SPOON SLAM','Leave the red circle. His spoon will lodge in the floor.');}else if(b.step==='warn'){attackCircle(b.target.x,b.target.y,run.phase?170:105,b,run.phase===1);run.effects.push({...b.target,r:run.phase?170:105,t:.65,max:.65,kind:'slam'});b.step='exhausted';b.timer=(save.assist?3.8:2.8)/pace();b.recoveryMax=b.timer;b.blocking=false;b.guardLock=3;banner('SPOON STUCK','His shield is down. Get in and bonk him.');}else{b.step='stalk';b.timer=2.4/pace();b.guardLock=0;b.guard=1.5;}}}}
   else if(id==='rind'&&run.phase===2){run.skinTimer-=dt;if(run.skinTimer<=0){if(!run.skinWarn){run.skinWarn=true;run.skinTimer=1/pace();run.warnings.push({...run.cage,r:100,t:run.skinTimer,max:run.skinTimer,label:'Skin lash!'});}else{attackCircle(run.cage.x,run.cage.y,100,run.boss);run.skinWarn=false;run.skinTimer=2.2/pace();}}}
  }
  function input(e,dt){if(!run||!run.g.campaign||e.human)return null;const p=run.player,role=e.campaignRole;let out=noInput();if(run.status!=='playing'||!living(p)||!living(e))return out;if(e.stun>0){cancelStandAttack(e);e.campaignTell=false;return out;}const angle=Math.atan2(p.y-e.y,p.x-e.x),d=distance(p,e);out.faceTo=angle;
   if(role==='archer'){return out;}
   if(role==='marshal'){if(e.step==='stalk'){out.block=true;if(e.guardLock<=0)e.guard=1.5;if(d>160){out.mx=Math.cos(angle)*.5;out.my=Math.sin(angle)*.5;}}return out;}
   if(role==='stand-raider'){const s=run.stands.filter(q=>q.hp>0).sort((a,b)=>distance(e,a)-distance(e,b))[0];if(!s)return out;if(e.standTarget&&e.standTarget!==s)cancelStandAttack(e);if(distance(e,s)>60){cancelStandAttack(e);const v=engine.steer(e,s.x,s.y);out.mx=v.x;out.my=v.y;}else{if(!e.standTimer){e.standTimer=1.4/pace();e.standTarget=s;run.warnings.push({x:s.x,y:s.y,r:55,t:e.standTimer,max:e.standTimer,label:'Protect this pudding',actor:e.id});}e.standTimer-=dt;if(e.standTimer<=0){s.hp--;cancelStandAttack(e);banner('PUDDING UNDER ATTACK',s.label+' stand: '+s.hp+'/4. Bonk its raider.');}}e.campaignTell=false;if(d<90){e.combatTimer=(e.combatTimer||0)+dt*pace();const cycle=e.combatTimer%2.4;e.campaignTell=cycle>1.1&&cycle<1.8;e.campaignWindup=e.campaignTell?(cycle-1.1)/.7:0;out.atk=cycle>1.8&&cycle<1.95;}return out;}
   const defend=role==='examiner';const shield=role==='shield';const cycle=(run.elapsed*(defend?1:pace())+e.id*.35)%(defend?2.7:3.8);const attacking=defend?cycle>1.5&&cycle<1.65:cycle>2.8&&cycle<2.95;
   if(shield&&cycle<2.4&&e.guardLock<=0){out.block=true;e.guard=Math.min(1.5,e.guard+dt*3);}
   const spacing=defend?70:shield?85:68;if(d>spacing){const v=engine.steer(e,p.x,p.y);out.mx=v.x*(shield?.65:.8);out.my=v.y*(shield?.65:.8);}if(d<105)out.atk=attacking;
   e.campaignTell=(defend?cycle> .85&&cycle<1.5:cycle>2.15&&cycle<2.8)&&d<150;e.campaignWindup=e.campaignTell?(cycle-(defend?.85:2.15))/.65:0;
   return out;
  }
  function event(k,data={}){if(!run||run.status!=='playing')return;const p=run.player,g=run.g,id=run.node.id;
   if(k==='ko'){const e=g.ents.find(q=>q.id===data.v);if(e&&!e.human){e.respawn=Infinity;if(e.campaignRole==='archer'||e.campaignRole==='examiner'){e.dead=false;e.hp=e.campaignMaxHp;e.inv=1;}return;}if(data.v===p.id){if(data.src==='pit')run.falls++;if(id==='bridge'&&run.falls<3){banner('BACK TO THE CHECKPOINT',(3-run.falls)+' falls remaining. Take the outer path if needed.');}else finish(false,data.src==='pit'?'You fell from the route.':'You were bonked. '+run.node.tip);}}
   if(k==='respawn'&&data.id===p.id){p.x=run.checkpoint.x;p.y=run.checkpoint.y;p.hp=p.campaignMaxHp;p.vx=p.vy=0;}
   if(k==='block'&&data.id===p.id){run.blocks++;run.testBlocks=(run.testBlocks||0)+1;}
   if(k==='parry'&&data.id===p.id){run.blocks++;run.parries++;run.testBlocks=(run.testBlocks||0)+1;}
   if(k==='reflect'&&data.id===p.id)run.reflects++;
   if(k==='hit'){if(data.v===p.id&&data.damage>0)run.hits++;if(data.a===p.id&&['heavy','bash'].includes(data.src))run.heavies++;}
   if(k==='crate'&&run.cage&&data.c===run.cage.c&&data.r===run.cage.r&&data.destroyed){if(id==='steve'&&run.eggOpened===undefined){run.eggOpened=run.elapsed;g.pickups=g.pickups.filter(q=>distance(q,run.cage)>45);g.pickups.push({x:run.cage.x,y:run.cage.y,kind:'steve',tier:4,t:0});banner('STEVE IS FREE','Collect the golden egg. Ride through the gold gates in order.');}if(id==='rind'&&run.phase===2)finish(true);}
  }
  function objective(){if(!run)return '';const id=run.node.id,aliveEnemies=run.g.ents.filter(e=>!e.human&&living(e)).length;
   if(id==='banquet')return aliveEnemies?`${2-aliveEnemies}/2 guards bonked`:`Pantry door: ${Math.min(1.5,run.hold).toFixed(1)}/1.5s`;
   if(id==='puddings')return `Wave ${run.wave}/2 · ${run.stands.filter(s=>s.hp>0).length}/3 stands standing`;
   if(id==='guard')return `Rice guard: ${run.guard.hp}/5 health`;
   if(id==='biscuit')return `${run.reflects}/3 arrows reflected${run.exitT!==null?' · Extra spoon: '+run.reflects+'/5':''}`;
   if(id==='bridge')return run.route<3?`${run.route}/3 checkpoints · ${3-run.falls} falls left`:`Far end: ${run.hold.toFixed(1)}/3s`;
   if(id==='stirling')return run.phase===0?`Defend: ${Math.min(3,run.testBlocks||0)}/3 blocks`:run.phase===1?'Counter: defeat Sir Stirling':run.contested?`Pie contested — clear the circle · ${run.hold.toFixed(1)}/8s`:`Hold lunch: ${run.hold.toFixed(1)}/8s`;
   if(id==='steve')return run.eggOpened===undefined?'Break the marked cage':!run.player.fx.steve?'Collect the golden egg':`Steve route: ${run.route}/3 gates`;
   if(id==='rind')return run.phase===2?'Break the skin patch. Free the rice soldier.':`Marshal Rind: ${run.boss.hp}/8 · ${run.boss.step==='exhausted'?'SPOON STUCK — ATTACK':run.boss.step==='warn'?'DASH OUT OF THE RED CIRCLE':'Bait his next swing'}`;
   return run.node.objective;
  }
  function draw(ctx){if(!run||!run.g.campaign)return;ctx.save();ctx.font='bold 16px Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=4;
   const bounded=p=>Math.max(0,Math.min(1,p||0));
   function progressRing(o,color,progress){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=6;ctx.arc(o.x,o.y,(o.r||38)+6,-Math.PI/2,-Math.PI/2+Math.PI*2*bounded(progress));ctx.stroke();ctx.lineWidth=4;}
   function marker(o,color,label,progress){ctx.beginPath();ctx.arc(o.x,o.y,o.r||38,0,Math.PI*2);ctx.fillStyle=color+'30';ctx.strokeStyle=color;ctx.fill();ctx.stroke();if(progress!==undefined)progressRing(o,'#FFF7E0',progress);ctx.fillStyle='#FFF7E0';ctx.strokeStyle='#221733';ctx.lineWidth=4;ctx.strokeText(label,o.x,o.y-(o.labelOffset||(o.r||38)+12));ctx.fillText(label,o.x,o.y-(o.labelOffset||(o.r||38)+12));}
   function danger(o,label,progress){marker(o,'#FF5A4E',label,progress);ctx.beginPath();ctx.arc(o.x,o.y,(o.r||38)*Math.sqrt(bounded(progress)),0,Math.PI*2);ctx.fillStyle='#FF5A4E35';ctx.fill();}
   function spoon(x,y,angle,scale){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-60);ctx.lineWidth=14;ctx.strokeStyle='#221733';ctx.stroke();ctx.lineWidth=8;ctx.strokeStyle='#D6DEE8';ctx.stroke();ctx.beginPath();ctx.ellipse(0,-78,18,27,0,0,Math.PI*2);ctx.fillStyle='#D6DEE8';ctx.lineWidth=4;ctx.strokeStyle='#221733';ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,-79,10,17,0,0,Math.PI*2);ctx.fillStyle='#8C9AAE';ctx.fill();ctx.restore();}
   if(run.zone&&!(run.node.id==='stirling'&&run.phase!==2)&&!(run.node.id==='bridge'&&run.route<3)){const max=run.node.id==='stirling'?8:run.node.id==='bridge'?3:1.5;marker({...run.zone,labelOffset:run.zone.r+34},run.contested?'#FFB020':'#2EC4B6',run.contested?'Contested — clear the pie':run.zone.label,run.hold/max);}
   if(run.gates)run.gates.forEach((q,i)=>{if(run.node.id==='bridge'&&run.route>=3&&i===2)return;marker(q,i<run.route?'#2EC4B6':i===run.route?'#FFD23F':'#C9B9E6',(i<run.route?'✓ ':'')+'Gate '+(i+1));});
   if(run.stands)run.stands.forEach(q=>marker({...q,r:35},q.hp>0?'#FF8FB1':'#6A5A8C',q.label+' '+Math.max(0,q.hp)+'/4'));
   if(run.cage&&run.g.grid[run.cage.r][run.cage.c]==='x')marker({...run.cage,r:36},'#FFD23F',run.cage.label+' · swing here');
   for(const w of run.warnings)danger(w,w.label,1-w.t/w.max);
   if(run.boss&&run.phase<2){const b=run.boss;if(b.step==='warn'){const progress=bounded(1-b.timer/(b.warnMax||1.15));danger({...b.target,r:run.phase?170:105},run.phase?'SWEEP — DASH OUT':'SLAM — DASH OUT',progress);spoon(b.x+36,b.y-72-28*progress,-.25+.4*progress,1.1);}else if(b.step==='exhausted'){marker({...b,r:b.r+30,labelOffset:112},'#2EC4B6','SHIELD DOWN — BONK!',b.timer/(b.recoveryMax||2.8));if(b.target)spoon(b.target.x,b.target.y-78,Math.PI-.08,1);}}
   for(const effect of run.effects){const progress=bounded(1-effect.t/effect.max);ctx.save();ctx.globalAlpha=1-progress;ctx.beginPath();ctx.arc(effect.x,effect.y,effect.r*(.8+progress*.22),0,Math.PI*2);ctx.lineWidth=8*(1-progress)+2;ctx.strokeStyle='#FFD23F';ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(effect.x+Math.cos(a)*20,effect.y+Math.sin(a)*20);ctx.lineTo(effect.x+Math.cos(a)*(35+progress*55),effect.y+Math.sin(a)*(35+progress*55));ctx.lineWidth=3;ctx.strokeStyle='#221733';ctx.stroke();}ctx.restore();}
   for(const e of run.g.ents)if(living(e)&&e.campaignTell){ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.arc(e.x,e.y,78,e.face-1.3,e.face+1.3);ctx.closePath();ctx.fillStyle='#FF5A4E30';ctx.strokeStyle='#FF5A4E';ctx.lineWidth=2;ctx.fill();ctx.stroke();marker({...e,r:54,labelOffset:112},'#FF5A4E','Block the swing',e.campaignWindup);}
   ctx.restore();
  }
  function stop(){run=null;}
  function restore(raw){save=normalize(raw);persist();return save;}
  return {begin,tick,input,event,draw,finish,stop,select,assist,difficulty,restore,objective,get save(){return save;},get run(){return run;},get saveError(){return saveError;},unlocked:id=>unlocked(save,id),next:()=>next(save)};
 }
 return {KEY,difficulties,nodes,byId,factions,checkpointLabel,normalize,merge,unlocked,next,award,create};
});
