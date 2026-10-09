window.CKCupUI={mount({root,localKeys,isHost,onReady,onNext,onExit,onReplay,mapName}){
 const view=document.createElement('div');view.id='cupResults';view.className='overlay';view.hidden=true;
 const panel=document.createElement('div');panel.className='panel wide';view.append(panel);root.append(view);
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(text,fn)=>{const b=make('button',text,'btn');b.type='button';b.onclick=fn;return b;};
 function render(state){
  if(!state){view.hidden=true;return;}const focus=document.activeElement&&document.activeElement.dataset.cupFocus;
  panel.replaceChildren();const done=state.status==='complete',winnerKeys=CKCup.winners(state);
  panel.append(make('h2',done?'Custard Cup champions!':`Custard Cup · Round ${state.round+1} of 3`,'logo sm'));
  const names=keys=>state.players.filter(p=>keys.includes(p.key)).map(p=>p.name).join(' & ');
  panel.append(make('p',done?`${names(winnerKeys)} ${winnerKeys.length>1?'share the trophy':'takes the trophy'}.`:'Human knights compete for the Cup. Bots make mischief but never take the trophy.','note'));
  const table=make('table');table.style.cssText='width:100%;text-align:left;margin:12px 0';const head=make('tr');for(const t of ['Knight','Cup points','Ready'])head.append(make('th',t));table.append(head);
  for(const p of CKCup.standings(state)){const row=make('tr');row.append(make('td',p.name+(p.connected?'':' · left')),make('td',String(p.points)),make('td',done?'—':p.connected?(state.ready[p.key]?'Ready!':'Choosing…'):'—'));table.append(row);}panel.append(table);
  const last=state.history.at(-1);if(last&&last.awards.length){panel.append(make('h3','Mischief awards'));for(const award of last.awards)panel.append(make('p',`${award.title}: ${names(award.keys)} · ${award.value} ${award.unit}`,'note'));}
  if(!done){
   panel.append(make('p','Choose the next arena, then ready up. A tied vote uses the first arena. Each round lasts up to two minutes.','note'));
   const choices=CKCup.options(state),mine=localKeys();
   for(const p of state.players.filter(p=>p.connected&&mine.includes(p.key))){const row=make('div',undefined,'field');row.append(make('b',p.name));const actions=make('div',undefined,'row');
    choices.forEach((choice,i)=>{const b=button(mapName(choice.map),()=>onReady(p.key,i,false));b.setAttribute('aria-pressed',String((state.votes[p.key]||0)===i));b.dataset.cupFocus=p.key+'-vote-'+i;actions.append(b);});
    const ready=button(state.ready[p.key]?'Not ready':'Ready!',()=>onReady(p.key,state.votes[p.key]||0,!state.ready[p.key]));ready.dataset.cupFocus=p.key+'-ready';actions.append(ready);row.append(actions);panel.append(row);
   }
   if(!state.players.some(p=>mine.includes(p.key)))panel.append(make('p','You joined after this Cup began. You can join the next Cup.','note'));
  }
  const actions=make('div',undefined,'row');
  if(isHost()){const next=button(done?'Play another Cup':'Start next round',done?onReplay:onNext);next.classList.add('big');next.disabled=!done&&!CKCup.canAdvance(state);next.dataset.cupFocus='next';actions.append(next);}
  const exit=button('Leave Cup',onExit);exit.dataset.back='';actions.append(exit);panel.append(actions);
  view.hidden=false;const restore=[...panel.querySelectorAll('[data-cup-focus]')].find(b=>b.dataset.cupFocus===focus);if(restore)restore.focus();
 }
 return {render,hide:()=>{view.hidden=true;},view};
}};
