"""Bake community GLB props into game sprites with one shared camera and light rig.

Every playfield prop goes through this script so the bakery reads as one style:
same orthographic camera elevation, same three-light studio, same AgX look as the
original stall, crate and tree renders. Source GLBs are only read, never written.

blender --background --python art/blender/bake_props.py -- --spec <props.json> --models <dir> --output <dir> [--only id ...]

Spec entries: {"id", "file", "yaw": degrees (0 = model front), "maxPx": longest side,
"tint": [{"hue": [lo, hi], "minSat": s, "to": "#rrggbb"}]} — tints remap matching
texture hues to a palette colour inside the material graph, keeping shading.
"""
import bpy, math, json, sys, hashlib
from pathlib import Path
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
spec = json.loads(Path(arg('--spec')).read_text(encoding='utf-8'))
models, output = Path(arg('--models')), Path(arg('--output'))
only = argv[argv.index('--only') + 1:] if '--only' in argv else None
output.mkdir(parents=True, exist_ok=True)

# Matches render_assets.py, which produced the accepted stall/crate/tree sprites.
ELEVATION = math.atan2(2.4, 3)

def linear(hex):
    values = [int(hex[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values) + (1,)

def tint(material, rules):
    nodes, links = material.node_tree.nodes, material.node_tree.links
    bsdf = next((n for n in nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf or not bsdf.inputs['Base Color'].links:
        return
    current = bsdf.inputs['Base Color'].links[0].from_socket
    for rule in rules:
        hsv = nodes.new('ShaderNodeSeparateColor'); hsv.mode = 'HSV'; links.new(current, hsv.inputs[0])
        lo, hi = rule['hue']
        a = nodes.new('ShaderNodeMath'); a.operation = 'GREATER_THAN'; a.inputs[1].default_value = lo; links.new(hsv.outputs[0], a.inputs[0])
        b = nodes.new('ShaderNodeMath'); b.operation = 'LESS_THAN'; b.inputs[1].default_value = hi; links.new(hsv.outputs[0], b.inputs[0])
        s = nodes.new('ShaderNodeMath'); s.operation = 'GREATER_THAN'; s.inputs[1].default_value = rule.get('minSat', .25); links.new(hsv.outputs[1], s.inputs[0])
        m1 = nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; links.new(a.outputs[0], m1.inputs[0]); links.new(b.outputs[0], m1.inputs[1])
        mask = nodes.new('ShaderNodeMath'); mask.operation = 'MULTIPLY'; links.new(m1.outputs[0], mask.inputs[0]); links.new(s.outputs[0], mask.inputs[1])
        # Keep the source value so painted shading survives the recolour.
        target = nodes.new('ShaderNodeRGB'); target.outputs[0].default_value = linear(rule['to'])
        shaded = nodes.new('ShaderNodeMixRGB'); shaded.blend_type = 'MULTIPLY'; shaded.inputs[0].default_value = 1
        value = nodes.new('ShaderNodeCombineColor'); value.mode = 'HSV'; value.inputs[0].default_value = 0; value.inputs[1].default_value = 0
        boost = nodes.new('ShaderNodeMath'); boost.operation = 'MULTIPLY'; boost.inputs[1].default_value = 1.35; links.new(hsv.outputs[2], boost.inputs[0])
        links.new(boost.outputs[0], value.inputs[2])
        links.new(target.outputs[0], shaded.inputs[1]); links.new(value.outputs[0], shaded.inputs[2])
        mix = nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MIX'
        links.new(mask.outputs[0], mix.inputs[0]); links.new(current, mix.inputs[1]); links.new(shaded.outputs[0], mix.inputs[2])
        current = mix.outputs[0]
    links.new(current, bsdf.inputs['Base Color'])

def bake(entry):
    source = models / entry['file']
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for mesh in meshes:
        for material in mesh.data.materials:
            if material and material.use_nodes and entry.get('tint'):
                tint(material, entry['tint'])
    corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    low = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
    center = (low + high) * .5; size = max(high - low)
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 32
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
    world = bpy.data.worlds.new('Studio'); world.use_nodes = True; sc.world = world
    world.node_tree.nodes['Background'].inputs[0].default_value = (.65, .69, .75, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = .65
    for name, pos, power in [('Key', (-3, -4, 6), 500), ('Fill', (4, -2, 3), 200), ('Rim', (1, 4, 5), 350)]:
        light = bpy.data.lights.new(name, 'AREA'); light.energy = power * size * size; light.shape = 'DISK'; light.size = size * 3
        ob = bpy.data.objects.new(name, light); sc.collection.objects.link(ob); ob.location = center + Vector(pos) * size
        ob.rotation_euler = (center - ob.location).to_track_quat('-Z', 'Y').to_euler()
    camdata = bpy.data.cameras.new('Camera'); cam = bpy.data.objects.new('Camera', camdata)
    sc.collection.objects.link(cam); sc.camera = cam; camdata.type = 'ORTHO'
    yaw = math.radians(entry.get('yaw', 0))
    direction = Vector((math.sin(yaw) * math.cos(ELEVATION), -math.cos(yaw) * math.cos(ELEVATION), math.sin(ELEVATION)))
    cam.location = center + direction * size * 3.84
    cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()
    inv = cam.rotation_euler.to_matrix().transposed(); projected = [inv @ (v - center) for v in corners]
    camdata.ortho_scale = max(max(p[i] for p in projected) - min(p[i] for p in projected) for i in (0, 1)) * 1.08
    camdata.clip_end = size * 30; camdata.clip_start = max(size * .001, .0001)
    sc.render.resolution_x = sc.render.resolution_y = 1024; sc.render.resolution_percentage = 100
    raw = output / f"{entry['id']}-raw.png"; sc.render.filepath = str(raw)
    bpy.ops.render.render(write_still=True)
    tris = sum(len(p.vertices) - 2 for o in meshes for p in o.data.polygons)
    return {'id': entry['id'], 'file': entry['file'], 'raw': raw.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'bytes': source.stat().st_size, 'triangles': tris, 'meshes': len(meshes), 'yaw': entry.get('yaw', 0)}

results = []
for entry in spec:
    if only and entry['id'] not in only:
        continue
    results.append(bake(entry)); print('PROP_BAKED', entry['id'], flush=True)
(output / 'bake.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
