// Actual renderer contact sheets and combat presentation acceptance.
// Usage: node qa/animation-review.cjs refined [classic]
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),browsers=[],passed=[];
const OUT=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-animation-'+(process.argv[2]||'review')+'-'+(process.argv[3]||'sprite'));fs.mkdirSync(OUT,{recursive:true});
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
(async()=>{const b=await browser('Animation review');await b.run('CK.sprLoadAll()');await b.run('CK.sprites('+(process.argv[3]!=='classic')+');0');
 const result=await b.run(fs.readFileSync(path.join(__dirname,'animation-checks.js'),'utf8'));for(const label of result.passed)check(true,label);fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify(result,null,2));await b.run('CK.sprites('+(process.argv[3]!=='classic')+');0');await b.send('Emulation.setDeviceMetricsOverride',{width:1500,height:1550,deviceScaleFactor:1,mobile:false});
 await b.run(`(()=>{const cv=document.createElement('canvas');cv.width=1500;cv.height=1550;cv.style.cssText='position:fixed;inset:0;z-index:100000';document.body.append(cv);const x=cv.getContext('2d');x.fillStyle='#EEDAB6';x.fillRect(0,0,1500,1550);CK.begin({humans:0,map:'courtyard',mode:'ffa'});const g=CK.G();g.clock=1;g.over=false;
 const rows=[['Light','light',.22],['Heavy','heavy',.3],['Dash-stab','stab',.18],['Shield bash','bash',.18]];
 for(let j=0;j<4;j++){const [label,kind,dur]=rows[j];for(let k=0;k<5;k++){const el=[.025,.059,.085,dur-.061,dur-.025][k],e=CK.mkKnight({id:42,face:0,swingKind:kind,swingDur:dur,swing:dur-el,heavyReach:kind==='heavy'}),px=150+k*300,py=65+j*220;x.fillStyle='#291A33';x.font='bold 18px Arial';x.fillText(label+' '+Math.round(el*1000)+'ms',px-130,py-32);x.font='14px Arial';x.fillText(el>.06&&el<dur-.06?'CONTACT WINDOW':el<=.06?'ANTICIPATION':'RECOVERY',px-130,py-12);CK.withCtx(x,()=>{x.save();x.translate(px,py+95);x.scale(1.25,1.25);CK.drawKnight(e);x.restore();});}}
 const extras=[['Charge',{charge:.6}],['Dash',{vx:680,dashT:.1}],['Hitstun',{stun:.3}],['Guard broken',{guardLock:.5,guard:0}],['Whiff',{whiffT:.18}]];
 extras.forEach(([label,patch],k)=>{const px=150+k*300,py=1030;x.fillStyle='#291A33';x.font='bold 18px Arial';x.fillText(label,px-125,py-22);const e=CK.mkKnight({id:42,face:0,...patch});CK.withCtx(x,()=>{x.save();x.translate(px,py+100);x.scale(1.25,1.25);CK.drawKnight(e);x.restore();});});
 for(let k=0;k<5;k++){const px=150+k*300,py=1280,e=CK.mkKnight({id:42,face:[Math.PI/2,0,-Math.PI/2,Math.PI,-Math.PI/4][k],kit:{helm:'roosterCrown',plume:'feather',metal:'steel'},blade:'goldenWhisk',cape:'teaTowel',swingKind:'stab',swingDur:.18,swing:.095});x.fillStyle='#291A33';x.font='bold 18px Arial';x.fillText('Whisk + crown '+k,px-125,py-22);CK.withCtx(x,()=>{x.save();x.translate(px,py+115);x.scale(1.25,1.25);CK.drawKnight(e);x.restore();});}return true;})()`);
 const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,'animation-filmstrip.png'),Buffer.from(shot.data,'base64'));console.log(path.join(OUT,'animation-filmstrip.png'));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const b of browsers){try{b.ws?.close();b.child.kill();}catch{}}});
