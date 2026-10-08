// Verify Golden Whisk suppresses the baked steel-blade layer across poses.
// Usage: node qa/weapon-layer-check.cjs
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-weapon-layer-review');fs.mkdirSync(OUT,{recursive:true});
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
(async()=>{const b=await browser('Weapon layer review');await b.run('CK.sprLoadAll()');const result=await b.run(`(()=>{CK.begin({humans:0});CK.sprites(true);const cv=document.createElement('canvas');cv.width=cv.height=320;const c=cv.getContext('2d'),bladeSrc=new Set(Object.values(CK_SPRITES.knight.blades).map(l=>l.u));let calls=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img instanceof HTMLImageElement&&bladeSrc.has(img.src))calls++;return original.call(this,img,...args);};const checked=[];try{for(const face of [Math.PI/2,Math.PI/4,0,-Math.PI/4,-Math.PI/2,Math.PI])for(const stage of ['idle','charge','startup','contact','recovery']){const e=CK.mkKnight({id:42,face,blade:'goldenWhisk',swingKind:'stab',swingDur:.18,swing:stage==='startup'?.155:stage==='contact'?.095:stage==='recovery'?.025:0,charge:stage==='charge'?.5:0});calls=0;CK.withCtx(c,()=>CK.drawKnight(e));if(calls)throw Error('Baked blade blit for whisk '+face+' '+stage);checked.push(face.toFixed(2)+' '+stage);}calls=0;CK.withCtx(c,()=>CK.drawKnight(CK.mkKnight({id:42,face:0,blade:'steel'})));if(!calls)throw Error('Instrumentation control did not detect normal steel blade');return {checked:checked.length,normalSteelBlits:calls,conclusion:'No baked blade atlas is drawn for Golden Whisk across six facings and five phases.'};}finally{CanvasRenderingContext2D.prototype.drawImage=original;}})()`);fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
