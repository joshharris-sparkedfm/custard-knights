const {test}=require('node:test'),a=require('node:assert/strict'),P=require('../game/preferences.js');
test('damaged settings cannot pass invalid volume values into browser audio',()=>{
 const s=P.settings({music:99,sfx:-10,shake:'loud',flash:'false',whole:1,names:'other'});a.deepEqual(s,{music:1,sfx:0,shake:1,flash:true,names:'near',classic:false,whole:false});
 for(const raw of [null,[],4,'bad',{music:NaN,sfx:Infinity}])a.equal(P.settings(raw).music,.55);
});
test('unknown saved mode/arena and invalid seat counts recover to playable defaults',()=>{
 const s=P.config({mode:'deleted',map:'missing',players:99,length:-1,diff:'bad',teamSplit:'true'},['ffa'],['courtyard']);a.equal(s.mode,'ffa');a.equal(s.map,'random');a.equal(s.players,1);a.equal(s.length,180);a.equal(s.teamSplit,false);
 const valid=P.config({mode:'race',map:'frost',players:4,length:90,diff:'chill',teamSplit:true},['ffa','race'],['frost']);a.equal(valid.mode,'race');a.equal(valid.players,4);a.equal(valid.teamSplit,true);
});
