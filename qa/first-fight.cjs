'use strict';
// Isolated synthetic integration checks. Exported test observations are not human playtest evidence.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(__dirname,'results','first-fight'));
const packaged=process.argv.includes('--packaged'),archive=path.join(root,'dist/Custard Knights-win32-x64/resources/app.asar');
fs.mkdirSync(out,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),packaged?'ck-soundtrack-browser-':'ck-first-fight-')),profile=path.join(temporary,'chrome');
let chrome,ws,diagnostics='';
if(packaged){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;chrome=spawn(require('electron'),[path.join(__dirname,'soundtrack-electron.cjs'),'--qa-archive='+archive,'--qa-profile='+profile,'--remote-debugging-port=0','--mute-audio','--autoplay-policy=no-user-gesture-required'],{env,stdio:['ignore','ignore','pipe'],windowsHide:true});chrome.stderr.on('data',d=>{diagnostics+=d;});}
else chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--window-size=1280,800','--remote-debugging-port=0','--user-data-dir='+profile,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),report={checks:[],errors:[],network:[],packaged,limitations:'Synthetic input in isolated profiles; Forced variant/timer/transition fixtures exercise study wiring, not human first-fight behaviour. No human baseline or physical-controller acceptance.'};
const timeout=setTimeout(()=>{chrome.kill();process.exitCode=1;},150000);
const check=(name,pass,details)=>{report.checks.push({name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)throw Error(name);};
(async()=>{
 let port;for(let i=0;i<120;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{const m=/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/.exec(diagnostics);if(m){port=+m[1];break;}await sleep(100);}}if(!port)throw Error('Browser failed to start '+diagnostics);
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);if(d.method==='Network.requestWillBeSent'){const u=d.params.request.url;report.network.push(u.startsWith('data:')?'data:[embedded asset omitted]':u);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const url=packaged?'custard://game/index.html':require('node:url').pathToFileURL(path.join(root,'index.html')).href;
 const ready=async query=>{await send('Page.navigate',{url:'about:blank'});await send('Page.navigate',{url:url+query});for(let i=0;i<150;i++){if(await run('!!document.getElementById("reportConsent")&&!!window.CKProductEvents'))return;await sleep(100);}throw Error('Reporting UI did not load');};
 const stored='JSON.parse(localStorage.getItem(CKProductEvents.KEY)||\'{"records":[]}\')';
 await send('Runtime.enable');await send('Network.enable');await send('Page.enable');await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:out});

 await ready('?qa=1');for(let i=0;i<100&&!await run('!!window.CK');i++)await sleep(100);
 await run('window.F=CKFirstFight;window.events=()=>CK.productReport().events;window.click=id=>document.getElementById(id).click();window.baseline=()=>JSON.stringify([CK.cfg,CK.seats(),CK.PROG,CK.collection(),...["ck-cfg","ck-played","ck-hits","ck-taught"].map(k=>localStorage.getItem(k))]);');
 await run('click("firstFightStart")');check('Study cannot enroll without consent',await run('CK.firstFight()===null&&events().length===0'));
 await run('click("reportConsent");Object.assign(CK.cfg,{mode:"teams",diff:"hard",length:180,map:"factory",players:2,chaosSpeed:"insane"});');
 for(const [experiment,variant,count] of [['density','four',4],['density','eight',8],['arena','curated',8],['arena','random',8]]){
  await run(`CK.toMenu();click('reportClear');window.before=baseline();window.CKFirstFight={...F,assign:()=>F.variant('${experiment}','${variant}')};document.getElementById('firstFightExperiment').value='${experiment}';click('firstFightStart');CK.freeze(true)`);
  check(`${experiment}/${variant}: actual solo setup`,await run(`CK.G().firstFight&&CK.G().ents.length===${count}&&CK.G().ents.filter(e=>e.human).length===1&&CK.cfg.diff==='easy'&&CK.cfg.length===90&&CK.cfg.chaosSpeed==='simple'&&CK.G().mode==='ffa'`));
  check(`${experiment}/${variant}: assignment before linked round`,await run(`(()=>{const a=events().find(e=>e.name==='experiment_assigned'),r=events().find(e=>e.name==='round_started');return a&&r&&a.fields.trialId===r.fields.trialId&&a.fields.variant==='${variant}'&&a.fields.totalKnights===${count}&&a.fields.humanCount===1})()`));
  await run('CK.G().clock=90;CK.G().time=0;CK.update(.01)');
  check(`${experiment}/${variant}: timed completion restores config, progression and counters`,await run('CK.G().over&&CK.firstFight()===null&&baseline()===before&&!document.getElementById("firstFightRecognition").hidden'));
  await run('document.querySelector("[data-recognition=recognised]").click();document.querySelector("[data-recognition=not_recognised]").click()');
  check(`${experiment}/${variant}: one terminal and one recognition`,await run(`events().filter(e=>e.name==='experiment_outcome'&&e.fields.outcome==='completed').length===1&&events().filter(e=>e.name==='experiment_outcome'&&e.fields.outcome==='recognised').length===1&&!events().some(e=>e.fields.outcome==='not_recognised')`));
  await run('click("firstFightStart")');check(`${experiment}/${variant}: completed comparison not repeated`,await run('CK.firstFight()===null&&events().filter(e=>e.name==="experiment_assigned").length===1'));
  await run('click("againBtn");CK.freeze(true)');check(`${experiment}/${variant}: explicit normal round restores ordinary density and has no trial`,await run('!CK.G().firstFight&&CK.G().ents.length===8&&CK.cfg.diff==="hard"&&!events().filter(e=>e.name==="round_started").at(-1).fields.trialId'));
 }
 await run(`CK.toMenu();click('reportClear');window.before=baseline();window.CKFirstFight={...F,assign:()=>F.variant('density','four')};document.getElementById('firstFightExperiment').value='density';click('firstFightStart');CK.freeze(true);CK.toMenu()`);
 check('Abandonment restores setup without completion',await run('baseline()===before&&events().some(e=>e.fields.outcome==="abandoned")&&!events().some(e=>e.fields.outcome==="completed")'));
 await run(`window.CKFirstFight={...F,assign:()=>F.variant('density','eight')};click('firstFightStart');CK.freeze(true)`);
 check('Retry preserves assignment despite a different random draw',await run('CK.firstFight().variant==="four"&&CK.G().ents.length===4'));
 await run('click("reportConsent");CK.endMatch()');check('Opt-out erases trial records and ending still restores configuration',await run('baseline()===before&&events().length===0&&CK.firstFight()===null'));
 await run('CK.toMenu();click("reportConsent");CK.NET.role="client";click("firstFightStart");CK.NET.role=null');check('Online client cannot enter a solo study',await run('CK.firstFight()===null&&!events().some(e=>e.name==="experiment_assigned")'));
 for(const [label,transition] of [['menu','CK.toMenu()'],['story','CK.adventure.launch("banquet",false)'],['faction','CK.massBattle().qa.startPractice({teamSize:4,mode:"ctf"})'],['Cup','CK.startCup()']]){
  await run(`CK.massBattle().close();CK.toMenu();click('reportClear');click('firstFightStart');CK.freeze(true);${transition}`);
  check(`${label} transition closes the study once`,await run('CK.firstFight()===null&&events().filter(e=>e.name==="experiment_outcome"&&e.fields.outcome==="abandoned").length===1'));
 }
 await run(`CK.toMenu();click('reportClear');window.before=baseline();click('firstFightStart');CK.freeze(true);dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))`);
 check('Cached-page return cannot resume an abandoned study under ordinary settings',await run('CK.firstFight()===null&&CK.G().demo&&baseline()===before&&events().filter(e=>e.name==="experiment_outcome"&&e.fields.outcome==="abandoned").length===1'));
 check('QA study records never enter human baseline or experiment summaries',await run('CK.productReport().experiments.length===0&&CK.productReport().metrics.roundsStarted===0&&events().every(e=>e.fields.qa)'));
 check('No schema rejection during integrated flows',await run('CK.productReport().counts.rejected===0'),await run('CK.productReport().counts'));
 check('No HTTP/WebSocket uploads from recording/export flows',report.network.every(u=>!/^(https?|wss?):/.test(u)));
 check('No browser exceptions',report.errors.length===0);
 report.sourceHashes={};const hash=v=>require('node:crypto').createHash('sha256').update(v).digest('hex'),asar=packaged?await import('@electron/asar'):null;
 for(const file of ['index.html','game/product-events.js','game/first-fight.js'])report.sourceHashes[file]=hash(packaged?asar.extractFile(archive,file):fs.readFileSync(path.join(root,file)));
 if(packaged)report.archiveSha256=hash(fs.readFileSync(archive));
})().catch(error=>{report.failure=error.stack;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(c=>!c.pass),errors:report.errors.length,failure:report.failure,out}));clearTimeout(timeout);ws?.close();chrome.kill();});

