(async()=>{
 await CK.sprLoadAll();await CK.sprLoadVisors();CK.clearFactionSprites();
 const pixels=image=>image.getContext('2d').getImageData(0,0,image.width,image.height).data;
 let comparisons=0,maxChannelDelta=0,changedChannels=0;const count=CK.spriteFrameCount();
 const actual=Object.keys(CK_SPRITES.knight.helms);if(actual.length!==6)throw Error('Unexpected helmet family');
 for(const open of [false,true])for(const helm of actual)for(let i=0;i<count;i+=3)for(const armed of [0,1,2]){
  const e=CK.mkKnight({color:i%2?'#f2c14e':'#a5d9e5',kit:{helm,visor:open?'open':'closed',plume:i%2?'feather':'brush',metal:['steel','gold','dark'][comparisons%3]},cape:['plain','checker','stripes'][comparisons%3],emblem:i%2?'star':'crown',blade:i%2?'steel':'spoon',wpn:armed===1?{kind:'bow',lvl:1}:null,swing:armed===2?.1:0});
  const original=CK.spriteCompose(e,i,open);if(!original)throw Error('Unloaded family');const a=pixels(original.image);
  e.factionSpriteCache=true;const composed=CK.spriteCompose(e,i,open),cached=CK.spriteCompose(e,i,open),b=pixels(cached.image);
  if(composed.image!==cached.image)throw Error('No cache hit');
  if(a.length!==b.length)throw Error('Changed dimensions');
  for(let j=0;j<a.length;j++){const delta=Math.abs(a[j]-b[j]);maxChannelDelta=Math.max(maxChannelDelta,delta);if(delta)changedChannels++;if(delta>0)throw Error('Pixel mismatch '+[open,helm,i,armed].join('/')+' delta='+delta);}
  comparisons++;
 }
 const after=CK.spriteCache();if(after.bytes>after.limit||after.entries===0||after.hits<comparisons)throw Error('Cache budget/hits');
 // More than the budget of genuinely different frames must evict, rather than grow.
 for(let i=0;i<400;i++)CK.spriteCompose(CK.mkKnight({factionSpriteCache:true,color:`rgb(${i%256},${Math.floor(i/256)},120)`}),0);
 const evicted=CK.spriteCache();if(evicted.bytes>evicted.limit)throw Error('Unbounded cache');
 CK.clearFactionSprites();if(CK.spriteCache().bytes!==0||CK.spriteCache().entries!==0)throw Error('Clear failed');
 CK.massBattle().qa.startPractice({mode:'brawl',teamSize:4});CK.massBattle().qa.captureMode(true);CK.massBattle().qa.captureStep(1/60,{});
 if(CK.spriteCache().entries===0)throw Error('Faction renderer did not use cache');
 CK.massBattle().close();if(CK.spriteCache().entries!==0)throw Error('Leaving faction mode retained cached frames');
 return {comparisons,maxChannelDelta,changedChannels,after,evicted,cleared:CK.spriteCache(),framesPerFamily:count,helmets:actual,limitations:'Exact RGBA comparison using software 2D canvases to isolate composition from GPU rounding for sampled frames across both complete visor families and all six helmets, held weapon/swing states, varying colours and cosmetics. Dynamic sword geometry remains outside the cached pixels.'};
})()
