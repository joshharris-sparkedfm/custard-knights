(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};CK.NET.role=null;CK.cancelCup();CK.begin({humans:1,mode:'ffa'});CK.NET.role='client';CK.NET.peer={id:'packet-review'};
 const initial=CKCup.create('packet-cup',[{key:'peer:packet-review',peer:'packet-review',name:'Reviewer'}]);const before=CK.G();
 for(const setup of [{cup:{}},{cup:initial,ents:null},{cup:initial,ents:[null]}])CK.clientRecv({t:'start',setup});
 check(CK.G()===before,'Malformed Cup observer start is ignored before accessing its roster');
 for(const state of [{...initial,status:'between',players:[null]},{...initial,ready:null},{...initial,history:[{awards:null}]},{...initial,players:[]}])CK.clientRecv({t:'cup',state});
 check(CK.cup()===null,'Malformed Cup state cannot replace a session or crash its UI');
 const between=structuredClone(initial);CKCup.finish(between,'packet-round',[{key:'peer:packet-review',score:1}]);CK.clientRecv({t:'cup',state:between});check(CK.cup().status==='between','A valid Cup result still renders after rejected packets');
 CK.clientRecv({t:'cup',state:initial});check(CK.cup().status==='between','Stale Cup state cannot roll results back to a prior phase');
 CK.NET.role=null;CK.NET.peer=null;CK.cancelCup();const saved=CK.collection();CK.setCollection(CKCollection.normalize());CK.G().roundId='mainpath-'+crypto.randomUUID();
 const save=CKCampaign.normalize({results:Object.fromEntries(CKCampaign.nodes.filter(n=>!n.optional).map(n=>[n.id,{spoons:[true,false,false]}]))});
 CK.campaignCollectionReward({won:true,id:'rind'},save);check(CK.owned('helm','riceGuard')&&!save.results.biscuit,'Main story completion grants Rice Guard without the optional Biscuit Toll');CK.setCollection(saved);CK.freeze(true);return {passed};
})()
