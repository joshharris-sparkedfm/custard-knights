'use strict';
// Isolated actual-Chrome QA. Synthetic pads exercise the normal browser boundary;
// this cannot establish physical-controller, human, network, or Steam acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_QA_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','online-recovery-2026-10-13'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={startedAt:new Date().toISOString(),runtime:{node:process.execPath,chrome:CHROME,root:ROOT},checks:[],consoleErrors:[],limitations:['Actual isolated Chrome with CDP mouse/keyboard and synthetic standard gamepad.','No physical controllers, human usability, household/WAN networking, packaged EXE, second Windows PC, or Steam testing.','Fixtures write only to temporary Chrome profiles; the user game and normal saves are untouched.']};
fs.mkdirSync(OUT,{recursive:true});
const children=[],sockets=[];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const sources=['index.html','game/online-recovery.js'];
report.sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(f)]));
async function browser(name,fixture,init,native=false){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-online-recovery-'+name+'-'));
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

// FakePeer is a fault boundary only. It deliberately keeps callbacks available
// after destroy, so cancellation correctness cannot depend on library cleanup.
const fakePeer=`window.qaPeers=[];window.Peer=class{constructor(id){this.id=id||'qa-guest';this.open=false;this.handlers={};qaPeers.push(this)}on(t,f){(this.handlers[t]||=[]).push(f);return this}emit(t,v){for(const f of this.handlers[t]||[])f(v)}destroy(){this.destroyed=true;this.open=false}connect(id){const c={peer:id,open:false,handlers:{},on(t,f){(this.handlers[t]||=[]).push(f);return this},emit(t,v){for(const f of this.handlers[t]||[])f(v)},send(v){(this.sent||=[]).push(v)},close(){this.closed=true;this.open=false}};this.conn=c;return c}}`;
async function wait(b,expr,label,ms=18000){const end=Date.now()+ms;while(Date.now()<end){if(await b.run(expr))return;await sleep(100);}throw Error(label+' timed out');}
async function online(b){await b.run('CK.toMenu()');await b.click('#tFriends');await b.click('#tOnline');}
const visibleFocus=`(()=>{const e=document.activeElement;return !!e&&e.getClientRects().length>0&&!e.disabled&&!e.closest('[hidden]')})()`;
const saved=`JSON.stringify({cfg:CK.cfg,seats:CK.seats(),kit:CK.loadProfile(1),settings:localStorage.getItem('ck-settings'),progress:localStorage.getItem('ck-progress'),collection:localStorage.getItem('ck-collection')})`;
async function main(){
 const b=await browser('faults',{'ck-played':7,'ck-settings':{music:.21,sfx:.32,shake:.43,flash:false,whole:true}});
 await b.run(`CK.freeze(true);Object.assign(CK.cfg,{mode:'flags',players:2,diff:'hard',map:'frost',arenaSize:'roomier'});CK.setSeats([{dev:'kb1',idx:0},{dev:'pad',idx:0}]);CK.saveProfile(1,{...CK.loadProfile(1),visor:'open'});${fakePeer}`);
 const before=await b.run(saved);
 await online(b);
 await b.step('Mouse opens Online and invalid code remains recoverable',async()=>{await b.focus('#codeIn');await b.key('Enter');return{pass:await b.run(`CK.NET.role===null&&!document.getElementById('online').hidden&&document.getElementById('menuMsg').textContent.includes('5')&&${visibleFocus}`),state:await b.state()};});
 await b.step('Hosting pending exposes status and Escape cancels',async()=>{await b.click('#hostBtn');const pending=await b.run(`CK.NET.role==='host'&&!!CK.NET.peer&&!CK.NET.peer.open`);await b.key('Escape');return{pass:pending&&await b.run(`CK.NET.role===null&&qaPeers[0].destroyed&&${visibleFocus}`),state:await b.state()};});
 await b.step('Cancelled host late callbacks cannot reopen or replace room',async()=>{await b.run(`qaPeers[0].open=true;qaPeers[0].emit('open','late');qaPeers[0].emit('error',{type:'unavailable-id'})`);await sleep(200);return{pass:await b.run(`CK.NET.role===null&&CK.NET.peer===null&&qaPeers.length===1`),state:await b.state()};});
 await online(b);
 await b.step('Keyboard starts a join and Back cancels pending peer',async()=>{await b.run(`document.getElementById('codeIn').value='ABCDE'`);await b.focus('#codeIn');await b.key('Enter');const pending=await b.run(`CK.NET.role==='client'`);await b.key('Escape');return{pass:pending&&await b.run(`CK.NET.role===null&&qaPeers.at(-1).destroyed&&${visibleFocus}`),state:await b.state()};});
 await b.step('Cancelled guest late open cannot create a connection',async()=>{await b.run(`{const p=qaPeers.at(-1);p.emit('open');p.emit('error',{type:'peer-unavailable'})}`);return{pass:await b.run(`CK.NET.role===null&&!qaPeers.at(-1).conn`),state:await b.state()};});
 for(const [type,pattern] of [['peer-unavailable','room'],['network','connection|online|problem'],['browser-incompatible','connection|online|problem']]){
  await online(b);
  await b.step('Injected '+type+' produces visible retryable recovery',async()=>{await b.run(`document.getElementById('codeIn').value='ABCDE'`);await b.click('#joinBtn');await b.run(`qaPeers.at(-1).emit('error',{type:${JSON.stringify(type)}})`);await sleep(150);const details=await b.run(`({role:CK.NET.role,msg:document.getElementById('menuMsg').textContent,status:document.getElementById('homeStatus').textContent,online:!document.getElementById('online').hidden,focus:${visibleFocus}})`);return{pass:details.role===null&&details.focus&&new RegExp(pattern,'i').test(details.msg+' '+details.status),details};});
 }
 await online(b);
 await b.step('Injected full response refuses admission without rewards',async()=>{await b.run(`document.getElementById('codeIn').value='ABCDE'`);await b.click('#joinBtn');await b.run(`{const p=qaPeers.at(-1);p.emit('open');p.conn.open=true;p.conn.emit('open');p.conn.emit('data',{t:'full',why:'That room is full.'})}`);await sleep(150);return{pass:await b.run(`CK.NET.role===null&&${visibleFocus}`)&&await b.run(saved)===before,state:await b.state()};});
 await online(b);
 await b.step('Synthetic pad activates Host then B cancels pending operation',async()=>{await b.focus('#hostBtn');await b.pad(0);const pending=await b.run(`CK.NET.role==='host'`);await b.pad(1);return{pass:pending&&await b.run(`CK.NET.role===null&&${visibleFocus}`),state:await b.state()};});
 await b.step('Recovery preserves remembered rules, seats, outfit and progression',async()=>({pass:await b.run(saved)===before,before,after:await b.run(saved)}));
 await b.shot('recovered-home');
 await online(b);
 await b.step('Script load is cancellable before Peer exists',async()=>{await b.run(`window.qaFakePeer=Peer;delete window.Peer;window.qaAppend=document.head.appendChild;document.head.appendChild=function(e){if(e.tagName==='SCRIPT'&&e.src.includes('peerjs')){window.qaScript=e;return e}return qaAppend.call(this,e)}`);await b.click('#hostBtn');const pending=await b.run(`!document.getElementById('lobby').hidden&&document.getElementById('lobbyLeave').textContent.includes('Cancel')`);await b.key('Escape');return{pass:pending&&await b.run(`CK.NET.role===null&&!document.getElementById('online').hidden&&${visibleFocus}`),state:await b.state()};});
 await b.step('Cancelled script late load does not create a room',async()=>{const n=await b.run('qaPeers.length');await b.run(`window.Peer=qaFakePeer;qaScript.onload();document.head.appendChild=qaAppend`);await sleep(200);return{pass:await b.run('qaPeers.length')===n&&await b.run('CK.NET.role===null'),state:await b.state()};});
 await online(b);
 await b.step('Injected host transport failure exposes Retry',async()=>{await b.click('#hostBtn');await b.run(`qaPeers.at(-1).emit('error',{type:'network'})`);return{pass:await b.run(`!document.getElementById('online').hidden&&!document.getElementById('onlineRetry').hidden&&${visibleFocus}`),state:await b.state()};});
 await b.step('Retry starts a fresh operation and old error cannot overwrite it',async()=>{await b.run('window.qaOldPeer=qaPeers.at(-1)');await b.click('#onlineRetry');const n=await b.run('qaPeers.length');await b.run(`qaOldPeer.emit('error',{type:'unavailable-id'});qaOldPeer.emit('open');qaPeers.at(-1).open=true;qaPeers.at(-1).emit('open')`);return{pass:await b.run(`CK.NET.role==='host'&&CK.NET.peer===qaPeers.at(-1)&&CK.NET.peer!==qaOldPeer&&qaPeers.length===${n}`),state:await b.state()};});
 await b.key('Escape');
 await online(b);
 await b.step('Pending host cannot start, configure, copy or claim an open room',async()=>{await b.click('#hostBtn');return{pass:await b.run(`CK.NET.pending&&document.getElementById('lobbyStart').disabled&&document.getElementById('lobbyCup').disabled&&document.getElementById('lobbySetupBtn').disabled&&document.getElementById('lobbyCopy').hidden&&document.getElementById('lobbyCode').textContent==='…'`),state:await b.state()};});
 await b.step('Pending Cancel remains focusable and visible at 800x600',async()=>{await b.send('Emulation.setDeviceMetricsOverride',{width:800,height:600,deviceScaleFactor:1,mobile:false});await b.focus('#lobbyLeave');await b.run(`document.getElementById('lobbyLeave').scrollIntoView({block:'nearest'})`);const r=await b.run(`document.getElementById('lobbyLeave').getBoundingClientRect().toJSON()`);await b.shot('pending-800x600');await b.send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});return{pass:r.left>=0&&r.right<=800&&r.top>=0&&r.bottom<=600,rect:r};});
 await b.step('Actual admission deadline recovers a silent injected peer',async()=>{await wait(b,`CK.NET.role===null&&!document.getElementById('online').hidden`,'15-second admission deadline',18000);return{pass:await b.run(`document.getElementById('menuMsg').textContent.includes('15 seconds')&&!document.getElementById('onlineRetry').hidden&&${visibleFocus}`),state:await b.state()};});
 const scriptFault=await browser('script-fault',{'ck-played':7});await online(scriptFault);
 await scriptFault.step('Injected script error produces visible local-play and retry recovery',async()=>{await scriptFault.run(`window.qaAppend=document.head.appendChild;document.head.appendChild=function(e){if(e.tagName==='SCRIPT'&&e.src.includes('peerjs')){window.qaScript=e;return e}return qaAppend.call(this,e)}`);await scriptFault.click('#hostBtn');await scriptFault.run(`qaScript.onerror();document.head.appendChild=qaAppend`);await sleep(150);return{pass:await scriptFault.run(`CK.NET.role===null&&!document.getElementById('online').hidden&&document.getElementById('menuMsg').textContent.includes('load online')&&${visibleFocus}`),state:await scriptFault.state()};});
 await b.step('Affected offline pause still freezes arena and Resume restores play',async()=>{await b.run(`CK.toMenu();CK.freeze(false);CK.start()`);await b.click('#pauseBtn');const time=await b.run('CK.G().time');await sleep(250);const frozen=await b.run('CK.G().time')===time;await b.click('#resumeBtn');await sleep(180);return{pass:frozen&&await b.run(`!CK.NET.menuOpen&&document.getElementById('pause').hidden&&CK.G().time<${time}`),state:await b.state()};});
 await b.run('CK.toMenu()');
 await b.step('Affected practice pause Resume and Leave restore menu without rewards',async()=>{const prior=await b.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`);await b.click('#tHowto');await b.click('#practiceStart');await b.key('Escape');const paused=await b.run(`!document.getElementById('pause').hidden&&CK.practice().stage==='move'`);await b.click('#resumeBtn');const resumed=await b.run(`document.getElementById('pause').hidden&&CK.practice().stage==='move'`);await b.key('Escape');await b.click('#quitBtn');return{pass:paused&&resumed&&await b.run(`CK.practice()===null&&CK.G().demo&&${visibleFocus}`)&&await b.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`)===prior,state:await b.state()};});
 // The next block loads the actual bundled PeerJS; no FakePeer is installed.
 const host=await browser('real-host',{'ck-played':7}),guest=await browser('real-guest',{'ck-played':7});
 await host.run(`CK.freeze(false);Object.assign(CK.cfg,{players:1,mode:'ffa',map:'courtyard',arenaSize:'classic',chaosSpeed:'simple'});document.getElementById('nameIn').value='Host'`);
 await guest.run(`CK.freeze(false);document.getElementById('nameIn').value='Guest'`);
 await online(host);await host.click('#hostBtn');
 await host.step('Actual PeerJS signaling opens same-host room',async()=>{await wait(host,'CK.NET.peer?.open','PeerJS signaling',22000);return{pass:true,code:await host.run('CK.NET.code')};});
 if(!await host.run('CK.NET.peer?.open')){report.realPeerJS='blocked: signaling did not open';return;}
 const code=await host.run('CK.NET.code');
 async function join(){await online(guest);await guest.run(`document.getElementById('codeIn').value=${JSON.stringify(code)}`);await guest.click('#joinBtn');await wait(guest,'CK.NET.conn?.open&&CK.NET.players.length===2','actual guest admission');}
 await guest.step('Mouse join establishes real PeerJS DataConnection',async()=>{await join();return{pass:await host.run('CK.NET.players.length===2&&CK.NET.conns.size===1'),state:await guest.state()};});
 if(!await guest.run('CK.NET.conn?.open')){report.realPeerJS='blocked: guest not admitted';return;}
 report.realPeerJS='same-host actual bundled PeerJS';
 const late=await browser('real-rejected',{'ck-played':7});
 await host.run('CK.cfg.players=7');await online(late);await late.run(`document.getElementById('codeIn').value=${JSON.stringify(code)}`);await late.click('#joinBtn');
 await late.step('Real full room refuses ninth knight with visible recovery',async()=>{await wait(late,`CK.NET.role===null&&document.getElementById('menuMsg').textContent.includes('full')`,'real full-room refusal');return{pass:await late.run(`!document.getElementById('online').hidden&&CK.PROG.matches===0&&${visibleFocus}`)&&await host.run('CK.NET.players.length===2'),state:await late.state()};});
 await late.step('Real missing room produces recoverable unavailable response',async()=>{await online(late);await late.run(`document.getElementById('codeIn').value='Q9Z7X'`);await late.click('#joinBtn');await wait(late,`CK.NET.role===null&&document.getElementById('menuMsg').textContent.includes('no room')`,'missing room');return{pass:await late.run(`!document.getElementById('online').hidden&&document.getElementById('codeIn').value==='Q9Z7X'&&${visibleFocus}`),state:await late.state()};});
 await host.run('CK.cfg.players=1');
 await guest.run(`CK.leaveOnline();window.qaConnect=Peer.prototype.connect;Peer.prototype.connect=function(...args){const c=qaConnect.apply(this,args),send=c.send;c.send=function(d){return send.call(this,d?.t==='hello'?{...d,arenaSizeVersion:0}:d)};return c}`);await wait(host,'CK.NET.players.length===1','legacy rejoin departure');await join();
 await host.step('Legacy hello over real transport blocks Roomier with an actionable message',async()=>{await host.run(`CK.cfg.arenaSize='roomier'`);await host.click('#lobbyStart');return{pass:await host.run(`CK.G().demo&&!document.getElementById('lobby').hidden&&document.getElementById('lobbyMsg').textContent.includes('current build')&&${visibleFocus}`),state:await host.state()};});
 await host.run(`CK.cfg.arenaSize='classic'`);
 await guest.step('Visible guest mouse Menu keeps simulation live and releases input',async()=>{await host.click('#lobbyStart');await wait(guest,'!CK.G().demo','menu match');const liveBefore=await host.run('CK.G().time');await guest.click('#pauseBtn');const opened=await guest.run(`!document.getElementById('pause').hidden&&document.getElementById('pauseTitle').textContent==='Match menu'&&CK.NET.menuOpen`);await guest.hold('KeyD',180);const neutral=await guest.run('CK.humanInput(1).mx===0');await guest.key('Escape');return{pass:opened&&neutral&&(await host.run('CK.G().time'))<liveBefore&&await guest.run(`document.getElementById('pause').hidden&&!CK.NET.menuOpen`),state:await guest.state()};});
 await guest.step('Synthetic standard pad Start opens online menu and A resumes',async()=>{await guest.pad(9);const opened=await guest.run(`CK.NET.menuOpen&&!document.getElementById('pause').hidden`);await guest.focus('#resumeBtn');await guest.pad(0);return{pass:opened&&await guest.run(`!CK.NET.menuOpen&&document.getElementById('pause').hidden`),state:await guest.state()};});
 await host.run('CK.toMenu()');await wait(guest,'!document.getElementById("lobby").hidden','return lobby');
 await host.step('Visible host mouse Menu suppresses both keyboard seats and next start restores input',async()=>{await host.run(`CK.cfg.players=2;CK.setSeats([{dev:'kb1',idx:0},{dev:'kb2',idx:1}])`);await host.click('#lobbyStart');await host.click('#pauseBtn');const opened=await host.run(`CK.NET.menuOpen&&!document.getElementById('pause').hidden`);await host.send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyD',key:'d',windowsVirtualKeyCode:68});await host.send('Input.dispatchKeyEvent',{type:'keyDown',code:'ArrowRight',key:'ArrowRight',windowsVirtualKeyCode:39});await sleep(100);const neutral=await host.run('CK.humanInput(1).mx===0&&CK.humanInput(2).mx===0');await host.send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyD',key:'d',windowsVirtualKeyCode:68});await host.send('Input.dispatchKeyEvent',{type:'keyUp',code:'ArrowRight',key:'ArrowRight',windowsVirtualKeyCode:39});await host.run('CK.toMenu()');await host.click('#lobbyStart');await host.send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyD',key:'d',windowsVirtualKeyCode:68});await sleep(100);const input=await host.run('CK.humanInput(1)');await host.send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyD',key:'d',windowsVirtualKeyCode:68});return{pass:opened&&neutral&&input.mx>0&&await host.run(`!CK.NET.menuOpen&&!CK.G().demo&&CK.seats()?.length===2`),input,state:await host.state()};});
 await guest.step('Natural authoritative results while Options is open restores usable results focus',async()=>{await wait(guest,'!CK.G().demo&&!CK.G().over','transition round');await guest.key('Escape');await guest.click('#matchOptions');await host.run('CK.G().time=.1');await wait(guest,'CK.G().over','results during options');return{pass:await guest.run(`!CK.NET.menuOpen&&document.getElementById('settings').hidden&&!document.getElementById('end').hidden&&${visibleFocus}`),state:await guest.state()};});
 await host.run('CK.toMenu()');await wait(guest,'!document.getElementById("lobby").hidden','lobby after transitions');
 for(const phase of ['match','results','cup']){
  if(phase!=='match'){await online(host);await host.click('#hostBtn');await wait(host,'CK.NET.peer?.open','rehost');const next=await host.run('CK.NET.code');await online(guest);await guest.run(`document.getElementById('codeIn').value=${JSON.stringify(next)}`);await guest.click('#joinBtn');await wait(guest,'CK.NET.conn?.open&&CK.NET.players.length===2','rejoin');}
  const prior=await guest.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`);
  const hostRules=await host.run('JSON.stringify(CK.cfg)');
  if(phase==='cup')await host.click('#lobbyCup');else await host.click('#lobbyStart');
  await wait(guest,'!CK.G().demo&&!CK.G().over','actual match start');
  if(phase==='results'){await host.run('CK.endMatch()');await wait(guest,'CK.G().over','authoritative results');}
  const earned=await guest.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`);
  const hostEarned=await host.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`);
  await guest.step('Real host departure from '+phase+' returns usable menu without invented reward',async()=>{await host.run('CK.leaveOnline()');await wait(guest,'CK.NET.role===null','host departure');return{pass:await guest.run(`CK.G().demo&&CK.cup()===null&&${visibleFocus}`)&&await guest.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`)===earned&&(phase==='results'||prior===earned)&&await host.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`)===hostEarned&&await host.run('JSON.stringify(CK.cfg)')===hostRules,state:await guest.state(),before:prior,after:earned,hostRules,hostRulesAfter:await host.run('JSON.stringify(CK.cfg)')};});
  await guest.shot('host-loss-'+phase);
 }
 await online(host);await host.click('#hostBtn');await wait(host,'CK.NET.peer?.open','snapshot fault rehost');const silenceCode=await host.run('CK.NET.code');await online(guest);await guest.run(`document.getElementById('codeIn').value=${JSON.stringify(silenceCode)}`);await guest.click('#joinBtn');await wait(guest,'CK.NET.conn?.open&&CK.NET.players.length===2','snapshot fault join');
 await host.step('Real controlled signaling disconnect retains admitted DataConnection and lobby Start',async()=>{await host.run('CK.NET.peer.disconnect()');await wait(host,'CK.NET.peer.disconnected','controlled signaling disconnect');await sleep(150);return{pass:await host.run(`CK.NET.role==='host'&&!document.getElementById('lobbyStart').disabled&&document.getElementById('lobbyCopy').hidden&&[...CK.NET.conns.values()][0].open`)&&await guest.run(`CK.NET.role==='client'&&CK.NET.conn.open`),state:await host.state()};});
 await host.click('#lobbyStart');await wait(guest,'!CK.G().demo&&!CK.G().over','snapshot fault match');
 const silenceEarned=await guest.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`);
 await host.run(`for(const c of CK.NET.conns.values()){const send=c.send;c.send=function(d){if(d?.t!=='s')return send.call(this,d)}}`);
 await guest.step('Injected hidden-page boundary resets snapshot recovery allowance on return',async()=>{await guest.run(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);await sleep(8000);await guest.run(`Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));dispatchEvent(new Event('focus'))`);await sleep(8000);return{pass:await guest.run(`CK.NET.role==='client'&&!CK.G().demo&&!CK.G().over`),state:await guest.state()};});
 await guest.step('Injected snapshot silence on live DataConnection ends interrupted match without award',async()=>{await wait(guest,'CK.NET.role===null','15-second snapshot deadline',10000);return{pass:await guest.run(`CK.G().demo&&CK.cup()===null&&document.getElementById('menuMsg').textContent.includes('interrupted')&&${visibleFocus}`)&&await guest.run(`JSON.stringify({progress:CK.PROG,collection:CK.collection()})`)===silenceEarned,state:await guest.state()};});
}
const watchdog=setTimeout(()=>{report.failure='240 second watchdog';finish();process.exit(1)},240000);
function finish(){report.finishedAt=new Date().toISOString();report.finalSourceHashes=Object.fromEntries(sources.map(f=>[f,hash(f)]));report.sourceStable=JSON.stringify(report.sourceHashes)===JSON.stringify(report.finalSourceHashes);report.passed=report.checks.filter(x=>x.pass).length;report.failed=report.checks.filter(x=>!x.pass).length;fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');for(const ws of sockets)ws.close();for(const child of children)child.kill();}
main().catch(e=>{report.failure=e.stack;console.error(e.stack)}).finally(()=>{clearTimeout(watchdog);finish();process.exitCode=report.failure||report.failed||report.consoleErrors.length||!report.sourceStable?1:0});








