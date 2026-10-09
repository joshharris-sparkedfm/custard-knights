const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');

function createStage(project=root){
 const build=path.join(project,'build');fs.mkdirSync(build,{recursive:true});
 const stage=fs.mkdtempSync(path.join(build,'stage-'));
 try{
  for(const file of ['index.html','menu-theme.mp3','art/keyart/home.webp',
   'desktop/main.cjs','desktop/assets.cjs','desktop/acceptance.cjs','desktop/online-smoke.cjs','desktop/faction-smoke.cjs','desktop/icon.png']){
   const target=path.join(stage,file);fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.copyFileSync(path.join(project,file),target);
  }
  for(const directory of ['sprites','vendor','game','audio'])
   fs.cpSync(path.join(project,directory),path.join(stage,directory),{recursive:true,filter:source=>{
    const stat=fs.lstatSync(source);
    if(stat.isSymbolicLink())throw Error('Release asset is a symlink: '+source);
    if(path.basename(source).startsWith('.'))return false;
    return stat.isDirectory()||/\.(js|css|woff2|mp3|ogg|wav|webp|png|json|txt)$/i.test(source);
   }});
  const pkg=JSON.parse(fs.readFileSync(path.join(project,'package.json'),'utf8'));
  fs.writeFileSync(path.join(stage,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName,
   author:pkg.author,license:pkg.license,version:pkg.version,main:pkg.main}));
  return {stage,pkg};
 }catch(error){fs.rmSync(stage,{recursive:true,force:true});throw error;}
}

async function packageWindows(){
 require('./vendor.cjs');require('./music.cjs').writeCatalog();
 const {stage,pkg}=createStage();
 try{
  const {packager}=require('@electron/packager');
  const paths=await packager({dir:stage,out:path.join(root,'dist'),name:'Custard Knights',platform:'win32',arch:'x64',
   electronVersion:pkg.devDependencies.electron,overwrite:true,asar:true,prune:true,appVersion:pkg.version,
   appCopyright:'Copyright © 2026 Sparked FM Ltd',
   icon:path.join(root,'art','store','exports','app.ico'),
   win32metadata:{ProductName:'Custard Knights',FileDescription:'Custard Knights',CompanyName:'Sparked FM Ltd'}});
  console.log(paths.join('\n'));
 }finally{fs.rmSync(stage,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
}
if(require.main===module)packageWindows().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={createStage,packageWindows};
