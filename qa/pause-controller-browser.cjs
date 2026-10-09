'use strict';
// Real browser pad polling/menu focus. Only match launch and a standard pad are fixtures.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_RUNTIME_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-pause-controller'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-pause-pad-')),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'index.html'))).digest('hex');
const report={date:new Date().toISOString(),runtimeRoot:ROOT,indexSha256:hash(),checks:[],errors:[],limitations:'Synthetic standard gamepad in headless Chrome; real game loop, focus and actions. Match launches are fixtures; no damage, positions, timers, rules or progress are injected. Not physical hardware or Electron shell acceptance.'};
fs.mkdirSync(OUT,{recursive:true});
const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});
let ws;const watchdog=setTimeout(()=>{console.error('Pause browser review timed out');chrome.kill();process.exit(1);},60000);
async function main(){
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass)=>{report.checks.push({name,pass:!!pass});if(!pass)throw Error(name);console.log('PASS '+name);};
 const pad=async index=>run(`(async()=>{const frames=async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);};pauseTestPad.buttons[${index}]={pressed:true,value:1};await frames(3);pauseTestPad.buttons[${index}]={pressed:false,value:0};await frames(3);})()`);
 await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href+'?qa=1'});
 let loaded=false;for(let i=0;i<100;i++){if(await run('!!window.CK')){loaded=true;break;}await sleep(100);}check('Game loads with opt-in QA',loaded);
 await run('CK.sprLoadAll()');
 await run(`window.pauseTestPad={index:0,id:'Synthetic pause acceptance pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pauseTestPad]});`);
 const launches={arena:'CK.cfg.players=1;CK.start()',story:"CK.adventure.launch('banquet')",cup:'CK.cfg.players=1;CK.startCup()'};
 for(const [format,launch]of Object.entries(launches)){
  await run('CK.toMenu();'+launch);await sleep(100);
  check(format+' starts a live match',await run(`!CK.G().demo&&!CK.G().over&&${format==='story'?"CK.G().mode==='campaign'":format==='cup'?'!!CK.cup()':'true'}`));
  await pad(9);check(format+' Menu opens pause and focuses Resume',await run("!document.getElementById('pause').hidden&&document.activeElement.id==='resumeBtn'"));
  const before=await run('CK.G().time');await sleep(150);check(format+' pause stops the actual match timer',await run('CK.G().time')===before);
  await pad(0);check(format+' A on Resume closes pause',await run("document.getElementById('pause').hidden&&!CK.G().demo"));
  await sleep(100);check(format+' simulation resumes',await run('CK.G().time')<before);
  await pad(9);await pad(1);check(format+' B resumes without quitting',await run("document.getElementById('pause').hidden&&!CK.G().demo"));
  await pad(9);await pad(9);check(format+' Menu resumes without quitting',await run("document.getElementById('pause').hidden&&!CK.G().demo"));
  await pad(9);await pad(15);check(format+' D-pad right selects Quit',await run("document.activeElement.id==='quitBtn'&&!document.getElementById('pause').hidden"));
  check(format+' controller selection has a visible focus outline',await run("document.body.dataset.input==='pad'&&parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=3"));
  fs.writeFileSync(path.join(OUT,format+'-quit-focused.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await pad(0);check(format+' A activates Quit and restores main menu',await run("!document.getElementById('menu').hidden&&document.getElementById('pause').hidden&&CK.G().demo"));
  check(format+' leaves no active campaign or Cup',await run('!CK.cup()&&!CK.adventure.campaign.run'));
 }
 check('No browser runtime exceptions',report.errors.length===0);check('Runtime source stayed unchanged during review',hash()===report.indexSha256);
}
main().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(OUT);clearTimeout(watchdog);ws?.close();chrome.kill();});
