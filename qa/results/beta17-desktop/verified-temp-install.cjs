// Copy only this checked game to a fresh marked acceptance install; no ACL edits.
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),record=path.join(__dirname,'temporary-install.json');if(fs.existsSync(record))throw Error('Refusing existing install evidence');
const source=path.join(root,'dist/Custard Knights-win32-x64'),owned=fs.mkdtempSync(path.join(os.tmpdir(),'custard-acceptance-beta17-install-')),target=path.join(owned,'Game');
fs.writeFileSync(path.join(owned,'acceptance-install.marker'),'Isolated exact beta17 package installation\n');fs.cpSync(source,target,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),files=[];
for(const name of fs.readdirSync(source,{recursive:true})){const original=path.join(source,name);if(!fs.statSync(original).isFile())continue;const copied=path.join(target,name),digest=hash(original);if(hash(copied)!==digest)throw Error('Copied install differs: '+name);files.push({file:name.replaceAll('\\','/'),bytes:fs.statSync(copied).size,sha256:digest});}
if(files.length!==73)throw Error('Unexpected checked install inventory');const result={source,ownedRoot:owned,marker:path.join(owned,'acceptance-install.marker'),target,executable:path.join(target,'Custard Knights.exe'),files,allExact:true,sourceCommit:'676e4de9e7a72cb3d5bfb745c8eac2da516a9aa0',reason:'Managed workspace install ACL rejected Electron sandbox token before renderer. Fresh default-permission temp installation in regular desktop context; no ACL or sandbox changes.'};fs.writeFileSync(record,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({target,files:files.length,allExact:true}));
