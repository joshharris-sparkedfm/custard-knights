(async()=>{
 const checks=[],details={},add=(name,pass,data)=>checks.push({name,pass:!!pass,...(data===undefined?{}:{details:data})});
 const clear=()=>{for(const key of Object.keys(CK.keys))delete CK.keys[key];};
 const tick=n=>{for(let i=0;i<n;i++)CK.update(1/60);};
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function until(fn,ms=8000){const end=performance.now()+ms;while(performance.now()<end){if(fn())return true;await wait(40);}return false;}
 function fixture(options={}){
  clear();CK.NET.role=null;CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);Object.assign(CK.cfg,{players:2,map:'courtyard',mode:'ffa',chaosSpeed:'normal',length:180,diff:'medium',...options});CK.start();CK.freeze(true);
  const g=CK.G();g.pickups=[];g.pads=[];g.spawnT=g.mayhemAt=g.norrAt=1e9;g.steveDone=true;g.ents=g.ents.slice(0,2);
  for(const [i,e] of g.ents.entries())Object.assign(e,{x:400+i*180,y:140,vx:0,vy:0,protect:0,inv:0,face:i?Math.PI:0});
  return {g,p:g.ents[0],q:g.ents[1]};
 }
 try{
  CK.presentationSettings({flash:false,shake:0});
  for(const mode of Object.keys(CK.MODES)){
   const {g,p,q}=fixture({mode,chaosSpeed:'simple'});g.mayhemAt=0;g.norrAt=0;g.steveDone=false;g.steveAt=g.time;g.clock=30;g.time=150;
   CK.hurt(q,p,99,{force:true,kb:0});tick(125);
   add(mode+' Simple remains at zero after real KO and scheduled escalation opportunities',g.chaos===0&&!g.ev&&!g.mayhem&&!g.pickups.some(p=>['steve','norr'].includes(p.kind)),{chaos:g.chaos,event:g.ev?.kind,mayhem:g.mayhem?.kind,pickups:g.pickups.map(p=>p.kind)});
  }
  for(const diff of ['easy','medium','hard','steve']){
   let {g}=fixture({diff,chaosSpeed:'normal'});const before=g.chaos;tick(60);add('Normal retains existing 115-second clock pacing on '+diff,Math.abs(g.chaos-before-1/115)<1e-7,{before,after:g.chaos});
   ({g}=fixture({diff,chaosSpeed:'insane'}));const initial=g.chaos;g.chaos=.999;tick(60);add('Insane starts heightened and stays capped independently of '+diff,initial===.33&&g.chaos===1,{initial,after:g.chaos});
  }
  add('Settings exposes Simple, Normal and Insane independently of difficulty',Array.from(document.querySelectorAll('[data-k="chaosSpeed"] button')).map(b=>b.textContent.trim()).join(',')==='Simple,Normal,Insane');
  for(const speed of ['simple','normal','insane']){document.querySelector('[data-k="chaosSpeed"] [data-v="'+speed+'"]').click();add(speed+' is persisted through actual settings UI',JSON.parse(localStorage.getItem('ck-cfg')).chaosSpeed===speed);}
  let {g,p,q}=fixture({chaosSpeed:'simple'});CK.startMayhem('trapdoor');CK.startEvent('boss',p);CK.applyPU(p,'steve');CK.applyPU(p,'norr');CK.applyPU(p,'giant');for(let i=0;i<20;i++)CK.spawnPickup();
  add('Simple blocks explicit escalating event and special pickup entry paths',!g.ev&&!g.mayhem&&!p.fx.steve&&!p.fx.norr&&!p.fx.giant&&g.pickups.every(p=>p.tier===1));
  CK.giveWeapon(p,'crossbow');CK.keys.KeyF=true;tick(1);clear();add('Simple retains ordinary weapon combat',g.proj.some(p=>p.k==='bolt'));
  add('Simple cannot activate either rare event',!CK.startRareEvent({kind:'nae',ownerId:p.id})&&!CK.startRareEvent({kind:'mcginley',ownerId:p.id}));
  for(const [kind,roll] of [['nae',.005],['mcginley',.015]]){
   fixture();CK.newGame(false);g=CK.G();let calls=0;const rng=()=>++calls===1?roll:0;CK.initArenaChaos('normal',rng);const plan=g.rarePlan;
   CK.initArenaChaos('normal',()=>{calls++;return 0;});g.clock=plan.at;g.ev={kind:'jelly',owner:g.ents[0],t:5,max:5};for(let i=0;i<120;i++)CK.updateRareEvent();
   add(kind+' low-roll plan initializes once and remains unchanged while busy',calls===2&&g.rarePlan===plan&&plan.kind===kind&&!g.rareEvent,{calls,kind:plan.kind});
   g.ev=null;for(const e of g.ents){e.dead=true;e.respawn=999;}g.ents[0].human=1;g.ents[1].human=2;g.ents[1].dead=false;g.ents[1].falling=0;g.ents[2].dead=false;g.ents[2].human=0;
   CK.updateRareEvent();const event=g.rareEvent;
   add(kind+' planned event selects the only living eligible human',event?.kind===kind&&event.ownerId===g.ents[1].id,{ownerId:event?.ownerId});
   CK.endRareEvent();for(let i=0;i<120;i++)CK.updateRareEvent();add(kind+' selected round cannot produce another rare event',!g.rareEvent&&g.rarePlan.done&&g.rareUsed&&!CK.startRareEvent({kind:'nae',ownerId:g.ents[1].id}));
  }
  ({g,p}=fixture({mode:'race'}));add('Chicken Racing cannot activate rare events',g.rarePlan?.kind===null&&!CK.startRareEvent({kind:'nae',ownerId:p.id}));
  CK.adventure.launch('banquet',false);CK.freeze(true);g=CK.G();add('Actual campaign boot has no arena chaos policy or allocated rare plan',g.campaign&&!g.rarePlan&&!g.chaosPolicy&&!CK.startRareEvent({kind:'nae',ownerId:g.ents[0].id}));CK.adventure.stop();
  CK.toMenu();CK.massBattle().open();add('Faction entry cannot activate arena rare events',!CK.startRareEvent({kind:'nae',ownerId:0})&&CK.G().demo);CK.massBattle().close();
  const faction=CKMassBattle.create({mode:'brawl',teamSize:4});add('Faction simulation has no arena rare plan or AK equipment',!faction.rarePlan&&!faction.rareEvent&&faction.players.every(p=>!p.wpn));
  ({g,p}=fixture());CK.NET.role='client';add('Guest cannot choose or activate a rare event',!CK.startRareEvent({kind:'nae',ownerId:p.id}));CK.NET.role=null;
  ({g,p,q}=fixture());q.x=1100;CK.startRareEvent({kind:'nae',ownerId:p.id});add('Oh Nae Nae equips exactly 30 rounds for a 12-second event',p.wpn?.kind==='ak47'&&p.wpn.ammo===30&&g.rareEvent.endsAt-g.rareEvent.startedAt===12&&!Object.hasOwn(CK.WEAPONS,'ak47'));
  CK.keys.KeyF=true;tick(1);add('AK actual attack input consumes one round and applies rapid-fire cadence',p.wpn.ammo===29&&Math.abs(p.fireCd-.12)<1e-6&&g.proj.some(s=>s.k==='bullet'));tick(6);add('AK cannot fire faster than its reload',p.wpn.ammo===29);tick(2);add('AK held input fires after its reload window',p.wpn.ammo===28);for(let i=0;i<280&&g.rareEvent;i++)tick(1);clear();add('AK exhausts 30 rounds and clears the event without unlimited fire',!p.wpn&&!g.rareEvent&&g.stats.shots.h===30,{shots:g.stats.shots.h});
  for(const action of ['expiry','death','fall','replacement','end','menu','rematch']){
   ({g,p,q}=fixture());CK.startRareEvent({kind:'nae',ownerId:p.id});
   if(action==='expiry')tick(721);if(action==='death')CK.hurt(p,q,99,{force:true,kb:0});if(action==='fall')CK.startFall(p);if(action==='replacement')CK.giveWeapon(p,'bow');if(action==='end')CK.endMatch();if(action==='menu')CK.toMenu();if(action==='rematch')CK.rematch();
   add('AK '+action+' removes rare equipment and event',!g.rareEvent&&p.wpn?.kind!=='ak47',{weapon:p.wpn?.kind});CK.freeze(true);
  }
  for(const scenario of ['enemy','protected','guarded','ally','blocked-los','out-of-range']){
   ({g,p,q}=fixture({mode:scenario==='ally'?'teams':'ffa'}));if(scenario==='protected')q.protect=3;if(scenario==='guarded')CK.keys.KeyL=true;if(scenario==='blocked-los'){p.x=100;p.y=180;q.x=260;q.y=180;}if(scenario==='out-of-range')q.x=900;
   CK.startRareEvent({kind:'mcginley',ownerId:p.id});tick(80);clear();add('McGinley '+scenario+' obeys target eligibility and guard',q.hp===(scenario==='enemy'?2:3),{hp:q.hp,strikes:g.rareEvent?.strikes});
  }
  ({g,p,q}=fixture());q.campaignMaxHp=20;q.hp=20;CK.startRareEvent({kind:'mcginley',ownerId:p.id});const lightning=g.rareEvent;let largestHit=0;for(let i=0;i<610;i++){const hp=q.hp;tick(1);largestHit=Math.max(largestHit,hp-q.hp);}
  add('McGinley lasts ten seconds with at most eight one-damage strikes',!g.rareEvent&&lightning.strikes===8&&largestHit===1&&q.hp>=12&&q.hp<20,{strikes:lightning.strikes,hp:q.hp,largestHit});
  ({g,p,q}=fixture());CK.startRareEvent({kind:'mcginley',ownerId:p.id});CK.keys.ArrowLeft=true;CK.keys.KeyK=true;tick(1);clear();g.rareEvent.nextAt=g.clock;CK.updateRareEvent();add('McGinley respects the immunity window of an actual normal dash',q.dashT>.06&&q.hp===3,{dashT:q.dashT,hp:q.hp});tick(7);g.rareEvent.nextAt=g.clock;CK.updateRareEvent();add('McGinley can damage the same knight after dash immunity ends',q.dashT<=.06&&q.hp===2,{dashT:q.dashT,hp:q.hp});
  for(const kind of ['nae','mcginley']){({g,p,q}=fixture());CK.startRareEvent({kind,ownerId:q.id});const id='qa-rare-disconnect';q.netId=id;CK.NET.role='host';CK.NET.players=[{id:'host',name:'Host'},{id,name:'Guest'}];CK.NET.conns.set(id,{open:false});CK.hostDrop(id);CK.updateRareEvent();add(kind+' actual host disconnect callback clears power when the recipient becomes a bot',q.human===0&&!q.netId&&!g.rareEvent&&q.wpn?.kind!=='ak47');CK.NET.role=null;CK.NET.players=[];}
  for(const action of ['death','fall','end','menu','rematch']){({g,p,q}=fixture());CK.startRareEvent({kind:'mcginley',ownerId:p.id});if(action==='death')CK.hurt(p,q,99,{force:true,kb:0});if(action==='fall')CK.startFall(p);if(action==='end')CK.endMatch();if(action==='menu')CK.toMenu();if(action==='rematch')CK.rematch();add('McGinley '+action+' removes the event',!g.rareEvent);CK.freeze(true);}
  for(const sample of [0,.999]){
   fixture();CK.newGame(false);g=CK.G();let calls=0;CK.initArenaChaos('normal',()=>++calls===1?.005:0);g.clock=g.rarePlan.at;const random=Math.random;try{Math.random=()=>sample;CK.updateRareEvent();}finally{Math.random=random;}
   add('Rare recipient sample '+sample+' chooses from living humans rather than always the first',g.rareEvent?.ownerId===(sample===0?0:1),{ownerId:g.rareEvent?.ownerId});
  }
  const expected='audio/13-oh-nae-nae-whats-your-name.wav',audio=__chaosAudio.audios[0];
  for(const kind of ['nae','mcginley']){({g,p}=fixture());g.clock=63.9;CK.startRareEvent({kind,ownerId:p.id});const s=CK.snapshot(),duration=CKChaos.rare[kind].duration;CK.NET.role='client';CK.NET.me=0;g.rareEvent=null;CK.clientRecv(s);add(kind+' fractional start time remains bounded and accepted by guest snapshot',s.rare.remaining<=duration&&g.rareEvent?.kind===kind,{remaining:s.rare.remaining});CK.NET.role=null;}
  add('Installed rare cue selects the original local WAV',CK_SOUNDTRACK['oh-nae-nae']===expected);
  ({g,p,q}=fixture());CK.startRareEvent({kind:'nae',ownerId:p.id});add('A paused event cannot take over the current scene music',CK.musicState().cue!=='oh-nae-nae');CK.setPause(false);CK.freeze(true);
  add('Unpausing activates native playback of the actual rare WAV',await until(()=>CK.musicState().cue==='oh-nae-nae'&&audio.getAttribute('src')===expected&&!audio.paused&&audio.readyState>=2&&Number.isFinite(audio.duration)&&!audio.error),{cue:CK.musicState(),duration:audio.duration});
  const mediaBefore=audio.currentTime;add('Rare WAV native playback advances without a media error',await until(()=>audio.currentTime>mediaBefore+.15&&!audio.error));details.media={source:audio.getAttribute('src'),duration:audio.duration,currentTime:audio.currentTime};
  const packet=CK.snapshot(),plays=__chaosAudio.plays,loads=__chaosAudio.loads,startTime=audio.currentTime;CK.NET.role='client';CK.NET.me=0;CK.freeze(false);for(let i=0;i<60;i++)CK.clientRecv(packet);await wait(200);
  add('Repeated guest rare snapshots preserve one music playhead without reload or restart',g.rareEvent?.kind==='nae'&&__chaosAudio.plays===plays&&__chaosAudio.loads===loads&&audio.currentTime>=startTime&&__chaosAudio.audios.length===1,{plays,afterPlays:__chaosAudio.plays,loads,afterLoads:__chaosAudio.loads});
  const beforeState=g.ents.map(e=>({hp:e.hp,score:e.score,deaths:e.deaths}));const lightningPacket=JSON.parse(JSON.stringify(packet));lightningPacket.rare={kind:'mcginley',ownerId:p.id,remaining:10};CK.clientRecv(lightningPacket);for(let i=0;i<80;i++){CK.updateRareEvent();CK.clientTick(1/60);}
  add('Guest lightning snapshots produce presentation without client-side damage or scoring',JSON.stringify(beforeState)===JSON.stringify(g.ents.map(e=>({hp:e.hp,score:e.score,deaths:e.deaths})))&&g.rareEvent?.kind==='mcginley');
  const endedPacket=JSON.parse(JSON.stringify(packet));endedPacket.rare=null;CK.clientRecv(endedPacket);add('Guest removal snapshot restores ordinary match music',!g.rareEvent&&CK.musicState().cue==='courtyard');
  CK.clientRecv(packet);for(let i=0;i<725;i++)CK.clientTick(1/60);add('Guest rare effect and music expire during snapshot silence',!g.rareEvent&&CK.musicState().cue==='courtyard');CK.NET.role=null;CK.freeze(true);
  for(const action of ['expiry','end','menu','rematch']){
   ({g,p}=fixture());CK.setPause(false);CK.startRareEvent({kind:'nae',ownerId:p.id});
   if(action==='expiry')tick(725);if(action==='end')CK.endMatch();if(action==='menu')CK.toMenu();if(action==='rematch')CK.rematch();
   const cue=CK.musicState().cue;add('Rare '+action+' restores the correct music priority',action==='end'?['victory','defeat'].includes(cue):cue===(action==='menu'?'menu':'courtyard'),{cue});CK.freeze(true);
  }
  ({g,p}=fixture());CK.setPause(false);CK.startRareEvent({kind:'nae',ownerId:p.id});const lateRare=CK.snapshot();CK.endMatch();const resultCue=CK.musicState().cue;CK.NET.role='client';CK.clientRecv(lateRare);add('Late rare snapshot cannot replace a finished round result cue',g.over&&CK.musicState().cue===resultCue&&!g.rareEvent);CK.NET.role=null;CK.freeze(true);
  add('Native music uses exactly one Audio instance without media errors',__chaosAudio.audios.length===1&&__chaosAudio.errors.length===0,{instances:__chaosAudio.audios.length,errors:__chaosAudio.errors});
  window.qaChaosScene=kind=>{const {g,p,q}=fixture();p.x=420;p.y=380;q.x=660;q.y=380;p.spot=q.spot=0;CK.presentationSettings({flash:false,shake:0});CK.startRareEvent({kind,ownerId:p.id});g.tips=[];g.tip=null;g.tipT=0;g.floaters=[];g.parts=[];if(kind==='mcginley'){g.rareEvent.nextAt=g.clock;CK.updateRareEvent();}else CK.fire(p);g.shake=0;CK.draw();return {kind,parts:g.parts.map(p=>p.kind),flash:false};};
 }catch(error){return {checks,details,failure:error.stack};}
 return {checks,details,limitations:'Isolated native Chromium with synthetic profiles and controlled arena fixtures. Real simulation/input/collision/snapshot paths. Rare selection odds are covered by separate pure tests; forced plans here check integration, not statistical randomness. Native media checks do not certify auditory quality or speakers.'};
})()
