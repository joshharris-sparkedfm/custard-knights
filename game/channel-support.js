/* FE09-B cooling route: exact tile footprints and scripted support, no combat AI. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKChannelSupport=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const ink='#34253e',cream='#fff2cf',gold='#ffd23f',teal='#2ec4b6';
 const accessCells=[8,9,10];
 function access(g,open){for(const r of accessCells)g.grid[r][21]=open?'.':'#';}
 function layout(g,id){
  if(id==='bridge'){
   for(const c of [8,16,24])for(let r=4;r<=14;r++)g.grid[r][c]='o';
   // Landing abutments occupy real solid cells, leaving the gold route and
   // two entirely dry outer paths open to the engine's 17.6px move radius.
   for(const c of [10,18,26])for(const r of [4,14])g.grid[r][c]='#';
  }else{
   // Tool yard, north pursuer entrance, and a three-tile service gate.
   for(let c=12;c<30;c++)for(let r=1;r<=3;r++)g.grid[r][c]='#';
   for(let r=4;r<=16;r++)if(!accessCells.includes(r))g.grid[r][21]='#';
   for(let c=4;c<=17;c++)g.grid[14][c]='#';
   access(g,false);
  }
 }
 function text(c,s,x,y,size=16,col=cream){c.font='bold '+size+'px Nunito,sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle=ink;c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);}
 function line(c,x,y,a,b,col,w=3){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
 function box(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);c.strokeStyle=ink;c.lineWidth=2;c.strokeRect(x,y,w,h);}
 function oval(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();}
 function scenery(c,r){c.save();
  // Draw every traversable, solid and pit tile at its actual collision extent.
  for(let row=1;row<17;row++)for(let col=1;col<31;col++){
   const x=col*40,y=80+row*40,t=r.g.grid[row][col];
   c.fillStyle=t==='o'?'#315b68':t==='#'?'#716c62':r.node.id==='bridge'?'#c9ba91':'#bbaa85';c.fillRect(x,y,40,40);
   if(t==='o'){line(c,x+8,y+18,x+32,y+18,'#75c2cb',2);line(c,x+4,y+32,x+24,y+32,'#75c2cb',2);}
   else if(t==='#'){c.strokeStyle='#4c4850';c.lineWidth=3;c.strokeRect(x+2,y+2,36,36);}
   else{c.strokeStyle='#927f6940';c.lineWidth=1;c.strokeRect(x+2,y+2,36,36);}
  }
  if(r.node.id==='bridge'){
   for(const y of [200,720]){line(c,90,y,1170,y,teal,5);for(const x of [300,620,940]){line(c,x-10,y-7,x,y,teal,4);line(c,x-10,y+7,x,y,teal,4);}}
   for(const x of [280,600,920]){line(c,x,440,x+25,440,gold,5);line(c,x+16,432,x+25,440,gold,4);line(c,x+16,448,x+25,440,gold,4);}
   text(c,'COOLING CHANNEL',220,330,20);text(c,'DRY OUTER PATH',220,173,15,teal);text(c,'DRY OUTER PATH',620,757,15,teal);text(c,'TOOLS →',1110,583,20,teal);
  }else{
   text(c,'NORTH PURSUER LANE',235,224,17);line(c,140,300,310,300,'#df8b72',4);
   text(c,'COOKS’ TOOL YARD',670,220,23);text(c,'SERVICE DOOR',1010,330,20);text(c,r.phase===2?'Hold tools to open →':'Clear defender, then hold →',720,586,16,gold);
   if(!r.serviceOpen){for(const row of accessCells){const y=80+row*40;box(c,840,y,40,40,'#b8a068');line(c,844,y+31,876,y+4,cream,6);}}
   else{text(c,'SERVICE ROUTE OPEN →',1020,700,19,teal);}
   line(c,400,440,700,440,'#ffe5a540',9);
  }c.restore();
 }
 function knight(c,x,y,color,shield=true){
  oval(c,x,y+5,21,7,ink+'55');line(c,x-8,y-9,x-11,y+2,ink,8);line(c,x+8,y-9,x+11,y+2,ink,8);
  oval(c,x,y-25,23,25,ink);oval(c,x,y-26,19,21,color);oval(c,x,y-51,21,19,ink);oval(c,x,y-52,17,15,'#c9d8dd');
  box(c,x-16,y-58,32,11,'#3b364b');line(c,x-6,y-56,x-6,y-49,cream,2);line(c,x+4,y-56,x+4,y-49,cream,2);
  oval(c,x,y-75,8,14,color);if(shield){oval(c,x-24,y-25,15,22,ink);oval(c,x-24,y-26,11,18,color);line(c,x-31,y-31,x-18,y-20,cream,4);}
 }
 function cart(c,t){
  oval(c,t.x,t.y+6,33,9,ink+'55');for(const x of [t.x-23,t.x+23]){oval(c,x,t.y+3,8,10,ink);oval(c,x,t.y+3,4,5,'#c4ac81');}
  box(c,t.x-33,t.y-31,66,29,'#936c49');box(c,t.x-27,t.y-43,23,17,'#d9b77c');box(c,t.x+2,t.y-50,20,24,'#73b4c5');
  line(c,t.x-11,t.y-33,t.x-5,t.y-70,'#d7dfe0',5);line(c,t.x-17,t.y-65,t.x+4,t.y-67,'#d7dfe0',5);
  text(c,'COOLING TOOLS',t.x,t.y+36,16,gold);
 }
 function draw(c,r){if(r.node.id!=='stirling')return;c.save();const s=r.support;
  knight(c,s.pursuerX,300,'#a7bacb');knight(c,s.x,s.y,'#69b0a4');line(c,s.x-34,s.y-32,s.x-41,s.y-74,'#d7dfe0',6);
  if(s.flash>0){line(c,s.x-45,s.y-30,s.x-75,s.y-48,gold,5);line(c,s.x-47,s.y-33,s.x-72,s.y-14,gold,5);}
  text(c,'SIR STIRLING · HOLDING THE LANE',s.x,s.y+39,15,teal);
  text(c,s.blocked?'Pursuers held back: '+s.blocked:'Stirling: Bring the tools. I have this lane.',s.x,s.y+63,14);
  cart(c,r.tools);if(r.phase===0)text(c,r.tools.waiting?'Walk beside the cart →':'Stay close · tools moving →',r.tools.x,r.tools.y+62,16);
  c.restore();
 }
 return Object.freeze({layout,access,scenery,draw});
});
