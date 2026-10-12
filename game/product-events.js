/* Opt-in, local-only product observations. No transport, identity, or retention tracking. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKProductEvents=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const VERSION=1, KEY='ck.product-events.v1', CONSENT=KEY+'.consent', LIMIT=2000, IDLE=30*60*1000;
 const names=['session_start','invite_opened','join_attempt','join_succeeded','join_failed','round_started','first_meaningful_action','round_completed','rematch_selected','cup_completed','challenge_selected','challenge_completed','reward_equipped','highlight_saved','share_intent','referral_activated','session_exit'];
 const enums={input:['keyboard','gamepad','touch','mixed','unknown'],mode:['ffa','teams','lks','kotp','heist','race','flags','hotpie','story','campaign','brawl','ctf','siege','conquest'],map:['courtyard','factory','frost','bog','roof','dungeon','random','unknown'],difficulty:['easy','medium','hard','steve','unknown'],format:['arena','faction','local','online','cup','challenge','story','practice','unknown'],result:['win','loss','draw','completed','failed','abandoned','unknown'],action:['move','jump','attack','hit','block','parry','pickup','dash','interact'],source:['menu','invite','results','unknown'],shareTarget:['clipboard','download','system','unknown'],rewardType:['blade','cape','chick','visor','unknown'],chaos:['simple','normal','insane'],encounter:['banquet','puddings','guard','biscuit','bridge','stirling','steve','rind'],observation:['observed','inferred']};
 const reasons={join_failed:['timeout','unavailable','full','version','disconnected','cancelled','invalid','invalid_code','network','left','unknown'],session_exit:['pagehide','menu','quit','disconnect','left','hidden','inactivity','reload','unknown']};
 const tokenOK=v=>typeof v==='string'&&/^[a-f0-9]{16,64}$/.test(v);
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const buildOK=v=>typeof v==='string'&&/^\d{1,3}\.\d{1,3}\.\d{1,3}(?:-[a-z]+(?:\.\d{1,4})?)?$/.test(v);
 function fieldsFor(name,raw){
  if(!names.includes(name)||!object(raw))return null;
  const out={};
  for(const key of Object.keys(raw)){
   const value=raw[key];
   if(['roundId','attemptId','eventId'].includes(key)){if(!tokenOK(value))return null;}
   else if(key==='reason'){if(!reasons[name]||!reasons[name].includes(value))return null;}
   else if(['qa','demo','botOnly','online','joinedLate','reconnect'].includes(key)){if(typeof value!=='boolean')return null;}
   else if(['humanCount','botCount','localSeat'].includes(key)){if(!Number.isInteger(value)||value<0||value>100)return null;}
   else if(Object.hasOwn(enums,key)){if(!enums[key].includes(value))return null;}
   else return null;
   out[key]=value;
  }
  if(['join_attempt','join_succeeded','join_failed'].includes(name)&&!out.attemptId)return null;
  if(['round_started','first_meaningful_action','round_completed','rematch_selected'].includes(name)&&!out.roundId)return null;
  if(name==='session_exit'&&(!out.reason||!out.observation))return null;
  if(name==='session_exit'&&['inactivity','reload'].includes(out.reason)&&out.observation!=='inferred')return null;
  if(name!=='session_exit'&&out.observation!==undefined)return null;
  return out;
 }
 function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
 function create(options={}){
  const build=buildOK(options.build)?options.build:'0.0.0', now=typeof options.now==='function'?options.now:Date.now;
  const cap=Number.isInteger(options.maxRecords)?Math.max(2,Math.min(LIMIT,options.maxRecords)):LIMIT;
  let storage=options.storage, storageState='available', consent=false, records=[], installId=null, sessionId=null, lastAt=null, truncated=0, duplicates=0, rejected=0;
  if(storage===undefined){try{storage=globalThis.localStorage;}catch(_){storageState='blocked';}}
  if(!storage&&storageState!=='blocked')storageState='unavailable';
  function access(method,...args){try{return storage&&storage[method](...args);}catch(_){storageState='blocked';return undefined;}}
  function time(){try{const t=now();return Number.isSafeInteger(t)&&t>=0?t:Date.now();}catch(_){return Date.now();}}
  function token(){
   try{if(typeof options.id==='function'){const supplied=options.id();if(tokenOK(supplied))return supplied;}}catch(_){}
   try{const bytes=new Uint8Array(16);globalThis.crypto.getRandomValues(bytes);return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');}catch(_){}
   // A local anonymous token, never a user or network identity. Random fallback supports older shells.
   return Array.from({length:4},()=>Math.floor(Math.random()*0x100000000).toString(16).padStart(8,'0')).join('');
  }
  function persist(){if(consent)access('setItem',KEY,JSON.stringify({version:VERSION,installId,truncated,duplicates,rejected,records}));}
  function trim(){if(records.length>cap){truncated+=records.length-cap;records=records.slice(-cap);}}
  function validRecord(r){return object(r)&&names.includes(r.name)&&buildOK(r.build)&&tokenOK(r.sessionId)&&Number.isSafeInteger(r.at)&&r.at>=0&&fieldsFor(r.name,r.fields)!==null;}
  consent=access('getItem',CONSENT)==='true';
  if(consent){
   const saved=access('getItem',KEY);
   if(typeof saved==='string'&&saved.length<=2000000){try{
    const data=JSON.parse(saved);
    if(!object(data)||data.version!==VERSION||!tokenOK(data.installId)||!Array.isArray(data.records)||data.records.length>LIMIT)throw Error('Invalid local event envelope');
    installId=data.installId;records=data.records.filter(validRecord).map(r=>({name:r.name,build:r.build,sessionId:r.sessionId,at:r.at,fields:fieldsFor(r.name,r.fields)}));
    for(const key of ['truncated','duplicates','rejected']){const n=Number.isSafeInteger(data[key])&&data[key]>=0?data[key]:0;if(key==='truncated')truncated=n;else if(key==='duplicates')duplicates=n;else rejected=n;}
    rejected+=data.records.length-records.length;trim();
   }catch(_){storageState='corrupt';}}
   else if(saved)storageState='corrupt';
  }
  function append(name,fields,at){records.push({name,build,sessionId,at,fields});trim();}
  function ensureSession(at){
   if(sessionId&&lastAt!==null&&at-lastAt>=IDLE){append('session_exit',{reason:'inactivity',observation:'inferred',qa:options.qa===true},lastAt+IDLE);sessionId=null;}
   if(!sessionId){installId=installId||token();sessionId=token();append('session_start',{qa:options.qa===true},at);}
   lastAt=at;
  }
  function dedupKey(name,f){
   if(['join_succeeded','join_failed'].includes(name))return 'join_outcome:'+f.attemptId;
   if(name==='join_attempt')return name+':'+f.attemptId;
   if(['round_started','first_meaningful_action','round_completed','rematch_selected'].includes(name))return name+':'+f.roundId;
   if(f.eventId)return 'event:'+f.eventId;
   return null;
  }
  function record(name,raw={}){
   if(!consent)return false;
   const fields=fieldsFor(name,raw);if(!fields){rejected++;persist();return false;}
   // Callers cannot override the harness flag supplied at construction.
   fields.qa=options.qa===true||fields.qa===true;
   const at=Math.max(lastAt===null?0:lastAt,time());ensureSession(at);
   if(name==='session_start'){persist();return true;}
   const key=dedupKey(name,fields);
   if(key&&records.some(r=>r.sessionId===sessionId&&dedupKey(r.name,r.fields)===key)){duplicates++;persist();return false;}
   append(name,fields,at);if(name==='session_exit'){sessionId=null;lastAt=null;}persist();return true;
  }
  function clear(){records=[];installId=null;sessionId=null;lastAt=null;truncated=0;duplicates=0;rejected=0;access('removeItem',KEY);}
  function setConsent(value){if(value!==true){consent=false;clear();access('removeItem',CONSENT);return false;}consent=true;access('setItem',CONSENT,'true');ensureSession(time());persist();return true;}
  function report(){
   const events=JSON.parse(JSON.stringify(records)), eligible=r=>!r.fields.qa&&!r.fields.demo&&!r.fields.botOnly&&r.fields.humanCount!==0;
   const human=events.filter(eligible), attempts=new Map(), rounds=new Map();
   const metrics={joinAttempts:0,joinSucceeded:0,joinFailed:0,joinPendingOrUnobserved:0,roundsStarted:0,roundsCompleted:0,roundCompletionRate:null,rematchSelections:0,completedRoundsWithObservedContinuation:0};
   for(const r of human){const f=r.fields,key=r.sessionId+':'+f.attemptId, roundKey=r.sessionId+':'+f.roundId;
    if(r.name==='join_attempt'&&!attempts.has(key))attempts.set(key,{outcome:null});
    if(['join_succeeded','join_failed'].includes(r.name)&&attempts.has(key)&&!attempts.get(key).outcome)attempts.get(key).outcome=r.name;
    if(r.name==='round_started'&&f.humanCount>0&&!f.joinedLate&&!rounds.has(roundKey))rounds.set(roundKey,{start:r,completed:null,rematch:false,continued:false});
    const round=rounds.get(roundKey);
    if(r.name==='round_completed'&&round&&!round.completed&&f.humanCount>0&&!f.joinedLate)round.completed=r;
    if(r.name==='rematch_selected'&&round&&round.completed)round.rematch=true;
    if(r.name==='round_started'&&f.humanCount>0&&!f.joinedLate){for(const [otherKey,other] of rounds)if(otherKey!==roundKey&&other.start.sessionId===r.sessionId&&other.completed&&!other.continued)other.continued=true;}
   }
   metrics.joinAttempts=attempts.size;for(const a of attempts.values()){if(a.outcome==='join_succeeded')metrics.joinSucceeded++;else if(a.outcome==='join_failed')metrics.joinFailed++;else metrics.joinPendingOrUnobserved++;}
   metrics.roundsStarted=rounds.size;for(const r of rounds.values()){if(r.completed)metrics.roundsCompleted++;if(r.rematch)metrics.rematchSelections++;if(r.continued)metrics.completedRoundsWithObservedContinuation++;}
   if(metrics.roundsStarted)metrics.roundCompletionRate=metrics.roundsCompleted/metrics.roundsStarted;
   return freeze({version:VERSION,build,generatedAt:time(),consent,storageState,installId,events,metrics,counts:{retained:events.length,truncated,duplicates,rejected,excludedFromHumanMetrics:events.length-human.length},limitations:[
    'Local opt-in observations from one browser installation only; no network collection or population-wide claims.',
    'Metrics cover retained events only. Truncation, cleared storage, missing instrumentation and interrupted sessions can remove context.',
    'Deduplication covers retained events in the current session. IDs must be anonymous local tokens, never external identifiers.',
    'Join outcomes require a retained attempt in the same session. Pending or unobserved does not mean failure.',
    'Round completions also require a start in the same session. A long round spanning the inactivity cutoff remains uncompleted in this observed baseline.',
    'Human round metrics require explicitly positive human counts on start and completion; late joins are excluded. QA, demo and bot-only events are excluded.',
    'Continuation means a later human round start in the same session after an observed completion; rematch intent alone is not continuation.',
    'Inactivity exits are inferred after 30 minutes when another event arrives. Page exits are observations of lifecycle signals, not proof a person left.',
    'Cup, challenge, reward, highlight, share and referral events are observations only; no conversion or retention claim is calculated.',
    'No D1/D7 retention, people counts, attribution, or cross-device identity is available.'
   ]});
  }
  return Object.freeze({getConsent:()=>consent,setConsent,record,clear,report,exportJSON:()=>JSON.stringify(report(),null,2),token,flush:persist,exit:(reason='pagehide')=>record('session_exit',{reason,observation:'observed'})});
 }
 return Object.freeze({create,VERSION,KEY,CONSENT,MAX_RECORDS:LIMIT,SESSION_IDLE_MS:IDLE});
});
