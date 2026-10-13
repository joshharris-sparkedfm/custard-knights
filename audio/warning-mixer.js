/* Shared local SFX bus and eight reserved warning voices inside the 64-voice cap. */
(function(root){
 'use strict';
 const MAX=64,RESERVED=8;
 function create(context){
  const bus=context.createGain();bus.connect(context.destination);
  let active=0,ordinary=0,warning=0,droppedOrdinary=0,droppedWarning=0;
  const voices=new Set();
  return {bus,
   admit(isWarning=false){if(active>=MAX||!isWarning&&ordinary>=MAX-RESERVED){if(isWarning)droppedWarning++;else droppedOrdinary++;return false;}return true;},
   track(source,nodes,isWarning=false){
    active++;if(isWarning)warning++;else ordinary++;
    const voice={source,done:false,isWarning};voices.add(voice);
    source.onended=()=>{if(voice.done)return;voice.done=true;voices.delete(voice);active--;if(isWarning)warning--;else ordinary--;source.disconnect();for(const node of nodes)node.disconnect();};
   },
   settings(volume,muted=false){bus.gain.setValueAtTime(muted?0:Math.max(0,Math.min(1,Number(volume)||0)),context.currentTime);},
   stopWarnings(){for(const voice of voices)if(voice.isWarning)try{voice.source.stop();}catch(_){}},
   stats(){return {active,ordinary,warning,max:MAX,reserved:RESERVED,ordinaryMax:MAX-RESERVED,droppedOrdinary,droppedWarning};}
  };
 }
 const api={MAX,RESERVED,create};if(typeof module==='object'&&module.exports)module.exports=api;root.CKWarningMixer=api;
})(typeof globalThis!=='undefined'?globalThis:this);
