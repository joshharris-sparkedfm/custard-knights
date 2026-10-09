// Faction preview from the running game; user-visible bot disclosure. Simulation advances 2 x 1/60 per 30fps frame.
// Uses isolated QA saves and bots/scripted keyboard input; no fabricated gameplay imagery.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(ROOT,'build','store-footage'));
const CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ffmpeg=process.env.FFMPEG||'ffmpeg',sleep=ms=>new Promise(r=>setTimeout(r,ms));fs.mkdirSync(OUT,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-footage-'));
const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1920,1080','--hide-scrollbars','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
let encoder,ws;process.on('exit',()=>{chrome.kill();if(encoder)encoder.kill();});
(async()=>{
 let port;for(let i=0;i<60;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(250);}}
 if(!port)throw Error('Chrome debugger unavailable');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x=>x.type==='page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async(expression)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 for(let i=0;i<80;i++){await sleep(100);if(await run('!!window.CK'))break;}
 await run('CK.freeze(true);CK.sprLoadAll()');
 if(!await run("CK.saveProfile(1,{...CK.loadProfile(1),visor:'open'});CK.sprLoadVisors()"))throw Error('Complete open visor assets are required for this capture');
 await run(`window.captureFactions=()=>{const state=CK.massBattle().qa.practiceState(),p=state.players.find(p=>p.humanId==='local'),target=state.players.filter(q=>q.team!==p.team&&q.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];const dx=target?target.x-p.x:1,dy=target?target.y-p.y:0,d=Math.hypot(dx,dy)||1;for(let k=0;k<2;k++)CK.massBattle().qa.captureStep(1/60,{local:{moveX:d>80?dx/d:0,moveY:d>80?dy/d:0,aimX:dx/d,aimY:dy/d,attack:d<105,heavy:false,guard:false,dash:false,ability:d<130}});};window.captureLabel=document.createElement('div');captureLabel.style.cssText='position:fixed;left:20px;top:62px;z-index:999999;background:#17172bda;color:#fff3cb;border:1px solid #f0be53;padding:8px 13px;font:14px Arial;border-radius:8px;pointer-events:none';captureLabel.textContent='DEVELOPMENT PREVIEW • Scripted player + bots';document.body.append(captureLabel);0`);
 const scenes=[
  {name:'4v4-faction-brawl',seconds:6,mode:'brawl',size:4,role:'vanguard'},
  {name:'20v20-capture-the-flag',seconds:6,mode:'ctf',size:20,role:'support'},
  {name:'50v50-castle-siege',seconds:8,mode:'siege',size:50,role:'engineer'}
 ];
 const seconds=scenes.reduce((n,s)=>n+s.seconds,0),output=path.join(OUT,'Custard-Knights-Faction-Preview.mp4');
 encoder=spawn(ffmpeg,['-y','-loglevel','warning','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-stream_loop','-1','-i',path.join(ROOT,'menu-theme.mp3'),'-t',String(seconds),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af',`afade=t=in:d=1,afade=t=out:st=${seconds-2}:d=2`,'-movflags','+faststart',output],{stdio:['pipe','ignore','pipe'],windowsHide:true});
 let encoderError='';encoder.stderr.on('data',d=>encoderError+=d);const ended=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('exit',code=>code===0?resolve():reject(Error('ffmpeg '+code+': '+encoderError)));});
 for(const scene of scenes){
  await run(`CK.massBattle().qa.startPractice({mode:'${scene.mode}',teamSize:${scene.size},role:'${scene.role}'});CK.massBattle().qa.captureMode(true);for(let k=0;k<420;k++)captureFactions();0`);await sleep(100);
  for(let f=0;f<scene.seconds*30;f++){
   await run('captureFactions();0');
   const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:92,captureBeyondViewport:false});
   const bytes=Buffer.from(shot.data,'base64');
   if(f===Math.floor(scene.seconds*15))fs.writeFileSync(path.join(OUT,scene.name+'.jpg'),bytes);
   if(!encoder.stdin.write(bytes))await new Promise(resolve=>encoder.stdin.once('drain',resolve));
  }
  if(scene.after)await run(scene.after+';0');console.log('Captured '+scene.name+' ('+scene.seconds+'s)');
 }
 encoder.stdin.end();await ended;encoder=null;
 fs.writeFileSync(path.join(OUT,'CAPTURE-NOTES.json'),JSON.stringify({created:new Date().toISOString(),version:JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')).version,indexSha256:require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT,'index.html'))).digest('hex'),spriteSha256:Object.fromEntries(['knight','hero','knight-open','hero-open','chicken'].map(name=>[name,require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT,'sprites',name+'.js'))).digest('hex')])),battleFiles:Object.fromEntries(['game/mass-battle.js','game/mass-battle-ui.js','game/mass-battle.css'].map(name=>[name,require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT,name))).digest('hex')])),width:1920,height:1080,fps:30,seconds,scenes,source:'actual Faction Front renderer and simulation; scripted local-player intentions plus bots; deterministic 60Hz simulation captured at30fps',audio:'owner-confirmed existing Suno menu theme; no synthetic gameplay sound added',limitations:'QA candidate footage for review; not a human playtest, online demonstration or performance benchmark'},null,2));
 console.log(output);ws.close();chrome.kill();
})().catch(error=>{console.error(error);if(ws)ws.close();chrome.kill();if(encoder)encoder.kill();process.exitCode=1;});
