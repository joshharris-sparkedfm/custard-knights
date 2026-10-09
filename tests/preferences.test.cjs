const {test}=require('node:test'),a=require('node:assert/strict'),P=require('../game/preferences.js');
test('old bot settings migrate without losing mode or seats and all four new levels persist',()=>{
 for(const [old,current] of [['chill','easy'],['spicy','medium'],['brutal','hard'],['steve','steve']]){
  const c=P.config({mode:'ffa',players:4,diff:old},['ffa'],[]);a.equal(c.diff,current);a.equal(c.players,4);
 }
 for(const diff of ['easy','medium','hard','steve'])a.equal(P.config({diff},[],[]).diff,diff);
 a.equal(P.difficulty('__proto__'),'medium');
});
test('damaged settings cannot pass invalid volume values into browser audio',()=>{
 const s=P.settings({music:99,sfx:-10,shake:'loud',flash:'false',whole:1,names:'other'});a.deepEqual(s,{music:1,sfx:0,shake:1,flash:true,names:'near',classic:false,whole:false});
 for(const raw of [null,[],4,'bad',{music:NaN,sfx:Infinity}])a.equal(P.settings(raw).music,.55);
});
test('unknown saved mode/arena and invalid seat counts recover to playable defaults',()=>{
 const s=P.config({mode:'deleted',map:'missing',players:99,length:-1,diff:'bad',teamSplit:'true'},['ffa'],['courtyard']);a.equal(s.mode,'ffa');a.equal(s.map,'random');a.equal(s.players,1);a.equal(s.length,180);a.equal(s.teamSplit,false);
 const valid=P.config({mode:'race',map:'frost',players:4,length:90,diff:'chill',teamSplit:true},['ffa','race'],['frost']);a.equal(valid.mode,'race');a.equal(valid.players,4);a.equal(valid.teamSplit,true);
});

test('chaos presets persist and old fast settings migrate without losing match choices',()=>{
 for(const [saved,wanted] of [['simple','simple'],['normal','normal'],['insane','insane'],['fast','insane'],['unhinged','insane']]){
  const cfg=P.config({chaosSpeed:saved,mode:'teams',players:3,length:300,chaosPlus:true},['teams'],[]);
  a.equal(cfg.chaosSpeed,wanted);a.equal(cfg.mode,'teams');a.equal(cfg.players,3);a.equal(cfg.length,300);a.equal(cfg.chaosPlus,true);
 }
 for(const damaged of [null,'__proto__',{},3])a.equal(P.config({chaosSpeed:damaged},[],[]).chaosSpeed,'normal');
});
