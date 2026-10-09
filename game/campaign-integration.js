/* Adapter wiring; the inline game supplies only its existing engine functions. */
(function(root){
 'use strict';
 function connect(engine,options={}){
  let ui;
  const campaign=root.CKCampaign.create({storage:options.storage,onFinish:r=>{engine.finished&&engine.finished(r);if(ui)ui.ended(r);},onReward:options.onReward});
  function launch(id,resume=true){ui.close();const g=engine.boot(root.CKCampaign.byId[id].map);campaign.begin(id,g,engine,resume);engine.play&&engine.play();ui.refresh();return g;}
  ui=root.CKCampaignUI.mount({campaign,host:options.host,start:launch,onOpen:()=>{engine.mapOpened&&engine.mapOpened();},onExit:()=>{campaign.stop();engine.menu&&engine.menu();}});
  return {campaign,ui,launch,open:id=>ui.open(id),tick:dt=>{campaign.tick(dt);ui.refresh();},event:(k,data)=>campaign.event(k,data),input:(e,dt)=>campaign.input(e,dt),draw:ctx=>campaign.draw(ctx),stop:()=>{campaign.stop();ui.close();}};
 }
 root.CKCampaignIntegration={connect};
})(typeof globalThis!=='undefined'?globalThis:this);
