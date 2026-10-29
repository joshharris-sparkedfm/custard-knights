// Bot stuck audit: bots-only matches on every arena, both arena sizes and every mode, with a seeded
// Math.random so a before/after comparison replays the same opening. Counts episodes where a bot that
// wants to move stays inside one tile for 3+ seconds (see bot-stuck.body.js for the exact rule).
// Usage: node qa/bot-stuck.cjs [--seeds 2] [--seed0 1] [--seconds 90] [--diff medium] [--maps courtyard,frost] [--modes ffa,kotp] [--out file.json]
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ROOT=path.resolve(process.env.CK_RUNTIME_ROOT||path.join(__dirname,'..')),CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d;};
const SEEDS=Number(arg('seeds',2)),SECONDS=Number(arg('seconds',90)),SEED0=Number(arg('seed0',1)),DIFF=arg('diff','medium');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-stuck-'));
 const child=spawn(CHROME,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore'});
 process.on('exit',()=>{try{child.kill();}catch{}});
 let port;for(let i=0;i<60;i++){try{port=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);break;}catch{await sleep(250);}}
 if(!port)throw Error('Chrome failed to open its debugging port');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x=>x.type==='page');
 const ws=new WebSocket(tab.webSocketDebuggerUrl);let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(method+' timeout'));},300000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:290000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails).slice(0,1500));return r.result.value;};
 await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 const load=async()=>{for(let i=0;i<100&&!await run('!!window.CK').catch(()=>false);i++)await sleep(200);};await load();
 // Sound effects draw noise from Math.random only when the real-time mixer admits them; silence them so seeded runs replay exactly.
 await run("localStorage.setItem('ck-settings',JSON.stringify({sfx:0,music:0}));0");await send('Page.reload');await sleep(300);await load();
 await run('CK.freeze(true);0');
 await run(fs.readFileSync(path.join(__dirname,'bot-stuck.body.js'),'utf8'));
 const maps=arg('maps')?arg('maps').split(','):await run('Object.keys(CK.MAPS)'),modes=arg('modes')?arg('modes').split(','):await run('Object.keys(CK.MODES)');
 const results=[];const t0=Date.now();
 for(const size of ['classic','roomier'])for(const map of maps)for(const mode of modes)for(let seed=SEED0;seed<SEED0+SEEDS;seed++){
  const r=await run(`STUCK(${JSON.stringify({map,mode,size,seed:seed*7919,seconds:SECONDS,diff:DIFF,fallLog:process.argv.includes('--falllog')})})`);results.push(r);
  process.stdout.write(`${size.padEnd(8)} ${map.padEnd(9)} ${mode.padEnd(7)} seed ${seed}  ${String(r.clock).padStart(5)}s  stuck ${r.episodes.length}\n`);
 }
 const out=arg('out',path.join(__dirname,'results','bot-stuck-'+new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'.json'));
 fs.mkdirSync(path.dirname(out),{recursive:true});
 const commit=require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
 fs.writeFileSync(out,JSON.stringify({commit,seeds:SEEDS,seconds:SECONDS,results},null,1));
 const all=results.flatMap(r=>r.episodes),botMin=results.reduce((a,r)=>a+r.botSeconds,0)/60;
 const sum=k=>results.reduce((a,r)=>a+r[k],0);
 console.log(`\nhazards: ${sum('falls')} pit falls (${sum('selfPitKOs')} unforced pit KOs), ${sum('lavaSeconds').toFixed(0)} bot-seconds on lava, ${sum('lavaKOs')} lava KOs; ${sum('kos')} KOs total`);
 const causes={};for(const r of results)for(const [k,v] of Object.entries(r.fallCauses))causes[k]=(causes[k]||0)+v;
 console.log('pit falls by cause:goal:',JSON.stringify(Object.entries(causes).sort((a,b)=>b[1]-a[1])));
 console.log(`sim CPU ${(sum('simMs')/1000).toFixed(1)}s for ${(results.reduce((a,r)=>a+r.clock,0)/60).toFixed(0)} simulated minutes`);
 console.log(`${results.length} matches, ${botMin.toFixed(0)} bot-minutes eligible, ${all.length} stuck episodes, ${all.reduce((a,e)=>a+e.dur,0).toFixed(0)} stuck bot-seconds, ${((Date.now()-t0)/1000).toFixed(0)}s wall`);
 const by=(k)=>{const m={};for(const e of all){const key=k(e);m[key]=(m[key]||0)+1;}return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
 console.log('by map/size:',JSON.stringify(by(e=>e.map+'/'+e.size)));
 console.log('by mode:',JSON.stringify(by(e=>e.mode)));
 console.log('by goal:',JSON.stringify(by(e=>e.goal)));
 console.log('wrote',out);
 ws.close();child.kill();
})().catch(e=>{console.error(e);process.exitCode=1;process.exit(1);});
