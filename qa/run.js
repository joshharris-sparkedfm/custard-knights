// QA harness: runs full simulated matches in headless Chrome with scripted player personas,
// then writes raw results and a summary. Usage:
//   node qa/run.js                 full matrix (every arena x every persona, plus bots-only)
//   node qa/run.js quick           one arena per persona
//   node qa/run.js perf            real-time frame-rate sample on each arena
// Output: qa/results/<stamp>/raw.json and summary.md
const fs=require('fs'), path=require('path'), {spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'), PORT=9377, mode=process.argv[2]||'full';
const CHROME=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19), OUT=path.join(__dirname,'results',stamp); fs.mkdirSync(OUT,{recursive:true});
const prof=path.join(process.env.TEMP||'.', 'ck-qa-profile');
const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+prof,'--window-size=1600,1000','--hide-scrollbars','--autoplay-policy=no-user-gesture-required','--mute-audio','about:blank'],{stdio:'ignore'});
process.on('exit',()=>{ try{chrome.kill()}catch(e){} });
(async()=>{
 let tabs; for(let i=0;i<60;i++){ try{ tabs=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; }catch(e){ await sleep(250); } }
 const t=tabs.find(x=>x.type==='page'); const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={};
 const send=(method,params={})=>new Promise(res=>{ const i=++id; pend[i]=res; ws.send(JSON.stringify({id:i,method,params})); });
 ws.onmessage=m=>{ const d=JSON.parse(m.data); if(d.id&&pend[d.id]){ pend[d.id](d.result); delete pend[d.id]; } };
 await new Promise(r=>ws.onopen=r);
 const evalJs=async(expression,awaitPromise=false)=>{ const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise,timeout:600000}); if(r&&r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0,600)); return r&&r.result&&r.result.value; };
 await send('Page.navigate',{url:'file:///'+path.join(ROOT,'index.html').replace(/\\/g,'/')+'?qa=1'});
 for(let i=0;i<40;i++){ await sleep(250); if(await evalJs('!!window.CK')) break; }
 await evalJs(fs.readFileSync(path.join(__dirname,'agents.js'),'utf8'));
 const maps=await evalJs('Object.keys(CK.MAPS)'), personas=await evalJs('QA.personas');
 const results=[];
 const run=async(o)=>{ const r=await evalJs(`QA.runMatch(${JSON.stringify(o)})`); results.push(r); const me=r.ents.find(e=>e.human===1); console.log(`${o.map.padEnd(9)} ${String(o.persona||'bots').padEnd(9)} ${o.diff.padEnd(6)} ${(r.simMs/1000).toFixed(1)}s  human ${me?me.score+'/'+me.deaths:'-'}  errors ${r.errors.length}`); return r; };
 if(mode==='perf'){
  for(const map of maps){ await evalJs(`CK.begin({map:'${map}',diff:'spicy',humans:0}); CK.freeze(false); 0`); await sleep(1500);
   const fps=await evalJs(`new Promise(res=>{let n=0,t0=performance.now();const f=()=>{n++; if(performance.now()-t0>4000) res(n/((performance.now()-t0)/1000)); else requestAnimationFrame(f)}; requestAnimationFrame(f)})`,true);
   console.log(map.padEnd(9),'fps',fps.toFixed(1)); results.push({map,fps}); await evalJs('CK.freeze(true);0'); }
 } else {
  const plan=[];
  if(mode==='quick'){ personas.forEach((p,i)=>plan.push({persona:p,map:maps[i%maps.length],diff:'spicy'})); maps.forEach(m=>plan.push({persona:'idle',map:m,diff:'spicy',humans:0})); }
  else { for(const m of maps){ plan.push({persona:'idle',map:m,diff:'spicy',humans:0}); for(const p of personas) plan.push({persona:p,map:m,diff:'spicy'}); } for(const p of ['rusher','pro','collector','parrier']) for(let i=0;i<3;i++) plan.push({persona:p,map:maps[i],diff:'brutal'}); for(const p of ['rusher','pro']) for(let i=0;i<2;i++) plan.push({persona:p,map:maps[i+3],diff:'chill'}); plan.push({persona:'pro',map:'frost',diff:'spicy',mode:'teams'}); plan.push({persona:'rusher',map:'factory',diff:'spicy',mode:'teams'}); }
  for(const o of plan) await run(o);
 }
 fs.writeFileSync(path.join(OUT,'raw.json'),JSON.stringify(results));
 if(mode!=='perf') fs.writeFileSync(path.join(OUT,'summary.md'),summarise(results));
 else fs.writeFileSync(path.join(OUT,'summary.md'),'# Frame rate\n\n'+results.map(r=>`- ${r.map}: ${r.fps.toFixed(1)} fps`).join('\n')+'\n');
 console.log('\nwrote',OUT); ws.close(); chrome.kill(); process.exit(0);
})().catch(e=>{ console.error(e); chrome.kill(); process.exit(1); });

