module.exports=async({app,BrowserWindow,session,serve,host})=>{
 const timer=setTimeout(()=>{console.error('ONLINE_SMOKE_FAIL: timed out');app.exit(1);},60000);
 const run=(w,js)=>w.webContents.executeJavaScript(js),pause=ms=>new Promise(r=>setTimeout(r,ms));
 const wait=async(w,expression,label)=>{for(let i=0;i<80;i++){if(await run(w,expression))return;await pause(250);}throw Error(label);};
 try{
  const partition='ck-online-smoke-guest';const ses=session.fromPartition(partition);
  ses.protocol.handle('custard',serve);ses.setPermissionRequestHandler((_w,_p,cb)=>cb(false));ses.setPermissionCheckHandler(()=>false);
  const guest=new BrowserWindow({show:false,webPreferences:{partition,contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
  guest.webContents.setWindowOpenHandler(()=>({action:'deny'}));guest.webContents.on('will-navigate',e=>e.preventDefault());
  await guest.loadURL('custard://game/index.html?qa=1');
  await run(host,"CK.cfg.players=1;document.getElementById('nameIn').value='QA Host';CK.hostOnline()");
  await wait(host,'CK.NET.peer&&CK.NET.peer.open','Host signaling did not open');
  const code=await run(host,'CK.NET.code');
  await run(guest,`document.getElementById('nameIn').value='QA Guest';CK.joinOnline(${JSON.stringify(code)})`);
  await wait(host,'CK.NET.players.length===2','Guest did not join host');
  for(let i=0;i<3;i++){
   await run(host,'CK.start();CK.freeze(true);0');
   await wait(guest,'!CK.G().demo&&!CK.G().over','Guest did not receive start');
   const id=await run(host,'CK.G().roundId');
   if(await run(guest,'CK.G().roundId')!==id)throw Error('Round IDs differ');
   await run(host,"CK.G().ents.find(e=>e.netId).parries=10;CK.G().time=0.01;CK.adv(2);0");
   await wait(guest,'CK.G().over','Guest did not receive final result');
   if(await run(guest,'CK.PROG.matches')!==i+1)throw Error('Guest completion count wrong');
  }
  if(await run(guest,'CK.PROG.ch.parry10')!==10)throw Error('Guest parry award missing');
  await run(host,'CK.leaveOnline();0');
  await wait(guest,"CK.NET.role===null&&!document.getElementById('menu').hidden",'Guest did not recover when host left');
  clearTimeout(timer);console.log('ONLINE_SMOKE_PASS: two isolated desktop profiles, live PeerJS connection, three matches, guest challenge rewards, host disconnect recovery');app.exit(0);
 }catch(e){clearTimeout(timer);console.error('ONLINE_SMOKE_FAIL',e);app.exit(1);}
};
