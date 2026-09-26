"""
Custard Knights hero knight, built procedurally in Blender and toon-rendered to sprites.
Run: blender --background --python knight.py -- <out_dir> [size] [mode]
  mode = turnaround (8 directions, idle) | parts (layers per part, later)
Design reference: art/concepts/styles/style_castlecrashers_11/12.png (chunky chibi, big helm, visor band,
round team-colour pauldrons, star tabard, belt, boots, custard crown with drips, red plume).
Units: the knight stands about 2.1 tall. Team colour lives on tabard, pauldrons and shield face.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
SIZE = int(argv[1]) if len(argv) > 1 else 512
MODE = argv[2] if len(argv) > 2 else 'turnaround'
os.makedirs(OUT, exist_ok=True)

def hexs(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def lin(c): return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)
# palette in sRGB: base, shadow, highlight (hand-picked like a cel animator would, not computed)
PAL = {
 'team':    ('#E8392F', '#A61E2A', '#FF7A5C'),
 'steel':   ('#B9C2D3', '#6E7894', '#EEF2FA'),
 'visor':   ('#8F9AB2', '#566079', '#C9D2E4'),
 'mail':    ('#6F7890', '#474E63', '#9AA3BC'),
 'leather': ('#8A5234', '#57301E', '#B8784E'),
 'custard': ('#FFD34E', '#E0901C', '#FFF4BE'),
 'cream':   ('#FFF4D6', '#E0C99A', '#FFFFFF'),
 'gold':    ('#F2B632', '#B87712', '#FFE78A'),
 'plume':   ('#E8392F', '#8E1A26', '#FF8A6E'),
}
DARK = hexs('#1B1030'); INK = hexs('#1A1030')

# ------------------------------------------------------------------ scene
bpy.ops.wm.read_homefile(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x = sc.render.resolution_y = SIZE
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
try:
    sc.view_settings.view_transform = 'Standard'   # flat colours, no filmic wash
    sc.view_settings.look = 'None'
except Exception:
    pass
try:
    sc.eevee.taa_render_samples = 16
except Exception:
    pass
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.55, 0.55, 0.6, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.35

# ------------------------------------------------------------------ materials
def toon(name, key, split=0.45, hi_at=0.9):
    """3-band cel shader: Diffuse -> Shader to RGB -> constant ramp (shadow, base, highlight) -> Emission."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); dif = N.new('ShaderNodeBsdfDiffuse'); s2r = N.new('ShaderNodeShaderToRGB')
    ramp = N.new('ShaderNodeValToRGB'); em = N.new('ShaderNodeEmission')
    dif.inputs['Color'].default_value = (1, 1, 1, 1)
    r = ramp.color_ramp; r.interpolation = 'CONSTANT'
    col, sh, hi = (lin(hexs(x)) for x in PAL[key])
    r.elements[0].position = 0.0; r.elements[0].color = (*sh, 1)
    r.elements[1].position = split; r.elements[1].color = (*col, 1)
    e3 = r.elements.new(hi_at); e3.color = (*hi, 1)
    L.new(dif.outputs[0], s2r.inputs[0]); L.new(s2r.outputs['Color'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], em.inputs['Color'])
    em.inputs['Strength'].default_value = 1.0; L.new(em.outputs[0], out.inputs['Surface'])
    return m

def flat(name, col):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*lin(col), 1)
    nt.links.new(em.outputs[0], out.inputs['Surface']); return m

INKM = flat('ink', INK); INKM.use_backface_culling = True
try:
    INKM.use_backface_culling_shadow = True
except Exception:
    pass
M = {k: toon(k, k) for k in PAL}
M['dark'] = flat('dark', DARK); M['eyew'] = flat('eyew', (1, 1, 1)); M['pupil'] = flat('pupil', (0.06, 0.04, 0.12))

# ------------------------------------------------------------------ building blocks
ROOT = bpy.data.objects.new('knight', None); sc.collection.objects.link(ROOT)

def finish(ob, mat, outline=0.034, smooth=True, sub=2, parent=ROOT):
    ob.data.materials.clear(); ob.data.materials.append(mat)
    if smooth:
        for p in ob.data.polygons: p.use_smooth = True
    if sub:
        m = ob.modifiers.new('sub', 'SUBSURF'); m.levels = sub; m.render_levels = sub
    if outline:
        ob.data.materials.append(INKM)
        so = ob.modifiers.new('ink', 'SOLIDIFY'); so.thickness = -outline; so.use_flip_normals = True; so.material_offset = 1; so.offset = 1
        so.use_rim = False
    ob.parent = parent
    return ob

