'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['Actual EXE, isolated marked profile. Programmatic DOM clicks and synthetic navigator pads with three observed polls per phase bounded to 10 seconds. No CK helpers. Native room UI vacancy/rejoin/recovery/Cup-entry smoke; not physical/input-only, combat completion, Cup-result readiness, real transport, Steam Input, responsiveness or human usability acceptance. In-memory acceptance.run replacement; ASAR unchanged.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  await win.loadURL('custard://game/index.html');
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],test=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name);};
   const click=s=>{const e=document.querySelector(s);if(!e)throw Error('Missing '+s);e.focus();e.click();};
   const rows=()=>[...document.querySelectorAll('#seats .seat')].map(e=>({text:e.textContent,color:e.style.borderColor,occupied:e.classList.contains('on')}));
   window.qaPollCount=0;const pad=index=>({index,id:'Native room pad '+index,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});window.qaPads=[0,1,2,3].map(pad);Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{qaPollCount++;return qaPads}});
   const wait=async()=>{const n=qaPollCount,end=performance.now()+10000;while(qaPollCount-n<3){if(performance.now()>end)throw Error('Observed poll gate exceeded 10 seconds');await new Promise(r=>setTimeout(r,25));}};
   const button=async(index,n)=>{const p=qaPads.find(p=>p.index===index);p.buttons[n]={pressed:false,value:0};await wait();p.buttons[n]={pressed:true,value:1};await wait();p.buttons[n]={pressed:false,value:0};await wait();};
   await document.fonts.ready;await wait();test('Native origin has no QA helpers',location.origin==='custard://game'&&!location.search&&!window.CK);
   click('#onboardingJump');click('#tFriends');click('#tParty');await wait();for(let i=0;i<4;i++)await button(i,0);
   const before=rows();test('Four sampled synthetic pads join four logical slots',before.length===4&&before.every(r=>r.occupied)&&before.every((r,i)=>r.text.includes('Player '+(i+1)+' controller')));
   click('#seats .seat:nth-child(2) .leave');await wait();const after=rows();test('Middle Leave preserves P1 P3 P4 labels colours and control prompts',!after[1].occupied&&after[1].text.includes('Player 2')&&[0,2,3].every(i=>JSON.stringify(after[i])===JSON.stringify(before[i])));
   await button(1,0);test('Rejoin reclaims vacant P2 without survivor relabel',rows()[1].occupied&&[0,2,3].every(i=>JSON.stringify(rows()[i])===JSON.stringify(before[i])));
   const lost=qaPads.find(p=>p.index===2);qaPads=qaPads.filter(p=>p.index!==2);lost.connected=false;const ev=new Event('gamepaddisconnected');Object.defineProperty(ev,'gamepad',{value:lost});dispatchEvent(ev);await wait();
   test('Missing P3 remains reserved and blocks Cup start',rows()[2].text.includes('seat reserved')&&document.getElementById('partyCup').disabled&&!document.getElementById('deviceRecovery').hidden);
   qaPads.push(pad(4));await wait();click('#deviceRecoverySeats [data-seat="3"]');await button(4,0);test('Selected recovery restores P3 and permits Cup',rows()[2].occupied&&rows()[2].text.includes('Player 3 controller')&&!document.getElementById('partyCup').disabled&&document.getElementById('deviceRecovery').hidden);
   click('#partyCup');await wait();test('Actual Cup entry leaves couch menu and shows arena',document.getElementById('party').hidden&&!document.getElementById('pauseBtn').hidden);
   return {checks,origin:location.origin,syntheticPolls:qaPollCount,before,after,reclaimed:rows()};
  })()`);
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
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-room.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
