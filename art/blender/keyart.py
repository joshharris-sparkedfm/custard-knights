"""
Custard Knights home-screen key art: a toon-rendered castle scene the live knights stand in front of.
Run: blender --background --python keyart.py -- <out.png> [width] [height]
Built procedurally like knight.py (cel ramps, inked outlines), so it matches the knights and needs no AI imagery.
The sky is left transparent; keyart_finish.py paints the sky gradient and exports WebP.
"""
import bpy, bmesh, math, os, sys, random
from mathutils import Euler

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'keyart.png')
WID = int(argv[1]) if len(argv) > 1 else 1920
HEI = int(argv[2]) if len(argv) > 2 else 1080
random.seed(7)

def hexs(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def lin(c): return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)
PAL = {
 'stone':   ('#C9C2E0', '#8C83B0', '#EDE8FA'),
 'stone2':  ('#A99FCB', '#6E6496', '#CFC7EA'),
 'red':     ('#E8392F', '#A61E2A', '#FF7A5C'),
 'teal':    ('#2EC4B6', '#1C8A80', '#7FE6DC'),
 'purple':  ('#9B7BFF', '#6647C9', '#C9B8FF'),
 'yellow':  ('#FFD23F', '#D99A1E', '#FFF1A8'),
 'custard': ('#FFD34E', '#E0901C', '#FFF4BE'),
 'crust':   ('#E9A94A', '#A8661E', '#FFD58A'),
 'grass':   ('#7ED36B', '#4E9E45', '#B6EE93'),
 'grass2':  ('#5FB85A', '#3C8440', '#93DA7E'),
 'hill':    ('#9BDB86', '#6BB067', '#C9F1B0'),
 'wood':    ('#B0784A', '#74482A', '#D9A374'),
 'dark':    ('#2A1C45', '#1A1030', '#3C2A60'),
 'cream':   ('#FFF4D6', '#E0C99A', '#FFFFFF'),
 'cloud':   ('#FFFFFF', '#DCE4F7', '#FFFFFF'),
 'leaf':    ('#52B55A', '#2F7F44', '#8BDE7E'),
 'pink':    ('#FF8FB1', '#D0567E', '#FFC2D4'),
}
INK = hexs('#1A1030')

bpy.ops.wm.read_homefile(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'; sc.render.resolution_x = WID; sc.render.resolution_y = HEI
sc.render.film_transparent = True; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try:
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.eevee.taa_render_samples = 32
except Exception:
    pass
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.6, 0.62, 0.7, 1); world.node_tree.nodes['Background'].inputs[1].default_value = .35

def toon(name, key, split=.45, hi_at=.9):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); dif = N.new('ShaderNodeBsdfDiffuse'); s2r = N.new('ShaderNodeShaderToRGB'); ramp = N.new('ShaderNodeValToRGB'); em = N.new('ShaderNodeEmission')
    r = ramp.color_ramp; r.interpolation = 'CONSTANT'; col, sh, hi = (lin(hexs(x)) for x in PAL[key])
    r.elements[0].position = 0; r.elements[0].color = (*sh, 1); r.elements[1].position = split; r.elements[1].color = (*col, 1); e3 = r.elements.new(hi_at); e3.color = (*hi, 1)
    L.new(dif.outputs[0], s2r.inputs[0]); L.new(s2r.outputs['Color'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], em.inputs['Color']); L.new(em.outputs[0], out.inputs['Surface'])
    return m
INKM = bpy.data.materials.new('ink'); INKM.use_nodes = True
for n in list(INKM.node_tree.nodes): INKM.node_tree.nodes.remove(n)
_o = INKM.node_tree.nodes.new('ShaderNodeOutputMaterial'); _e = INKM.node_tree.nodes.new('ShaderNodeEmission'); _e.inputs['Color'].default_value = (*lin(INK), 1)
INKM.node_tree.links.new(_e.outputs[0], _o.inputs['Surface']); INKM.use_backface_culling = True
M = {k: toon(k, k) for k in PAL}

def finish(ob, mat, outline=.06, sub=1, smooth=True):
    ob.data.materials.clear(); ob.data.materials.append(mat)
    if smooth:
        for p in ob.data.polygons: p.use_smooth = True
    if sub:
        m = ob.modifiers.new('sub', 'SUBSURF'); m.levels = sub; m.render_levels = sub
    if outline:
        ob.data.materials.append(INKM); so = ob.modifiers.new('ink', 'SOLIDIFY'); so.thickness = -outline; so.use_flip_normals = True; so.material_offset = 1; so.offset = 1; so.use_rim = False
    return ob
