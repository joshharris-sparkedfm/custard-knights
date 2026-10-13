'use strict';
// Focused real-browser ranged-input checks. Synthetic devices exercise the game's
// normal event and polling paths; this is not physical-device or human acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_QA_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','ranged-aim-2026-10-13'));
const PROFILE=fs.mkdtempSync(path.join(os.tmpdir(),'ck-ranged-aim-'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const NODE=process.execPath;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const files=['index.html','game/input-aim.js','game/mass-battle-ui.js','game/mass-battle.js'];
const report={startedAt:new Date().toISOString(),runtime:{node:NODE,chrome:CHROME,root:ROOT},sourceHashes:Object.fromEntries(files.map(f=>[f,hash(f)])),checks:[],limitations:['Synthetic mouse, keyboard, and standard gamepad routed through the actual browser input handlers and game loop.','Physical controller/device ergonomics and human acceptance were not performed.','Online owned/guest aim was not exercised unless the optional bounded local fixture is available.'],onlineGuest:'not-run'};
fs.mkdirSync(OUT,{recursive:true});
const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+PROFILE,'--window-size=1600,1000','--force-device-scale-factor=1','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
let ws,port;
const finish=()=>{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');ws?.close();chrome.kill();};
const watchdog=setTimeout(()=>{report.failure='120 second watchdog';finish();process.exit(1);},120000);
async function main(){
 for(let i=0;i<150;i++){try{port=+fs.readFileSync(path.join(PROFILE,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}
 if(!port)throw Error('Chrome did not start');
 const target=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 ws=new WebSocket(target.webSocketDebuggerUrl);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method));},20000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass,details)=>{report.checks.push({name,pass:!!pass,...(details===undefined?{}:{details})});console.log((pass?'PASS ':'FAIL ')+name);if(!pass)throw Error(name);};
 const step=async(name,fn)=>{try{const value=await fn(),pass=value&&typeof value==='object'&&Object.hasOwn(value,'pass')?!!value.pass:!!value;report.checks.push({name,pass,...(value===true?{}:{details:value})});console.log((pass?'PASS ':'FAIL ')+name);if(!pass)process.exitCode=1;}catch(e){report.checks.push({name,pass:false,error:String(e)});console.error('FAIL '+name+': '+e.message);process.exitCode=1;}};
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 const url=require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href;
 await send('Page.navigate',{url:url+'?qa=1'});
 let loaded=false;for(let i=0;i<150;i++){if(await run('!!window.CK&&!!CK.arenaGeometry')){loaded=true;break;}await sleep(100);}
 check('Actual game loads in isolated browser profile',loaded);
 await run('CK.sprLoadAll()');
 // Install a controlled standard pad only at navigator's device boundary. The
 // normal poller, seat lookup, input policy and simulation continue to run.
 await run(`window.qaPad={index:0,id:'QA standard pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[qaPad]});`);
 await run(`CK.toMenu();Object.assign(CK.cfg,{players:1,mode:'ffa',map:'courtyard',arenaSize:'roomier',chaosSpeed:'simple'});CK.start();CK.freeze(false);`);
 await sleep(2300);
 const key=async(code,down=true)=>send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code==='ArrowRight'?'ArrowRight':code,windowsVirtualKeyCode:code.startsWith('Key')?code.charCodeAt(3):undefined});
 const geom=()=>run('CK.arenaGeometry()');
 const screenPoint=async(fx,fy)=>{const g=await geom(),r=await run('document.getElementById("game").getBoundingClientRect().toJSON()'),s=await run('document.getElementById("stage").getBoundingClientRect().toJSON()'),x=r.left+r.width*fx,y=r.top+r.height*fy;let wx,wy;if(g.camera?.on){const z=.8,cx=Math.max(s.width/(2*z),Math.min(g.W-s.width/(2*z),g.camera.x)),cy=Math.max(s.height/(2*z),Math.min(g.H-s.height/(2*z),g.camera.y));wx=(x-s.left-(s.width/2-cx*z))/z;wy=(y-s.top-(s.height/2-cy*z))/z;}else{wx=(x-s.left-g.worldFit.x)/g.worldFit.scale;wy=(y-s.top-g.worldFit.y)/g.worldFit.scale;}const p=await run('(()=>{const e=CK.G().ents.filter(e=>e.human&&!e.netId)[0];return{x:e.x,y:e.y}})()'),hit=await run(`(()=>{const e=document.elementFromPoint(${x},${y});return{id:e?.id||'',tag:e?.tagName||'',className:String(e?.className||'')}})()`);return{x,y,expected:Math.atan2(wy-p.y,wx-p.x),size:g.size,width:r.width,inside:x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom,hit};};
 await run(`window.qaPointerTrace=[];document.addEventListener('pointermove',e=>{qaPointerTrace.push({target:e.target.id||e.target.tagName,pointerType:e.pointerType,x:e.clientX,y:e.clientY});if(qaPointerTrace.length>30)qaPointerTrace.shift();},true)`);
 const movePointer=async(x,y)=>send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none',buttons:0});
 const pointerButton=async(x,y,button,down)=>send('Input.dispatchMouseEvent',{type:down?'mousePressed':'mouseReleased',x,y,button,buttons:down?(button==='left'?1:2):0,clickCount:1});
 const player=(n=0)=>run(`CK.G().ents.filter(e=>e.human&&!e.netId)[${n}]`);
 const shotAngle=()=>run(`(()=>{const p=CK.G().proj.filter(q=>q.owner===CK.G().ents[0]).at(-1);return p?Math.atan2(p.vy,p.vx):null})()`);
 await step('Keyboard movement and pointer aim are independent',async()=>{
  const target=await screenPoint(.70,.54);await movePointer(target.x,target.y);await key('KeyD');await sleep(80);
  const state=await run('CK.humanInput(1,CK.G().ents[0])');await key('KeyD',false);
  return {pass:target.inside&&state.mx>0&&state.faceTo!==null&&Math.abs(state.faceTo-target.expected)<.15,state,expected:target.expected,target,trace:await run('qaPointerTrace.slice(-4)')};
 });
 await step('Roomier scaled canvas pointer coordinates fire toward the selected world point',async()=>{
  await run('CK.giveWeapon(CK.G().ents[0],"bow");CK.G().ents[0].fireCd=0');const target=await screenPoint(.68,.55);await movePointer(target.x,target.y);await pointerButton(target.x,target.y,'left',true);const capture=await run(`(async()=>{for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,10));const q=CK.G().proj.filter(q=>q.owner===CK.G().ents[0]).at(-1);if(q)return{angle:Math.atan2(q.vy,q.vx),x:q.x,y:q.y,tick:i,projectile:true}}return{angle:null,projectile:false}})()`);const held=await run('CK.humanInput(1,CK.G().ents[0])');await pointerButton(target.x,target.y,'left',false);
  const actual=await run('CK.inputAim(CK.G().ents[0])'),observed={angle:capture.angle,projectileCapture:capture,expected:target.expected,aim:actual,face:await run('CK.G().ents[0].face'),held,weapon:await run('CK.G().ents[0].wpn'),fireCd:await run('CK.G().ents[0].fireCd'),protect:await run('CK.G().ents[0].protect'),size:target.size,width:target.width,projectiles:await run('CK.G().proj.filter(q=>q.owner===CK.G().ents[0]).length'),targetInside:target.inside,targetHit:target.hit,trace:await run('qaPointerTrace.slice(-4)')};
  const a=capture.angle;return {pass:a!==null&&Math.abs(Math.atan2(Math.sin(a-target.expected),Math.cos(a-target.expected)))<.18&&target.size==='roomier'&&target.width>1200,...observed};
 });
 await step('Mouse ownership persists while the pointer remains parked',async()=>{const before=await run('CK.inputAim(CK.G().ents[0])'),traceBefore=await run('qaPointerTrace.at(-1)');await sleep(220);const after=await run('CK.inputAim(CK.G().ents[0])'),traceAfter=await run('qaPointerTrace.at(-1)');return {pass:before?.source==='mouse'&&after?.source==='mouse'&&traceBefore?.x===traceAfter?.x&&traceBefore?.y===traceAfter?.y,before,after,traceBefore,traceAfter};});
 await step('Arena radial deadzone preserves a diagonal right-stick aim while left stick moves',async()=>{
  await run('qaPad.axes=[-.7,0,.2,.22];CK.setSeats(null)');await sleep(100);const state=await run('CK.humanInput(1,CK.G().ents[0])');return state.mx<-.5&&state.faceTo!==null&&Math.abs(state.faceTo-Math.atan2(.22,.2))<.18;
 });
 await step('Arena pad aim cue resolves to a rendered world point',async()=>{const cue=await run('CK.arenaAimCue(CK.G().ents[0])');report.arenaPadCue=cue;return !!cue&&cue.source==='pad'&&Number.isFinite(cue.x)&&Number.isFinite(cue.y)&&cue.distance>0&&cue.distance<=110;});
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFileSync(path.join(OUT,'arena-pad-aim.png'),Buffer.from(r.data,'base64')));
 await step('Neutral right stick retains aim without jitter',async()=>{const before=await run('CK.humanInput(1,CK.G().ents[0]).faceTo');await run('qaPad.axes=[0,0,0,0]');await sleep(100);const after=await run('CK.humanInput(1,CK.G().ents[0]).faceTo');return before!==null&&after!==null&&Math.abs(before-after)<.01;});
 await step('Keyboard-only movement takes facing while right stick is neutral',async()=>{await key('KeyW');await sleep(70);const state=await run('CK.humanInput(1,CK.G().ents[0])');await key('KeyW',false);return state.my<0&&state.faceTo===null;});
 await step('Parked mouse aim cannot override a later pad aim',async()=>{
  const target=await screenPoint(.66,.54);await movePointer(target.x,target.y);await sleep(50);const mouse=await run('CK.humanInput(1,CK.G().ents[0])');
  await run('qaPad.axes=[0,0,-.8,.1]');await sleep(100);const pad=await run('CK.humanInput(1,CK.G().ents[0])');
  return {pass:mouse.faceTo!==null&&pad.faceTo!==null&&Math.abs(pad.faceTo-Math.atan2(.1,-.8))<.18,mouse:mouse.faceTo,pad:pad.faceTo,expected:Math.atan2(.1,-.8)};
 });
 await step('Pointer aim and attack follow the kb1 couch seat',async()=>{
  await run('CK.toMenu();CK.cfg.players=2;CK.setSeats([{dev:"pad",idx:0},{dev:"kb1"}]);qaPad.axes=[0,0,1,0];CK.start();CK.freeze(false)');await sleep(2300);const target=await screenPoint(.68,.54);await movePointer(target.x,target.y);await pointerButton(target.x,target.y,'left',true);await sleep(80);const state=await run('CK.humanInput(2,CK.G().ents[1])');await pointerButton(target.x,target.y,'left',false);return state.atk&&state.faceTo!==null&&target.inside;
 });
 await step('Pointer does not steal the pad-owned couch seat',async()=>{const state=await run('CK.humanInput(1,CK.G().ents[0])');return state.faceTo!==null&&Math.abs(state.faceTo)<.2&&!state.atk;});
 await step('Classic late-connect pads retain distinct actual-index ownership',async()=>{
  await run(`CK.toMenu();CK.cfg.players=2;CK.setSeats(null);window.qaPad0={index:0,id:'QA pad 0',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};window.qaPad1={index:1,id:'QA pad 1',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};window.qaPads=[null,qaPad1];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>qaPads});CK.start();CK.freeze(false)`);await sleep(2300);
  const before=await run('CK.humanInput(1,CK.G().ents[0]);CK.humanInput(2,CK.G().ents[1]);CK.inputAim(CK.G().ents[0])');
  await run('qaPads=[qaPad0,qaPad1];CK.pollPads()');await sleep(80);
  await run('qaPad1.buttons[0]={pressed:true,value:1};qaPad0.buttons[0]={pressed:false,value:0};CK.pollPads()');await sleep(50);const p1from1=await run('CK.humanInput(1,CK.G().ents[0]).atk'),p2from1=await run('CK.humanInput(2,CK.G().ents[1]).atk');
  await run('qaPad1.buttons[0]={pressed:false,value:0};qaPad0.buttons[0]={pressed:true,value:1};CK.pollPads()');await sleep(50);const p1from0=await run('CK.humanInput(1,CK.G().ents[0]).atk'),p2from0=await run('CK.humanInput(2,CK.G().ents[1]).atk');
  await run('qaPad0.buttons[0]={pressed:false,value:0};qaPad1.buttons[0]={pressed:false,value:0};qaPads=[qaPad];CK.pollPads()');
  return {pass:p1from1&&!p2from1&&!p1from0&&p2from0,before,p1from1,p2from1,p1from0,p2from0,scenario:'one actual pad at index 1, then late index 0 joins; each button affects only its distinct owner'};
 });
 await step('Pause and blur clear held pointer actions',async()=>{const t=await screenPoint(.68,.55);await pointerButton(t.x,t.y,'right',true);await run('CK.setPause(true);CK.setPause(false)');await run('dispatchEvent(new Event("blur"))');const state=await run('CK.humanInput(1,CK.G().ents[0])');await run('dispatchEvent(new Event("focus"))');return !state.atk&&!state.block;});
 // Faction Front: normal keyboard/pointer listeners and actual frame loop. The
 // optional qa read hook reports the input selected by that same live handler.
 await step('Faction starts a real local practice battle',async()=>{await run('CK.toMenu();CK.massBattle().qa.startPractice({mode:"brawl",teamSize:4,role:"ranger"})');await sleep(350);return await run('!!CK.massBattle().snapshot()&&CK.massBattle().snapshot().players.some(p=>!p.bot)');});
 await step('Faction mouse cursor targets through the live camera transform',async()=>{
  const rect=await run('document.querySelector(".ck-battle-canvas").getBoundingClientRect().toJSON()'),sx=rect.x+rect.width*.72,sy=rect.y+rect.height*.44;
  await movePointer(sx,sy);await sleep(100);const after=await run('CK.massBattle().qa.readInput()'),cue=await run('CK.massBattle().qa.aimCue()'),state=await run('CK.massBattle().qa.aimState()');
  const projected={x:state.width/2+(cue.x-state.camera.x)*state.zoom+rect.x,y:state.height/2+(cue.y-state.camera.y)*state.zoom+rect.y};
  report.factionMouseCue={input:{aimX:after.aimX,aimY:after.aimY},cue,state,expectedScreen:{x:sx,y:sy},projected};
  return after.aimX>.8&&cue.source==='mouse'&&Math.hypot(projected.x-sx,projected.y-sy)<8;
 });
 await step('Faction mouse aim cue is visible and maps to the cursor',async()=>{const cue=await run('CK.massBattle().qa.aimCue()');return !!cue&&cue.source==='mouse';});
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFileSync(path.join(OUT,'faction-mouse-aim.png'),Buffer.from(r.data,'base64')));
 await step('Faction radial right-stick aim supersedes the parked mouse',async()=>{await run('qaPad.axes=[0,0,.2,.22]');await sleep(100);const input=await run('CK.massBattle().qa.readInput()'),state=await run('CK.massBattle().qa.aimState()'),cue=await run('CK.massBattle().qa.aimCue()');report.factionPadAim={input,state,cue};return state.source==='pad'&&Math.abs(Math.atan2(state.y,state.x)-Math.atan2(.22,.2))<.18&&cue?.source==='pad';});
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFileSync(path.join(OUT,'faction-pad-aim.png'),Buffer.from(r.data,'base64')));
 await step('Faction neutral stick retains pad aim',async()=>{const before=await run('CK.massBattle().qa.aimState()');await run('qaPad.axes=[0,0,0,0]');await sleep(100);const after=await run('CK.massBattle().qa.aimState()');return before.source==='pad'&&after.source==='pad'&&Math.hypot(before.x-after.x,before.y-after.y)<.01;});
 await step('Faction keyboard movement takes facing when pad stick is neutral',async()=>{await key('KeyA');await sleep(120);const input=await run('CK.massBattle().qa.readInput()'),state=await run('CK.massBattle().qa.aimState()');await key('KeyA',false);return input.moveX<0&&state.source==='move'&&Math.hypot(input.aimX+1,input.aimY)<.15;});
 await step('Faction modal entry clears held mouse attack and guard',async()=>{const r=await run('document.querySelector(".ck-battle-canvas").getBoundingClientRect().toJSON()');await pointerButton(r.x+r.width/2,r.y+r.height/2,'right',true);await key('Escape');await sleep(80);const input=await run('CK.massBattle().qa.readInput()');return !input.attack&&!input.guard;});
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFileSync(path.join(OUT,'final-state.png'),Buffer.from(r.data,'base64')));
 report.environment={platform:process.platform,arch:process.arch,node:process.version,browser:await run('navigator.userAgent'),viewport:await run('({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})')};
 report.sourceHashesAfter=Object.fromEntries(files.map(f=>[f,hash(f)]));
 report.onlineGuest='not-run: no owned-guest local network fixture was available in this bounded browser review';
 if(report.checks.some(c=>!c.pass))process.exitCode=1;
}
main().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(watchdog);finish();});
