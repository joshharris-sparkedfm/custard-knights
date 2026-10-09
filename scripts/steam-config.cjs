// Generates upload inputs locally. Does not log in, upload, or make a build live.
const fs=require('node:fs'),path=require('node:path');
function generateSteamConfig(appId,depotId,root=path.resolve(__dirname,'..')){
 const valid=id=>/^[1-9]\d*$/.test(id||'')&&Number.isSafeInteger(Number(id))&&Number(id)<=4294967295;
 if(!valid(appId)||!valid(depotId))throw Error('Usage: node scripts/steam-config.cjs YOUR_APP_ID YOUR_WINDOWS_DEPOT_ID');
 const content=path.join(root,'dist','Custard Knights-win32-x64');
 if(!fs.existsSync(path.join(content,'Custard Knights.exe'))||!fs.existsSync(path.join(content,'resources','app.asar')))
  throw Error('Run npm run package:win first; the complete packaged folder is required');
 const out=path.join(root,'build','steam'),logs=path.join(out,'logs');
 const clean=value=>{if(/["\r\n]/.test(value))throw Error('Steam build path contains unsupported characters');return value.replaceAll('\\','/');};
 const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
 if(!/^[\dA-Za-z.+-]+$/.test(version))throw Error('Invalid package version');
 const contentRoot=clean(content),buildOutput=clean(logs);fs.mkdirSync(logs,{recursive:true});
 const depot=path.join(out,`depot_build_${depotId}.vdf`),app=path.join(out,`app_build_${appId}.vdf`);
 fs.writeFileSync(depot,`"DepotBuild"\n{\n "DepotID" "${depotId}"\n "FileMapping"\n {\n  "LocalPath" "*"\n  "DepotPath" "."\n  "Recursive" "1"\n }\n}\n`);
 fs.writeFileSync(app,`"AppBuild"\n{\n "AppID" "${appId}"\n "Desc" "Custard Knights ${version} candidate"\n "ContentRoot" "${contentRoot}"\n "BuildOutput" "${buildOutput}"\n "Preview" "1"\n "SetLive" ""\n "Depots"\n {\n  "${depotId}" "depot_build_${depotId}.vdf"\n }\n}\n`);
 return {out,app,depot};
}
if(require.main===module){
 try{const [appId,depotId]=process.argv.slice(2);const {out}=generateSteamConfig(appId,depotId);console.log('Created preview-only VDFs in '+out+'. Inspect the preview manifest before changing Preview to 0 for an upload.');}
 catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={generateSteamConfig};
