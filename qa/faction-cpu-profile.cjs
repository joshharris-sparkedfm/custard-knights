// Actual faction renderer CPU sampling. Usage: node qa/faction-cpu-profile.cjs
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(process.env.CK_RUNTIME_ROOT||path.join(__dirname,'..')),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-faction-cpu');fs.mkdirSync(OUT,{recursive:true});
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
 b.send=send;b.run=async(expression)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(name+': '+JSON.stringify(r.exceptionDetails));return r.result.value;};
 b.wait=async(expr,label)=>{for(let i=0;i<100;i++){if(await b.run(expr))return;await sleep(200);}throw Error(name+': '+label);};
 await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 await b.wait('!!window.CK','game load');await b.run(`document.getElementById('nameIn').value=${JSON.stringify(name)};CK.freeze(true);0`);return b;
}
(async()=>{const b=await browser('Faction CPU profile');await b.run('CK.sprLoadAll()');await b.send('Emulation.setDeviceMetricsOverride',{width:1600,height:950,deviceScaleFactor:1,mobile:false});await b.run(`CK.massBattle().qa.startPractice({mode:'brawl',teamSize:50});(()=>{const s=CK.massBattle().qa.practiceState(),p=s.players.find(x=>x.humanId==='local');p.x=1600;p.y=900;p.protection=999;for(let k=0;k<1200;k++)CKMassBattle.step(s,1/60,{});})()`);await sleep(700);await b.send('Profiler.enable');await b.send('Profiler.setSamplingInterval',{interval:1000});await b.send('Profiler.start');await sleep(10000);const {profile}=await b.send('Profiler.stop');const nodes=new Map(profile.nodes.map(n=>[n.id,n]));const totals=new Map();profile.samples.forEach((id,i)=>{const n=nodes.get(id),name=n.callFrame.functionName||'(anonymous)',key=name+' '+n.callFrame.url.split('/').pop()+':'+n.callFrame.lineNumber;totals.set(key,(totals.get(key)||0)+(profile.timeDeltas[i]||0));});const top=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([name,us])=>({name,ms:us/1000}));fs.writeFileSync(path.join(OUT,'cpu-profile.json'),JSON.stringify(profile));fs.writeFileSync(path.join(OUT,'cpu-summary.json'),JSON.stringify(top,null,2));console.log(JSON.stringify(top));console.log(OUT);})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
