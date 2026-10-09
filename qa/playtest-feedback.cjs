'use strict';
// Exercise the shipped offline form, including real download and blocked-download fallback.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const input=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-feedback-')),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={checks:[],errors:[],network:[],limitations:'Headless Chrome with synthetic form input. No human usability or OS launch acceptance.'};
fs.mkdirSync(out,{recursive:true});
const previousDownloads=new Set(fs.readdirSync(out));
const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
let ws;
const timeout=setTimeout(()=>{chrome.kill();process.exit(1);},45000);
async function main(){
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome did not start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);if(d.method==='Network.requestWillBeSent')report.network.push(d.params.request.url);const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass)=>{report.checks.push({name,pass:!!pass});if(!pass)throw Error(name);};
 await send('Runtime.enable');await send('Network.enable');await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:out});
 await send('Page.navigate',{url:require('node:url').pathToFileURL(input).href});
 for(let i=0;i<50;i++){if(await run('!!document.getElementById("feedback")'))break;await sleep(100);}
 const expected=JSON.parse(fs.readFileSync(path.join(path.dirname(input),'BUILD-INFO.json'),'utf8'));
 check('Frozen version and source are shown',await run(`document.getElementById('build').textContent.includes(${JSON.stringify(expected.version)})&&document.getElementById('build').textContent.includes(${JSON.stringify(expected.sourceCommit.slice(0,12))})`));
 const hostile='</textarea><script>window.injected=true</script> & 🐔';
 await run(`document.getElementById('alias').value='QA only';document.getElementById('minutes').value='20';document.getElementById('steps').value=${JSON.stringify(hostile)};document.querySelector('[value="Story"]').checked=true;document.querySelector('[value="Faction CTF"]').checked=true;document.getElementById('feedback').requestSubmit();`);
 let downloaded;for(let i=0;i<80;i++){downloaded=fs.readdirSync(out).find(f=>!previousDownloads.has(f)&&f.startsWith('custard-knights-feedback-')&&f.endsWith('.json'));if(downloaded)break;await sleep(100);}
 check('Actual JSON download completes',downloaded);
 const data=JSON.parse(fs.readFileSync(path.join(out,downloaded),'utf8'));
 check('Report identifies exact packaged runtime',data.build.appAsarSha256===expected.appAsarSha256&&data.build.sourceZipSha256===expected.sourceZipSha256&&data.build.sourceCommit===expected.sourceCommit);
 check('Unicode and markup remain literal feedback, not executable HTML',data.answers.steps===hostile&&!(await run('!!window.injected')));
 check('Multiple modes and numeric input survive export',data.answers.modes.join(',')==='Story,Faction CTF'&&data.answers.minutes==='20');
 check('Copy fallback equals downloaded JSON',await run('document.getElementById("report").value')===JSON.stringify(data,null,2));
 await run("document.getElementById('feedback').reset();document.getElementById('minutes').value='-1';window.beforeInvalid=document.getElementById('report').value;document.getElementById('feedback').requestSubmit();");
 check('Invalid duration does not export a misleading report',await run("!document.getElementById('minutes').checkValidity()&&document.getElementById('report').value===window.beforeInvalid"));
 await run("document.getElementById('feedback').reset();URL.createObjectURL=()=>{throw Error('Download unavailable')};document.getElementById('feedback').requestSubmit();");
 check('Empty optional survey works when downloads are blocked',await run("document.getElementById('status').textContent.includes('Copy the report')&&!document.getElementById('fallback').hidden&&JSON.parse(document.getElementById('report').value).answers.modes.length===0"));
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 check('Narrow window has no horizontal page overflow',await run('document.documentElement.scrollWidth<=innerWidth'));
 check('No HTTP requests, uploads or telemetry',report.network.every(url=>url.startsWith('file:')||url.startsWith('blob:')));
 check('No browser exceptions',report.errors.length===0);
}
main().catch(error=>{report.failure=error.stack;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));clearTimeout(timeout);ws?.close();chrome.kill();});
