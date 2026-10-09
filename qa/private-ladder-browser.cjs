'use strict';
// Actual integrated UI + real private-ladder server. Terminal match state is a fixture.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {createBattleServer}=require('../server/mass-battle-server.cjs');
const {createPlayerStore}=require('../server/player-store.cjs');
const ROOT=path.resolve(process.env.CK_RUNTIME_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||'qa/results/private-ladder-browser');
const recovery=process.argv.includes('--recovery');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'ck-private-ladder-'));
const filename=path.join(temporary,'players.sqlite');
const report={checks:[],errors:[],sourceHashes:{},limitations:'One headless integrated browser plus seven scripted loopback sockets. Terminal server state is set directly to test persistence/result UI; not a human-completed match, WAN, Steam authentication or minimum-hardware acceptance.'};
for(const name of ['index.html','game/mass-battle-ui.js','game/mass-battle.css'])report.sourceHashes[name]=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,name))).digest('hex');
for(const name of ['server/mass-battle-server.cjs','server/player-store.cjs'])report.sourceHashes[name]=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',name))).digest('hex');
if(recovery)report.limitations='One headless integrated browser plus seven scripted loopback sockets. Five-second test grace, deliberate socket termination and resulting server forfeit; no human gameplay, WAN, Steam authentication or minimum-hardware acceptance.';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let server,store,chrome,ws;const clients=[];
const timeout=setTimeout(()=>{chrome?.kill();console.error('Private ladder browser timed out');process.exit(1);},70000);
async function main(){
 store=createPlayerStore({filename});const accounts=Array.from({length:8},(_,i)=>store.issue('QA Knight '+(i+1)));
 server=createBattleServer({port:0,playerStore:store,...(recovery?{rankedReconnectMs:5000}:{})});const address=await server.listen(),endpoint=`ws://127.0.0.1:${address.port}/battle`;
 chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+path.join(temporary,'chrome'),'--window-size=1280,800','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(temporary,'chrome','DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass)=>{report.checks.push({name,pass:!!pass});if(!pass)throw Error(name);console.log('PASS '+name);};
 const until=async(expression,ms=5000)=>{const end=Date.now()+ms;while(Date.now()<end){if(await run(expression))return true;await sleep(75);}return false;};
 const click=label=>run(`Array.from(document.querySelectorAll('.ck-battle button')).find(b=>b.textContent===${JSON.stringify(label)}&&b.getClientRects().length).click()`);
 await send('Runtime.enable');await send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href+'?qa=1'});
 check('Integrated game loads',await until('!!(window.CK&&CK.massBattle())',15000));
 await run('CK.sprLoadAll()');await run('CK.massBattle().open()');
 await run(`document.querySelector('.ck-battle-online').open=true;document.querySelector('[aria-label="Online playlist"]').value='ranked';document.querySelector('[aria-label="Online playlist"]').dispatchEvent(new Event('change'));document.querySelector('.ck-battle input[type=url]').value=${JSON.stringify(endpoint)};for(const [name,value]of [['Battle mode','brawl'],['Army size','4']]){const s=[...document.querySelectorAll('.ck-battle label')].find(l=>l.firstChild.textContent===name).querySelector('select');s.value=value;s.dispatchEvent(new Event('change'));}`);
 await click('Find private ladder match');
 check('Ranked without a key stays on setup with explanation',await run(`!document.querySelector('.ck-battle-setup').hidden&&document.querySelector('.ck-battle-status').textContent.toLowerCase().includes('key')`));
 await run(`document.querySelector('[aria-label="Player access key"]').value=${JSON.stringify(accounts[0].token)};document.querySelector('.ck-battle input[type=url]').value='ws://example.invalid/battle'`);
 await click('Find private ladder match');
 check('Key is refused over remote plaintext WebSocket',await run(`!document.querySelector('.ck-battle-setup').hidden&&document.querySelector('.ck-battle-status').textContent.toLowerCase().includes('wss')`));
 await run(`document.querySelector('.ck-battle input[type=url]').value=${JSON.stringify(endpoint)}`);await click('Find private ladder match');
 check('One authenticated player enters human-only waiting queue',await until(`document.querySelector('.ck-battle-status').textContent.includes('1 / 8')||document.querySelector('.ck-battle-status').textContent.includes('1/8')`));
 await sleep(12500);
 check('Waiting beyond connection timeout does not disconnect or start bot match',await run(`!document.querySelector('.ck-battle-setup').hidden&&!CK.massBattle().snapshot()&&!document.querySelector('.ck-battle-status').textContent.includes('did not respond')`));
 await click('Cancel search');
 check('Cancel returns to editable setup',await run(`!document.querySelector('.ck-battle input[type=url]').disabled&&!document.querySelector('.ck-battle-setup').hidden`));
 await click('Find private ladder match');
 check('Can rejoin after cancel',await until(`document.querySelector('.ck-battle-status').textContent.includes('1 / 8')||document.querySelector('.ck-battle-status').textContent.includes('1/8')`));
 for(const account of accounts.slice(1)){
  const client=new WebSocket(endpoint);clients.push(client);
  await new Promise((resolve,reject)=>{client.onopen=resolve;client.onerror=reject;});
  client.send(JSON.stringify({type:'join',wire:1,ranked:true,accessToken:account.token,mode:'brawl',teamSize:4,role:'vanguard',name:'Fixture'}));
 }
 check('Eight authenticated humans launch an actual rendered battle',await until(`document.querySelector('.ck-battle-setup').hidden&&CK.massBattle().snapshot()?.players.filter(p=>!p.bot).length===8`));
 const room=[...server.rooms.values()].find(r=>r.ranked&&r.state.players.filter(p=>!p.bot).length===8);check('Server independently marks the full-human room ranked',room);
 if(recovery){
  const peer=room.roster.find(p=>p.accountId===accounts[1].accountId);
  peer.c.ws.terminate();
  check('Connected browser explains ranked reconnect pause',await until(`!document.querySelector('.ck-battle-ranked-pause').hidden&&document.querySelector('.ck-battle-ranked-pause').textContent.toLowerCase().includes('paused')`));
  const frozen=room.state.elapsed;await sleep(300);
  check('Authoritative battle clock freezes during missing-player grace',room.state.elapsed===frozen);
  check('Missing ranked player never becomes a bot',room.state.players.every(p=>!p.bot));
  const returning=new WebSocket(endpoint);clients.push(returning);const messages=[];returning.onmessage=e=>messages.push(JSON.parse(e.data));
  await new Promise((resolve,reject)=>{returning.onopen=resolve;returning.onerror=reject;});
  returning.send(JSON.stringify({type:'join',wire:1,ranked:true,accessToken:accounts[1].token,mode:'brawl',teamSize:4,resumeRoom:room.id}));
  for(let i=0;i<50&&!messages.some(m=>m.type==='welcome');i++)await sleep(50);
  check('Peer reconnect restores original session',messages.some(m=>m.type==='welcome'&&m.sessionId===peer.session.id));
  const self=room.roster.find(p=>p.accountId===accounts[0].accountId),sessionId=self.session.id;
  self.c.ws.terminate();
  check('Dropped browser offers manual reconnect',await until(`Array.from(document.querySelectorAll('.ck-battle button')).some(b=>b.textContent==='Reconnect to battle'&&b.getClientRects().length)`));
  await click('Reconnect to battle');
  check('Manual reconnect returns to the same battle',await until(`document.querySelector('.ck-battle-modal').hidden&&CK.massBattle().snapshot()?.players.some(p=>p.id===${JSON.stringify(sessionId)}||p.humanId===${JSON.stringify(sessionId)})`));
  check('Server retains original browser session without respawning',self.session.id===sessionId&&self.c.room===room.id&&!room.missing.size);
  check('Reconnect key remains memory-only',await run(`![...Object.values(localStorage),...Object.values(sessionStorage)].some(v=>v.includes(${JSON.stringify(accounts[0].token)}))`));
  peer.c.ws.terminate();
  check('Expired departure forfeits instead of cancelling ratings',await until(`CK.massBattle().snapshot()?.status==='finished'`,8000)&&room.state.finishReason==='forfeit');
 }else{
  // A fixture isolates result bookkeeping/UI; it does not claim a played match.
  room.state.status='finished';room.state.winner='custardia';room.state.finishReason='QA terminal fixture';
 }
 check('Final result reaches the real UI',await until(`!document.querySelector('.ck-battle-modal').hidden&&document.querySelector('.ck-battle-modal').textContent.includes('Private test ladder')`));
 await sleep(300);
 const current=store.profile(accounts[0].accountId,'brawl-4');
 check('Server persisted one real account result',current.matches===1&&[984,1016].includes(current.rating));
 check('Ladder returns all eight persisted profiles',store.leaderboard('brawl-4').length===8);
 const visible=await run(`document.querySelector('.ck-battle-modal').textContent`);
 check('Result UI shows stored rating',visible.includes(String(current.rating)));
 fs.writeFileSync(path.join(OUT,'result.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await click('Back to main menu');
 check('Closing clears the access key',await run(`document.querySelector('[aria-label="Player access key"]').value===''`));
 check('Credential never enters local or session storage',await run(`![...Object.values(localStorage),...Object.values(sessionStorage)].some(v=>v.includes(${JSON.stringify(accounts[0].token)}))`));
 for(const client of clients)client.close();await server.close();server=null;store.close();store=null;
 store=createPlayerStore({filename});
 check('Rating survives database close/reopen',store.profile(accounts[0].accountId,'brawl-4').rating===current.rating&&store.profile(accounts[0].accountId,'brawl-4').matches===1);
 check('No browser exceptions',report.errors.length===0);
}
main().catch(error=>{report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);ws?.close();chrome?.kill();for(const client of clients)client.close();if(server)await server.close();store?.close();fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));});