function pct(a,b){ return b?Math.round(100*a/b)+'%':'-'; }
function med(a){ if(!a.length)return 0; const s=a.slice().sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; }
function table(rows,head){ return '| '+head.join(' | ')+' |\n|'+head.map(()=>'---').join('|')+'|\n'+rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n'; }
function summarise(R){
 let out=`# Custard Knights QA summary\n\n${R.length} simulated matches, ${R.reduce((a,r)=>a+r.seconds,0)/60|0} minutes of play, run ${stamp}.\n\n`;
 const errs=R.filter(r=>r.errors.length); out+=`## Crashes and errors\n\n${errs.length?errs.map(r=>`- ${r.map} / ${r.persona}: ${r.errors.join(' | ')}`).join('\n'):'None.'}\n\n`;
 // persona outcomes
 const rows=[]; for(const p of [...new Set(R.filter(r=>r.humans).map(r=>r.persona))]){ const rs=R.filter(r=>r.persona===p&&r.humans&&r.diff==='spicy'&&r.mode!=='teams'); const me=rs.map(r=>r.ents.find(e=>e.human===1));
  const kos=rs.flatMap(r=>r.log.filter(l=>l.k==='ko'&&l.vh==='h')), spawnDeaths=kos.filter(l=>l.alive<3).length, rank=rs.map(r=>r.ents.slice().sort((a,b)=>b.score-a.score).findIndex(e=>e.human===1)+1);
  rows.push([p,rs.length,(me.reduce((a,e)=>a+e.score,0)/rs.length).toFixed(1),(me.reduce((a,e)=>a+e.deaths,0)/rs.length).toFixed(1),(rank.reduce((a,b)=>a+b,0)/rs.length).toFixed(1),pct(spawnDeaths,kos.length),med(kos.map(l=>l.alive)).toFixed(1)+'s']); }
 out+='## Personas (spicy bots, free-for-all)\n\nHow each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona\'s deaths that came within 3 seconds of respawning.\n\n'+table(rows,['persona','matches','KOs','deaths','avg rank','spawn deaths','median life'])+'\n';
 // per-map
 const mrows=[]; const maps=[...new Set(R.map(r=>r.map))];
 for(const m of maps){ const rs=R.filter(r=>r.map===m&&r.diff==='spicy'&&r.mode!=='teams'); const kos=rs.flatMap(r=>r.log.filter(l=>l.k==='ko')); const byS={}; kos.forEach(l=>byS[l.src]=(byS[l.src]||0)+1);
  const haz=kos.filter(l=>['pit','spike','lava','chickens','meteor','catapult'].includes(l.src)).length, sd=kos.filter(l=>l.alive<3).length, rsp=rs.flatMap(r=>r.log.filter(l=>l.k==='respawn'));
  const top=Object.entries(byS).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`${k} ${pct(v,kos.length)}`).join(', ');
  mrows.push([m,rs.length,(kos.length/rs.length/(rs[0].seconds/60)).toFixed(1),pct(haz,kos.length),pct(sd,kos.length),med(rsp.map(l=>l.ne))+'px',top]); }
 out+='## Arenas\n\nKOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).\n\n'+table(mrows,['arena','matches','KOs/min','hazard share','spawn deaths','respawn distance','top KO sources'])+'\n';
 // sources overall + weapons
 const all=R.flatMap(r=>r.log.filter(l=>l.k==='ko')); const byS={}; all.forEach(l=>byS[l.src]=(byS[l.src]||0)+1);
 out+='## What actually kills people\n\n'+table(Object.entries(byS).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,v,pct(v,all.length)]),['source','KOs','share'])+'\n';
 // combat feel
 const st=R.reduce((a,r)=>{ for(const k of ['swings','swingHits','shots','shotHits']){ a[k].h+=r.stats[k].h; a[k].b+=r.stats[k].b; } a.blocks+=r.stats.blocks; a.dashes+=r.stats.dashes; return a; },{swings:{h:0,b:0},swingHits:{h:0,b:0},shots:{h:0,b:0},shotHits:{h:0,b:0},blocks:0,dashes:0});
 const ex=R.reduce((a,r)=>{ for(const k of ['parries','guardBreaks','heavies','stabs','bashes','protectedHits']) a[k]+=r.stats[k]||0; return a; },{parries:0,guardBreaks:0,heavies:0,stabs:0,bashes:0,protectedHits:0});
 const ringouts=all.filter(l=>l.src==='pit'&&l.a>=0).length, hum=R.filter(r=>r.humans), deadShare=hum.length?hum.reduce((a,r)=>{ const me=r.ents.find(e=>e.human===1); return a+Math.min(1,me.deaths*1.8/r.seconds); },0)/hum.length:0;
 out+=`## Combat feel\n\n- Sword swings that connected: humans ${pct(st.swingHits.h,st.swings.h)} of ${st.swings.h}, bots ${pct(st.swingHits.b,st.swings.b)} of ${st.swings.b}\n- Ranged shots that hit: humans ${pct(st.shotHits.h,st.shots.h)} of ${st.shots.h}, bots ${pct(st.shotHits.b,st.shots.b)} of ${st.shots.b}\n- Blocks (clangs): ${st.blocks}; parries: ${ex.parries}; guard breaks: ${ex.guardBreaks}; dashes: ${st.dashes}\n- Heavy swings: ${ex.heavies}; dash-stabs: ${ex.stabs}; shield bashes: ${ex.bashes}; hits absorbed by spawn protection: ${ex.protectedHits}\n- Ring-outs (pit deaths credited to an attacker): ${ringouts} of ${all.length} KOs (${pct(ringouts,all.length)})\n- Share of the match a human persona spent dead (deaths x 1.8s / match): ${Math.round(deadShare*100)}%\n\n`;
 // pickups and events
 const pk={}; R.flatMap(r=>r.log.filter(l=>l.k==='pickup')).forEach(l=>pk[l.kind]=(pk[l.kind]||0)+1);
 const ev={}; R.flatMap(r=>r.log.filter(l=>l.k==='event'||l.k==='mayhem')).forEach(l=>ev[l.kind]=(ev[l.kind]||0)+1);
 const evk={}; all.forEach(l=>{ if(l.ev) evk[l.ev]=(evk[l.ev]||0)+1; if(l.mh) evk['mayhem:'+l.mh]=(evk['mayhem:'+l.mh]||0)+1; });
 out+='## Power-ups picked up\n\n'+table(Object.entries(pk).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,v]),['power-up','pickups'])+'\n';
 out+='## Events fired and KOs during them\n\n'+table(Object.keys(ev).sort().map(k=>[k,ev[k],evk[k]||evk['mayhem:'+k]||0]),['event','times','KOs while active'])+'\n';
 // difficulty and teams
 const drows=[]; for(const d of ['chill','spicy','brutal']) for(const p of ['rusher','pro','collector','parrier']){ const rs=R.filter(r=>r.diff===d&&r.persona===p&&r.humans&&r.mode!=='teams'); if(!rs.length)continue; const me=rs.map(r=>r.ents.find(e=>e.human===1)); drows.push([d,p,rs.length,(me.reduce((a,e)=>a+e.score,0)/rs.length).toFixed(1),(me.reduce((a,e)=>a+e.deaths,0)/rs.length).toFixed(1)]); }
 out+='## Difficulty\n\n'+table(drows,['bots','persona','matches','KOs','deaths'])+'\n';
 const tr=R.filter(r=>r.mode==='teams'); if(tr.length) out+='## Teams\n\n'+tr.map(r=>{ let rs=0,bs=0; r.ents.forEach(e=>e.team==='red'?rs+=e.score:bs+=e.score); return `- ${r.map} with ${r.persona}: red ${rs}, blue ${bs}`; }).join('\n')+'\n\n';
 // spawn hot spots: where deaths cluster within 3s of spawn
 const sdk=all.filter(l=>l.alive<3); const spots={}; sdk.forEach(l=>{ const k=`${l.map} (${Math.round(l.x/40)*40},${Math.round(l.y/40)*40})`; spots[k]=(spots[k]||0)+1; });
 out+='## Spawn-death hot spots (top 8)\n\n'+table(Object.entries(spots).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>[k,v]),['arena and tile','spawn deaths'])+'\n';
 out+=`## Sim speed\n\nAverage ${(R.reduce((a,r)=>a+r.simMs,0)/R.length/1000).toFixed(1)}s of CPU per 3-minute match (update only, no rendering).\n`;
 return out;
}
