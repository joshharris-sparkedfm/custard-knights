// Hidden, temporary-profile acceptance path; never changes an ordinary player's saves.
module.exports=async({app,win})=>{
 const timer=setTimeout(()=>{console.error('FACTION_DESKTOP_FAIL: timed out');app.exit(1);},45000);
 const run=js=>win.webContents.executeJavaScript(js),pause=ms=>new Promise(r=>setTimeout(r,ms));
 const wait=async(expression,label)=>{for(let i=0;i<80;i++){if(await run(expression))return;await pause(100);}throw Error(label);};
 try{
  const arg=process.argv.find(v=>v.startsWith('--faction-server='));
  const address=new URL(arg?arg.slice('--faction-server='.length):'');
  if(address.protocol!=='ws:'||!['127.0.0.1','localhost','[::1]'].includes(address.hostname))throw Error('Smoke server must be local loopback');
  await run('CK.sprLoadAll()');await run('CK.sprLoadVisors()');const checks=[];
  for(const [mode,size,visor] of [['brawl',4,'closed'],['ctf',20,'open'],['siege',50,'closed']]){
   await run(`CK.saveProfile(1,{...CK.loadProfile(1),visor:${JSON.stringify(visor)}});CK.massBattle().open();for(const [label,value] of [['Battle mode',${JSON.stringify(mode)}],['Army size',${JSON.stringify(String(size))}]]){const s=Array.from(document.querySelectorAll('.ck-battle label')).find(l=>l.firstChild.textContent===label).querySelector('select');s.value=value;s.onchange?.();}document.querySelector('.ck-battle input[type=url]').value=${JSON.stringify(address.href)};document.querySelector('.ck-battle input[placeholder]').value=${JSON.stringify('desktop-'+mode)};Array.from(document.querySelectorAll('.ck-battle button')).find(b=>b.textContent==='Join online battle').click();`);
   await wait('!!CK.massBattle().snapshot()&&CK.massBattle().qa.networkStats().delta>0',mode+' did not receive deltas from packaged origin');
   const before=await run('CK.massBattle().snapshot().players.find(p=>!p.bot)');
   const key=before.x<1600?'D':'A',direction=before.x<1600?1:-1;
   // Hidden windows cannot rely on OS focus; exercise the shipped DOM input handler.
   await run(`document.dispatchEvent(new KeyboardEvent('keydown',{code:${JSON.stringify('Key'+key)},key:${JSON.stringify(key.toLowerCase())},bubbles:true}));`);
   await wait(`(CK.massBattle().snapshot().players.find(p=>!p.bot).x-${before.x})*${direction}>15`,mode+' movement did not reach server');
   await run(`document.dispatchEvent(new KeyboardEvent('keyup',{code:${JSON.stringify('Key'+key)},key:${JSON.stringify(key.toLowerCase())},bubbles:true}));`);
   const after=await run('CK.massBattle().snapshot().players.find(p=>!p.bot)');
   if((after.x-before.x)*direction<=15)throw Error(mode+' desktop movement did not reach authoritative server '+JSON.stringify({before:before.x,after:after.x,key}));
   const data=await run('({mode:CK.massBattle().snapshot().mode,players:CK.massBattle().snapshot().players.length,visor:CK.massBattle().snapshot().players.find(p=>!p.bot).visor,network:CK.massBattle().qa.networkStats(),origin:location.origin})');
   if(data.mode!==mode||data.players!==size*2||data.visor!==visor||data.origin!=='custard://game')throw Error('Desktop faction state mismatch '+JSON.stringify(data));
   checks.push(data);await run('CK.massBattle().close()');
  }
  clearTimeout(timer);console.log('FACTION_DESKTOP_PASS '+JSON.stringify({checks,temporaryProfile:true,input:'synthetic DOM keyboard; physical input untested'}));app.exit(0);
 }catch(error){clearTimeout(timer);console.error('FACTION_DESKTOP_FAIL',error);app.exit(1);}
};
