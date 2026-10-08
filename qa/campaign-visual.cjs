// Render the chapter map, story card and boss telegraph for visual inspection.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),inputTest=process.argv.includes('--input'),output=path.join(__dirname,'results',new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+(inputTest?'-campaign-input':'-campaign-visual'));fs.mkdirSync(output,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-campaign-visual-')),chrome=spawn(process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1600,1000','--hide-scrollbars','--mute-audio','about:blank'],{stdio:'ignore'});
process.on('exit',()=>{try{chrome.kill();}catch{}});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let port;for(let i=0;i<60;i++){try{port=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const target=(await (await fetch('http://127.0.0.1:'+port+'/json')).json()).find(t=>t.type==='page'),ws=new WebSocket(target.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.navigate',{url:'file:///'+path.join(root,'index.html').replace(/\\/g,'/')+'?qa=1'});for(let i=0;i<50;i++){if(await evaluate('!!window.CK'))break;await sleep(100);}
 if(inputTest){const result=await evaluate(fs.readFileSync(path.join(__dirname,'campaign-input-checks.js'),'utf8'));fs.writeFileSync(path.join(output,'raw.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(output,'summary.md'),'# Campaign input acceptance\n\n'+result.method+'\n\n'+result.checks.map(c=>'- PASS: '+c).join('\n')+'\n\n| Encounter | Assistance | Result | Simulated seconds | Accepted hits | Falls |\n|---|---|---|---:|---:|---:|\n'+result.runs.map(r=>'| '+r.id+' | '+r.assisted+' | '+r.status+' | '+r.elapsed+' | '+r.hits+' | '+r.falls+' |').join('\n')+'\n');console.log(JSON.stringify(result,null,2));console.log(output);ws.close();chrome.kill();return;}
 const capture=async name=>{await sleep(150);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));};
 await evaluate('CK.adventure.open();CK.freeze(true);0');await capture('chapter-map');
 await evaluate('CK.adventure.ui.brief("banquet");0');await capture('banquet-story');
 await evaluate('const s=CKCampaign.normalize({});for(const n of CKCampaign.nodes)s.results[n.id]={spoons:[true,false,false],attempts:1,best:90,assisted:false};CK.adventure.campaign.restore(s);CK.adventure.launch("rind",false);CK.freeze(true);CK.G().ents[0].x=620;CK.G().ents[0].y=440;CK.adv(146);0');await capture('rind-telegraph');
 await evaluate('CK.adv(30);0');await capture('rind-warning-middle');
 await evaluate('CK.adv(30);0');await capture('rind-warning-late');
 await evaluate('CK.keys.KeyS=true;CK.keys.ShiftLeft=true;CK.adv(16);CK.keys.KeyS=false;CK.keys.ShiftLeft=false;0');await capture('rind-impact');
 await evaluate('CK.adv(20);0');await capture('rind-recovery');
 await evaluate('CK.adventure.launch("stirling",false);CK.freeze(true);CK.adv(50);0');await capture('examiner-warning');
 await evaluate('const pie=CK.adventure.campaign.save;pie.checkpoint={id:"stirling",phase:2};CK.adventure.campaign.restore(pie);CK.adventure.launch("stirling",true);CK.freeze(true);CK.G().ents[0].x=640;CK.G().ents[0].y=440;CK.G().ents[1].x=700;CK.G().ents[1].y=440;CK.adv(1);0');await capture('pie-contested');
 await evaluate('const cp=CK.adventure.campaign.save;cp.checkpoint={id:"rind",phase:1};CK.adventure.campaign.restore(cp);CK.adventure.launch("rind",true);CK.freeze(true);CK.hurt(CK.G().ents[0],CK.G().ents[1],99,{force:true});CK.adv(1);0');await capture('checkpoint-retry');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('CK.adventure.open();0');await capture('chapter-map-mobile');
 await evaluate('document.querySelector("#campaignMap .campaign-brief").scrollIntoView();0');await capture('chapter-map-mobile-objective');
 console.log(output);ws.close();chrome.kill();
})().catch(e=>{console.error(e);process.exitCode=1;chrome.kill();});
