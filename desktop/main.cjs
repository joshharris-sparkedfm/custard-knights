const {app,BrowserWindow,protocol,net,session}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const acceptance=require('./acceptance.cjs').options(process.argv,app.getPath('temp'));
const onlineSmoke=process.argv.includes('--online-smoke');
const factionSmoke=process.argv.includes('--faction-smoke');
const smoke=process.argv.includes('--smoke-test')||onlineSmoke||factionSmoke||!!acceptance;
app.setName('Custard Knights');
const userData=acceptance?acceptance.profile:smoke?fs.mkdtempSync(path.join(app.getPath('temp'),'custard-smoke-')):path.join(app.getPath('appData'),'Custard Knights');
fs.mkdirSync(userData,{recursive:true});app.setPath('userData',userData);
const useLock=!smoke||acceptance&&['launcher','duplicate'].includes(acceptance.phase);
const primary=!useLock||app.requestSingleInstanceLock();
if(!primary){if(acceptance)console.log('DESKTOP_DUPLICATE_EXIT');app.quit();}
protocol.registerSchemesAsPrivileged([{scheme:'custard',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let win;
app.on('second-instance',()=>{if(win&&!win.isDestroyed()){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(async()=>{
 if(!primary)return;
 const root=path.resolve(__dirname,'..');
 const serve=require('./assets.cjs').createAssetHandler(root,net);
 protocol.handle('custard',serve);
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.setPermissionCheckHandler(()=>false);
 if(smoke&&!onlineSmoke&&!factionSmoke)session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 win=new BrowserWindow({width:1280,height:800,minWidth:800,minHeight:600,backgroundColor:'#201b2b',show:!smoke,autoHideMenuBar:true,icon:path.join(root,'desktop','icon.png'),
  webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',event=>event.preventDefault());
 win.webContents.on('will-redirect',event=>event.preventDefault());
 win.webContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='F11'&&!input.isAutoRepeat){win.setFullScreen(!win.isFullScreen());event.preventDefault();}});
 win.on('close',()=>win.webContents.session.flushStorageData());
 await win.loadURL('custard://game/index.html'+(smoke?'?qa=1':''));
 if(acceptance){await require('./acceptance.cjs').run({app,win,options:acceptance});return;}
 if(factionSmoke){await require('./faction-smoke.cjs')({app,win});return;}
 if(onlineSmoke){await require('./online-smoke.cjs')({app,BrowserWindow,session,serve,host:win});return;}
 if(smoke){
  const watchdog=setTimeout(()=>{console.error('Desktop smoke timed out');app.exit(1);},45000);
  try{
   const result=await win.webContents.executeJavaScript(`(async()=>{
    await document.fonts.ready;await CK.sprLoadAll();
    if(!CK.spritesReady())throw Error('Sprite base failed to load');
    if(typeof require!=='undefined'||typeof process!=='undefined')throw Error('Node exposed to renderer');
    const r=await fetch('vendor/peerjs.min.js');if(!r.ok)throw Error('Missing online library');
    localStorage.setItem('desktop-smoke','ok');if(localStorage.getItem('desktop-smoke')!=='ok')throw Error('Save failed');
    CK.begin({map:'courtyard',mode:'ffa',humans:1});CK.G().time=1;CK.adv(120);
    if(!CK.G().over)throw Error('Match did not finish');
    return {origin:location.origin,sprites:CK.spritesReady(),fonts:document.fonts.check('16px "Lilita One"'),matchEnded:CK.G().over};
   })()`);
   await win.loadURL('custard://game/index.html?qa=1');
   const persisted=await win.webContents.executeJavaScript("localStorage.getItem('desktop-smoke')==='ok'&&CK.PROG.matches===1");
   if(!persisted)throw Error('Progress did not survive reload');
   console.log('DESKTOP_SMOKE_PASS '+JSON.stringify({...result,persisted,externalNetworkBlocked:true}));clearTimeout(watchdog);app.exit(0);
  }catch(e){console.error(e);clearTimeout(watchdog);app.exit(1);}
 }
}).catch(e=>{console.error(e);app.exit(1);});
app.on('window-all-closed',()=>app.quit());
