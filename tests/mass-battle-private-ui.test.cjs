const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Core=require('../game/mass-battle.js');
const source=fs.readFileSync(require.resolve('../game/mass-battle-ui.js'),'utf8');

function harness(){
 const nodes=[],sockets=[],timers=new Map();let nextTimer=0,now=0;
 const document={activeElement:null,addEventListener(){},removeEventListener(){}};
 class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};this.listeners={};this.hidden=false;this.value='';this.classList={toggle(){}};nodes.push(this);}
  set textContent(value){this.text=String(value);this.children=[];}
  get textContent(){return (this.text||'')+this.children.map(c=>c.textContent).join(' ');}
  append(...items){for(const item of items){this.children.push(item);item.parentElement=this;}}
  appendChild(item){this.append(item);return item;}
  replaceChildren(...items){this.text='';this.children=[];this.append(...items);}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,fn){this.listeners[name]=fn;}
  focus(){document.activeElement=this;}
  getContext(){return {};}
  querySelector(tag){return this.children.find(c=>c.tagName===tag.toUpperCase())||this.children.map(c=>c.querySelector(tag)).find(Boolean);}
 }
 document.createElement=tag=>new Element(tag);document.body=new Element('body');
 class Socket{
  constructor(url){this.url=url;this.sent=[];this.readyState=0;sockets.push(this);}
  send(raw){this.sent.push(JSON.parse(raw));}
  close(){this.readyState=3;}
  open(){this.readyState=1;this.onopen?.();}
  message(data){this.onmessage?.({data:JSON.stringify(data)});}
 }
 const context={document,CKMassBattle:Core,WebSocket:Socket,URL,console,innerWidth:1280,innerHeight:800,performance:{now:()=>now},location:{protocol:'file:',search:''},addEventListener(){},removeEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id),setInterval:(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,delay,interval:true});return id;},clearInterval:id=>timers.delete(id)};
 vm.runInNewContext(source,context);const api=context.CKMassBattleUI.connect();api.open();
 const find=predicate=>{const result=nodes.find(predicate);assert.ok(result,'UI element exists');return result;};
 const button=text=>{const result=[...nodes].reverse().find(n=>n.tagName==='BUTTON'&&n.textContent===text);assert.ok(result,'Button exists: '+text);return result;};
 const field=label=>find(n=>n.attributes['aria-label']===label);
 const status=()=>find(n=>n.className==='ck-battle-status').textContent;
 const playlist=field('Online playlist'),key=field('Player access key'),url=field('Battle server WebSocket address');
 const chooseRanked=()=>{playlist.value='ranked';playlist.onchange();};
 const join=()=>{button(playlist.value==='ranked'?'Find private ladder match':'Join online battle').onclick();return sockets.at(-1);};
 const snapshot=()=>{const state=Core.create({mode:'ctf',teamSize:20});Core.join(state,{id:'player',name:'Knight'});return Core.snapshot(state);};
 return {api,nodes,sockets,timers,button,field,status,playlist,key,url,chooseRanked,join,snapshot,setNow:value=>now=value,setup:find(n=>n.className==='ck-battle-setup'),modal:find(n=>n.className==='ck-battle-modal'),pauseBanner:find(n=>n.className==='ck-battle-ranked-pause')};
}

test('private key is masked, required for ladder, sent only over secure remote transport and never in URLs',()=>{
 const h=harness();assert.equal(h.key.type,'password');h.chooseRanked();h.join();assert.equal(h.sockets.length,0);assert.match(h.status(),/requires a player access key/);
 h.key.value='private-test-key';h.url.value='ws://battle.example';h.join();assert.equal(h.sockets.length,0);assert.match(h.status(),/Protect your player key/);
 h.url.value='wss://battle.example?accessToken=secret';h.join();assert.equal(h.sockets.length,0);
 h.url.value='wss://battle.example';const ws=h.join();ws.open();assert.equal(ws.sent[0].accessToken,'private-test-key');assert.equal(ws.sent[0].ranked,true);assert.equal(Object.hasOwn(ws.sent[0],'room'),false);assert.equal(ws.url,'wss://battle.example/');
 h.api.close();assert.equal(h.key.value,'');assert.equal(ws.readyState,3);assert.equal(h.timers.size,0);
});

