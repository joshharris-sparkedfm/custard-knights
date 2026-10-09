'use strict';
// Isolated QA runner for the frozen application's real ASAR assets and protocol handler.
// It never opens the player's profile or edits the packaged application.
const {app,BrowserWindow,protocol,net,session}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const value=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const archive=path.resolve(value('--qa-archive')||''),profile=path.resolve(value('--qa-profile')||'');
if(path.basename(archive)!=='app.asar'||!fs.existsSync(archive)||!path.basename(path.dirname(profile)).startsWith('ck-soundtrack-browser-'))throw Error('Explicit frozen archive and isolated QA profile required');
app.setPath('userData',profile);
protocol.registerSchemesAsPrivileged([{scheme:'custard',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
app.whenReady().then(async()=>{
 protocol.handle('custard',require(archive+'/desktop/assets.cjs').createAssetHandler(archive,net));
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.setPermissionCheckHandler(()=>false);
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 const window=new BrowserWindow({width:1280,height:800,show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 await window.loadURL('about:blank');
}).catch(error=>{console.error(error);app.exit(1);});
app.on('window-all-closed',()=>app.quit());
