const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'game/bakery-opening.js'),'utf8');
function render(states){
 const images=[],drawn=[],root={Image:function(){const image={complete:states[images.length],naturalWidth:states[images.length]?512:0};images.push(image);return image;}};
 vm.runInNewContext(code,root);const B=root.CKBakeryOpening;
 const ctx=new Proxy({drawImage:(...args)=>drawn.push(args)},{get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const run={prelude:true,quietKind:'opening',node:{id:'banquet'}};
 const before=JSON.stringify(run);B.scenery(ctx,run);assert.equal(JSON.stringify(run),before);
 return {images,drawn};
}
test('incomplete or failed community assets retain a drawable bakery without throwing',()=>{
 for(const states of [[false,false],[true,false],[false,true]])assert.equal(render(states).drawn.length,0);
});
test('loaded scenery uses local sprites and keeps the bread crates inside the bakery solid footprint',()=>{
 const {images,drawn}=render([true,true]);assert.equal(drawn.length,3);
 assert.deepEqual(images.map(i=>i.src),['sprites/community/bakery-stall.png','sprites/community/bread-crate.png']);
 for(const [,x,y,w,h] of drawn){assert.ok(x>=120&&x+w<=520);assert.ok(y+h<=360);}
 for(const im of images){const p=path.join(root,im.src),b=fs.readFileSync(p);assert.equal(b.subarray(1,4).toString(),'PNG');assert.ok(b.readUInt32BE(16)<=512&&b.readUInt32BE(20)<=512);}
 const sources=JSON.parse(fs.readFileSync(path.join(root,'sprites/community/sources.json')));assert.equal(sources.length,2);assert.ok(sources.every(e=>e.source.startsWith('https://www.meshy.ai/posts/')&&e.license.startsWith('CC0')));
});
