'use strict';
// Isolated actual-Chrome QA. Synthetic pads exercise the normal browser boundary;
// this cannot establish physical-controller, human, network, or Steam acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_QA_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','onboarding-2026-10-13'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={startedAt:new Date().toISOString(),runtime:{node:process.execPath,chrome:CHROME,root:ROOT},checks:[],consoleErrors:[],limitations:['Actual isolated Chrome with CDP mouse/keyboard and synthetic standard gamepad.','No physical controllers, human usability, external networking, packaged EXE, second Windows PC, or Steam testing.','Fixtures write only to temporary Chrome profiles; the user game and normal saves are untouched.']};
fs.mkdirSync(OUT,{recursive:true});
const children=[],sockets=[];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const sources=['index.html','game/onboarding.js'];
report.sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(f)]));
async function browser(name,fixture,init,native=false){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-onboarding-'+name+'-'));
 const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1600,1000','--force-device-scale-factor=1','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});children.push(chrome);
 let port;for(let i=0;i<150;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const target=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);sockets.push(ws);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.consoleErrors.push({profile:name,details:d.params.exceptionDetails});};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method));},15000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 if(fixture)await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.protocol==='file:'){for(const [k,v] of Object.entries(${JSON.stringify(fixture)}))localStorage.setItem(k,JSON.stringify(v));}`});
 if(init)await send('Page.addScriptToEvaluateOnNewDocument',{source:init});
 const baseUrl=require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href;
 const url=baseUrl+(native?'':'?qa=1');
 const waitLoaded=async()=>{for(let i=0;i<150;i++){if(await run("document.readyState==='complete'&&!!document.getElementById('menu')&&(!location.search.includes('qa')||!!window.CK&&!!CK.adventure)"))return;await sleep(100);}throw Error('Actual game failed to load');};
 const enableQa=async()=>{await send('Page.navigate',{url:baseUrl+'?qa=1'});await waitLoaded();await run('CK.sprLoadAll()');await sleep(200);};
 await send('Page.navigate',{url});await waitLoaded();await run('window.CK?.sprLoadAll()');await sleep(300);
 const shot=async tag=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,name+'-'+tag+'.png'),Buffer.from(r.data,'base64'));};
 const click=async selector=>{await run(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'nearest'})`);const r=await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||!e.getClientRects().length)throw Error('Not an enabled visible target: '+${JSON.stringify(selector)});return e.getBoundingClientRect().toJSON()})()`);const x=r.x+r.width/2,y=r.y+r.height/2;for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});await sleep(120);};
 const key=async code=>{const keys={Enter:['Enter',13],Space:[' ',32],Escape:['Escape',27],Tab:['Tab',9],ArrowDown:['ArrowDown',40],ArrowRight:['ArrowRight',39],KeyF:['f',70],KeyJ:['j',74]};const [key,n]=keys[code]||[code,0];for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,code,key,windowsVirtualKeyCode:n});await sleep(100);};
  const hold=async(code,ms=220)=>{const letters={KeyD:['d',68],KeyW:['w',87],Space:[' ',32],KeyE:['e',69],ShiftLeft:['Shift',16],Enter:['Enter',13]};const [key,n]=letters[code]||[code,0];await send('Input.dispatchKeyEvent',{type:'keyDown',code,key,windowsVirtualKeyCode:n});await sleep(ms);await send('Input.dispatchKeyEvent',{type:'keyUp',code,key,windowsVirtualKeyCode:n});await sleep(120);};
 const mouse=async(button='left',ms=160)=>{for(const type of ['mousePressed','mouseReleased']){await send('Input.dispatchMouseEvent',{type,x:700,y:500,button,buttons:type==='mousePressed'?(button==='left'?1:2):0,clickCount:1});if(type==='mousePressed')await sleep(ms);}await sleep(150);};
 const focus=selector=>run(`document.querySelector(${JSON.stringify(selector)}).focus()`);
 const state=()=>run(`({active:document.activeElement.id||document.activeElement.textContent.trim().slice(0,70),overlays:[...document.querySelectorAll('.overlay')].filter(e=>!e.hidden).map(e=>e.id||e.className),playing:window.CK?!!CK.G()&&!CK.G().demo&&!CK.G().over:null,seats:window.CK?CK.seats():null,cfg:window.CK?{...CK.cfg}:null})`);
 const step=async(title,fn)=>{try{const details=await fn(),pass=details===true||!!details?.pass;report.checks.push({profile:name,name:title,pass,details});console.log((pass?'PASS ':'FAIL ')+name+': '+title);if(!pass){await shot('failure-'+report.checks.length);}}catch(e){report.checks.push({profile:name,name:title,pass:false,error:e.stack});console.log('FAIL '+title+': '+e.message);await shot('failure-'+report.checks.length);}};
 const pad=async button=>{await run(`if(!window.qaPad){window.qaPad={index:0,id:'QA standard pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[qaPad]});}qaPad.buttons[${button}]={pressed:true,value:1}`);await sleep(100);await run(`qaPad.buttons[${button}]={pressed:false,value:0}`);await sleep(100);};
 return {name,send,run,shot,click,key,focus,state,step,pad,waitLoaded,hold,mouse,enableQa};
}
async function main(){
 const fresh=await browser('fresh',null,null,true);const {run,send,step,click,key,focus,shot}=fresh;
 const practice=()=>run('CK.practice()');
 const visible=id=>run(`!document.getElementById(${JSON.stringify(id)}).hidden`);
 const saveSnapshot=()=>run(`Object.fromEntries(Object.keys(localStorage).filter(k=>!k.includes('onboarding')).map(k=>[k,localStorage.getItem(k)]))`);
 await step('Fresh profile receives optional setup with visible skip',async()=>({pass:await visible('firstLaunch')&&await run(`!!document.getElementById('onboardingJump')&&!document.getElementById('onboardingJump').disabled`),state:await fresh.state()}));
 await shot('offer-1600x1000');
 await send('Emulation.setDeviceMetricsOverride',{width:800,height:600,deviceScaleFactor:1,mobile:false});
 await step('First-launch setup fits 800x600 with scrolling and reachable choices',async()=>{const info=await run(`(()=>{const o=document.getElementById('firstLaunch');return{overflow:getComputedStyle(o).overflowY,rects:[...o.querySelectorAll('input,button')].map(e=>e.getBoundingClientRect().toJSON())}})()`);return{pass:info.rects.every(r=>r.left>=-1&&r.right<=801)&&['auto','scroll'].includes(info.overflow),info};});await shot('offer-800x600');
 await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 await step('Skip dismisses offer and persists through reload',async()=>{await click('#onboardingJump');const dismissed=!await visible('firstLaunch');await send('Page.reload');await fresh.waitLoaded();await sleep(250);return{pass:dismissed&&!await visible('firstLaunch'),storage:await saveSnapshot()};});
 await fresh.enableQa();
 await click('#tSettings');await click('#reportConsent');await key('Escape');
 const reportBeforePractice=await run('CK.productReport().events');
 await step('Isolated reporting is opted in before event-exclusion checks',async()=>({pass:reportBeforePractice.some(e=>e.name==='session_start'),events:reportBeforePractice}));
 await step('Optional practice reachable through How to Play',async()=>{await click('#tHowto');await click('#practiceStart');await sleep(500);return{pass:(await practice())?.stage==='move',practice:await practice()};});
 await step('Idle time alone never completes movement',async()=>{await sleep(1800);return{pass:(await practice())?.stage==='move',practice:await practice()};});
 async function stage(expected,action,label){await step(label,async()=>{const before=await practice();await action();return{pass:(await practice())?.stage===expected,before,after:await practice(),stats:await run('CK.G().stats')};});}
 await stage('swing',()=>fresh.hold('KeyD',420),'Real keyboard movement advances the movement lesson');
 await stage('guard',()=>fresh.hold('Space',200),'Real keyboard swing advances the swing lesson');
 await stage('dash',()=>fresh.hold('KeyE',450),'Actual held guard advances the guard lesson');
 await stage('ranged',()=>fresh.hold('ShiftLeft',140),'Actual dash advances the dash lesson');
 await step('Ranged waits for aim and genuine fire rather than timer',async()=>{await sleep(1600);return{pass:(await practice())?.stage==='ranged',practice:await practice()};});
 await stage('complete',async()=>{await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:950,y:280});await sleep(120);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:450,y:650});await sleep(120);await fresh.mouse('left',180);},'Changed mouse aim and real bow fire completes practice');
 await shot('completed-1600x1000');
 await step('Completed practice shows Retry and Leave',async()=>({pass:await visible('practiceResult')&&await run(`!document.getElementById('practiceRetry').disabled&&!document.getElementById('practiceLeave').disabled`),state:await fresh.state()}));
 await step('Completed genuine actions emit no normal-match product events',async()=>{const events=await run('CK.productReport().events');return{pass:JSON.stringify(events)===JSON.stringify(reportBeforePractice),events};});
 await step('Retry resets action evidence and idle does not advance',async()=>{await click('#practiceRetry');await sleep(1100);return{pass:(await practice())?.stage==='move',practice:await practice()};});
 await step('Pause freezes training and Escape resumes',async()=>{await key('Escape');const paused=await visible('pause');await fresh.hold('KeyD',350);const frozen=(await practice())?.stage==='move';await key('Escape');return{pass:paused&&frozen&&!await visible('pause'),practice:await practice()};});
 await step('Pause Retry returns to a fresh movement lesson',async()=>{await fresh.hold('KeyD',420);await key('Escape');await click('#practicePauseRetry');return{pass:(await practice())?.stage==='move'&&!await visible('pause'),practice:await practice()};});
 await step('Blur releases held gameplay inputs',async()=>{await fresh.hold('KeyE',80);await run(`dispatchEvent(new Event('blur'))`);return{pass:await run(`!Object.values(CK.keys).some(Boolean)`),keys:await run('CK.keys')};});
 await run("dispatchEvent(new Event('focus'))");
 // These are isolated state fixtures, not writes to the owner's game. Preserve
 // unusual normal cfg and couch ownership while traversing every leave phase.
 await run('CK.toMenu()');if(await visible('howto'))await key('Escape');
 const before=await saveSnapshot();
 for(const phase of ['move','swing','guard','dash','ranged']){
  await step('Leaving '+phase+' restores normal config and couch seats without rewards/events',async()=>{
   if(await visible('howto'))await key('Escape');
   await run(`Object.assign(CK.cfg,{mode:'flags',players:2,diff:'hard',map:'frost',arenaSize:'roomier'});CK.setSeats([{dev:'kb1',idx:0},{dev:'kb2',idx:1}])`);
   const cfg=await run('JSON.stringify(CK.cfg)'),seats=await run('JSON.stringify(CK.seats())'),events=await run('CK.productReport()?.events||[]');
   await click('#tHowto');await click('#practiceStart');await sleep(200);
   if(phase!=='move')await fresh.hold('KeyD',420);
   if(['guard','dash','ranged'].includes(phase))await fresh.hold('Space',180);
   if(['dash','ranged'].includes(phase))await fresh.hold('KeyE',400);
   if(phase==='ranged')await fresh.hold('ShiftLeft',140);
   const reached=await practice();await key('Escape');await click('#quitBtn');await sleep(180);
   const after={cfg:await run('JSON.stringify(CK.cfg)'),seats:await run('JSON.stringify(CK.seats())'),events:await run('CK.productReport()?.events||[]'),cup:await run('CK.cup()'),study:await run('CK.firstFight()'),practice:await practice(),saved:await saveSnapshot()};
   return{pass:reached?.stage===phase&&after.cfg===cfg&&after.seats===seats&&JSON.stringify(after.events)===JSON.stringify(events)&&after.cup===null&&after.study===null&&after.practice===null,reached,after};
  });
 }
 await step('Practice produced no progression or collection writes',async()=>{const after=await saveSnapshot();return{pass:['ck-progress','ck-collection','ck-played','ck-campaign-v1'].every(k=>before[k]===after[k]),before,after};});
 for(const [width,height] of [[1280,800],[800,600]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  if(await visible('howto'))await key('Escape');await click('#tHowto');await click('#practiceStart');await sleep(200);
  await step(`Practice controls fit ${width}x${height}`,async()=>{const rects=await run(`['practiceHud','practicePrompt'].map(id=>({id,rect:document.getElementById(id).getBoundingClientRect().toJSON()}))`);return{pass:rects.every(x=>x.rect.left>=-1&&x.rect.right<=width+1&&x.rect.top>=-1&&x.rect.bottom<=height+1),rects};});await shot(`practice-${width}x${height}`);await run('CK.toMenu()');
 }
 const existing={'ck-settings':{music:.21,sfx:.32,shake:.43,flash:false,whole:true},'ck-cfg':{mode:'flags',players:2,diff:'hard',map:'frost',arenaSize:'roomier'},'ck-played':7};
 const returning=await browser('returning',existing);
 await returning.step('Genuine existing profile bypasses setup without reset',async()=>({pass:await returning.run(`document.getElementById('firstLaunch').hidden&&CK.cfg.mode==='flags'&&CK.cfg.diff==='hard'&&CK.cfg.players===2&&JSON.parse(localStorage.getItem('ck-settings')).music===.21`),state:await returning.state()}));
 await returning.shot('returning-home');
 const setup=await browser('setup',null,null,true);
 await setup.step('Setup saves actual range and checkbox preferences',async()=>{
  const savedBefore=await setup.run(`localStorage.getItem('ck-settings')`);
  for(const selector of ['#onboardingMusic','#onboardingSfx','#onboardingShake']){await setup.focus(selector);await setup.key('ArrowRight');}
  await setup.click('#onboardingFlash');await setup.click('#onboardingJump');
  const saved=await setup.run(`JSON.parse(localStorage.getItem('ck-settings'))`);
  await setup.send('Page.reload');await setup.waitLoaded();await setup.click('#tSettings');
  const loaded=await setup.run(`({music:+document.getElementById('sMusic').value,sfx:+document.getElementById('sSfx').value,shake:+document.getElementById('sShake').value,flash:document.getElementById('cFlash').checked})`);await setup.key('Escape');
  return{pass:savedBefore===null&&saved.music===loaded.music/100&&saved.sfx===loaded.sfx/100&&saved.shake===loaded.shake/100&&saved.flash===!loaded.flash,saved,loaded};
 });
 await setup.enableQa();
 await setup.click('#tHowto');await setup.focus('#practiceStart');await setup.pad(0);await sleep(200);
 await setup.step('Synthetic standard pad moves real knight and advances movement',async()=>{
  await setup.run('qaPad.axes[0]=1');await sleep(430);await setup.run('qaPad.axes[0]=0');await sleep(100);return{pass:(await setup.run('CK.practice()'))?.stage==='swing',practice:await setup.run('CK.practice()')};
 });
 for(const [button,expected] of [[0,'guard'],[2,'dash'],[1,'ranged']])await setup.step('Synthetic standard pad action '+button+' advances to '+expected,async()=>{await setup.pad(button);return{pass:(await setup.run('CK.practice()'))?.stage===expected,practice:await setup.run('CK.practice()')};});
 await setup.step('Actual right-stick aim and pad shot complete ranged lesson',async()=>{await setup.run('qaPad.axes[2]=1');await sleep(180);await setup.run('qaPad.axes[2]=0;qaPad.axes[3]=1');await sleep(180);await setup.pad(0);return{pass:(await setup.run('CK.practice()'))?.completed===true,practice:await setup.run('CK.practice()')};});
 await setup.shot('pad-completed');await setup.click('#practiceLeave');
 await setup.step('Completed Leave returns focus to the How to Play practice trigger',async()=>({pass:await setup.run(`!document.getElementById('howto').hidden&&document.activeElement.id==='practiceStart'`),state:await setup.state()}));
 await setup.click('#practiceStart');await sleep(200);await setup.key('Escape');await setup.click('#quitBtn');if(await setup.run("!document.getElementById('howto').hidden"))await setup.key('Escape');
 await setup.click('#tHowto');await setup.focus('#practiceStart');
 await setup.step('Held entry Space never carries into swing after movement',async()=>{
  await setup.send('Input.dispatchKeyEvent',{type:'keyDown',code:'Space',key:' ',windowsVirtualKeyCode:32});await sleep(150);await setup.hold('KeyD',430);await sleep(300);
  const held=await setup.run('CK.practice()');await setup.send('Input.dispatchKeyEvent',{type:'keyUp',code:'Space',key:' ',windowsVirtualKeyCode:32});await sleep(120);
  return{pass:held?.stage==='swing',held};
 });
 await setup.run('CK.toMenu()');
 const denied=await browser('storage-denied',null,`if(location.protocol==='file:'){for(const m of ['getItem','setItem','removeItem'])Object.defineProperty(Storage.prototype,m,{configurable:true,value(){throw new DOMException('QA denied','SecurityError')}})}`);
 await denied.step('Storage denial keeps game navigable without compulsory setup',async()=>({pass:await denied.run(`document.getElementById('firstLaunch').hidden&&!document.getElementById('menu').hidden`),state:await denied.state()}));
 await denied.click('#tHowto');await denied.click('#practiceStart');await sleep(200);await denied.step('Practice works when storage is denied',async()=>({pass:(await denied.run('CK.practice()'))?.stage==='move',practice:await denied.run('CK.practice()')}));await denied.run('CK.toMenu()');
 const corrupt=await browser('storage-corrupt',null,`if(location.protocol==='file:')localStorage.setItem('ck-onboarding-v1','{bad-json')`);
 await corrupt.step('Corrupt onboarding record does not force reset or block menu',async()=>({pass:await corrupt.run(`!document.getElementById('menu').hidden&&document.getElementById('firstLaunch').hidden&&localStorage.getItem('ck-onboarding-v1')==='{bad-json'`),state:await corrupt.state()})); report.environment={platform:process.platform,arch:process.arch,node:process.version,browser:await run('navigator.userAgent')};
}
const watchdog=setTimeout(()=>{report.failure='240 second watchdog';finish();process.exit(1);},240000);
function finish(){report.finishedAt=new Date().toISOString();report.screenshots=Object.fromEntries(fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(OUT,f))).digest('hex')]));report.sourceHashesAfter=Object.fromEntries(sources.map(f=>[f,hash(f)]));report.stableSourceHashes=JSON.stringify(report.sourceHashes)===JSON.stringify(report.sourceHashesAfter);fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');sockets.forEach(ws=>ws.close());children.forEach(c=>c.kill());}
main().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(watchdog);finish();if(report.checks.some(c=>!c.pass))process.exitCode=1;});
