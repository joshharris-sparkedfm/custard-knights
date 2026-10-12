// Actual PeerJS transport + CDP mouse/keyboard input in two isolated profiles.
// Browser/transport helpers follow qa/rare-network.cjs. No runtime source edits.
// Usage: node qa/arena-size-network.cjs [output-directory]
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','arena-size-network'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],checks=[],errors=[];
const hashes=()=>Object.fromEntries(['index.html'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')]));
const report={scope:'Two real PeerJS peers on one machine/network, isolated browser profiles. Real joins, setup packets, keyboard input, authoritative collision, snapshots and rematches. Not cross-network NAT or human playtesting.',checks,errors};
fs.mkdirSync(OUT,{recursive:true});
function check(ok,name,detail){checks.push({name,pass:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);console.log('PASS: '+name);}
async function browser(name){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-arena-network-'));
 const child=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
 const b={name,child,profile};browsers.push(b);let port;
 for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}
 if(!port)throw Error(name+' Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 const ws=new WebSocket(tab.webSocketDebuggerUrl);b.ws=ws;let id=0;const pending=new Map();
 b.send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(name+' '+method+' timed out'));},30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push({name,details:d.params.exceptionDetails});};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 b.run=async expression=>{const r=await b.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(name+': '+JSON.stringify(r.exceptionDetails));return r.result.value;};
 b.wait=async(expression,label)=>{for(let i=0;i<160;i++){if(await b.run(expression))return;await sleep(100);}throw Error(name+': '+label);};
 b.key=(type,key,code,n)=>b.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n});
 b.mouse=async(type,x,y,button='none')=>{const p=await b.run(`(()=>{CK.zoom(1,640,400);const r=document.getElementById('game').getBoundingClientRect(),s=document.getElementById('stage').getBoundingClientRect();return {x:r.left+s.width/2+${x}-640,y:r.top+s.height/2+${y}-400};})()`);return b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,buttons:type==='mousePressed'?(button==='right'?2:1):0,clickCount:type==='mouseMoved'?0:1});};
 await b.send('Runtime.enable');await b.send('Page.enable');
 await b.send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href+'?qa=1'});
 await b.wait('!!window.CK','game load');
 await b.run(`document.getElementById('nameIn').value=${JSON.stringify(name)};CK.freeze(false);0`);return b;
}
const timer=setTimeout(()=>{report.failure=report.failure||'Network acceptance timed out';for(const b of browsers)b.child.kill();process.exitCode=1;},180000);
(async()=>{
 report.sourceHashes=hashes();
 const host=await browser('ArenaHost'),guest=await browser('ArenaGuest');
 await host.run(`Object.assign(CK.cfg,{players:1,mode:'ffa',map:'courtyard',chaosSpeed:'simple',arenaSize:'roomier'});CK.hostOnline()`);await host.wait('CK.NET.peer?.open','signaling ready');
 const code=await host.run('CK.NET.code');
 // Send a legacy hello through the real DataConnection; all other transport stays intact.
 await guest.run(`new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/peerjs.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);})`);
 await guest.run(`window.originalConnect=Peer.prototype.connect;Peer.prototype.connect=function(...args){const c=originalConnect.apply(this,args),send=c.send;c.send=function(d,...rest){if(d?.t==='hello'){d={...d};delete d.arenaSizeVersion;}return send.call(this,d,...rest);};return c;};CK.cfg.arenaSize='classic';CK.joinOnline(${JSON.stringify(code)})`);
 await host.wait('CK.NET.players.length===2&&CK.NET.conns.size===1','guest joined');check(await guest.run('CK.NET.conn.open'),'Real PeerJS connection established');
 await host.run(`window.previousRound=CK.G().roundId;CK.start()`);
 check(await host.run(`CK.G().roundId===previousRound&&CK.G().demo&&CK.NET.players[1].arenaSizeVersion===0&&document.getElementById('lobbyMsg').textContent.includes('choose Classic')`),'Legacy hello prevents Roomier start with an actionable lobby message');
 await host.run(`CK.cfg.arenaSize='classic';CK.start()`);await guest.wait(`!CK.G().demo&&CK.G().arenaSize==='classic'`,'Classic starts for legacy hello');
 check(await guest.run(`CK.arenaGeometry().T===40`),'Legacy peer can still join Classic');
 await guest.run(`Peer.prototype.connect=originalConnect;CK.leaveOnline()`);await host.wait('CK.NET.players.length===1','legacy peer leaves');
 await host.run(`CK.toMenu();CK.cfg.arenaSize='roomier'`);await guest.run(`CK.joinOnline(${JSON.stringify(code)})`);await host.wait('CK.NET.players.length===2&&CK.NET.players[1].arenaSizeVersion===1','capable peer rejoins');
 check(true,'Current hello advertises Roomier capability over real transport');
 const peer=await guest.run('CK.NET.peer.id');
 await guest.run(`window.setupPackets=[];CK.NET.conn.on('data',d=>{if(d.t==='start')setupPackets.push({size:d.setup.arenaSize,roundId:d.setup.roundId});});0`);
 for(const size of ['roomier','classic']){
  await host.run(`CK.cfg.arenaSize='${size}';${size==='roomier'?'CK.start()':'CK.endMatch();CK.rematch()'};var g=CK.G(),a=CK.arenaGeometry();g.mayhemAt=g.norrAt=1e6;g.steveDone=true;g.spawnT=1e6;g.pickups=[];g.hitstop=0;for(const e of g.ents){e.vx=e.vy=0;if(!e.human){e.dead=true;e.respawn=1000;}}window.guestActor=g.ents.find(e=>e.netId===${JSON.stringify(peer)});guestActor.x=a.W-a.T-70;guestActor.y=a.OY+a.T*1.5;guestActor.protect=10;g.ents[0].x=a.T*1.5;g.ents[0].y=a.OY+a.T*1.5;0`);
  const round=await host.run('CK.G().roundId');await guest.wait(`CK.G().roundId===${JSON.stringify(round)}&&CK.G().arenaSize==='${size}'`,'round setup '+size);
  check(await guest.run(`CK.arenaGeometry().T===${size==='roomier'?44:40}&&setupPackets.at(-1).size==='${size}'`),`${size}: transmitted setup selects host geometry`);
  await guest.key('keyDown','d','KeyD',68);
  await host.wait('guestActor.x>=CK.arenaGeometry().W-CK.arenaGeometry().T-18','authoritative right boundary '+size);
  await guest.wait('CK.G().ents[CK.NET.me].x>=CK.arenaGeometry().W-CK.arenaGeometry().T-20','guest right boundary '+size);
  await guest.key('keyUp','d','KeyD',68);await sleep(150);
  const hg=await host.run('CK.arenaGeometry()'),gg=await guest.run('CK.arenaGeometry()');
  const hx=await host.run('guestActor.x'),gx=await guest.run('CK.G().ents[CK.NET.me].x');
  check(hg.W===gg.W&&hg.H===gg.H&&hg.T===gg.T&&JSON.stringify(hg.backings)===JSON.stringify(gg.backings),`${size}: host/guest dimensions and backing canvases agree`,{host:hg,guest:gg});
  check(Math.abs(hx-gx)<2&&gx<=gg.W-gg.T-17.59,`${size}: real input and snapshots agree at outer wall`,{hostX:hx,guestX:gx});
  if(size==='roomier')check(gx>1280, 'Roomier guest reaches world coordinates beyond the old world edge');
  for(const b of [host,guest]){const image=await b.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,size+'-'+b.name.toLowerCase()+'.png'),Buffer.from(image.data,'base64'));}
 }
 check(await guest.run(`setupPackets.length===2&&setupPackets[0].roundId!==setupPackets[1].roundId&&CK.cfg.arenaSize==='classic'`),'Classic rematch transitions the existing connection without replacing local preference');
 check(errors.length===0,'No runtime errors during live Roomier join and Classic rematch');
 report.sourceHashesAfter=hashes();check(JSON.stringify(report.sourceHashes)===JSON.stringify(report.sourceHashesAfter),'Runtime source remained unchanged during acceptance');
 console.log(JSON.stringify({passed:checks.length,out:OUT}));
})().catch(error=>{report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(()=>{clearTimeout(timer);fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');for(const b of browsers){b.ws?.close();b.child.kill();}});
