"""Editable visual proof, not production sprites. Blender 4.1.1, -- OUT_DIR."""
import bpy, math, sys, json
from pathlib import Path
from mathutils import Vector
out=Path(sys.argv[sys.argv.index('--')+1]).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
sc.render.engine='BLENDER_EEVEE';sc.eevee.taa_render_samples=96
sc.eevee.use_gtao=True;sc.eevee.gtao_distance=.22;sc.eevee.gtao_factor=1.12
sc.render.resolution_x=1440;sc.render.resolution_y=1080;sc.render.resolution_percentage=100
sc.render.image_settings.file_format='PNG';sc.view_settings.view_transform='AgX'
sc.view_settings.look='AgX - Medium High Contrast'
def mat(name,h):
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.7
 return m
M={k:mat(k,h) for k,h in {'cream':'F5E4BA','custard':'E9B747','rose':'BE6979','teal':'498A8B','steel':'A7BCC7','dark':'35404C','sage':'8DAB7B','leaf':'B5C894','wood':'A37654','skin':'D7A078','pale':'EBC09C','brown':'685149','ground':'D8C8A2','tile':'EAD6AD','bread':'CE9553','white':'FFF0D5'}.items()}
def finish(o,name,m):
 o.name=name;o.data.materials.append(M[m]);return o
def ball(name,p,s,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=p);o=bpy.context.object;o.scale=s
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for poly in o.data.polygons:poly.use_smooth=True
 return finish(o,name,m)
def box(name,p,s,m,r=.08):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.scale=s;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if r:
  b=o.modifiers.new('Soft manufactured edges','BEVEL');b.width=r;b.segments=4
  n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return finish(o,name,m)
def rod(name,a,b,r,m):
 a,b=Vector(a),Vector(b);mid=(a+b)*.5
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=(b-a).length,location=mid);o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
 bevel=o.modifiers.new('Rounded ends','BEVEL');bevel.width=r*.6;bevel.segments=3
 return finish(o,name,m)
def text(name,value,p,size,m):
 cu=bpy.data.curves.new(name,'FONT');cu.body=value;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.extrude=.008;cu.bevel_depth=.002
 o=bpy.data.objects.new(name,cu);sc.collection.objects.link(o);o.location=p;o.rotation_euler=(math.pi/2,0,0);cu.materials.append(M[m]);return o

# The entire scene uses the same modelling primitives, materials and soft lighting.
box('Diorama foundation',(0,0,-.22),(11,8,.4),'sage',.25)
box('Bakery courtyard',(0,-.3,.015),(9.8,6.6,.12),'ground',.18)
for x in range(-5,6):
 for y in range(-3,4):
  if y<1:box('Broad paving',(x*.86,y*.81,.095),(.80,.74,.09),'tile',.07)
box('Cream bakery walls',(-.65,1.7,1.55),(5.5,2.2,3),'cream',.2)
box('Rose skirting',(-.65,.55,.3),(5.7,.18,.5),'rose',.06)
for x in [-2.15,.8]:
 box('Teal window frame',(x,.51,1.5),(1.35,.18,1.2),'teal',.13)
 box('Warm window',(x,.40,1.5),(1.12,.08,.97),'custard',.1)
 for dx in [-.28,.28]:box('Window mullion',(x+dx,.34,1.5),(.055,.07,.97),'cream',.02)
 box('Window crossbar',(x,.33,1.5),(1.1,.07,.06),'cream',.02)
box('Door frame',(-.68,.47,1.1),(.97,.22,1.85),'teal',.15)
box('Door',(-.68,.32,1.05),(.75,.10,1.6),'wood',.13)
ball('Door knob',(-.45,.23,1.0),(.055,.04,.055),'custard')
for side in [-1,1]:
 roof=box('Single smooth roof slope',(-.65,1.7+side*.73,3.2),(6.1,1.8,.23),'rose',.10);roof.rotation_euler.x=-side*math.radians(26)
rod('Roof ridge',(-3.7,1.7,3.65),(2.4,1.7,3.65),.13,'rose')
box('Bakery sign',(-.65,.20,2.66),(3.9,.20,.48),'teal',.12)
text('Bakery lettering',"MABEL'S BAKERY",(-.65,.085,2.66),.27,'cream')
for x in [-3.25,1.95]:
 rod('Awning support',(x,-.4,.14),(x,-.4,2.38),.065,'wood')
for i in range(10):
 canopy=box('Broad awning panel',(-3.0+i*.52,-.03,2.37),(.53,1.24,.09),'cream' if i%2 else 'custard',.035);canopy.rotation_euler.x=math.radians(10)
box('Bread counter',(-2.1,-.35,.65),(1.8,.75,.22),'wood',.11)
for x in [-2.75,-1.45]:box('Counter legs',(x,-.35,.35),(.15,.55,.6),'teal',.04)
for i in range(3):
 loaf=ball('Simple loaf',(-2.65+i*.52,-.35,.86),(.22,.18,.15),'bread')
 for dx in [-.07,.07]:rod('Bread score',(-2.65+i*.52+dx,-.45,.97),(-2.65+i*.52+dx,-.27,.99),.014,'cream')
for x,y in [(3.9,1.75),(-4.3,1.9)]:
 box('Planter',(x,y,.3),(1.15,1.1,.45),'cream',.18)
 rod('Tree trunk',(x,y,.45),(x,y,2.25),.16,'wood')
 for dx,dy,dz in [(0,0,2.65),(-.42,.05,2.25),(.45,0,2.32),(0,-.3,2.32)]:ball('Sculpted tree crown',(x+dx,y+dy,dz),(.65,.58,.62),'sage' if dx else 'leaf')

