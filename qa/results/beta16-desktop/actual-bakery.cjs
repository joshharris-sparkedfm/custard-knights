'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
if(fs.existsSync(path.join(out,'actual-bakery.json')))throw Error('Refusing to overwrite native evidence');
const hash=p=>require('node:crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const archive=path.join(path.dirname(exe),'resources/app.asar'),asarBefore=hash(archive);
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['Actual EXE with fresh marked acceptance profile. Untouched native renderer and no CK query helper or autoplay override. Acceptance.run replaced in memory; native synthesized mouse/Escape keyboard events, read-only DOM/local campaign save observations and ten-second readiness gates. Scoped Story entry/pause/replay/skip/quit/scene navigation; no movement, delivery, rescue combat completion, physical input, human comprehension, responsiveness or audibility acceptance. ASAR unchanged.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
report.sourceCommit='a7e5ed4b653823ee2a84cb6df84d425206c46072';report.asarSha256Before=asarBefore;report.helperSha256=hash(__filename);report.isolation={root:temporary,profile,marker:path.join(temporary,'acceptance-profile.marker'),fresh:true,ownWindowShowInactive:true};report.fixtureManifest={rendererInstrumented:false,gameStateInjection:false,autoplayOverride:false,bootstrap:'Standard marked acceptance launch initially loads ?qa=1; injected runner explicitly loads a second clean native document before every measured check',checkedDocument:'custard://game/index.html with empty search and no window.CK',inputs:'Native synthesized mouse and Escape keyboard',observations:'Read-only DOM and local campaign save',scope:'Story entry/pause/replay/skip/quit/theatre navigation; no movement/delivery/combat completion claim'};
async function injected({app,win}){
 const checks=[],inputs=[],gates=[];
 const run=expression=>win.webContents.executeJavaScript(expression);
 const state=()=>run(`({origin:location.origin,search:location.search,qaHelpers:!!window.CK,visible:[...document.querySelectorAll('.overlay')].filter(e=>!e.hidden).map(e=>e.id),hud:document.getElementById('campaignHUD')?.textContent,speech:document.getElementById('campaignSpeech')?.textContent,save:localStorage.getItem('ck-campaign-v1'),hidden:document.hidden})`);
 const test=async(name,pass)=>{const snapshot=await state();checks.push({name,pass,state:snapshot});if(!pass)throw Error(name+' '+JSON.stringify(snapshot));};
 const wait=async(expression)=>{const gate={expression,samples:[]};gates.push(gate);const end=Date.now()+10000;while(true){const pass=!!await run(expression);gate.samples.push({at:Date.now(),pass});if(pass)return;if(Date.now()>end)throw Error('Readiness timeout '+expression+' '+JSON.stringify(await state()));await new Promise(r=>setTimeout(r,30));}};
 const click=async(selector,text)=>{
  const rect=await run(`(()=>{const e=${text?`[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent===${JSON.stringify(text)})`:`document.querySelector(${JSON.stringify(selector)})`};if(!e||e.disabled||e.hidden)throw Error('Unavailable button');e.scrollIntoView({block:'nearest'});return e.getBoundingClientRect().toJSON()})()`);
  const point={x:Math.round(rect.x+rect.width/2),y:Math.round(rect.y+rect.height/2)};
  for(const type of ['mouseDown','mouseUp']){const input={type,...point,button:'left',clickCount:1};inputs.push(input);win.webContents.sendInputEvent(input);}
  await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 };
 const escape=async()=>{for(const type of ['keyDown','keyUp']){const input={type,keyCode:'Escape'};inputs.push(input);win.webContents.sendInputEvent(input);}await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');};
 try{
  const bootstrap=await run('({origin:location.origin,search:location.search,qaHelpers:!!window.CK})');
  await win.loadURL('custard://game/index.html');win.showInactive();
  await wait('!document.hidden&&!!document.getElementById("onboardingJump")');
  await test('Actual native origin is clean without CK query helpers',await run('location.origin==="custard://game"&&!location.search&&!window.CK&&!!window.CKBakeryOpening'));
  await click('#onboardingJump');await wait('!document.getElementById("menu").hidden');await click('#tAdventure');await wait('!document.getElementById("campaignMap").hidden');await click('#campaignMap button','Begin at the bakery');await wait('!document.getElementById("campaignHUD").hidden&&/Talk to Mabel/.test(document.getElementById("campaignHUD").textContent)');
  const entry=await state(),quietSave=entry.save;
  await test('Fresh actual Story input opens bakery talk objective and speech',/Talk to Mabel.*Space/.test(entry.hud)&&entry.speech.includes('Mabel:'));
  await escape();await wait('!document.getElementById("pause").hidden');await test('Native Escape reveals explicit quiet replay and skip controls',await run('!document.getElementById("campaignQuietReplay").hidden&&!document.getElementById("campaignQuietSkip").hidden'));
  await click('#campaignQuietReplay');await wait('document.getElementById("pause").hidden&&!document.getElementById("campaignHUD").hidden');await test('Actual replay returns to initial bakery objective without save change',(await state()).save===quietSave&&await run('/Talk to Mabel/.test(document.getElementById("campaignHUD").textContent)'));
  await escape();await wait('!document.getElementById("pause").hidden');await click('#campaignQuietSkip');await wait('document.getElementById("pause").hidden&&!document.getElementById("campaignHUD").hidden&&/pantry|barricade/i.test(document.getElementById("campaignHUD").textContent)');await test('Explicit actual pause skip starts pantry combat without awarding result',await run('!document.getElementById("pauseBtn").hidden&&Object.keys(JSON.parse(localStorage.getItem("ck-campaign-v1")).results).length===0'));
  await escape();await wait('!document.getElementById("pause").hidden');await click('#quitBtn');await wait('!document.getElementById("menu").hidden');await test('Actual combat quit returns home and hides quiet HUD and speech',await run('document.getElementById("campaignHUD").hidden&&document.getElementById("campaignSpeech").hidden'));
  await click('#tAdventure');await wait('!document.getElementById("campaignMap").hidden');await click('#campaignMap button','Replay opening scene');await wait('!document.getElementById("campaignStory").hidden&&!!document.querySelector(".campaign-theatre")');await test('Actual scene replay opens native story theatre with scene controls',await run('document.querySelector(".campaign-theatre").dataset.scene==="banquet"&&[...document.querySelectorAll("#campaignStory button")].some(b=>b.textContent==="Replay scene")'));
  await click('#campaignStory button','Skip story');await wait('!document.getElementById("campaignMap").hidden');await test('Actual scene skip returns to map without inventing story rewards',await run('Object.keys(JSON.parse(localStorage.getItem("ck-campaign-v1")).results).length===0'));
  console.log('ACTUAL_DEVICE_PASS '+JSON.stringify({checks,inputs,gates,origin:'custard://game',bootstrap,bootstrapQaQuery:bootstrap.search==='?qa=1',checkedDocumentQuery:entry.search,checkedDocumentQaHelpers:entry.qaHelpers,entry,rendererInstrumented:false,fixture:'Native programmatic UI on a clean reload after QA bootstrap; not ordinary untouched production startup. Only acceptance.run replaced in memory. Native synthesized mouse/Escape events; read-only DOM/save observations. No full movement/tray/combat-completion/physical-input claim.'}));app.exit(0);
 }catch(error){console.error('ACTUAL_DEVICE_FAIL '+JSON.stringify({error:error.stack,checks,inputs,gates}));app.exit(1);}
}
(async()=>{
 const asar=await import('@electron/asar');report.originalIndexSha256=require('node:crypto').createHash('sha256').update(asar.extractFile(archive,'index.html')).digest('hex');
 const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const child=spawn(exe,[`--inspect-brk=${port}`,'--acceptance-phase=write',`--acceptance-profile=${profile}`],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const exited=new Promise((r,j)=>{child.on('error',j);child.on('close',code=>r(code));});
 const watchdog=setTimeout(()=>child.kill(),180000);
 let ws;
 try{
  let endpoint;for(let i=0;i<100;i++){try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json`)).json())[0].webSocketDebuggerUrl;break;}catch{await sleep(100);}}
  if(!endpoint)throw Error('Actual EXE main inspector unavailable');
  ws=new WebSocket(endpoint);let id=0;const pending=new Map();let pausedResolve;
  const paused=new Promise(r=>pausedResolve=r);
  ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Debugger.paused')pausedResolve(d.params);};
  await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
  await send('Debugger.enable');await send('Runtime.runIfWaitingForDebugger');const pause=await paused;
  const injection=await send('Debugger.evaluateOnCallFrame',{callFrameId:pause.callFrames[0].callFrameId,expression:`require('./acceptance.cjs').run=(${injected.toString()})`,returnByValue:true});
  if(injection.exceptionDetails)throw Error(JSON.stringify(injection.exceptionDetails));
  await send('Debugger.resume');ws.close();
  const code=await exited;report.exitCode=code;report.stdout=stdout;report.stderr=stderr;
  const row=stdout.split(/\r?\n/).find(x=>x.startsWith('ACTUAL_DEVICE_PASS '));if(code!==0||!row)throw Error('Actual device smoke failed: '+stderr+' '+stdout);
  Object.assign(report,JSON.parse(row.slice('ACTUAL_DEVICE_PASS '.length)));report.pass=report.checks.every(x=>x.pass);
 }catch(error){report.pass=false;report.error=error.stack;report.stdout=stdout;report.stderr=stderr;child.kill();await exited;process.exitCode=1;}
 finally{clearTimeout(watchdog);ws?.close();report.asarSha256After=hash(archive);report.stableAsar=report.asarSha256After===asarBefore;if(!report.stableAsar){report.pass=false;process.exitCode=1;}fs.writeFileSync(path.join(out,'actual-bakery.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
