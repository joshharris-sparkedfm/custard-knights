(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};
 await CK.sprLoadAll();CK.NET.role=null;CK.begin({humans:1,mode:'ffa'});
 check(!CK.visorAssets().requested,'Closed default does not request the optional open atlas scripts');
 check(CK.loadProfile(1).visor==='closed'&&CK.cleanKit({visor:'invented'}).visor==='closed','Missing and malformed visor choices default to closed');
 CK.openWardrobe();const visor=value=>document.querySelector('.seg[data-w="visor"] button[data-v="'+value+'"]');
 check(visor('closed').getAttribute('aria-pressed')==='true','Wardrobe exposes the default closed visor');visor('closed').focus();CK.menuNav(1,0);check(document.activeElement===visor('open'),'Controller Right reaches the Open visor control');CK.menuActivate();check(document.activeElement===visor('open'),'Controller activation preserves visor control focus');
 check(CK.loadProfile(1).visor==='open'&&visor('open').getAttribute('aria-pressed')==='true','Open visor is freely selectable and saved');
 document.querySelector('.seg[data-w="who"] button[data-v="2"]').click();check(CK.loadProfile(2).visor==='closed','Second local player keeps an independent closed choice');
 document.querySelector('.seg[data-w="who"] button[data-v="1"]').click();
 document.querySelector('#collectionGoals .ck-presets button').click();visor('closed').click();document.querySelectorAll('#collectionGoals .ck-presets>div')[0].querySelectorAll('button')[1].click();
 check(CK.loadProfile(1).visor==='open','Saving and wearing an outfit restores its visor');
 const backup=CKCollection.exportBackup(localStorage);CK.saveProfile(1,{...CK.loadProfile(1),visor:'closed'});CKCollection.importBackup(localStorage,backup);CK.reloadWardrobeSaves();check(CK.loadProfile(1).visor==='open','Export/import restores the equipped visor');const legacy=JSON.parse(backup);delete legacy.saves['ck-profile'].visor;CKCollection.importBackup(localStorage,JSON.stringify(legacy));CK.reloadWardrobeSaves();check(CK.loadProfile(1).visor==='closed','Old wardrobe backup without visor migrates to closed');CK.saveProfile(1,{...CK.loadProfile(1),visor:'open'});
 for(const mode of ['ffa','race','teams','hotpie','lks','flags','heist','kotp']){CK.begin({humans:1,mode});check(CK.G().ents.find(e=>e.human===1).kit.visor==='open','Saved visor is applied in '+mode);}
 const before=JSON.stringify(CK.G().ents.map(e=>({hp:e.hp,r:e.r,swingDur:e.swingDur,atkCd:e.atkCd})));CK.saveProfile(1,{...CK.loadProfile(1),visor:'closed'});check(JSON.stringify(CK.G().ents.map(e=>({hp:e.hp,r:e.r,swingDur:e.swingDur,atkCd:e.atkCd})))===before,'Changing visor does not mutate current combat entities');CK.saveProfile(1,{...CK.loadProfile(1),visor:'open'});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=220;const ctx=canvas.getContext('2d'),draw=(visor,hero=0)=>{ctx.clearRect(0,0,220,220);const e=CK.mkKnight({hero,face:Math.PI/4,kit:{helm:'great',plume:'feather',metal:'steel',visor}}),before=JSON.stringify(e);CK.withCtx(ctx,()=>{ctx.save();ctx.translate(110,135);CK.drawKnight(e);ctx.restore();});check(JSON.stringify(e)===before,'Visor rendering preserves entity state');return canvas.toDataURL();};
 CK.sprites(false);check(draw('closed')!==draw('open'),'Classic fallback renders visibly different open and closed visors');CK.sprites(true);
 const closed=draw('closed');draw('open');const loadStart=performance.now(),ready=await CK.sprLoadVisors(),openDecodeWaitMs=Math.round(performance.now()-loadStart);
 if(window.CK_REQUIRE_VISOR_ASSETS){check(ready&&CK.visorAssets().knightReady&&CK.visorAssets().heroReady,'Both complete open atlas roots decode');check(draw('open')!==closed,'Actual open and closed gameplay faces differ');check(draw('open',1)!==draw('closed',1),'Actual open and closed hero faces differ');}
 else if(!ready)check(draw('open')===closed,'Missing optional open assets preserve the entire closed render as atomic fallback');
 return {passed,assetsReady:ready,openDecodeWaitMs};
})()