test('accepted queue clears join timeout, pings while waiting, and cancellation rejects late messages',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';const ws=h.join();ws.open();assert.equal(h.timers.size,1);
 ws.message({type:'queue',ranked:true,mode:'ctf',teamSize:20,waiting:1,required:40});assert.equal(h.setup.hidden,false);assert.match(h.status(),/1 \/ 40 players ready/);assert.equal([...h.timers.values()].some(t=>!t.interval),false);
 const interval=[...h.timers.values()][0];h.setNow(5000);interval.fn();assert.equal(ws.sent.at(-1).type,'ping');ws.message({type:'pong'});
 const late=ws.onmessage;h.button('Cancel search').onclick();assert.equal(h.timers.size,0);assert.equal(h.key.value,'key');late({data:JSON.stringify({type:'welcome',protocol:1,ranked:true,sessionId:'player'})});late({data:JSON.stringify({type:'snapshot',state:h.snapshot()})});assert.equal(h.api.snapshot(),null);assert.equal(h.setup.hidden,false);
});

test('queue liveness failure and changing playlist both release the connection',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';let ws=h.join();ws.open();ws.message({type:'queue',ranked:true,mode:'ctf',teamSize:20,waiting:1,required:40});h.setNow(21001);[...h.timers.values()][0].fn();assert.match(h.status(),/stopped responding/);assert.equal(ws.readyState,3);
 ws=h.join();ws.open();h.playlist.value='casual';h.playlist.onchange();assert.equal(ws.readyState,3);assert.equal(h.timers.size,0);assert.equal(h.setup.hidden,false);
});

test('ranked welcome gates snapshots and displays scoped profile, rating confirmation and leaderboard',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';const ws=h.join();ws.open();ws.message({type:'snapshot',state:h.snapshot()});assert.equal(h.api.snapshot(),null);
 ws.message({type:'welcome',protocol:1,ranked:true,sessionId:'player',profile:{rating:1000,matches:0,provisional:true}});ws.message({type:'snapshot',state:h.snapshot()});assert.equal(h.setup.hidden,true);assert.equal(h.timers.size,0);h.button('Scoreboard').onclick();assert.match(h.modal.textContent,/1000 rating · provisional/);assert.deepEqual(ws.sent.at(-1),{type:'leaderboard',ranked:true,mode:'ctf',teamSize:20});
 ws.message({type:'leaderboard',ranked:true,mode:'siege',teamSize:20,entries:[{name:'WRONG_SCOPE',rating:3000}]});assert.doesNotMatch(h.modal.textContent,/WRONG_SCOPE/);
 ws.message({type:'rating',ranked:true,eligible:true,changes:{before:1000,after:1012,delta:12},profile:{rating:1012,matches:1,wins:1,provisional:true}});assert.match(h.modal.textContent,/Rating saved: 1000 → 1012 \(\+12\)/);
 ws.message({type:'leaderboard',ranked:true,mode:'ctf',teamSize:20,entries:[{name:'Saved Knight',rating:1012,matches:1,wins:1,provisional:true}]});assert.match(h.modal.textContent,/Saved Knight · 1012 rating/);
 ws.message({type:'error',code:'RATING_UNAVAILABLE',message:'The result could not be saved.'});assert.match(h.modal.textContent,/No rating awarded: The result could not be saved/);assert.doesNotMatch(h.modal.textContent,/Rating saved:/);
 h.button('Choose another battle').onclick();h.playlist.value='casual';h.playlist.onchange();h.key.value='';const casual=h.join();casual.open();assert.equal(Object.hasOwn(casual.sent[0],'accessToken'),false);assert.equal(casual.sent[0].ranked,false);casual.message({type:'welcome',protocol:1,sessionId:'player'});casual.message({type:'snapshot',state:h.snapshot()});h.button('Scoreboard').onclick();assert.match(h.modal.textContent,/Server session results · unranked/);assert.doesNotMatch(h.modal.textContent,/1012 rating/);
});

test('blocked authentication and an unranked server response cannot silently enter a ladder game',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';let ws=h.join();ws.open();ws.message({type:'error',message:'Invalid player access key.'});assert.equal(ws.readyState,3);assert.match(h.status(),/Invalid player access key/);assert.equal(h.timers.size,0);
 ws=h.join();ws.open();ws.message({type:'welcome',protocol:1,ranked:false,sessionId:'player'});assert.match(h.status(),/did not confirm a private ladder match/);assert.equal(ws.readyState,3);assert.equal(h.setup.hidden,false);
});

