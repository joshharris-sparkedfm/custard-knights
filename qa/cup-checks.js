(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};
 CK.NET.role=null;CK.cfg.players=2;CK.setSeats([{dev:'kb2'},{dev:'kb1'}]);CK.startCup();
 const id=CK.cup().id,roundIds=[];
 for(let i=0;i<3;i++){
  const g=CK.G();roundIds.push(g.roundId);check(g.mode===['ffa','kotp','hotpie'][i],'Cup starts mode '+g.mode);
  g.ents.find(e=>e.human===1).score=8;g.ents.find(e=>e.human===2).score=3;CK.endMatch();
  check(!document.getElementById('cupResults').hidden,'Round '+(i+1)+' shows Cup standings');
  if(i<2){CK.cupReady('local:1',1,true);CK.nextCupRound();check(CK.G().roundId===roundIds[i],'Next round waits for every seat');CK.cupReady('local:2',1,true);CK.nextCupRound();}
 }
 check(CK.cup().id===id&&CK.cup().status==='complete','One Cup persists through all three rounds');
 check(CK.cup().history.length===3&&new Set(roundIds).size===3,'Three separate rounds counted once');
 check(CK.cup().players[0].points===3&&CK.cup().players[1].points===0,'Bots never enter the human trophy score');
 check(CK.seats()[0].dev==='kb2'&&CK.seats()[1].dev==='kb1','Reversed keyboard seats survive the entire Cup');
 const matches=CK.PROG.matches;CK.endMatch();check(CK.PROG.matches===matches,'Repeated final screen grants no extra completion');
 CK.cancelCup();check(CK.cup()===null,'Leaving clears the Cup session');
 return {passed};
})()
