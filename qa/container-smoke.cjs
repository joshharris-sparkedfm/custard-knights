'use strict';
const fs=require('node:fs'),WebSocket=require('ws'),Wire=require('../game/mass-battle-wire.js');
(async()=>{
 const health=await(await fetch('http://127.0.0.1:8787/health')).json();if(!health.ok||health.ranked!==false)throw Error('Invalid health');
 const socket=new WebSocket('ws://127.0.0.1:8787/battle',{origin:'custard://game'}),decoder=Wire.createDecoder();let full=0,delta=0;
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Container socket timeout')),8000);
   socket.on('error',error=>{clearTimeout(timer);reject(error);});
   socket.on('open',()=>socket.send(JSON.stringify({type:'join',wire:1,room:'container',teamSize:4,mode:'ctf',visor:'open'})));
   socket.on('message',data=>{try{const message=JSON.parse(data);if(message.type==='error')throw Error(message.message);if(message.type==='snapshot'||message.type==='delta'){const state=decoder.apply(message);if(!state||state.players.length!==8||state.players.find(p=>!p.bot)?.visor!=='open')throw Error('Invalid container state');if(message.type==='snapshot')full++;else delta++;if(delta>=3){clearTimeout(timer);resolve();}}}catch(error){clearTimeout(timer);reject(error);}});
  });
  const record={status:'pass',health,full,delta,origin:'custard://game',limitations:'Loopback container smoke only; no TLS, WAN, human, sustained-capacity or hosting acceptance.'};fs.writeFileSync('container-smoke.json',JSON.stringify(record,null,2));console.log(JSON.stringify(record));
 }finally{socket.terminate();}
})().catch(error=>{console.error(error);process.exitCode=1;});
