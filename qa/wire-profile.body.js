(()=>{
  const freeze=v=>{if(v&&typeof v==='object'){Object.freeze(v);for(const x of Object.values(v))freeze(x);}return v;};
  const batches=[];
  for(const mode of ['brawl','ctf','siege']){
    const state=CKMassBattle.create({mode,teamSize:50,seed:612}),encoder=before.createEncoder(),packets=[],expected=[];
    CKMassBattle.join(state,{id:'person',name:'Human',role:'ranger'});
    for(let i=0;i<210;i++){
      CKMassBattle.step(state,.05,{person:{moveX:1,moveY:0,aimX:1,aimY:0,attack:true,ability:i%20===0}});
      const s=CKMassBattle.snapshot(state);packets.push(freeze(JSON.parse(JSON.stringify(encoder.encode(s)))));expected.push(JSON.stringify(s));
    }
    batches.push({mode,packets,expected});
  }
  const run=(api,verify=false)=>{let sum=0;for(const b of batches){const d=api.createDecoder();for(let i=0;i<b.packets.length;i++){const r=d.apply(b.packets[i]);if(!r)throw Error('Decode failure '+b.mode+':'+i);if(verify&&JSON.stringify(r)!==b.expected[i])throw Error('Lossless mismatch '+b.mode+':'+i);sum+=r.players[0].x;}}return sum;};
  window.wireBench={batches,run,verify:()=>{run(before,true);run(after,true);return true;},measure:()=>{
    const measurements=[];for(let round=0;round<8;round++)for(const variant of round%2?['after','before']:['before','after']){const t=performance.now();run(window[variant]);measurements.push({round,variant,milliseconds:performance.now()-t});}
    const summary=variant=>{const v=measurements.filter(m=>m.variant===variant).map(m=>m.milliseconds).sort((a,b)=>a-b),medianMs=(v[3]+v[4])/2;return{medianMs,medianPerPacketMs:medianMs/630,minMs:v[0],maxMs:v.at(-1)};};
    return{seed:612,teamSize:50,packets:630,modes:['brawl','ctf','siege'],exactSnapshotsCompared:1260,measurements,before:summary('before'),after:summary('after'),limitation:'Decode-only fixed immutable packets; excludes parsing, encoding, simulation, rendering and input scheduling. Single-host microbenchmark, not WAN or load acceptance.'};
  }};
})();
