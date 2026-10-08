(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKPreferences=api;})(globalThis,()=>{
 'use strict';
 const record=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 function settings(raw){const v=record(raw),r={music:.55,sfx:1,shake:1,flash:true,names:'near',classic:false,whole:false};
  for(const k of ['music','sfx','shake'])if(Number.isFinite(v[k]))r[k]=Math.max(0,Math.min(1,v[k]));
  for(const k of ['flash','classic','whole'])if(typeof v[k]==='boolean')r[k]=v[k];
  if(['near','all'].includes(v.names))r.names=v.names;return r;
 }
 function config(raw,modes,maps){const v=record(raw),r={mode:'ffa',players:1,diff:'spicy',map:'random',chaosPlus:false,chaosSpeed:'normal',length:180,teamSplit:false};
  if(modes.includes(v.mode))r.mode=v.mode;if(maps.includes(v.map)||v.map==='random')r.map=v.map;
  if(Number.isInteger(v.players)&&v.players>=1&&v.players<=4)r.players=v.players;
  if(['chill','spicy','brutal'].includes(v.diff))r.diff=v.diff;if(['normal','fast','unhinged'].includes(v.chaosSpeed))r.chaosSpeed=v.chaosSpeed;
  if([90,180,300].includes(v.length))r.length=v.length;for(const k of ['chaosPlus','teamSplit'])if(typeof v[k]==='boolean')r[k]=v[k];return r;
 }
 return {settings,config};
});
