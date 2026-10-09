(()=>{
 const results=[];
 for(const difficulty of ['easy','medium','hard','steve'])for(const mode of ['brawl','ctf','siege']){
  const s=CKMassBattle.create({teamSize:50,mode,difficulty,seed:199});
  for(let i=0;i<2100;i++)CKMassBattle.step(s,1/60,{});
  if(!s.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.hp)))throw Error(mode+'/'+difficulty+' non-finite state');
  if(s.players.length!==100||s.projectiles.length>160||s.effects.length>96)throw Error(mode+'/'+difficulty+' bounds');
  if(!s.players.some(p=>p.kills>0))throw Error(mode+'/'+difficulty+' no combat');
  results.push({mode,difficulty,players:s.players.length,elapsed:s.elapsed,kills:s.players.reduce((sum,p)=>sum+p.kills,0),scores:s.scores,castles:s.castles.map(c=>c.hp),status:s.status});
 }
 return {results,limitations:'35 simulated seconds of 100 bots for each mode/profile in the actual browser runtime. No networking, human play, performance or complete-objective acceptance.'};
})()
