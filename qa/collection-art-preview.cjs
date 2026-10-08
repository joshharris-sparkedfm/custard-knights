// Live PeerJS acceptance with three isolated Chrome profiles on one machine/network.
// Usage: node qa/network-acceptance.cjs. This does not certify physical controllers or cross-network NAT.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-collection-art');fs.mkdirSync(OUT,{recursive:true});
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
(async()=>{const b=await browser('Costume visual QA');await b.run(fs.readFileSync(path.join(ROOT,'game/collection.js'),'utf8'));await b.run(fs.readFileSync(path.join(ROOT,'game/collection-art.js'),'utf8'));await b.run('CK.sprLoadAll()');
 await b.send('Emulation.setDeviceMetricsOverride',{width:1200,height:1350,deviceScaleFactor:1,mobile:false});
 await b.run(`(()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=1350;cv.style.cssText='position:fixed;inset:0;z-index:100000';document.body.append(cv);const x=cv.getContext('2d');x.fillStyle='#EEDAB6';x.fillRect(0,0,1200,1350);CK.freeze(true);const thumb=document.createElement('canvas');thumb.width=340;thumb.height=175;const base={helm:'great',plume:'feather',metal:'steel',emblem:'star',color:'#FF5A4E',cape:'plain',blade:'steel',chick:'hen',pose:'plain'};
 CKCollection.items.forEach((it,j)=>{const y=30+j*218;x.fillStyle='#291A33';x.font='bold 24px Arial';x.fillText(it.name,30,y);for(let k=0;k<3;k++){const p={...base,[it.kind]:it.value};CK.drawCollectionPreview(thumb,p,{time:1.2,pose:true,face:[Math.PI/2,0,-Math.PI/2][k]});x.drawImage(thumb,25+k*395,y+10);x.font='14px Arial';x.fillStyle='#291A33';x.fillText(['Front','Side','Back'][k],170+k*395,y+203);}});return true;})()`);
 const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,'collection-art.png'),Buffer.from(shot.data,'base64'));console.log(path.join(OUT,'collection-art.png'));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
