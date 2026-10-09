'use strict';
// Independent process exit after staging, then actual server startup/restart.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {createPlayerStore}=require('../server/player-store.cjs');
const {createBattleServer}=require('../server/mass-battle-server.cjs');
const output=path.resolve(process.argv[2]||'qa/results/ranked-recovery/journal-process.json');
const filename=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'ck-journal-')),'players.sqlite');
const report={checks:[],limitations:'Abrupt child process exit after a successful SQLite staging commit; no OS power-loss, failed-disk, live-match resumption or public hosting claim.'};
let app,store;
function check(name,pass){report.checks.push({name,pass:!!pass});if(!pass)throw Error(name);}
(async()=>{
 const child=spawnSync(process.execPath,['-e',`
  const {createPlayerStore}=require('./server/player-store.cjs');
  const s=createPlayerStore({filename:process.argv[1]});
  const participants=Array.from({length:8},(_,i)=>({accountId:s.issue('Recovery '+i).accountId,team:i<4?'custardia':'rice'}));
  s.stageMatchResult({id:'process-recovery',queueKey:'brawl-4',mode:'brawl',teamSize:4,winner:'custardia',eligible:true,participants});
  // Deliberately omit graceful store/server close, like process termination.
  process.exit(23);
 `,filename],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',windowsHide:true,timeout:15000});
 check('Child exits abruptly after staging',child.status===23);
 store=createPlayerStore({filename});const pending=store.pendingResults();
 check('Committed pending result survives child exit',pending.length===1&&pending[0].id==='process-recovery');
 check('Staging has not awarded speculative ratings',pending[0].participants.every(p=>store.profile(p.accountId,'brawl-4').matches===0));
 app=createBattleServer({port:0,playerStore:store});const address=await app.listen();
 const health=await(await fetch(`http://127.0.0.1:${address.port}/health`)).json();
 check('Server startup replays before healthy ranked admission',health.privateRanked===true&&health.pendingRankedResults===0&&store.pendingResults().length===0);
 const profiles=pending[0].participants.map(p=>store.profile(p.accountId,'brawl-4'));
 check('Exactly one result awarded to all eight original humans',profiles.every(p=>p.matches===1)&&profiles.filter(p=>p.rating===1016).length===4&&profiles.filter(p=>p.rating===984).length===4);
 await app.close();app=null;store.close();store=null;
 app=createBattleServer({port:0,playerDb:filename});await app.listen();await app.close();app=null;
 store=createPlayerStore({filename});
 check('A second real server startup cannot award twice',profiles.every(p=>JSON.stringify(store.profile(p.id,'brawl-4'))===JSON.stringify(p)));
})().catch(error=>{report.failure=error.stack;process.exitCode=1;}).finally(async()=>{if(app)await app.close();store?.close();fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report));});
