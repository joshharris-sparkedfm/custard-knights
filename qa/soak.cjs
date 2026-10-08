const fs=require('node:fs'),path=require('node:path');
module.exports=async({evalJs,OUT,sleep,chromePid})=>{
 const minutes=Number(process.env.CK_SOAK_MINUTES||60);
 if(!Number.isFinite(minutes)||minutes<0.1||minutes>180)throw Error('CK_SOAK_MINUTES must be between 0.1 and 180');
 const report=process.env.CK_SOAK_REPORT||path.join(OUT,'soak-status.json');
 const state={status:'running',startedAt:new Date().toISOString(),plannedMinutes:minutes,nodePid:process.pid,chromePid,engine:'Chrome headless, real-time rendering, audio graph active; speakers muted',completedMatches:[],samples:[]};
 const save=()=>fs.writeFileSync(report,JSON.stringify({...state,updatedAt:new Date().toISOString()},null,2));
 const maps=['courtyard','frost','factory','dungeon','roof','bog'],modes=['ffa','teams','lks','kotp','heist','race','flags','hotpie'];
 let round=0,lastFrame=0;
 const begin=async()=>{const options={map:maps[round%maps.length],mode:modes[round%modes.length],players:0,length:180,diff:'spicy',chaosSpeed:'fast'};round++;await evalJs(`Object.assign(CK.cfg,${JSON.stringify(options)});CK.start();0`);};
 try{
  await evalJs(`window.soakQA={frames:0,maxFrameGap:0,last:performance.now(),errors:[]};
   addEventListener('error',e=>soakQA.errors.push(String(e.message)));
   addEventListener('unhandledrejection',e=>soakQA.errors.push(String(e.reason)));
   requestAnimationFrame(function tick(now){soakQA.frames++;soakQA.maxFrameGap=Math.max(soakQA.maxFrameGap,now-soakQA.last);soakQA.last=now;requestAnimationFrame(tick)});0`);
  await begin();save();console.log('SOAK_STARTED '+report);
  const deadline=Date.now()+minutes*60000;
  while(Date.now()<deadline){
   await sleep(Math.min(10000,deadline-Date.now()));
   const sample=await evalJs(`({roundId:CK.G().roundId,map:CK.G().mapKey,mode:CK.G().mode,over:CK.G().over,timeLeft:CK.G().time,voices:CK.audioStats().active,frames:soakQA.frames,maxFrameGapMs:soakQA.maxFrameGap,errors:soakQA.errors.slice(),heapBytes:performance.memory?performance.memory.usedJSHeapSize:null})`);
   state.samples.push({at:new Date().toISOString(),...sample});save();
   if(sample.errors.length)throw Error('Browser errors: '+sample.errors.join('; '));
   if(sample.frames<=lastFrame)throw Error('Animation frames stopped');lastFrame=sample.frames;
   if(sample.voices>64)throw Error('Audio voice limit exceeded');
   if(sample.over){state.completedMatches.push({roundId:sample.roundId,map:sample.map,mode:sample.mode});await begin();save();}
  }
  state.status='passed';state.finishedAt=new Date().toISOString();save();
  fs.writeFileSync(path.join(OUT,'summary.md'),`# Real-time stability soak\n\nCompleted ${minutes} real minutes with ${state.completedMatches.length} completed matches and automatic rematches. No captured browser errors, stopped animation frames or audio voice-limit violations.\n\nEngine: ${state.engine}. This does not certify physical controllers, minimum hardware or different-network multiplayer.\n`);
  console.log('SOAK_PASS '+report);
 }catch(error){state.status='failed';state.error=String(error.stack||error);state.finishedAt=new Date().toISOString();save();throw error;}
};
