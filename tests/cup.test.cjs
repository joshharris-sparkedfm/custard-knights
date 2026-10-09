const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../game/cup.js');
const start=()=>C.create('cup',[1,2,3,4].map(i=>({key:'local-'+i,name:'Knight '+i,seat:i})));
test('Cup score excludes bots and grants equal points for tied performances',()=>{
 const s=start();C.finish(s,'r1',[{key:'bot',score:100},...['local-1','local-2','local-3','local-4'].map((key,i)=>({key,score:i<2?10:5-i,deaths:0}))]);
 a.deepEqual(s.players.map(p=>p.points),[3,3,1,0]);a.equal(C.finish(s,'r1',[]),false);a.equal(s.history.length,1);
});
test('three rounds preserve scores, require all humans ready and declare a shared trophy on a tie',()=>{
 const s=start();for(let round=0;round<3;round++){
  a.equal(C.finish(s,'round-'+round,s.players.map(p=>({key:p.key,score:1,deaths:0,lives:2,chick:false}))),true);
  if(round<2){a.equal(C.advance(s),false);for(const p of s.players)C.ready(s,p.key,1);a.equal(C.advance(s),true);}
 }
 a.equal(s.status,'complete');a.deepEqual(s.players.map(p=>p.points),[9,9,9,9]);a.equal(C.winners(s).length,4);a.equal(C.advance(s),false);
});
test('a departure cannot block ready-up or earn new points through its replacement bot',()=>{
 const s=start();C.finish(s,'r1',s.players.map((p,i)=>({key:p.key,score:4-i})));C.disconnect(s,'local-4');
 for(const p of s.players.slice(0,3))C.ready(s,p.key,0);a.equal(C.advance(s),true);
 C.finish(s,'r2',[{key:'local-4',score:100},{key:'local-1',score:2}]);a.equal(s.players[3].points,0);
});
test('late or unknown players cannot ready, vote or score in the current Cup',()=>{
 const s=start();C.finish(s,'r1',[{key:'late',score:100}]);a.equal(C.ready(s,'late',0),false);a.equal(s.players.length,4);a.deepEqual(s.players.map(p=>p.points),[0,0,0,0]);
});
test('Mischief awards describe recorded events and omit absent achievements',()=>{
 const s=start();C.finish(s,'r1',[{key:'local-1',score:0,parries:2},{key:'local-2',score:0,ringouts:3},{key:'local-3',score:0,pickups:8}]);
 a.deepEqual(s.history[0].awards.map(x=>[x.title,x.keys[0],x.value]),[['Parry artist','local-1',2],['Mind the gap','local-2',3],['Pantry raider','local-3',8]]);
});
test('network Cup state validator accepts complete lifecycle and rejects malformed rendering fields',()=>{
 const s=start();a.equal(C.validState(s),true);const invalid=[{...s,players:[null]},{...s,ready:null},{...s,round:3},{...s,players:[]},{...s,choice:5},{...s,status:'complete'}];for(const v of invalid)a.equal(C.validState(v),false);
 for(let i=0;i<3;i++){C.finish(s,'valid-'+i,s.players.map(p=>({key:p.key,score:2,parries:1})));a.equal(C.validState(s),true);a.equal(C.validState({...s,history:[{...s.history[0],awards:null}]}),false);if(i<2){for(const p of s.players)C.ready(s,p.key,0);a.equal(C.validState(s),true);C.advance(s);a.equal(C.validState(s),true);}}
});
