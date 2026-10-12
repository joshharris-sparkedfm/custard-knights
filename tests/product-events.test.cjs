const {test}=require('node:test'),assert=require('node:assert/strict'),P=require('../game/product-events.js');
function fixture(extra={}){
 const values=new Map();let clock=1000,serial=0,idCalls=0;
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const options={build:'0.3.0-beta.4',storage,now:()=>clock,id:()=>{idCalls++;return (++serial).toString(16).padStart(32,'0');},...extra};
 const events=P.create(options);
 return {events,values,options,tick:ms=>clock+=ms,get idCalls(){return idCalls;}};
}
const hex=n=>n.toString(16).padStart(32,'0');
const round=(n,extra={})=>({roundId:hex(n),humanCount:1,botCount:3,format:'arena',mode:'ffa',...extra});

test('defaults to disabled; opt-in alone permits IDs and persisted events; opt-out erases data',()=>{
 const f=fixture(),e=f.events;
 assert.equal(e.getConsent(),false);assert.equal(e.record('invite_opened'),false);assert.equal(f.idCalls,0);assert.equal(f.values.size,0);
 e.setConsent(true);assert.equal(e.getConsent(),true);assert.equal(f.idCalls,2);assert.equal(e.report().events[0].name,'session_start');
 e.record('round_started',round(100));e.setConsent(false);
 assert.equal(f.values.size,0);assert.equal(e.report().installId,null);assert.equal(e.report().events.length,0);assert.equal(e.record('invite_opened'),false);
});

test('rejects private strings, unknown fields, raw identifiers, malformed enums and counters',()=>{
 const e=fixture().events;e.setConsent(true);
 for(const fields of [{name:'Player'},{url:'https://example.test'},{room:'ABCD'},{peerId:hex(1)},{key:'secret'},{input:'my keyboard'},{mode:'custom'},{roundId:'room-code'},{humanCount:-1},{botCount:101},{humanCount:1.5},{reason:'private server error'},{joinedLate:1},{encounter:'private name'}])assert.equal(e.record('invite_opened',fields),false);
 assert.equal(e.record('arbitrary_event',{}),false);
 assert.equal(e.record('join_attempt',{}),false);
 assert.equal(e.record('round_completed',{}),false);
 assert.equal(e.record('session_exit',{reason:'pagehide'}),false);
 assert.equal(e.report().events.length,1);
 assert.equal(e.record('round_started',round(10,{mode:'campaign',format:'story',encounter:'banquet',difficulty:'steve',chaos:'simple',input:'gamepad',online:false,joinedLate:false,localSeat:0})),true);
});

test('join baseline requires retained attempt and deduplicates both repeated attempts and conflicting outcomes',()=>{
 const e=fixture().events;e.setConsent(true);
 e.record('join_succeeded',{attemptId:hex(90)});
 e.record('join_attempt',{attemptId:hex(10)});
 assert.equal(e.record('join_attempt',{attemptId:hex(10)}),false);
 e.record('join_succeeded',{attemptId:hex(10)});
 assert.equal(e.record('join_failed',{attemptId:hex(10),reason:'timeout'}),false);
 e.record('join_attempt',{attemptId:hex(11)});e.record('join_failed',{attemptId:hex(11),reason:'network'});
 e.record('join_attempt',{attemptId:hex(12)});
 const m=e.report().metrics;
 assert.equal(m.joinAttempts,3);assert.equal(m.joinSucceeded,1);assert.equal(m.joinFailed,1);assert.equal(m.joinPendingOrUnobserved,1);assert.equal(e.report().counts.duplicates,2);
});

test('round completion and actual continuation are distinct from rematch intent',()=>{
 const e=fixture().events;e.setConsent(true);
 e.record('round_completed',round(99));e.record('round_started',round(1));
 e.record('round_completed',round(1));assert.equal(e.record('round_completed',round(1)),false);
 e.record('rematch_selected',round(1));assert.equal(e.record('rematch_selected',round(1)),false);
 let m=e.report().metrics;assert.equal(m.roundsStarted,1);assert.equal(m.roundsCompleted,1);assert.equal(m.rematchSelections,1);assert.equal(m.completedRoundsWithObservedContinuation,0);
 e.record('round_started',round(2));m=e.report().metrics;
 assert.equal(m.roundsStarted,2);assert.equal(m.roundCompletionRate,0.5);assert.equal(m.completedRoundsWithObservedContinuation,1);
 e.exit('pagehide');e.record('round_started',round(3));assert.equal(e.report().metrics.completedRoundsWithObservedContinuation,1);
});

test('QA, demos, bots, unknown human count and late joins never count as human rounds',()=>{
 const e=fixture().events;e.setConsent(true);
 const contexts=[{qa:true},{demo:true},{botOnly:true},{humanCount:0},{humanCount:undefined},{joinedLate:true}];
 contexts.forEach((extra,i)=>{const fields=round(20+i,extra);if(fields.humanCount===undefined)delete fields.humanCount;e.record('round_started',fields);e.record('round_completed',fields);});
 assert.equal(e.report().metrics.roundsStarted,0);assert.equal(e.report().metrics.roundsCompleted,0);assert.equal(e.report().metrics.roundCompletionRate,null);
 for(const flags of [{qa:true},{demo:true},{botOnly:true},{humanCount:0}]){e.record('join_attempt',{attemptId:e.token(),...flags});}
 assert.equal(e.report().metrics.joinAttempts,0);
 const qa=fixture({qa:true}).events;qa.setConsent(true);qa.record('round_started',round(1,{qa:false}));qa.record('round_completed',round(1,{qa:false}));
 assert.equal(qa.report().metrics.roundsCompleted,0);assert.ok(qa.report().events.every(r=>r.fields.qa));
});

