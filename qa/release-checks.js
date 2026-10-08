(async()=>{
 const passed=[],check=(value,label)=>{if(!value)throw Error(label);passed.push(label);};
 await document.fonts.ready;await CK.sprLoadAll();
 check(CK.spritesReady(),'Default sprite atlases decoded');
 const seats=[{dev:'pad',idx:2},{dev:'kb1'},{dev:'pad',idx:0},{dev:'kb2'}];
 CK.cfg.players=4;CK.setSeats(seats);CK.start();
 for(let i=0;i<5;i++){CK.endMatch();CK.rematch();}
 check(JSON.stringify(CK.seats())===JSON.stringify(seats),'Five rematches preserve non-sequential controller assignments');
 CK.start();check(CK.seats()===null,'A fresh quick-play start clears party assignments');
 CK.begin({humans:4,map:'courtyard',mode:'ffa'});
 CK.G().ents[1].parries=10;CK.G().ents[1].score=12;
 const before=CK.PROG.matches;CK.endMatch();
 check(CK.PROG.matches===before+1&&CK.PROG.ch.parry10===10,'Second couch seat contributes to shared progress');
 const earned=CK.PROG.earned;CK.endMatch();check(CK.PROG.earned===earned,'Repeated local end does not grant twice');
 CK.NET.role='client';CK.NET.peer={id:'test-guest'};
 const setup=CK.netSetup();setup.roundId='test-guest-'+crypto.randomUUID();setup.ents[3].netId='test-guest';
 CK.clientRecv({t:'start',setup});
 const guestBefore=CK.PROG.matches;
 CK.clientRecv({t:'end',roundId:'stale',results:[]});check(!CK.G().over,'Stale online result is ignored');
 const result={t:'end',roundId:setup.roundId,results:[{id:3,mode:'ffa',won:false,coins:7,parries:10,ringouts:3,lava:5},{id:0,mode:'ffa',won:true,coins:99,parries:0,ringouts:0,lava:0}]};
 CK.clientRecv(result);
 check(CK.PROG.matches===guestBefore+1&&CK.PROG.ch.lava5===5&&CK.PROG.ch.ringout3===3,'Guest receives authoritative combat challenge results');
 check(CK.PROG.earned===earned+7,'Guest awards only its own knight result');
 CK.clientRecv(result);check(CK.PROG.matches===guestBefore+1,'Duplicate online packet is ignored');
 CK.NET.role=null;CK.NET.peer=null;CK.freeze(true);
 CK.begin({humans:0});for(let i=0;i<3000;i++)CK.sfx('boom');
 check(CK.audioStats().active<=CK.audioStats().max,'Sound-effect bursts are bounded to 64 active voices');
 await new Promise(r=>setTimeout(r,1500));
 check(CK.audioStats().active===0,'Completed sound graphs are disconnected');
 CK.cueMusic('courtyard');check(!CK.musicState().wanted,'Missing soundtrack exports are disabled');
 CK.cueMusic('wardrobe');check(CK.musicState().src==='menu-theme.mp3'&&CK.musicState().wanted,'Wardrobe falls back to the supplied theme');
 const originalRace=window.CK_SOUNDTRACK.race;window.CK_SOUNDTRACK.race='menu-theme.mp3';
 CK.cfg.mode='race';CK.cfg.map='roof';CK.start();
 check(CK.musicState().cue==='race'&&CK.musicState().wanted,'Race soundtrack takes priority over the arena');
 window.CK_SOUNDTRACK.race=originalRace;CK.cueMusic(null);CK.freeze(true);
 return {passed};
})()
