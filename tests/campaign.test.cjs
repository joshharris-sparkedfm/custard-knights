const test=require('node:test'),assert=require('node:assert/strict'),C=require('../game/campaign.js');
test('Rind warning priority keeps exact authored tell expiry and releases the punish objective',()=>{
 for(const difficulty of ['easy','medium','hard','steve'])for(const assisted of [false,true]){
  const h=harness('rind');h.c.difficulty(difficulty);h.c.assist(assisted);h.c.begin('rind',h.g,h.api);h.tick(2.5);
  const b=h.c.run.boss;assert.equal(h.g.banner.kind,'hazard');assert.equal(h.g.banner.key,'campaign:rind:boss-tell');assert.equal(h.g.banner.max,b.timer);
  const W=require('../game/warnings.js'),result=W.offer(h.g.banner,{title:'Egg!',sub:'',col:'#FFD23F',t:2.8,max:2.8,kind:'reward',key:'pickup:steve'});
  assert.equal(result.accepted,false);assert.equal(h.g.banner.title,'SPOON SLAM');
  h.p.x=100;h.p.y=100;h.tick(b.timer+.01);assert.equal(h.g.banner.title,'SPOON STUCK');assert.equal(h.g.banner.kind,'objective');
  h.c.finish(false,'fixture');assert.equal(h.g.banner,null);
 }
});
test('Rind phase change and rescue replace obsolete warnings while preserving the real script',()=>{
 const h=harness('rind');h.tick(2.5);h.c.run.boss.hp=4;h.tick(.01);
 assert.equal(h.g.banner.title,'THE SHIELD WALL');assert.equal(h.c.run.boss.step,'stalk');
 h.tick(2.5);assert.equal(h.g.banner.title,'SPOON SWEEP');h.c.run.boss.dead=true;h.tick(.01);
 assert.equal(h.g.banner.kind,'objective');assert.equal(h.c.run.phase,2);
 h.tick(2.1);assert.equal(h.g.banner.title,'SKIN LASH');assert.equal(h.g.banner.max,h.c.run.skinTimer);
 h.c.stop();assert.equal(h.g.banner,null);
});
test('pudding danger is announced before damage and canceled tells get a fresh authored cue key',()=>{
 const h=harness('puddings'),e=h.g.ents.find(e=>e.campaignRole==='stand-raider'),stand=h.c.run.stands[0],shown=[];
 h.api.showBanner=(b,kind,key,cue)=>{shown.push({b,kind,key,cue,hp:stand.hp});h.g.banner={...b,kind,key};};
 h.api.clearBanner=key=>{if(!key||h.g.banner?.key===key)h.g.banner=null;};
 e.x=stand.x;e.y=stand.y;h.c.input(e,.01);
 assert.equal(shown[0].kind,'hazard');assert.equal(shown[0].cue,'alarm');assert.equal(shown[0].hp,4);assert.equal(shown[0].b.max,1.4);
 const originalKey=shown[0].key;e.x+=100;h.c.input(e,.01);assert.equal(h.g.banner,null);assert.equal(stand.hp,4);
 e.x=stand.x;h.c.input(e,.01);assert.notEqual(shown[1].key,originalKey);assert.equal(shown[1].hp,4);
 h.c.input(e,1.4);assert.equal(stand.hp,3);assert.equal(h.g.banner.kind,'objective');assert.equal(shown.at(-1).cue,null);
});
test('all story difficulties preserve health, objectives, checkpoints and legacy spoons',()=>{
 for(const difficulty of Object.keys(C.difficulties))for(const node of C.nodes){
  const h=harness(node.id),before=h.c.save.results;h.c.difficulty(difficulty);
  const g={roundId:'difficulty',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};h.c.begin(node.id,g,h.api);
  assert.equal(h.c.run.difficulty,difficulty);assert.equal(g.ents[0].hp,3);assert.deepEqual(h.c.save.results,before);
  for(let k=0;k<180;k++){h.c.tick(1/60);for(const e of g.ents.slice(1)){const i=h.c.input(e,1/60);assert.ok(Number.isFinite(i.mx)&&Number.isFinite(i.my));}}
  assert.ok(h.c.objective().length>0);const restored=C.normalize(JSON.parse(h.storage.data));assert.equal(restored.difficulty,difficulty);
 }
 assert.equal(C.normalize({difficulty:'__proto__'}).difficulty,'medium');
});
test('story STEVE keeps readable fixed boss tells and punish windows; Easy gives longer windows',()=>{
 const windows=[];
 for(const difficulty of ['easy','medium','hard','steve']){
  const h=harness('rind');h.c.difficulty(difficulty);h.c.begin('rind',h.g,h.api);h.c.tick(2.5);const b=h.c.run.boss,target={...b.target};
  windows.push(b.timer);assert.ok(b.timer>=.8);h.p.x=100;h.p.y=100;h.c.tick(b.timer+.01);assert.deepEqual(b.target,target);assert.equal(b.step,'exhausted');assert.ok(b.timer>=2);assert.equal(b.hp,8);
 }
 assert.ok(windows.every((v,i)=>i===0||v<windows[i-1]));
});
function unlockedSave(){const s=C.normalize({});for(const n of C.nodes)s.results[n.id]={spoons:[true,false,false],attempts:1,best:100,assisted:false};return s;}
function harness(id='banquet',options={}){
 const storage={data:null,getItem(){return this.data;},setItem(k,v){this.data=v;}};let finished=[];const c=C.create({storage,onFinish:r=>finished.push(r)});c.restore(unlockedSave());
 const hits=[];const api={makeKnight:o=>({r:22,dead:false,falling:0,inv:0,stun:0,dashT:0,guardLock:0,guard:1.5,vx:0,vy:0,face:0,fx:{},...o}),redraw(){},steer:(e,x,y)=>{const d=Math.hypot(x-e.x,y-e.y)||1;return {x:(x-e.x)/d,y:(y-e.y)/d};},hurt(e,a,d,o){hits.push({e,a,d,o});c.event('hit',{v:e.id,a:a.id,damage:d,src:o.src});e.hp-=d;if(e.hp<=0){e.dead=true;c.event('ko',{v:e.id,a:a.id,src:o.src});}}};
 const g={roundId:'test-round',ents:[api.makeKnight({id:0,human:1,hp:3})],flows:new Map()};c.begin(id,g,api);return {c,g,p:g.ents[0],api,hits,storage,finished,tick(t){g.time-=t;c.tick(t);}};
}
test('main route skips biscuit toll, locked nodes reject launch',()=>{let s=C.normalize({});assert.equal(C.next(s).id,'banquet');assert.equal(C.unlocked(s,'rind'),false);for(const id of ['banquet','puddings','guard'])s=C.award(s,id,{receipt:id,spoons:[true],elapsed:20}).save;assert.equal(C.next(s).id,'bridge');assert.equal(C.unlocked(s,'biscuit'),true);const c=C.create({storage:null});assert.throws(()=>c.begin('rind',{},{}),/locked/);});
test('spoons merge across replays and duplicate receipts never pay twice',()=>{let s=C.normalize({});const a=C.award(s,'banquet',{receipt:'one',spoons:[true,true,false],elapsed:40});assert.deepEqual(a.added,[0,1]);const b=C.award(a.save,'banquet',{receipt:'two',spoons:[true,false,true],elapsed:35});assert.deepEqual(b.save.results.banquet.spoons,[true,true,true]);assert.deepEqual(b.added,[2]);assert.equal(b.save.results.banquet.best,35);const duplicate=C.award(b.save,'banquet',{receipt:'two',spoons:[true,true,true]});assert.equal(duplicate.applied,false);assert.equal(duplicate.save.results.banquet.attempts,2);});
test('save normalization tolerates corruption, malformed spoons and missing versions',()=>{assert.deepEqual(C.normalize({results:{banquet:{spoons:['true',true,1],attempts:-1,best:'bad'}}}).results.banquet,{spoons:[false,true,false],attempts:0,best:null,assisted:false});const c=C.create({storage:{getItem(){return '{broken';},setItem(){throw Error('full');}}});assert.equal(c.next().id,'banquet');c.select('banquet');assert.equal(c.saveError,true);});
function bonkEnemies(h){for(const e of h.g.ents.filter(e=>!e.human&&!e.dead)){e.dead=true;h.c.event('ko',{v:e.id,a:0,src:'sword'});assert.equal(e.respawn,Infinity);}}
function openPantry(h){const q=h.c.run.cage;h.g.grid[q.r][q.c]='.';h.g.crateHp[q.r*32+q.c]=0;h.c.event('crate',{c:q.c,r:q.r,destroyed:true});}
function escortCooks(h){for(let i=0;i<1500&&h.c.run.phase===1;i++){const s=h.c.run.staff.find(s=>!s.rescued);h.p.x=s.x+60;h.p.y=s.y;h.tick(1/60);}assert.equal(h.c.run.phase,2);}
test('banquet needs the actual destroyed barricade plus guards before any civilian can move',()=>{
 const h=harness(),q=h.c.run.cage;h.p.score=100;h.p.x=1100;h.tick(2);assert.equal(h.c.run.phase,0);assert.equal(h.c.run.status,'playing');assert.equal(h.g.ents.length,3);assert.equal(h.c.run.staff.length,3);assert.equal(h.g.crateHp[q.r*32+q.c],3);
 h.c.event('crate',{c:q.c+1,r:q.r,destroyed:true});h.c.event('crate',{c:q.c,r:q.r,destroyed:false});h.c.event('crate',{c:q.c,r:q.r,destroyed:true});assert.equal(h.c.run.barricadeOpen,false);
 bonkEnemies(h);h.tick(2);assert.equal(h.c.run.phase,0);assert.match(h.c.objective(),/Swing at barricade/);openPantry(h);h.tick(.1);assert.equal(h.c.run.phase,1);assert.ok(h.c.run.staff.every(s=>!s.following&&!s.rescued));assert.match(h.c.objective(),/0\/3 cooks safe/);
});
test('banquet escort needs proximity, routes through the open doorway and never treats cooks as combatants',()=>{
 const h=harness();openPantry(h);h.tick(.1);assert.equal(h.c.run.phase,0);bonkEnemies(h);h.tick(.1);const s=h.c.run.staff[0],start={x:s.x,y:s.y};h.tick(5);assert.deepEqual({x:s.x,y:s.y},start);
 h.p.x=s.x;h.p.y=s.y;h.tick(.2);assert.equal(s.following,true);assert.ok(s.x>start.x);const after={x:s.x,y:s.y};h.p.x=1100;h.p.y=420;h.tick(2);assert.equal(s.waiting,true);assert.deepEqual({x:s.x,y:s.y},after);assert.equal(h.c.run.phase,1);
 for(let i=0;i<1800&&h.c.run.phase===1;i++){const cook=h.c.run.staff.find(c=>!c.rescued);h.p.x=cook.x+60;h.p.y=cook.y;h.tick(1/60);for(const c of h.c.run.staff){if(c.x>=720&&c.x<=800)assert.equal(c.y,420);assert.equal(h.g.ents.includes(c),false);}}
 assert.equal(h.c.run.phase,2);assert.ok(h.c.run.staff.every(c=>c.rescued));assert.equal(h.g.ents.filter(e=>!e.human&&!e.dead).length,2);assert.match(h.c.objective(),/2 guards left/);
});
test('banquet requires a real reinforcement defeat, six seconds in pantry, then final exit',()=>{
 const h=harness();bonkEnemies(h);openPantry(h);h.tick(.1);escortCooks(h);h.p.x=1100;h.p.y=420;h.tick(8);assert.equal(h.c.run.hold,0);assert.equal(h.c.run.phase,2);
 h.p.x=960;h.tick(6);assert.equal(h.c.run.phase,2);assert.equal(h.c.run.status,'playing');bonkEnemies(h);h.tick(.1);assert.equal(h.c.run.phase,3);assert.equal(h.c.run.hold,0);h.tick(2);assert.equal(h.c.run.status,'playing');h.p.x=1100;h.tick(1);h.p.x=960;h.tick(.1);assert.equal(h.c.run.hold,0);h.p.x=1100;h.tick(1.6);assert.equal(h.finished[0].won,true);assert.deepEqual(h.finished[0].spoons,[true,true,true]);assert.equal(h.finished.length,1);
 h.c.begin('banquet',h.g,h.api);assert.equal(h.c.run.phase,0);assert.equal(h.c.run.barricadeOpen,false);assert.equal(h.c.run.staff.filter(s=>s.rescued).length,0);assert.deepEqual(h.c.save.results.banquet.spoons,[true,true,true]);
});
test('pudding attackers warn and damage stands; bonking all wave enemies is needed',()=>{const h=harness('puddings');const e=h.g.ents[1],s=h.c.run.stands[0];e.x=s.x;e.y=s.y;h.c.input(e,.1);assert.equal(s.hp,4);assert.ok(h.c.run.warnings.length);h.c.input(e,1.5);assert.equal(s.hp,3);for(const e of h.g.ents.slice(1))e.dead=true;h.tick(.1);assert.equal(h.c.run.wave,2);assert.equal(h.c.run.status,'playing');for(const e of h.g.ents.slice(1))e.dead=true;h.tick(.1);assert.equal(h.finished[0].won,true);assert.equal(h.finished[0].spoons[1],false);});
test('destroying every pudding stand fails without awarding completion',()=>{const h=harness('puddings');h.c.run.stands.forEach(s=>s.hp=0);h.tick(.1);assert.equal(h.finished[0].won,false);assert.deepEqual(h.finished[0].spoons,[false,false,false]);});
test('arrow trial counts actual reflections, grants extra-feat window, keeps archer alive',()=>{const h=harness('biscuit');h.tick(2);assert.equal(h.g.proj.length,1);h.g.ents[1].dead=true;h.c.event('ko',{v:1,a:0,src:'bow'});assert.equal(h.g.ents[1].dead,false);for(let i=0;i<3;i++)h.c.event('reflect',{id:0});h.tick(.1);assert.equal(h.c.run.status,'playing');assert.ok(h.c.run.exitT>h.c.run.elapsed);for(let i=0;i<2;i++)h.c.event('reflect',{id:0});h.tick(.1);assert.equal(h.finished[0].won,true);assert.equal(h.finished[0].spoons[1],true);});
test('bridge sequential checkpoints survive falls; third fall fails',()=>{const h=harness('bridge');h.p.x=1100;h.tick(.1);assert.equal(h.c.run.route,0);h.p.x=440;h.tick(.1);assert.equal(h.c.run.route,1);h.p.dead=true;h.c.event('ko',{v:0,src:'pit'});assert.equal(h.c.run.status,'playing');h.p.dead=false;h.c.event('respawn',{id:0});assert.equal(h.p.x,440);for(let i=0;i<2;i++)h.c.event('ko',{v:0,src:'pit'});assert.equal(h.finished[0].won,false);});
test('bridge cannot finish by skipping gates; dash feat requires crossing the whole gap',()=>{const h=harness('bridge');h.p.x=300;h.p.dashT=.12;h.tick(.1);assert.notEqual(h.c.run.gapDash,true);h.p.x=380;h.tick(.1);assert.equal(h.c.run.gapDash,true);for(const x of [440,760,1100]){h.p.x=x;h.tick(.1);}h.tick(3);assert.equal(h.finished[0].won,true);assert.deepEqual(h.finished[0].spoons,[true,true,true]);});
function advanceTools(h){for(let i=0;i<100&&h.c.run.phase===0;i++){h.p.x=h.c.run.tools.x;h.p.y=h.c.run.tools.y;h.tick(.1);}assert.equal(h.c.run.phase,1);}
test('Stirling advances tools through player proximity, without a mandatory block or friendly damage target',()=>{
 const h=harness('stirling');h.tick(8);assert.equal(h.c.run.tools.x,340);assert.equal(h.c.run.phase,0);
 for(let i=0;i<3;i++)h.c.event('block',{id:0});h.tick(.1);assert.equal(h.c.run.phase,0);
 h.p.x=340;h.tick(.5);assert.equal(h.c.run.tools.x,385);h.p.x=180;h.tick(1);assert.equal(h.c.run.tools.x,385);
 advanceTools(h);assert.equal(h.c.run.tools.delivered,true);assert.equal(h.c.run.accessClear,false);assert.equal(h.g.grid[9][21],'#');
 assert.equal(h.g.ents.some(e=>e.name==='Sir Stirling'),false);assert.equal(h.g.ents[1].name,'Service access raider');assert.ok(h.c.run.support.blocked>0);
 h.c.event('parry',{id:0});bonkEnemies(h);h.tick(.1);assert.equal(h.c.run.phase,2);assert.equal(h.c.run.accessClear,true);assert.equal(h.g.grid[9][21],'#');assert.equal(h.c.run.serviceOpen,false);
 h.p.x=720;h.g.ents.slice(1).forEach(e=>e.dead=true);h.tick(8.1);assert.equal(h.finished[0].won,true);assert.equal(h.finished[0].spoons[1],true);
});
test('Stirling can finish all support stages without one block; interruption resets the tools hold',()=>{
 const h=harness('stirling');advanceTools(h);bonkEnemies(h);h.tick(.1);assert.equal(h.c.run.phase,2);
 h.p.x=720;h.p.y=440;h.g.ents[1].x=720;h.g.ents[1].y=440;h.tick(1);assert.equal(h.c.run.hold,0);assert.match(h.c.objective(),/contested/);
 h.g.ents.slice(1).forEach(e=>e.dead=true);h.tick(2);assert.equal(h.c.run.hold,2);h.p.x=500;h.tick(.1);assert.equal(h.c.run.hold,0);
 h.p.x=720;h.tick(7.9);assert.equal(h.c.run.status,'playing');h.tick(.2);assert.equal(h.finished[0].won,true);assert.equal(h.c.run.blocks,0);assert.equal(h.c.run.serviceOpen,true);assert.equal(h.g.grid[9][21],'.');assert.equal(h.finished[0].spoons[1],false);
});
test('Stirling prevents scheduled north-lane combat arrivals without becoming an enemy',()=>{
 const h=harness('stirling');h.tick(3);assert.equal(h.c.run.support.blocked,1);assert.equal(h.g.ents.length,1);
 // Diagnostic removal of support proves that the intercepted arrival would
 // join combat. Ordinary play guarantees covering; it adds no escort tax.
 h.c.run.support.covering=false;h.tick(3);assert.equal(h.g.ents[1].name,'North lane pursuer');assert.equal(h.g.ents[1].campaignRole,'raider');
});
test('legacy Stirling checkpoints reconstruct delivered tools and access without replaying earlier support',()=>{
 for(const phase of [1,2])for(const assisted of [false,true]){
  const h=harness('stirling');h.c.assist(assisted);h.c.restore({...h.c.save,checkpoint:{id:'stirling',phase}});h.c.begin('stirling',h.g,h.api,true);
  assert.equal(h.c.run.phase,phase);assert.equal(h.c.run.tools.delivered,true);assert.equal(h.c.run.tools.x,720);assert.equal(h.g.grid[9][21],'#');assert.equal(h.c.run.accessClear,phase===2);
  assert.equal(h.c.run.resumed,true);assert.ok(h.c.run.support);assert.equal(h.p.hp,assisted?5:3);assert.equal(h.g.ents.some(e=>e.name==='Sir Stirling'),false);
  if(phase===1){bonkEnemies(h);h.tick(.1);}bonkEnemies(h);h.p.x=720;h.p.y=440;h.tick(8.1);assert.equal(h.finished[0].won,true);assert.equal(h.finished[0].spoons[2],false);
 }
});
test('Steve cage opens only at the actual crate; egg and route are required',()=>{const h=harness('steve');h.c.event('crate',{c:8,r:8,destroyed:true});assert.equal(h.g.pickups.length,0);h.g.grid[8][9]='.';h.c.event('crate',{c:9,r:8,destroyed:true});assert.equal(h.g.pickups[0].kind,'steve');h.p.x=580;h.p.y=300;h.tick(.1);assert.equal(h.c.run.route,0);h.p.fx.steve=10;for(const point of h.c.run.gates){h.p.x=point.x;h.p.y=point.y;h.tick(.1);}assert.equal(h.finished[0].won,true);});
test('Steve service route preserves ordered gates, cage timing, egg reacquisition and one terminal result',()=>{
 const h=harness('steve');assert.deepEqual(h.c.run.gates.map(({x,y,r})=>({x,y,r})),[{x:580,y:300,r:65},{x:820,y:540,r:65},{x:1100,y:440,r:75}]);
 assert.match(h.c.objective(),/Swing.*cage.*bowl winch/);h.tick(12);openPantry(h);assert.equal(h.c.run.eggOpened,12);
 const opened=h.c.run.eggOpened;h.g.pickups=[];h.tick(.1);assert.equal(h.g.pickups[0].kind,'steve');assert.equal(h.g.pickups[0].x,h.c.run.cage.x);assert.match(h.c.objective(),/egg at cage.*bowl winch/);
 h.p.fx.steve=10;Object.assign(h.p,h.c.run.gates[2]);h.tick(.1);assert.equal(h.c.run.route,0);assert.match(h.c.objective(),/Gate 1\/3.*Shed exit.*bowl winch/);
 Object.assign(h.p,h.c.run.gates[0]);h.tick(.1);assert.equal(h.c.run.route,1);assert.match(h.c.objective(),/Gate 2\/3.*Channel bend/);
 const route=h.c.run.route;h.c.run.route=2;assert.equal(h.c.objective(),'Gate 3/3 · Bowl winch');h.c.run.route=route;
 h.p.fx.steve=0;h.g.pickups=[];Object.assign(h.p,h.c.run.gates[1]);h.tick(2.1);assert.equal(h.c.run.route,1);assert.equal(h.g.pickups.length,1);assert.equal(h.c.run.eggOpened,opened);
 h.p.fx.steve=10;for(const q of h.c.run.gates.slice(1)){Object.assign(h.p,q);h.tick(.1);}assert.equal(h.finished.length,1);assert.deepEqual(h.finished[0].spoons,[true,true,true]);h.c.finish(true);assert.equal(h.finished.length,1);
 const slow=harness('steve');openPantry(slow);slow.tick(60.1);slow.p.fx.steve=10;for(const q of slow.c.run.gates){Object.assign(slow.p,q);slow.tick(.1);}assert.equal(slow.finished[0].spoons[1],false);
});
test('Rind telegraphs fixed target, provides punish window and sweep hurts allies',()=>{const h=harness('rind'),b=h.c.run.boss;h.p.inv=0;h.tick(2.5);assert.equal(b.step,'warn');const target={...b.target};h.p.x=180;h.p.y=600;h.tick(1.2);assert.equal(b.step,'exhausted');assert.deepEqual(b.target,target);assert.equal(h.hits.length,0);b.hp=4;h.tick(.1);assert.equal(h.c.run.phase,1);const ally=h.g.ents[2];ally.inv=0;ally.protect=0;ally.x=h.p.x;ally.y=h.p.y;h.tick(2.5);h.p.x=360;h.tick(1.2);assert.ok(h.hits.some(hit=>hit.e===ally));assert.equal(h.c.run.guardsHit,1);assert.equal(h.storage.data.includes('"phase":1'),true);});
test('Rind defeat leads to playable rescue, not immediate success',()=>{const h=harness('rind');h.c.run.boss.dead=true;h.c.event('ko',{v:1,a:0,src:'heavy'});h.tick(.1);assert.equal(h.c.run.phase,2);assert.equal(h.c.run.status,'playing');h.c.event('crate',{c:22,r:8,destroyed:false});assert.equal(h.c.run.status,'playing');h.g.grid[8][22]='.';h.c.event('crate',{c:22,r:8,destroyed:true});assert.equal(h.finished[0].won,true);});
test('boss and support checkpoint resume reset scripts and cannot earn full-run flawless spoon',()=>{for(const id of ['rind','stirling']){const h=harness(id);const s={...h.c.save,checkpoint:{id,phase:1}};h.c.restore(s);const g={roundId:'resume',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};h.c.begin(id,g,h.api,true);assert.equal(h.c.run.phase,1);assert.equal(h.c.run.resumed,true);h.c.finish(true);assert.equal(h.finished[0].spoons[2],false);}});
test('rescue checkpoint resumes with marked living skin and no boss replay',()=>{const h=harness('rind');h.c.restore({...h.c.save,checkpoint:{id:'rind',phase:2}});const g={roundId:'resume-rescue',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};h.c.begin('rind',g,h.api,true);assert.equal(h.c.run.phase,2);assert.equal(g.grid[8][22],'x');assert.ok(g.ents.slice(1).every(e=>e.dead));});
test('assistance modifies only campaign health and authored timing',()=>{const h=harness('rind');h.c.assist(true);const g={roundId:'assist',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};h.c.begin('rind',g,h.api);assert.equal(g.ents[0].campaignMaxHp,5);h.c.tick(2.5);assert.equal(h.c.run.boss.timer,1.5);h.c.tick(1.6);assert.equal(h.c.run.boss.timer,3.8);});
test('replaying another node never erases an unfinished boss checkpoint',()=>{const h=harness('banquet');h.c.restore({...h.c.save,checkpoint:{id:'rind',phase:1}});h.c.finish(true);assert.deepEqual(h.c.save.checkpoint,{id:'rind',phase:1});const g={roundId:'replay',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};h.c.begin('banquet',g,h.api,false);h.c.finish(false);assert.deepEqual(h.c.save.checkpoint,{id:'rind',phase:1});assert.equal(h.c.run.result.checkpoint,null);});
test('campaign backup merge preserves independent spoons and completed chapter ownership',()=>{let a=C.normalize({results:{banquet:{spoons:[true,true,false],attempts:3,best:40}}});const b=C.normalize({results:{banquet:{spoons:[true,false,true],attempts:1,best:35},puddings:{spoons:[true,true,true],attempts:2,best:80}}});const merged=C.merge(a,b);assert.deepEqual(merged.results.banquet.spoons,[true,true,true]);assert.equal(merged.results.banquet.attempts,3);assert.equal(merged.results.banquet.best,35);assert.equal(merged.selected,'guard');assert.deepEqual(merged.results.puddings.spoons,[true,true,true]);});
test('displacing a pudding raider cancels its attack; returning starts a complete fresh warning',()=>{const h=harness('puddings'),e=h.g.ents[1],s=h.c.run.stands[0];e.x=s.x;e.y=s.y;h.c.input(e,1.2);assert.ok(e.standTimer<.3);e.x+=160;h.c.input(e,.1);assert.equal(e.standTimer,0);assert.equal(h.c.run.warnings.some(w=>w.actor===e.id),false);e.x=s.x;h.c.input(e,.3);assert.equal(s.hp,4);assert.ok(e.standTimer>1);assert.equal(h.c.run.warnings.filter(w=>w.actor===e.id).length,1);e.stun=.3;h.c.input(e,.2);assert.equal(e.standTimer,0);assert.equal(h.c.run.warnings.some(w=>w.actor===e.id),false);});
test('destroyed pudding target cannot transfer an almost-ready hit to another stand',()=>{const h=harness('puddings'),e=h.g.ents[1],s=h.c.run.stands[0],other=h.c.run.stands[1];e.x=s.x;e.y=s.y;h.c.input(e,1.2);s.hp=0;e.x=other.x;e.y=other.y;h.c.input(e,.3);assert.equal(other.hp,4);assert.ok(e.standTimer>1);assert.equal(e.standTarget,other);});
test('Rind timing cues match normal and assisted attack windows without changing target',()=>{for(const assisted of [false,true]){const h=harness('rind');h.c.assist(assisted);h.tick(2.5);const b=h.c.run.boss,target={...b.target};assert.equal(b.warnMax,assisted?1.5:1.15);h.p.x=180;h.p.y=600;h.tick(b.warnMax/2);assert.equal(b.step,'warn');assert.equal(h.hits.length,0);assert.deepEqual(b.target,target);h.tick(b.warnMax/2+.01);assert.equal(b.step,'exhausted');assert.equal(b.recoveryMax,assisted?3.8:2.8);assert.equal(h.c.run.effects.length,1);assert.deepEqual({x:h.c.run.effects[0].x,y:h.c.run.effects[0].y},target);}});
