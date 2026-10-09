'use strict';
// Native Chromium media/decode checks. Audio is silenced at the browser output only;
// HTMLAudioElement, play(), timers, scene routing and WebAudio decoders stay native.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_RUNTIME_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||'qa/results/soundtrack-browser');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'ck-soundtrack-browser-'));
const report={date:new Date().toISOString(),checks:[],tracks:[],errors:[],sourceHashes:{},limitations:'One headless Chromium instance using native HTMLAudioElement playback and WebAudio decoding over a local HTTP server. Browser output is silenced. Autoplay is explicitly permitted for repeatable functional testing. No auditory-quality, physical-speaker, human listening, loop-seam or packaged Electron acceptance claim.'};
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let server,chrome,ws;
const timeout=setTimeout(()=>{report.failure='Soundtrack browser exceeded 180 seconds';fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));chrome?.kill();process.exit(1);},180000);
async function hash(file){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
function wavInfo(file){
 const fd=fs.openSync(file,'r'),size=fs.fstatSync(fd).size;try{
  const header=Buffer.alloc(12);fs.readSync(fd,header,0,12,0);if(header.toString('ascii',0,4)!=='RIFF'||header.toString('ascii',8,12)!=='WAVE')throw Error('Not a RIFF/WAVE: '+file);
  let format,dataBytes;for(let offset=12;offset+8<=size;){const chunk=Buffer.alloc(8);fs.readSync(fd,chunk,0,8,offset);const length=chunk.readUInt32LE(4),tag=chunk.toString('ascii',0,4);if(offset+8+length>size)throw Error('Truncated WAV chunk: '+file);
   if(tag==='fmt '){if(length<16)throw Error('Invalid WAV format');const bytes=Buffer.alloc(16);fs.readSync(fd,bytes,0,16,offset+8);format={format:bytes.readUInt16LE(0),channels:bytes.readUInt16LE(2),sampleRate:bytes.readUInt32LE(4),blockAlign:bytes.readUInt16LE(12),bitsPerSample:bytes.readUInt16LE(14)};}
   if(tag==='data')dataBytes=length;offset+=8+length+(length%2);
  }
  if(!format||!dataBytes||!format.blockAlign||!format.sampleRate)throw Error('Missing WAV dimensions: '+file);
  return {...format,dataBytes,frames:dataBytes/format.blockAlign,duration:dataBytes/format.blockAlign/format.sampleRate};
 }finally{fs.closeSync(fd);}
}
function serve(req,res){
 try{
  const target=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(target!==ROOT&&!target.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
  const file=fs.statSync(target).isDirectory()?path.join(target,'index.html'):target,stat=fs.statSync(file);
  const types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.wav':'audio/wav','.mp3':'audio/mpeg','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp'};
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'};
  const range=req.headers.range&&/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);let start=0,end=stat.size-1;
  if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end){res.writeHead(416).end();return;}headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;}
  headers['Content-Length']=end-start+1;res.writeHead(range?206:200,headers);if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{res.writeHead(404).end();}
}
async function main(){
 const tracks=JSON.parse(fs.readFileSync(path.join(ROOT,'audio/tracks.json'),'utf8'));
 for(const file of ['index.html','audio/tracks.json','audio/soundtrack.js','menu-theme.mp3',...tracks.filter(t=>t.id!=='menu').map(t=>'audio/'+t.file)])report.sourceHashes[file]=await hash(path.join(ROOT,file));
 server=http.createServer(serve);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+path.join(temporary,'chrome'),'--window-size=1280,800','--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(temporary,'chrome','DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);const task=pending.get(d.id);if(task){pending.delete(d.id);d.error?task.reject(Error(JSON.stringify(d.error))):task.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass)=>{report.checks.push({name,pass:!!pass});if(!pass)throw Error(name);console.log('PASS '+name);};
 const until=async(expression,ms=8000)=>{const end=Date.now()+ms;while(Date.now()<end){if(await run(expression))return true;await sleep(50);}return false;};
 await send('Runtime.enable');await send('Page.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const NativeAudio=window.Audio;const qa=window.__soundtrackQA={audios:[],errors:[],maxPlaying:0};qa.sample=()=>{qa.maxPlaying=Math.max(qa.maxPlaying,qa.audios.filter(a=>!a.paused&&!a.ended).length);};window.Audio=new Proxy(NativeAudio,{construct(target,args){const a=Reflect.construct(target,args);qa.audios.push(a);a.addEventListener('error',()=>qa.errors.push({src:a.currentSrc,code:a.error&&a.error.code,message:a.error&&a.error.message}));for(const event of ['play','playing','pause','volumechange'])a.addEventListener(event,qa.sample);return a;}});setInterval(qa.sample,25);})();`});
 await send('Page.navigate',{url:origin+'/index.html?qa=1'});
 check('Integrated game loads with the native music element observed before startup',await until('!!(window.CK&&CK.cueMusic&&window.__soundtrackQA&&window.__soundtrackQA.audios.length)',15000));
 check('All 12 soundtrack slots are enabled',await run('Object.keys(CK_SOUNDTRACK).length===12&&Object.values(CK_SOUNDTRACK).every(s=>typeof s===\'string\'&&s.length>0)'));
 check('Original menu MP3 remains the menu source',await run('CK_SOUNDTRACK.menu===\'menu-theme.mp3\''));
 await run(`document.getElementById('sMusic').value='37';document.getElementById('sMusic').dispatchEvent(new Event('input'));`);
 for(const track of tracks){
  const file=track.id==='menu'?'menu-theme.mp3':'audio/'+track.file,expected=track.id==='menu'?null:wavInfo(path.join(ROOT,file));
  check(track.id+': catalog selects the expected local file',await run(`CK_SOUNDTRACK[${JSON.stringify(track.id)}]===${JSON.stringify(file)}`));
  await run(`CK.cueMusic(${JSON.stringify(track.id)})`);
  check(track.id+': native media loads and starts playback',await until(`(()=>{const a=__soundtrackQA.audios[0];return CK.musicState().cue===${JSON.stringify(track.id)}&&a.getAttribute('src')===${JSON.stringify(file)}&&!a.paused&&a.readyState>=2&&Number.isFinite(a.duration)&&a.duration>0&&!a.error;})()`));
  const before=await run('__soundtrackQA.audios[0].currentTime');const advanced=await until('__soundtrackQA.audios[0].currentTime>'+JSON.stringify(before+.1));const media=await run('(()=>{const a=__soundtrackQA.audios[0];return {duration:a.duration,currentTime:a.currentTime,readyState:a.readyState,volume:a.volume,loop:a.loop,paused:a.paused,instances:__soundtrackQA.audios.length,maxPlaying:__soundtrackQA.maxPlaying};})()');
  const trackRecord={id:track.id,file,bytes:fs.statSync(path.join(ROOT,file)).size,sha256:report.sourceHashes[file],source:expected,before,media};report.tracks.push(trackRecord);
  check(track.id+': native playback clock advances without overlapping music',advanced&&media.currentTime>before+.1&&media.instances===1&&media.maxPlaying===1&&!media.paused&&media.loop);
  let decoded=null;if(expected){
   decoded=await run(`(async()=>{const bytes=await(await fetch(${JSON.stringify(file)})).arrayBuffer();const context=new OfflineAudioContext(${expected.channels},1,${expected.sampleRate});const buffer=await context.decodeAudioData(bytes);return {channels:buffer.numberOfChannels,sampleRate:buffer.sampleRate,frames:buffer.length,duration:buffer.duration};})()`);
   check(track.id+': native WAV decode matches source channels, sample rate and duration',decoded.channels===expected.channels&&decoded.sampleRate===expected.sampleRate&&Math.abs(decoded.frames-expected.frames)<=1&&Math.abs(decoded.duration-media.duration)<.1);
  }
  trackRecord.decoded=decoded;
 }
 check('Music fade obeys the selected 37 percent volume',await until('Math.abs(__soundtrackQA.audios[0].volume-.37)<.001'));
 await run(`document.getElementById('muteBtn').click()`);check('Sound mute pauses music',await until('__soundtrackQA.audios[0].paused'));
 const mutedTime=await run('__soundtrackQA.audios[0].currentTime');await sleep(250);check('Muted music clock remains stopped',await run(`Math.abs(__soundtrackQA.audios[0].currentTime-${mutedTime})<.03`));
 await run(`CK.cueMusic('courtyard')`);await sleep(150);check('Changing scenes while muted does not restart music',await run('__soundtrackQA.audios[0].paused&&CK.musicState().cue===\'courtyard\''));
 await run(`document.getElementById('muteBtn').click()`);check('Unmute resumes the current scene at the saved volume',await until('!__soundtrackQA.audios[0].paused&&Math.abs(__soundtrackQA.audios[0].volume-.37)<.001'));
 await run(`document.getElementById('sMusic').value='0';document.getElementById('sMusic').dispatchEvent(new Event('input'));`);await sleep(120);check('Zero music volume stays silent',await run('__soundtrackQA.audios[0].volume===0'));
 await run(`document.getElementById('sMusic').value='23';document.getElementById('sMusic').dispatchEvent(new Event('input'));`);check('Live volume changes take effect without a second music instance',await run('Math.abs(__soundtrackQA.audios[0].volume-.23)<.001&&__soundtrackQA.audios.length===1'));
 await run(`CK.cueMusic(null)`);check('Stopping a cue fades to silence and pauses',await until('__soundtrackQA.audios[0].paused&&__soundtrackQA.audios[0].volume===0&&!CK.musicState().wanted'));
 for(const [name,action,cue] of [['Wardrobe',`CK.openWardrobe()`,'wardrobe'],['Menu',`CK.toMenu()`,'menu'],['Faction Front',`CK.massBattle().open()`,'courtyard'],['Faction exit',`CK.massBattle().close()`,'menu'],['Arena race',`CK.cfg.mode='race';CK.cfg.map='roof';CK.start()`,'race'],['Arena hot pie',`CK.toMenu();CK.cfg.mode='hotpie';CK.start()`,'hotpie'],['Arena frost',`CK.toMenu();CK.cfg.mode='ffa';CK.cfg.map='frost';CK.start()`,'frost'],['Return to menu',`CK.toMenu()`,'menu']]){
  await run(action);check(name+': scene routes to its assigned track',await until(`CK.musicState().cue===${JSON.stringify(cue)}&&__soundtrackQA.audios[0].getAttribute('src')===CK_SOUNDTRACK[${JSON.stringify(cue)}]&&!__soundtrackQA.audios[0].paused`));
 }
 report.mediaErrors=await run('__soundtrackQA.errors');report.musicInstances=await run('__soundtrackQA.audios.length');report.maximumConcurrentMusic=await run('__soundtrackQA.maxPlaying');
 check('Exactly one native music instance throughout slot and scene changes',report.musicInstances===1&&report.maximumConcurrentMusic===1);
 check('No native media errors or browser exceptions',report.mediaErrors.length===0&&report.errors.length===0);
 for(const [file,sha]of Object.entries(report.sourceHashes))check('Source unchanged during QA: '+file,await hash(path.join(ROOT,file))===sha);
 await run('CK.cueMusic(null)');
}
main().catch(error=>{report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);ws?.close();chrome?.kill();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');});
