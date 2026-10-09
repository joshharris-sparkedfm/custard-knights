(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKCup=api;})(globalThis,()=>{
 'use strict';
 const rounds=[{mode:'ffa',name:'Opening brawl',maps:['courtyard','factory']},{mode:'kotp',name:'King of the Pie',maps:['frost','bog']},{mode:'hotpie',name:'Hot Pie finale',maps:['roof','dungeon']}];
 const num=v=>Number.isFinite(v)?v:0;
 function validState(s){
  const rec=x=>!!x&&typeof x==='object'&&!Array.isArray(x),str=(x,max=100)=>typeof x==='string'&&x.length>0&&x.length<=max,int=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
  if(!rec(s)||s.version!==1||!str(s.id)||!int(s.round,2)||!['playing','between','complete'].includes(s.status)||!int(s.choice,1)||!Array.isArray(s.players)||!s.players.length||s.players.length>8||!Array.isArray(s.history)||!rec(s.ready)||!rec(s.votes))return false;
  if(s.status==='complete'&&s.round!==2||s.status==='between'&&s.round===2||s.history.length!==s.round+(s.status==='playing'?0:1))return false;
  const keys=new Set();for(const p of s.players){if(!rec(p)||!str(p.key,120)||keys.has(p.key)||!str(p.name,24)||!int(p.seat,4)||!(p.peer===null||str(p.peer,100))||!int(p.points,21)||typeof p.connected!=='boolean')return false;keys.add(p.key);}
  if(Object.entries(s.ready).some(([k,v])=>!keys.has(k)||typeof v!=='boolean')||Object.entries(s.votes).some(([k,v])=>!keys.has(k)||!int(v,1)))return false;
  const receipts=new Set();return s.history.every((h,i)=>{if(!rec(h)||!str(h.id)||receipts.has(h.id)||h.mode!==rounds[i].mode||!rounds[i].maps.includes(h.map)||!Array.isArray(h.points)||h.points.length>s.players.length||!Array.isArray(h.awards)||h.awards.length>3)return false;receipts.add(h.id);const scored=new Set();for(const p of h.points){if(!rec(p)||!keys.has(p.key)||scored.has(p.key)||!int(p.place,8)||p.place<1||!int(p.points,7))return false;scored.add(p.key);}return h.awards.every(a=>rec(a)&&str(a.title,50)&&str(a.unit,80)&&int(a.value,1000000)&&Array.isArray(a.keys)&&a.keys.length>0&&a.keys.length<=8&&new Set(a.keys).size===a.keys.length&&a.keys.every(k=>keys.has(k)));});
 }
 function create(id,entrants){
  if(typeof id!=='string'||!id||!Array.isArray(entrants))throw Error('A Cup needs an ID and human entrants');
  const keys=new Set(),players=[];
  for(const e of entrants){if(!e||typeof e.key!=='string'||keys.has(e.key))continue;keys.add(e.key);players.push({key:e.key,name:String(e.name||'Knight').slice(0,24),seat:e.seat||0,peer:e.peer||null,points:0,connected:true});}
  if(!players.length||players.length>8)throw Error('A Cup supports one to eight humans');
  return {version:1,id,round:0,status:'playing',players,history:[],ready:{},votes:{},choice:0};
 }
 function config(state){const r=rounds[state.round];return r?{mode:r.mode,map:r.maps[state.choice||0],length:120,teamSplit:false}:null;}
 function options(state){const r=rounds[state.round+1];return r?r.maps.map(map=>({map,mode:r.mode,name:r.name})):[];}
 function compare(mode,a,b){return mode==='hotpie'?Number(!!a.chick)-Number(!!b.chick)||num(b.lives)-num(a.lives)||num(b.score)-num(a.score)||num(a.deaths)-num(b.deaths):num(b.score)-num(a.score)||num(a.deaths)-num(b.deaths);}
 function awards(rows){
  const specs=[['Parry artist','parries','perfectly timed parries'],['Mind the gap','ringouts','credited ring-outs'],['Pantry raider','pickups','power-ups collected']];
  return specs.flatMap(([title,field,unit])=>{const best=Math.max(0,...rows.map(r=>num(r[field])));if(best<=0)return[];return [{title,keys:rows.filter(r=>num(r[field])===best).map(r=>r.key),value:best,unit}];});
 }
 function finish(state,roundId,rows){
  if(!state||state.status!=='playing'||typeof roundId!=='string'||!roundId||state.history.some(r=>r.id===roundId)||!Array.isArray(rows))return false;
  const byKey=new Map();for(const r of rows)if(r&&state.players.some(p=>p.key===r.key&&p.connected)&&!byKey.has(r.key))byKey.set(r.key,r);
  const ordered=[...byKey.values()].sort((a,b)=>compare(rounds[state.round].mode,a,b)||a.key.localeCompare(b.key));
  const points=[];let rank=0;
  ordered.forEach((r,i)=>{if(i&&compare(rounds[state.round].mode,r,ordered[i-1])!==0)rank=i;const gain=Math.max(0,state.players.length-1-rank);const p=state.players.find(p=>p.key===r.key);p.points+=gain;points.push({key:r.key,place:rank+1,points:gain});});
  state.history.push({id:roundId,mode:rounds[state.round].mode,map:config(state).map,points,awards:awards(ordered)});
  state.status=state.round===2?'complete':'between';state.ready={};state.votes={};return true;
 }
 function ready(state,key,choice,value=true){
  if(!state||state.status!=='between'||!state.players.some(p=>p.key===key&&p.connected)||![0,1].includes(choice))return false;
  state.ready[key]=!!value;state.votes[key]=choice;return true;
 }
 function canAdvance(state){const active=state.players.filter(p=>p.connected);return state.status==='between'&&active.length>0&&active.every(p=>state.ready[p.key]);}
 function advance(state){if(!canAdvance(state))return false;const votes=[0,0];for(const p of state.players)if(p.connected)votes[state.votes[p.key]||0]++;state.choice=votes[1]>votes[0]?1:0;state.round++;state.status='playing';state.ready={};state.votes={};return true;}
 function disconnect(state,key){if(!state)return;const p=state.players.find(p=>p.key===key);if(p)p.connected=false;delete state.ready[key];delete state.votes[key];}
 function standings(state){return state.players.slice().sort((a,b)=>b.points-a.points||a.key.localeCompare(b.key));}
 function winners(state){if(state.status!=='complete')return[];const order=standings(state);return order.filter(p=>p.points===order[0].points).map(p=>p.key);}
 return {rounds,validState,create,config,options,finish,ready,canAdvance,advance,disconnect,standings,winners};
});
