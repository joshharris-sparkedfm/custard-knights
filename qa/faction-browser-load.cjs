'use strict';
// One real rendered browser and 99 scripted connections, separate server/client processes.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn,fork}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||'qa/results/faction-browser-load');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const children=[],exits=[];let closing=false,chrome,ws,failed;
const source=Object.fromEntries(['index.html','game/mass-battle.js','game/mass-battle-ui.js','game/mass-battle-wire.js','server/mass-battle-server.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')]));
function child(role){
 const p=fork(path.join(__dirname,'mass-battle-process-load.cjs'),[role],{stdio:['ignore','inherit','inherit','ipc'],windowsHide:true}),queue=[];
 p.on('message',m=>{queue.push(m);if(m.type==='fatal')failed=Error(m.message);});
 p.on('error',e=>failed=e);p.on('exit',(code,signal)=>{exits.push({role,code,signal});if(!closing)failed=Error(role+' exited '+code);});
 const c={p,async wait(type){for(let i=0;i<1200;i++){if(failed)throw failed;const k=queue.findIndex(m=>m.type===type);if(k>=0)return queue.splice(k,1)[0];await sleep(50);}throw Error('Child timeout '+role+' '+type);}};children.push(c);return c;
}
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const server=child('--server'),ready=await server.wait('ready');
 const workers=[25,25,25,24].map((count,i)=>{const c=child('--clients');c.p.send({type:'join',url:ready.url,count,offset:i*25});return c;});
 await Promise.all(workers.map(c=>c.wait('ready')));
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-rendered-load-'));
 chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1600,950','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome startup timeout');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map(),errors=[];
 ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);const p=pending.get(d.id);if(p){pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout '+method));},40000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{if(failed)throw failed;const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:950,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 for(let i=0;i<150;i++){if(await run('!!window.CK'))break;await sleep(100);}
 await run(`CK.sprLoadAll()`);
 await run(`window.loadStats={cost:[],gaps:[],last:0,failed:0,active:false};window.CKMassBattleWire={...CKMassBattleWire,createDecoder(){const d=CKMassBattleWireOriginal.createDecoder();return{reset:()=>d.reset(),apply(m){const start=performance.now(),s=d.apply(m);if(loadStats.active){loadStats.cost.push(performance.now()-start);if(loadStats.last)loadStats.gaps.push(start-loadStats.last);loadStats.last=start;if(!s)loadStats.failed++;}return s;}};}};` .replace('window.CKMassBattleWire=','window.CKMassBattleWireOriginal=CKMassBattleWire;window.CKMassBattleWire='));
 await run(`CK.massBattle().open();for(const [label,value] of [['Battle mode','brawl'],['Army size','50']]){const select=Array.from(document.querySelectorAll('.ck-battle label')).find(l=>l.firstChild.textContent===label).querySelector('select');select.value=value;select.onchange?.();}document.querySelector('.ck-battle input[maxlength="24"]').value='Browser QA';document.querySelector('.ck-battle input[type=url]').value=${JSON.stringify(ready.url)};document.querySelector('.ck-battle input[placeholder]').value='load';Array.from(document.querySelectorAll('.ck-battle button')).find(b=>b.textContent==='Join online battle').click();`);
 for(let i=0;i<120;i++){if(await run('!!CK.massBattle().snapshot()&&CK.massBattle().snapshot().players.filter(p=>!p.bot).length===100'))break;await sleep(100);}
 if(!await run('!!CK.massBattle().snapshot()&&CK.massBattle().snapshot().players.filter(p=>!p.bot).length===100'))throw Error('Browser did not join 100-player room');
 server.p.send({type:'start'});await server.wait('started');for(const c of workers)c.p.send({type:'start',duration:30});
 const me=await run(`CK.massBattle().snapshot().players.find(p=>p.name==='Browser QA')`),key=me.x<1600?'d':'a',code='Key'+key.toUpperCase();
 await send('Input.dispatchKeyEvent',{type:'keyDown',code,key,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});await sleep(8000);await send('Input.dispatchKeyEvent',{type:'keyUp',code,key,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});
 await send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyJ',key:'j',windowsVirtualKeyCode:74});
 await run(`loadStats.active=true;window.frameStats={started:performance.now(),last:0,gaps:[],active:true};function measureFrame(t){if(frameStats.last)frameStats.gaps.push(t-frameStats.last);frameStats.last=t;if(frameStats.active)requestAnimationFrame(measureFrame);}requestAnimationFrame(measureFrame);`);
 await send('Profiler.enable');await send('Profiler.setSamplingInterval',{interval:1000});await send('Profiler.start');await sleep(20000);const cpu=(await send('Profiler.stop')).profile;
 const browser=await run(`(()=>{loadStats.active=false;frameStats.active=false;const pct=(a,q)=>[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*q))]||0,seconds=(performance.now()-frameStats.started)/1000;return{seconds,fps:frameStats.gaps.length/seconds,frameP95Ms:pct(frameStats.gaps,.95),frameP99Ms:pct(frameStats.gaps,.99),decodeCalls:loadStats.cost.length,decodeP95Ms:pct(loadStats.cost,.95),decodeMaxMs:Math.max(...loadStats.cost),receiveHz:loadStats.cost.length/seconds,receiveGapP95Ms:pct(loadStats.gaps,.95),receiveGapMaxMs:Math.max(...loadStats.gaps),decodeFailures:loadStats.failed,network:CK.massBattle().qa.networkStats(),humans:CK.massBattle().snapshot().players.filter(p=>!p.bot).length,player:CK.massBattle().snapshot().players.find(p=>p.name==='Browser QA'),connectionInterrupted:document.querySelector('.ck-battle-modal').textContent.includes('Connection interrupted')}})()`);
 fs.writeFileSync(path.join(OUT,'browser.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 const results=await Promise.all(workers.map(c=>c.wait('result')));server.p.send({type:'result'});const serverResult=await server.wait('result');
 const nodes=new Map(cpu.nodes.map(n=>[n.id,n])),totals=new Map();cpu.samples.forEach((n,i)=>{const f=nodes.get(n).callFrame,k=(f.functionName||'(anonymous)')+' '+f.url.split('/').pop()+':'+f.lineNumber;totals.set(k,(totals.get(k)||0)+cpu.timeDeltas[i]);});
 const top=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([name,us])=>({name,ms:us/1000}));
 const result={date:new Date().toISOString(),source,host:{cpu:os.cpus()[0].model,node:process.version},browser,server:serverResult,workers:results,errors,cpuTop:top,limitations:'One headless Chrome player and 99 scripted clients share the host but use independent server/client processes. Actual renderer at1600x950 with normal camera culling, walking from spawn then holding attack.20-second browser sample within30-second load; CPU profiler adds overhead. No WAN, human play, physical controller or minimum-spec claim.'};
 fs.writeFileSync(path.join(OUT,'profile.json'),JSON.stringify(cpu));fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({browser,cpuTop:top,errors}));if(errors.length||browser.decodeFailures||browser.humans!==100||browser.connectionInterrupted||results.some(r=>r.errors.length||r.unexpectedCloses.length))throw Error('Browser load failed');
})().catch(error=>{console.error(error);fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify({error:error.stack,source,exits},null,2));process.exitCode=1;}).finally(async()=>{closing=true;for(const c of children)if(c.p.connected)c.p.send({type:'stop'});ws?.close();chrome?.kill();await sleep(400);for(const c of children)if(c.p.exitCode===null)c.p.kill();});
