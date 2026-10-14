// Evidence-only packaging workaround: unchanged packager/createStage/config;
// replaces only Packager's Electron template extraction method in memory.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const {Packager}=await import(pathToFileURL(path.join(root,'node_modules/@electron/packager/dist/packager.js')).href);
 Packager.prototype.extractElectronZip=async function(opts,zipPath,buildDir){
  if(this.opts.afterExtract?.length)throw Error('Unexpected extraction hooks');
  const script=`from pathlib import Path
import zipfile,hashlib,json,sys,os,time
zpath,target,out=map(Path,sys.argv[1:])
with zipfile.ZipFile(zpath) as z:
 assert z.testzip() is None
 z.extractall(target)
 files=[]
 for info in z.infolist():
  if info.is_dir():continue
  p=target/info.filename;data=z.read(info.filename)
  assert p.read_bytes()==data
  os.utime(p,None)
  files.append(dict(path=info.filename,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
assert next(f for f in files if f['path']=='electron.exe')['sha256']=='2529b494f4123f152bce346051f7bd855ef95006424a561953cf17c49a3d1ba8'
out.write_text(json.dumps(dict(zip=str(zpath),zipSha256=hashlib.file_digest(zpath.open('rb'),'sha256').hexdigest(),crcPassed=True,template=str(target),files=files),indent=2)+'\\n')
`;
  execFileSync('C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',['-c',script,zipPath,buildDir,path.join(__dirname,'python-template.json')],{stdio:'inherit',windowsHide:true});
 };
 await require(path.join(root,'scripts/package.cjs')).packageWindows();
})().catch(e=>{console.error(e);process.exitCode=1});
