"""Bake a Meshy-rigged community cook into eight directions, idle and walking."""
import bpy,sys,math,json,argparse,hashlib
from pathlib import Path
from mathutils import Vector,Quaternion
sys.path.insert(0,str(Path(__file__).resolve().parent))
from cook_style import apply_style
ap=argparse.ArgumentParser();ap.add_argument('--input',required=True);ap.add_argument('--output',required=True);ap.add_argument('--style',required=True);ap.add_argument('--height',type=float);args=ap.parse_args(sys.argv[sys.argv.index('--')+1:])
source=Path(args.input).resolve();out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(source))
sc=bpy.context.scene;arm=next(o for o in sc.objects if o.type=='ARMATURE')
meshes=[o for o in sc.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
meshes=apply_style(meshes,arm,args.style)
action=arm.animation_data.action;start,end=map(float,action.frame_range)
for track in arm.animation_data.nla_tracks:track.mute=True
poses=[]
for f in [start,start+(end-start)/2]:
 sc.frame_set(int(f),subframe=f%1);poses.append({b.name:b.matrix_basis.copy() for b in arm.pose.bones})
idle={}
for name in poses[0]:
 a,q,s=poses[0][name].decompose();b,r,t=poses[1][name].decompose();idle[name]=(a.lerp(b,.5),q.slerp(r,.5),s.lerp(t,.5))
def pose(i):
 if i<2:
  arm.animation_data.action=None
  for b in arm.pose.bones:
   p,q,s=idle[b.name];b.location=p;b.rotation_mode='QUATERNION';b.rotation_quaternion=q;b.scale=s
  # Subtle shoulder breathing; feet and root remain planted.
  bone=arm.pose.bones['Spine'];bone.rotation_quaternion=bone.rotation_quaternion@Quaternion((1,0,0),(-1 if i else 1)*.012)
  bpy.context.view_layer.update()
 else:
  arm.animation_data.action=action;f=start+(end-start)*(i-2)/6;sc.frame_set(int(f),subframe=f%1)
 bpy.context.view_layer.update()
 return arm.matrix_world@arm.pose.bones['Hips'].head
def vertices():
 dg=bpy.context.evaluated_depsgraph_get()
 return [o.matrix_world@v.co for ob in meshes for o in [ob.evaluated_get(dg)] for v in o.data.vertices]
pose(0);verts=vertices();height=args.height or max(v.z for v in verts);cell=128;anchor=cell*(.78 if args.style=='bakers-delight' else .86);elev=math.radians(35);scale=height*(1.4 if args.style=='bakers-delight' else 1.2)
targetZ=(anchor/cell-.5)*scale/math.cos(elev)
sc.render.engine='BLENDER_EEVEE';sc.eevee.taa_render_samples=32;sc.render.resolution_x=sc.render.resolution_y=cell;sc.render.resolution_percentage=100;sc.render.film_transparent=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
world=bpy.data.worlds.new('Bakery studio');world.use_nodes=True;sc.world=world;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.69,.75,1);world.node_tree.nodes['Background'].inputs[1].default_value=.7
for name,pos,power in [('Key',(-3,-4,6),500),('Fill',(4,-2,3),200),('Rim',(1,4,5),200)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power*height*height;d.shape='DISK';d.size=height*3;o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.location=Vector((0,0,height*.5))+Vector(pos)*height;o.rotation_euler=(Vector((0,0,height*.5))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',d);sc.collection.objects.link(cam);sc.camera=cam;d.type='ORTHO';d.ortho_scale=scale;d.clip_end=height*30
frames=[]
for direction in range(8):
 angle=direction*math.pi/4-math.pi/2;offset=Vector((math.sin(angle)*math.cos(elev),-math.cos(angle)*math.cos(elev),math.sin(elev)))*height*4
 for frame in range(8):
  hips=pose(frame);target=Vector((hips.x,hips.y,targetZ));cam.location=target+offset;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
  filename=f'{direction}-{frame}.png';sc.render.filepath=str(out/filename);bpy.ops.render.render(write_still=True);frames.append(filename)
meta={'cell':cell,'directions':8,'per':8,'idle':[0,2],'walk':[2,6],'anchor':[cell/2,anchor],'worldHeight':height,'walkSeconds':(end-start)/sc.render.fps,'idleSeconds':1.4,'displayScale':.96 if args.style=='bakers-delight' else .84,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'style':args.style,'frames':frames,'notes':'Direction 0 faces screen-right; directions increase clockwise. Idle averages opposing walk poses; local shoulder breathing. No source mesh changes.'}
(out/'bake.json').write_text(json.dumps(meta,indent=2));print('COOK_BAKE_COMPLETE',json.dumps({k:meta[k] for k in ['cell','directions','per','walkSeconds','sourceSha256']}))
