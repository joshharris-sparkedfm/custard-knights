'use strict';
// Record the integrated game canvas and subtitle DOM, not a replacement renderer.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(root,'..','..','outputs','Story-review'));fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ck-story-review-'));
const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,900','--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),report={kind:'Actual in-game opening revision capture',audio:'Silent; subtitles baked into video.',errors:[]};let ws;
(async()=>{
 let port;for(let i=0;i<100;i++){try{port=+fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await sleep(100);}}if(!port)throw Error('Chrome failed to start');
 const tab=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');ws=new WebSocket(tab.webSocketDebuggerUrl);let serial=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data),p=pending.get(d.id);if(p){clearTimeout(p.timer);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')report.errors.push(d.params.exceptionDetails);};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,timeout:55000});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url:require('node:url').pathToFileURL(path.join(root,'index.html')).href+'?qa=1'});
 for(let i=0;i<100&&!await run('!!window.CK&&CK.spritesReady()');i++)await sleep(100);
 await run(`CK.toMenu();CK.presentationSettings({flash:true});window.captureArtCalls=0;window.captureRender=CKStoryScenes;window.captureMissingCallback=false;CKStoryScenes={...captureRender,render(c,t,o){if(typeof o.drawKnight!=='function')captureMissingCallback=true;const actual=o.drawKnight;return captureRender.render(c,t,{...o,drawKnight:(ctx,pose)=>{captureArtCalls++;actual(ctx,pose);}});}};CK.adventure.open('banquet');CK.adventure.ui.brief('banquet',false);window.sceneButton=label=>[...document.querySelectorAll('#campaignStory button')].find(b=>b.textContent===label);sceneButton('Pause scene').click();`);
 console.log('Recording the actual 24-second opening with game knight art and subtitle DOM.');
 const result=await run(`(async()=>{
  const stage=document.querySelector('.campaign-theatre'),composite=document.createElement('canvas');composite.width=1000;composite.height=700;const ctx=composite.getContext('2d');
  const stream=composite.captureStream(30),mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));if(!mime)throw Error('WebM recording unsupported');
  const chunks=[],recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4500000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  function frame(){ctx.fillStyle='#291c31';ctx.fillRect(0,0,1000,700);ctx.drawImage(stage,0,0);ctx.fillStyle='#ffd46b';ctx.font='bold 23px Nunito,sans-serif';ctx.fillText(document.querySelector('.campaign-captions strong').textContent,34,599);ctx.fillStyle='#fff2c9';ctx.font='22px Nunito,sans-serif';const words=document.querySelector('.campaign-captions span').textContent.split(' ');let text='',y=634;for(const word of words){if(ctx.measureText(text+word).width>930){ctx.fillText(text,34,y);text='';y+=29;}text+=word+' ';}ctx.fillText(text,34,y);}
  frame();recorder.start(1000);sceneButton('Replay scene').click();
  await new Promise(resolve=>{const tick=()=>{frame();if(stage.dataset.playback==='complete')resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  frame();await new Promise(resolve=>setTimeout(resolve,100));const done=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:mime});const data=await new Promise(resolve=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(blob);});
  return {data,mime,bytes:blob.size,sceneSeconds:Number(stage.dataset.time),knightDrawCalls:captureArtCalls,missingCallback:captureMissingCallback};
 })()`);
 fs.writeFileSync(path.join(out,'banquet-opening.webm'),Buffer.from(result.data,'base64'));delete result.data;report.capture=result;
 if(result.missingCallback||result.knightDrawCalls<100||result.sceneSeconds!==24)throw Error('Capture did not complete with actual game knight renderer');
 await run(`const seek=document.querySelector('#campaignStory input[type=range]');seek.value='17';seek.dispatchEvent(new Event('input'));sceneButton('Pause scene').click();`);
 const still=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'opening-in-game.png'),Buffer.from(still.data,'base64'));
 await run(`CK.adventure.launch('banquet',false);CK.freeze(true);CK.draw();`);
 const gameplay=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'pantry-rescue.png'),Buffer.from(gameplay.data,'base64'));
 report.finishedAt=new Date().toISOString();report.sourceHashes={};for(const file of ['index.html','game/story-scenes.js','game/campaign-ui.js','game/campaign.js'])report.sourceHashes[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 console.log(JSON.stringify(report));
})().catch(e=>{report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(()=>{fs.writeFileSync(path.join(out,'capture-report.json'),JSON.stringify(report,null,2)+'\n');ws?.close();chrome.kill();});
