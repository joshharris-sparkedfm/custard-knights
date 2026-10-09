'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(__dirname,'results','chaos-events'));
fs.mkdirSync(out,{recursive:true});
const packaged=process.argv.includes('--packaged'),archive=path.join(root,'dist/Custard Knights-win32-x64/resources/app.asar');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),packaged?'ck-soundtrack-browser-':'ck-chaos-events-')),profile=path.join(temporary,'chrome');
let chrome,diagnostics='';
if(packaged){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;chrome=spawn(require('electron'),[path.join(__dirname,'soundtrack-electron.cjs'),'--qa-archive='+archive,'--qa-profile='+profile,'--remote-debugging-port=0','--mute-audio','--autoplay-policy=no-user-gesture-required'],{env,stdio:['ignore','ignore','pipe'],windowsHide:true});chrome.stderr.on('data',data=>{diagnostics+=data;});}
else chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--window-size=1440,1000','--remote-debugging-port=0','--user-data-dir='+profile,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let ws;const errors=[];
(async()=>{
 const asar=packaged?await import('@electron/asar'):null;
 const content=file=>packaged?asar.extractFile(archive,file):fs.readFileSync(path.join(root,file));
 const hash=bytes=>require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 const archiveSha256=packaged?hash(fs.readFileSync(archive)):null;
 const gameUrl=packaged?'custard://game/index.html?qa=1':require('node:url').pathToFileURL(path.join(root,'index.html')).href+'?qa=1';
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{const match=/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/.exec(diagnostics);if(match){port=+match[1];break;}await sleep(100);}}
 if(!port)throw Error('QA browser did not start: '+diagnostics);
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(method+' timeout'));},30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const loadedSourceHashes=Object.fromEntries(['index.html','game/weapons.js','game/chaos.js','game/preferences.js','audio/soundtrack.js','audio/13-oh-nae-nae-whats-your-name.wav'].map(file=>[file,hash(content(file))]));
 await send('Runtime.enable');await send('Page.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source: `(()=>{const NativeAudio=window.Audio;window.__chaosAudio={audios:[],errors:[],plays:0,loads:0};window.Audio=new Proxy(NativeAudio,{construct(target,args){const a=Reflect.construct(target,args);__chaosAudio.audios.push(a);a.addEventListener('play',()=>__chaosAudio.plays++);a.addEventListener('loadstart',()=>__chaosAudio.loads++);a.addEventListener('error',()=>__chaosAudio.errors.push({src:a.currentSrc,code:a.error?.code}));return a;}});})();`});await send('Page.navigate',{url:gameUrl});
 for(let i=0;i<100;i++){if(await run('!!window.CK'))break;await sleep(100);}
 const migration=[];
 if(packaged){migration.push({name:'Frozen archive loads through custard protocol with renderer isolation',pass:await run("location.origin==='custard://game'&&typeof require==='undefined'&&typeof process==='undefined'")});migration.push({name:'Packaged QA runner blocks external network',pass:await run("(async()=>{try{await fetch('https://example.com/');return false;}catch{return true;}})()")});}
 for(const legacy of ['fast','unhinged']){
  await run('localStorage.setItem("ck-cfg",JSON.stringify({chaosSpeed:'+JSON.stringify(legacy)+',diff:"hard"}))');
  await send('Page.navigate',{url:'about:blank'});await send('Page.navigate',{url:gameUrl});
  for(let i=0;i<100;i++){if(await run('!!window.CK'))break;await sleep(100);}
  const loaded=await run('({chaosSpeed:CK.cfg.chaosSpeed,diff:CK.cfg.diff})');migration.push({name:'Actual saved '+legacy+' profile reload migrates chaos without changing difficulty',pass:loaded.chaosSpeed==='insane'&&loaded.diff==='hard',details:loaded});
 }
 await run('CK.freeze(true)');
 const result=await run(fs.readFileSync(path.join(__dirname,'chaos-events.body.js'),'utf8'));
 result.checks.push(...migration);result.browserErrors=errors;result.sourceHashes=loadedSourceHashes;result.weaponSha256=loadedSourceHashes['game/weapons.js'];result.indexSha256=loadedSourceHashes['index.html'];
 if(packaged){result.archiveSha256=archiveSha256;result.packagedVersion=JSON.parse(content('package.json')).version;result.runtime='Hidden Electron using frozen app.asar assets and packaged protocol handler';result.runnerDiagnostics=diagnostics;result.limitations+=' Packaged asset/protocol acceptance uses an isolated Electron QA runner, not the normal executable entry point. The packaged EXE lifecycle is tested separately.';}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
 for(const kind of ['nae','mcginley']){if(await run('typeof qaChaosScene==="function"')){const scene=await run('qaChaosScene('+JSON.stringify(kind)+')');(result.visualScenes||(result.visualScenes=[])).push(scene);if(kind==='mcginley')result.checks.push({name:'Reduced-flash screenshot contains an actual emitted lightning effect',pass:scene.parts.includes('lightning')});const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,kind+'-reduced-flash.png'),Buffer.from(shot.data,'base64'));}}
 const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'rare-event.png'),Buffer.from(screenshot.data,'base64'));console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(x=>!x.pass),errors:errors.length,out}));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
 for(const [file,sha]of Object.entries(loadedSourceHashes))if(hash(content(file))!==sha)throw Error('Source changed during QA: '+file);
 if(packaged&&hash(fs.readFileSync(archive))!==archiveSha256)throw Error('Packaged archive changed during QA');
 if(result.failure||result.checks.some(x=>!x.pass)||errors.length)throw Error('Chaos integration regression failed');
})().catch(error=>{fs.writeFileSync(path.join(out,'failure.txt'),error.stack+'\n');console.error(error);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
