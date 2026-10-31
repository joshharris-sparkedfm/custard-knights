from pathlib import Path
from PIL import Image
import json,hashlib,argparse
ap=argparse.ArgumentParser();ap.add_argument('--input-root',required=True);ap.add_argument('--output',required=True);args=ap.parse_args()
input_root=Path(args.input_root).resolve();out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
configs={};audit=[]
for name,source in [('Mabel','canteen-lady'),('Alf','bakers-delight'),('Pip','t-pose-chef')]:
 root=input_root/source;walk=json.loads((root/'sprite-pilot/bake.json').read_text());run=json.loads((root/'run-pilot/bake.json').read_text());assert walk['worldHeight']==run['worldHeight']
 frames=[];rects=[];x=y=rowHeight=0;atlas=Image.new('RGBA',(1024,1024))
 for direction in range(8):
  for frame in range(14):
   folder='sprite-pilot' if frame<8 else 'run-pilot';pose=frame if frame<8 else frame-6
   im=Image.open(root/folder/f'{direction}-{pose}.png').convert('RGBA');bbox=im.getbbox();assert bbox and min(bbox[0],bbox[1],128-bbox[2],128-bbox[3])>=2,(name,direction,frame,bbox)
   a,b,c,d=bbox;a-=1;b-=1;c+=1;d+=1;crop=im.crop((a,b,c,d));w,h=crop.size
   if x+w+2>1024:x=0;y+=rowHeight+2;rowHeight=0
   assert y+h<=1024
   atlas.alpha_composite(crop,(x,y));rects.append([x,y,w,h,a-walk['anchor'][0],b-walk['anchor'][1]]);x+=w+2;rowHeight=max(rowHeight,h)
 atlas=atlas.crop((0,0,1024,y+rowHeight));filename=name.lower()+'-cook.png';atlas.save(out/filename,optimize=True)
 configs[name]={'url':'sprites/community/'+filename,'per':14,'directions':8,'rects':rects,'anims':{'idle':[0,2],'walk':[2,6],'run':[8,6]},'seconds':{'idle':1.4,'walk':walk['walkSeconds'],'run':run['walkSeconds']},'scale':walk['displayScale'],'size':list(atlas.size)}
 audit.append({'name':name,'source':source,'frames':112,'bordersClear':True,'file':filename,'bytes':(out/filename).stat().st_size,'decodedBytes':atlas.width*atlas.height*4,'sha256':hashlib.sha256((out/filename).read_bytes()).hexdigest(),'walkRigSha256':walk['sourceSha256'],'runRigSha256':run['sourceSha256']})
(out/'community-cooks.js').write_text('/* Baked community cooks; provenance in sprites/community/cooks-sources.json. */\nglobalThis.CK_COOK_SPRITES='+json.dumps(configs,separators=(',',':'))+';\n')
(out/'validation.json').write_text(json.dumps(audit,indent=2));print(json.dumps(audit))
