const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../game/campaign.js'),S=require('../game/story-scenes.js');
function harness(save={}){
 let hooks,transition=null,round=0;const events=[];
 const root={CKCampaign:C,CKCampaignUI:{mount(o){hooks=o;return {close(){},refresh(){},ended(){},brief(){},disruption(done){transition=done;}};}}};
 const engine={boot(){return {roundId:'story-'+(++round),ents:[{id:0,human:1}],flows:new Map()};},makeKnight:o=>({r:22,dead:false,falling:0,fx:{},...o}),redraw(){},play(){},sceneStarted(){}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../game/campaign-integration.js'),'utf8'),{globalThis:root});
 const a=root.CKCampaignIntegration.connect(engine,{storage:null,onProductEvent:(name)=>events.push(name)});a.campaign.restore(save);
 function interact(x,y){a.campaign.run.player.x=x;a.campaign.run.player.y=y;a.playerInput({atk:false});a.playerInput({atk:true});a.tick(.016);}
 function deliver(){a.opening();interact(455,424);interact(605,550);a.tick(2);interact(1130,500);}
 return {a,events,deliver,get hooks(){return hooks;},get transition(){return transition;}};
}
test('natural first delivery pauses before combat without changing rewards or reporting a combat round',()=>{
 const h=harness();h.deliver();assert.equal(h.a.campaign.run,null);assert.equal(typeof h.transition,'function');assert.equal(h.events.length,0);assert.deepEqual(h.a.campaign.save.results,{});assert.deepEqual(h.a.campaign.save.receipts,[]);
 h.transition();assert.equal(h.a.campaign.run.node.id,'banquet');assert.equal(h.a.campaign.run.prelude,undefined);assert.deepEqual(h.events,['round_started']);
});
function uiHarness(){
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attributes={};this.hidden=false;this.disabled=false;this.value='';}
  set textContent(value){this.text=String(value);this.children=[];}
  get textContent(){return (this.text||'')+this.children.map(e=>e.textContent).join('');}
  append(...items){this.children.push(...items);}appendChild(e){this.append(e);return e;}
  replaceChildren(...items){this.text='';this.children=items;}setAttribute(k,v){this.attributes[k]=v;}
  querySelector(){return null;}focus(){}remove(){}
 }
 const doc={hidden:false,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),querySelector:()=>null,getElementById:()=>null,addEventListener(){},removeEventListener(){},defaultView:{requestAnimationFrame:()=>1,cancelAnimationFrame(){}}};doc.head=new Element('head');doc.body=new Element('body');
 const campaign=C.create({storage:null});campaign.restore({results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true,true,true]}]))});const launches=[],presented=[];
 const root={CKCampaign:C,CKStoryScenes:{...S,render:()=>true}};vm.runInNewContext(fs.readFileSync(require.resolve('../game/campaign-ui.js'),'utf8'),{globalThis:root});
 const ui=root.CKCampaignUI.mount({campaign,document:doc,start:(...args)=>launches.push(args),startFinale:()=>launches.push(['rind',false,true]),interactLabel:()=> 'Q',homecoming:()=>launches.push(['homecoming']),replayHomecoming:()=>launches.push(['replay-homecoming']),resultPresented:(r,panel,unlocks)=>presented.push({r,panel,unlocks})});
 const find=(predicate,node=doc.body)=>predicate(node)?node:node.children.map(e=>find(predicate,e)).find(Boolean);
 const button=text=>{const b=find(e=>e.tag==='button'&&e.textContent===text);assert.ok(b,'Button exists: '+text);return b;};
 const canvas=()=>find(e=>e.tag==='canvas'&&!find(p=>p.id==='campaignStory').hidden);
 return {ui,find,button,canvas,launches,campaign,presented};
}
test('unchanged encounters retain full authored outro and next briefing on default Continue',()=>{
 for(const [id,next] of [['bridge','stirling'],['stirling','steve'],['steve','rind']]){
  const h=uiHarness();h.ui.ended({id,next,won:true,added:[],outro:C.byId[id].outro});h.button('Continue: '+C.byId[next].title).onclick();
  assert.equal(h.canvas().dataset.scene,id);assert.equal(h.canvas().dataset.phase,'outro');
  assert.equal(h.find(e=>e.className==='campaign-captions').textContent,S.captions(id,'outro',0).speaker+S.captions(id,'outro',0).text);
  h.button('Skip story').onclick();assert.equal(h.canvas().dataset.scene,next);assert.equal(h.canvas().dataset.phase,'intro');assert.equal(h.launches.length,0,'next encounter waits for its retained briefing');
 }
});
test('Rind result returns to the map while the earned diversion scene stays replayable',()=>{
 const h=uiHarness(),r={id:'rind',next:null,won:true,added:[],outro:C.byId.rind.outro};h.ui.ended(r);h.button('Continue: Story map').onclick();assert.equal(h.find(e=>e.id==='campaignMap').hidden,false);assert.equal(h.launches.length,0);
 h.ui.ended(r);h.button('Replay aftermath scene').onclick();assert.equal(h.canvas().dataset.scene,'rind');assert.equal(h.canvas().dataset.phase,'outro');const seek=h.find(e=>e.tag==='input'&&e.type==='range');seek.value=String(S.duration('rind','outro'));seek.oninput();const last=S.captions('rind','outro',S.duration('rind','outro')-.001);assert.equal(h.find(e=>e.className==='campaign-captions').textContent,last.speaker+last.text);h.button('Open story map').onclick();assert.equal(h.find(e=>e.id==='campaignMap').hidden,false);assert.equal(h.launches.length,0);
});
test('explicit opening skip and a delivery replay after an attempt intentionally enter combat directly',()=>{
 const h=harness();h.a.opening();h.hooks.skipQuiet();assert.equal(h.transition,null);assert.equal(h.a.campaign.run.node.id,'banquet');
 h.a.campaign.finish(false,'retry fixture');h.deliver();assert.equal(h.transition,null);assert.equal(h.a.campaign.run.node.id,'banquet');assert.deepEqual(h.events,['round_started','round_completed','round_started']);
});
test('crossing identity and optional practice retain the eight-node save and spoon contract',()=>{
 const h=harness({results:{banquet:{spoons:[true]},puddings:{spoons:[true]}}});h.a.launch('guard');assert.equal(h.a.campaign.run.guard.name,C.crossingGuard.name);assert.equal(h.a.campaign.run.guard.crossingGuard,true);
 assert.equal(C.byId.biscuit.optional,true);assert.deepEqual(C.byId.bridge.requires,['guard']);assert.equal(C.nodes.length,8);assert.equal(C.KEY,'ck-campaign-v1');
 assert.equal(S.duration('banquet','disruption'),8);assert.equal(S.duration('guard','consequence'),6);assert.equal(S.duration('rind','consequence'),0,'untouched encounters use the concise text card, never silently replay a full intro');
 assert.ok(C.byId.guard.dialogue.some(line=>line.startsWith('Bran:')&&/service crossing/.test(line)),'text fallback keeps the same crossing guard as theatre');assert.ok(C.byId.guard.outro.some(line=>/channel bridge/.test(line)&&/optional/.test(line)),'text fallback keeps the same onward route as theatre');
 assert.ok(S.scenes.puddings.intro.cues.some(c=>c.speaker==='Mabel'));assert.ok(S.scenes.puddings.intro.cues.some(c=>c.speaker==='Alf'));assert.ok(S.scenes.puddings.outro.cues.some(c=>/cooling channel/.test(c.text)));assert.ok(S.scenes.guard.consequence.cues.some(c=>c.speaker==='Bran'&&/winch/.test(c.text)));assert.ok(S.scenes.biscuit.intro.cues.some(c=>/Optional/.test(c.text)));
});

