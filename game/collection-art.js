/* Original canvas costume geometry, kept separate from simulation and baked sprite data. */
(function(root){'use strict';const INK='#291A33',CREAM='#FFF4D8';
function path(c,points,fill,stroke=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}
function ellipse(c,x,y,rx,ry,fill,rot=0,width=2){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fillStyle=fill;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function cape(c,e,r,t){if(!['teaTowel','burntToast'].includes(e.cape))return;const wave=Math.sin(t*5+e.id)*r*.035,side=-Math.cos(e.face)*r*.35; c.save();c.translate(side,r*.03);c.rotate(-Math.cos(e.face)*.12);const w=r*.65,h=r*1.1;
 if(e.cape==='teaTowel'){
  c.beginPath();c.moveTo(-w*.75,-h*.25);c.quadraticCurveTo(0,-h*.37,w*.72,-h*.24);c.lineTo(w+wave,h*.8);c.lineTo(w*.35,h*.92);c.lineTo(-w*.18,h*.85);c.lineTo(-w+wave,h*.94);c.closePath();c.fillStyle=CREAM;c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();c.save();c.clip();
  const unit=r*.27;c.fillStyle='#2B6881';c.globalAlpha=.64;for(let x=-w;x<w*1.5;x+=unit*2)c.fillRect(x,-h*.4,unit,h*1.5);for(let y=-h*.3;y<h;y+=unit*2)c.fillRect(-w*1.2,y,w*2.5,unit);c.globalAlpha=1;c.strokeStyle='#D8C8A4';c.lineWidth=1;c.beginPath();c.moveTo(-w*.85,h*.77);c.lineTo(w,h*.68);c.stroke();c.restore();
  c.save();c.translate(0,-h*.24);c.rotate(.18);path(c,[[-r*.13,-r*.18],[r*.13,-r*.18],[r*.12,r*.45],[-r*.11,r*.45]],'#D79A52',INK,2);c.strokeStyle='#80512C';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-r*.08);c.lineTo(0,r*.35);c.stroke();ellipse(c,0,r*.12,r*.08,r*.06,'#A7ADBC',0,1);c.restore();
 }else{
  // A bread silhouette, not a rectangular cape with a different tint.
  c.beginPath();c.moveTo(-w*.78,h*.86);c.lineTo(-w*.78,h*.05);c.bezierCurveTo(-w*1.32,-h*.2,-w*.6,-h*.7,0,-h*.48);c.bezierCurveTo(w*.68,-h*.7,w*1.35,-h*.17,w*.78,h*.05);c.lineTo(w*.78,h*.86);c.quadraticCurveTo(0,h*.99,-w*.78,h*.86);c.closePath();c.fillStyle='#543020';c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();c.beginPath();c.moveTo(-w*.61,h*.72);c.lineTo(-w*.61,0);c.bezierCurveTo(-w*.96,-h*.21,-w*.5,-h*.48,0,-h*.3);c.bezierCurveTo(w*.5,-h*.48,w*.96,-h*.21,w*.61,0);c.lineTo(w*.61,h*.72);c.closePath();c.fillStyle='#C98D4D';c.fill();
  for(let i=0;i<11;i++){const a=i*2.4;ellipse(c,Math.sin(a)*w*.59,h*(.18+.055*i),r*.055,r*.08,'#7B4528',a,0);}path(c,[[-r*.23,r*.12],[r*.21,r*.04],[r*.28,r*.35],[-r*.15,r*.43]],'#FFE077','#86542A',1.5);c.strokeStyle='#FFF3AD';c.lineWidth=2;c.beginPath();c.moveTo(-r*.12,r*.16);c.lineTo(r*.16,r*.12);c.stroke();
 }
 c.restore();}
function helm(c,e,r,t,headY){const k=e.kit&&e.kit.helm;if(!['roosterCrown','riceGuard'].includes(k))return;c.save();c.translate(0,headY===undefined?-r*1.45:headY);const side=Math.cos(e.face),front=Math.sin(e.face)>-.45;c.scale(.88+.12*Math.abs(side),1);
 if(k==='roosterCrown'){
  // Golden crown-band and a tall, scalloped scarlet comb.
  path(c,[[-r*.7,-r*.12],[-r*.72,-r*.55],[-r*.36,-r*.34],[0,-r*.67],[r*.34,-r*.34],[r*.7,-r*.55],[r*.7,-r*.12]],'#E9B335',INK,2.4);
  c.beginPath();c.moveTo(-r*.57,-r*.4);c.bezierCurveTo(-r*.82,-r*1.12,-r*.28,-r*1.18,-r*.24,-r*.63);c.bezierCurveTo(-r*.21,-r*1.48,r*.37,-r*1.45,r*.32,-r*.65);c.bezierCurveTo(r*.61,-r*1.19,r*.92,-r*.85,r*.55,-r*.4);c.closePath();c.fillStyle='#EE5549';c.fill();c.strokeStyle=INK;c.lineWidth=2.7;c.stroke();
  c.strokeStyle='#FF9B73';c.lineWidth=2.2;c.beginPath();c.moveTo(-r*.42,-r*.7);c.quadraticCurveTo(-r*.52,-r*.98,-r*.39,-r*.96);c.moveTo(r*.02,-r*.77);c.lineTo(r*.04,-r*1.12);c.stroke();for(const x of [-.43,0,.43])ellipse(c,x*r,-r*.18,r*.075,r*.075,x?'#FFF2AC':'#E94B54',0,1);
 }else{
  c.beginPath();c.moveTo(-r*.87,-r*.48);c.quadraticCurveTo(-r*.73,r*.12,0,r*.19);c.quadraticCurveTo(r*.73,r*.12,r*.87,-r*.48);c.closePath();c.fillStyle='#C9E3DC';c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();ellipse(c,0,-r*.47,r*.9,r*.24,'#F4ECD1',0,2.5);
  for(let i=0;i<9;i++){const x=(i%5-2)*r*.26,y=-r*(.47+Math.floor(i/5)*.16);ellipse(c,x,y,r*.17,r*.075,'#FFF9E8',((i%3)-1)*.45,1);}
  c.strokeStyle='#3E8D8C';c.lineWidth=2;c.beginPath();c.arc(0,-r*.51,r*.68,.22,Math.PI-.22);c.stroke();
  if(front){path(c,[[-r*.58,r*.02],[r*.6,r*.02],[r*.43,r*.36],[-r*.42,r*.36]],'#4A6470',INK,2);c.strokeStyle='#17272E';c.lineWidth=r*.09;c.beginPath();c.moveTo(-r*.4,r*.15);c.lineTo(r*.41,r*.15);c.stroke();}
 }c.restore();}
function drawWhisk(c,L,w){c.save();c.strokeStyle=INK;c.lineCap='round';c.lineJoin='round';c.lineWidth=w*.65;c.beginPath();c.moveTo(0,0);c.lineTo(L*.47,0);c.stroke();c.strokeStyle='#C98B25';c.lineWidth=w*.4;c.stroke();
 // Five separate balloon wires meet at the tip and collar; the outline stays inside existing blade reach.
 for(const n of [-1,-.52,0,.52,1]){c.beginPath();c.moveTo(L*.4,0);c.bezierCurveTo(L*.65,w*n*1.3,L*.97,w*n*1.15,L,0);c.bezierCurveTo(L*.97,-w*n*1.15,L*.65,-w*n*1.3,L*.4,0);c.strokeStyle=INK;c.lineWidth=w*.27+1;c.stroke();c.strokeStyle=n===0?'#FFF1AC':'#E5B53E';c.lineWidth=w*.16;c.stroke();}ellipse(c,L*.43,0,w*.23,w*.5,'#D39C2C',0,1.5);c.restore();}
function pose(c,e,r,t,enabled){if(enabled&&e.pose==='steveStrut'){const phase=t*7+e.id;c.translate(Math.sin(phase)*r*.16,-Math.max(0,Math.sin(phase))*r*.16);c.rotate(Math.sin(phase)*.13);}}
function drawBack(c,e,r,t){if(Math.sin(e.face)>=-.45)cape(c,e,r,t);}
function drawFront(c,e,r,t,options={}){if(Math.sin(e.face)<-.45)cape(c,e,r,t);helm(c,e,r,t,options.headY);if((options.results||options.preview)&&e.pose==='steveStrut'){c.save();c.strokeStyle=INK;c.lineWidth=3;c.lineCap='round';for(const side of [-1,1]){const lift=Math.max(0,Math.sin(t*7+e.id+side*Math.PI/2))*r*.2;c.beginPath();c.moveTo(side*r*.37,r*.51-lift);c.lineTo(side*r*.61,r*.6-lift);c.stroke();}c.restore();}}
root.CKCollectionArt={drawBack,drawFront,drawWhisk,pose,isHelm:k=>['roosterCrown','riceGuard'].includes(k),isCape:k=>['teaTowel','burntToast'].includes(k),isBlade:k=>k==='goldenWhisk'};
})(typeof globalThis!=='undefined'?globalThis:this);
