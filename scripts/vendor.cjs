const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'vendor');fs.mkdirSync(out,{recursive:true});
const copy=(src,dest)=>fs.copyFileSync(path.join(root,'node_modules',src),path.join(out,dest));
copy('peerjs/dist/peerjs.min.js','peerjs.min.js');copy('peerjs/LICENSE','peerjs-LICENSE.txt');
let notices='Bundled PeerJS dependencies. See peerjs-LICENSE.txt for PeerJS itself.\n';
for(const pkg of ['@msgpack/msgpack','eventemitter3','peerjs-js-binarypack','webrtc-adapter','sdp']){
 const dir=path.join(root,'node_modules',pkg),meta=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
 const license=fs.readdirSync(dir).find(f=>/^licen[cs]e(\..*)?$/i.test(f));if(!license)throw Error('Missing license: '+pkg);
 notices+=`\n--- ${pkg} ${meta.version} ---\n`+fs.readFileSync(path.join(dir,license),'utf8')+'\n';
}
fs.writeFileSync(path.join(out,'peerjs-THIRD-PARTY-NOTICES.txt'),notices.trimEnd()+'\n');
let css='/* Local fonts: licenses included alongside these files. */\n';
for(const [family,name,weights] of [['lilita-one','Lilita One',[400]],['nunito','Nunito',[600,800,900]]]){
 copy(`@fontsource/${family}/LICENSE`,`${family}-LICENSE.txt`);
 for(const weight of weights){const f=`${family}-latin-${weight}-normal.woff2`;copy(`@fontsource/${family}/files/${f}`,f);css+=`@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};font-display:swap;src:url('./${f}') format('woff2')}\n`;}
}
fs.writeFileSync(path.join(out,'fonts.css'),css);
