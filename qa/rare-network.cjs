// Focused live PeerJS rare-event check. Three isolated profiles on one machine.
// Usage: node qa/rare-network.cjs [output-directory]
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','rare-network'));
const CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],checks=[],errors=[];
const files=['index.html','game/chaos.js','game/weapons.js','game/preferences.js','audio/soundtrack.js','audio/13-oh-nae-nae-whats-your-name.wav'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')]));
const report={scope:'Three real PeerJS connections in isolated Chrome profiles on one machine/network. Not cross-network NAT, public hosting, or physical controller certification.',fixtures:'QA hooks choose the host rare plan and its recipient deterministically; ordinary host simulation, PeerJS transport, guest input and snapshot handling run live. Bots are disabled and human spawn protection extended to isolate protocol behavior. The recipient disconnects through the normal leave path.',checks,errors};
fs.mkdirSync(OUT,{recursive:true});
function check(ok,name){checks.push({name,pass:!!ok});if(!ok)throw Error(name);console.log('PASS: '+name);}
async function browser(name){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-rare-network-'));
 const child=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
 const b={name,child};browsers.push(b);let port;
 for(let i=0;i<80;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}
 if(!port)throw Error(name+' Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 const ws=new WebSocket(tab.webSocketDebuggerUrl);b.ws=ws;let id=0;const pending=new Map();
 b.send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(name+' '+method+' timed out'));},30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push({name,details:d.params.exceptionDetails});};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 b.run=async expression=>{const r=await b.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(name+': '+JSON.stringify(r.exceptionDetails));return r.result.value;};
 b.wait=async(expression,label)=>{for(let i=0;i<120;i++){if(await b.run(expression))return;await sleep(150);}throw Error(name+': '+label);};
 await b.send('Runtime.enable');
 await b.send('Page.enable');
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'(()=>{const Native=window.Audio;window.qaAudio=[];window.Audio=new Proxy(Native,{construct(t,a){const v=Reflect.construct(t,a);qaAudio.push(v);return v;}})})();'});
 await b.send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href+'?qa=1'});
 await b.wait('!!window.CK','game load');
 await b.run(`document.getElementById('nameIn').value=${JSON.stringify(name)};CK.freeze(false);0`);
 return b;
}
const stableArena=`{const g=CK.G();g.rarePlan={kind:null,done:true};g.mayhemAt=1e6;g.steveDone=true;g.norrAt=1e6;g.spawnT=1e6;g.ev=null;g.mayhem=null;g.pickups=[];for(const e of g.ents){e.protect=1000;e.inv=1000;if(!e.human){e.dead=true;e.respawn=1000;}}}`;
(async()=>{
 report.startedAt=new Date().toISOString();report.sourceHashes=hashes();
 const host=await browser('RareHost'),guest=await browser('Recipient'),watcher=await browser('Witness');
 await host.run('CK.cfg.players=1;CK.hostOnline()');await host.wait('CK.NET.peer?.open','signaling ready');
 const code=await host.run('CK.NET.code');
 for(const b of [guest,watcher])await b.run(`CK.joinOnline(${JSON.stringify(code)})`);
 await host.wait('CK.NET.players.length===3','both guests joined');
 check(await host.run('CK.NET.conns.size===2'),'Three isolated profiles establish real PeerJS connections');
 await host.run(`CK.cfg.chaosSpeed='simple';CK.cfg.map='courtyard';CK.start();${stableArena}0`);
 for(const b of [guest,watcher])await b.wait("!CK.G().demo&&CK.G().chaosPolicy?.name==='simple'",'Simple setup received');
 check(await guest.run("CK.G().chaosPolicy.name==='simple'&&CK.G().chaos===0")&&await watcher.run("CK.G().chaosPolicy.name==='simple'&&CK.G().chaos===0"),'Simple policy arrives in both guest round setups');
 check(await host.run("!CK.startRareEvent({kind:'nae',ownerId:0})&&!CK.G().rareEvent"),'Simple host rejects a rare event');
 await host.run(`CK.cfg.chaosSpeed='insane';CK.start();${stableArena}0`);
 const round=await host.run('CK.G().roundId');
 for(const b of [guest,watcher])await b.wait(`CK.G().roundId===${JSON.stringify(round)}&&CK.G().chaosPolicy?.name==='insane'`,'Insane setup received');
 check(await guest.run("CK.G().chaosPolicy.name==='insane'")&&await watcher.run("CK.G().chaosPolicy.name==='insane'"),'Insane policy arrives in both guest round setups');
 const recipientId=await guest.run('CK.NET.peer.id');
 check(await guest.run("!CK.startRareEvent({kind:'nae',ownerId:CK.G().ents[CK.NET.me].id})&&!CK.G().rareEvent"),'Guest cannot activate a rare event through the authority helper');
 await guest.run("CK.NET.conn.send({t:'rare',kind:'nae',ownerId:CK.NET.me,roundId:CK.G().roundId});CK.NET.conn.send({t:'s',roundId:CK.G().roundId,rare:{kind:'nae',ownerId:CK.NET.me,remaining:12}});CK.NET.conn.send({t:'shout',roundId:CK.G().roundId,i:0});0");
 await host.wait(`CK.G().bubbles.some(b=>b.e.netId===${JSON.stringify(recipientId)})`,'ordered valid message after forged event');
 check(await host.run('!CK.G().rareEvent&&CK.G().ents.every(e=>e.wpn?.kind!==\'ak47\')'),'Host ignores forged client rare-event and snapshot messages');
 const ownerId=await host.run(`CK.G().ents.find(e=>e.netId===${JSON.stringify(recipientId)}).id`);
 await host.run(`(()=>{const g=CK.G(),humans=g.ents.filter(e=>e.human),index=humans.findIndex(e=>e.id===${ownerId}),random=Math.random;g.rarePlan={kind:'nae',at:g.clock,deadline:g.clock+60,done:false};Math.random=()=> (index+.5)/humans.length;try{CK.updateRareEvent();}finally{Math.random=random;}return 0;})()`);
 await host.wait(`CK.G().rareEvent?.ownerId===${ownerId}`,'host plan activation');
 for(const b of [guest,watcher])await b.wait(`CK.G().rareEvent?.kind==='nae'&&CK.G().rareEvent.ownerId===${ownerId}&&CK.G().ents[${ownerId}].wpn?.kind==='ak47'`,'rare snapshot received');
 check(await guest.run(`CK.G().ents[${ownerId}].wpn.ammo===30`)&&await watcher.run(`CK.G().ents[${ownerId}].wpn.ammo===30`),'Host-selected recipient and 30-round AK47 hydrate on both guests');
 for(const b of [host,guest,watcher])await b.wait("CK.musicState().cue==='oh-nae-nae'&&qaAudio.some(a=>a.currentSrc.includes('13-oh-nae-nae-whats-your-name.wav')&&!a.paused&&a.currentTime>0)",'rare music playback');
 check(true,'Host and both guests switch to and play the rare WAV cue');
 await guest.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
 await host.wait(`CK.G().ents[${ownerId}].wpn?.ammo<30`,'guest fire reaches host');
 await guest.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
 await watcher.wait(`CK.G().ents[${ownerId}].wpn?.ammo<30`,'ammo snapshot reaches witness');
 check(true,'Real guest keyboard input consumes authoritative AK47 ammo and propagates to witness');
 for(const b of [guest,watcher]){
  check(await b.run('CK.draw();true'),b.name+' renders rare HUD and held AK47 without exception');
  const shot=await b.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,b.name.toLowerCase()+'.png'),Buffer.from(shot.data,'base64'));
 }
 await guest.run('CK.leaveOnline();0');
 await host.wait('CK.NET.players.length===2&&!CK.G().rareEvent','host cleans departed recipient event');
 await watcher.wait('!CK.G().rareEvent&&CK.musicState().cue!==\'oh-nae-nae\'','witness sees cleanup');
 check(await host.run(`!CK.G().ents[${ownerId}].human&&!CK.G().ents[${ownerId}].wpn&&CK.musicState().cue==='courtyard'`),'Host removes departed recipient weapon and restores arena music');
 check(await watcher.run(`!CK.G().ents[${ownerId}].human&&!CK.G().ents[${ownerId}].wpn&&CK.musicState().cue==='courtyard'`),'Surviving guest receives bot takeover, no AK47, and restored arena cue');
 check(await guest.run("CK.NET.role===null&&CK.musicState().cue==='menu'"),'Departing recipient returns to menu music');
 check(await host.run("!Object.hasOwn(CK.WEAPONS,'ak47')")&&await watcher.run("!Object.hasOwn(CK.WEAPONS,'ak47')"),'Host and guest ordinary weapon pools exclude AK47');
 check(errors.length===0,'No browser runtime exceptions during network scenario');
 report.finishedAt=new Date().toISOString();report.sourceHashesAfter=hashes();
 check(JSON.stringify(report.sourceHashes)===JSON.stringify(report.sourceHashesAfter),'Production source and audio hashes remain unchanged during the run');
 fs.writeFileSync(path.join(OUT,'summary.md'),'# Rare-event network check\n\n'+report.scope+'\n\n'+report.fixtures+'\n\n'+checks.map(c=>'- PASS: '+c.name).join('\n')+'\n');
 console.log(JSON.stringify({passed:checks.length,out:OUT}));
})().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
