const test=require('node:test'),assert=require('node:assert/strict'),C=require('../game/campaign.js'),B=require('../game/bakery-opening.js');
function fixture(raw={}){
 const storage={data:JSON.stringify(raw),writes:0,getItem(){return this.data;},setItem(k,v){this.writes++;this.data=v;}},calls={prelude:0,aftermath:0,finish:0,reward:0};
 const c=C.create({storage,onPrelude:()=>calls.prelude++,onAftermath:()=>calls.aftermath++,onFinish:()=>calls.finish++,onReward:()=>calls.reward++});
 const api={makeKnight:o=>({r:22,dead:false,falling:0,vx:0,vy:0,fx:{},...o}),redraw(){}};
 const g={roundId:'quiet-fixture',ents:[api.makeKnight({id:0,human:1})],flows:new Map()};
 function interact(x,y){const p=c.run.player;p.x=x;p.y=y;c.playerInput({mx:0,my:0,atk:false,block:false});c.playerInput({mx:0,my:0,atk:true,block:true});c.tick(.016);}
 return {c,g,api,storage,calls,interact};
}
test('quiet opening cannot mutate legacy progress, checkpoints, attempts or receipts',()=>{
 const legacy={selected:'rind',results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true,false,true],attempts:4,best:25,assisted:true}])),checkpoint:{id:'rind',phase:1},receipts:['existing'],difficulty:'hard'};
 const h=fixture(legacy),before=JSON.stringify(h.c.save);h.c.beginPrelude(h.g,h.api);
 for(let i=0;i<60;i++)h.c.tick(60);h.c.event('ko',{v:0});h.c.event('hit',{v:0,damage:99});assert.equal(h.c.finish(true),null);assert.equal(h.c.finish(false),null);
 assert.equal(JSON.stringify(h.c.save),before);assert.equal(h.storage.writes,0);assert.deepEqual(h.calls,{prelude:0,aftermath:0,finish:0,reward:0});assert.equal(h.g.time,0);assert.equal(h.c.run.status,'playing');
});
test('tray requires a nearby deliberate released press, carries until actual delivery and transitions once',()=>{
 const h=fixture();h.c.beginPrelude(h.g,h.api);h.c.tick(5);assert.equal(h.c.run.phase,0);h.interact(1130,500);assert.equal(h.c.run.phase,0);
 h.interact(455,424);assert.equal(h.c.run.phase,1);h.c.run.player.x=605;h.c.run.player.y=550;h.c.playerInput({mx:0,my:0,atk:true});h.c.tick(2);assert.equal(h.c.run.tray.state,'table');
 h.interact(605,550);assert.equal(h.c.run.tray.state,'carried');assert.equal(h.c.run.player.carry,'bakery-tray');h.interact(1130,500);assert.equal(h.calls.prelude,0);
 h.c.tick(2);assert.equal(h.c.run.steve.stolen,true);h.interact(1130,500);assert.equal(h.c.run.tray.state,'delivered');assert.equal(h.c.run.player.carry,null);assert.equal(h.calls.prelude,1);h.c.tick(10);h.interact(1130,500);assert.equal(h.calls.prelude,1);assert.equal(h.calls.finish,0);
});
test('quiet Interact preserves movement and facing while suppressing attacks and guard',()=>{
 const h=fixture();h.c.beginPrelude(h.g,h.api);const out=h.c.playerInput({mx:.7,my:-.2,faceTo:1,atk:true,block:true,dash:true});assert.deepEqual(out,{mx:.7,my:-.2,faceTo:1,atk:false,block:false,dash:true});
 h.c.begin('banquet',h.g,h.api,true);const combat={mx:1,atk:true,block:true};assert.equal(h.c.playerInput(combat),combat);assert.equal(h.g.quietStory,false);assert.equal(h.c.run.prelude,undefined);assert.equal(h.g.time,180);
});
test('aftermath requires saved rescue and supplies precede onward without another award',()=>{
 const h=fixture();assert.throws(()=>h.c.beginAftermath(h.g,h.api),/Rescue/);
 const save=C.award(C.normalize({}),'banquet',{receipt:'rescued',spoons:[true,true,false],elapsed:70}).save;h.c.restore(save);const before=JSON.stringify(h.c.save),writes=h.storage.writes;
 h.c.beginAftermath(h.g,h.api);assert.deepEqual(h.c.run.staff.map(s=>s.name),['Mabel','Alf','Pip']);h.interact(1130,500);assert.equal(h.calls.aftermath,0);h.interact(605,550);assert.equal(h.c.run.tray.state,'supplied');assert.equal(h.c.run.phase,1);h.interact(1130,500);assert.equal(h.calls.aftermath,1);
 assert.equal(JSON.stringify(h.c.save),before);assert.equal(h.storage.writes,writes);assert.equal(h.calls.reward,0);assert.equal(h.calls.finish,0);
});
test('bakery interaction positions are connected by open cells; footprints match authored world bounds',()=>{
 const h=fixture();h.c.beginPrelude(h.g,h.api);const grid=h.g.grid,queue=[[5,10]],seen=new Set(['5,10']);
 for(let at=0;at<queue.length;at++){const [x,y]=queue[at];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=xx+','+yy;if(grid[yy]?.[xx]==='.'&&!seen.has(k)){seen.add(k);queue.push([xx,yy]);}}}
 for(const [x,y] of [[455,424],[605,550],[1130,500]])assert.ok(seen.has(Math.floor(x/40)+','+Math.floor((y-80)/40)),`Reachable ${x},${y}`);
 assert.deepEqual(B.footprints.map(b=>[b.c*40,80+b.r*40,b.w*40,b.h*40]),[[120,160,400,200],[800,200,280,200],[560,480,120,40]]);
});
test('bakery siege keeps three named stations, reachable enemy approaches and both waves',()=>{
 const save=C.award(C.normalize({}),'banquet',{receipt:'rescued',spoons:[true],elapsed:70}).save,h=fixture(save);h.c.begin('puddings',h.g,h.api);
 assert.deepEqual(h.c.run.staff.map(s=>s.name),['Mabel','Alf','Pip']);assert.deepEqual(h.c.run.stands.map(s=>s.hp),[4,4,4]);
 const seen=new Set(['4,9']),queue=[[4,9]],grid=h.g.grid;
 for(let at=0;at<queue.length;at++){const [x,y]=queue[at];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=xx+','+yy;if(grid[yy]?.[xx]==='.'&&!seen.has(k)){seen.add(k);queue.push([xx,yy]);}}}
 for(const p of [...h.c.run.stands,...h.g.ents])assert.ok(seen.has(Math.floor(p.x/40)+','+Math.floor((p.y-80)/40)),`Reachable station/raider ${p.x},${p.y}`);
 assert.deepEqual(h.g.ents.slice(1).map(e=>e.hp),[2,2]);h.g.ents.slice(1).forEach(e=>e.dead=true);h.c.tick(.01);assert.equal(h.c.run.wave,2);assert.deepEqual(h.g.ents.slice(-2).map(e=>e.hp),[3,3]);assert.equal(h.c.run.status,'playing');assert.equal(h.c.save.results.puddings,undefined);
});
test('aftermath skip and natural continuation clean quiet runtime before the next briefing',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),h=fixture(),events=[],briefs=[];let hooks,current;
 const root={CKCampaign:C,CKCampaignUI:{mount(o){hooks=o;return {close(){},refresh(){},brief(id){briefs.push(id);},ended(){}}}}};
 const engine={...h.api,boot(){current={roundId:'integration',ents:[h.api.makeKnight({id:0,human:1})],flows:new Map()};return current;},play(){},sceneStarted(){current.over=true;}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../game/campaign-integration.js'),'utf8'),{globalThis:root});
 const a=root.CKCampaignIntegration.connect(engine,{storage:null,onProductEvent:(...e)=>events.push(e)}),save=C.award(C.normalize({}),'banquet',{receipt:'rescued',spoons:[true],elapsed:70}).save;
 a.campaign.restore(save);const before=JSON.stringify(a.campaign.save);a.aftermath();hooks.skipQuiet();assert.equal(a.campaign.run,null);assert.equal(current.over,true);assert.deepEqual(briefs,['puddings']);assert.deepEqual(events,[]);assert.equal(JSON.stringify(a.campaign.save),before);
 a.aftermath();for(const [x,y]of [[605,550],[1130,500]]){a.campaign.run.player.x=x;a.campaign.run.player.y=y;a.playerInput({atk:false});a.playerInput({atk:true});a.tick(.016);}assert.equal(a.campaign.run,null);assert.deepEqual(briefs,['puddings','puddings']);assert.deepEqual(events,[]);assert.equal(JSON.stringify(a.campaign.save.results),JSON.stringify(C.normalize(save).results));
});