test('30 minute inactivity rotates session with inferred exit; explicit lifecycle exits are observed',()=>{
 const f=fixture(),e=f.events;e.setConsent(true);const before=e.report().events[0].sessionId;
 f.tick(P.SESSION_IDLE_MS-1);e.record('invite_opened');assert.equal(e.report().events.at(-1).sessionId,before);
 f.tick(P.SESSION_IDLE_MS);e.record('invite_opened');
 const report=e.report(),inferred=report.events.find(r=>r.name==='session_exit');
 assert.equal(inferred.fields.observation,'inferred');assert.equal(inferred.fields.reason,'inactivity');assert.notEqual(report.events.at(-1).sessionId,before);
 e.exit('pagehide');assert.equal(e.report().events.at(-1).fields.observation,'observed');
});

test('reload keeps installation but creates a fresh session and does not invent retention',()=>{
 const f=fixture(),e=f.events;e.setConsent(true);e.record('round_started',round(1));const old=e.report();
 const reload=P.create(f.options);assert.equal(reload.getConsent(),true);reload.record('invite_opened');const fresh=reload.report();
 assert.equal(fresh.installId,old.installId);assert.notEqual(fresh.events.at(-1).sessionId,old.events.at(-1).sessionId);assert.equal(Object.hasOwn(fresh.metrics,'retention'),false);
 assert.ok(fresh.limitations.some(x=>x.includes('D1/D7')));
});

test('session boundaries leave unmatched long-round completions and join outcomes out of baseline',()=>{
 const f=fixture(),e=f.events;e.setConsent(true);
 e.record('round_started',round(1));assert.equal(e.record('join_attempt',{attemptId:hex(2),reconnect:true}),true);
 f.tick(P.SESSION_IDLE_MS);e.record('round_completed',round(1));e.record('join_succeeded',{attemptId:hex(2),reconnect:true});
 const m=e.report().metrics;assert.equal(m.roundsStarted,1);assert.equal(m.roundsCompleted,0);assert.equal(m.joinAttempts,1);assert.equal(m.joinSucceeded,0);assert.equal(m.joinPendingOrUnobserved,1);
});

test('bounded storage reports truncation and avoids counting orphaned outcomes',()=>{
 const f=fixture({maxRecords:4}),e=f.events;e.setConsent(true);
 e.record('join_attempt',{attemptId:hex(1)});
 for(let i=0;i<8;i++)e.record('invite_opened');
 e.record('join_succeeded',{attemptId:hex(1)});
 const r=e.report();assert.equal(r.events.length,4);assert.equal(r.counts.truncated,7);assert.equal(r.metrics.joinSucceeded,0);
 assert.equal(JSON.parse(f.values.get(P.KEY)).records.length,4);
 const maximum=fixture({maxRecords:100000}).events;maximum.setConsent(true);for(let i=0;i<2001;i++)maximum.record('invite_opened');assert.equal(maximum.report().events.length,P.MAX_RECORDS);
});

test('blocked, corrupt, oversized and poisoned storage cannot break recording or export private extras',()=>{
 const blocked=fixture({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}}}).events;
 assert.doesNotThrow(()=>{blocked.setConsent(true);blocked.record('round_started',round(1));blocked.flush();JSON.parse(blocked.exportJSON());blocked.clear();blocked.setConsent(false);});
 assert.equal(blocked.report().storageState,'blocked');
 for(const raw of ['{bad','x'.repeat(2000001),JSON.stringify({version:1,installId:hex(9),records:[{name:'invite_opened',build:'0.3.0-beta.4',sessionId:hex(8),at:1,fields:{name:'Private'},private:'secret'}]})]){
  const f=fixture();f.values.set(P.CONSENT,'true');f.values.set(P.KEY,raw);const e=P.create(f.options);
  assert.doesNotThrow(()=>{e.record('invite_opened');e.flush();});assert.equal(e.exportJSON().includes('Private'),false);assert.equal(e.exportJSON().includes('secret'),false);
 }
});

test('export is a deeply immutable snapshot and clear rotates identities while retaining consent',()=>{
 const f=fixture(),e=f.events;e.setConsent(true);e.record('highlight_saved',{eventId:hex(7)});assert.equal(e.record('highlight_saved',{eventId:hex(7)}),false);
 const snap=e.report();assert.ok(Object.isFrozen(snap));assert.ok(Object.isFrozen(snap.events));assert.ok(Object.isFrozen(snap.events[0].fields));assert.ok(Object.isFrozen(snap.metrics));
 e.record('invite_opened');assert.equal(snap.events.length,2);assert.equal(JSON.parse(e.exportJSON()).events.length,3);
 e.clear();assert.equal(e.getConsent(),true);assert.equal(e.report().events.length,0);assert.equal(e.report().installId,null);assert.equal(f.values.has(P.KEY),false);
 e.record('invite_opened');assert.notEqual(e.report().installId,snap.installId);
});
