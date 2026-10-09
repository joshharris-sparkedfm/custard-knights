(()=>{
 const results=[];
 for(const difficulty of ['easy','medium','hard','steve'])for(const mode of ['brawl','ctf','siege']){
  const s=CKMassBattle.create({teamSize:50,mode,difficulty,seed:123,duration:600});
  for(let i=0;i<36001&&s.status==='playing';i++)CKMassBattle.step(s,1/60,{});
  if(!s.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.hp)))throw Error(mode+'/'+difficulty+' non-finite state');
  if(s.players.length!==100||s.projectiles.length>160||s.effects.length>96)throw Error(mode+'/'+difficulty+' bounds');
  if(!s.players.some(p=>p.kills>0))throw Error(mode+'/'+difficulty+' no combat');
  if(s.status!=='finished')throw Error(mode+'/'+difficulty+' unfinished');
  if(mode==='ctf'&&s.scores.custardia+s.scores.rice===0)throw Error(difficulty+' no flag captures');
  if(mode==='siege'&&!s.castles.some(c=>c.hp<c.maxHp))throw Error(difficulty+' no castle progress');
  results.push({mode,difficulty,players:s.players.length,elapsed:s.elapsed,kills:s.players.reduce((sum,p)=>sum+p.kills,0),scores:s.scores,castles:s.castles.map(c=>c.hp),status:s.status});
 }
 return {results,limitations:'One seeded complete match (maximum 600 simulated seconds) of 100 bots per mode/profile, requiring combat and flag/castle progress. No networking, human play, performance or multi-seed balance acceptance.'};
})()
