'use strict';
// Synthetic integration acceptance: real rendering/simulation, controlled actors and setup packets.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(__dirname,'results','rooftop-race'));
const packaged=process.argv.includes('--packaged'),archive=path.join(root,'dist/Custard Knights-win32-x64/resources/app.asar');
fs.mkdirSync(out,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),packaged?'ck-soundtrack-browser-':'ck-arena-size-')),profile=path.join(temporary,'chrome');
let chrome,diagnostics='';
if(packaged){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;chrome=spawn(require('electron'),[path.join(__dirname,'soundtrack-electron.cjs'),'--qa-archive='+archive,'--qa-profile='+profile,'--remote-debugging-port=0','--mute-audio','--autoplay-policy=no-user-gesture-required'],{env,stdio:['ignore','ignore','pipe'],windowsHide:true});chrome.stderr.on('data',d=>{diagnostics+=d;});}
else chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1440,900','--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
let ws;const report={packaged,checks:[],errors:[],limitations:'Synthetic simulation, setup/snapshot replay and touch/couch viewport checks. Packaged mode loads the built app.asar through the Electron QA launcher. Not human playtesting, physical controller testing or a live cross-network multiplayer test.'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),deadline=setTimeout(()=>{chrome.kill();process.exitCode=1;},150000);
(async()=>{
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{const m=/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/.exec(diagnostics);if(m){port=+m[1];break;}await sleep(100);}}if(!port)throw Error('Browser did not start '+diagnostics);
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=async(name,expression)=>{const details=await run(expression),pass=details===true;report.checks.push({name,pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));};
 await send('Runtime.enable');await send('Page.enable');
 await send('Page.navigate',{url:(packaged?'custard://game/index.html':require('node:url').pathToFileURL(path.join(root,'index.html')).href)+'?qa=1'});
 for(let i=0;i<100&&!await run('!!window.CK');i++)await sleep(100);
 report.raceDiagnostics=[];
 for(const diff of ['easy','medium','hard','steve'])for(const solo of diff==='easy'?[false,true]:[true])for(const initialSeed of diff==='easy'?[1,7,777]:[777])for(const size of ['classic','roomier']){
  const result=await run(`(()=>{const random=Math.random;let seed=${initialSeed};Math.random=()=>((seed=seed*16807%2147483647)-1)/2147483646;try{CK.begin({arenaSize:'${size}',map:'roof',mode:'race',humans:0,diff:'${diff}',chaosSpeed:'simple',length:180});if(${solo})CK.G().ents.slice(1).forEach(e=>{e.dead=true;e.respawn=100000;});for(let i=0;i<10800&&!CK.G().over;i++)CK.update(1/60);const g=CK.G();return {solo:${solo},difficulty:'${diff}',seed:${initialSeed},elapsed:g.clock,size:'${size}',finished:g.ents.filter(e=>e.finished).length,positions:g.ents.map(e=>({laps:e.laps,cp:e.cp,x:Math.round(e.x),y:Math.round(e.y),deaths:e.deaths,finished:e.finished})),gates:g.cps};}finally{Math.random=random;}})()`);
  report.raceDiagnostics.push(result);const pass=result.finished>0&&result.elapsed<180&&(!solo||result.positions.every(p=>p.deaths===0));report.checks.push({name:`${diff}/${size}/seed${initialSeed}/${solo?'solo zero falls':'contested completion'}`,pass});if(!pass)throw Error(JSON.stringify(result));
 }
 if(report.errors.length)throw Error('Browser exceptions');
 report.limitations='Controlled three-minute Rooftop races. Solo routes must complete four laps with zero deaths; contested races must complete within the normal time limit, and record all deaths because rivals can legitimately shove racers into pits. Easy seeds1,7,777 both sizes; each faster difficulty seed777 both sizes solo. Not human playtesting.';
 const asar=packaged?await import('@electron/asar'):null,hash=data=>require('node:crypto').createHash('sha256').update(data).digest('hex');report.indexSha256=hash(packaged?asar.extractFile(archive,'index.html'):fs.readFileSync(path.join(root,'index.html')));if(packaged)report.archiveSha256=hash(fs.readFileSync(archive));
})().catch(error=>{report.failure=error.stack;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(x=>!x.pass),errors:report.errors.length,failure:report.failure,out}));clearTimeout(deadline);ws?.close();chrome.kill();});
