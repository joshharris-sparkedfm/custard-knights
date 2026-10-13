'use strict';
// Runs only a supplied actual EXE, in the same marked temporary profile contract
// as desktop acceptance. Inspector injection is in-memory; ASAR stays unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const exe=path.resolve(process.argv[2]),out=__dirname;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const report={attempt:3,executable:exe,profile,checks:[],limitations:['Actual EXE, isolated marked profile. Programmatic DOM clicks/slider inputs and direct production showBanner/clearBanner fixtures. Observed readiness predicates bounded to 10 seconds. No CK query helpers. Native warning/UI music-volume/mute/reset smoke; not physical/input-only, combat completion, human listening, real transport, Steam Input, responsiveness or usability acceptance. In-memory acceptance.run replacement and native index response fixture insertion inside production closure; on-disk ASAR unchanged. Instrumented-renderer acceptance, not untouched-renderer acceptance.']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function injected({app,win}){
 try{
  const electron=require('electron'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
  const root=path.resolve(__dirname,'..'),original=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const marker='requestAnimationFrame(frame);\n})();';
  const normalized=original.replaceAll('\r\n','\n');
  if(normalized.split(marker).length!==2)throw Error('Native fixture closure marker not unique');
  const fixture=`(async()=>{
   const state=()=>({banner:G?.banner,music:{saved:SET.music,base:musicBaseVolume,duck:warningDuck,volume:music.volume,paused:music.paused,muted},bus:sfxMixer?.bus.gain.value,hidden:document.hidden,menuOpen:NET.menuOpen,paused,warningAudioBlocked,demo:G?.demo,over:G?.over});
   window.nativeWarningObservations={checks:[],gates:[]};
   const checks=nativeWarningObservations.checks,test=(name,pass)=>{checks.push({name,pass,state:state()});if(!pass)throw Error(name+' '+JSON.stringify(nativeWarningObservations));};
   const click=s=>{const e=document.querySelector(s);if(!e)throw Error('Missing '+s);e.focus();e.click();};
   const wait=async predicate=>{const gate={predicate:predicate.toString(),observations:[]};nativeWarningObservations.gates.push(gate);const end=performance.now()+10000;while(true){const pass=!!predicate();gate.observations.push({time:performance.now(),pass,state:state()});if(pass)return;if(performance.now()>end)throw Error('Readiness predicate exceeded 10 seconds '+JSON.stringify(nativeWarningObservations));await new Promise(r=>setTimeout(r,25));}};
   const slider=(id,value)=>{const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));};
   await document.fonts.ready;await wait(()=>!!document.getElementById('onboardingJump')&&!document.hidden);
   test('Native origin has no CK query helpers and ships warning modules',location.origin==='custard://game'&&!location.search&&!window.CK&&!!window.CKWarnings&&!!window.CKWarningMixer);
   click('#onboardingJump');click('#tSettings');slider('sMusic',23);slider('sSfx',41);click('#settings [data-back]');click('#tQuick');click('#quickStart');await wait(()=>!document.getElementById('pauseBtn').hidden&&!!sfxMixer);
   test('Actual menu starts arena with local music and SFX choices',!G.demo&&SET.music===.23&&SET.sfx===.41);
   // Direct production functions force a bounded warning; no gameplay or input-only claim.
   clearBanner();showBanner({title:'Native warning',sub:'Bounded acceptance fixture',col:'#FF5A4E',t:8,max:8},'hazard','native-warning','spike');showBanner({title:'Native flavour',sub:'Lower priority fixture',col:'#FFD23F',t:8,max:8},'flavour','native-flavour');
   await wait(()=>musicBaseVolume===SET.music&&Math.abs(music.volume-.0805)<.005);
   test('Critical native banner retains priority and local music duck',G.banner.key==='native-warning'&&warningDuck===.35&&Math.abs(music.volume-.0805)<.005);
   slider('sMusic',40);test('Live volume changes retain warning factor',SET.music===.4&&Math.abs(music.volume-.14)<.005);
   click('#muteBtn');const mutedState={muted,musicPaused:music.paused,bus:sfxMixer.bus.gain.value};test('Mute silences local music and native SFX bus',mutedState.muted&&mutedState.musicPaused&&mutedState.bus===0);click('#muteBtn');await wait(()=>!music.paused&&musicBaseVolume===SET.music&&Math.abs(music.volume-.14)<.005);test('Unmute restores selected warning volume and SFX bus',Math.abs(music.volume-.14)<.005&&Math.abs(sfxMixer.bus.gain.value-.41)<.005);
   click('#pauseBtn');await wait(()=>musicBaseVolume===SET.music&&Math.abs(music.volume-.4)<.005);test('Actual Pause releases warning duck',!document.getElementById('pause').hidden&&warningDuck===1&&Math.abs(music.volume-.4)<.005);click('#resumeBtn');await wait(()=>warningDuck===.35&&musicBaseVolume===SET.music);clearBanner();test('Warning clear restores user level without altering saved preferences',warningDuck===1&&Math.abs(music.volume-.4)<.005&&SET.music===.4&&SET.sfx===.41);
   return {checks,gates:nativeWarningObservations.gates,origin:location.origin,mutedState,mixer:sfxMixer.stats(),settings:{music:SET.music,sfx:SET.sfx},fixture:'Programmatic UI and direct production showBanner/clearBanner; no CK helpers, gameplay completion or input-only acceptance.'};
  })()`;
  const instrumented=normalized.replace(marker,'window.nativeWarningAcceptance='+fixture+';\n'+marker);
  const rendererFixture={indexOriginalSha256:crypto.createHash('sha256').update(original).digest('hex'),indexInstrumentedSha256:crypto.createHash('sha256').update(instrumented).digest('hex'),insertion:'Bounded asynchronous acceptance fixture inserted at unique final closure marker; other native assets unchanged',asarUnchanged:true};
  console.log('NATIVE_RENDERER_FIXTURE '+JSON.stringify(rendererFixture));
  const serve=require('./assets.cjs').createAssetHandler(root,electron.net);
  electron.protocol.unhandle('custard');
  electron.protocol.handle('custard',request=>request.url==='custard://game/index.html'&&request.method==='GET'?new Response(instrumented,{headers:{'content-type':'text/html; charset=utf-8'}}):serve(request));
  await win.loadURL('custard://game/index.html');win.showInactive();
  const result=await win.webContents.executeJavaScript('window.nativeWarningAcceptance');
  result.rendererFixture=rendererFixture;
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
 finally{clearTimeout(watchdog);ws?.close();fs.writeFileSync(path.join(out,'actual-warning-fixture3.json'),JSON.stringify(report,null,2)+'\n');fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
