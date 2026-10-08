/* Read-only review of the packaged renderer, using a disposable profile. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
if(!process.argv.includes('--electron-journey')){
 const {spawnSync}=require('node:child_process');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'custard-journey-'));
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const result=spawnSync(require('electron'),[__filename,'--electron-journey',...process.argv.slice(2),profile],{env,stdio:'inherit',windowsHide:true,timeout:60000});
 fs.rmSync(profile,{recursive:true,force:true});process.exit(result.status??1);
}else{
 const {app,BrowserWindow,protocol,net,session}=require('electron');
 app.setPath('userData',process.argv.at(-1));
 protocol.registerSchemesAsPrivileged([{scheme:'custard',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
 app.whenReady().then(async()=>{
  const source=process.argv.includes('--source'),archive=path.join(root,'dist/Custard Knights-win32-x64/resources/app.asar'),content=source?root:archive;
  const version=JSON.parse(fs.readFileSync(path.join(content,'package.json'))).version;
  const dest=path.resolve(root,'../../outputs/QA-evidence','desktop-journey-'+version+(source?'-source':''));fs.mkdirSync(dest,{recursive:true});
  protocol.handle('custard',require('../desktop/assets.cjs').createAssetHandler(content,net));
  session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_d,c)=>c({cancel:true}));
  const win=new BrowserWindow({width:1280,height:800,show:true,autoHideMenuBar:true,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,backgroundThrottling:false}});
  const run=s=>win.webContents.executeJavaScript(s).catch(e=>{console.error('failedScript',s);throw e;}),sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const capture=async name=>{await sleep(350);fs.writeFileSync(path.join(dest,name+'.png'),(await win.webContents.capturePage()).toPNG());};
  await win.loadURL('custard://game/index.html?qa=1');await run('document.fonts.ready');await run('CK.sprLoadAll()');
  const report={version,source,archiveSHA256:source?null:require('node:crypto').createHash('sha256').update(require('original-fs').readFileSync(archive)).digest('hex'),screens:{},findings:{}};
  const screen=async name=>{
   await capture(name);report.screens[name]=await run(`(()=>{const o=[...document.querySelectorAll('.overlay')].find(e=>!e.hidden);const p=o.querySelector('.panel')||o.firstElementChild;const r=p.getBoundingClientRect();return {viewport:[innerWidth,innerHeight],screen:o.id,panel:[r.x,r.y,r.width,r.height],scroll:[o.scrollTop,o.scrollHeight,o.clientHeight],horizontal:[o.scrollWidth,o.clientWidth],focus:document.activeElement.textContent?.trim().slice(0,90)};})()`);
  };
  for(const [w,h] of [[1280,800],[800,600]]){win.setSize(w,h);await sleep(120);await run('CK.toMenu()');await screen('menu-'+w);}
  await run(`window.journeyPad={index:0,id:'QA standard pad',mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[journeyPad],configurable:true});`);
  const pad=async key=>{await run(`journeyPad.buttons[${key}]={pressed:true,value:1}`);await sleep(100);await run(`journeyPad.buttons[${key}]={pressed:false,value:0}`);await sleep(100);};
  await run(`document.getElementById('tSettings').click()`);await screen('settings-800');
  await run(`document.getElementById('cFlash').focus()`);await pad(0);
  report.findings.controllerCheckbox=await run(`({focused:document.activeElement.id,checked:document.getElementById('cFlash').checked})`);
  await run(`document.getElementById('sShake').focus()`);const shakeBefore=await run(`document.getElementById('sShake').value`);await pad(14);
  report.findings.controllerRange=await run(`({before:${JSON.stringify(shakeBefore)},after:document.getElementById('sShake').value,focused:document.activeElement.id||document.activeElement.textContent.trim()})`);
  await run(`for(const id of ['cFlash']){const e=document.getElementById(id);e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));}const s=document.getElementById('sShake');s.value='0';s.dispatchEvent(new Event('input',{bubbles:true}));CK.toMenu();document.getElementById('tParty').click()`);await pad(0);await screen('party-joined-800');await pad(9);
  report.findings.controllerParty=await run(`({seats:CK.seats(),humans:CK.G().ents.filter(e=>e.human).length,demo:CK.G().demo})`);
  await run(`CK.toMenu();CK.openWardrobe()`);await screen('wardrobe-top-800');
  await run(`const b=document.querySelector('#collectionGoals .ck-presets button');b.focus();b.scrollIntoView({block:'center'})`);await screen('wardrobe-presets-800');await pad(0);
  report.findings.wardrobeFocus=await run(`({active:document.activeElement.tagName,inside:document.getElementById('wardrobe').contains(document.activeElement),scroll:document.getElementById('wardrobe').scrollTop})`);await pad(13);await screen('wardrobe-after-save-controller-down-800');
  await run(`CK.toMenu();CK.adventure.ui.open('banquet')`);await screen('campaign-map-800');
  await run(`CK.adventure.campaign.assist(true);CK.adventure.launch('banquet');CK.freeze(true);const g=CK.G(),me=g.ents[0];for(const e of g.ents.slice(1)){e.inv=0;e.protect=0;e.hitLock=0;e.blocking=false;e.dashT=0;CK.hurt(e,me,99,{src:'heavy',kb:0});}me.x=1100;me.y=440;me.vx=0;me.vy=0;CK.adv(100)`);await screen('campaign-results-800');
  await run(`CK.toMenu();CK.cfg.players=1;CK.startCup();CK.freeze(true);CK.G().time=.01;CK.adv(2)`);await screen('cup-results-800');
  await run(`const buttons=[...document.querySelectorAll('#cupResults button')];const cupReadyButton=buttons.find(e=>e.textContent==='Ready!');cupReadyButton.focus();cupReadyButton.click()`);await screen('cup-ready-800');
  report.findings.cupFocus=await run(`({focus:document.activeElement.textContent,dataset:document.activeElement.dataset.cupFocus})`);
  fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--assert-ux')){
   const checks=[['Controller checkbox',report.findings.controllerCheckbox.checked],['Controller range',Number(report.findings.controllerRange.after)<Number(report.findings.controllerRange.before)&&report.findings.controllerRange.focused==='sShake'],['Wardrobe focus',report.findings.wardrobeFocus.inside],['Small menu overflow',report.screens['menu-800'].horizontal[0]<=report.screens['menu-800'].horizontal[1]+1],['Controller party',report.findings.controllerParty.humans===1&&!report.findings.controllerParty.demo],['Cup ready focus',report.findings.cupFocus.dataset==='local:1-ready']];
   const failed=checks.filter(([,ok])=>!ok);if(failed.length)throw Error('Journey regression: '+failed.map(([label])=>label).join(', '));console.log('DESKTOP_JOURNEY_PASS '+checks.length);
  }
  win.close();app.quit();
 }).catch(e=>{console.error(e);app.exit(1);});
}
