'use strict';
// Focused arena spawn safety checks, isolated from player saves.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||'qa/results/arena-spawns'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-arena-spawn-'));
const report={checks:[],errors:[],sourceHash:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),limitations:'Headless Chromium in a fresh profile. Real newGame, hurt, update and trapdoor events; controlled entity population and recent-spawn scoring isolate spawn selection. No regular player profile accessed.'};fs.mkdirSync(out,{recursive:true});
report.sourceHashes=Object.fromEntries(['index.html','game/campaign.js','game/campaign-integration.js','game/mass-battle.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));let ws;
function additionalBrowserChecks(){
 const checks=[],add=(name,pass,details)=>checks.push({name,pass:!!pass,details});
 const clear=()=>{for(const key of Object.keys(CK.keys))delete CK.keys[key];};
 const safe=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=57.6-1e-6&&p.x<=1222.4+1e-6&&p.y>=137.6-1e-6&&p.y<=742.4+1e-6;
 const tick=n=>{for(let i=0;i<n;i++)CK.update(1/60);};
 function pitFixture(mode){clear();CK.setSeats([{dev:'kb1'}]);CK.begin({humans:1,map:'roof',mode});CK.freeze(true);const g=CK.G(),p=g.ents.find(e=>e.human);g.ents=[p];g.mayhemAt=g.norrAt=g.spawnT=1e9;g.steveDone=true;g.pickups=[];g.pads=[];Object.assign(p,{x:100,y:260,vx:0,vy:0,protect:0,inv:0});return {g,p};}
 for(const mode of Object.keys(CK.MODES)){
  let {g,p}=pitFixture(mode);CK.keys.KeyD=true;let crossed=false;
  for(let i=0;i<90&&!p.falling&&!p.dead;i++){CK.update(1/60);crossed ||= p.x>=120;}
  clear();tick(165);
  add(mode+' walking into a real map pit still produces KO and safe respawn',crossed&&g.log.some(e=>e.k==='ko'&&e.src==='pit')&&!p.dead&&safe(p)&&p.deaths===1,{x:p.x,y:p.y,deaths:p.deaths});
  ({g,p}=pitFixture(mode));CK.keys.KeyD=true;CK.keys.KeyG=true;tick(10);clear();tick(15);
  add(mode+' normal dash crosses the same two-tile pit without a KO',p.x>200&&!p.dead&&!p.falling&&p.deaths===0,{x:p.x,y:p.y,deaths:p.deaths});
 }
 for(const edge of ['left','right','top','bottom']){
  clear();CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);CK.begin({humans:2,map:'courtyard',mode:'ffa'});CK.freeze(true);const g=CK.G();g.ents=g.ents.filter(e=>e.human);const [a,b]=g.ents;
  Object.assign(a,{x:edge==='left'?57.6:edge==='right'?1222.4:60,y:edge==='top'?137.6:edge==='bottom'?742.4:140,vx:0,vy:0});Object.assign(b,{x:a.x+(edge==='left'?5:edge==='right'?-5:0),y:a.y+(edge==='top'?5:edge==='bottom'?-5:0),vx:0,vy:0});tick(1);
  add('Crowded knight pair remains inside the '+edge+' wall after separation',[a,b].every(safe),g.ents.map(e=>({x:e.x,y:e.y})));
 }
 const results=Object.fromEntries(CKCampaign.nodes.map(n=>[n.id,{spoons:[true,false,false],attempts:1}]));CK.adventure.campaign.restore({results});
 for(const node of CKCampaign.nodes){clear();const g=CK.adventure.launch(node.id,false);CK.freeze(true);add('Campaign '+node.id+' initial actors are finite and on solid ground',g.ents.every(p=>safe(p)&&!['#','h','w','x','o','L'].includes(g.grid[Math.floor((p.y-80)/40)]?.[Math.floor(p.x/40)])),g.ents.map(p=>({x:p.x,y:p.y})));}
 clear();const g=CK.adventure.launch('bridge',false);CK.freeze(true);const p=g.ents[0];
 const walk=(key,predicate,limit=600)=>{clear();CK.keys[key]=true;let i=0;while(!predicate()&&i++<limit)CK.update(1/60);clear();tick(20);return i<limit;};
 const route=walk('KeyW',()=>p.y<=195)&&walk('KeyD',()=>p.x>=440)&&walk('KeyS',()=>p.y>=430);const checkpoint={...CK.adventure.campaign.run.checkpoint};
 walk('KeyD',()=>p.falling>0||p.dead,300);clear();tick(165);
 add('Campaign bridge real pit fall uses shared respawn then restores the earned checkpoint',route&&checkpoint.x===440&&g.log.some(e=>e.k==='ko'&&e.src==='pit')&&!p.dead&&safe(p)&&Math.hypot(p.x-checkpoint.x,p.y-checkpoint.y)<1,{checkpoint,position:{x:p.x,y:p.y},falls:CK.adventure.campaign.run.falls,status:CK.adventure.campaign.run.status});
 CK.adventure.stop();clear();return checks;
}
function factionChecks(){
 const core=require('../game/mass-battle.js'),checks=[],add=(name,pass,details)=>checks.push({name,pass:!!pass,details});
 const inside=(s,p)=>['x','y','vx','vy'].every(k=>Number.isFinite(p[k]))&&p.x>=30&&p.x<=s.world.width-30&&p.y>=30&&p.y<=s.world.height-30;
 for(const mode of ['brawl','ctf','siege'])for(const teamSize of [4,20,50]){
  const s=core.create({mode,teamSize,duration:180,seed:17});add('Faction '+mode+' '+teamSize+'v'+teamSize+' initial roster spawns inside bounds',s.players.every(p=>inside(s,p)&&p.alive&&p.protection>0));
  core.join(s,{id:'qa',role:'vanguard'});const p=s.players.find(p=>p.humanId==='qa');for(const other of s.players)if(other!==p){other.alive=false;other.respawn=999;other.bot=false;other.humanId=other.id;}
  let bounded=true;const reached=[];
  for(const [moveX,moveY,done] of [[-1,0,p=>p.x===30],[0,-1,p=>p.y===30],[1,0,p=>p.x===3170],[0,1,p=>p.y===1770]]){
   let frames=0;while(!done(p)&&frames++<400){core.step(s,.1,{qa:{moveX,moveY,aimX:moveX,aimY:moveY,dash:true}});bounded&&=inside(s,p);}reached.push(done(p));
  }
  add('Faction '+mode+' '+teamSize+'v'+teamSize+' actual movement and repeated dashes reach all four limits without escape',bounded&&reached.every(Boolean),{reached,x:p.x,y:p.y});
 }
 for(const mode of ['brawl','ctf','siege']){
  const s=core.create({mode,teamSize:4,duration:180,seed:41});core.join(s,{id:'victim',role:'vanguard'});core.join(s,{id:'attacker',role:'vanguard'});const p=s.players.find(p=>p.humanId==='victim'),q=s.players.find(p=>p.humanId==='attacker');for(const other of s.players)if(other!==p&&other!==q){other.alive=false;other.respawn=999;other.bot=false;other.humanId=other.id;}
  let frames=0,bounded=true;
  while(p.alive&&frames++<1600){const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,close=len<75;core.step(s,1/60,{victim:{moveX:close?0:dx/len,moveY:close?0:dy/len,aimX:dx/len,aimY:dy/len,dash:!close},attacker:{moveX:close?0:-dx/len,moveY:close?0:-dy/len,aimX:-dx/len,aimY:-dy/len,heavy:close,dash:!close}});bounded&&=inside(s,p)&&inside(s,q);}
  const died=!p.alive;for(let i=0;i<310;i++)core.step(s,1/60,{});
  add('Faction '+mode+' real approach, heavy attacks and KO respawn preserve finite protected coordinates',died&&bounded&&p.alive&&p.protection>0&&inside(s,p)&&p.deaths===1,{frames,deaths:p.deaths,x:p.x,y:p.y,protection:p.protection});
 }
 return checks;
}
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--mute-audio','about:blank'],{windowsHide:true,stdio:'ignore'});
const timeout=setTimeout(()=>{report.failure='Arena spawn QA timed out';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));chrome.kill();process.exit(1);},60000);
(async()=>{
 let port;for(let i=0;i<80;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};await new Promise(resolve=>ws.onopen=resolve);
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(root,'index.html')).href+'?qa=1'});
 for(let i=0;i<100;i++){if(await run('!!(window.CK&&CK.massBattle())'))break;await sleep(75);}
 report.audit=await run(`(()=>{const results=[],random=Math.random;let seed=1;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const terrain=(g,p)=>g.grid[Math.floor((p.y-80)/40)]?.[Math.floor(p.x/40)],safe=(g,p)=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=57.6&&p.x<=1222.4&&p.y>=137.6&&p.y<=742.4&&['S','.'].includes(terrain(g,p));try{for(const mode of Object.keys(CK.MODES))for(const map of Object.keys(CK.MAPS)){CK.cfg.map=map;CK.cfg.mode=mode;CK.cfg.players=1;CK.newGame(false);const g=CK.G();results.push({name:mode+' '+map+' initial eight spawns are finite, distinct, on safe terrain and within arena',pass:g.ents.length===8&&g.ents.every(p=>safe(g,p))&&new Set(g.ents.map(p=>p.x+','+p.y)).size===8,spawns:g.ents.map(p=>({x:p.x,y:p.y,tile:terrain(g,p)}))});const p=g.ents[0];for(const other of g.ents.slice(1)){other.dead=true;other.respawn=Infinity;}CK.hurt(p,null,99,{force:true,kb:0});let n=0;while(p.dead&&n++<120)CK.update(1/60);results.push({name:mode+' '+map+' actual KO respawns safely with protection',pass:!p.dead&&safe(g,p)&&p.protect>0&&p.vx===0&&p.vy===0,point:{x:p.x,y:p.y,tile:terrain(g,p)}});}let candidate=null;for(let attempt=1;attempt<=100&&!candidate;attempt++){seed=attempt;CK.cfg.mode='ffa';CK.cfg.map='courtyard';CK.newGame(false);const g=CK.G();for(const p of g.ents){p.dead=true;p.respawn=Infinity;}CK.startMayhem('trapdoor');for(let i=0;i<165;i++)CK.update(1/60);const hole=g.spawnCands.find(p=>terrain(g,p)==='o');if(hole){for(const p of g.spawns.concat(g.spawnCands))g.spawnUsed.set(p.x*10000+p.y,g.clock);g.spawnUsed.delete(hole.x*10000+hole.y);const p=g.ents[0];p.dead=false;p.hp=3;CK.hurt(p,null,99,{force:true,kb:0});let n=0;while(p.dead&&n++<120){for(const q of g.spawns.concat(g.spawnCands))if(q!==hole)g.spawnUsed.set(q.x*10000+q.y,g.clock);CK.update(1/60);}candidate={seed:attempt,hole,point:{x:p.x,y:p.y,tile:terrain(g,p)},dead:p.dead,protect:p.protect};results.push({name:'Actual trapdoor mayhem cannot turn a cached candidate into a pit respawn',pass:!p.dead&&safe(g,p),repro:candidate});}}if(!candidate)results.push({name:'Trapdoor fixture encounters a real cached candidate',pass:false});return results;}finally{Math.random=random;}})()`);for(const result of report.audit){report.checks.push({name:result.name,pass:result.pass});console.log((result.pass?'PASS ':'FAIL ')+result.name);}report.warning=await run(`(()=>{const random=Math.random;let seed=1;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};try{for(let attempt=1;attempt<=100;attempt++){seed=attempt;CK.cfg.mode='ffa';CK.cfg.map='courtyard';CK.newGame(false);const g=CK.G();for(const p of g.ents){p.dead=true;p.respawn=Infinity;}CK.startMayhem('trapdoor');const hole=g.spawnCands.find(p=>g.holes.some(h=>h.t>1.9&&h.c===Math.floor(p.x/40)&&h.r===Math.floor((p.y-80)/40)));if(!hole)continue;const p=g.ents[0];p.dead=false;p.hp=3;CK.hurt(p,null,99,{force:true,kb:0});let n=0;while(p.dead&&n++<120){for(const q of g.spawns.concat(g.spawnCands))if(q!==hole)g.spawnUsed.set(q.x*10000+q.y,g.clock);CK.update(1/60);}const imminent=g.holes.find(h=>h.c===Math.floor(p.x/40)&&h.r===Math.floor((p.y-80)/40));return {name:'Respawn avoids a warning trapdoor that has not opened yet',pass:!p.dead&&!imminent,repro:{seed:attempt,hole,point:{x:p.x,y:p.y},imminent:imminent||null}};}return {name:'Pending trapdoor fixture found',pass:false};}finally{Math.random=random;}})()`);report.checks.push({name:report.warning.name,pass:report.warning.pass});console.log((report.warning.pass?'PASS ':'FAIL ')+report.warning.name);report.additional=await run('('+additionalBrowserChecks.toString()+')()');report.faction=factionChecks();for(const c of report.additional.concat(report.faction)){report.checks.push({name:c.name,pass:c.pass});console.log((c.pass?'PASS ':'FAIL ')+c.name);}report.checks.push({name:'No browser exceptions',pass:report.errors.length===0});if(report.checks.some(c=>!c.pass))process.exitCode=1;
})().catch(error=>{report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(()=>{clearTimeout(timeout);ws?.close();chrome.kill();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');});
