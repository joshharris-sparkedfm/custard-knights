const {packager}=require('@electron/packager');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');require('./vendor.cjs');require('./music.cjs');
fs.mkdirSync(path.join(root,'build'),{recursive:true});
const stage=fs.mkdtempSync(path.join(root,'build','stage-'));
for(const item of ['index.html','menu-theme.mp3','sprites','vendor','game','desktop','audio'])fs.cpSync(path.join(root,item),path.join(stage,item),{recursive:true});
fs.mkdirSync(path.join(stage,'art','keyart'),{recursive:true});fs.copyFileSync(path.join(root,'art','keyart','home.webp'),path.join(stage,'art','keyart','home.webp'));
const pkg=require('../package.json');fs.writeFileSync(path.join(stage,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName,author:pkg.author,license:pkg.license,version:pkg.version,main:pkg.main}));
packager({dir:stage,out:path.join(root,'dist'),name:'Custard Knights',platform:'win32',arch:'x64',electronVersion:pkg.devDependencies.electron,overwrite:true,asar:true,prune:true,appVersion:pkg.version,win32metadata:{ProductName:'Custard Knights',FileDescription:'Custard Knights'}}).then(paths=>console.log(paths.join('\n'))).catch(e=>{console.error(e);process.exitCode=1;});
