const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../game/campaign.js'),B=require('../game/bakery-opening.js');
const context=()=>{const calls=[];return {calls,ctx:new Proxy({}, {get(t,k){return k in t?t[k]:(...args)=>calls.push([k,...args]);},set(t,k,v){t[k]=v;return true;}})};};
function fixture(home=false,drawBakeryActor){const c=C.create({storage:null}),api={makeKnight:o=>({r:22,dead:false,falling:0,fx:{},vx:0,vy:0,...o}),redraw(){},drawBakeryActor},g={roundId:'cast',ents:[api.makeKnight({id:0,human:1})],flows:new Map()};c.restore(C.normalize({results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true],attempts:1,best:30}]))}));if(home)c.beginHomecoming(g,api);else c.beginPrelude(g,api);return {c,g};}
test('bakery cameos stay outside the combat roster and preserve story state during rendering',()=>{
 const actors=[],{c,g}=fixture(true,(ctx,p)=>{actors.push(p);return true;}),{ctx,calls}=context(),before=JSON.stringify({save:c.save,staff:c.run.staff,cast:c.run.homecoming,player:c.run.player,grid:g.grid});
 const previous=globalThis.CKBakeryOpening;globalThis.CKBakeryOpening=B;try{c.draw(ctx);}finally{if(previous===undefined)delete globalThis.CKBakeryOpening;else globalThis.CKBakeryOpening=previous;}assert.deepEqual(actors.filter(p=>p.kind!=='cook').map(p=>p.role||p.kind),['bran','stirling','chicken']);assert.deepEqual(actors.filter(p=>p.kind==='cook').map(p=>p.name),['Mabel','Alf','Pip']);assert.equal(g.ents.length,1);assert.equal(JSON.stringify({save:c.save,staff:c.run.staff,cast:c.run.homecoming,player:c.run.player,grid:g.grid}),before);
 for(const name of ['Mabel','Alf','Pip','Bran','Sir Stirling','Bran · striped shield','Steve · eating scraps'])assert.ok(calls.some(a=>a[0]==='fillText'&&a[1]===name),name);
});
test('unavailable sprite hook retains exactly the illustrated cameo drawing',()=>{
 for(const home of [false,true]){const {c}=fixture(home),a=context(),b=context();B.draw(a.ctx,c.run);B.draw(b.ctx,c.run,()=>false);assert.deepEqual(a.calls,b.calls);}
});
test('Steve animation follows theft timing without moving the story state or leaving his enclosure',()=>{
 const {c}=fixture(),{ctx}=context();for(const t of [0,.5,1,1.5,2,2.5]){c.run.steve.theft=t;let actor;const before=JSON.stringify(c.run.steve);B.draw(ctx,c.run,(target,p)=>{if(p.kind==='chicken')actor=p;return true;});assert.equal(JSON.stringify(c.run.steve),before);assert.equal(actor.kind,'chicken');assert.equal(actor.moving,t>0&&t<2.4);assert.ok(actor.x>=943&&actor.x<=988);assert.equal(actor.y,338);}
});
test('sprite bridge honors classic mode and restores the drawing target even if composition fails',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),start=html.indexOf('function drawBakeryActor('),code=html.slice(start,html.indexOf('const sprTop=',start)),old={},target=context().ctx;
 const box={ctx:old,useSprites:()=>false,drawChickenSprite(){throw Error('composition failed');},drawKnightSprite:()=>true};vm.runInNewContext(code,box);
 assert.equal(box.drawBakeryActor(target,{kind:'knight'}),false);assert.equal(box.ctx,old);
 box.useSprites=()=>true;assert.throws(()=>box.drawBakeryActor(target,{kind:'chicken',x:1,y:2}),/composition failed/);assert.equal(box.ctx,old);
 assert.equal(box.drawBakeryActor(target,{kind:'knight',role:'bran',x:1,y:2}),true);assert.equal(box.ctx,old);
});
