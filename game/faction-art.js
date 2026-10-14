/* Live faction armour only: geometry stays outside baked sprite caches and combat state. */
(function(root){'use strict';
 const INK='#291A33',STEEL='#D4D8CE',SHADE='#87928D',CREAM='#FFF0CF';
 function shape(c,points,fill){c.beginPath();for(let i=0;i<points.length;i++)c[i?'lineTo':'moveTo'](...points[i]);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=INK;c.lineWidth=.105;c.lineJoin='round';c.stroke();}
 function oval(c,x,y,rx,ry,fill,rotation=0){c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fillStyle=fill;c.fill();c.strokeStyle=INK;c.lineWidth=.105;c.stroke();}
 function drawBack(c,e,r,options={}){
  const faction=e&&e.faction;if(!['custardia','rice'].includes(faction)||!(r>0))return;
  // This layer is behind the entire accepted knight, including both visors, cosmetics and arms.
  // Symmetric shoulder attachments remain visible from every facing without reflecting an attack.
  c.save();c.translate(0,-(options.bob||0));c.scale(r,r);
  if(faction==='custardia'){
   // Saucepan handles have actual hollow centres; the rounded bell rim widens at the waist.
   for(const side of [-1,1]){
    c.save();c.scale(side,1);c.beginPath();c.ellipse(1.05,-.38,.34,.24,0,0,Math.PI*2);c.strokeStyle=INK;c.lineWidth=.23;c.stroke();c.strokeStyle=STEEL;c.lineWidth=.105;c.stroke();
    c.beginPath();c.moveTo(.64,-.56);c.quadraticCurveTo(.89,-.65,.96,-.34);c.lineTo(1.03,.49);c.quadraticCurveTo(.97,.68,.55,.55);c.closePath();c.fillStyle=CREAM;c.fill();c.strokeStyle=INK;c.lineWidth=.105;c.stroke();c.restore();
   }
   c.beginPath();c.moveTo(-.96,.46);c.quadraticCurveTo(0,.77,.96,.46);c.strokeStyle=INK;c.lineWidth=.14;c.stroke();c.strokeStyle=STEEL;c.lineWidth=.06;c.stroke();
  }else{
   // Broad bowl rim and tiered shoulder plates contrast with Custardia's hollow handles.
   for(const side of [-1,1]){
    c.save();c.scale(side,1);
    shape(c,[[.51,-.78],[1.26,-.78],[1.26,-.53],[1.12,-.53],[1.12,-.25],[.97,-.25],[.97,.04],[.59,.16]],STEEL);
    shape(c,[[.59,-.23],[1.07,-.23],[1.07,.07],[.94,.07],[.94,.35],[.62,.46]],SHADE);
    // A short grain crest sits outboard of the helm, never on top of its visor.
    c.beginPath();c.moveTo(.94,-.73);c.quadraticCurveTo(1.02,-1.1,.91,-1.43);c.strokeStyle=INK;c.lineWidth=.1;c.stroke();
    oval(c,.84,-1.22,.1,.22,CREAM,-.48);oval(c,1.05,-1.05,.1,.21,CREAM,.48);c.restore();
   }
  }
  c.restore();
 }
 const api={drawBack};root.CKFactionArt=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