def character(name,x,y,kind,color,scale=1):
 before=set(bpy.data.objects)
 # Same body/head proportions, limbs, surfaces and contact shadows for every role.
 for dx in [-.17,.17]:
  rod(name+' leg',(dx,0,.18),(dx,0,.55),.11,'dark')
  box(name+' boot',(dx,-.08,.16),(.28,.41,.26),'brown',.10)
 ball(name+' torso',(0,0,.82),(.33,.23,.40),color)
 for sign in [-1,1]:
  ball(name+' shoulder',(sign*.33,0,1.0),(.16,.17,.18),color)
  rod(name+' sleeve',(sign*.34,0,.95),(sign*.43,-.03,.65),.12,color)
  ball(name+' hand',(sign*.44,-.04,.61),(.13,.13,.14),'steel' if kind=='knight' else 'pale')
 if kind=='knight':
  box(name+' tabard',(0,-.235,.80),(.42,.065,.44),color,.06)
  ball(name+' helm',(0,0,1.40),(.43,.34,.43),'steel')
  box(name+' visor',(0,-.306,1.43),(.65,.09,.18),'dark',.07)
  for dx in [-.16,.16]:box(name+' visor opening',(dx,-.365,1.43),(.12,.025,.045),'cream',.018)
  rod(name+' helmet rim',(-.31,-.27,1.24),(.31,-.27,1.24),.045,'cream')
  ball(name+' plume',(0,.05,1.87),(.13,.18,.27),color)
  box(name+' chest insignia',(0,-.28,.86),(.13,.03,.15),'custard',.04)
  shield=ball(name+' shield',(-.51,-.20,.77),(.28,.10,.34),color)
  ball(name+' shield boss',(-.51,-.30,.77),(.08,.025,.08),'custard')
  box(name+' sword blade',(.48,-.08,1.05),(.10,.065,.65),'cream',.035)
  box(name+' sword guard',(.48,-.08,.73),(.30,.10,.07),'custard',.03)
 else:
  ball(name+' head',(0,0,1.35),(.34,.29,.34),'pale' if kind!='alf' else 'skin')
  ball(name+' nose',(0,-.294,1.33),(.065,.075,.065),'pale' if kind!='alf' else 'skin')
  for dx in [-.11,.11]:ball(name+' simple eye',(dx,-.277,1.42),(.027,.025,.034),'dark')
  box(name+' apron',(0,-.23,.76),(.40,.09,.45),'cream',.08)
  rod(name+' apron band',(-.26,-.20,.85),(.26,-.20,.85),.034,'cream')
  if kind=='alf':
   for dx in [-.065,.065]:ball(name+' moustache',(dx,-.30,1.26),(.085,.035,.043),'brown')
   ball(name+' cap',(0,0,1.64),(.36,.3,.16),color)
   box(name+' cap peak',(0,-.25,1.58),(.40,.24,.07),color,.055)
  else:
   rod(name+' hat band',(0,0,1.60),(0,0,1.74),.27,'cream')
   for dx in [-.18,0,.18]:ball(name+' toque puff',(dx,0,1.80),(.22,.25,.20),'cream')
  if kind=='mabel':ball(name+' hair bun',(0,.26,1.44),(.17,.16,.17),'brown')
 group=bpy.data.objects.new(name,None);sc.collection.objects.link(group)
 for o in set(bpy.data.objects)-before:
  if o!=group:o.parent=group
 group.location=(x,y,.16);group.scale=(scale,)*3
 return group
characters=[]
characters.append(character('Custard knight',-.9,-2.25,'knight','teal'))
characters.append(character('Rose knight',1.0,-2.05,'knight','rose'))
characters.append(character('Mabel',-.65,-.62,'mabel','rose',.86))
characters.append(character('Alf',2.25,-.75,'alf','custard',.9))
characters.append(character('Pip',3.25,-1.6,'pip','teal',.77))

world=bpy.data.worlds.new('Shared studio');sc.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.73,.78,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.6
for name,pos,power,size in [('Key',(-5,-7,10),1400,7),('Fill',(6,-2,8),600,6)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(8,-13,11));camera=bpy.context.object;sc.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=12.8
camera.rotation_euler=(Vector((0,.1,1))-camera.location).to_track_quat('-Z','Y').to_euler()
sc.render.filepath=str(out/'coherent-bakery-study.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'coherent-bakery-study.blend'))
# Same models and lighting in the character study; no old atlas or community texture overlays.
keep=set(characters)
for o in sc.objects:
 if o.type not in ['CAMERA','LIGHT'] and o not in keep and o.parent not in keep:o.hide_render=True
for i,o in enumerate(characters):o.location=((i-2)*1.5,0,.16)
box('Character stage',(0,0,-.04),(9,3,.25),'ground',.15)
camera.location=(3,-10,6);camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=8.5
sc.render.resolution_y=600;sc.render.filepath=str(out/'coherent-cast-study.png');bpy.ops.render.render(write_still=True)
(out/'manifest.json').write_text(json.dumps({'status':'offline editable 3D visual proof; not integrated or user accepted','models':'new locally modelled toy forms for the whole scene; no new Meshy generation','outputs':['coherent-bakery-study.png','coherent-cast-study.png','coherent-bakery-study.blend'],'next':'Review consistency and knight quality before production rig/cosmetic/atlas work.'},indent=2))