test('late rating and save-error messages from another room cannot overwrite the current match',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';const ws=h.join();ws.open();ws.message({type:'welcome',protocol:1,ranked:true,room:'current-room',sessionId:'player',profile:{rating:1000,matches:0}});ws.message({type:'snapshot',state:h.snapshot()});h.button('Scoreboard').onclick();
 ws.message({type:'rating',ranked:true,room:'current-room',eligible:true,changes:{before:1000,after:1012,delta:12},profile:{rating:1012,matches:1,wins:1}});assert.match(h.modal.textContent,/1 match ·/);assert.doesNotMatch(h.modal.textContent,/1 matches/);
 const confirmed=h.modal.textContent,sent=ws.sent.length;
 ws.message({type:'rating',ranked:true,room:'previous-room',eligible:true,changes:{before:990,after:1000,delta:10},profile:{rating:1000,matches:0}});assert.equal(h.modal.textContent,confirmed);assert.equal(ws.sent.length,sent);
 ws.message({type:'error',code:'RATING_UNAVAILABLE',room:'previous-room',message:'Old match save failed.'});assert.equal(h.modal.textContent,confirmed);assert.equal(ws.readyState,1);
 ws.message({type:'error',code:'RATING_PROFILE_UNAVAILABLE',room:'previous-room',message:'Old profile unavailable.'});assert.equal(h.modal.textContent,confirmed);
 ws.message({type:'error',code:'RATING_UNAVAILABLE',room:'current-room',message:'Current result could not be saved.'});assert.match(h.modal.textContent,/No rating awarded: Current result could not be saved/);assert.doesNotMatch(h.modal.textContent,/Rating saved:/);
});

test('a saved result with unavailable profile keeps its confirmed change and clears stale profile details',()=>{
 const h=harness();h.chooseRanked();h.key.value='key';const ws=h.join();ws.open();ws.message({type:'welcome',protocol:1,ranked:true,room:'current-room',sessionId:'player',profile:{rating:1000,matches:4}});ws.message({type:'snapshot',state:h.snapshot()});h.button('Scoreboard').onclick();
 ws.message({type:'rating',ranked:true,room:'current-room',eligible:true,changes:{before:1000,after:1012,delta:12},profile:null});assert.match(h.modal.textContent,/Rating saved: 1000 → 1012/);assert.doesNotMatch(h.modal.textContent,/1000 rating|4 matches/);
 ws.message({type:'error',code:'RATING_PROFILE_UNAVAILABLE',room:'current-room',message:'The result was saved, but your updated profile is temporarily unavailable.'});assert.match(h.modal.textContent,/Rating saved: 1000 → 1012/);assert.match(h.modal.textContent,/updated profile is temporarily unavailable/);assert.doesNotMatch(h.modal.textContent,/No rating awarded/);assert.equal(ws.readyState,1);
});

function enterRanked(h){h.chooseRanked();h.key.value='original-key';const ws=h.join();ws.open();ws.message({type:'welcome',protocol:1,ranked:true,room:'reserved-room',sessionId:'player',profile:{rating:1000,matches:0}});ws.message({type:'snapshot',state:h.snapshot()});return ws;}

test('ranked pause and resume notices are scoped to the active room and reset after leaving',()=>{
 const h=harness(),ws=enterRanked(h);const before=JSON.stringify(h.api.snapshot());
 ws.message({type:'ranked_pause',room:'old-room',paused:true,remainingSeconds:20,missingCount:1});assert.equal(h.pauseBanner.hidden,true);
 ws.message({type:'ranked_pause',room:'reserved-room',paused:true,remainingSeconds:20,missingCount:1});assert.equal(h.pauseBanner.hidden,false);assert.match(h.pauseBanner.textContent,/1 player reconnecting · 20s grace/);assert.equal(JSON.stringify(h.api.snapshot()),before);
 h.button('Menu').onclick();assert.match(h.modal.textContent,/pauses during reconnect grace/);assert.match(h.modal.textContent,/20s grace/);
 ws.message({type:'ranked_pause',room:'reserved-room',paused:false,remainingSeconds:0,missingCount:0});assert.match(h.pauseBanner.textContent,/battle resumed/);
 h.button('Choose another battle').onclick();assert.equal(h.pauseBanner.hidden,true);assert.equal(ws.sent.at(-1).type,'leave');
});

