(async()=>{
 const passed=[],check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};
 const C=CKCollection,host=document.createElement('section');document.body.append(host);host.style.cssText='position:fixed;inset:0;overflow:auto;z-index:10000;background:white';
 let state=C.normalize(),profile={helm:'great',plume:'feather',metal:'steel',emblem:'star',color:'#FF5A4E',cape:'plain',blade:'steel',chick:'hen',pose:'plain'},previews=[];
 const adapters={getState:()=>state,setState:s=>state=s,getProfile:()=>profile,saveProfile:p=>profile={...p},drawPreview:(canvas,p,o)=>{previews.push({profile:p,gameplay:o.gameplay});canvas.getContext('2d').fillRect(0,0,2,2);}};
 const ui=CKCollectionUI.mount(host,adapters),buttons=()=>[...host.querySelectorAll('button')],click=label=>{const b=buttons().find(b=>b.textContent===label);if(!b)throw Error('Missing button '+label);b.click();};
 check(host.querySelectorAll('.ck-card').length===6,'All six authored cosmetics have goal cards');
 const original=JSON.stringify(profile);host.querySelectorAll('.ck-card')[3].querySelector('button').click();for(let i=0;i<30&&!previews.some(x=>x.profile.helm==='roosterCrown');i++)await new Promise(r=>setTimeout(r,50));
 check(JSON.stringify(profile)===original&&previews.some(x=>x.profile.helm==='roosterCrown'),'Locked try-on previews the selected item without saving it');
 check(previews.some(x=>x.gameplay)&&previews.some(x=>!x.gameplay),'Try-on renders large and native gameplay-size previews');
 host.querySelectorAll('.ck-card')[3].querySelectorAll('button')[1].click();check(state.pinned==='rooster-crown','Work-towards button persists the selected goal');
 state=C.apply(state,{roundId:'ui-first',participated:true}).state;ui.refresh();click('Keep Tea Towel');
 check(state.choice==='tea-towel'&&profile.cape==='teaTowel','First completion choice earns and equips the selected cape');
 check(!state.owned.includes('burnt-toast'),'First choice does not grant both capes');
 host.querySelectorAll('.ck-card')[2].querySelectorAll('button')[1].click();check(state.progress['rooster-crown']===1&&state.pinned==='golden-whisk','Switching goals retains the prior partial progress');
 const boxes=host.querySelectorAll('.ck-presets>div');boxes[2].querySelector('button').click();profile.cape='plain';ui.refresh();host.querySelectorAll('.ck-presets>div')[2].querySelectorAll('button')[1].click();
 check(profile.cape==='teaTowel'&&state.presets.length===3,'Third outfit preset saves and restores appearance');
 const receipt=C.apply(state,{roundId:'ui-first',participated:true});check(!receipt.applied,'Repeated result does not advance the goalboard');
 ui.destroy();host.remove();return {passed};
})()
