// Verifies the packaged runtime matches the current source and records exact content hashes.
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),archive=path.join(root,'dist','Custard Knights-win32-x64','resources','app.asar');
const hash=value=>createHash('sha256').update(value).digest('hex');
(async()=>{
 const asar=await import('@electron/asar'),files=[];
 for(const entry of asar.listPackage(archive)){
  const native=entry.replace(/^[/\\]+/,''),name=native.replaceAll('\\','/');
  if(asar.statFile(archive,native).files)continue;
  if(!['index.html','menu-theme.mp3','package.json','art/keyart/home.webp'].includes(name)&&
   !/^(desktop|game|sprites|vendor|audio)\//.test(name))throw Error('Unexpected packaged file: '+name);
  if(/\.(md|psd|log)$/.test(name)||name.split('/').some(part=>part.startsWith('.')))throw Error('Developer/scratch content packaged: '+name);
  const data=asar.extractFile(archive,native),digest=hash(data);
  if(name==='package.json'){
   const bundled=JSON.parse(data),source=JSON.parse(fs.readFileSync(path.join(root,name)));
   for(const key of ['name','productName','author','license','version','main'])if(bundled[key]!==source[key])throw Error('Stale packaged metadata: '+key);
   if(bundled.devDependencies||bundled.scripts)throw Error('Developer package metadata shipped');
  }else if(hash(fs.readFileSync(path.join(root,name)))!==digest)throw Error('Source changed since packaging: '+name);
  files.push({file:name,sha256:digest,bytes:data.length});
 }
 for(const required of ['desktop/icon.png','desktop/assets.cjs','game/campaign.js','game/collection.js','game/cup.js','sprites/knight-open.js','sprites/hero-open.js','vendor/lilita-one-LICENSE.txt','vendor/peerjs-LICENSE.txt'])
  if(!files.some(row=>row.file===required))throw Error('Required runtime file absent: '+required);
 files.sort((a,b)=>a.file.localeCompare(b.file));
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
 const record={checkedAt:new Date().toISOString(),version:pkg.version,publisher:pkg.author,
  archiveSha256:hash(fs.readFileSync(archive)),executableSha256:hash(fs.readFileSync(path.join(root,'dist','Custard Knights-win32-x64','Custard Knights.exe'))),runtimeSourceSha256:hash(JSON.stringify(files)),files};
 fs.mkdirSync(path.join(root,'build'),{recursive:true});fs.writeFileSync(path.join(root,'build','desktop-evidence.json'),JSON.stringify(record,null,2)+'\n');
 console.log('DESKTOP_PACKAGE_PASS '+JSON.stringify({version:record.version,files:files.length,archiveSha256:record.archiveSha256,runtimeSourceSha256:record.runtimeSourceSha256}));
})().catch(error=>{console.error(error);process.exitCode=1;});
