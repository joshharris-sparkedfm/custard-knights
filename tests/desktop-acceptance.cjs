// node tests/desktop-acceptance.cjs [path/to/Custard Knights.exe]
// Launches independent real processes. Never opens the player's normal save profile.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-'));
const profile=path.join(temporary,'user-data');
fs.writeFileSync(path.join(temporary,'acceptance-profile.marker'),'Isolated acceptance profile\n');
const packaged=process.argv[2]&&path.resolve(process.argv[2]);
const executable=packaged||require('electron');
const run=(exe,phase)=>{
 const args=[...(!packaged?[root]:[]),`--acceptance-phase=${phase}`,`--acceptance-profile=${profile}`];
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const result=spawnSync(exe,args,{cwd:temporary,env,encoding:'utf8',timeout:60000,windowsHide:true});
 if(result.error||result.status!==0||!result.stdout.includes('DESKTOP_ACCEPTANCE_PASS'))
  throw Error(`Acceptance ${phase} failed: ${result.error||result.status}\n${result.stdout}\n${result.stderr}`);
 console.log(result.stdout.trim());
};
try{
 run(executable,'write');run(executable,'read');run(executable,'launcher');
 if(packaged){
  const relocated=path.join(temporary,'updated-install');
  fs.cpSync(path.dirname(packaged),relocated,{recursive:true});
  run(path.join(relocated,path.basename(packaged)),'read');
 }
 console.log('DESKTOP_RESTART_PASS: fresh profile, normal close, separate processes'+(packaged?', relocated complete installation':'')+', earned legacy/collection rewards, pinned partial goal, outfit preset, campaign spoons/unlock/assistance, settings, offline assets, launcher reuse and fullscreen');
}finally{
 // The harness owns this marked directory and all child processes have exited.
 fs.rmSync(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});
}
