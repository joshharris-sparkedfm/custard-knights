'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['Synthetic standard pads injected only at navigator boundary; programmatic DOM clicks and poller-driven edges. This checks native presentation/recovery, not physical input, timing, action neutrality, real transport or responsiveness.','Actual packaged desktop origin with programmatic click smoke; physical-device and human acceptance remain open.','In-memory inspector replacement of acceptance.run only; packaged bytes are not edited.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  await win.loadURL('custard://game/index.html');
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],test=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name+' '+JSON.stringify({checks,polls:window.qaPolls,pulses:window.qaPulses,labels:[...document.querySelectorAll('#seats .on small')].map(e=>e.textContent)}));};
   const click=selector=>{const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);e.focus();e.click();};
   const wait=()=>new Promise(r=>setTimeout(r,230));
   const pad=(index,id)=>({index,id,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
   window.qaPads=[pad(0,'Native Alpha'),pad(1,'Native Beta')];window.qaPolls=[];window.qaPulses=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{qaPolls.push({t:performance.now(),buttons:qaPads.map(p=>({index:p.index,a:p.buttons[0].pressed})),hidden:document.hidden,party:!document.getElementById('party').hidden});return qaPads}});
   const button=async(index,n,held=false)=>{const p=qaPads.find(p=>p.index===index);qaPulses.push({phase:'down',index,n,t:performance.now(),party:!document.getElementById('party').hidden});p.buttons[n]={pressed:true,value:1};await wait();if(!held){qaPulses.push({phase:'up',index,n,t:performance.now(),labels:[...document.querySelectorAll('#seats .on small')].map(e=>e.textContent)});p.buttons[n]={pressed:false,value:0};await wait();}};
   const remove=async(index)=>{const p=qaPads.find(p=>p.index===index);qaPads=qaPads.filter(p=>p.index!==index);p.connected=false;const e=new Event('gamepaddisconnected');Object.defineProperty(e,'gamepad',{value:p});dispatchEvent(e);await wait();};
   const labels=()=>[...document.querySelectorAll('#seats .on small')].map(e=>e.textContent);
   await document.fonts.ready;test('Actual desktop native origin without QA helpers',location.origin==='custard://game'&&!location.search&&!window.CK);
   click('#onboardingJump');await wait();click('#tFriends');await wait();click('#tParty');await wait();
   await button(1,0);await button(0,0);
   test('Synthetic pads join in deliberate reverse order',labels().length===2&&labels()[0].includes('Controller 2')&&labels()[1].includes('Controller 1'));
   return {checks,origin:location.origin,polls:qaPolls,pulses:qaPulses};
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
  const row=stdout.split(/\r?\n/).find(x=>x.startsWith('ACTUAL_DEVICE_PASS '));if(code!==0||!row)throw Error('Actual device smoke failed: '+stderr+' '+stdout);
  Object.assign(report,JSON.parse(row.slice('ACTUAL_DEVICE_PASS '.length)));report.pass=report.checks.every(x=>x.pass);
 }catch(error){report.pass=false;report.error=error.stack;report.stdout=stdout;report.stderr=stderr;child.kill();await exited;process.exitCode=1;}
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-device.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
