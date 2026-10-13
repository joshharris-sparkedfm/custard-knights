'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['Actual EXE, isolated marked profile; programmatic DOM selector changes/clicks and synthetic navigator pad. Three observed initial polls bounded to 10 seconds. Native origin has no CK helpers. Remapping UI/storage/reload smoke only; no combat, physical-device, Steam Input, human usability, responsiveness or real transport acceptance. In-memory acceptance.run replacement; ASAR unchanged.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  await win.loadURL('custard://game/index.html');
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],test=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name);};
   const click=s=>{const e=document.querySelector(s);if(!e)throw Error('Missing '+s);e.focus();e.click();};
   const select=(s,v)=>{const e=document.querySelector(s);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));};
   window.qaPollCount=0;window.qaPads=[{index:0,id:'Synthetic native pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))}];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{qaPollCount++;return qaPads}});
   const wait=async()=>{const n=qaPollCount,end=performance.now()+10000;while(qaPollCount-n<3){if(performance.now()>end)throw Error('Observed poll gate exceeded 10 seconds');await new Promise(r=>setTimeout(r,25));}};
   await document.fonts.ready;await wait();test('Actual packaged native origin has no QA game helpers',location.origin==='custard://game'&&!location.search&&!window.CK);
   click('#onboardingJump');click('#tSettings');click('#controlsOpen');
   test('Options opens real controls editor',!document.getElementById('controls').hidden);
   select('#controls-atk','KeyQ');click('#controlsCancel');test('Cancel discards draft without saving',localStorage.getItem('ck-controls-v1')===null);
   click('#controlsOpen');select('#controls-atk','KeyW');test('Conflict blocks Apply with explanation',document.getElementById('controlsApply').disabled&&document.getElementById('controlsStatus').textContent.includes('both'));
   select('#controls-atk','KeyQ');click('#controlsApply');let saved=JSON.parse(localStorage.getItem('ck-controls-v1'));test('Solo Apply persists selector map and status',saved.keyboard.solo.atk[0]==='KeyQ'&&document.getElementById('controlsSavedStatus').textContent.includes('saved'));
   click('#controlsOpen');select('#controlsProfile','pad1');select('#controls-atk','3');select('#controls-shout','0');click('#controlsApply');saved=JSON.parse(localStorage.getItem('ck-controls-v1'));test('Logical Player 1 combat map saved',saved.pads[0].atk[0]===3&&saved.pads[0].shout[0]===0);
   click('#settings [data-back]');click('#tHowto');test('Help updates actual gameplay labels',document.querySelector('#howto [data-in="pad"]').textContent.includes('Swing: Y')&&document.querySelector('#howto [data-in="kbm"]').textContent.includes('Swing: Q'));
   click('#howto [data-back]');click('#tSettings');click('#controlsOpen');click('#controlsReset');click('#controlsCancel');test('Reset draft Cancel retains maps',JSON.parse(localStorage.getItem('ck-controls-v1')).keyboard.solo.atk[0]==='KeyQ');
   return {checks,origin:location.origin,syntheticPolls:qaPollCount};
  })()`);
  await win.reload();
  const persisted=await win.webContents.executeJavaScript(`(async()=>{const end=performance.now()+10000;while(!document.getElementById('tSettings')){if(performance.now()>end)throw Error('Reload readiness');await new Promise(r=>setTimeout(r,25));}document.getElementById('tSettings').click();document.getElementById('controlsOpen').click();return document.getElementById('controls-atk').value==='KeyQ'&&JSON.parse(localStorage.getItem('ck-controls-v1')).pads[0].atk[0]===3})()`);
  result.checks.push({name:'Native reload restores local keyboard and pad maps',pass:persisted});if(!persisted)throw Error('Persistence failed');
  console.log('ACTUAL_DEVICE_PASS '+JSON.stringify(result));app.exit(0);
 }catch(error){console.error('ACTUAL_DEVICE_FAIL '+error.stack);app.exit(1);}
}

(async()=>{
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
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-controls.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
