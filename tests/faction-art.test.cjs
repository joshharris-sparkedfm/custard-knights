const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const Art=require('../game/faction-art.js');
function recorder(){const commands=[];return {commands,ctx:new Proxy({},{get:(_o,k)=>(...args)=>commands.push([k,...args]),set:(_o,k,v)=>{commands.push(['set',k,v]);return true;}})};}
test('faction geometry is opt-in and does not draw on ordinary knights or unknown factions',()=>{
 for(const faction of [undefined,null,'red','blue','angelic']){const {ctx,commands}=recorder();Art.drawBack(ctx,{faction},22);assert.equal(commands.length,0);}
});
test('both faction outlines draw distinct geometry independent of tint, role, visor and cosmetic kit',()=>{
 const outputs={};for(const faction of ['custardia','rice']){
  for(const face of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const visor of ['open','closed'])for(const role of ['vanguard','ranger','engineer','support']){
   const e=Object.freeze({faction,face,role,color:'#888888',kit:Object.freeze({visor,helm:'riceGuard'}),hp:3,r:22,reach:68,wpn:Object.freeze({kind:'bow'}),attack:Object.freeze({phase:'active'})});
   const before=JSON.stringify(e),{ctx,commands}=recorder();Art.drawBack(ctx,e,22,{bob:1.5});assert.equal(JSON.stringify(e),before);assert.ok(commands.length>20);assert.deepEqual(commands[0],['save']);assert.deepEqual(commands.at(-1),['restore']);assert.deepEqual(commands[1],['translate',0,-1.5]);assert.deepEqual(commands[2],['scale',22,22]);
   const geometry=commands.filter(v=>v[0]!=='set');if(outputs[faction])assert.deepEqual(geometry,outputs[faction]);else outputs[faction]=geometry;
  }
 }
 assert.notDeepEqual(outputs.custardia,outputs.rice);assert.ok(outputs.custardia.some(v=>v[0]==='quadraticCurveTo'));assert.ok(outputs.rice.some(v=>v[0]==='lineTo'));
});
test('live bridge derives faction from the snapshot and layers it behind both accepted renderers without changing composition',()=>{
 const s=fs.readFileSync(require.resolve('../index.html'),'utf8'),base=fs.readFileSync(require.resolve('../game/faction-art.js'),'utf8');
 assert.match(s,/<script src="game\/faction-art\.js"><\/script>/);assert.match(s,/mkKnight\(\{factionSpriteCache:true,faction:p\.team,/);
 const draw=s.slice(s.indexOf('function drawKnight(e)'),s.indexOf('function drawCrown('));assert.ok(draw.indexOf('CKFactionArt.drawBack')<draw.indexOf('CKCollectionArt.drawBack'));assert.ok(draw.indexOf('CKFactionArt.drawBack')<draw.indexOf('drawKnightSprite'));assert.ok(draw.indexOf('CKFactionArt.drawBack')<draw.indexOf('drawBody(e,r'));
 const compose=s.slice(s.indexOf('function sprCompose('),s.indexOf('function drawKnightSprite('));assert.doesNotMatch(compose,/CKFactionArt|e\.faction\b/);assert.doesNotMatch(base,/Math\.random|Date\.|document\.|attack\s*=|hp\s*=/);
});