test('old completed map exposes a guarded finale replay and checkpoint3 briefing uses the actual sluice scene',()=>{
 const h=uiHarness(),old=JSON.stringify(h.campaign.save.results);h.ui.open('rind');assert.ok(h.button('Replay encounter from beginning'));assert.ok(h.button('Replay finale'));assert.match(h.find(e=>e.className==='campaign-brief').textContent,/Spoons earned in earlier versions stay earned/);assert.equal(JSON.stringify(h.campaign.save.results),old);h.button('Replay finale').onclick();assert.deepEqual(h.launches,[['rind',false,true]]);
 h.campaign.restore({...h.campaign.save,checkpoint:{id:'rind',phase:3}});h.ui.brief('rind',true);assert.equal(h.canvas().dataset.phase,'finale');assert.match(h.find(e=>e.className==='campaign-captions').textContent,/tools.*living skin/i);assert.equal(JSON.stringify(h.campaign.save.results),old);
 const save={...h.campaign.save,results:{...h.campaign.save.results},checkpoint:null};delete save.results.rind;h.campaign.restore(save);h.ui.open('rind');assert.equal(h.find(e=>e.tag==='button'&&e.textContent==='Replay finale'),undefined);
});
test('finale replay guard boots and reports nothing until owned; rescue-to-diversion remains one reported round',()=>{
 const denied=harness();assert.equal(denied.a.launchFinale(),null);assert.equal(denied.a.campaign.run,null);assert.deepEqual(denied.events,[]);
 const save={results:Object.fromEntries(C.nodes.filter(n=>n.id!=='rind').map(n=>[n.id,{spoons:[true,false,false]}])),checkpoint:{id:'rind',phase:2}};
 const h=harness(save);h.a.launch('rind',true);const c=h.a.campaign,r=c.run,g=r.g;assert.deepEqual(h.events,['round_started']);const q=r.cage;g.grid[q.r][q.c]='.';c.event('crate',{c:q.c,r:q.r,destroyed:true});h.a.tick(3);assert.equal(c.run.phase,3);assert.deepEqual(h.events,['round_started']);assert.equal(c.save.results.rind,undefined);
 const f=c.run.finale;g.grid[f.jam.r][f.jam.c]='.';c.event('crate',{c:f.jam.c,r:f.jam.r,destroyed:true});g.ents.filter(e=>!e.human).forEach(e=>e.dead=true);h.a.tick(3);Object.assign(r.player,f.winch);h.a.playerInput({atk:false});h.a.playerInput({atk:true});h.a.tick(4);assert.equal(f.channelOpen,true);assert.deepEqual(h.events,['round_started']);h.a.tick(2);assert.deepEqual(h.events,['round_started','round_completed']);assert.equal(c.save.results.rind.spoons[0],true);c.finish(true);assert.deepEqual(h.events,['round_started','round_completed']);
 const owned=harness({results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true,true,true]}]))});owned.a.launchFinale();assert.equal(owned.a.campaign.run.phase,3);assert.equal(owned.a.campaign.run.resumed,true);assert.equal(owned.a.campaign.run.guardsHit,0);assert.deepEqual(owned.events,['round_started']);
});

