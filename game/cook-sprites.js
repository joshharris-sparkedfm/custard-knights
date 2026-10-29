/* Baked community cooks. Presentation only: never advances story or actor state. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.CKCookSprites=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
 'use strict';
 function frameFor(atlas,p){
  const speed=Number.isFinite(p.speed)?Math.max(0,p.speed):0,time=Number.isFinite(p.time)?Math.max(0,p.time):0,face=Number.isFinite(p.face)?p.face:Math.PI/2;
  const animation=speed>100?'run':speed>4?'walk':'idle',[start,count]=atlas.anims[animation];
  const rate=animation==='idle'?1:Math.max(.5,Math.min(2.5,speed/(animation==='run'?160:65)));
  const direction=((Math.round(face/(Math.PI/4))%8)+8)%8,frame=Math.floor(time*rate/atlas.seconds[animation]*count)%count;
  return direction*atlas.per+start+frame;
 }
 function create({atlases=root.CK_COOK_SPRITES||{},ImageCtor=root.Image}={}){
  const images={};if(typeof ImageCtor==='function')for(const [name,atlas]of Object.entries(atlases)){const image=new ImageCtor();image.src=atlas.url;images[name]=image;}
  function draw(ctx,p){
   const atlas=atlases[p.name],image=images[p.name];if(!atlas||!image?.complete||!image.naturalWidth)return false;
   const rect=atlas.rects[frameFor(atlas,p)];if(!rect)return false;
   const [x,y,w,h,dx,dy]=rect,s=atlas.scale;ctx.drawImage(image,x,y,w,h,p.x+dx*s,p.y+dy*s,w*s,h*s);return true;
  }
  return Object.freeze({draw});
 }
 return Object.freeze({...create(),create,frameFor});
});
