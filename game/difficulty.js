/* Difficulty changes decisions, never health, damage, reach or movement rules. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKDifficulty=api;})(globalThis,()=>{
 'use strict';
 const profiles={
  easy:{label:'Easy',react:.5,think:.32,aggro:.5,dash:.25,speed:1,block:.15,tokens:1,parry:0,heavy:0,punish:0,tell:.35,dodge:0,aim:.13},
  medium:{label:'Medium',react:.26,think:.2,aggro:.8,dash:.55,speed:1,block:.3,tokens:2,parry:.3,heavy:.1,punish:.3,tell:0,dodge:0,aim:.07},
  hard:{label:'Hard',react:.16,think:.14,aggro:.93,dash:.8,speed:1,block:.5,tokens:3,parry:.5,heavy:.25,punish:.7,tell:0,dodge:.4,aim:.04},
  steve:{label:'STEVE',react:.09,think:.09,aggro:.98,dash:.95,speed:1,block:.7,tokens:4,parry:.7,heavy:.38,punish:.95,tell:0,dodge:.7,aim:.02}
 };
 for(const p of Object.values(profiles))Object.freeze(p);
 return Object.freeze({profiles:Object.freeze(profiles)});
});