test('homecoming hook scene skip completes once and Back invalidates a detached old scene callback',()=>{
 const h=uiHarness();let done=0;h.ui.homecomingHook(()=>done++,true);assert.equal(h.canvas().dataset.phase,'homecoming');const skip=h.button('Skip story');skip.onclick();skip.onclick();assert.equal(done,1);
 h.ui.homecomingHook(()=>done++,false);const stale=h.button('Skip story');h.button('Back to map').onclick();stale.onclick();assert.equal(done,1);assert.equal(h.find(e=>e.id==='campaignStory').hidden,true);assert.equal(h.find(e=>e.id==='campaignMap').hidden,false);
});
test('result presentation hands only the visible panel and its receipt to the explicit reward hook',()=>{
 const h=uiHarness(),r={id:'rind',receipt:'original-receipt',roundId:'original-round',next:null,won:true,added:[],outro:C.byId.rind.outro};h.ui.ended(r,['saved-unlock']);assert.equal(h.presented.length,1);const p=h.presented[0];assert.equal(p.panel.dataset.resultReceipt,'original-receipt');assert.equal(h.find(e=>e.id==='campaignResult').hidden,false);assert.deepEqual([...p.unlocks],['saved-unlock']);h.button('Continue: Story map').onclick();assert.equal(h.find(e=>e.id==='campaignMap').hidden,false);assert.equal(h.presented.length,1);assert.equal(h.launches.length,0);
});
