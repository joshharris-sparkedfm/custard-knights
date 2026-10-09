const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {resolveAsset,createAssetHandler}=require('../desktop/assets.cjs');
const {options}=require('../desktop/acceptance.cjs');
const {createStage}=require('../scripts/package.cjs');
const {generateSteamConfig}=require('../scripts/steam-config.cjs');
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'custard-unit-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
function write(root,name,value='fixture'){const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);}

test('custom protocol serves bundled assets but denies shell internals, foreign origins and Windows paths',t=>{
 const root=fixture(t);write(root,'index.html');write(root,'game/campaign.js');write(root,'desktop/main.cjs');
 assert.equal(resolveAsset(root,{url:'custard://game/index.html?qa=1'}).file,path.join(root,'index.html'));
 assert.equal(resolveAsset(root,{url:'custard://game/game/campaign.js'}).file,path.join(root,'game/campaign.js'));
 for(const url of ['custard://other/index.html','file:///index.html','custard://user@game/index.html',
  'custard://game/desktop/main.cjs','custard://game/package.json','custard://game/%2e%2e%5csecret',
  'custard://game/index.html%3astream','custard://game/game/%00foo.js'])assert.equal(resolveAsset(root,{url}).status,403,url);
 assert.equal(resolveAsset(root,{url:'custard://game/%zz'}).status,400);
 assert.equal(resolveAsset(root,{url:'custard://game/index.html',method:'POST'}).status,405);
 assert.equal(resolveAsset(root,{url:'custard://game/game/missing.js'}).status,404);
});
test('missing assets and failed native fetches return controlled errors',async t=>{
 const root=fixture(t);write(root,'index.html');
 const handler=createAssetHandler(root,{fetch:async()=>{throw Error('native file failure');}});
 assert.equal((await handler({url:'custard://game/index.html'})).status,404);
 assert.equal((await handler({url:'custard://game/game/absent.js'})).status,404);
});
test('acceptance profile flags cannot redirect checks into the normal save folder',t=>{
 const root=fixture(t);
 assert.equal(options([],os.tmpdir()),null);
 for(const profile of [root,path.join(os.tmpdir(),'Custard Knights'),path.join(root,'user-data')])
  assert.throws(()=>options(['--acceptance-phase=write',`--acceptance-profile=${profile}`],os.tmpdir()),/marked temporary profile/);
});
test('release staging includes future game modules and licenses, excludes scratch/developer files',t=>{
 const root=fixture(t);
 for(const name of ['index.html','menu-theme.mp3','art/keyart/home.webp','desktop/main.cjs','desktop/assets.cjs',
  'desktop/acceptance.cjs','desktop/online-smoke.cjs','desktop/faction-smoke.cjs','desktop/icon.png','sprites/hero.js','vendor/peerjs-LICENSE.txt','game/campaign.js',
  'game/cups.js','audio/new-song.mp3','audio/new-song.wav','audio/.secret.json','audio/draft.psd','desktop/developer-tool.cjs'])write(root,name);
 write(root,'package.json',JSON.stringify({name:'test',productName:'Custard Knights',version:'0.2.0',main:'desktop/main.cjs',devDependencies:{electron:'44.7.0'}}));
 const {stage}=createStage(root);
 for(const file of ['game/campaign.js','game/cups.js','audio/new-song.mp3','audio/new-song.wav','vendor/peerjs-LICENSE.txt','desktop/faction-smoke.cjs'])assert.ok(fs.existsSync(path.join(stage,file)),file);
 for(const file of ['audio/.secret.json','audio/draft.psd','desktop/developer-tool.cjs'])assert.ok(!fs.existsSync(path.join(stage,file)),file);
 assert.equal(JSON.parse(fs.readFileSync(path.join(stage,'package.json'))).devDependencies,undefined);
});
test('failed staging removes its partial build instead of retaining release input',t=>{
 const root=fixture(t);assert.throws(()=>createStage(root));
 assert.deepEqual(fs.readdirSync(path.join(root,'build')),[]);
});
test('Steam configuration rejects invalid IDs and incomplete EXE-only packages',t=>{
 const root=fixture(t);
 for(const id of ['0','-1','123.4','"SetLive"','4294967296','9007199254740992'])assert.throws(()=>generateSteamConfig(id,'123',root),/Usage/);
 write(root,'dist/Custard Knights-win32-x64/Custard Knights.exe');
 assert.throws(()=>generateSteamConfig('123','124',root),/complete packaged folder/);
 assert.ok(!fs.existsSync(path.join(root,'build')));
});
test('Steam VDF uses current version, maps the complete folder, and defaults to preview without publishing',t=>{
 const root=fixture(t);write(root,'dist/Custard Knights-win32-x64/Custard Knights.exe');
 write(root,'dist/Custard Knights-win32-x64/resources/app.asar');write(root,'package.json','{"version":"0.2.1"}');
 const result=generateSteamConfig('123','124',root),app=fs.readFileSync(result.app,'utf8'),depot=fs.readFileSync(result.depot,'utf8');
 assert.match(app,/Custard Knights 0\.2\.1 candidate/);assert.match(app,/"Preview" "1"/);assert.match(app,/"SetLive" ""/);
 assert.match(app,/"124" "depot_build_124\.vdf"/);assert.match(depot,/"Recursive" "1"/);
 assert.ok(app.includes(path.join(root,'dist','Custard Knights-win32-x64').replaceAll('\\','/')));
});