def cube(name, loc, scale, mat, bevel=0.3, **kw):
    bpy.ops.mesh.primitive_cube_add(location=loc); ob = bpy.context.object; ob.name = name; ob.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = ob.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = 3; b.limit_method = 'NONE'
    return finish(ob, mat, **kw)

def sphere(name, loc, scale, mat, **kw):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, segments=32, ring_count=16); ob = bpy.context.object; ob.name = name; ob.scale = scale
    bpy.ops.object.transform_apply(scale=True); kw.setdefault('sub', 1); return finish(ob, mat, **kw)

def cyl(name, loc, r, depth, mat, rot=(0, 0, 0), r2=None, verts=32, **kw):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot)
    ob = bpy.context.object; ob.name = name; kw.setdefault('sub', 1); return finish(ob, mat, **kw)

def lathe(name, prof, mat, loc=(0, 0, 0), steps=48, sub=1, outline=None, scale=(1, 1, 1), parent=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = []
    for i in range(steps):
        a = 2 * math.pi * i / steps
        rings.append([bm.verts.new((math.cos(a) * r, math.sin(a) * r, z)) for r, z in prof])
    for i in range(steps):
        A, B = rings[i], rings[(i + 1) % steps]
        for j in range(len(prof) - 1):
            bm.faces.new((A[j], A[j + 1], B[j + 1], B[j]))
    bottom = [rg[0] for rg in rings]; top = [rg[-1] for rg in rings]
    if prof[0][0] > 1e-4: bm.faces.new(list(reversed(bottom)))
    if prof[-1][0] > 1e-4: bm.faces.new(top)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = loc; ob.scale = scale
    kw = dict(sub=sub, parent=parent or ROOT)
    if outline is not None: kw['outline'] = outline
    return finish(ob, mat, **kw)

# ------------------------------------------------------------------ the knight (faces -Y, i.e. towards a camera looking along +Y)
# boots and legs
for sx in (-1, 1):
    cube(f'boot{sx}', (sx * .22, -.07, .1), (.16, .26, .11), M['leather'], bevel=.09)
    lathe(f'bootcuff{sx}', [(0, .16), (.15, .16), (.16, .3), (0, .31)], M['leather'], loc=(sx * .22, 0, 0))
    cyl(f'leg{sx}', (sx * .2, 0, .36), .1, .16, M['mail'])
# body: barrel of mail, tabard over it
lathe('body', [(0, .36), (.34, .37), (.4, .5), (.41, .8), (.36, 1.02), (0, 1.08)], M['mail'])
lathe('tabard', [(.5, .37), (.48, .4), (.44, .52), (.44, .8), (.4, .98), (.3, 1.04)], M['team'])
cyl('belt', (0, 0, .5), .455, .09, M['leather'], sub=0)
cube('buckle', (0, -.44, .5), (.07, .03, .06), M['gold'], bevel=.02, outline=.012, sub=0)
# star emblem on the chest
bpy.ops.mesh.primitive_circle_add(vertices=10, radius=.14, location=(0, -.43, .78), rotation=(math.pi / 2, 0, 0), fill_type='NGON')
star = bpy.context.object; star.name = 'star'
bm = bmesh.new(); bm.from_mesh(star.data)
for i, v in enumerate(bm.verts):
    if i % 2: v.co *= .45
bm.to_mesh(star.data); bm.free()
star.data.materials.append(M['cream']); star.parent = ROOT
so = star.modifiers.new('thick', 'SOLIDIFY'); so.thickness = .02
# pauldrons
for sx in (-1, 1):
    sphere(f'pauldron{sx}', (sx * .47, 0, 1.0), (.28, .3, .22), M['team'])
# arms and gloves
for sx in (-1, 1):
    cyl(f'arm{sx}', (sx * .54, -.06, .8), .12, .36, M['mail'], rot=(0, sx * .35, 0))
    lathe(f'cuff{sx}', [(.0, 0), (.15, .0), (.18, .1), (.16, .16), (0, .17)], M['leather'], loc=(sx * .6, -.12, .6))
    sphere(f'glove{sx}', (sx * .62, -.15, .56), (.17, .17, .15), M['leather'])
# helm: the big silhouette
HC, HR = 1.52, .565
helm = lathe('helm', [(0, 1.05), (.5, 1.07), (.56, 1.2), (.575, 1.45), (.56, 1.66), (.5, 1.82), (.36, 1.96), (.18, 2.03), (0, 2.05)], M['steel'])
vb = lathe('visorband', [(.585, 1.5), (.605, 1.52), (.605, 1.66), (.585, 1.68)], M['visor'], sub=0, outline=.026)
# dark face opening below the band, the eyes sit inside it
face = lathe('face', [(.001, 1.26), (.22, 1.27), (.27, 1.39), (.23, 1.5), (.001, 1.51)], M['dark'], loc=(0, -.52, 0), scale=(1.25, .32, 1), sub=1, outline=.022)
for i in range(5):
    x = (i - 2) * .14
    cube(f'slot{i}', (x, -.6, 1.59), (.035, .04, .05), M['dark'], bevel=.015, outline=0, sub=0)
for sx in (-1, 1):
    sphere(f'eye{sx}', (sx * .14, -.61, 1.39), (.11, .02, .12), M['eyew'], outline=0, sub=0)
    sphere(f'pupil{sx}', (sx * .14 + .025, -.628, 1.38), (.064, .01, .078), M['pupil'], outline=0, sub=0)
    sphere(f'glint{sx}', (sx * .14 - .005, -.636, 1.43), (.026, .006, .026), M['eyew'], outline=0, sub=0)
cube('chin', (0, -.5, 1.17), (.36, .1, .1), M['steel'], bevel=.08, sub=1)
cyl('ridge', (0, -.02, 1.86), .045, .6, M['steel'], rot=(math.pi / 2, 0, 0), sub=0, outline=.016)
for sx in (-1, 1):
    sphere(f'rivet{sx}', (sx * .6, -.05, 1.58), (.09, .06, .09), M['visor'], outline=.02)
# custard crown: metaballs so it melts together, with drips
mb = bpy.data.metaballs.new('custard'); mb.resolution = .03; mb.render_resolution = .02; mb.threshold = .5
cr = bpy.data.objects.new('custard', mb); sc.collection.objects.link(cr); cr.parent = ROOT
for loc, rad in [((0, 0, 1.98), .44), ((.18, .08, 2.02), .3), ((-.17, -.06, 2.01), .3), ((0, 0, 2.2), .27), ((.04, .02, 2.36), .17), ((-.02, 0, 2.48), .09)]:
    e = mb.elements.new(); e.co = loc; e.radius = rad
import math as _m
for ang, L in [(-2.35, .5), (-1.8, .72), (-1.3, .46), (-.7, .62), (.2, .4), (2.55, .5), (1.5, .36)]:
    n = 12
    for k in range(n):
        u = k / (n - 1)
        el = _m.radians(62) - u * L * 1.25          # elevation angle on the helm, from near the top downwards
        rr = HR + .015
        x, y, z = _m.cos(ang) * _m.cos(el) * rr, _m.sin(ang) * _m.cos(el) * rr, HC + _m.sin(el) * rr
        rad = .085 - .02 * u + (.035 if k == n - 1 else 0)
        e = mb.elements.new(); e.co = (x, y, z); e.radius = rad
cr.data.materials.append(M['custard'])
bpy.context.view_layer.objects.active = cr; cr.select_set(True)
bpy.ops.object.convert(target='MESH'); cr = bpy.context.object; cr.parent = ROOT
cr.data.materials.clear(); finish(cr, M['custard'], sub=0, parent=ROOT)
# plume: three curved feathers from the back of the helm
for i, (ang, L) in enumerate([(-.42, .95), (-.14, 1.15), (.14, 1.1), (.42, .9)]):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=(0, 0, 0))
    f = bpy.context.object; f.name = f'feather{i}'
    f.scale = (.16, .07, L / 2); bpy.ops.object.transform_apply(scale=True)
    sw = f.modifiers.new('bend', 'SIMPLE_DEFORM'); sw.deform_method = 'BEND'; sw.angle = 1.2; sw.deform_axis = 'X'
    f.location = (ang * .45, .42, 2.0 + L * .35); f.rotation_euler = (-.85, ang * .8, 0)
    finish(f, M['plume'], sub=1)
