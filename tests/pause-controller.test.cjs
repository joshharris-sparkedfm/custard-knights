'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const edges=source.slice(source.indexOf('function padEdges(){'),source.indexOf("addEventListener('gamepaddisconnected'"));
const activate=source.slice(source.indexOf('function menuActivate(){'),source.indexOf('function menuBack(){'));

// Exercise the shipped input router and activation function, without rendering or hardware.
function fixture(format='arena'){
 const calls=[];let input={},party=false;
 const resume={tagName:'BUTTON',click(){calls.push('resume');c.setPause(false);}},quit={tagName:'BUTTON',click(){calls.push('quit');c.G.demo=true;c.paused=false;}};
 const c={G:{demo:false,over:false},CUP:format==='cup'?{status:'playing'}:null,ADVENTURE:format==='story'?{campaign:{run:{status:'playing'}}}:null,
  PADS:[{index:3}],padPrev:[],SEATS:[{dev:'kb1'},{dev:'pad',idx:3}],paused:false,document:{activeElement:resume},
  padState:()=>input,setPause(value){calls.push(['pause',value]);c.paused=value;if(value)c.document.activeElement=resume;},
  shout:(...args)=>calls.push(['shout',args[0]]),partyOpen:()=>party,partyPad:(...args)=>calls.push(['party',args[0]]),
  menuNav(dx,dy){calls.push(['nav',dx,dy]);c.document.activeElement=dx>0?quit:resume;},menuBack:()=>calls.push('back')};
 vm.createContext(c);vm.runInContext(edges+activate,c);
 return {c,calls,resume,quit,party(value){party=value;},press(value){input={};c.padEdges();input=value;c.padEdges();}};
}

for(const format of ['arena','story','cup'])test(`${format}: paused controller can select Quit instead of always resuming`,()=>{
 const f=fixture(format);f.press({pause:true});assert.equal(f.c.paused,true);
 f.press({right:true});assert.equal(f.c.document.activeElement,f.quit);
 f.press({a:true});assert.ok(f.calls.includes('quit'));assert.ok(!f.calls.includes('resume'));assert.equal(f.c.G.demo,true);
});
test('paused A activates Resume; B and Menu resume without activating Quit',()=>{
 for(const button of ['a','back','pause']){
  const f=fixture();f.press({pause:true});if(button!=='a')f.press({right:true});
  f.press({[button]:true});assert.equal(f.c.paused,false,button);assert.ok(!f.calls.includes('quit'),button);
  assert.equal(f.calls.includes('resume'),button==='a');
 }
});
test('all pause navigation directions reach menus and paused shouts stay suppressed',()=>{
 const f=fixture();f.press({pause:true});
 for(const key of ['up','down','left','right'])f.press({[key]:true,shout:true});
 assert.deepEqual(f.calls.filter(x=>Array.isArray(x)&&x[0]==='nav'),[['nav',0,-1],['nav',0,1],['nav',-1,0],['nav',1,0]]);
 assert.ok(!f.calls.some(x=>Array.isArray(x)&&x[0]==='shout'));
});
test('active match retains assigned-seat shouts and does not treat attack/movement as menu actions',()=>{
 const f=fixture();f.press({right:true,a:true,shout:true});assert.deepEqual(f.calls,[['shout',2]]);
 f.press({pause:true,a:true});assert.equal(f.c.paused,true);assert.ok(!f.calls.includes('resume'));
});
test('main menu and couch party routing remain available',()=>{
 const f=fixture();f.c.G.demo=true;f.press({down:true});f.press({back:true});
 assert.deepEqual(f.calls,[['nav',0,1],'back']);f.party(true);f.press({a:true});assert.deepEqual(f.calls.at(-1),['party',3]);
});
