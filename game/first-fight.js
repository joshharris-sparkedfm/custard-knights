/* Two independent, optional solo comparisons. No storage, rewards or automatic enrollment. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CKFirstFight=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const variants=Object.freeze({arena:Object.freeze(['curated','random']),density:Object.freeze(['four','eight'])});
 function variant(experiment,value){
  if(!Object.hasOwn(variants,experiment)||!variants[experiment].includes(value))throw new TypeError('Unknown first-fight comparison');
  const config=Object.freeze({mode:'ffa',map:value==='random'?'random':'courtyard',players:1,diff:'easy',length:90,chaosSpeed:'simple',chaosPlus:false,teamSplit:false});
  return Object.freeze({experiment,variant:value,totalKnights:value==='four'?4:8,config});
 }
 function assign(experiment,random=Math.random){
  if(!Object.hasOwn(variants,experiment))throw new TypeError('Unknown first-fight comparison');
  const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw new TypeError('Random draw must be in [0,1)');
  return variant(experiment,variants[experiment][n<.5?0:1]);
 }
 return Object.freeze({assign,variant,variants});
});
