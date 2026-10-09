'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {createBattleServer}=require('../server/mass-battle-server.cjs');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||'qa/results/faction-desktop'),packaged=process.argv.includes('--packaged');
(async()=>{
 const server=createBattleServer({port:0}),origins=[],samples=[];let child;
 const sampleTimer=setInterval(()=>{for(const [room,r] of server.rooms)if(r.inputs.size)samples.push({room,time:r.state.elapsed,inputs:[...r.inputs.values()].map(i=>({x:i.moveX,y:i.moveY,seq:i.seq}))});},100);
 server.server.on('upgrade',req=>origins.push(req.headers.origin||null));
 try{
  const address=await server.listen(),exe=packaged?path.join(root,'dist/Custard Knights-win32-x64/Custard Knights.exe'):path.join(root,'node_modules/electron/dist/electron.exe');
  const args=[...(packaged?[]:[root]),'--faction-smoke',`--faction-server=ws://127.0.0.1:${address.port}/battle`];
  child=spawn(exe,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
  const result=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',(code,signal)=>resolve({code,signal}));});
  const record={date:new Date().toISOString(),packaged,...result,origins,stdout,stderr,samples};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(record,null,2));
  console.log(JSON.stringify(record));if(result.code!==0||!stdout.includes('FACTION_DESKTOP_PASS')||!origins.includes('custard://game'))process.exitCode=1;
 }finally{clearInterval(sampleTimer);child?.kill();await server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
