const test=require('node:test'),assert=require('node:assert/strict'),H=require('../game/channel-support.js'),C=require('../game/campaign.js'),S=require('../game/story-scenes.js');
const arena=()=>({grid:Array.from({length:18},(_,r)=>Array.from({length:32},(_,c)=>r===0||r===17||c===0||c===31?'#':'.'))});
function clear(g,x,y){const r=17.6;for(let a=Math.floor((y-r-80)/40);a<=Math.floor((y+r-80)/40);a++)for(let b=Math.floor((x-r)/40);b<=Math.floor((x+r)/40);b++){const t=g.grid[a]?.[b];if(t==='.'||t==='~')continue;const nx=Math.max(b*40,Math.min(x,(b+1)*40)),ny=Math.max(80+a*40,Math.min(y,80+(a+1)*40));if(Math.hypot(x-nx,y-ny)<r)return false;}return true;}
test('cooling channel collision footprint keeps both dry routes and reachable ordered landing centers',()=>{
 const g=arena();H.layout(g,'bridge');for(const c of [8,16,24])for(let r=4;r<=14;r++)assert.equal(g.grid[r][c],'o');
 for(const y of [200,720])for(let x=180;x<=1100;x+=5)assert.ok(clear(g,x,y),'dry outer route '+x+','+y);
 for(const x of [180,480,800,1100])for(let y=200;y<=440;y+=5)assert.ok(clear(g,x,y),'dry landing descent '+x+','+y);
 for(const [a,b] of [[440,480],[760,800]])for(let x=a;x<=b;x+=5)assert.ok(clear(g,x,440));
 assert.equal(clear(g,340,440),false);assert.ok(clear(g,300,440));assert.ok(clear(g,380,440));
});
test('service gate seals the full playable height until the tools hold opens it',()=>{
 const g=arena();H.layout(g,'stirling');for(let row=1;row<=16;row++)assert.equal(g.grid[row][21],'#');assert.equal(clear(g,860,440),false);H.access(g,true);for(let x=720;x<=1000;x+=5)assert.ok(clear(g,x,440));
});
test('bridge and support theatre replace the examination with the actionable cooling route',()=>{
 for(const id of ['bridge','stirling'])for(const phase of ['intro','outro'])assert.doesNotMatch(S.scenes[id][phase].cues.map(c=>c.text).join(' '),/examination|paperwork|compulsory|knighthood|protect lunch/i);
 assert.match(S.scenes.stirling.intro.cues.map(c=>c.text).join(' '),/north lane.*tool cart.*shield raider.*hold the tools/i);
 assert.deepEqual(C.byId.stirling.requires,['bridge']);assert.equal(C.checkpointLabel({id:'stirling',phase:1}),'Clear service access');assert.equal(C.checkpointLabel({id:'stirling',phase:2}),'Hold the tools');
});
test('Steve service scenery keeps the traversable arena unchanged and points food motivation at the bowl winch',()=>{
 const g=arena(),before=JSON.stringify(g.grid),labels=[],calls=[];let depth=0;
 const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));if(key==='save')depth++;if(key==='restore')assert.ok(--depth>=0);if(key==='fillText')labels.push(args[0]);calls.push(key);};}});
 const r={node:{id:'steve'},g,route:0,cage:{c:9,r:8,x:380,y:420},gates:[{x:580,y:300,r:65},{x:820,y:540,r:65},{x:1100,y:440,r:75}]};g.grid[8][9]='x';const closed=JSON.stringify(g.grid);H.scenery(ctx,r);H.draw(ctx,r);assert.equal(JSON.stringify(g.grid),closed);assert.equal(depth,0);assert.ok(calls.includes('ellipse'));assert.ok(labels.includes('MABEL’S BAKERY SCRAPS'));assert.ok(labels.includes('SIEGE BOWL'));assert.ok(labels.includes('WINCH'));
 g.grid[8][9]='.';assert.equal(JSON.stringify(g.grid),before);H.scenery(ctx,r);H.draw(ctx,r);assert.equal(depth,0);assert.equal(JSON.stringify(g.grid),before);
 for(const phase of ['intro','outro']){const text=S.scenes.steve[phase].cues.map(c=>c.text).join(' ');assert.match(text,/bakery scraps/i);assert.match(text,/winch/i);assert.doesNotMatch(text,/banners|fortress|dawn of time/i);}
 assert.match(C.byId.steve.objective,/service gates.*siege-bowl winch/);assert.deepEqual(C.byId.steve.requires,['stirling']);
});
test('safe rescue foreground keeps Bran inside the real tile until cut, then shows neutral support without mutating geometry',()=>{
 const g=arena();g.grid[8][22]='x';const before=JSON.stringify(g.grid),labels=[];let depth=0;
 const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));if(key==='save')depth++;if(key==='restore')assert.ok(--depth>=0);if(key==='fillText')labels.push(args[0]);};}});
 const r={node:{id:'rind'},g,elapsed:4,phase:2,cage:{x:900,y:420},rescue:{freed:false,guard:{x:900,y:420},rind:{x:800,y:440,supporting:false}}};
 H.scenery(ctx,r);H.rescueForeground(ctx,r);assert.equal(JSON.stringify(g.grid),before);assert.equal(depth,0);assert.ok(labels.includes('BRAN · TRAPPED'));assert.ok(labels.includes('RIND · SPOON LOWERED'));
 r.rescue.freed=true;r.rescue.guard={x:980,y:520};r.rescue.rind.supporting=true;H.rescueForeground(ctx,r);assert.equal(depth,0);assert.ok(labels.includes('RIND · WINCH SIDE'));assert.ok(!labels.some(s=>s.startsWith('Rind:')));assert.equal(JSON.stringify(g.grid),before);
});
test('sluice scene moves the bowl only with earned progress and keeps actors and tools outside the winch target',()=>{
 const g=arena(),calls=[];let depth=0;
 const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));if(key==='save')depth++;if(key==='restore')assert.ok(--depth>=0);calls.push([key,...args]);};}});
 const r={node:{id:'rind'},g,elapsed:5,rescue:{guard:{x:1130,y:610},rind:{x:1130,y:460}},finale:{jammed:true,jam:{x:980,y:500},winch:{x:970,y:600,r:60},tools:{x:850,y:690},toolsReady:true,north:{pursuerX:450,flash:0},east:{pursuerX:1200,flash:0},bowlProgress:0,channelOpen:false,diverting:false}};
 const before=JSON.stringify(g.grid);H.scenery(ctx,r);H.finaleForeground(ctx,r);assert.equal(depth,0);assert.equal(JSON.stringify(g.grid),before);assert.ok(calls.some(c=>c[0]==='ellipse'&&c[1]===1100&&c[2]===184));
 for(const actor of [r.rescue.guard,r.rescue.rind,r.finale.tools])assert.ok(Math.hypot(actor.x-970,actor.y-600)>60);
 calls.length=0;r.finale.bowlProgress=1;r.finale.channelOpen=true;r.finale.diverting=true;H.scenery(ctx,r);assert.ok(calls.some(c=>c[0]==='ellipse'&&c[1]===800&&c[2]===294));assert.equal(depth,0);assert.equal(JSON.stringify(g.grid),before);
});
