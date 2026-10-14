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
 const campaign=C.create({storage:null});campaign.restore({results:Object.fromEntries(C.nodes.map(n=>[n.id,{spoons:[true,true,true]}]))});const launches=[];
 const root={CKCampaign:C,CKStoryScenes:{...S,render:()=>true}};vm.runInNewContext(fs.readFileSync(require.resolve('../game/campaign-ui.js'),'utf8'),{globalThis:root});
 const ui=root.CKCampaignUI.mount({campaign,document:doc,start:(...args)=>launches.push(args)});
 const find=(predicate,node=doc.body)=>predicate(node)?node:node.children.map(e=>find(predicate,e)).find(Boolean);
 const button=text=>{const b=find(e=>e.tag==='button'&&e.textContent===text);assert.ok(b,'Button exists: '+text);return b;};
 const canvas=()=>find(e=>e.tag==='canvas'&&!find(p=>p.id==='campaignStory').hidden);
 return {ui,find,button,canvas,launches};
}
test('unchanged encounters retain full authored outro and next briefing on default Continue',()=>{
 for(const [id,next] of [['bridge','stirling'],['stirling','steve'],['steve','rind']]){
  const h=uiHarness();h.ui.ended({id,next,won:true,added:[],outro:C.byId[id].outro});h.button('Continue: '+C.byId[next].title).onclick();
  assert.equal(h.canvas().dataset.scene,id);assert.equal(h.canvas().dataset.phase,'outro');
  assert.equal(h.find(e=>e.className==='campaign-captions').textContent,S.captions(id,'outro',0).speaker+S.captions(id,'outro',0).text);
  h.button('Skip story').onclick();assert.equal(h.canvas().dataset.scene,next);assert.equal(h.canvas().dataset.phase,'intro');assert.equal(h.launches.length,0,'next encounter waits for its retained briefing');
 }
});
test('terminal Continue retains the full Rind outro before returning to the completed map',()=>{
 const h=uiHarness();h.ui.ended({id:'rind',next:null,won:true,added:[],outro:C.byId.rind.outro});h.button('Continue: Story map').onclick();
 assert.equal(h.canvas().dataset.scene,'rind');assert.equal(h.canvas().dataset.phase,'outro');
 const seek=h.find(e=>e.tag==='input'&&e.type==='range');seek.value=String(S.duration('rind','outro'));seek.oninput();
 const last=S.captions('rind','outro',S.duration('rind','outro')-.001);assert.equal(h.find(e=>e.className==='campaign-captions').textContent,last.speaker+last.text);
 h.button('Return to story map').onclick();assert.equal(h.find(e=>e.id==='campaignStory').hidden,true);assert.equal(h.find(e=>e.id==='campaignMap').hidden,false);assert.equal(h.launches.length,0);
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
