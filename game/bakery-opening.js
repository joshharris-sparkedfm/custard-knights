/* FE08 scenery and authored footprints. No save, rewards, or combat rules. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKBakeryOpening=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const footprints=[{c:3,r:2,w:10,h:5},{c:20,r:3,w:7,h:5},{c:14,r:10,w:3,h:1}];
 const gardens=[{c:15,r:5,w:2,h:1,sprite:[575,115,130,200]},{c:29,r:15,w:2,h:2,sprite:[1152,598,96,147]}];
 function layout(g,kind){const solids=[...footprints,...gardens,...(['opening','homecoming'].includes(kind)?[]:[{c:27,r:3,w:4,h:5}])];for(const b of solids)for(let r=b.r;r<b.r+b.h;r++)for(let c=b.c;c<b.c+b.w;c++)g.grid[r][c]='#';}
 const ink='#34253e',cream='#fff2cf';
 // Load once; the original drawing remains available while offline assets load.
 const community={};
 if(typeof Image!=='undefined')for(const name of ['bakery-stall','bread-crate','solitude-tree']){
  const image=new Image();image.src='sprites/community/'+name+'.png';community[name]=image;
 }
 function communityBakery(c){
  const stall=community['bakery-stall'],bread=community['bread-crate'];
  if(!stall?.complete||!stall.naturalWidth||!bread?.complete||!bread.naturalWidth)return false;
  const {oval}=tools(c);
  // A stocked shopfront on the existing bakery, with its roof and ovens retained.
  // Ground contact stays inside x120..520/y160..360, the authored solid footprint.
  oval(320,344,92,12,'#34253e33');
  c.drawImage(stall,225,175,190,185);
  c.drawImage(bread,139,292,62,60);c.drawImage(bread,439,292,62,60);
  return true;
 }
 function tools(c){
  const box=(x,y,w,h,col,r=5)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.strokeStyle=ink;c.lineWidth=3;c.fill();c.stroke();};
  const oval=(x,y,rx,ry,col)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();};
  const text=(s,x,y,size=17,col=cream)=>{c.font=`bold ${size}px Nunito,sans-serif`;c.textAlign='center';c.lineWidth=col===ink?2:4;c.strokeStyle=col===ink?cream:ink;c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);};
  return {box,oval,text};
 }
 function gardenTrees(c){
  const {box,oval}=tools(c),tree=community['solitude-tree'];
  for(const bed of gardens){
   const x=bed.c*40,y=80+bed.r*40,w=bed.w*40,h=bed.h*40,[sx,sy,sw,sh]=bed.sprite;
   // Raised stone planters expose the exact solid grid footprint, including on image failure.
   box(x,y,w,h,'#a48f77',7);box(x+4,y+4,w-8,h-9,'#c7bf98',5);
   oval(x+w/2,y+h-12,w*.35,7,'#675c4d55');
   if(tree?.complete&&tree.naturalWidth)c.drawImage(tree,sx,sy,sw,sh);
   else{
    const cx=sx+sw/2,base=sy+sh-8;
    box(cx-6,base-sh*.61,12,sh*.61,'#aa7c55',4);
    for(const [dx,dy,size] of [[0,.76,.24],[-.19,.58,.22],[.18,.47,.2],[-.13,.29,.18]]){
     oval(cx+dx*sw,base-dy*sh,sw*size,sh*.13,'#77986b');oval(cx+dx*sw-3,base-dy*sh-5,sw*size*.75,sh*.08,'#a8bf82');
    }
   }
  }
 }
 function courtyard(c){
  const {box,oval}=tools(c);
  c.fillStyle='#a6b584';c.fillRect(0,80,1280,720);
  // Flat garden markings stay walkable; raised edging is confined to perimeter solids.
  for(let row=0;row<8;row++)for(let col=0;col<18;col++){
   if((row*13+col*7)%5>1)continue;
   const x=58+col*68+(row*17+col*11)%31,y=141+row*79+(col*19+row*7)%27-13;
   oval(x,y,22+(col%3)*7,8,'#afbd90');
   if((row+col)%3===0){
    c.strokeStyle='#8eaa76';c.lineWidth=2;c.beginPath();c.moveTo(x-4,y);c.lineTo(x-7,y-5);c.moveTo(x,y);c.lineTo(x+2,y-7);c.stroke();
   }
  }
  c.fillStyle='#b6a27f';c.fillRect(40,436,1200,163);c.fillRect(421,345,123,324);
  c.fillStyle='#e5d0a3';c.fillRect(40,442,1200,151);c.fillRect(427,345,111,318);
  const stones=['#e8d6b0','#dfc89e','#f0dfba','#d9c49d'];
  for(let row=0;row<4;row++)for(let col=0;col<25;col++){
   const x=46+col*48,y=449+row*35;
   c.beginPath();c.roundRect(x,y,43,29,7);c.fillStyle=stones[(col*3+row)%4];c.fill();
   c.strokeStyle='#c9b18c';c.lineWidth=1.5;c.stroke();
   c.strokeStyle='#f7e9cb';c.beginPath();c.moveTo(x+7,y+5);c.lineTo(x+34,y+5);c.stroke();
  }
  for(let y=363;y<657;y+=37){
   if(y>430&&y<600)continue;
   for(let col=0;col<2;col++){c.beginPath();c.roundRect(433+col*51,y,45,29,7);c.fillStyle=stones[(col+y)%4];c.fill();c.strokeStyle='#c9b18c';c.lineWidth=1.5;c.stroke();}
  }
  // Foundation stones and soft hedge crowns make all four collision edges visible.
  box(0,80,1280,40,'#668366',5);box(0,760,1280,40,'#668366',5);
  box(0,120,40,640,'#668366',5);box(1240,120,40,640,'#668366',5);
  for(let x=22;x<1280;x+=42){
   oval(x,96,25,12,'#779568');oval(x-5,91,16,5,'#94ac78');
   oval(x,779,25,13,'#779568');oval(x-5,774,16,5,'#94ac78');
  }
  for(let y=138;y<752;y+=42){
   oval(19,y,15,25,'#779568');oval(1261,y,15,25,'#779568');
   oval(15,y-7,5,13,'#94ac78');oval(1257,y-7,5,13,'#94ac78');
  }
  c.strokeStyle='#d1d4ab';c.lineWidth=3;c.beginPath();c.moveTo(42,121);c.lineTo(1238,121);c.moveTo(42,758);c.lineTo(1238,758);c.stroke();
  for(let x=72;x<1230;x+=89){
   for(const y of [694,736]){
    const ox=(y===694?0:23);oval(x+ox,y,3,3,'#fff0cb');oval(x+ox+4,y-3,3,3,'#fff0cb');oval(x+ox+1,y-2,2,2,'#d4a65c');
   }
  }
 }
 function bakeryFacade(c){
  const {box,oval,text}=tools(c);
  box(120,160,400,200,'#f3d9ad',8);
  box(124,330,392,26,'#bd9572',4);
  for(let x=130;x<511;x+=47){c.strokeStyle='#dfbd93';c.lineWidth=2;c.beginPath();c.moveTo(x,333);c.lineTo(x,355);c.stroke();}
  for(const x of [124,503])box(x,220,13,109,'#c69e75',2);
  box(270,272,68,84,'#527c79',13);box(281,285,45,63,'#3c6266',8);oval(320,320,3,3,'#f7d98c');
  c.beginPath();c.moveTo(111,187);c.lineTo(320,134);c.lineTo(529,187);c.closePath();c.fillStyle='#b66a73';c.strokeStyle=ink;c.lineWidth=4;c.fill();c.stroke();
  c.strokeStyle='#d68c8b';c.lineWidth=3;
  for(let row=0;row<3;row++){
   const y=153+row*12,half=(y-134)*3.9;
   c.beginPath();c.moveTo(320-half,y);c.lineTo(320+half,y);c.stroke();
   for(let x=320-half+15;x<320+half-10;x+=27){c.beginPath();c.moveTo(x,y);c.lineTo(x+4,y+8);c.stroke();}
  }
  for(const x of [150,372]){
   box(x,230,96,75,'#537c79',7);box(x+7,237,82,51,'#f7ce85',4);
   oval(x+23,281,17,8,'#bd864d');oval(x+60,278,18,9,'#e8d398');
   c.strokeStyle='#6c6859';c.lineWidth=3;c.beginPath();c.moveTo(x+48,236);c.lineTo(x+48,291);c.moveTo(x+7,259);c.lineTo(x+88,259);c.stroke();
   c.fillStyle='#fff2c955';c.fillRect(x+12,241,19,35);
   box(x-4,299,104,9,'#c69e75',3);
  }
  if(!communityBakery(c))for(let i=0;i<10;i++)box(120+i*40,312,40,18,i%2?cream:'#b7646b',2);
  box(140,183,360,40,'#493e4a',8);box(148,190,344,26,'#f2dbab',5);text('MABEL’S BAKERY',320,212,23,'#fff5d6');
  for(const x of [132,508]){oval(x,238,9,12,'#e4b46b');oval(x-2,235,4,7,'#fff0bb');}
 }
 function cook(c,s,label=s.name,drawActor){const {box,oval,text}=tools(c);c.save();oval(s.x,s.y+4,20,7,ink+'55');const rendered=drawActor?.(c,{kind:'cook',name:s.name,x:s.x,y:s.y,face:s.face,speed:s.speed||0,time:s.time||0});c.translate(s.x,s.y);if(!rendered){
  c.strokeStyle=ink;c.lineWidth=6;c.beginPath();c.moveTo(-8,-7);c.lineTo(-10,3);c.moveTo(8,-7);c.lineTo(10,3);c.stroke();
  box(-17,-37,34,32,s.color,9);box(-10,-34,20,29,cream,5);oval(0,-49,13,13,'#e9b889');
  box(-15,-69,30,14,cream);for(let i=-1;i<=1;i++)oval(i*10,-71,10,10,cream);}text(label,s.labelBeside?-104:0,s.labelBeside?-34:-94,16,s.rescued?'#2ec4b6':cream);c.restore();
 }
 function tray(c,x,y,covered=true){const {oval,box}=tools(c);oval(x,y+6,31,9,'#b8c5cc');oval(x,y+3,29,7,'#e0e7e4');for(let i=-1;i<=1;i++){oval(x+i*16,y-2,11,9,'#e2a759');oval(x+i*16-3,y-5,3,3,cream);}if(covered){box(x-29,y-15,58,14,cream,8);c.strokeStyle='#ca7886';c.lineWidth=3;c.beginPath();c.moveTo(x-15,y-13);c.lineTo(x-15,y-1);c.moveTo(x+15,y-13);c.lineTo(x+15,y-1);c.stroke();}}
 function siege(c,r){const {oval,box,text}=tools(c),x=1166+75*(1-r.supplyProgress);c.save();c.translate(x,30);c.scale(.86,.86);
  for(const wx of [-68,62]){oval(wx,370,24,28,ink);oval(wx,370,14,17,'#b48b61');}
  box(-93,330,175,25,'#87624b',8);box(-13,194,15,158,'#80684f');box(-73,240,128,18,'#80684f');
  c.beginPath();c.moveTo(-99,273);c.quadraticCurveTo(-79,365,-10,365);c.quadraticCurveTo(68,365,92,273);c.closePath();c.fillStyle='#d9e4df';c.strokeStyle=ink;c.lineWidth=5;c.fill();c.stroke();
  oval(-4,273,98,26,'#a5c3c9');oval(-4,272,89,18,'#e5bc56');box(-37,190,62,41,'#778db2',4);text('RICE',-6,217,18);text('SIEGE BOWL',-8,161,21,'#ffe28a');c.restore();
 }
 function scenery(c,r){c.save();const {box,oval,text}=tools(c);
  if(!r.prelude&&r.node.id==='banquet'){
   c.fillStyle='#9c7861';c.fillRect(40,120,680,640);c.fillStyle='#c9c1a0';c.fillRect(760,120,480,640);
   for(let y=140;y<750;y+=40)for(let x=60;x<1220;x+=40){c.fillStyle=x<720?'#ad8871':'#ddd4b2';c.fillRect(x,y,35,35);}
   box(92,153,564,57,'#694a4f',10);text('PEACE BANQUET · ONE PIE TOO MANY',374,190,23);box(822,154,366,57,'#466966',10);text('PANTRY · GET EVERYONE OUT',1005,190,22);
   // Shelves occupy the same solid dividing-wall cells; the breakable doorway
   // at row 8 remains visible and clear once the actual engine crate is gone.
   for(let row=1;row<17;row++){if(row===8)continue;box(720,80+row*40,40,40,'#80634e',2);oval(730,94+row*40,7,7,'#e4b762');oval(748,96+row*40,7,8,'#eee2b7');}
   text('SERVICE LANE →',1100,700,19,'#2ec4b6');c.restore();return;
  }
  courtyard(c);
  gardenTrees(c);
  // Bakery footprint: cells c3..12/r2..6, exactly x120..520/y160..360.
  bakeryFacade(c);
  // Steve enclosure footprint: c20..26/r3..7. The gate is decorative;
  // players reach every delivery objective through the clear southern lane.
  box(800,200,280,200,'#c1c995',7);box(806,207,268,186,'#b0bc86',5);
  for(let i=0;i<12;i++){const x=820+(i*71)%235,y=227+(i*43)%123;oval(x,y,7,3,'#d8d7a5');}
  for(let x=812;x<1075;x+=29){box(x,358,7,41,'#c79c72',2);}box(800,372,280,8,'#ebc99a',2);text('STEVE · SCRAPS ONLY',940,186,16);
  box(560,480,120,40,'#916c50',6);box(567,488,105,10,'#b69268',3);text(r.quietKind==='opening'?'DELIVERY TABLE':r.quietKind==='homecoming'?'FRESH BREAD':'COOKS’ SUPPLIES',620,565,17);
  box(1060,419,150,32,'#615141',5);text(r.quietKind==='opening'?'BANQUET →':r.quietKind==='homecoming'?'HOME SAFE':r.node.id==='puddings'?'SERVICE →':'PUDDINGS →',1135,442,18);
  c.strokeStyle='#e4c474';c.lineWidth=4;c.setLineDash([10,15]);c.beginPath();c.moveTo(695,559);c.lineTo(1140,559);c.stroke();c.setLineDash([]);
  if(r.quietKind==='aftermath'||r.node.id==='puddings'){
   // The closed siege approach has the exact extra solid footprint c27..30,
   // r3..7. Its stone rim makes the blockade readable even beside the bowl.
   box(1080,200,160,200,'#8e8b77',7);box(1080,200,160,12,'#c4b697',2);box(1080,388,160,12,'#c4b697',2);box(1080,212,10,176,'#b4a385',2);box(1230,212,10,176,'#b4a385',2);siege(c,r);
   if(r.node.id==='puddings'){box(535,579,200,27,'#688a91',6);oval(578,591,37,14,'#b6a775');for(let i=0;i<5;i++){c.strokeStyle='#756b54';c.lineWidth=3;c.beginPath();c.moveTo(552+i*13,581);c.lineTo(561+i*13,602);c.stroke();}
    box(194,539,292,31,'#443846',5);text('BOWL → OVENS · CHANNEL BLOCKED',340,560,14,'#ffe28a');
    box(545,613,198,27,'#443846',5);text('COOLING ROUTE →',644,632,15,'#a9dce4');}

  }
  if(r.quietKind==='homecoming'){box(545,390,220,24,'#688a91',5);c.strokeStyle='#a9dce4';c.lineWidth=8;c.beginPath();c.moveTo(555,402);c.lineTo(755,402);c.stroke();text('COOLING WATER FLOWING',655,378,14,'#a9dce4');text('OVENS OPEN',320,392,17,'#ffe28a');}
  c.restore();
 }
 function draw(c,r,drawActor){c.save();const {box,oval,text}=tools(c);
  if(r.quietKind==='opening'){
   if(r.phase<2)tray(c,620,475);
   // The scrap leaves the pile, travels in Steve's beak, then disappears.
   const t=r.steve.theft,reach=Math.min(1,t/.8),back=Math.max(0,Math.min(1,(t-1.2)/1.2)),headX=970+45*reach-45*back;
   const steveX=943+45*(reach-back);oval(steveX,338,40,12,ink+'44');
   const rendered=drawActor?.(c,{kind:'chicken',x:steveX,y:338,r:42,face:.15,walk:t*4,moving:t>0&&t<2.4});
   if(!rendered){
    oval(938,311,47,35,cream);oval(headX,278+8*reach,22,24,cream);oval(headX-8,253+8*reach,9,11,'#c95664');oval(headX+5,253+8*reach,7,10,'#c95664');oval(headX+6,273+8*reach,3,4,ink);
    c.beginPath();c.moveTo(headX+17,281+8*reach);c.lineTo(headX+35,289+8*reach);c.lineTo(headX+16,296+8*reach);c.closePath();c.fillStyle='#edb55d';c.fill();
   }
   if(t<.85)oval(1040,315,13,8,'#e8b86d');else if(t<2.1)oval(rendered?steveX+44:headX+33,rendered?279:294+8*reach,13,8,'#e8b86d');oval(1051,326,5,3,'#e8b86d');text(t>=1.6?'Steve · stolen bun!':'Scraps',1040,350,13);
   const m={...r.mabel,time:r.elapsed};if(r.steve.stolen){const d=Math.min(1,Math.max(0,(r.phaseT-1.6)/4));m.x+=d*550;m.y=424+Math.min(1,d*5)*132;m.speed=d>0&&d<1?Math.hypot(137.5,d<.2?165:0):0;m.face=d<.2?Math.atan2(165,137.5):0;}cook(c,m,dName(r,m),drawActor);
  }else if(r.quietKind==='homecoming'){homecoming(c,r,drawActor);
  }else{
   const names=['Mabel · keeping home open','Alf · flour for cover','Pip · cooling water'];
   r.staff.forEach((s,i)=>cook(c,{...s,time:r.elapsed,y:s.y+(i===1?25*r.supplyProgress:0),x:s.x-(i===2?35*r.supplyProgress:0)},names[i],drawActor));
   box(577,464,34,27,'#e0c99d',9);text('FLOUR',594,484,9,ink);box(625,461,29,30,'#68a8bc',7);oval(639,462,14,5,'#a9dce4');
   tray(c,699,476,false);text(r.tray.state==='supplied'?'Supplies ready · protect the puddings':'Saved cooks → supplies → cover',770,618,19,'#ffe28a');
  }
  const target=r.quietKind==='homecoming'?r.mabel:r.phase===0&&r.quietKind==='opening'?r.mabel:r.phase<(r.quietKind==='opening'?2:1)?{x:605,y:550}:{x:1130,y:500};
  c.beginPath();c.ellipse(target.x,target.y+8,42,17,0,0,Math.PI*2);c.strokeStyle='#ffe28a';c.lineWidth=4;c.stroke();
  if(Math.hypot(r.player.x-target.x,r.player.y-target.y)<90)text('INTERACT',target.x,target.y+43,16,'#ffe28a');c.restore();
 }
 function homeKnight(c,e,col,drawActor,role){const {box,oval,text}=tools(c);oval(e.x,e.y+4,22,7,ink+'55');const rendered=drawActor?.(c,{kind:'knight',role,x:e.x,y:e.y,r:25,color:col,face:1.1});c.save();c.translate(e.x,e.y);if(!rendered){oval(0,-26,21,25,col);oval(0,-52,20,18,'#c9d8dd');box(-17,-58,34,11,'#3b364b',4);oval(0,-75,7,12,col);c.strokeStyle=cream;c.lineWidth=2;for(const x of [-6,3]){c.beginPath();c.moveTo(x,-56);c.lineTo(x,-49);c.stroke();}}text(e.name,0,34,14);c.restore();return !!rendered;}
 function homecoming(c,r,drawActor){const {box,oval,text}=tools(c);
  for(const [i,s]of r.staff.entries()){const working={...s,time:r.elapsed};if(i===1)working.y+=Math.sin(r.elapsed)*4;if(i===2)working.x-=15+Math.sin(r.elapsed*.7)*10;cook(c,working,s.name,drawActor);if(i===1){box(working.x-17,working.y-35,34,26,'#e0c99d',6);text('FLOUR',working.x,working.y-18,9,ink);}if(i===2){box(working.x-12,working.y-33,24,25,'#68a8bc',6);oval(working.x,working.y-33,12,4,'#a9dce4');}}
  tray(c,620,475,false);const branSprite=homeKnight(c,r.homecoming.bran,'#cfe6ff',drawActor,'bran');crossingShield(c,r.homecoming.bran,branSprite);homeKnight(c,r.homecoming.stirling,'#69b0a4',drawActor,'stirling');box(862,553,34,27,'#e0c99d',6);text('FLOUR',879,570,8,ink);
  // The same food interest is at home now: Steve eats the scraps in his pen.
  const dip=(1+Math.sin(r.elapsed*2))*.5,hx=982,hy=283+dip*19;oval(955,338,40,12,ink+'44');if(!drawActor?.(c,{kind:'chicken',x:965,y:338,r:42,face:.15,tilt:dip*.08})){oval(938,311,47,35,cream);oval(hx,hy,22,24,cream);oval(hx-5,hy-25,9,11,'#c95664');oval(hx+6,hy-5,3,4,ink);c.beginPath();c.moveTo(hx+17,hy+3);c.lineTo(hx+35,hy+11);c.lineTo(hx+16,hy+18);c.closePath();c.fillStyle='#edb55d';c.fill();}for(let i=0;i<5;i++)oval(1020+i*7,329-i%2*5,5,3,'#e8b86d');text('Steve · eating scraps',982,433,14);
 }
 function dName(r){return r.steve.stolen?'Mabel · to the pantry':'Mabel';}
 function foreground(c,r){if(r.tray.state==='carried'){c.save();tray(c,r.player.x+Math.cos(r.player.face)*18,r.player.y-34);c.restore();}}
 function crossingShield(c,e,sprite=false){const {text}=tools(c);c.save();c.translate(e.x,e.y);c.save();if(sprite)c.translate(40,0);
  c.beginPath();c.ellipse(-23,-25,12,18,0,0,Math.PI*2);c.fillStyle='#9bafb9';c.strokeStyle=ink;c.lineWidth=2;c.fill();c.stroke();c.beginPath();c.moveTo(-31,-15);c.lineTo(-15,-35);c.strokeStyle=cream;c.lineWidth=4;c.stroke();c.restore();text('Bran · striped shield',0,-91,13);c.restore();}
 function siegeStaff(c,r,drawActor){c.save();const {box,oval,text}=tools(c);
  const routes=[[{x:410,y:405},{x:410,y:390},{x:320,y:390}],[{x:640,y:440},{x:690,y:440},{x:690,y:550},{x:420,y:550},{x:420,y:390},{x:360,y:390}],[{x:460,y:620},{x:420,y:620},{x:420,y:390},{x:400,y:390}]];
  function job(route,t){const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)),total=lengths.reduce((a,b)=>a+b,0);let d=(t*58)%(total*2),sign=d>total?-1:1;if(d>total)d=total*2-d;for(let i=0;i<lengths.length;i++){if(d>lengths[i]){d-=lengths[i];continue;}const f=d/lengths[i],dx=route[i+1].x-route[i].x,dy=route[i+1].y-route[i].y;return {x:route[i].x+dx*f,y:route[i].y+dy*f,face:Math.atan2(dy*sign,dx*sign),speed:58};}return route.at(-1);}
  for(const s of r.staff){const station=r.stands[s.station],working=station.hp>0,position=working?job(routes[s.station],r.elapsed+s.station*2):s;cook(c,{...s,...position,time:r.elapsed},s.name,drawActor);
   if(working){if(s.station===2){box(position.x-13,position.y-34,26,24,'#68a8bc',8);oval(position.x,position.y-34,12,4,'#a9dce4');}else if(s.station===0)tray(c,position.x,position.y-28,false);else{box(position.x-18,position.y-33,36,25,'#e0c99d',10);text('FLOUR',position.x,position.y-18,10,ink);}}
  }text('THE COOKS ARE MOVING YOUR SUPPLIES INTO COVER',640,720,19,'#ffe28a');c.restore();}
 return Object.freeze({layout,footprints,gardens,cook,scenery,draw,foreground,crossingShield,siegeStaff});
});
