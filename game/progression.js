/* Shared household progression. The host supplies final per-knight results. */
(function(root,factory){ const api=factory(); if(typeof module==='object'&&module.exports) module.exports=api; else root.CKProgress=api; })(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const goals={firstWin:1,parry10:10,ringout3:3,raceWin:1,lksWin:1,lava5:5};
 const items={firstWin:'blade:wooden',parry10:'cape:checker',ringout3:'blade:fish',raceWin:'chick:golden',lksWin:'cape:stars',lava5:'blade:candy'};
 const count=v=>Number.isFinite(v)&&v>=0?Math.min(100000000,Math.floor(v)):0;
 function normalize(raw){
  const p=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const ch={}; for(const k of Object.keys(goals)) ch[k]=Math.min(goals[k],count(p.ch&&p.ch[k]));
  return {version:1,earned:count(p.earned),matches:count(p.matches),wins:Math.min(count(p.matches),count(p.wins)),ch,
   unlocked:[...new Set((Array.isArray(p.unlocked)?p.unlocked:[]).filter(x=>Object.values(items).includes(x)))],
   receipts:[...new Set((Array.isArray(p.receipts)?p.receipts:[]).filter(x=>typeof x==='string'&&x.length<=100))].slice(-128)};
 }
 function apply(raw,id,rows){
  const p=normalize(raw), got=[];
  if(typeof id!=='string'||!id||id.length>100||p.receipts.includes(id)||!Array.isArray(rows)||!rows.length) return {progress:p,applied:false,coins:0,got};
  if(rows.some(r=>!r||!Number.isInteger(r.coins)||r.coins<0||r.coins>10000||typeof r.won!=='boolean'||!['ffa','teams','lks','kotp','heist','race','flags','hotpie'].includes(r.mode))) return {progress:p,applied:false,coins:0,got};
  // One completion and the best coin award per household; all local knights contribute challenges.
  const coins=Math.max(...rows.map(r=>r.coins)), before=Math.min(18,Math.floor(p.earned/25));
  p.earned+=coins;p.matches++;if(rows.some(r=>r.won))p.wins++;p.receipts.push(id);p.receipts=p.receipts.slice(-128);
  const bump=(k,n)=>{p.ch[k]=Math.min(goals[k],Math.max(p.ch[k],n));};
  for(const r of rows){
   if(r.won)bump('firstWin',1);
   bump('parry10',p.ch.parry10+count(r.parries));bump('lava5',p.ch.lava5+count(r.lava));bump('ringout3',count(r.ringouts));
   if(r.won&&r.mode==='race')bump('raceWin',1);
   if(r.won&&['lks','hotpie'].includes(r.mode))bump('lksWin',1);
  }
  for(const k of Object.keys(goals))if(p.ch[k]>=goals[k]&&!p.unlocked.includes(items[k])){p.unlocked.push(items[k]);got.push(items[k].split(':'));}
  return {progress:p,applied:true,coins,got,before,after:Math.min(18,Math.floor(p.earned/25))};
 }
 return {normalize,apply};
});
