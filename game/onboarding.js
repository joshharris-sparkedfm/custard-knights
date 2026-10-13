/* Optional learning uses observations from the arena, without storage or rewards. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKOnboarding=api;})(globalThis,()=>{
 'use strict';
 const KEY='ck-onboarding-v1';
 const legacyKeys=['ck-played','ck-settings','ck-cfg','ck-progress','ck-collection','ck-profile','ck-profile2','ck-profile3','ck-profile4','ck-name','ck-taught','ck-hits','ck-campaign-v1'];
 function shouldOffer(storage){try{return ![KEY,...legacyKeys].some(k=>storage.getItem(k)!==null);}catch(_){return false;}}
 const stages=['move','swing','guard','dash','ranged','complete'];
 function create(x,y){
  let step=0,aimed=false,aimStart=null;
  const state=()=>Object.freeze({stage:stages[step],completed:step===5,aimed});
  function move(px,py,input){if(step===0&&Math.hypot(input.mx||0,input.my||0)>.18&&Math.hypot(px-x,py-y)>=55)step=1;}
  function aim(angle,source){if(step!==4||!Number.isFinite(angle)||!['mouse','pad','move'].includes(source))return;if(aimStart===null)aimStart=angle;else if(Math.abs(Math.atan2(Math.sin(angle-aimStart),Math.cos(angle-aimStart)))>.12)aimed=true;}
  function action(kind){if(kind===stages[step]&&step>0&&step<4)step++;else if(step===4&&kind==='fire'&&aimed)step=5;return state();}
  return Object.freeze({state,move,aim,action});
 }
 return Object.freeze({KEY,shouldOffer,create});
});
