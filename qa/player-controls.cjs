'use strict';
// Isolated synthetic integration checks. Exported test observations are not human playtest evidence.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(__dirname,'results','player-controls'));
const packaged=process.argv.includes('--packaged'),archive=path.join(root,'dist/Custard Knights-win32-x64/resources/app.asar');
fs.mkdirSync(out,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),packaged?'ck-soundtrack-browser-':'ck-player-controls-')),profile=path.join(temporary,'chrome');
let chrome,ws,diagnostics='';
if(packaged){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;chrome=spawn(require('electron'),[path.join(__dirname,'soundtrack-electron.cjs'),'--qa-archive='+archive,'--qa-profile='+profile,'--remote-debugging-port=0','--mute-audio','--autoplay-policy=no-user-gesture-required'],{env,stdio:['ignore','ignore','pipe'],windowsHide:true});chrome.stderr.on('data',d=>{diagnostics+=d;});}
else chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--window-size=1280,800','--remote-debugging-port=0','--user-data-dir='+profile,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),report={checks:[],errors:[],network:[],packaged,limitations:'Synthetic pointer/keyboard and controlled combat fixtures in isolated profiles. No human playtesting or physical-controller acceptance.'};
const timeout=setTimeout(()=>{chrome.kill();process.exitCode=1;},150000);
const check=(name,pass,details)=>{report.checks.push({name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)throw Error(name);};
(async()=>{
 let port;for(let i=0;i<120;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{const m=/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/.exec(diagnostics);if(m){port=+m[1];break;}await sleep(100);}}if(!port)throw Error('Browser failed to start '+diagnostics);
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);if(d.method==='Network.requestWillBeSent'){const u=d.params.request.url;report.network.push(u.startsWith('data:')?'data:[embedded asset omitted]':u);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const url=packaged?'custard://game/index.html':require('node:url').pathToFileURL(path.join(root,'index.html')).href;
 const ready=async query=>{await send('Page.navigate',{url:'about:blank'});await send('Page.navigate',{url:url+query});for(let i=0;i<150;i++){if(await run('!!document.getElementById("reportConsent")&&!!window.CKProductEvents'))return;await sleep(100);}throw Error('Reporting UI did not load');};
 const stored='JSON.parse(localStorage.getItem(CKProductEvents.KEY)||\'{"records":[]}\')';
 await send('Runtime.enable');await send('Network.enable');await send('Page.enable');await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:out});


 await ready('?qa=1');for(let i=0;i<100&&!await run('!!window.CK');i++)await sleep(100);
 await run(`window.begin=(mode='ffa')=>{CK.toMenu();Object.assign(CK.cfg,{players:1,mode,map:'courtyard',chaosSpeed:'simple'});CK.start();CK.freeze(false);var g=CK.G();g.hitstop=0;g.ents.forEach((e,i)=>{e.x=200+i*95;e.y=400;e.vx=e.vy=0;e.protect=e.inv=e.stun=e.hitLock=0;e.ai.think=100;});};window.point=(x,y,type='pointermove',button=0)=>{CK.zoom(1,640,400);const r=document.getElementById('game').getBoundingClientRect();const stage=document.getElementById('stage').getBoundingClientRect();document.getElementById('game').dispatchEvent(new PointerEvent(type,{pointerType:'mouse',bubbles:true,clientX:r.left+stage.width/2+x-640,clientY:r.top+stage.height/2+y-400,button}));};begin()`);
 check('Keyboard remains usable without mouse aim',await run('CK.keys.KeyW=true;var k=CK.humanInput(1,CK.G().ents[0]);CK.keys.KeyW=false;k.my===-1&&k.faceTo===null'));
 await run('point(200,200);CK.keys.KeyD=true');check('Mouse aim is independent of keyboard movement',await run('var k=CK.humanInput(1,CK.G().ents[0]);k.mx===1&&Math.abs(k.faceTo+Math.PI/2)<.001'));
 await run('CK.keys.KeyD=false;CK.giveWeapon(CK.G().ents[0],"bow");point(200,200,"pointerdown");CK.update(.016)');
 check('Actual pointer attack fires the ranged weapon at the cursor',await run('CK.G().proj.some(p=>p.owner===CK.G().ents[0]&&p.vy<0&&Math.abs(p.vx)<.001)'));
 await run('dispatchEvent(new PointerEvent("pointerup",{button:0}));point(300,400,"pointerdown",2)');check('Right mouse button guards',await run('CK.humanInput(1,CK.G().ents[0]).block&&!CK.humanInput(1,CK.G().ents[0]).atk'));
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:500,y:400,button:'right',buttons:2,clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:500,y:400,button:'left',buttons:3,clickCount:1});
 check('Real mouse button chord supports attack while guarding',await run('var i=CK.humanInput(1,CK.G().ents[0]);i.atk&&i.block'));
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:500,y:400,button:'left',buttons:2,clickCount:1});
 check('Releasing attack preserves held guard',await run('var i=CK.humanInput(1,CK.G().ents[0]);!i.atk&&i.block'));
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:500,y:400,button:'right',buttons:0,clickCount:1});
 await run(`CK.setSeats([{dev:'kb1'},{dev:'pad',idx:0}]);Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{index:0,axes:[1,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))}]});point(300,400,'pointerdown');CK.update(.016)`);
 await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 check('Pad seat activity does not disable keyboard seat mouse',await run("document.body.dataset.input==='pad'&&CK.humanInput(1,CK.G().ents[0]).atk&&Number.isFinite(CK.humanInput(1,CK.G().ents[0]).faceTo)"));
 await run("CK.setSeats(null);delete navigator.getGamepads;dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}));CK.keys.KeyW=false");
 await run('dispatchEvent(new Event("blur"))');check('Focus loss releases attack, guard and aim',await run('var i=CK.humanInput(1,CK.G().ents[0]);!i.atk&&!i.block&&i.faceTo===null'));
 await run('point(300,400,"pointerdown");CK.setPause(true);CK.setPause(false)');check('Pause does not leave an attack held',await run('!CK.humanInput(1,CK.G().ents[0]).atk'));
 await run('begin("race");var g=CK.G();g.ents.slice(2).forEach(e=>e.dead=true);g.ents[0].x=450;g.ents[1].x=490;g.ents[0].face=0;g.ents[1].ai.think=100;g.ents[1].bawkCd=10;point(600,400,"pointerdown");CK.update(.016)');
 check('Human racing chicken pecks with mouse and shoves a rival without killing',await run('CK.G().ents[0].bawkCd>0&&CK.G().ents[1].vx>100&&!CK.G().ents[1].dead&&CK.G().ents[1].hp===3'));
 check('Peck has a visible effect',await run('CK.G().parts.some(p=>p.kind==="ring")'));
 await run('dispatchEvent(new PointerEvent("pointerup",{button:0}));dispatchEvent(new Event("blur"));var g=CK.G();g.ents[0].bawkCd=0;g.ents[0].x=450;g.ents[1].x=490;g.ents[0].y=g.ents[1].y=400;g.ents[0].face=0;g.ents[1].hitLock=g.ents[1].inv=0;g.ents[1].vx=0;CK.keys.Space=true;CK.update(.016);CK.keys.Space=false');
 check('Keyboard Space pecks in Chicken Race too',await run('CK.G().ents[0].bawkCd>0&&CK.G().ents[1].vx>100&&!CK.G().ents[1].dead'));
 await run('begin();var p=CK.G().ents[0];CK.giveWeapon(p,"crossbow");p.wpn=null;CK.giveWeapon(p,"crossbow")');check('Refinding an exhausted weapon upgrades it during the same life',await run('CK.G().ents[0].wpn.lvl===2'));
 await run('var p=CK.G().ents[0];CK.giveWeapon(p,"bow");CK.giveWeapon(p,"crossbow");for(let n=0;n<20;n++)CK.giveWeapon(p,"crossbow")');check('Swapping preserves earned weapon levels with level and ammo caps',await run('var p=CK.G().ents[0];p.wpn.lvl===3&&p.wpn.ammo<=24'));
 await run('var p=CK.G().ents[0];CK.applyPU(p,"big");CK.applyPU(p,"big");CK.applyPU(p,"big")');check('Sword pickups raise reach level and last for the life',await run('CK.update(.1);CK.G().ents[0].lvl.big===3&&CK.G().ents[0].fx.big===1'));
 await run('CK.ko(CK.G().ents[0],null,"QA fixture")');check('Defeat clears earned weapon and sword upgrades',await run('var p=CK.G().ents[0];Object.keys(p.weaponLevels).length===0&&!p.fx.big&&!p.lvl.big'));
 await run('begin();CK.NET.role="host";CK.G().ents[1].netId="qa-guest";CK.G().ents[1].human=2;window.conn={peer:"qa-guest"};CK.NET.conns.set(conn.peer,conn);CK.hostRecv(conn,{t:"in",roundId:CK.G().roundId,i:[1,0,1,0,0,1,0,Math.PI/2]})');
 check('Host receives explicit aim separately from guest movement',await run('var i=CK.humanInput(2,CK.G().ents[1]);i.mx===1&&i.atk&&i.faceTo===Math.PI/2'));
 await run('CK.hostRecv(conn,{t:"in",roundId:CK.G().roundId,i:[0,1,0,0,0,1,0]})');check('Legacy seven-field input retains movement-facing compatibility',await run('CK.humanInput(2,CK.G().ents[1]).faceTo===null'));
 for(const angle of [NaN,Infinity,9]){await run(`CK.hostRecv(conn,{t:'in',roundId:CK.G().roundId,i:[1,0,1,0,0,4,0,${String(angle)}]})`);check(`Reject invalid guest aim ${angle}`,await run('CK.NET.inputs["qa-guest"][1]===1'));}
 await run('CK.NET.role=null;CK.toMenu()');
 check('No external network requests during local controls checks',report.network.every(u=>!/^(https?|wss?):/.test(u)));
 check('No browser exceptions',report.errors.length===0);
 report.sourceHashes={};const hash=v=>require('node:crypto').createHash('sha256').update(v).digest('hex'),asar=packaged?await import('@electron/asar'):null;
 for(const file of ['index.html','game/weapons.js'])report.sourceHashes[file]=hash(packaged?asar.extractFile(archive,file):fs.readFileSync(path.join(root,file)));
 if(packaged)report.archiveSha256=hash(fs.readFileSync(archive));
})().catch(error=>{report.failure=error.stack;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(c=>!c.pass),errors:report.errors.length,failure:report.failure,out}));clearTimeout(timeout);ws?.close();chrome.kill();});

