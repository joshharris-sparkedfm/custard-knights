"""Independent Custard Knights model review, Blender 3.6.

blender --background --python hero_v2.py -- OUT
Creates an editable real 3D scene, transparent 512px renders and 96/64px
downsamples. No production sprites or knight.py are replaced.
"""
import bpy
import math
import os
import sys
import json
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else os.path.join(os.path.dirname(__file__), 'hero-v2-review'))
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_homefile(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.eevee.taa_render_samples = 64
scene.eevee.use_gtao = True
scene.eevee.gtao_distance = .16
scene.eevee.gtao_factor = 1.15
scene.render.resolution_x = scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
world = bpy.data.worlds.new('Soft ambient')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (.62, .68, .8, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = .7

def rgb(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in c)

def material(name, color, roughness=.65, metallic=0, emission=False):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb(color), 1)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    if emission:
        nodes.clear()
        out = nodes.new('ShaderNodeOutputMaterial')
        shader = nodes.new('ShaderNodeEmission')
        shader.inputs[0].default_value = (*rgb(color), 1)
        mat.node_tree.links.new(shader.outputs[0], out.inputs[0])
    else:
        shader = nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = (*rgb(color), 1)
        shader.inputs['Roughness'].default_value = roughness
        shader.inputs['Metallic'].default_value = metallic
        shader.inputs['Specular'].default_value = .28
    return mat

M = {
    'steel': material('Broad cool steel', '#AABBD0', .48, .12),
    'edge': material('Bevel highlights', '#DCE6F2', .5, .08),
    'joint': material('Deep blue joints', '#37455E'),
    'visor': material('Flat dark visor', '#211E38', emission=True),
    'cream': material('Readable warm eyes', '#FFF0CE', emission=True),
    'team': material('Tomato team cloth', '#EB483C', .86),
    'cape': material('Cape darker back', '#B22F42', .86),
    'custard': material('Custard', '#FFD348', .65),
    'leather': material('Warm boots and mitts', '#64403C', .86),
    'ink': material('Outline', '#211B32', emission=True),
}
M['ink'].use_backface_culling = True
ROOT = bpy.data.objects.new('HERO_V2', None)
scene.collection.objects.link(ROOT)

def finish(obj, key, bevel=0, outline=.018, smooth=False, parent=ROOT):
    obj.data.materials.append(M[key])
    if bevel:
        mod = obj.modifiers.new('Broad softened edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.affect = 'EDGES'
    for poly in obj.data.polygons:
        poly.use_smooth = smooth
    normal = obj.modifiers.new('Stable broad-face normals', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    if outline:
        obj.data.materials.append(M['ink'])
        mod = obj.modifiers.new('Thin silhouette ink', 'SOLIDIFY')
        mod.thickness = -outline
        mod.offset = 1
        mod.use_flip_normals = True
        mod.use_rim = False
        mod.material_offset = 1
    obj.parent = parent
    return obj

def box(name, loc, half, key, bevel=.06, parent=ROOT, outline=.018):
    bpy.ops.mesh.primitive_cube_add(size=2, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, key, bevel, outline, parent=parent)

def ball(name, loc, half, key, parent=ROOT, outline=.015):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, key, outline=outline, smooth=True, parent=parent)

def mesh(name, verts, faces, key, bevel=.035, parent=ROOT, outline=.018):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    return finish(obj, key, bevel, outline, parent=parent)

def extrude(name, poly, depth, key, parent=ROOT, bevel=.03, outline=.018):
    # Polygon in X/Z; its front is -Y. Authored plate, not a screen overlay.
    n = len(poly)
    verts = [(x, y, z) for y in (-depth/2, depth/2) for x, z in poly]
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces += [(i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n)]
    return mesh(name, verts, faces, key, bevel, parent, outline)

def limb(name, a, b, radius, key, parent=ROOT):
    delta = Vector(b) - Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=radius, depth=delta.length,
                                      location=(Vector(a)+Vector(b))/2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return finish(obj, key, .035, parent=parent)

# A planted stance with a real gap, broad cloth and equipment attached to arms.
for side in (-1, 1):
    box('Boot sole '+str(side), (side*.255, -.13, .1), (.19, .30, .085), 'joint', .07)
    boot = box('Sculpted boot '+str(side), (side*.255, -.07, .255), (.175, .26, .19), 'leather', .10)
    boot.rotation_euler.z = side * -.10
    limb('Leg '+str(side), (side*.255, 0, .28), (side*.225, 0, .65), .125, 'joint')
box('Armour body', (0, .025, .94), (.42, .29, .40), 'joint', .12)
tabard = extrude('Broad red tabard', [(-.39, 1.29), (.39, 1.29), (.43, .61), (.12, .49), (0, .59), (-.12, .49), (-.43, .61)], .07, 'team', bevel=.045)
tabard.location.y = -.318
box('Simple belt', (0, -.005, .68), (.43, .33, .05), 'leather', .035)
box('Single cream belt clasp', (0, -.367, .68), (.065, .026, .05), 'cream', .02, outline=.009)
# One bold emblem, deliberately no rivets, cuffs, mail dots or gold trim.
def star(cx, cz, radius):
    return [(cx+math.sin(i*math.pi/5)*radius*(1 if i%2==0 else .46),
             cz+math.cos(i*math.pi/5)*radius*(1 if i%2==0 else .46)) for i in range(10)]
badge = extrude('Single cream tabard star', star(0,.87,.14), .02, 'cream', bevel=.008, outline=0)
badge.location.y = -.366

cape = mesh('Sculpted cape', [(-.36,.26,1.28), (.36,.26,1.28), (-.48,.52,.47),
    (-.18,.63,.40), (.18,.63,.40), (.48,.52,.47), (0,.36,1.24), (0,.65,.55)],
    [(0,6,7,3,2), (6,1,5,4,7), (3,7,4)], 'cape', bevel=0, outline=.024)
solid = cape.modifiers.new('Real cloth thickness', 'SOLIDIFY')
solid.thickness = .055
for side in (-1, 1):
    pauldron = box('One clean pauldron '+str(side), (side*.49, .015, 1.2), (.22,.28,.17), 'steel', .10)
    pauldron.rotation_euler.y = side*.16

# Wide bevelled helmet. Its face stays planar and visible at the 32 degree view.
section=[(-.46,-.48),(.46,-.48),(.63,-.27),(.63,.20),(.44,.43),(-.44,.43),(-.63,.20),(-.63,-.27)]
rings=[(1.23,.83),(1.43,1),(1.97,1),(2.17,.9),(2.31,.61),(2.36,.22)]
helm_verts=[(x*scale,y*scale,z) for z,scale in rings for x,y in section]
helm_faces=[tuple(reversed(range(8))),tuple(range(40,48))]
for row in range(len(rings)-1):
    for col in range(8):
        a=row*8+col;b=row*8+(col+1)%8
        helm_faces.append((a,b,b+8,a+8))
helm=mesh('Octagonal pot helmet with tapered crown',helm_verts,helm_faces,'steel',bevel=.065,outline=.024)
box('Lower steel jaw', (0,-.15,1.30), (.45,.33,.11), 'edge', .075)
visor = box('Large flat visor', (0,-.469,1.77), (.505,.045,.205), 'visor', .06, outline=.016)
# Wedge shaped cream eyes add a determined, curious expression without tiny pupils.
for side in (-1,1):
    x = side*.23
    eye = ball('Soft cream visor lens '+str(side),(x,-.535,1.75),(.125,.027,.103),'cream',outline=0)
    eye.rotation_euler.y=side*-.17

# One sculpted dollop with exactly two bold drips, kept away from the eye opening.
profile = [(.27,2.27), (.34,2.37), (.27,2.47), (.20,2.57), (.11,2.68), (.025,2.76)]
verts = []
segments = 24
for radius,z in profile:
    lean = max(0,z-2.5)*.35
    for i in range(segments):
        a = i*math.tau/segments
        verts.append((math.cos(a)*radius+lean, math.sin(a)*radius*.88+.01,z))
faces = []
for j in range(len(profile)-1):
    for i in range(segments):
        a=j*segments+i; b=j*segments+(i+1)%segments
        faces.append((a,b,b+segments,a+segments))
faces += [tuple(reversed(range(segments))), tuple(range((len(profile)-1)*segments,len(verts)))]
dollop = mesh('Single custard dollop', verts, faces, 'custard', bevel=0, outline=.019)
for poly in dollop.data.polygons: poly.use_smooth = True
ball('Bold left custard drip', (-.40,-.455,2.17), (.095,.11,.23), 'custard')
ball('Bold right custard drip', (.55,.04,2.12), (.10,.11,.23), 'custard')
ball('Custard joins left drip',(-.29,-.29,2.32),(.19,.25,.085),'custard',outline=0)
ball('Custard joins right drip',(.35,.05,2.30),(.25,.14,.08),'custard',outline=0)

ARMS = []
def arm(name, shoulder, elbow, hand):
    pivot = bpy.data.objects.new(name, None)
    scene.collection.objects.link(pivot)
    pivot.parent = ROOT
    limb(name+' upper', shoulder, elbow, .13, 'joint', pivot)
    limb(name+' steel forearm', elbow, hand, .15, 'steel', pivot)
    ball(name+' mitten', hand, (.18,.16,.16), 'leather', pivot)
    ARMS.append(pivot)
    return pivot

sword_arm = arm('Sword arm', (-.47,0,1.16), (-.66,-.03,.94), (-.75,-.18,.86))
shield_arm = arm('Shield arm', (.47,0,1.16), (.64,-.10,1.0), (.73,-.29,.95))
sword = bpy.data.objects.new('Integrated sword', None)
scene.collection.objects.link(sword)
sword.parent = sword_arm
sword.location = (-.75,-.18,.86)
sword.rotation_euler.y = -.24
box('Sword grip', (0,0,0), (.055,.06,.14), 'leather', .025, sword)
box('Simple steel crossguard', (0,0,.16), (.20,.075,.045), 'edge', .025, sword)
blade = extrude('Broad bevelled sword blade', [(-.115,.20),(.115,.20),(.095,.94),(0,1.10),(-.095,.94)], .075, 'edge', sword, .015)
blade.data.materials[0] = M['steel']
ridge = extrude('Sword central highlight', [(-.018,.25),(.028,.25),(.024,.94),(0,1.04)], .007, 'edge', sword, .002, 0)
ridge.location.y = -.043
shield = bpy.data.objects.new('Integrated shield', None)
scene.collection.objects.link(shield)
shield.parent = shield_arm
shield.location = (.81,-.37,.99)
shield.rotation_euler.z = -.14
plate = extrude('Shield broad steel rim', [(-.31,.34),(.31,.34),(.31,-.14),(0,-.43),(-.31,-.14)], .12, 'steel', shield, .055)
field = extrude('Shield team field', [(-.245,.27),(.245,.27),(.245,-.10),(0,-.34),(-.245,-.10)], .035, 'team', shield, .03)
field.location.y = -.076
shield_badge = extrude('Shield cream star', star(0,.025,.17), .02, 'cream', shield, .008, 0)
shield_badge.location.y = -.103

def light(name, loc, energy, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (Vector((0,0,1.4))-obj.location).to_track_quat('-Z','Y').to_euler()
light('Large warm key', (-3,-4,7), 500, 5, (1,.92,.82))
light('Cool broad fill', (4,-1,4), 220, 4, (.70,.83,1))
light('Cape silhouette rim', (0,4,5), 330, 3, (1,.74,.58))
data = bpy.data.cameras.new('Camera 32 degrees')
camera = bpy.data.objects.new('Camera 32 degrees',data)
scene.collection.objects.link(camera)
scene.camera = camera
data.type = 'ORTHO'
data.ortho_scale = 3.6
angle = math.radians(32)
target = Vector((0,0,1.40))
camera.location = target + Vector((0,-10*math.cos(angle),10*math.sin(angle)))
camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()

REST = {o.name:(o.location.copy(),o.rotation_euler.copy()) for o in [ROOT,sword_arm,shield_arm,sword,shield]}
def pose(name, direction):
    for key,(loc,rot) in REST.items():
        obj=bpy.data.objects[key];obj.location=loc;obj.rotation_euler=rot
    ROOT.rotation_euler.z = math.radians(direction)
    if name == 'guard':
        shield_arm.location = (-.38,-.32,.10)
        shield.rotation_euler.z = .08
        sword_arm.location = (.07,.07,.10)
        sword.rotation_euler.y = -.09
        ROOT.location.z = -.055
    elif name == 'contact':
        sword_arm.location = (-.06,-.28,.10)
        sword.rotation_euler = (math.radians(58),math.radians(-66),math.radians(-18))
        shield_arm.location = (.10,.18,0)
        ROOT.rotation_euler.x = .10
        ROOT.location.z = -.025

jobs=[('idle','SE',45),('idle','S',0),('idle','E',90),('idle','NE',135),('idle','N',180),('guard','SE',45),('contact','SE',45)]
manifest = {'prototype':'hero_v2','production_replacement':False,'camera_elevation':32,'orthographic_scale':3.6,
    'closeup_camera':{'orthographic_scale':3.6,'target_z':1.4},
    'matched_game_camera':{'orthographic_scale':4.6,'target_z':1.45},
    'world_geometry_ground_z':.015,'world_geometry_custard_top_z':2.76,'world_geometry_helmet_top_z':2.36,
    'sizes':[512,96,64],'facings':['S','SE','E','NE','N'],'poses':['idle','guard','contact'],
    'geometry':'All clothing, face, hands and equipment are actual mesh geometry. Transparent renders; no 2D arm or weapon overlays.', 'files':[]}
pose('idle',45)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'hero_v2.blend'))
for action,direction,degrees in jobs:
    pose(action,degrees)
    stem='hero_v2_'+action+'_'+direction
    entry={'pose':action,'direction':direction,'renders':{}}
    for calibration,ortho,z in [('closeup',3.6,1.40),('game',4.6,1.45)]:
        data.ortho_scale=ortho
        target=Vector((0,0,z))
        camera.location=target+Vector((0,-10*math.cos(angle),10*math.sin(angle)))
        camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
        filename=stem if calibration=='closeup' else 'hero_v2_game_'+action+'_'+direction
        scene.render.filepath=os.path.join(OUT,filename+'_512.png')
        bpy.ops.render.render(write_still=True)
        entry['renders'][calibration]={'512':filename+'_512.png'}
        for size in (96,64):
            image=bpy.data.images.load(scene.render.filepath,check_existing=False)
            image.scale(size,size)
            image.filepath_raw=os.path.join(OUT,filename+'_'+str(size)+'.png')
            image.file_format='PNG'
            image.save()
            bpy.data.images.remove(image)
            entry['renders'][calibration][str(size)]=filename+'_'+str(size)+'.png'
    manifest['files'].append(entry)
    with open(os.path.join(OUT,'manifest.json'),'w') as handle:json.dump(manifest,handle,indent=2)
    print('HERO_V2_PREVIEW',scene.render.filepath,flush=True)
pose('idle',45)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'hero_v2.blend'))
print('HERO_V2_OK',OUT,flush=True)