# sword in the right hand (knight's right is +X from its own view; it faces -Y, so its right is -X)
sw = bpy.data.objects.new('sword', None); sc.collection.objects.link(sw); sw.parent = ROOT; sw.location = (-.66, -.24, .6); sw.rotation_euler = (.28, .2, 0); sw.scale = (1.15, 1.15, 1.15)
cube('blade', (0, 0, .68), (.1, .03, .55), M['steel'], bevel=.03, outline=.024, sub=0, parent=sw)
cube('guard', (0, 0, .12), (.26, .06, .06), M['gold'], bevel=.04, outline=.022, sub=0, parent=sw)
cyl('grip', (0, 0, -.06), .04, .2, M['leather'], sub=0, outline=.012, parent=sw)
sphere('pommel', (0, 0, -.18), (.06, .06, .06), M['gold'], outline=.012, parent=sw)
# heater shield on the left arm
sh = bpy.data.objects.new('shield', None); sc.collection.objects.link(sh); sh.parent = ROOT; sh.location = (.72, -.28, .72); sh.rotation_euler = (0, 0, -.55); sh.scale = (1.35, 1.35, 1.35)
bpy.ops.mesh.primitive_plane_add(size=1); sp = bpy.context.object; sp.name = 'shieldface'
bm = bmesh.new(); bm.from_mesh(sp.data); bm.clear() if False else None
sp.data.clear_geometry()
pts = [(-.28, .32), (.28, .32), (.3, .05), (.18, -.22), (0, -.36), (-.18, -.22), (-.3, .05)]
bm2 = bmesh.new(); vs = [bm2.verts.new((x, 0, z)) for x, z in pts]; bm2.faces.new(vs); bm2.to_mesh(sp.data); bm2.free()
sp.parent = sh; so = sp.modifiers.new('thick', 'SOLIDIFY'); so.thickness = .1
finish(sp, M['team'], sub=1, parent=sh)
rim = sp.copy(); rim.data = sp.data.copy(); sc.collection.objects.link(rim); rim.parent = sh; rim.scale = (1.12, 1, 1.12); rim.location = (0, .03, -.005)
rim.data.materials.clear(); rim.data.materials.append(M['steel']); rim.data.materials.append(INKM)
bpy.ops.mesh.primitive_circle_add(vertices=10, radius=.13, location=(0, -.07, .04), rotation=(math.pi / 2, 0, 0), fill_type='NGON')
st2 = bpy.context.object
bm3 = bmesh.new(); bm3.from_mesh(st2.data)
for i, v in enumerate(bm3.verts):
    if i % 2: v.co *= .45
