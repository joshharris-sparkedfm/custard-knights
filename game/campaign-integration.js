/* Adapter wiring; the inline game supplies only its existing engine functions. */
(function(root){
 'use strict';
 function connect(engine,options={}){
  let ui,productRound=null;
  // Reporting is optional and must never interrupt play or rewards.
  const report=(name,fields)=>{try{options.onProductEvent?.(name,fields);}catch(_){}};
  const campaign=root.CKCampaign.create({storage:options.storage,onPrelude:()=>{const firstDelivery=!campaign.save.results.banquet;campaign.stop();engine.sceneStarted?.();if(firstDelivery)ui.disruption(()=>launch('banquet',false));else launch('banquet',false);},onAftermath:()=>{campaign.stop();engine.sceneStarted?.();ui.brief('puddings',false);},onFinish:r=>{if(productRound){const round=productRound;productRound=null;report('round_completed',{...round,result:r.won?'completed':'failed'});}engine.finished&&engine.finished(r);if(ui)ui.ended(r);},onReward:options.onReward});
  function launch(id,resume=true){ui.close();const node=root.CKCampaign.byId[id],g=engine.boot(node.map);campaign.begin(id,g,engine,resume);productRound={roundId:g.roundId,format:'story',mode:'campaign',map:node.map,encounter:id,difficulty:campaign.save.difficulty,humanCount:1,botCount:g.ents.filter(e=>!e.human).length};report('round_started',productRound);engine.play&&engine.play();ui.refresh();return g;}
  function quiet(kind){ui.close();productRound=null;const g=engine.boot(root.CKCampaign.byId.banquet.map);kind==='opening'?campaign.beginPrelude(g,engine):campaign.beginAftermath(g,engine);engine.play?.();ui.refresh();return g;}
  const opening=()=>quiet('opening'),aftermath=()=>quiet('aftermath');
  function skipQuiet(){if(!campaign.run?.prelude)return;if(campaign.run.quietKind==='opening')launch('banquet',false);else{campaign.stop();engine.sceneStarted?.();ui.brief('puddings',false);}}
  ui=root.CKCampaignUI.mount({campaign,host:options.host,start:launch,opening,aftermath,skipQuiet,isPaused:engine.isPaused,interactLabel:engine.interactLabel,drawStoryKnight:engine.drawStoryKnight,reducedMotion:engine.reducedMotion,onOpen:()=>{engine.mapOpened&&engine.mapOpened();},onExit:()=>{campaign.stop();engine.menu&&engine.menu();}});
  return {campaign,ui,launch,opening,aftermath,open:id=>ui.open(id),playerInput:i=>campaign.playerInput(i),tick:dt=>{campaign.tick(dt);ui.refresh();},event:(k,data)=>campaign.event(k,data),input:(e,dt)=>campaign.input(e,dt),draw:ctx=>campaign.draw(ctx),drawScenery:ctx=>campaign.drawScenery(ctx),drawForeground:ctx=>campaign.drawForeground(ctx),stop:()=>{productRound=null;campaign.stop();ui.close();}};
 }
 root.CKCampaignIntegration={connect};
})(typeof globalThis!=='undefined'?globalThis:this);
