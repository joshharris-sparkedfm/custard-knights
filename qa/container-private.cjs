'use strict';
const fs=require('node:fs'),{execFileSync}=require('node:child_process'),WebSocket=require('ws');
const compose=['compose','-f','deploy/compose.yaml','-f','deploy/compose.ladder.yaml'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const admin=(...args)=>JSON.parse(execFileSync('docker',[...compose,'exec','-T','battle','node','scripts/player-admin.cjs','--db','/data/players.sqlite',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const clients=[];const record={checks:[],limitations:'Private CI container, loopback scripted clients, no TLS/WAN/human or Steam acceptance. Keys stay in process memory and are never printed.'};
function check(name,pass){record.checks.push({name,pass:!!pass});if(!pass)throw Error(name);}
async function connect(account){
 const ws=new WebSocket('ws://127.0.0.1:8787/battle',{origin:'custard://game'}),messages=[];clients.push(ws);
 ws.on('message',raw=>messages.push(JSON.parse(raw)));
 await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
 ws.send(JSON.stringify({type:'join',wire:1,ranked:true,accessToken:account.token,mode:'brawl',teamSize:4}));
 return {ws,messages};
}
async function waitFor(fn){for(let i=0;i<100;i++){if(await fn())return true;await sleep(100);}return false;}
(async()=>{
 check('Private ladder enabled in non-root container',(await(await fetch('http://127.0.0.1:8787/health')).json()).privateRanked===true);
 const users=Array.from({length:8},(_,i)=>admin('issue','Container '+(i+1)));
 const peers=[];for(const user of users)peers.push(await connect(user));
 check('Container launches eight distinct authenticated humans',await waitFor(()=>peers.every(p=>p.messages.some(m=>m.type==='welcome'&&m.ranked))));
 check('Full snapshot has zero bots',await waitFor(()=>peers[0].messages.some(m=>m.type==='snapshot'&&m.humans===8&&m.bots===0)));
 // Restart is deliberately an abort, not a completed match or earned rating.
 execFileSync('docker',[...compose,'restart','battle'],{stdio:'pipe',timeout:30000});
 check('Service returns after restart',await waitFor(async()=>{try{return(await(await fetch('http://127.0.0.1:8787/health')).json()).privateRanked===true;}catch{return false;}}));
 const returning=await connect(users[0]);
 check('Host-issued identity survives container restart',await waitFor(()=>returning.messages.some(m=>m.type==='queue'&&m.waiting===1)));
 check('Aborted match does not award rating',admin('profile',users[0].accountId,'brawl-4').matches===0);
 admin('revoke',users[0].accountId);returning.ws.close();await sleep(150);
 const rejected=await connect(users[0]);
 check('Revoked key rejected after restart',await waitFor(()=>rejected.messages.some(m=>m.type==='error'&&m.code==='AUTH_REQUIRED')));
})().catch(error=>{record.failure=error.message;process.exitCode=1;}).finally(()=>{for(const client of clients)client.terminate();fs.writeFileSync('container-private.json',JSON.stringify(record,null,2));console.log(JSON.stringify(record));});