def box(loc, size, mat, bevel=.08, **kw):
    bpy.ops.mesh.primitive_cube_add(location=loc); ob = bpy.context.object; ob.scale = (size[0] / 2, size[1] / 2, size[2] / 2); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = ob.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = 2; b.limit_method = 'NONE'
    kw.setdefault('sub', 0); kw.setdefault('smooth', False); return finish(ob, mat, **kw)
def ball(loc, scl, mat, **kw):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, segments=32, ring_count=16); ob = bpy.context.object; ob.scale = scl; bpy.ops.object.transform_apply(scale=True); return finish(ob, mat, **kw)
def tube(loc, r, h, mat, r2=None, verts=40, **kw):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=(loc[0], loc[1], loc[2] + h / 2))
    else: bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=h, location=(loc[0], loc[1], loc[2] + h / 2))
    kw.setdefault('sub', 0); kw.setdefault('smooth', True); return finish(bpy.context.object, mat, **kw)
def lathe(loc, prof, mat, steps=48, **kw):
    me = bpy.data.meshes.new('lathe'); bm = bmesh.new(); rings = []
    for i in range(steps):
        a = 2 * math.pi * i / steps; rings.append([bm.verts.new((loc[0] + math.cos(a) * r, loc[1] + math.sin(a) * r, loc[2] + z)) for r, z in prof])
    for i in range(steps):
        A, B = rings[i], rings[(i + 1) % steps]
        for j in range(len(prof) - 1): bm.faces.new((A[j], A[j + 1], B[j + 1], B[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('lathe', me); sc.collection.objects.link(ob)
    return finish(ob, mat, **kw)
def blobs(name, elems, mat, outline=.05, res=.12):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res * .6; mb.threshold = .5
    ob = bpy.data.objects.new(name, mb); sc.collection.objects.link(ob)
    for (x, y, z), r in elems: e = mb.elements.new(); e.co = (x, y, z); e.radius = r
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.convert(target='MESH'); ob = bpy.context.object; ob.data.materials.clear()
    return finish(ob, mat, outline=outline, sub=0)

# ------------------------------------------------------------------ ground and hills
bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 60, 0)); finish(bpy.context.object, M['grass'], outline=0, sub=0)
for (x, y, sx, sy, sz, m) in [(-40, 95, 45, 22, 16, 'hill'), (35, 110, 55, 25, 22, 'hill'), (80, 85, 35, 18, 12, 'grass2'), (-75, 70, 30, 16, 10, 'grass2'), (5, 140, 70, 30, 30, 'hill')]:
    ball((x, y, 0), (sx, sy, sz), M[m], outline=.25, sub=1)
# lollipop trees on the hills and by the castle
def tree(x, y, z, s=1.0, m='leaf'):
    tube((x, y, z), .35 * s, 2.2 * s, M['wood'], outline=.08 * s)
    ball((x, y, z + 3.1 * s), (1.6 * s, 1.6 * s, 1.7 * s), M[m], outline=.12 * s)
for (x, y, z, s) in [(-30, 80, 9, 2.2), (-50, 88, 7, 2.6), (45, 95, 14, 2.4), (62, 88, 9, 2.0), (-18, 34, 0, 1.5), (26, 36, 0, 1.3), (-26, 44, 0, 1.8), (34, 50, 0, 1.7)]: tree(x, y, z, s)

# ------------------------------------------------------------------ castle
CX, CY = 6, 42
def crenels(x0, x1, y, z, depth=1.6, step=1.6, mat='stone'):
    n = int((x1 - x0) / step)
    for i in range(n + 1):
        if i % 2 == 0: box((x0 + i * step, y, z + .5), (step * .9, depth, 1.0), M[mat], outline=.05)
def tower(x, y, r, h, roof):
    tube((x, y, 0), r, h, M['stone'], outline=.08)
    tube((x, y, h), r * 1.12, .7, M['stone2'], outline=.07)
    for i in range(10):
        a = i / 10 * 2 * math.pi
        if i % 2 == 0: box((x + math.cos(a) * r * 1.02, y + math.sin(a) * r * 1.02, h + 1.05), (r * .45, r * .45, .8), M['stone2'], outline=.05)
    tube((x, y, h + .7), r * 1.18, r * 2.4, M[roof], r2=.02, outline=.09)
    # windows
    for zz in (h * .45, h * .72): box((x, y - r * .98, zz), (.6, .3, 1.1), M['dark'], outline=.04, bevel=.2)
    # flag on top
    tube((x, y, h + .7 + r * 2.4), .06, 2.2, M['wood'], outline=.03)
    me = bpy.data.meshes.new('flag'); bm = bmesh.new(); z0 = h + .7 + r * 2.4 + 1.3
    v = [bm.verts.new(p) for p in [(x, y, z0 + .9), (x + 1.9, y - .1, z0 + .5), (x, y, z0)]]; bm.faces.new(v); bm.to_mesh(me); bm.free()
    fo = bpy.data.objects.new('flag', me); sc.collection.objects.link(fo); t = fo.modifiers.new('t', 'SOLIDIFY'); t.thickness = .08; finish(fo, M[roof], outline=.04, sub=0, smooth=False)
# curtain wall with gate
box((CX, CY, 3), (26, 2.4, 6), M['stone'], outline=.08)
crenels(CX - 12.6, CX + 12.6, CY - .1, 6)
box((CX, CY - 1.25, 2.1), (4.2, .4, 4.2), M['dark'], outline=.06, bevel=.6)       # gate
for i in range(5): box((CX - 1.6 + i * .8, CY - 1.5, 2.3), (.18, .2, 4.4), M['wood'], outline=.03)   # portcullis
# keep behind the wall
box((CX + 1, CY + 6, 7), (11, 8, 14), M['stone2'], outline=.09)
crenels(CX - 4.2, CX + 6.2, CY + 1.9, 14, mat='stone2')
for (dx, zz) in [(-2.5, 8), (1, 10.5), (4.5, 8)]: box((CX + dx, CY + 1.9, zz), (.8, .3, 1.5), M['dark'], outline=.04, bevel=.25)
tower(CX - 13, CY, 2.3, 10, 'red'); tower(CX + 13, CY, 2.3, 10, 'teal'); tower(CX + 1, CY + 8, 2.0, 18, 'purple'); tower(CX - 6, CY + 9, 1.6, 13, 'yellow'); tower(CX + 8, CY + 9, 1.6, 12, 'red')
# banners on the wall
for i, m in enumerate(['red', 'teal', 'yellow', 'purple']):
    x = CX - 9 + i * 6 + (1.5 if i >= 2 else 0)
    me = bpy.data.meshes.new('banner'); bm = bmesh.new(); y = CY - 1.3
    v = [bm.verts.new(p) for p in [(x - .9, y, 5.6), (x + .9, y, 5.6), (x + .9, y, 2.4), (x, y, 1.8), (x - .9, y, 2.4)]]; bm.faces.new(v); bm.to_mesh(me); bm.free()
    bo = bpy.data.objects.new('banner', me); sc.collection.objects.link(bo); t = bo.modifiers.new('t', 'SOLIDIFY'); t.thickness = .1; finish(bo, M[m], outline=.05, sub=0, smooth=False)
    ball((x, y - .12, 3.9), (.42, .08, .42), M['cream'], outline=.03)

# ------------------------------------------------------------------ the giant pie on the keep, custard pouring down into the moat
PX, PY, PZ = CX + 1, CY + 5, 14.2
lathe((PX, PY, PZ), [(.1, 0), (4.6, .1), (5.4, 1.6), (5.6, 2.2), (5.0, 2.3), (4.6, 1.9)], M['crust'], outline=.1, sub=1)
blobs('pietop', [((PX + math.cos(a) * rr, PY + math.sin(a) * rr, PZ + 2.0 + .3 * math.sin(a * 3)), .9 + .3 * math.sin(a * 5)) for rr in (0, 2.2, 3.8) for a in [i * .6 for i in range(11)]] + [((PX, PY, PZ + 3.4), 2.6), ((PX + .4, PY, PZ + 5.0), 1.6), ((PX, PY, PZ + 6.1), .8)], M['custard'], outline=.08, res=.25)
# waterfall: a fat stream from the pie rim down the wall face into the moat, with drips beside it
fall = []
for k in range(40):
    u = k / 39; z = PZ + 1.6 - u * (PZ + 1.2); y = CY + 1.4 - u * 3.8 - .8 * math.sin(u * 3.1)
    fall.append(((PX - 1.2 + .5 * math.sin(u * 9), y, z), 1.8 + .6 * u))
for dx in (-3.2, 3.4):
    for k in range(12): u = k / 11; fall.append(((PX + dx, CY + 1.4 - u * 1.2, PZ + 1.4 - u * 5.5), .55 - .3 * u))
blobs('waterfall', fall, M['custard'], outline=.08, res=.25)
# moat of custard across the front of the castle, with a wooden bridge to the gate
moat = [((x, CY - 6 + math.sin(x * .7) * .8, -.3), 2.6 + .6 * math.sin(x * 1.3)) for x in [CX - 22 + i * 1.6 for i in range(28)]]
moat += [((PX - 1.2 + dx, CY - 3.5, -.2), 3.2) for dx in (-2, 0, 2)]
blobs('moat', moat, M['custard'], outline=.07, res=.3)
box((CX, CY - 6, .55), (4.2, 9, .35), M['wood'], outline=.05)
for i in range(7): box((CX, CY - 9.6 + i * 1.2, .8), (4.4, .25, .12), M['wood'], outline=.02)

# ------------------------------------------------------------------ bunting between the front towers
def bunting(p0, p1, sag, n, cols):
    for i in range(n):
        u = (i + .5) / n; x = p0[0] + (p1[0] - p0[0]) * u; y = p0[1] + (p1[1] - p0[1]) * u; z = p0[2] + (p1[2] - p0[2]) * u - sag * 4 * u * (1 - u)
        me = bpy.data.meshes.new('pennant'); bm = bmesh.new(); v = [bm.verts.new(p) for p in [(x - .45, y, z), (x + .45, y, z), (x, y, z - 1.0)]]; bm.faces.new(v); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new('pennant', me); sc.collection.objects.link(o); t = o.modifiers.new('t', 'SOLIDIFY'); t.thickness = .06; finish(o, M[cols[i % len(cols)]], outline=.035, sub=0, smooth=False)
bunting((CX - 13, CY - 2.2, 11), (CX + 13, CY - 2.2, 11), 3.2, 17, ['red', 'yellow', 'teal', 'purple', 'pink'])

# ------------------------------------------------------------------ foreground: grassy knoll the knights stand on, crates and pies
blobs('knoll', [((x, 6 + math.cos(x * .4) * 1.5, -1.2), 3.6 + math.sin(x * .9) * .8) for x in [-30 + i * 2.2 for i in range(28)]], M['grass2'], outline=.08, res=.35)
for (x, y) in [(-15, 14), (-12.8, 15.5), (17, 13)]:
    box((x, y, .9), (1.8, 1.8, 1.8), M['wood'], outline=.06)
    for dz in (.35, 1.45): box((x, y - .92, dz), (1.9, .1, .18), M['wood'], outline=.02)
for (x, y) in [(-9, 11), (13, 10.5)]:
    lathe((x, y, 0), [(.05, 0), (1.1, .05), (1.3, .5), (1.2, .6)], M['crust'], outline=.06)
    blobs('minipie', [((x, y, .6), .9), ((x + .3, y, .9), .5)], M['custard'], outline=.05, res=.12)

# ------------------------------------------------------------------ clouds
for (x, y, z, s) in [(-38, 150, 38, 1.4), (-8, 170, 52, 1.8), (40, 160, 44, 1.6), (70, 140, 30, 1.2), (-70, 130, 26, 1.1)]:
    blobs('cloud', [((x + dx * s, y, z + dz * s), r * s) for dx, dz, r in [(0, 0, 5), (5, -1, 4), (-5, -1, 4), (2.5, 2.5, 3.8), (-2.5, 2, 3.5), (8.5, -2, 2.8), (-8.5, -2, 2.8)]], M['cloud'], outline=.18, res=.9)

# ------------------------------------------------------------------ light and camera
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.4; sun.angle = .1
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so); so.rotation_euler = Euler((math.radians(52), math.radians(-18), math.radians(-40)))
try: sun.use_shadow = False   # flat cel look, and no shadow grain
except Exception: pass
cam = bpy.data.cameras.new('cam'); cam.lens = 33
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (-7.5, -17, 5.6); co.rotation_euler = Euler((math.radians(87.5), 0, math.radians(-4)))
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('KEYART_OK', OUT)
