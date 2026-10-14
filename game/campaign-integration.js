/* Adapter wiring; the inline game supplies only its existing engine functions. */
(function(root){
 'use strict';
 function connect(engine,options={}){
  let ui,productRound=null,pendingResult=null,presentationSerial=0,homecomingSerial=null;
  const report=(name,fields)=>{try{options.onProductEvent?.(name,fields);}catch(_){}};
  const snapshot=r=>Object.freeze({...r,spoons:Object.freeze([...(r.spoons||[])]),added:Object.freeze([...(r.added||[])]),outro:Object.freeze([...(r.outro||[])]),checkpoint:r.checkpoint?Object.freeze({...r.checkpoint}):null});
  function invalidate(){presentationSerial++;pendingResult=null;homecomingSerial=null;}
  const campaign=root.CKCampaign.create({storage:options.storage,
   onPrelude:()=>{const firstDelivery=!campaign.save.results.banquet;campaign.stop();engine.sceneStarted?.();if(firstDelivery)ui.disruption(()=>launch('banquet',false));else launch('banquet',false);},
   onAftermath:()=>{campaign.stop();engine.sceneStarted?.();ui.brief('puddings',false);},
   onHomecoming:completeHomecoming,
   onFinish:result=>{
    const r=snapshot(result);
    if(productRound){const round=productRound;productRound=null;report('round_completed',{...round,result:r.won?'completed':'failed'});}
    // Save, both duplicate-safe reward sites, reporting and engine completion
    // settle against the original G before homecoming can boot another arena.
    const unlocks=Object.freeze([...(engine.finished?.(r)||[])]);
    if(r.won&&r.id==='rind')homecoming(false,{result:r,unlocks});else ui?.ended(r,unlocks);
   },onReward:options.onReward});
  function launch(id,resume=true,finaleReplay=false){
   if(finaleReplay&&(id!=='rind'||!campaign.save.results.rind?.spoons[0]))return null;
   invalidate();ui.close();const node=root.CKCampaign.byId[id],g=engine.boot(node.map);campaign.begin(id,g,engine,resume,finaleReplay);
   productRound={roundId:g.roundId,format:'story',mode:'campaign',map:node.map,encounter:id,difficulty:campaign.save.difficulty,humanCount:1,botCount:g.ents.filter(e=>!e.human).length};report('round_started',productRound);engine.play?.();ui.refresh();return g;
  }
  function quiet(kind){
   if(kind!=='homecoming')invalidate();ui.close();productRound=null;const g=engine.boot(root.CKCampaign.byId.banquet.map);
   if(kind==='opening')campaign.beginPrelude(g,engine);else if(kind==='homecoming')campaign.beginHomecoming(g,engine);else campaign.beginAftermath(g,engine);
   engine.play?.();ui.refresh();return g;
  }
  const opening=()=>quiet('opening'),aftermath=()=>quiet('aftermath');
  function homecoming(replay=false,completion=null){
   if(!campaign.save.results.rind?.spoons[0])return null;
   const retained=completion||(replay?pendingResult:null);invalidate();pendingResult=retained;homecomingSerial=presentationSerial;return quiet('homecoming');
  }
  function completeHomecoming(){
   if(homecomingSerial===null||campaign.run?.quietKind!=='homecoming')return;
   const token=homecomingSerial,captured=pendingResult;homecomingSerial=null;campaign.stop();engine.sceneStarted?.();
   ui.homecomingHook(()=>{
    if(token!==presentationSerial)return;pendingResult=null;presentationSerial++;
    if(captured)ui.ended(captured.result,captured.unlocks);else ui.open('rind');
   },!!captured);
  }
  function skipQuiet(){
   if(!campaign.run?.prelude)return;
   if(campaign.run.quietKind==='homecoming')completeHomecoming();
   else if(campaign.run.quietKind==='opening')launch('banquet',false);
   else{campaign.stop();engine.sceneStarted?.();ui.brief('puddings',false);}
  }
  ui=root.CKCampaignUI.mount({campaign,host:options.host,start:launch,startFinale:()=>launch('rind',false,true),opening,aftermath,homecoming:()=>homecoming(),replayHomecoming:()=>homecoming(true),skipQuiet,
   resultPresented:(r,panel,unlocks)=>engine.resultPresented?.(r,panel,unlocks),isPaused:engine.isPaused,interactLabel:engine.interactLabel,drawStoryKnight:engine.drawStoryKnight,reducedMotion:engine.reducedMotion,
   onOpen:()=>{invalidate();campaign.stop();engine.mapOpened?.();},onExit:()=>{invalidate();campaign.stop();engine.menu?.();}});
  return {campaign,ui,launch,launchFinale:()=>launch('rind',false,true),opening,aftermath,homecoming:()=>homecoming(),replayHomecoming:()=>homecoming(true),open:id=>ui.open(id),
   playerInput:i=>campaign.playerInput(i),tick:dt=>{campaign.tick(dt);ui.refresh();},event:(k,data)=>campaign.event(k,data),input:(e,dt)=>campaign.input(e,dt),draw:ctx=>campaign.draw(ctx),drawScenery:ctx=>campaign.drawScenery(ctx),drawForeground:ctx=>campaign.drawForeground(ctx),
   get pendingResult(){return pendingResult;},stop:()=>{invalidate();productRound=null;campaign.stop();ui.close();}};
 }
 root.CKCampaignIntegration={connect};
})(typeof globalThis!=='undefined'?globalThis:this);
