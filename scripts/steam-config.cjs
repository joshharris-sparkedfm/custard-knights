// Generates upload inputs locally. Does not log in, upload, or make a build live.
const fs=require('node:fs'),path=require('node:path');
const [appId,depotId]=process.argv.slice(2);
if(!/^[1-9]\d*$/.test(appId||'')||!/^[1-9]\d*$/.test(depotId||''))throw Error('Usage: node scripts/steam-config.cjs YOUR_APP_ID YOUR_WINDOWS_DEPOT_ID');
const root=path.resolve(__dirname,'..'),content=path.join(root,'dist','Custard Knights-win32-x64');
if(!fs.existsSync(path.join(content,'Custard Knights.exe')))throw Error('Run npm run package:win first');
const out=path.join(root,'build','steam'),logs=path.join(out,'logs');fs.mkdirSync(logs,{recursive:true});
const clean=v=>v.replaceAll('\\','/');
fs.writeFileSync(path.join(out,`depot_build_${depotId}.vdf`),`"DepotBuild"\n{\n "DepotID" "${depotId}"\n "FileMapping"\n {\n  "LocalPath" "*"\n  "DepotPath" "."\n  "Recursive" "1"\n }\n}\n`);
fs.writeFileSync(path.join(out,`app_build_${appId}.vdf`),`"AppBuild"\n{\n "AppID" "${appId}"\n "Desc" "Custard Knights 0.1.0 candidate"\n "ContentRoot" "${clean(content)}"\n "BuildOutput" "${clean(logs)}"\n "Preview" "1"\n "SetLive" ""\n "Depots"\n {\n  "${depotId}" "depot_build_${depotId}.vdf"\n }\n}\n`);
console.log('Created preview-only VDFs in '+out+'. Inspect the preview manifest before changing Preview to 0 for an upload.');
