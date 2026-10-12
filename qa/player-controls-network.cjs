// Actual PeerJS transport + CDP mouse/keyboard input in two isolated profiles.
// Browser/transport helpers follow qa/rare-network.cjs. No runtime source edits.
// Usage: node qa/player-controls-network.cjs [output-directory]
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','player-controls-network'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],checks=[],errors=[];
const hashes=()=>Object.fromEntries(['index.html','game/weapons.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')]));
const report={scope:'Two real PeerJS peers connected by a DataConnection in isolated headless Chrome profiles on one machine/network. CDP dispatches mouse and keyboard events; normal client serialization, transport, host authority and guest snapshots run live. Not cross-network NAT, human playtesting, or physical input-device certification.',fixtures:'Host QA hooks place humans, disable bots/chaos and give a bow. A read-only data listener records host acceptance of real transport packets. Tagged legacy/invalid input probes use the existing real guest DataConnection, without invoking hostRecv directly. A short host sampler observes transient peck and projectile effects.',checks,errors};
fs.mkdirSync(OUT,{recursive:true});
function check(ok,name,detail){checks.push({name,pass:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);console.log('PASS: '+name);}
async function browser(name){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-controls-network-'));
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
const stableArena=`{const g=CK.G();g.rarePlan={kind:null,done:true};g.mayhemAt=1e6;g.steveDone=true;g.norrAt=1e6;g.spawnT=1e6;g.ev=null;g.mayhem=null;g.pickups=[];g.proj=[];g.hitstop=0;for(const e of g.ents){e.protect=e.inv=e.stun=e.hitLock=e.fireCd=e.bawkCd=0;e.vx=e.vy=0;if(!e.human){e.dead=true;e.respawn=1000;}}}`;
const timer=setTimeout(()=>{report.failure=report.failure||'Overall network test timeout';for(const b of browsers)b.child.kill();process.exitCode=1;},180000);
(async()=>{
 report.startedAt=new Date().toISOString();report.sourceHashes=hashes();
 const host=await browser('ControlsHost'),guest=await browser('ControlsGuest');
 await host.run('CK.cfg.players=1;CK.hostOnline()');await host.wait('CK.NET.peer?.open','signaling ready');
 const code=await host.run('CK.NET.code');await guest.run(`CK.joinOnline(${JSON.stringify(code)})`);
 await host.wait('CK.NET.players.length===2&&CK.NET.conns.size===1','guest joined');
 check(await guest.run('CK.NET.conn.open'),'Two isolated profiles establish a real PeerJS DataConnection');
 const peer=await guest.run('CK.NET.peer.id');
 await host.run(`window.qaGuest=${JSON.stringify(peer)};window.qaWire=[];CK.NET.conns.get(qaGuest).on('data',d=>{if(d.t==='in'){qaWire.push({wire:d.i,tag:d.qaCase||null,accepted:CK.NET.inputs[qaGuest]?.slice()});if(qaWire.length>1000)qaWire.shift();}});Object.assign(CK.cfg,{players:1,mode:'ffa',map:'courtyard',chaosSpeed:'simple'});CK.start();${stableArena}window.qaHuman=CK.G().ents.find(e=>e.netId===qaGuest);qaHuman.x=450;qaHuman.y=440;CK.G().ents[0].x=900;CK.G().ents[0].y=500;CK.giveWeapon(qaHuman,'bow');window.qaInitialAmmo=qaHuman.wpn.ammo;window.qaShots=[];window.qaSampling=setInterval(()=>{for(const p of CK.G().proj)if(p.owner===qaHuman&&qaShots.length<200)qaShots.push({vx:p.vx,vy:p.vy,x:p.x,y:p.y});},5);0`);
 let round=await host.run('CK.G().roundId');
 await guest.wait(`CK.G().roundId===${JSON.stringify(round)}&&CK.G().ents[CK.NET.me]?.wpn?.kind==='bow'`,'round and bow snapshot received');
 await guest.mouse('mouseMoved',450,220);await guest.key('keyDown','d','KeyD',68);
 await host.wait('qaWire.some(p=>p.wire.length===8&&p.wire[0]===1&&Math.abs(p.wire[7]+Math.PI/2)<.15)','separate movement and aim reach host');
 await host.wait('qaHuman.x>475&&qaHuman.face< -1.2&&qaHuman.face> -2.2','host moves right while facing cursor above');
 check(true,'Guest D movement and upward mouse aim travel separately and drive authoritative movement/facing');
 await guest.mouse('mousePressed',450,220,'left');
 await host.wait('qaHuman.wpn.ammo<qaInitialAmmo&&qaShots.some(p=>p.vy<0&&Math.abs(p.vy)>Math.abs(p.vx)*2)','mouse click fires at cursor on host');
 await guest.mouse('mouseReleased',450,220,'left');await guest.key('keyUp','d','KeyD',68);
 check(true,'Real guest left-click fires a host-owned upward bow projectile while moving right');
 const ammo=await host.run('qaHuman.wpn.ammo');await guest.wait(`CK.G().ents[CK.NET.me]?.wpn?.ammo<=${ammo}`,'ammo snapshot returned');
 check(true,'Authoritative ammo consumption returns to the guest through snapshots');
 await guest.mouse('mousePressed',600,440,'right');await host.wait('qaHuman.blocking&&CK.NET.inputs[qaGuest][4]===1','right mouse guard reaches host');
 check(true,'Guest right-click activates authoritative block');
 await guest.mouse('mouseReleased',600,440,'right');await guest.run('dispatchEvent(new Event("blur"));0');
 await host.wait('qaWire.some(p=>p.wire[7]===4&&p.accepted?.[5]===null&&p.wire[2]===0&&p.wire[4]===0)','blur sends clear sentinel');
 check(true,'Focus loss releases pointer buttons and transports the explicit no-aim sentinel');
 const probes=[['legacy',[0,.5,0,0,0,10,0]],['sentinel',[.5,0,0,0,0,10,0,4]],['angle',[0,0,0,0,0,10,0,Math.PI/2]]];
 for(const [tag,input] of probes){await guest.run(`CK.NET.conn.send({t:'in',roundId:CK.G().roundId,qaCase:${JSON.stringify(tag)},i:${JSON.stringify(input)}});0`);await host.wait(`qaWire.some(p=>p.tag===${JSON.stringify(tag)})`,'probe '+tag);}
 const probeData=await host.run('qaWire.filter(p=>p.tag)');report.protocolProbes=probeData;
 check(probeData.find(p=>p.tag==='legacy')?.accepted?.[1]===.5&&probeData.find(p=>p.tag==='legacy')?.accepted?.[5]===null,'Legacy seven-field input remains movement-facing over the real connection');
 check(probeData.find(p=>p.tag==='sentinel')?.accepted?.[0]===.5&&probeData.find(p=>p.tag==='sentinel')?.accepted?.[5]===null,'Eight-field no-aim sentinel preserves independent movement');
 check(probeData.find(p=>p.tag==='angle')?.accepted?.[5]===Math.PI/2,'Finite explicit aim survives real PeerJS serialization');
 for(const tag of ['outside','nan','infinity']){
  const expr={outside:'9',nan:'NaN',infinity:'Infinity'}[tag];
  await guest.run(`CK.NET.conn.send({t:'in',roundId:CK.G().roundId,qaCase:${JSON.stringify(tag)},i:[.731,.419,1,0,0,900,0,${expr}]});0`);
  await host.wait(`qaWire.some(p=>p.tag===${JSON.stringify(tag)})`,'invalid probe '+tag);
  check(await host.run(`qaWire.find(p=>p.tag===${JSON.stringify(tag)}).accepted?.[0]!==.731`),'Host rejects '+tag+' aim arriving through real transport');
 }
 report.protocolProbes=await host.run('qaWire.filter(p=>p.tag)');report.shotSamples=await host.run('qaShots.slice(0,8)');
 await host.run(`clearInterval(qaSampling);CK.cfg.mode='race';CK.start();${stableArena}qaHuman=CK.G().ents.find(e=>e.netId===qaGuest);qaHuman.x=450;qaHuman.y=440;qaHuman.face=0;window.qaTarget=CK.G().ents.find(e=>e.human&&!e.netId);qaTarget.x=490;qaTarget.y=440;qaTarget.face=0;qaHuman.bawkCd=qaTarget.bawkCd=0;window.qaPeck=null;window.qaSampling=setInterval(()=>{if(qaHuman.bawkCd>0&&qaTarget.vx>100&&!qaPeck)qaPeck={hp:qaTarget.hp,dead:qaTarget.dead,vx:qaTarget.vx,bawkCd:qaHuman.bawkCd,ring:CK.G().parts.some(p=>p.kind==='ring'),x:qaTarget.x};},5);0`);
 round=await host.run('CK.G().roundId');await guest.wait(`CK.G().roundId===${JSON.stringify(round)}&&CK.G().mode==='race'&&Math.abs(CK.G().ents[CK.NET.me].x-450)<5`,'race setup and positions received');
 await guest.mouse('mouseMoved',700,440);await guest.mouse('mousePressed',700,440,'left');
 await host.wait('!!qaPeck','guest mouse peck shoves target');await guest.mouse('mouseReleased',700,440,'left');
 report.peck=await host.run('qaPeck');
 check(report.peck.hp===3&&!report.peck.dead&&report.peck.vx>100,'Guest chicken click produces authoritative knockback without damage or death',report.peck);
 check(report.peck.ring,'Network chicken peck creates the visible ring effect on the host');
 const targetId=await host.run('qaTarget.id');await guest.wait(`CK.G().ents[${targetId}].x>505&&CK.G().ents[${targetId}].hp===3&&!CK.G().ents[${targetId}].dead`,'nonlethal result snapshot received');
 check(true,'Guest receives the shoved rival position and unchanged health through snapshots');
 for(const b of [host,guest]){const shot=await b.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,b.name.toLowerCase()+'.png'),Buffer.from(shot.data,'base64'));}
 await host.run('clearInterval(qaSampling);0');check(errors.length===0,'No browser runtime exceptions during live controls scenario');
 report.finishedAt=new Date().toISOString();report.sourceHashesAfter=hashes();
 report.sourceChangedDuringRun=JSON.stringify(report.sourceHashes)!==JSON.stringify(report.sourceHashesAfter);
 if(report.sourceChangedDuringRun)console.log('NOTE: production source changed concurrently; source hashes recorded before and after.');
 fs.writeFileSync(path.join(OUT,'summary.md'),'# Player controls: live network check\n\n'+report.scope+'\n\n'+report.fixtures+'\n\n'+checks.map(c=>'- '+(c.pass?'PASS':'FAIL')+': '+c.name).join('\n')+'\n');
 console.log(JSON.stringify({passed:checks.length,out:OUT}));
})().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(timer);fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
