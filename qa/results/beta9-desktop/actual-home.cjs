'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:1,executable:exe,profile,checks:[],limitations:['Actual packaged desktop origin with programmatic click smoke; physical-device and human acceptance remain open.','In-memory inspector replacement of acceptance.run only; packaged bytes are not edited.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],test=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name);};
   const click=selector=>{const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);e.click();};
   const wait=()=>new Promise(r=>setTimeout(r,180));
   await document.fonts.ready;await CK.sprLoadAll();
   test('Actual desktop origin',location.origin==='custard://game');
   test('Four primary routes',document.querySelectorAll('.home-routes button').length===4);
   for(const [id,target,back] of [['tQuick','quickRoute','#quickRoute [data-back]'],['tAdventure','campaignMap','#campaignMap .campaign-panel > button:last-child'],['tFriends','friendsRoute','#friendsRoute [data-back]'],['tFactionBattle','faction','.ck-battle-actions button:last-child']]){
    click('#'+id);await wait();
    test('Desktop opens '+id,target==='faction'?CK.massBattle().active():!document.getElementById(target).hidden);
    click(back);await wait();test('Desktop returns focus '+id,!document.getElementById('menu').hidden&&document.activeElement.id===id);
   }
   test('Desktop Quit visible',!document.getElementById('tQuit').hidden);
   click('#tQuit');await wait();test('Quit opens confirmation',!document.getElementById('quitDialog').hidden&&document.getElementById('menu').inert&&document.activeElement.id==='quitCancel');
   click('#quitCancel');await wait();test('Keep playing cancels Quit',document.getElementById('quitDialog').hidden&&!document.getElementById('menu').inert&&document.activeElement.id==='tQuit');
   return {checks,origin:location.origin};
  })()`);
  console.log('ACTUAL_HOME_PASS '+JSON.stringify(result));app.exit(0);
 }catch(error){console.error('ACTUAL_HOME_FAIL '+error.stack);app.exit(1);}
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
  const row=stdout.split(/\r?\n/).find(x=>x.startsWith('ACTUAL_HOME_PASS '));if(code!==0||!row)throw Error('Actual home failed: '+stderr+' '+stdout);
  Object.assign(report,JSON.parse(row.slice('ACTUAL_HOME_PASS '.length)));report.pass=report.checks.every(x=>x.pass);
 }catch(error){report.pass=false;report.error=error.stack;report.stdout=stdout;report.stderr=stderr;child.kill();await exited;process.exitCode=1;}
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-home.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
