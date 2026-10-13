(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKOnlineRecovery=api;})(globalThis,()=>{
 'use strict';
 // One attempt owns its deadlines and callbacks, even before PeerJS loads.
 function create({schedule=setTimeout,unschedule=clearTimeout,onTimeout=()=>{}}={}){
  let sequence=0,current=null,deadline=null,watch=null;
  const clear=()=>{unschedule(deadline);unschedule(watch);deadline=watch=null;};
  function cancel(){clear();current=null;sequence++;}
  function begin(role,code='',delay=15000){cancel();const token=++sequence;current={token,role,code,pending:true};deadline=schedule(()=>{if(isCurrent(token)&&current.pending)onTimeout('admission',current);},delay);return token;}
  function isCurrent(token){return !!current&&current.token===token;}
  function admit(token){if(!isCurrent(token))return false;unschedule(deadline);deadline=null;current.pending=false;return true;}
  function stopWatch(){unschedule(watch);watch=null;}
  function touch(token,active=()=>true,delay=15000){if(!isCurrent(token))return;stopWatch();watch=schedule(()=>{watch=null;if(!isCurrent(token))return;if(!active()){touch(token,active,delay);return;}onTimeout('snapshots',current);},delay);}
  return {begin,isCurrent,admit,cancel,touch,stopWatch};
 }
 return {create};
});
