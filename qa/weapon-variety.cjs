'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(__dirname,'results','weapon-variety'));
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-weapon-variety-'));
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--window-size=1440,1000','--remote-debugging-port=0','--user-data-dir='+profile,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let ws;const errors=[];
(async()=>{
 let port;for(let i=0;i<80;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}
 if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(method+' timeout'));},30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:25000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const loadedSourceHashes=Object.fromEntries(['index.html','game/weapons.js'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
 await send('Runtime.enable');await send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(root,'index.html')).href+'?qa=1'});
 for(let i=0;i<100;i++){if(await run('!!window.CK'))break;await sleep(100);}
 await run('CK.freeze(true)');
 const result=await run(fs.readFileSync(path.join(__dirname,'weapon-variety.body.js'),'utf8'));
 result.browserErrors=errors;result.sourceHashes=loadedSourceHashes;result.weaponSha256=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'game/weapons.js'))).digest('hex');result.indexSha256=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
 const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'weapons.png'),Buffer.from(screenshot.data,'base64'));console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(x=>!x.pass),errors:errors.length,out}));
 if(result.indexSha256!==loadedSourceHashes['index.html']||result.weaponSha256!==loadedSourceHashes['game/weapons.js'])throw Error('Source changed during QA');
 if(result.checks.some(x=>!x.pass)||errors.length)throw Error('Weapon regression failed');
})().catch(error=>{fs.writeFileSync(path.join(out,'failure.txt'),error.stack+'\n');console.error(error);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
