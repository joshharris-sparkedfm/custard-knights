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
