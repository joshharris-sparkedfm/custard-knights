// Evidence-only cache selection: no package configuration or extraction changes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'../../..'),prior=JSON.parse(fs.readFileSync(path.join(root,'qa/results/beta16-desktop/python-template.json'),'utf8'));
 const expected='eee30dc8fa1f5ea95490e59f44e46ea68dd24c6e93d22facf70fe5c2d4c2665c';
 const {Packager}=await import(pathToFileURL(path.join(root,'node_modules/@electron/packager/dist/packager.js')).href);
 Packager.prototype.getElectronZipPath=async function(opts){
  if(opts.version!=='44.7.0'||opts.platform!=='win32'||opts.arch!=='x64')throw Error('Unexpected Electron template request');
  const digest=crypto.createHash('sha256').update(fs.readFileSync(prior.zip)).digest('hex');if(digest!==expected||prior.zipSha256!==expected)throw Error('Cached Electron ZIP identity changed');
  fs.writeFileSync(path.join(__dirname,'cached-template-selection.json'),JSON.stringify({reason:'First build downloader network request blocked before extraction; choose already verified cached template without network',request:opts,path:prior.zip,sha256:digest,expected,priorEvidence:'qa/results/beta16-desktop/python-template.json',packageConfigUnchanged:true,extractionAdapterUnchanged:true},null,2)+'\n');return prior.zip;
 };
 require('./build-python-extract.cjs');
})().catch(e=>{console.error(e);process.exitCode=1;});
