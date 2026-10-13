'use strict';
// Isolated actual-Chrome QA. Synthetic pads exercise the normal browser boundary;
// this cannot establish physical-controller, human, network, or Steam acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(process.env.CK_QA_ROOT||path.join(__dirname,'..'));
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'results','home-navigation-2026-10-13'));
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={startedAt:new Date().toISOString(),runtime:{node:process.execPath,chrome:CHROME,root:ROOT},checks:[],consoleErrors:[],limitations:['Actual isolated Chrome with CDP mouse/keyboard and synthetic standard gamepad.','No physical controllers, human usability, external networking, packaged EXE, second Windows PC, or Steam testing.','Fixtures write only to temporary Chrome profiles; the user game and normal saves are untouched.']};
fs.mkdirSync(OUT,{recursive:true});
const children=[],sockets=[];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const sources=['index.html','game/campaign-ui.js','game/mass-battle-ui.js'];
report.sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(f)]));
async function browser(name,fixture){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-home-'+name+'-'));
 const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1600,1000','--force-device-scale-factor=1','--mute-audio','about:blank'],{stdio:'ignore',windowsHide:true});children.push(chrome);
 let port;for(let i=0;i<150;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const target=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);sockets.push(ws);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data),p=pending.get(d.id);if(p){pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.consoleErrors.push({profile:name,details:d.params.exceptionDetails});};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method));},15000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 if(fixture)await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.protocol==='file:'){for(const [k,v] of Object.entries(${JSON.stringify(fixture)}))localStorage.setItem(k,JSON.stringify(v));}`});
 const url=require('node:url').pathToFileURL(path.join(ROOT,'index.html')).href+'?qa=1';
 const waitLoaded=async()=>{for(let i=0;i<150;i++){if(await run('!!window.CK&&!!CK.adventure'))return;await sleep(100);}throw Error('Actual game failed to load');};
 await send('Page.navigate',{url});await waitLoaded();await run('CK.sprLoadAll()');await sleep(300);
 const shot=async tag=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,name+'-'+tag+'.png'),Buffer.from(r.data,'base64'));};
 const click=async selector=>{await run(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'nearest'})`);const r=await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||!e.getClientRects().length)throw Error('Not an enabled visible target: '+${JSON.stringify(selector)});return e.getBoundingClientRect().toJSON()})()`);const x=r.x+r.width/2,y=r.y+r.height/2;for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});await sleep(120);};
 const key=async code=>{const keys={Enter:['Enter',13],Space:[' ',32],Escape:['Escape',27],Tab:['Tab',9],ArrowDown:['ArrowDown',40],ArrowRight:['ArrowRight',39],KeyF:['f',70],KeyJ:['j',74]};const [key,n]=keys[code]||[code,0];for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,code,key,windowsVirtualKeyCode:n});await sleep(100);};
 const focus=selector=>run(`document.querySelector(${JSON.stringify(selector)}).focus()`);
 const state=()=>run(`({active:document.activeElement.id||document.activeElement.textContent.trim().slice(0,70),overlays:[...document.querySelectorAll('.overlay')].filter(e=>!e.hidden).map(e=>e.id||e.className),playing:!!CK.G()&&!CK.G().demo&&!CK.G().over,seats:CK.seats(),cfg:{...CK.cfg}})`);
 const step=async(title,fn)=>{try{const details=await fn(),pass=details===true||!!details?.pass;report.checks.push({profile:name,name:title,pass,details});console.log((pass?'PASS ':'FAIL ')+name+': '+title);if(!pass){await shot('failure-'+report.checks.length);await run('if(CK.massBattle().active())CK.massBattle().close();CK.toMenu()');await sleep(150);}}catch(e){report.checks.push({profile:name,name:title,pass:false,error:e.stack});console.log('FAIL '+title+': '+e.message);await shot('failure-'+report.checks.length);await run('if(CK.massBattle().active())CK.massBattle().close();CK.toMenu()');await sleep(150);}};
 const pad=async button=>{await run(`if(!window.qaPad){window.qaPad={index:0,id:'QA standard pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[qaPad]});}qaPad.buttons[${button}]={pressed:true,value:1}`);await sleep(100);await run(`qaPad.buttons[${button}]={pressed:false,value:0}`);await sleep(100);};
 return {name,send,run,shot,click,key,focus,state,step,pad,waitLoaded};
}
async function main(){
 // Cases are kept in this harness rather than adding runtime test-only hooks.
 const fresh=await browser('fresh');
 await fresh.step('Actual game loads in isolated fresh Chrome profile',async()=>({pass:await fresh.run('!!window.CK'),state:await fresh.state()}));
 await fresh.run('CK.sprLoadAll()');await sleep(300);await fresh.shot('home-1600x1000');
 const {run,send,step,click,key,focus,state,pad,shot}=fresh;
 const visible=id=>run(`!document.getElementById(${JSON.stringify(id)}).hidden`);
 await step('Exactly four primary routes; utilities remain separate',async()=>({pass:await run(`document.querySelectorAll('.home-routes button').length===4&&['tWardrobe','tSettings','tHowto'].every(id=>document.getElementById(id).offsetParent!==null)`),state:await state()}));
 await step('Atlas sprites are loaded before visual capture',async()=>({pass:await run('CK.spritesReady()'),spriteResources:await run(`performance.getEntriesByType('resource').filter(e=>e.name.includes('/sprites/')).map(e=>e.name)`)}));
 await step('Fresh Story names solo adventure without Continue',async()=>({pass:await run(`document.getElementById('homeStoryTitle').textContent==='Story'&&!document.getElementById('homeStorySummary').textContent.includes('Continue')`),title:await run(`document.getElementById('homeStoryTitle').textContent`)}));
 await step('Logical Tab cycle reaches four routes and utilities',async()=>{await focus('#tQuick');const order=['tQuick'];for(let i=0;i<6;i++){await key('Tab');order.push((await state()).active);}return{pass:JSON.stringify(order)===JSON.stringify(['tQuick','tAdventure','tFriends','tFactionBattle','tWardrobe','tSettings','tHowto']),order};});
 const routes=[['tQuick','quickRoute'],['tAdventure','campaignMap'],['tFriends','friendsRoute'],['tFactionBattle','faction']];
 for(const method of ['mouse','keyboard','pad'])for(const [id,target] of routes){
  await step(`${method} opens ${id} and Back restores its focus`,async()=>{
   await focus('#'+id);if(method==='mouse')await click('#'+id);else if(method==='keyboard')await key('Enter');else await pad(0);
   const opened=target==='faction'?await run('CK.massBattle().active()'):await visible(target);const during=await state();
   if(method==='mouse'){if(target==='faction')await click('.ck-battle-setup .ck-battle-actions button:last-child');else if(target==='campaignMap')await click('#campaignMap .campaign-panel > button:last-child');else await click('#'+target+' [data-back]');}else if(method==='keyboard')await key('Escape');else await pad(1);
   await sleep(200);const after=await state();return {pass:opened&&after.overlays.includes('menu')&&after.active===id,during,after};
  });
 }
 for(const [id,target] of [['tWardrobe','wardrobe'],['tSettings','settings'],['tHowto','howto']])await step('Utility '+id+' opens and restores focus',async()=>{await click('#'+id);const opened=await visible(target);await key('Escape');return {pass:opened&&(await state()).active===id,state:await state()};});
 await step('Mouse Story restores clicked trigger after stale Quick focus',async()=>{await focus('#tQuick');await click('#tAdventure');await key('Escape');return{pass:(await state()).active==='tAdventure',state:await state()};});
 await step('Synthetic d-pad spatial navigation visits every primary route',async()=>{await focus('#tQuick');const order=['tQuick'];for(let i=0;i<3;i++){await pad(13);order.push((await state()).active);}return{pass:JSON.stringify(order)===JSON.stringify(['tQuick','tAdventure','tFriends','tFactionBattle']),order};});
 await step('Space activation opens only one route; Escape returns only one level',async()=>{await focus('#tQuick');await key('Space');await click('#tCustom');await key('Escape');const parent=await state();await key('Escape');return{pass:parent.overlays.includes('quickRoute')&&parent.active==='tCustom'&&(await state()).active==='tQuick',parent,home:await state()};});
 await step('Custom rules retain selection and show honest Quick summary',async()=>{await run('localStorage.setItem("ck-played","2")');await click('#tQuick');await click('#tCustom');await click('#setup .seg[data-k="diff"] button[data-v="hard"]');await click('#setup .seg[data-k="arenaSize"] button[data-v="roomier"]');await key('Escape');const text=await run(`document.getElementById('quickSummary').textContent`);await key('Escape');return {pass:await run(`CK.cfg.diff==='hard'&&CK.cfg.arenaSize==='roomier'`)&&/hard/i.test(text)&&/roomier/i.test(text),text};});
 await step('Social custom and online paths return to social origin',async()=>{await click('#tFriends');await click('#friendsCustom');await key('Escape');const custom=await state();await click('#tOnline');await key('Escape');const online=await state();await key('Escape');return{pass:custom.overlays.includes('friendsRoute')&&custom.active==='friendsCustom'&&online.overlays.includes('friendsRoute')&&online.active==='tOnline',custom,online};});
 await step('Browse modes summary is reachable and activated by pad',async()=>{await click('#tQuick');await focus('#tCup');await pad(13);const active=await run(`document.activeElement.tagName`);await pad(0);const open=await run(`document.querySelector('#quickRoute details').open`);await key('Escape');return{pass:active==='SUMMARY'&&open,active,open};});
 await step('Options changes persist through reload',async()=>{await click('#tSettings');await click('#cWhole');await focus('#sMusic');await key('ArrowRight');const saved=await run(`localStorage.getItem('ck-settings')`);await key('Escape');await send('Page.reload');await fresh.waitLoaded();await sleep(200);await click('#tSettings');const after=await run(`({whole:document.getElementById('cWhole').checked,music:+document.getElementById('sMusic').value,saved:localStorage.getItem('ck-settings')})`);await key('Escape');return{pass:after.saved===saved&&after.whole,saved,after};});
 await step('Couch seats survive home route and utility navigation',async()=>{await click('#tFriends');await click('#tParty');await key('KeyF');await key('KeyJ');const before=await run(`[...document.querySelectorAll('#seats .seat.on small')].map(e=>e.textContent)`);await key('Escape');await key('Escape');await click('#tSettings');await key('Escape');await click('#tFriends');await click('#tParty');const after=await run(`[...document.querySelectorAll('#seats .seat.on small')].map(e=>e.textContent)`);await key('Escape');await key('Escape');return{pass:before.length===2&&JSON.stringify(before)===JSON.stringify(after),before,after};});
 await step('Friends Cup starts with two keyboard seats and pause Back works',async()=>{await click('#tFriends');await click('#friendsCup');await key('Enter');await sleep(2300);const seats=await run('CK.seats()'),cup=await run('!!CK.cup()');await key('Escape');const paused=await visible('pause');await key('Escape');const resumed=!(await visible('pause'));await run('CK.toMenu()');await sleep(150);return{pass:cup&&seats?.length===2&&paused&&resumed,seats,cup,paused,resumed};});
 await step('Solo Cup clears couch ownership and uses one solo human',async()=>{await click('#tQuick');await click('#tCup');await sleep(2300);const seats=await run('CK.seats()'),humans=await run('CK.G().ents.filter(e=>e.human&&!e.netId).length'),cup=await run('!!CK.cup()');await run('CK.toMenu()');await sleep(150);return{pass:cup&&seats===null&&humans===1,seats,humans,cup};});
 await step('Quick start uses displayed retained safe rules and results return home',async()=>{await click('#tQuick');const summary=await run(`document.getElementById('quickSummary').textContent`);await click('#quickStart');await sleep(2300);const game=await run(`({mode:CK.G().mode,diff:CK.cfg.diff,arenaSize:CK.G().arenaSize,humanCount:CK.G().ents.filter(e=>e.human).length})`);await key('Escape');await pad(1);const resumed=!(await visible('pause'));await run('CK.G().time=0.01');await sleep(250);const results=await visible('end'),resultFocus=await run('document.getElementById("end").contains(document.activeElement)');await shot('quick-results');await click('#menuBtn');return{pass:game.diff==='hard'&&game.arenaSize==='roomier'&&game.humanCount===1&&resumed&&results&&resultFocus&&(await state()).overlays.includes('menu'),summary,game,results,resultFocus};});
 await step('Quit browser hides unavailable bridge',async()=>({pass:await run(`document.getElementById('tQuit').hidden`)}));
 await step('Quit modal isolates focus and activation, Escape restores Quit focus',async()=>{
  // Browser lacks the custard: protocol. Expose only this existing button to
  // exercise its normal modal handler; no Electron closing is claimed.
  await run(`document.getElementById('tQuit').hidden=false`);await click('#tQuit');
  await focus('#tQuick');const guarded=await state();await run('CK.menuActivate()');const cancelled=await state();await click('#tQuit');
  await key('Tab');const trapped=await run(`document.getElementById('quitDialog').contains(document.activeElement)`);
  await key('Escape');const after=await state();await run(`document.getElementById('tQuit').hidden=true`);
  return{pass:guarded.overlays.includes('quitDialog')&&guarded.active==='quitCancel'&&cancelled.overlays.includes('menu')&&!cancelled.overlays.includes('quickRoute')&&trapped&&after.active==='tQuit'&&await run(`!document.getElementById('menu').inert`),guarded,cancelled,trapped,after};
 });
 for(const [w,h] of [[1280,800],[960,640],[800,600]]){
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
  for(const [id,target] of [['home','menu'],['tQuick','quickRoute'],['tFriends','friendsRoute']]){
   if(id!=='home')await click('#'+id);
   await step(`${w}x${h} ${target} controls visible or scrollable without horizontal clipping`,async()=>{const info=await run(`(()=>{const sc=document.getElementById('${target}');const controls=[...sc.querySelectorAll('button')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length);return{width:innerWidth,height:innerHeight,scroll:sc.scrollHeight>sc.clientHeight,overflow:getComputedStyle(sc).overflowY,controls:controls.map(e=>({id:e.id,text:e.textContent.trim().slice(0,35),rect:e.getBoundingClientRect().toJSON()}))}})()`);return{pass:info.controls.every(e=>e.rect.width>0&&e.rect.left>=-1&&e.rect.right<=w+1&&(e.rect.bottom<=h+1||['auto','scroll'].includes(info.overflow))),info};});
   await shot(`${target}-${w}x${h}`);if(id!=='home')await key('Escape');
  }
 }
 const campaign={version:1,selected:'puddings',difficulty:'hard',assist:true,results:{banquet:{spoons:[true,true,false],attempts:1,best:62,assisted:false}},checkpoint:null,receipts:['qa-only']};
 const returning=await browser('returning',{'ck-campaign-v1':campaign,'ck-cfg':{mode:'flags',diff:'hard',map:'frost',players:4,arenaSize:'roomier',chaosSpeed:'simple'}});
 await returning.step('Returning Story names next objective without changing save settings',async()=>{const info=await returning.run(`({title:document.getElementById('homeStoryTitle').textContent,summary:document.getElementById('homeStorySummary').textContent,save:CK.adventure.campaign.save})`);return{pass:info.title==='Continue Story'&&/Protect the Puddings/.test(info.summary)&&info.save.difficulty==='hard'&&info.save.assist,info};});
 await returning.shot('home-1600x1000');
 await returning.step('Returning Story opens remembered unlocked destination',async()=>{await returning.click('#tAdventure');const info=await returning.run(`({selected:document.querySelector('#campaignMap .campaign-node[aria-pressed="true"]').textContent,save:CK.adventure.campaign.save})`);await returning.key('Escape');return{pass:info.save.selected==='puddings'&&(await returning.state()).active==='tAdventure',info};});
 report.environment={platform:process.platform,arch:process.arch,node:process.version,browser:await run('navigator.userAgent')};
}
const watchdog=setTimeout(()=>{report.failure='240 second watchdog';finish();process.exit(1);},240000);
function finish(){report.finishedAt=new Date().toISOString();report.sourceHashesAfter=Object.fromEntries(sources.map(f=>[f,hash(f)]));fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');sockets.forEach(ws=>ws.close());children.forEach(c=>c.kill());}
main().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(watchdog);finish();if(report.checks.some(c=>!c.pass))process.exitCode=1;});
