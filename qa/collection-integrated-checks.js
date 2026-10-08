(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);},C=CKCollection;
 await CK.sprLoadAll();CK.NET.role=null;CK.setCollection(C.normalize());CK.begin({humans:2,mode:'ffa',map:'courtyard'});CK.endMatch();
 check(CK.collection().completed===1,'Two human seats award one household collection completion');
 const first=[...document.querySelectorAll('#end button')].find(b=>b.textContent==='Choose Burnt Toast');check(!!first,'First accepted human result offers the two-cape choice');first.click();
 check(CK.loadProfile(1).cape==='burntToast'&&CK.owned('cape','burntToast'),'Result choice earns and equips the actual Toast cape');
 CK.setCollection(C.pin(CK.collection(),'golden-whisk'));for(let i=0;i<8;i++){CK.begin({humans:1,mode:'ffa'});CK.endMatch();}
 check(CK.collection().progress['golden-whisk']===8&&CK.owned('blade','goldenWhisk'),'Eight real end-result hooks earn the pinned Golden Whisk');
 const count=CK.collection().completed;CK.endMatch();check(CK.collection().completed===count,'Repeated engine end cannot duplicate collection progress');
 CK.openWardrobe();check(document.querySelectorAll('#collectionGoals .ck-card').length===6,'Integrated wardrobe exposes every collection card');
 const profileBefore=JSON.stringify(CK.loadProfile(1));document.querySelectorAll('#collectionGoals .ck-card')[3].querySelector('button').click();await new Promise(r=>setTimeout(r,100));
 check(JSON.stringify(CK.loadProfile(1))===profileBefore,'Integrated locked try-on leaves equipped appearance untouched');
 const canvas=document.querySelector('#collectionGoals canvas');for(let i=0;i<20&&canvas.getContext('2d').getImageData(0,0,1,1).data[3]===0;i++)await new Promise(r=>setTimeout(r,50));const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
 check(pixels.some((v,i)=>i%4!==3&&v!==pixels[i%4]),'Try-on draws real knight pixels through the game renderer');
 CK.saveProfile(1,{...CK.loadProfile(1),blade:'goldenWhisk'});document.querySelectorAll('#collectionGoals .ck-presets>div')[2].querySelector('button').click();
 CK.saveProfile(1,{...CK.loadProfile(1),blade:'steel'});CK.reloadWardrobeSaves();document.querySelectorAll('#collectionGoals .ck-presets>div')[2].querySelectorAll('button')[1].click();
 check(CK.loadProfile(1).blade==='goldenWhisk','Third outfit preset survives save reload and restores through strict ownership');
 const backup=C.exportBackup(localStorage);CK.setCollection(C.normalize());CK.saveProfile(1,{...CK.loadProfile(1),cape:'plain',blade:'steel'});C.importBackup(localStorage,backup);CK.reloadWardrobeSaves();
 check(CK.owned('blade','goldenWhisk')&&CK.loadProfile(1).cape==='burntToast'&&CK.collection().completed===count,'Export/import restores earned collection and actual equipped outfit');
 const s=CK.collection();CK.setCollection({...s,owned:C.items.map(i=>i.id)});CK.saveProfile(1,{...CK.loadProfile(1),helm:'riceGuard',cape:'teaTowel',blade:'goldenWhisk',pose:'steveStrut'});CK.start();CK.freeze(true);
 const me=CK.G().ents.find(e=>e.human);check(me.kit.helm==='riceGuard'&&me.cape==='teaTowel'&&me.blade==='goldenWhisk'&&me.pose==='steveStrut','Earned mixed outfit reaches a real match entity');
 check(CK.netSetup().ents[me.id].pose==='steveStrut','Network start includes the result pose');
 // Every piece must draw differently from the base through both complete render paths.
 const cv=document.createElement('canvas');cv.width=180;cv.height=160;const base={...CK.loadProfile(1),helm:'great',cape:'plain',blade:'steel',pose:'plain'};
 const hash=p=>{CK.drawCollectionPreview(cv,p,{time:1.2,pose:true,face:-1.57});const d=cv.getContext('2d').getImageData(0,0,180,160).data;let h=2166136261;for(const n of d)h=Math.imul(h^n,16777619);return h;};
 for(const sprites of [true,false]){CK.sprites(sprites);const normal=hash(base);for(const item of C.items)check(hash({...base,[item.kind]:item.value})!==normal,(sprites?'Baked':'Classic')+' renderer visibly draws '+item.name);}
 CK.sprites(true);CK.setCollection(C.normalize());CK.cfg.players=1;CK.startCup();CK.freeze(true);
 for(let i=0;i<3;i++){CK.endMatch();if(i<2){for(const p of CK.cup().players)CK.cupReady(p.key,0,true);CK.nextCupRound();CK.freeze(true);}}
 check(CK.collection().completed===3&&CK.owned('pose','steveStrut'),'Three-round Cup grants Steve Strut without an extra completion');
 CK.toMenu();CK.adventure.launch('banquet');document.getElementById('setupBtn').click();check(CK.adventure.campaign.run===null&&CK.G().demo&&!document.getElementById('setup').hidden,'Changing setup stops campaign runtime and HUD');CK.toMenu();CK.freeze(true);return {passed};
})()
