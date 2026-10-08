"""Opt-in face and weapon-arm staging wrapper; never rewrites knight.py.

Same CLI as knight.py:
  blender --threads 4 --background --python face_bake.py -- OUT CELL sheet|hero JOBS LAYERS
Example layers: base,mask,metal,armfreeBase,armfreeMask,armfreeMetal
Each helmet uses its own bright-face placement. sheet.json includes rig version1,
weaponArm sockets in actual output-cell pixels, top-left origin, per-frame order.
"""
import os
import sys

HERE=os.path.dirname(os.path.abspath(__file__))
ORIGINAL=os.path.join(HERE,'knight.py')
sys.path.insert(0,HERE)
with open(ORIGINAL,encoding='utf-8') as handle:source=handle.read()

def replace_once(old,new):
    global source
    if source.count(old)!=1:
        raise RuntimeError('Original generator changed; staging patch requires review: '+old[:80])
    source=source.replace(old,new,1)

replace_once('show(DEFAULT)\n', 'show(DEFAULT)\nfrom face_review import apply_all_faces\napply_all_faces(globals(), "bright")\n')
replace_once("else ('base', 'mask', 'metal')", "else ('base', 'mask', 'metal', 'armfreeBase', 'armfreeMask', 'armfreeMetal')")
replace_once('    def at(name, x, y, z): bpy.data.objects[name].location = (x, y, z)', '''    def at(name, x, y, z):
        obj = bpy.data.objects[name]
        if name in ('glove1', 'cuff1'):
            # Primitive creation baked its original position into mesh coordinates.
            # Block targets describe the visible centre, not an additional offset.
            center = sum((Vector(p) for p in obj.bound_box), Vector()) / 8
            scaled = Vector((center.x * obj.scale.x, center.y * obj.scale.y, center.z * obj.scale.z))
            obj.location = Vector((x, y, z)) - obj.rotation_euler.to_matrix() @ scaled
        else:
            obj.location = (x, y, z)''')
replace_once('        for idx, (di, dn, an, k) in enumerate(frames):', '''        selected_frames = os.environ.get('CK_FRAME_FILTER', '')
        selected_frames = {int(v) for v in selected_frames.split(',') if v.strip()} if selected_frames else None
        if selected_frames is not None and any(v < 0 or v >= len(frames) for v in selected_frames):
            raise ValueError('CK_FRAME_FILTER contains an out-of-range absolute frame index')
        for idx, (di, dn, an, k) in enumerate(frames):''')
replace_once('    def render_all(prefix, layers, solo=()):', '''    from bpy_extras.object_utils import world_to_camera_view
    weapon_arm_sockets = []
    def projected_socket(point):
        v = world_to_camera_view(sc, co, point)
        return [round(v.x * CELL, 4), round((1 - v.y) * CELL, 4)]
    def object_center(name):
        obj = bpy.data.objects[name]
        center = sum((Vector(p) for p in obj.bound_box), Vector()) / 8
        return obj.matrix_world @ center
    def render_all(prefix, layers, solo=()):''')
replace_once("            CP.rotation_euler = (CAPE[an][k], 0, 0)\n            for fname, kind in layers:", '''            CP.rotation_euler = (CAPE[an][k], 0, 0)
            bpy.context.view_layer.update()
            if idx >= len(weapon_arm_sockets):
                weapon_arm_sockets.append({
                    'shoulder': projected_socket(ROOT.matrix_world @ Vector((-.47, 0, 1.0))),
                    'elbow': projected_socket(object_center('arm-1')),
                    'grip': projected_socket(object_center('glove-1')),
                    'behind': di in (3, 4)})
            if selected_frames is not None and idx not in selected_frames:
                continue
            for fname, kind in layers:
                armfree = kind.startswith('armfree')
                for arm_name in ('arm-1', 'cuff-1', 'glove-1'):
                    bpy.data.objects[arm_name].hide_render = armfree
                kind = {'armfreeBase': 'base', 'armfreeMask': 'mask', 'armfreeMetal': 'metal'}.get(kind, kind)''')
replace_once("                set_layer(kind, solo); sc.render.filepath = os.path.join(OUT, f'{prefix}_{fname}_{idx:03d}.png'); bpy.ops.render.render(write_still=True)", "                set_layer(kind, solo); sc.render.filepath = os.path.join(OUT, f'{prefix}_{fname}_{idx:03d}.png'); bpy.ops.render.render(write_still=True)\n                for arm_name in ('arm-1', 'cuff-1', 'glove-1'): bpy.data.objects[arm_name].hide_render = False")
replace_once("'frames': [[di, an, k] for di, dn, an, k in frames]", "'frames': [[di, an, k] for di, dn, an, k in frames], 'faceRevision': 'bright-v1-all-six', 'rig': {'version': 1, 'weaponArm': weapon_arm_sockets}")

namespace={'__name__':'knight_face_bake','__file__':ORIGINAL}
exec(compile(source,ORIGINAL+' [face staging]', 'exec'),namespace)
