const fs=require('node:fs'),path=require('node:path');

function options(argv,temp) {
 const phase=argv.find(v=>v.startsWith('--acceptance-phase='))?.split('=')[1];
 if(!phase)return null;
 const value=argv.find(v=>v.startsWith('--acceptance-profile='))?.slice('--acceptance-profile='.length);
 const profile=value&&path.resolve(value),parent=profile&&path.dirname(profile);
 if(!['write','read','launcher','duplicate'].includes(phase)||!profile||path.dirname(parent)!==path.resolve(temp)||
   !path.basename(parent).startsWith('custard-acceptance-')||path.basename(profile)!=='user-data'||
   !fs.existsSync(path.join(parent,'acceptance-profile.marker')))
  throw Error('Acceptance checks require a marked temporary profile created by tests/desktop-acceptance.cjs');
 return {phase,profile};
}

async function run({app,win,options}) {
 const timer=setTimeout(()=>{console.error('DESKTOP_ACCEPTANCE_FAIL: timed out');app.exit(1);},45000);
 try {
  if(win.getTitle()!==`Custard Knights — ${app.getVersion()}`)throw Error('Desktop title does not identify the installed build');
  if(options.phase==='duplicate')throw Error('Duplicate launch acquired the same profile lock');
  if(options.phase==='launcher'){
   const {spawn}=require('node:child_process');
   const args=[...(!app.isPackaged?[path.resolve(__dirname,'..')]:[]),'--acceptance-phase=duplicate',`--acceptance-profile=${options.profile}`];
   const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
   const event=new Promise(resolve=>app.once('second-instance',resolve));
   const child=spawn(process.execPath,args,{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
   let output='';child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);
   const exit=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>{
    if(code!==0||!output.includes('DESKTOP_DUPLICATE_EXIT'))reject(Error('Duplicate launch failed: '+output));else resolve();
   });});
   await Promise.all([event,exit]);
   console.log('DESKTOP_ACCEPTANCE_PASS '+JSON.stringify({phase:'launcher',singleInstance:true,secondInstanceEvent:true}));
   clearTimeout(timer);win.close();return;
  }
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const assert=(ok,label)=>{if(!ok)throw Error(label);};
   await document.fonts.ready;await CK.sprLoadAll();
   assert(CK.spritesReady(),'Sprites unavailable offline');
   assert(await CK.sprLoadVisors(),'Open visor sprite families unavailable offline');
   assert(CK.visorAssets().knightReady&&CK.visorAssets().heroReady,'Both open visor resolutions must decode');
   assert(document.fonts.check('16px "Lilita One"'),'Font unavailable offline');
   assert(typeof require==='undefined'&&typeof process==='undefined','Renderer Node access');
   for(const url of ['desktop/main.cjs','package.json','custard://other/index.html']){
    let accessible=false;try{accessible=(await fetch(url)).ok;}catch{}
    assert(!accessible,'Internal or foreign asset exposed: '+url);
   }
   assert((await fetch('vendor/peerjs.min.js')).ok,'Bundled online client absent');
   for(const url of ['game/campaign.js','game/campaign-ui.js','game/collection.js','game/collection-art.js','game/cup.js'])
    assert((await fetch(url)).ok,'Expanded module unavailable offline: '+url);
   let blocked=false;try{await fetch('https://example.com/');}catch{blocked=true;}
   assert(blocked,'Offline check permitted external network');
   const snapshot=()=>({earned:CK.PROG.earned,matches:CK.PROG.matches,unlocked:CK.PROG.unlocked,
    receipts:CK.PROG.receipts,profile:CK.loadProfile(1),profile2:CK.loadProfile(2),cfg:JSON.parse(localStorage.getItem('ck-cfg')),
    collection:CK.collection(),campaign:CK.adventure.campaign.save,
    settings:JSON.parse(localStorage.getItem('ck-settings'))});
   if(${JSON.stringify(options.phase)}==='write'){
    assert(CK.PROG.matches===0,'Temporary profile already has progress');
    CK.begin({map:'courtyard',mode:'ffa',humans:1});CK.freeze(true);
    CK.G().ents.find(e=>e.human).parries=10;CK.G().time=0.01;CK.adv(2);
    assert(CK.G().over&&CK.PROG.matches===1,'Match award absent');
    assert(CK.PROG.unlocked.includes('cape:checker'),'Earned challenge unlock absent');
    CK.saveProfile(1,{...CK.loadProfile(1),cape:'checker',visor:'open'});
    CK.saveProfile(2,{...CK.loadProfile(2),cape:'checker',visor:'closed'});
    const choice=[...document.querySelectorAll('#end button')].find(button=>button.textContent==='Choose Burnt Toast');
    assert(!!choice,'First collection reward choice absent');choice.click();
    assert(CK.loadProfile(1).cape==='burntToast'&&CK.owned('cape','burntToast'),'Collection reward was not earned/equipped');
    CK.setCollection(CKCollection.pin(CK.collection(),'golden-whisk'));
    CK.openWardrobe();document.querySelectorAll('#collectionGoals .ck-presets>div')[0].querySelector('button').click();
    const adventure=CK.adventure;adventure.campaign.assist(true);adventure.launch('banquet');CK.freeze(true);
    const game=CK.G(),me=game.ents[0];
    for(const guard of game.ents.slice(1)){
     guard.inv=0;guard.protect=0;guard.hitLock=0;guard.blocking=false;guard.dashT=0;
     CK.hurt(guard,me,99,{src:'heavy',kb:0});
    }
    me.x=1100;me.y=440;me.vx=0;me.vy=0;CK.adv(100);
    assert(adventure.campaign.run.status==='won'&&adventure.campaign.save.results.banquet.spoons[0],'Actual campaign encounter did not save its completion');
    assert(CK.collection().progress['golden-whisk']===1,'Pinned goal partial progress absent');
    assert(adventure.campaign.unlocked('puddings'),'Next campaign encounter not unlocked');
    CK.toMenu();CK.freeze(true);
    for(const [id,value] of [['sMusic','23'],['sSfx','41'],['sShake','0']]){
     const control=document.getElementById(id);control.value=value;control.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const flash=document.getElementById('cFlash');flash.checked=true;flash.dispatchEvent(new Event('change',{bubbles:true}));
    document.querySelector('.seg[data-k="length"] button[data-v="90"]').click();
    localStorage.setItem('desktop-acceptance-expected',JSON.stringify(snapshot()));
   }else{
    const expected=JSON.parse(localStorage.getItem('desktop-acceptance-expected'));
    assert(expected&&JSON.stringify(snapshot())===JSON.stringify(expected),'Earned progress, equipped cosmetic or settings changed after restart: '+JSON.stringify({expected,actual:snapshot()}));
    assert(CK.loadProfile(1).cape==='burntToast'&&CK.loadProfile(2).cape==='checker','Equipped legacy/collection reward lost');
    assert(CK.loadProfile(1).visor==='open'&&CK.loadProfile(2).visor==='closed','Independent visor choices lost');
    assert(CK.collection().pinned==='golden-whisk'&&CK.collection().progress['golden-whisk']===1,'Pinned partial goal lost');
    assert(CK.collection().presets[0].cape==='burntToast','Saved outfit preset lost');
    assert(CK.collection().presets[0].visor==='open','Saved visor preset lost');
    assert(CK.adventure.campaign.save.assist&&CK.adventure.campaign.unlocked('puddings'),'Campaign spoons/unlock/assistance lost');
    document.getElementById('tSettings').click();
    assert(document.getElementById('sMusic').value==='23','Saved music volume not restored into controls');
    assert(document.getElementById('cFlash').checked,'Saved flashing preference not restored');
   }
   return {origin:location.origin,phase:${JSON.stringify(options.phase)},matches:CK.PROG.matches,
    challengeUnlocked:true,equippedCape:CK.loadProfile(1).cape,campaignSpooned:CK.adventure.campaign.save.results.banquet.spoons,
    pinnedGoal:CK.collection().pinned,goalProgress:CK.collection().progress['golden-whisk'],preset:true,settings:JSON.parse(localStorage.getItem('ck-settings'))};
  })()`);
  const press=async(repeat=false)=>{
   win.webContents.sendInputEvent({type:'keyDown',keyCode:'F11',modifiers:repeat?['isautorepeat']:[]});
   await new Promise(resolve=>setTimeout(resolve,150));
  };
  await press();if(!win.isFullScreen())throw Error('F11 did not enter fullscreen');
  await press(true);if(!win.isFullScreen())throw Error('Repeated F11 toggled fullscreen');
  await press();if(win.isFullScreen())throw Error('F11 did not exit fullscreen');
  console.log('DESKTOP_ACCEPTANCE_PASS '+JSON.stringify({...result,fullscreen:true,offline:true}));
  clearTimeout(timer);
  // Exercise the user's ordinary close path, including DOMStorage flush and app.quit.
  win.close();
 }catch(error){clearTimeout(timer);console.error('DESKTOP_ACCEPTANCE_FAIL',error);app.exit(1);}
}
module.exports={options,run};
