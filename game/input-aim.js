(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKInputAim=api;})(globalThis,()=>{
 'use strict';
 // One circular deadzone preserves diagonal aim instead of clipping each axis.
 const DEADZONE=.22;
 function stick(x,y){x=Number.isFinite(x)?x:0;y=Number.isFinite(y)?y:0;const length=Math.hypot(x,y);return length>DEADZONE?{x:x/length,y:y/length,angle:Math.atan2(y,x)}:null;}
 function reticle(ctx,x,y,color,scale=1){
  ctx.save();ctx.lineCap='round';
  for(const [stroke,width] of [['#211b30',5],[color||'#fff7e0',2]]){ctx.strokeStyle=stroke;ctx.lineWidth=width*scale;ctx.beginPath();ctx.arc(x,y,8*scale,0,Math.PI*2);ctx.moveTo(x-14*scale,y);ctx.lineTo(x-5*scale,y);ctx.moveTo(x+5*scale,y);ctx.lineTo(x+14*scale,y);ctx.moveTo(x,y-14*scale);ctx.lineTo(x,y-5*scale);ctx.moveTo(x,y+5*scale);ctx.lineTo(x,y+14*scale);ctx.stroke();}
  ctx.restore();
 }
 return Object.freeze({DEADZONE,stick,reticle});
});