test('manual reconnect uses the original private account and match settings without sending a deliberate leave',()=>{
 const h=harness(),ws=enterRanked(h),initial=ws.sent[0],late=ws.onmessage,before=JSON.stringify(h.api.snapshot());ws.onclose();
 assert.equal(h.sockets.length,1,'transport drop never automatically reconnects');assert.equal(ws.sent.some(m=>m.type==='leave'),false);assert.match(h.modal.textContent,/Reconnect to battle/);
 h.url.value='ws://untrusted.example';h.key.value='different-key';h.nodes.find(n=>n.tagName==='LABEL'&&n.text.startsWith('Your role')).children[0].value='support';
 h.button('Reconnect to battle').onclick();const retry=h.sockets.at(-1);assert.equal(retry.url,ws.url);assert.equal(h.button('Reconnect to battle').disabled,true);retry.open();assert.deepEqual(retry.sent[0],{...initial,resumeRoom:'reserved-room'});
 late({data:JSON.stringify({type:'ranked_pause',room:'reserved-room',paused:true,remainingSeconds:20,missingCount:1})});assert.equal(h.pauseBanner.hidden,true);
 retry.message({type:'welcome',protocol:1,ranked:true,room:'reserved-room',sessionId:'player',profile:{rating:1000,matches:0}});retry.message({type:'snapshot',state:JSON.parse(before)});assert.equal(h.modal.hidden,true);assert.equal(h.setup.hidden,true);assert.equal(JSON.stringify(h.api.snapshot()),before);
 h.api.close();assert.equal(h.key.value,'');assert.equal(retry.sent.at(-1).type,'leave');late({data:JSON.stringify({type:'welcome',protocol:1,ranked:true,room:'reserved-room',sessionId:'player'})});assert.equal(h.sockets.length,2);assert.equal(h.api.active(),false);
});

test('expired recovery never enters a new queue or silently joins a different match',()=>{
 for(const message of [{type:'error',code:'RECONNECT_EXPIRED',message:'Your reconnect reservation expired.'},{type:'queue',ranked:true,mode:'ctf',teamSize:20,waiting:1,required:40},{type:'welcome',protocol:1,ranked:true,room:'another-room',sessionId:'player'}]){
  const h=harness(),ws=enterRanked(h);ws.onclose();h.button('Reconnect to battle').onclick();const retry=h.sockets.at(-1);retry.open();retry.message(message);assert.equal(retry.readyState,3);assert.equal(h.modal.hidden,false);assert.doesNotMatch(h.modal.textContent,/Reconnect to battle/);assert.equal(h.sockets.length,2);assert.equal(h.timers.size,0);
 }
});

test('deliberate exit clears recovery and ignores the old socket close callback',()=>{
 const h=harness(),ws=enterRanked(h),lateClose=ws.onclose;h.button('Menu').onclick();h.button('Choose another battle').onclick();lateClose();assert.equal(h.sockets.length,1);assert.equal(h.setup.hidden,false);assert.equal(h.modal.hidden,true);assert.equal(ws.sent.at(-1).type,'leave');assert.equal(h.timers.size,0);
 const casual=harness(),casualSocket=casual.join();casualSocket.open();casualSocket.message({type:'welcome',protocol:1,ranked:false,sessionId:'player',room:'casual'});casualSocket.message({type:'snapshot',state:casual.snapshot()});casualSocket.onclose();assert.doesNotMatch(casual.modal.textContent,/Reconnect to battle/);
});

test('finished results explain reconnect forfeits and retain ordinary completion copy',()=>{
 for(const reason of ['forfeit','time']){
  const h=harness(),ws=enterRanked(h),state=h.snapshot();state.status='finished';state.winner='custardia';state.finishReason=reason;ws.message({type:'snapshot',state});h.button('Menu').onclick();
  if(reason==='forfeit'){assert.match(h.modal.textContent,/ended by forfeit/);assert.match(h.modal.textContent,/a player did not return before their reconnect grace expired/);assert.doesNotMatch(h.modal.textContent,/The battle is complete\./);}
  else{assert.match(h.modal.textContent,/The battle is complete\. Start another to change role, mode or army size\./);assert.doesNotMatch(h.modal.textContent,/ended by forfeit/);}
 }
});
