// Live PeerJS acceptance with three isolated Chrome profiles on one machine/network.
// Usage: node qa/network-acceptance.cjs. This does not certify physical controllers or cross-network NAT.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-collection');fs.mkdirSync(OUT,{recursive:true});
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
(async()=>{const b=await browser('Collection UI QA');for(const name of ['collection.js','collection-ui.js'])await b.run(fs.readFileSync(path.join(ROOT,'game',name),'utf8'));const basic=await b.run(fs.readFileSync(path.join(ROOT,'qa/collection-checks.js'),'utf8'));const integrated=await b.run(fs.readFileSync(path.join(ROOT,'qa/collection-integrated-checks.js'),'utf8'));const packet=await b.run(fs.readFileSync(path.join(ROOT,'qa/cup-packet-checks.js'),'utf8'));const r={passed:[...basic.passed,...integrated.passed,...packet.passed]};await b.run("CK.setCollection(CKCollection.savePreset(CKCollection.pin(CK.collection(),'rooster-crown'),2,{helm:'great',plume:'feather',metal:'gold',emblem:'star',color:'#FF5A4E',pose:'steveStrut'}));CK.saveProfile(1,{helm:'great',plume:'feather',metal:'gold',emblem:'star',color:'#FF5A4E',pose:'steveStrut'});0");const beforeCampaign=await b.run('CK.collection().completed');await b.run(fs.readFileSync(path.join(ROOT,'qa/campaign-checks.js'),'utf8'));if(!await b.run('CK.collection().completed==='+String(beforeCampaign+8)+"&&CK.owned('helm','riceGuard')&&CK.owned('pose','steveStrut')"))throw Error('Campaign collection milestones or completion count missing');r.passed.push('Eight scripted campaign completions count once each and grant Rice Guard plus Steve Strut; failed retries do not count');const saved=await b.run('JSON.stringify({collection:CK.collection(),profile:CK.loadProfile(1)})');await b.send('Page.reload');await sleep(250);await b.wait('!!window.CK','reload initialization');if(await b.run('JSON.stringify({collection:CK.collection(),profile:CK.loadProfile(1)})')!==saved)throw Error('Actual page reload changed collection or profile');r.passed.push('Actual page reload preserves collection receipts, pin, third preset and earned outfit');fs.writeFileSync(path.join(OUT,'summary.md'),'# Collection UI checks\n\n'+r.passed.map(x=>'- PASS: '+x).join('\n'));console.log(JSON.stringify(r,null,2));})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
