// Atlas pixel budget, not a claim about browser/GPU resident memory.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),box={window:{}},files=['knight.js','hero.js','knight-open.js','hero-open.js'];
function size(uri){const b=Buffer.from(uri.split(',')[1],'base64');if(b.toString('ascii',0,4)==='RIFF'){
 const kind=b.toString('ascii',12,16);if(kind==='VP8X')return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
 if(kind==='VP8L'){const bits=b.readUInt32LE(21);return [(bits&16383)+1,((bits>>>14)&16383)+1];}
 if(kind==='VP8 ')return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383];
 }if(b.toString('ascii',1,4)==='PNG')return [b.readUInt32BE(16),b.readUInt32BE(20)];throw Error('Unsupported atlas image header');}
const mib=n=>Math.round(n/1048576*100)/100,all=new Map(),results=[];
try{for(const file of files){const f=path.join(root,'sprites',file);if(fs.existsSync(f))vm.runInNewContext(fs.readFileSync(f,'utf8'),box,{filename:file,timeout:10000});}
 for(const [name,K]of Object.entries(box.window.CK_SPRITES||{})){const layers=[];function walk(v){if(!v||typeof v!=='object')return;if(typeof v.u==='string'){layers.push(v);return;}for(const value of Object.values(v))walk(value);}walk(K);let pixels=0;const unique=new Map();for(const {u}of layers){const [w,h]=size(u),bytes=w*h*4;pixels+=bytes;unique.set(u,bytes);all.set(u,bytes);}results.push({name,cell:K.cell,visorStyle:K.visorStyle||'legacy',layerImages:layers.length,uniqueImagePayloads:unique.size,rgbaMiBIfEachLayerSeparate:mib(pixels),uniqueRgbaMiB:mib([...unique.values()].reduce((a,b)=>a+b,0))});}
 console.log(JSON.stringify({note:'Decoded RGBA pixel budget. Browser JS heap, image-cache sharing, GPU textures, and compositor buffers are separate.',roots:results,combinedUniqueRgbaMiB:mib([...all.values()].reduce((a,b)=>a+b,0))},null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
