const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Cooks=require('../game/cook-sprites.js'),C=require('../game/campaign.js');
const root=path.resolve(__dirname,'..'),box={};vm.runInNewContext(fs.readFileSync(path.join(root,'sprites/community-cooks.js'),'utf8'),box);const atlases=box.CK_COOK_SPRITES;
test('cook sprites load independently and preserve the actor while waiting or drawing',()=>{
 const images=[],api=Cooks.create({atlases,ImageCtor:function(){images.push(this);}}),calls=[],ctx={drawImage:(...a)=>calls.push(a)},p={name:'Mabel',x:455,y:424,time:1,speed:58,face:0},before=JSON.stringify(p);
 assert.equal(api.draw(ctx,p),false);images[0].complete=true;images[0].naturalWidth=1024;assert.equal(api.draw(ctx,p),true);assert.equal(api.draw(ctx,{...p,name:'Alf'}),false);assert.equal(api.draw(ctx,{...p,name:'Pip'}),false);assert.equal(JSON.stringify(p),before);assert.equal(calls.length,1);assert.ok(calls[0].slice(1).every(Number.isFinite));
 images[1].complete=true;images[1].naturalWidth=0;assert.equal(api.draw(ctx,{...p,name:'Alf'}),false);
});
test('every direction and idle/walk/run frame references a valid local packed rectangle',()=>{
 let decoded=0;for(const atlas of Object.values(atlases)){
  const png=fs.readFileSync(path.join(root,atlas.url));assert.equal(png.subarray(1,4).toString(),'PNG');const w=png.readUInt32BE(16),h=png.readUInt32BE(20);decoded+=w*h*4;assert.equal(atlas.rects.length,112);
  for(const [x,y,rw,rh,dx,dy]of atlas.rects){assert.ok([x,y,rw,rh,dx,dy].every(Number.isFinite));assert.ok(x>=0&&y>=0&&rw>0&&rh>0&&x+rw<=w&&y+rh<=h);}
  for(let d=0;d<8;d++)for(const [animation,speed]of [['idle',0],['walk',65],['run',160]]){const seen=new Set();for(let i=0;i<atlas.anims[animation][1];i++)seen.add(Cooks.frameFor(atlas,{face:d*Math.PI/4,speed,time:atlas.seconds[animation]*(i+.1)/atlas.anims[animation][1]}));assert.equal(seen.size,atlas.anims[animation][1]);for(const frame of seen)assert.ok(Math.floor(frame/atlas.per)===d);}
  assert.ok(Number.isInteger(Cooks.frameFor(atlas,{time:NaN,speed:Infinity,face:NaN})));
 }const cooks=Object.keys(atlases).length;assert.equal(cooks,3);assert.ok(decoded<cooks*3*1024*1024,'Each cook stays within a 3 MiB decoded atlas budget on average');
});
test('escorted cooks stop their movement animation when the player leaves or a leader blocks them',()=>{
 const c=C.create({storage:null}),api={makeKnight:o=>({r:22,dead:false,falling:0,fx:{},vx:0,vy:0,...o}),redraw(){}},g={roundId:'cooks',ents:[api.makeKnight({id:0,human:1})],flows:new Map()};c.begin('banquet',g,api);c.run.phase=1;c.run.barricadeOpen=true;g.ents.slice(1).forEach(e=>e.dead=true);
 const s=c.run.staff[0];Object.assign(c.run.player,{x:s.x,y:s.y});c.tick(.1);assert.ok(s.renderSpeed>0);assert.ok(Number.isFinite(s.face));Object.assign(c.run.player,{x:40,y:740});c.tick(.1);assert.equal(s.waiting,true);assert.equal(s.renderSpeed,0);
});
