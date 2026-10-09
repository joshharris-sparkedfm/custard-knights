(async()=>{
 // Diagnostic observations, not acceptance assertions: retain surprising outcomes.
 const results=[];
 const setup=()=>{
  for(const k of Object.keys(CK.keys))delete CK.keys[k];CK.setSeats([{dev:'kb1'},{dev:'kb2'}]);
  CK.begin({humans:2,map:'courtyard',mode:'ffa'});const g=CK.G();g.ents=g.ents.slice(0,2);g.ev=g.mayhem=null;g.pickups=[];g.spawnT=999;
  const [a,b]=g.ents;
  for(const e of [a,b])Object.assign(e,{x:600,y:400,face:0,hp:3,inv:0,protect:0,stun:0,hitLock:0,vx:0,vy:0,fx:{},wpn:null,atkBuf:0,dashBuf:0,atkWas:false});
  b.x=900;return {g,a,b};
 };
 for(const kind of ['light','heavy','stab','bash'])for(const distance of [49,51]){
  const {a,b}=setup();b.x=a.x-distance;CK.startSwing(a,kind);a.swing=a.swingDur-.085+.001;a.vx=0;CK.update(.001);
  results.push({case:'rear-contact',kind,distance,hit:a.hitSet.includes(b.id),hp:b.hp,stun:b.stun});
 }
 {
  const {g,a}=setup();a.dashCd=.025;CK.keys.KeyG=true;CK.update(1/60);CK.keys.KeyG=false;a.stun=.3;CK.update(1/60);
  results.push({case:'buffered-dash-during-stun',stun:a.stun,dashT:a.dashT,dashes:g.stats.dashes});
 }
 for(const kind of ['stab','bash']){
  const {a,b}=setup();b.x=a.x+49;CK.startSwing(a,kind);a.swing=a.swingDur-.085+.001;a.vx=0;CK.update(.001);
  results.push({case:'directional-front-contact',kind,hit:a.hitSet.includes(b.id)});
 }
 if(CK.bladeSweep)for(const kind of ['light','heavy'])for(const face of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const elapsed of [1/15,.085,.12]){
  const {a}=setup();a.face=face;CK.startSwing(a,kind);a.swing=a.swingDur-elapsed;
  results.push({case:'blade-contact-edge',kind,face,elapsed,error:Math.abs(CK.bladeSweep(a)+a.face-CK.swingArc(a,elapsed)[1])});
 }
 {
  const {a}=setup();Object.assign(a,{dashT:.09,dashCd:.8});CK.keys.KeyF=true;CK.update(1/60);
  results.push({case:'attack-before-dash-ends',swingKind:a.swingKind,swing:a.swing,dashT:a.dashT});
 }
 {
  const {a}=setup();Object.assign(a,{dashT:.005,dashCd:.8});CK.keys.KeyF=true;CK.update(1/60);
  results.push({case:'attack-on-dash-end',swingKind:a.swingKind,swing:a.swing,dashT:a.dashT});
 }
 for(const kind of ['light','heavy']){
  const {a,b}=setup();b.x=a.x+64;CK.startSwing(a,kind);a.vx=0;a.swing=a.swingDur-1/15+.001;CK.update(.001);
  results.push({case:'first-active-tick-forward-target',kind,distance:64,elapsedMs:1000/15,hit:a.hitSet.includes(b.id)});
 }
 // Actual keyboard path, fixed simulation ticks. No collision targets to alter hit cooldown.
 {
  const {a}=setup();CK.keys.KeyF=true;let chargeStart=null,fullReach=null;
  for(let i=1;i<=70;i++){CK.update(1/60);if(a.charge>0&&chargeStart===null)chargeStart=i/60;if(a.charge>=.35&&fullReach===null)fullReach=i/60;}
  CK.keys.KeyF=false;CK.update(1/60);
  results.push({case:'hold-after-whiff',chargeStartSeconds:chargeStart,fullReachSeconds:fullReach,releasedKind:a.swingKind,heavyReach:a.heavyReach});
 }
 // Diagnostic synthetic population: payload size only, no claim of 100-player support.
 for(const count of [8,32,64,100]){
  const {g,a}=setup();g.ents=Array.from({length:count},(_,i)=>({...a,id:i,name:'Knight '+i,human:i<4?i+1:0,team:i%2?'red':'blue',x:150+i%20*42,y:200+Math.floor(i/20)*70,ai:{...a.ai},fx:{},lvl:{},kit:{...a.kit},swings:[],hitSet:[]}));
  const bytes=new TextEncoder().encode(JSON.stringify(CK.snapshot())).length;
  results.push({case:'synthetic-snapshot-json',fighters:count,bytes,mbpsAt20HzSevenGuests:bytes*20*7*8/1e6,mbpsAt20Hz99Guests:bytes*20*99*8/1e6});
 }
 await CK.sprLoadAll();CK.sprites(true);setup();
 const cv=document.createElement('canvas');cv.width=1200;cv.height=680;cv.style.cssText='position:fixed;inset:0;z-index:100000';document.body.append(cv);const c=cv.getContext('2d');c.fillStyle='#EEDAB6';c.fillRect(0,0,1200,680);
 const kinds=[['light',.22],['heavy',.3],['stab',.18]];
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const [kind,dur]=kinds[row],el=[.059,1/15,.1,dur-.061][col],x=150+col*300,y=125+row*205;
  const e=CK.mkKnight({id:42,face:0,swingKind:kind,swingDur:dur,swing:dur-el,heavyReach:false});
  c.fillStyle='#291A33';c.font='bold 17px Arial';c.fillText(kind+' '+(el*1000).toFixed(1)+' ms',x-130,y-90);
  CK.withCtx(c,()=>{c.save();c.translate(x,y);c.scale(1.65,1.65);CK.drawKnight(e);c.restore();});
 }
 return {description:'Controlled diagnostics; source hash identifies runtime. No balance/human-play verdict.',results};
})()