bm3.to_mesh(st2.data); bm3.free(); st2.parent = sh; st2.data.materials.append(M['cream'])


# ------------------------------------------------------------------ light and camera
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.2; sun.angle = .05
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so); so.rotation_euler = Euler((math.radians(50), math.radians(-25), math.radians(-35)))
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = 3.4
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
ELEV = math.radians(32)   # 3/4 top-down, matches the game's view
D = 10
co.location = (0, -D * math.cos(ELEV), 1.1 + D * math.sin(ELEV)); co.rotation_euler = Euler((math.pi / 2 - ELEV, 0, 0))

# ------------------------------------------------------------------ render
if MODE == 'turnaround':
    names = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']
    for i, n in enumerate(names):
        ROOT.rotation_euler = (0, 0, math.radians(i * 45))
        sc.render.filepath = os.path.join(OUT, f'dir_{i}_{n}.png')
        bpy.ops.render.render(write_still=True)
    print('KNIGHT_OK', OUT)

# ------------------------------------------------------------------ sprite sheet: 5 directions x (idle 2, walk 6, swing 4), two layers
# base layer: everything, with team-coloured parts in a white/grey cel ramp; mask layer: team parts white, everything else a holdout.
# The game multiplies the player's colour onto the base through the mask, so one sheet serves every colour.
if MODE == 'sheet':
    import json
    CELL = SIZE
    cam.ortho_scale = 4.6
    co.location = (0, -D * math.cos(ELEV), 1.45 + D * math.sin(ELEV))
    def flatmat(name, col):
        m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes
        for n in list(N): N.remove(n)
        o = N.new('ShaderNodeOutputMaterial'); e = N.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*col, 1); m.node_tree.links.new(e.outputs[0], o.inputs['Surface']); return m
    hold = bpy.data.materials.new('holdout'); hold.use_nodes = True; N = hold.node_tree.nodes
    for n in list(N): N.remove(n)
    o = N.new('ShaderNodeOutputMaterial'); h = N.new('ShaderNodeHoldout'); hold.node_tree.links.new(h.outputs[0], o.inputs['Surface'])
    white = flatmat('maskwhite', (1, 1, 1))
    holdc = hold.copy(); holdc.name = 'holdout_cull'; holdc.use_backface_culling = True   # outline shells must stay see-through from inside
    PAL['tgrey'] = ('#FFFFFF', '#9C9C9C', '#FFFFFF'); tgrey = toon('tgrey', 'tgrey', split=.45, hi_at=.99)
    TEAMS = {M['team'].name, M['plume'].name}
    objs = [o for o in bpy.data.objects if o.type == 'MESH']
    orig = {o.name: [sl.material for sl in o.material_slots] for o in objs}
    def set_layer(layer):
        for ob in objs:
            for i, sl in enumerate(ob.material_slots):
                m = orig[ob.name][i]
                if layer == 'base': sl.material = tgrey if m and m.name in TEAMS else m
                else: sl.material = white if m and m.name in TEAMS else (holdc if m and m.name == INKM.name else hold)
    P = {o.name: (o.location.copy(), o.rotation_euler.copy()) for o in bpy.data.objects}
    def reset():
        for n, (l, r) in P.items(): o = bpy.data.objects[n]; o.location = l.copy(); o.rotation_euler = r.copy()
    def mv(name, dx=0, dy=0, dz=0):
        o = bpy.data.objects[name]; l, _ = P[name]; o.location = (l.x + dx, l.y + dy, l.z + dz)
    def leg(sx, fwd, lift):
        for n in (f'boot{sx}', f'bootcuff{sx}', f'leg{sx}'): mv(n, 0, -fwd, lift)
    def arm(sx, fwd, dz=0):
        for n in (f'cuff{sx}', f'glove{sx}'): mv(n, 0, -fwd, dz)
    SW = bpy.data.objects['sword']
    def pose(anim, k):
        reset(); r0 = ROOT.location.copy()
        if anim == 'idle':
            ROOT.location = (r0.x, r0.y, r0.z - (.025 if k else 0))
        elif anim == 'walk':
            ph = k / 6 * 2 * math.pi; s1 = math.sin(ph)
            leg(-1, .2 * s1, max(0, s1) * .12); leg(1, -.2 * s1, max(0, -s1) * .12)
            arm(-1, -.12 * s1); arm(1, .12 * s1)
            ROOT.location = (r0.x, r0.y, r0.z + abs(math.cos(ph)) * .06)
        elif anim == 'swing':
            a = math.radians([205, 245, 290, 335][k]); rr = .62
            SW.location = (math.cos(a) * rr, math.sin(a) * rr, .74); SW.rotation_euler = (math.pi / 2 - .15, 0, a + math.pi / 2)
            g = bpy.data.objects['glove-1']; g.location = (math.cos(a) * .52, math.sin(a) * .52, .72)
            c = bpy.data.objects['cuff-1']; c.location = (math.cos(a) * .5, math.sin(a) * .5, .74)
            ROOT.location = (r0.x, r0.y, r0.z - (.04 if k in (1, 2) else 0))
    ANIMS = [('idle', 2), ('walk', 6), ('swing', 4)]
    DIRS = ['S', 'SE', 'E', 'NE', 'N']
    frames = []
    for di, dn in enumerate(DIRS):
        for an, cnt in ANIMS:
            for k in range(cnt):
                frames.append((di, dn, an, k))
    rz0 = ROOT.location.z
    for idx, (di, dn, an, k) in enumerate(frames):
        pose(an, k); ROOT.rotation_euler = (0, 0, math.radians(di * 45))
        for layer in ('base', 'mask'):
            set_layer(layer)
            sc.render.filepath = os.path.join(OUT, f'{layer}_{idx:03d}.png'); bpy.ops.render.render(write_still=True)
        ROOT.location.z = rz0
    json.dump({'cell': CELL, 'dirs': DIRS, 'anims': ANIMS, 'frames': [[di, an, k] for di, dn, an, k in frames]}, open(os.path.join(OUT, 'sheet.json'), 'w'))
    print('SHEET_OK', len(frames))
