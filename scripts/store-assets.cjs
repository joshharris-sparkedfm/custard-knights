// Deterministic Steam exports from generated art masters and the game's existing native logotype.
// Requires sharp and @napi-rs/canvas (available in the Codex workspace dependency runtime).
const fs=require('node:fs'),path=require('node:path');
const sharp=require('sharp'),{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),sources=path.join(root,'art','store','source');
const out=path.join(root,'art','store','exports');fs.mkdirSync(out,{recursive:true});
if(!GlobalFonts.registerFromPath(path.join(root,'node_modules','@fontsource','lilita-one','files','lilita-one-latin-400-normal.woff'),'Lilita One'))throw Error('Lilita One font unavailable');
const logoCanvas=createCanvas(1280,720),ctx=logoCanvas.getContext('2d');
ctx.font='250px "Lilita One"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
for(const [word,y,color] of [['Custard',230,'#FFD23F'],['Knights',460,'#FF8FB1']]){
 ctx.strokeStyle='#1A1030';ctx.lineWidth=28;ctx.strokeText(word,640,y+16);
 ctx.lineWidth=20;ctx.strokeText(word,640,y);ctx.fillStyle=color;ctx.fillText(word,640,y);
}
const logo=logoCanvas.toBuffer('image/png');fs.writeFileSync(path.join(out,'library-logo.png'),logo);
const manifest=[];
async function capsule(name,width,height,source,placement){
 const art=await sharp(path.join(sources,source+'.png')).resize(width,height,{fit:'cover',position:'centre'}).png().toBuffer();
 const composites=[];
 if(placement){
  const [x,y,w]=placement,layer=await sharp(logo).resize(Math.round(width*w)).png().toBuffer();
  const meta=await sharp(layer).metadata();
  composites.push({input:layer,left:Math.round(width*x),top:Math.round(height*y-meta.height/2)});
 }
 const file=path.join(out,name+'.png');await sharp(art).composite(composites).png().toFile(file);
 manifest.push({file:name+'.png',width,height});
}
function ico(frames){
 const header=Buffer.alloc(6+frames.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(frames.length,4);
 let offset=header.length;
 frames.forEach(({size,data},i)=>{const entry=6+i*16;header[entry]=size===256?0:size;header[entry+1]=size===256?0:size;
  header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(data.length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=data.length;
 });return Buffer.concat([header,...frames.map(frame=>frame.data)]);
}
(async()=>{
 await capsule('header-capsule',920,430,'landscape',[.015,.50,.43]);
 await capsule('library-header',920,430,'landscape',[.015,.50,.43]);
 await capsule('main-capsule',1232,706,'landscape',[.025,.50,.42]);
 await capsule('vertical-capsule',748,896,'portrait',[.055,.175,.89]);
 await capsule('library-capsule',600,900,'portrait',[.055,.175,.89]);
 await capsule('library-hero',3840,1240,'hero',null);
 // The tiny capsule is deliberately logo-led, readable at Valve's generated 120x45 size.
 const small=createCanvas(462,174),sc=small.getContext('2d');sc.fillStyle='#392754';sc.fillRect(0,0,462,174);
 sc.font='110px "Lilita One"';sc.textAlign='center';sc.textBaseline='middle';sc.lineJoin='round';sc.lineWidth=9;sc.strokeStyle='#1A1030';
 for(const [word,y,color] of [['Custard',43,'#FFD23F'],['Knights',122,'#FF8FB1']]){sc.strokeText(word,231,y+3);sc.fillStyle=color;sc.fillText(word,231,y);}
 fs.writeFileSync(path.join(out,'small-capsule.png'),small.toBuffer('image/png'));manifest.push({file:'small-capsule.png',width:462,height:174});
 const icon=path.join(sources,'icon.png');
 await sharp(icon).resize(256,256).png().toFile(path.join(out,'shortcut-icon.png'));
 await sharp(icon).resize(184,184).jpeg({quality:95}).toFile(path.join(out,'app-icon.jpg'));
 const frames=[];for(const size of [16,24,32,48,64,128,256])frames.push({size,data:await sharp(icon).resize(size,size).png().toBuffer()});
 fs.writeFileSync(path.join(out,'app.ico'),ico(frames));
 fs.copyFileSync(path.join(out,'shortcut-icon.png'),path.join(root,'desktop','icon.png'));
 manifest.push({file:'library-logo.png',width:1280,height:720,transparent:true},{file:'shortcut-icon.png',width:256,height:256},{file:'app-icon.jpg',width:184,height:184},{file:'app.ico',frames:frames.map(frame=>frame.size)});
 const {createHash}=require('node:crypto');
 for(const asset of manifest){
  const file=path.join(out,asset.file);asset.sha256=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(asset.width){
   const actual=await sharp(file).metadata();
   if(actual.width!==asset.width||actual.height!==asset.height)throw Error('Wrong export size: '+asset.file);
   if(asset.transparent){const stats=await sharp(file).stats();if(!actual.hasAlpha||stats.channels[3].min!==0)throw Error('Logo lacks transparency');}
  }
 }
 const masters=[];for(const name of ['landscape','portrait','hero','icon']){const meta=await sharp(path.join(sources,name+'.png')).metadata();masters.push({file:name+'.png',width:meta.width,height:meta.height});}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({publisher:'Sparked FM Ltd',checked:'2026-10-08',sourceMasters:masters,assets:manifest},null,2)+'\n');
 // Review board includes the real upload files and their actual smallest presentations.
 const board=createCanvas(1800,1600),bc=board.getContext('2d');bc.fillStyle='#20172F';bc.fillRect(0,0,1800,1600);
 const {loadImage}=require('@napi-rs/canvas');
 const preview=async(name,x,y,w,h,label)=>{bc.fillStyle='#FFF4D6';bc.font='26px "Lilita One"';bc.fillText(label,x,y-12);bc.drawImage(await loadImage(path.join(out,name)),x,y,w,h);};
 await preview('header-capsule.png',40,95,920,430,'STORE / LIBRARY HEADER • 920 × 430');
 await preview('main-capsule.png',40,590,920,527,'MAIN CAPSULE • 1232 × 706');
 await preview('vertical-capsule.png',1010,95,350,419,'VERTICAL • 748 × 896');
 await preview('library-capsule.png',1400,95,350,525,'LIBRARY • 600 × 900');
 await preview('small-capsule.png',1010,685,462,174,'SMALL CAPSULE • 462 × 174');
 await preview('small-capsule.png',1010,915,120,45,'Steam reduction • 120 × 45');
 await preview('shortcut-icon.png',1510,685,256,256,'ICON • 256 × 256');
 await preview('shortcut-icon.png',1510,990,32,32,'32px');
 await preview('library-logo.png',1010,1070,570,321,'TRANSPARENT LOGO');
 await preview('library-hero.png',40,1215,920,297,'TEXT-FREE LIBRARY HERO • 3840 × 1240');
 fs.writeFileSync(path.join(root,'art','store','review-sheet.png'),board.toBuffer('image/png'));
 console.log('Exported '+manifest.length+' Steam assets to '+out);
})().catch(error=>{console.error(error);process.exitCode=1;});
