'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['FakePeer injects admission faults only; this native smoke does not establish real PeerJS transport or responsiveness.','Actual packaged desktop origin with programmatic click smoke; physical-device and human acceptance remain open.','In-memory inspector replacement of acceptance.run only; packaged bytes are not edited.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  await win.loadURL('custard://game/index.html');
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],test=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name);};
   const click=selector=>{const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);e.focus();e.click();};
   const wait=()=>new Promise(r=>setTimeout(r,200));
   await document.fonts.ready;
   test('Actual desktop native origin',location.origin==='custard://game'&&!location.search);
   click('#onboardingJump');await wait();
   const saved=JSON.stringify(['ck-cfg','ck-progress','ck-collection','ck-campaign-v1'].map(k=>localStorage.getItem(k)));
   click('#tFriends');await wait();click('#tOnline');await wait();
   test('Friends route opens Online room',!document.getElementById('online').hidden);
   click('#joinBtn');await wait();
   test('Invalid code gives actionable recovery',!document.getElementById('online').hidden&&document.getElementById('menuMsg').textContent.includes('5'));
   window.qaPeers=[];window.Peer=class{constructor(){this.handlers={};qaPeers.push(this)}on(t,f){(this.handlers[t]||=[]).push(f);return this}emit(t,v){for(const f of this.handlers[t]||[])f(v)}destroy(){this.destroyed=true} };
   click('#hostBtn');await wait();
   test('Hosting pending presents Cancel and status',!document.getElementById('lobby').hidden&&document.getElementById('lobbyLeave').textContent==='Cancel'&&document.getElementById('lobbyMsg').textContent.includes('Opening'));
   click('#lobbyLeave');await wait();
   test('Cancel returns online with focused host control',!document.getElementById('online').hidden&&document.getElementById('menuMsg').textContent.includes('cancelled')&&document.activeElement.id==='hostBtn'&&qaPeers[0].destroyed);
   click('#hostBtn');await wait();qaPeers[1].emit('error',{type:'network'});await wait();
   test('Failed host offers visible focused retry',!document.getElementById('online').hidden&&!document.getElementById('onlineRetry').hidden&&document.activeElement.id==='onlineRetry');
   click('#onlineRetry');await wait();
   test('Retry starts fresh pending attempt',qaPeers.length===3&&!document.getElementById('lobby').hidden&&document.getElementById('lobbyLeave').textContent==='Cancel');
   click('#lobbyLeave');await wait();
   test('Recovery preserves saved progress and setup',JSON.stringify(['ck-cfg','ck-progress','ck-collection','ck-campaign-v1'].map(k=>localStorage.getItem(k)))===saved);
   click('#hostBtn');await wait();qaPeers[3].emit('open');await wait();click('#lobbyStart');await wait();
   test('Admitted host starts with visible Menu',!document.getElementById('pauseBtn').hidden&&document.getElementById('pauseBtn').textContent==='Menu');
   click('#pauseBtn');await wait();
   test('Online Match menu offers Options Resume and host close',!document.getElementById('pause').hidden&&document.getElementById('pauseTitle').textContent==='Match menu'&&!document.getElementById('matchOptions').hidden&&document.getElementById('quitBtn').textContent==='Close room and leave');
   click('#resumeBtn');await wait();test('Resume closes Match menu',document.getElementById('pause').hidden);
   click('#pauseBtn');await wait();click('#quitBtn');await wait();test('Close room returns home',!document.getElementById('menu').hidden&&qaPeers[3].destroyed);
   return {checks,origin:location.origin};
  })()`);
  const loaded=new Promise(r=>win.webContents.once('did-finish-load',r));win.reload();await loaded;
  const retained=await win.webContents.executeJavaScript(`document.getElementById('firstLaunch').hidden&&!document.getElementById('menu').hidden`);
  result.checks.push({name:'Reload retains welcome choice and home',pass:retained});if(!retained)throw Error('Reload did not retain skip');
  console.log('ACTUAL_RECOVERY_PASS '+JSON.stringify(result));app.exit(0);
 }catch(error){console.error('ACTUAL_RECOVERY_FAIL '+error.stack);app.exit(1);}
}

(async()=>{
 const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const child=spawn(exe,[`--inspect-brk=${port}`,'--acceptance-phase=write',`--acceptance-profile=${profile}`],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const exited=new Promise((r,j)=>{child.on('error',j);child.on('close',code=>r(code));});
 const watchdog=setTimeout(()=>child.kill(),60000);
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
  const row=stdout.split(/\r?\n/).find(x=>x.startsWith('ACTUAL_RECOVERY_PASS '));if(code!==0||!row)throw Error('Actual recovery failed: '+stderr+' '+stdout);
  Object.assign(report,JSON.parse(row.slice('ACTUAL_RECOVERY_PASS '.length)));report.pass=report.checks.every(x=>x.pass);
 }catch(error){report.pass=false;report.error=error.stack;report.stdout=stdout;report.stderr=stderr;child.kill();await exited;process.exitCode=1;}
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-recovery.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
