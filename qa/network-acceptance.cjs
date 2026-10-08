// Live PeerJS acceptance with three isolated Chrome profiles on one machine/network.
// Usage: node qa/network-acceptance.cjs. This does not certify physical controllers or cross-network NAT.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-network');fs.mkdirSync(OUT,{recursive:true});
const check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);console.log('PASS: '+label);};
async function browser(name){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-network-'));
 const child=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore'});
 const b={child,name};browsers.push(b);let port;
 for(let i=0;i<60;i++){try{port=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);break;}catch{await sleep(250);}}
 if(!port)throw Error(name+' Chrome failed');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x=>x.type==='page');
 const ws=new WebSocket(tab.webSocketDebuggerUrl);b.ws=ws;let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(name+' '+method+' timeout'));},30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 b.run=async(expression)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(name+': '+JSON.stringify(r.exceptionDetails));return r.result.value;};
 b.wait=async(expr,label)=>{for(let i=0;i<100;i++){if(await b.run(expr))return;await sleep(200);}throw Error(name+': '+label);};
 await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 await b.wait('!!window.CK','game load');await b.run(`document.getElementById('nameIn').value=${JSON.stringify(name)};CK.freeze(true);0`);return b;
}
(async()=>{
 const host=await browser('Host'),guest=await browser('Guest'),late=await browser('Late');
 await late.run("CK.joinOnline('bad');0");check(await late.run("CK.NET.role===null&&document.getElementById('menuMsg').textContent.includes('5 letters')"),'Invalid code rejected without a connection');
 await host.run('CK.cfg.players=7;CK.hostOnline()');await host.wait('CK.NET.peer&&CK.NET.peer.open','signaling ready');const code=await host.run('CK.NET.code');
 await guest.run(`CK.joinOnline(${JSON.stringify(code)})`);await host.wait('CK.NET.players.length===2','guest joins');
 await late.run(`CK.joinOnline(${JSON.stringify(code)})`);await late.wait("CK.NET.role===null&&document.getElementById('menuMsg').textContent.includes('full')",'full-room rejection');
 check(await host.run('CK.NET.players.length===2&&CK.NET.conns.size===1'),'Capacity includes host couch seats and rejects ninth knight');
 await host.run('CK.cfg.players=1;CK.start();CK.freeze(true);0');await guest.wait('!CK.G().demo&&!CK.G().over','round begins');
 await late.run(`CK.joinOnline(${JSON.stringify(code)})`);await host.wait('CK.NET.players.length===3','late guest registered');await late.wait('CK.NET.waiting','late join waits');
 check(await late.run('CK.G().demo&&CK.PROG.matches===0'),'Join during match waits safely for the next round');
 await host.run('CK.G().ents.find(e=>e.netId).parries=10;CK.endMatch();0');await guest.wait('CK.G().over','first round results');
 check(await late.run('CK.G().demo&&CK.PROG.matches===0'),'Waiting guest receives no current-round award');
 check(await guest.run('CK.PROG.matches===1&&CK.PROG.ch.parry10===10'),'Active guest receives authoritative reward');
 await guest.run("[...document.querySelectorAll('#end button')].find(b=>b.textContent==='Choose Tea Towel').click();0");await host.wait("CK.NET.players.some(p=>p.name==='Guest'&&p.kit.cape==='teaTowel')",'guest equipped kit propagation');
 check(await host.run("CK.G().ents.find(e=>e.name==='Guest').cape!=='teaTowel'"),'Result equip queues guest costume for next round without changing the ended knight');
 for(let i=0;i<3;i++){
  await host.run('CK.rematch();CK.freeze(true);0');const round=await host.run('CK.G().roundId');
  await guest.wait(`CK.G().roundId===${JSON.stringify(round)}&&!CK.G().over`,'rematch guest');await late.wait(`CK.G().roundId===${JSON.stringify(round)}&&!CK.G().over`,'rematch late guest');
  check(await late.run('CK.NET.me>=0&&CK.G().ents[CK.NET.me].netId===CK.NET.peer.id'),'Rematch '+(i+1)+' assigns the late guest its knight');
  if(i===0)check(await host.run("CK.G().ents.find(e=>e.name==='Guest').cape==='teaTowel'")&&await guest.run("CK.G().ents[CK.NET.me].cape==='teaTowel'"),'Guest first-reward equip appears on both peers in the next rematch');
  await host.run('CK.endMatch();0');await guest.wait('CK.G().over','rematch award');await late.wait('CK.G().over','late rematch award');
 }
 check(await guest.run('CK.PROG.matches===4')&&await late.run('CK.PROG.matches===3'),'Three rematches count once for each participating guest');
 await host.run('CK.rematch();CK.freeze(true);0');await late.wait('!CK.G().over','drop test begins');const departing=await guest.run('CK.NET.peer.id');await guest.run('CK.leaveOnline();0');
 await host.wait('CK.NET.players.length===2','guest removed');check(await host.run(`CK.G().ents.some(e=>e.name==='Guest (bot)'&&!e.human&&!e.netId)&&!CK.NET.inputs[${JSON.stringify(departing)}]&&!CK.NET.latch[${JSON.stringify(departing)}]`),'Guest disconnect transfers its knight to a bot and clears controls');
 await host.run('CK.endMatch();0');await late.wait('CK.G().over','surviving guest result');check(await late.run('CK.PROG.matches===4'),'Remaining guest completes after another guest leaves');
 await host.run('CK.startCup();CK.freeze(true);0');await late.wait('CK.cup()&&CK.cup().status===\'playing\'&&!CK.G().over','Cup guest starts');
 await guest.run(`CK.joinOnline(${JSON.stringify(code)})`);await host.wait('CK.NET.players.length===3','Cup late guest joins');
 const lateBefore=await late.run('CK.PROG.matches'),waitingBefore=await guest.run('CK.PROG.matches');
 for(let i=0;i<3;i++){
  await host.run('CK.endMatch();0');await late.wait(`CK.cup()&&CK.cup().history.length===${i+1}`,'Cup result arrives');
  check(await late.run("!document.getElementById('cupResults').hidden"),'Online Cup round '+(i+1)+' shows shared standings');
  if(i<2){
   await host.run("CK.cupReady('local:1',1,true);CK.nextCupRound();0");check(await host.run("CK.cup().status==='between'"),'Online Cup waits for guest ready-up');
   await late.run("CK.cupReady('ignored-client-key',1,true);0");await host.wait('CKCup.canAdvance(CK.cup())','authenticated guest ready received');
   await host.run('CK.nextCupRound();CK.freeze(true);0');await late.wait(`CK.cup().round===${i+1}&&!CK.G().over`,'next Cup round');
  }
 }
 check(await late.run('CK.PROG.matches')===lateBefore+3,'Online Cup delivers all three guest round rewards');
 check(await guest.run('CK.NET.waiting&&CK.PROG.matches')===waitingBefore,'Late Cup arrival waits until a new Cup and earns no bot rewards');
 await host.run('CK.leaveOnline();0');await late.wait("CK.NET.role===null&&!document.getElementById('menu').hidden",'host departure');check(true,'Host departure returns remaining guest to menu');
 fs.writeFileSync(path.join(OUT,'summary.md'),'# Live network acceptance\n\nThree isolated Chrome profiles, same machine/network. Physical gamepads and different networks remain unverified.\n\n'+passed.map(x=>'- PASS: '+x).join('\n')+'\n');console.log('Wrote '+OUT);
})().catch(e=>{fs.writeFileSync(path.join(OUT,'failure.txt'),String(e.stack));console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
