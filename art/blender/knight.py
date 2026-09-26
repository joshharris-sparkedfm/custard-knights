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
 'wood':    ('#D7A46A', '#A86A2A', '#F0CC96'),
 'bread':   ('#E9B872', '#B8782E', '#FBE3B0'),
 'fish':    ('#3FB7C9', '#1E7A93', '#9BE9F0'),
 'candy':   ('#FFFFFF', '#E6D3D8', '#FFFFFF'),
 'candyred':('#E8392F', '#A61E2A', '#FF7A5C'),
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
# pauldrons
for sx in (-1, 1):
    sphere(f'pauldron{sx}', (sx * .47, 0, 1.0), (.28, .3, .22), M['team'])
# arms and gloves
for sx in (-1, 1):
    cyl(f'arm{sx}', (sx * .54, -.06, .8), .12, .36, M['mail'], rot=(0, sx * .35, 0))
    lathe(f'cuff{sx}', [(.0, 0), (.15, .0), (.18, .1), (.16, .16), (0, .17)], M['leather'], loc=(sx * .6, -.12, .6))
    sphere(f'glove{sx}', (sx * .62, -.15, .56), (.17, .17, .15), M['leather'])
# ------------------------------------------------------------------ helms and plumes, one group per variant so each can be rendered as its own sheet
GROUPS = {}
def group(name, fn):
    before = set(bpy.data.objects.keys()); fn(); GROUPS[name] = [n for n in bpy.data.objects.keys() if n not in before]
HC, HR = 1.52, .565
def eyes(z, y=-.61, sx_=.14, sc_=1.0, az=.5):
    """Big cartoon eyes set around the curve of the helm (az radians from the front) so one still reads in profile.
    They bulge out of the visor; flat discs vanish edge-on. y is the helm's front surface, sx_ is kept for old calls."""
    R = -y
    for sx in (-1, 1):
        a = sx * az; nx, ny = math.sin(a), -math.cos(a); tx, ty = math.cos(a), math.sin(a)   # outward normal, tangent
        def put(name, d, lat, dz, scl, mat, ol):
            # built at the origin, turned to face outward, then moved: new primitives carry their position in the mesh
            o = sphere(name, (0, 0, 0), scl, mat, outline=ol, sub=0); o.rotation_euler = (0, 0, a)
            bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
            o.location = (nx * (R + d) + tx * lat, ny * (R + d) + ty * lat, z + dz)
        put(f'eye{sx}', .02, 0, 0, (.12 * sc_, .07, .13 * sc_), M['eyew'], .014)
        put(f'pupil{sx}', .075, .03 * sc_, -.01, (.068 * sc_, .03, .082 * sc_), M['pupil'], 0)
        put(f'glint{sx}', .098, -.005, .045 * sc_, (.027, .012, .027), M['eyew'], 0)
def custard(top=1.98):
    mb = bpy.data.metaballs.new('custard'); mb.resolution = .03; mb.render_resolution = .02; mb.threshold = .5
    cr = bpy.data.objects.new('custard', mb); sc.collection.objects.link(cr); cr.parent = ROOT
    for loc, rad in [((0, 0, top), .44), ((.18, .08, top + .04), .3), ((-.17, -.06, top + .03), .3), ((0, 0, top + .22), .27), ((.04, .02, top + .38), .17), ((-.02, 0, top + .5), .09)]:
        e = mb.elements.new(); e.co = loc; e.radius = rad
    for ang, L in [(-2.35, .5), (-1.8, .72), (-1.3, .46), (-.7, .62), (.2, .4), (2.55, .5), (1.5, .36)]:
        n = 12
        for k in range(n):
            u = k / (n - 1); el = math.radians(62) - u * L * 1.25; rr = HR + .015
            e = mb.elements.new(); e.co = (math.cos(ang) * math.cos(el) * rr, math.sin(ang) * math.cos(el) * rr, HC + math.sin(el) * rr); e.radius = .085 - .02 * u + (.035 if k == n - 1 else 0)
    cr.data.materials.append(M['custard'])
    bpy.context.view_layer.objects.active = cr; cr.select_set(True)
    bpy.ops.object.convert(target='MESH'); cr = bpy.context.object; cr.parent = ROOT
    cr.data.materials.clear(); finish(cr, M['custard'], sub=0, parent=ROOT)
def rivets(z=1.58):
    for sx in (-1, 1): sphere(f'rivet{sx}', (sx * .6, -.05, z), (.09, .06, .09), M['visor'], outline=.02)

def visor_band(name, z0, z1, r=.598, amax=1.0, n=28):
    """dark visor opening wrapped around the front of the helm, rounded at the ends, so the eyes inside it read from any side"""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); cols = []
    for i in range(n + 1):
        a = -amax + 2 * amax * i / n; k = (abs(a) / amax) ** 3; zm = (z0 + z1) / 2; hh = (z1 - z0) / 2 * (1 - .55 * k)
        cols.append([bm.verts.new((math.sin(a) * r, -math.cos(a) * r, zm + hh * t)) for t in (-1, -.5, 0, .5, 1)])
    for i in range(n):
        for j in range(4): bm.faces.new((cols[i][j], cols[i + 1][j], cols[i + 1][j + 1], cols[i][j + 1]))
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    t = ob.modifiers.new('thick', 'SOLIDIFY'); t.thickness = .03; t.offset = 0
    return finish(ob, M['dark'], outline=.022, sub=1, parent=ROOT)
def h_great():
    lathe('helm', [(0, 1.05), (.5, 1.07), (.56, 1.2), (.575, 1.45), (.56, 1.66), (.5, 1.82), (.36, 1.96), (.18, 2.03), (0, 2.05)], M['steel'])
    lathe('visorband', [(.585, 1.5), (.605, 1.52), (.605, 1.66), (.585, 1.68)], M['visor'], sub=0, outline=.026)
    visor_band('face', 1.25, 1.52)
    for i in range(5): cube(f'slot{i}', ((i - 2) * .14, -.6, 1.59), (.035, .04, .05), M['dark'], bevel=.015, outline=0, sub=0)
    eyes(1.39); cube('chin', (0, -.5, 1.17), (.36, .1, .1), M['steel'], bevel=.08, sub=1)
    cyl('ridge', (0, -.02, 1.86), .045, .6, M['steel'], rot=(math.pi / 2, 0, 0), sub=0, outline=.016); rivets(); custard()
def h_sallet():
    lathe('helm', [(0, 1.15), (.45, 1.12), (.56, 1.28), (.585, 1.5), (.55, 1.72), (.43, 1.9), (.22, 2.0), (0, 2.03)], M['steel'])
    lathe('tail', [(.001, 1.34), (.5, 1.3), (.64, 1.14), (.66, 1.08), (.5, 1.2), (.001, 1.26)], M['visor'], loc=(0, .2, 0), scale=(.9, 1.05, 1))
    cube('slit', (0, -.56, 1.5), (.5, .08, .09), M['dark'], bevel=.05, outline=.02, sub=0)
    cube('bevor', (0, -.5, 1.27), (.44, .12, .15), M['visor'], bevel=.1, sub=1)
    eyes(1.5, y=-.62, sc_=.8, az=.32); rivets(1.5); custard()
def h_horned():
    lathe('helm', [(0, 1.05), (.52, 1.07), (.58, 1.25), (.585, 1.5), (.55, 1.72), (.42, 1.9), (.22, 2.0), (0, 2.03)], M['steel'])
    visor_band('face', 1.29, 1.55)
    eyes(1.42)
    cyl('nasal', (0, -.6, 1.44), .045, .36, M['steel'], sub=0, outline=.016)
    for sx in (-1, 1):
        mb = bpy.data.metaballs.new(f'horn{sx}'); mb.resolution = .03; mb.render_resolution = .02
        hn = bpy.data.objects.new(f'horn{sx}', mb); sc.collection.objects.link(hn)
        for k in range(14):
            u = k / 13; a = u * 1.9
            x = sx * (.5 + .45 * math.sin(a)); z = 1.62 + .5 * (1 - math.cos(a)) + u * .15
            e = mb.elements.new(); e.co = (x, -.02, z); e.radius = .27 - .17 * u
        hn.data.materials.append(M['cream'])
        bpy.context.view_layer.objects.active = hn; hn.select_set(True); bpy.ops.object.convert(target='MESH'); hn = bpy.context.object
        hn.data.materials.clear(); finish(hn, M['cream'], sub=0)
    custard()
def h_crest():
    lathe('helm', [(0, 1.08), (.5, 1.08), (.57, 1.26), (.58, 1.5), (.55, 1.72), (.42, 1.9), (.22, 2.0), (0, 2.03)], M['steel'])
    visor_band('face', 1.25, 1.52)
    eyes(1.39); cube('chin', (0, -.5, 1.17), (.34, .1, .1), M['steel'], bevel=.08, sub=1)
    sphere('crest', (0, .38, 2.12), (.08, .5, .42), M['team']); rivets(1.5); custard(1.96)
def h_kettle():
    lathe('helm', [(0, 1.3), (.5, 1.3), (.55, 1.45), (.53, 1.7), (.42, 1.88), (.22, 1.98), (0, 2.0)], M['steel'])
    lathe('brim', [(.45, 1.47), (.98, 1.37), (1.0, 1.41), (.5, 1.54)], M['visor'], sub=1, outline=.028)
    lathe('face', [(.001, 1.05), (.3, 1.06), (.36, 1.2), (.32, 1.4), (.001, 1.42)], M['dark'], loc=(0, -.36, 0), scale=(1.2, .45, 1), sub=1, outline=.022)
    eyes(1.24, y=-.58, sc_=1.15, az=.36); custard(1.94)
def h_barbute():
    lathe('helm', [(0, 1.05), (.48, 1.06), (.55, 1.2), (.565, 1.5), (.53, 1.78), (.4, 1.95), (.2, 2.04), (0, 2.07)], M['steel'])
    cube('tbar', (0, -.55, 1.46), (.42, .09, .1), M['dark'], bevel=.05, outline=.02, sub=0)
    cube('tstem', (0, -.56, 1.26), (.085, .08, .2), M['dark'], bevel=.04, outline=.02, sub=0)
    eyes(1.46, y=-.62, sc_=.85, az=.32); rivets(1.46); custard(2.0)

def feather_fan(specs):
    for i, (x, y, z, L, rx, ry, bend, w) in enumerate(specs):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=(0, 0, 0)); f = bpy.context.object; f.name = f'feather{i}'
        f.scale = (w, .07, L / 2); bpy.ops.object.transform_apply(scale=True)
        bd = f.modifiers.new('bend', 'SIMPLE_DEFORM'); bd.deform_method = 'BEND'; bd.angle = bend; bd.deform_axis = 'X'
        f.location = (x, y, z); f.rotation_euler = (rx, ry, 0); finish(f, M['plume'], sub=1)
def p_feather(): feather_fan([(a * .45, .42, 2.0 + L * .35, L, -.85, a * .8, 1.2, .16) for a, L in [(-.42, .95), (-.14, 1.15), (.14, 1.1), (.42, .9)]])
def p_twin(): feather_fan([(sx * .52, .15, 2.05, 1.1, -.35, sx * .75, 1.0, .17) for sx in (-1, 1)])
def p_mohawk(): feather_fan([(0, y, 2.06 + (.1 if abs(y) < .2 else 0), .55, -.2 + y * .6, 0, .3, .12) for y in (-.34, -.18, 0, .18, .34, .5)])
def p_flame(): feather_fan([(x, .3, 2.1 + L * .35, L, -.35, x * 1.2, -1.4 if x < 0 else 1.4, .15) for x, L in [(-.2, .9), (0, 1.25), (.2, .95)]])
def p_brush():
    sphere('brush', (0, .12, 2.2), (.1, .62, .3), M['plume'])
    for i, y in enumerate((-.35, -.1, .15, .4)): sphere(f'tuft{i}', (0, y + .12, 2.42), (.09, .12, .14), M['plume'])

HELMS = ['great', 'sallet', 'horned', 'crest', 'kettle', 'barbute']
PLUMES = ['feather', 'twin', 'mohawk', 'flame', 'brush']
for h in HELMS: group('helm_' + h, globals()['h_' + h])
for pl in PLUMES: group('plume_' + pl, globals()['p_' + pl])
def show(visible):
    """visible: set of group names to render; every object that belongs only to other groups is hidden."""
    on = set()
    for g in visible: on.update(GROUPS.get(g, []))
    for g, names in GROUPS.items():
        for n in names:
            o = bpy.data.objects.get(n)
            if o: o.hide_render = n not in on
# sword in the right hand (knight's right is +X from its own view; it faces -Y, so its right is -X)
sw = bpy.data.objects.new('sword', None); sc.collection.objects.link(sw); sw.parent = ROOT; sw.location = (-.66, -.24, .6); sw.rotation_euler = (.28, .2, 0); sw.scale = (1.15, 1.15, 1.15)
def hilt():
    cube('guard', (0, 0, .12), (.26, .06, .06), M['gold'], bevel=.04, outline=.022, sub=0, parent=sw)
    cyl('grip', (0, 0, -.06), .04, .2, M['leather'], sub=0, outline=.012, parent=sw)
    sphere('pommel', (0, 0, -.18), (.06, .06, .06), M['gold'], outline=.012, parent=sw)
group('hilt', hilt)
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


# ------------------------------------------------------------------ swappable parts: blades, cape and its patterns, emblems
def b_steel():
    cube('blade', (0, 0, .68), (.1, .03, .55), M['steel'], bevel=.03, outline=.024, sub=0, parent=sw)
    cube('fuller', (0, -.032, .66), (.018, .004, .42), M['visor'], bevel=0, outline=0, sub=0, parent=sw)
def b_wooden():
    cube('wblade', (0, 0, .66), (.12, .05, .52), M['wood'], bevel=.09, outline=.026, sub=1, parent=sw)
def b_baguette():
    cyl('bag', (0, 0, .66), .12, .98, M['bread'], sub=1, outline=.026, parent=sw)
    sphere('bagtip', (0, 0, 1.15), (.12, .12, .1), M['bread'], outline=.026, parent=sw)
    for i in range(4):
        o = cube(f'slash{i}', (0, -.11, .36 + i * .2), (.075, .02, .02), M['cream'], bevel=.01, outline=0, sub=0, parent=sw); o.rotation_euler = (0, .6, 0)
def b_fish():
    sphere('fishbody', (0, 0, .72), (.16, .075, .5), M['fish'], outline=.026, parent=sw)
    poly_obj('fishtail', [[(0, .2), (-1, -.9), (1, -.9)]], M['fish'], (0, 0, .2), (0, 0, 0), .2, sw, thick=.05, outline=.02)
    sphere('fisheye', (.04, -.07, 1.0), (.055, .03, .055), M['eyew'], outline=.01, sub=0, parent=sw)
    sphere('fishpupil', (.05, -.095, 1.0), (.028, .015, .028), M['pupil'], outline=0, sub=0, parent=sw)
def b_candy():
    cyl('cane', (0, 0, .66), .085, .98, M['candy'], sub=1, outline=.024, parent=sw)
    sphere('canetip', (0, 0, 1.15), (.085, .085, .08), M['candy'], outline=.024, parent=sw)
    for i in range(6):
        o = cyl(f'cstripe{i}', (0, 0, .26 + i * .16), .09, .05, M['candyred'], sub=0, outline=0, parent=sw); o.rotation_euler = (.55, 0, 0)
def b_spoon():
    cube('handle', (0, 0, .5), (.045, .022, .36), M['steel'], bevel=.02, outline=.02, sub=0, parent=sw)
    sphere('bowl', (0, -.02, 1.02), (.17, .06, .24), M['steel'], outline=.026, parent=sw)

def poly_obj(name, loops, mat, loc, rot, s, parent, thick=.02, outline=.012, dy=0):
    """flat shapes in the XZ plane (facing -Y) from 2D point loops, given a little thickness"""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    for lp in loops:
        vs = [bm.verts.new((x * s, dy, z * s)) for x, z in lp]; bm.faces.new(vs)
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.location = loc; ob.rotation_euler = rot
    if thick:
        t = ob.modifiers.new('thick', 'SOLIDIFY'); t.thickness = thick; t.offset = 0
    return finish(ob, mat, outline=outline, sub=0, smooth=False, parent=parent)

def circ(cx, cz, r, a0=0.0, a1=2 * math.pi, n=40, closed=False):
    k = n if closed else n + 1
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cz + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(k)]
def starpts(n, r1, r2, a0=math.pi / 2):
    return [((r1 if i % 2 == 0 else r2) * math.cos(a0 + i * math.pi / n), (r1 if i % 2 == 0 else r2) * math.sin(a0 + i * math.pi / n)) for i in range(2 * n)]
def moon_loop():
    N = 96; out = [(math.cos(2 * math.pi * i / N), math.sin(2 * math.pi * i / N)) for i in range(N)]
    cx, cz, r = .55, .25, .85; ins = lambda q: (q[0] - cx) ** 2 + (q[1] - cz) ** 2 < r * r
    k = next(i for i in range(N) if ins(out[i - 1]) and not ins(out[i])); out = out[k:] + out[:k]; arc = [q for q in out if not ins(q)]
    a_end = math.atan2(arc[-1][1] - cz, arc[-1][0] - cx); a_st = math.atan2(arc[0][1] - cz, arc[0][0] - cx)
    for d in (1, -1):
        span = ((a_st - a_end) if d > 0 else (a_end - a_st)) % (2 * math.pi)
        sw_ = [(cx + r * math.cos(a_end + d * span * i / 40), cz + r * math.sin(a_end + d * span * i / 40)) for i in range(1, 40)]
        m = sw_[len(sw_) // 2]
        if m[0] ** 2 + m[1] ** 2 < 1: return arc + sw_
def heart_loop():
    return [(1.1 * 16 * math.sin(t) ** 3 / 17, 1.1 * (13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) / 17 + .1) for t in [2 * math.pi * i / 48 for i in range(48)]]
def skull_loop():
    return circ(0, .15, .8, -.95, math.pi + .95, 36) + [(-.45, -.85), (.45, -.85)]
EMB = {  # cream shapes, dark details (drawn a hair in front)
    'star':  ([starpts(5, 1, .45)], []),
    'heart': ([heart_loop()], []),
    'crown': ([[(-1, -.7), (1, -.7), (1, .5), (.5, .05), (0, 1), (-.5, .05), (-1, .5)]], []),
    'skull': ([skull_loop()], [circ(-.32, .18, .22, n=16, closed=True), circ(.32, .18, .22, n=16, closed=True)]),
    'bolt':  ([[(.2, 1), (-.6, -.15), (0, -.15), (-.2, -1), (.6, .15), (0, .15)]], []),
    'moon':  ([moon_loop()], []),
    'pie':   ([[(0, 0)] + circ(0, 0, 1, math.pi / 2, math.pi / 2 + 2 * math.pi - 1.2, 40)], [[(0, 0)] + circ(0, 0, 1, math.pi / 2 - 1.2, math.pi / 2, 10)]),
    'sun':   ([starpts(8, 1, .62)], []),
}
def make_emblem(k):
    cream, dark = EMB[k]
    for tag, loc, s_, par in (('chest', (0, -.455, .78), .17, ROOT), ('shield', (0, -.07, .04), .13, sh)):
        poly_obj(f'emb_{k}_{tag}', cream, M['cream'], loc, (0, 0, 0), s_, par, thick=.02, outline=.012)
        if dark: poly_obj(f'emb_{k}_{tag}_d', dark, M['dark'], (loc[0], loc[1] - .014, loc[2]), (0, 0, 0), s_, par, thick=.006, outline=0)

# cape: a sheet hanging from the shoulders, flaring back; its patterns sit a hair outside it
cp = bpy.data.objects.new('capepivot', None); sc.collection.objects.link(cp); cp.parent = ROOT; cp.location = (0, .3, 1.04)
def cape_xyz(u, v, off=0.0):
    w = .4 + .16 * v
    return (u * w, .06 + .26 * v ** 1.2 + .06 * (1 - u * u) + off, -.78 * v)
def grid_mesh(name, rects, polys, mat, off, parent, thick=0, outline=0):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    for u0, u1, v0, v1 in rects:
        nu = max(1, int((u1 - u0) / .1 + .5)); nv = max(1, int((v1 - v0) / .08 + .5))
        G_ = [[bm.verts.new(cape_xyz(u0 + (u1 - u0) * i / nu, v0 + (v1 - v0) * j / nv, off)) for j in range(nv + 1)] for i in range(nu + 1)]
        for i in range(nu):
            for j in range(nv): bm.faces.new((G_[i][j], G_[i + 1][j], G_[i + 1][j + 1], G_[i][j + 1]))
    for lp in polys: bm.faces.new([bm.verts.new(cape_xyz(u, v, off)) for u, v in lp])
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    if thick:
        t = ob.modifiers.new('thick', 'SOLIDIFY'); t.thickness = thick; t.offset = 0
    return finish(ob, mat, outline=outline, sub=1 if thick else 0, smooth=True, parent=parent)
def c_cape(): grid_mesh('cape', [(-1, 1, 0, 1)], [], M['team'], 0, cp, thick=.03, outline=.03)
PO = .032
def pat_stripes(): grid_mesh('pat', [(c - .12, c + .12, .02, 1) for c in (-.6, 0, .6)], [], M['cream'], PO, cp)
def pat_chevron():
    rs = []
    for k in range(3):
        v0 = .16 + k * .28
        for i in range(12):
            ua, ub = -.92 + 1.84 * i / 12, -.92 + 1.84 * (i + 1) / 12
            va, vb = v0 + .13 * (1 - abs(ua)), v0 + .13 * (1 - abs(ub))
            rs.append([(ua, va), (ub, vb), (ub, vb + .08), (ua, va + .08)])
    grid_mesh('pat', [], rs, M['cream'], PO, cp)
def pat_checker(): grid_mesh('pat', [(-1 + i * 2 / 7, -1 + (i + 1) * 2 / 7, j / 6, (j + 1) / 6) for i in range(7) for j in range(6) if (i + j) % 2 == 0], [], M['cream'], PO, cp)
def pat_stars():
    ps = []
    for j in range(4):
        for i in (-1, 0, 1):
            cu, cv = i * .55 + (.25 if j % 2 else 0), .14 + j * .24
            if abs(cu) > .9: continue
            ps.append([(cu + x / .48, cv + z / .78) for x, z in starpts(4, .09, .035)])
    grid_mesh('pat', [], ps, M['cream'], PO, cp)
def pat_trim(): grid_mesh('pat', [(-1, -.84, 0, 1), (.84, 1, 0, 1), (-.84, .84, .88, 1)], [], M['cream'], PO, cp)

BLADES = ['steel', 'wooden', 'baguette', 'fish', 'candy', 'spoon']
PATS = ['stripes', 'chevron', 'checker', 'stars', 'trim']
EMBS = list(EMB)
for b in BLADES: group('blade_' + b, globals()['b_' + b])
group('cape', c_cape)
for pt in PATS: group('capepat_' + pt, globals()['pat_' + pt])
for k in EMBS: group('emb_' + k, lambda k=k: make_emblem(k))
DEFAULT = {'helm_great', 'plume_feather', 'hilt', 'blade_steel', 'cape', 'emb_star'}
show(DEFAULT)


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
if MODE == 'chicken':
    # The chicken every knight turns into when chaos peaks: 6 skins x 5 directions x (idle 2, walk 4), base + team mask.
    import json
    for o in bpy.data.objects: o.hide_render = o.type != 'LIGHT'   # keep the sun
    PAL.update({'hen': ('#FFFFFF', '#E6DAC2', '#FFFFFF'), 'rubber': ('#FFE45C', '#E0A21E', '#FFF7B8'), 'goldc': ('#F2A92E', '#A8650E', '#FFE58A'),
                'beak': ('#F7A534', '#C4661C', '#FFD27A'), 'comb': ('#E8392F', '#A61E2A', '#FF7A5C'), 'rgreen': ('#2FA070', '#1B5E45', '#6FD0A0'),
                'rblue': ('#4A5A8C', '#20283F', '#8C9CD0'), 'rorange': ('#F28A3C', '#C4541C', '#FFB878')})
    CM = {k: toon('c_' + k, k) for k in ['hen', 'rubber', 'goldc', 'beak', 'comb', 'rgreen', 'rblue', 'rorange']}
    CROOT = bpy.data.objects.new('chick', None); sc.collection.objects.link(CROOT)
    CG = {}
    def cgroup(name, fn):
        before = set(bpy.data.objects.keys()); fn(); CG[name] = [n for n in bpy.data.objects.keys() if n not in before]
    def S(name, loc, scl, mat, ol=.03, sub=1, rot=None):
        # built at the origin (primitives carry their position in the mesh), optionally turned, then moved
        o = sphere(name, (0, 0, 0), scl, mat, outline=ol, sub=sub, parent=CROOT)
        if rot:
            o.rotation_euler = rot; bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        o.location = loc; return o
    HC_ = (0, -.4, 1.24); HR_ = .34
    def c_base():
        S('cbody', (0, .05, .72), (.6, .68, .56), CM['hen'])
        S('chead', HC_, (HR_, HR_, HR_), CM['hen'])
        cyl('cbeak', (0, -.8, 1.2), .1, .26, CM['beak'], rot=(math.pi / 2, 0, 0), r2=.012, sub=0, outline=.02, parent=CROOT)
        S('cwattle', (0, -.72, 1.03), (.06, .05, .1), CM['comb'], ol=.016)
        for sx in (-1, 1):
            a = sx * .62; n = (math.sin(a), -math.cos(a)); tg = (math.cos(a), math.sin(a))
            def on(d, lat, dz): return (HC_[0] + n[0] * (HR_ + d) + tg[0] * lat, HC_[1] + n[1] * (HR_ + d) + tg[1] * lat, HC_[2] + dz)
            S(f'ceye{sx}', on(.0, 0, .04), (.1, .06, .12), M['eyew'], ol=.014, sub=0, rot=(0, 0, a))
            S(f'cpupil{sx}', on(.045, .02, .03), (.058, .03, .072), M['pupil'], ol=0, sub=0, rot=(0, 0, a))
            S(f'cglint{sx}', on(.07, -.01, .08), (.022, .01, .022), M['eyew'], ol=0, sub=0, rot=(0, 0, a))
            S(f'cwing{sx}', (sx * .57, .1, .8), (.12, .38, .27), CM['hen'])
            cyl(f'cleg{sx}', (sx * .2, .05, .2), .04, .34, CM['beak'], sub=0, outline=.015, parent=CROOT)
            S(f'cfoot{sx}', (sx * .2, -.08, .03), (.1, .17, .035), CM['beak'], ol=.015)
    def c_tail():
        for i, x in enumerate((-.13, 0, .13)): S(f'ctail{i}', (x, .66, 1.02 + (.06 if i == 1 else 0)), (.07, .13, .28), CM['hen'], rot=(-.55, x * 2, 0))
    def c_rtail():
        for i, (x, m) in enumerate(((-.16, 'rgreen'), (0, 'rblue'), (.16, 'rorange'))): S(f'crtail{i}', (x, .72, 1.12 + (.08 if i == 1 else 0)), (.08, .14, .42), CM[m], rot=(-.7, x * 2.2, 0))
    def c_comb():
        for i, (y, z) in enumerate(((-.52, 1.57), (-.4, 1.63), (-.28, 1.58))): S(f'ccomb{i}', (0, y, z), (.055, .07, .1), CM['comb'], ol=.016)
    def c_helm():
        S('chelm', (0, -.4, 1.36), (.37, .37, .27), M['steel'])
        S('cvisor', (0, -.62, 1.33), (.26, .1, .06), M['dark'], ol=.014)
        for i, (x, L) in enumerate(((-.07, .26), (0, .34), (.07, .26))): S(f'cplume{i}', (x, -.32, 1.72), (.05, .1, L), M['team'], rot=(-.35, x * 3, 0))
    def c_custard():
        S('ccust0', (0, -.4, 1.5), (.3, .3, .13), M['custard'], ol=.02)
        S('ccust1', (.04, -.42, 1.63), (.15, .15, .1), M['custard'], ol=.02)
        for i, ang in enumerate((-2.2, -1.2, -.4, .6, 2.4)):
            S(f'cdrip{i}', (math.cos(ang) * .3, -.4 + math.sin(ang) * .3, 1.36), (.05, .05, .11), M['custard'], ol=.014)
    for g, fn in (('base', c_base), ('tail', c_tail), ('rtail', c_rtail), ('comb', c_comb), ('helm', c_helm), ('custard', c_custard)): cgroup(g, fn)
    BODYP = ['cbody', 'chead', 'cwing-1', 'cwing1', 'ctail0', 'ctail1', 'ctail2']
    SKINS = {'hen': ({'base', 'tail', 'comb'}, 'hen'), 'rooster': ({'base', 'rtail', 'comb'}, 'hen'), 'rubber': ({'base', 'tail', 'comb'}, 'rubber'),
             'knight': ({'base', 'tail', 'helm'}, 'hen'), 'golden': ({'base', 'tail', 'comb'}, 'goldc'), 'custard': ({'base', 'tail', 'comb', 'custard'}, 'hen')}
    cam.ortho_scale = 3.4; co.location = (0, -D * math.cos(ELEV), 1.0 + D * math.sin(ELEV))   # tighter than the knights: chickens are small
    try:
        sun.use_shadow = False; sc.eevee.taa_render_samples = 8
    except Exception:
        pass
    hold = bpy.data.materials.new('c_hold'); hold.use_nodes = True; N = hold.node_tree.nodes
    for n_ in list(N): N.remove(n_)
    o_ = N.new('ShaderNodeOutputMaterial'); hd = N.new('ShaderNodeHoldout'); hold.node_tree.links.new(hd.outputs[0], o_.inputs['Surface'])
    holdc = hold.copy(); holdc.use_backface_culling = True
    white = flat('c_white', (1, 1, 1))
    PAL['tgrey'] = ('#FFFFFF', '#9C9C9C', '#FFFFFF'); tgrey = toon('c_tgrey', 'tgrey', split=.45, hi_at=.99)
    cobjs = [bpy.data.objects[n] for g in CG.values() for n in g if bpy.data.objects[n].type == 'MESH']
    ORIG0 = {o.name: [sl.material for sl in o.material_slots] for o in cobjs}
    def dress(body):
        orig = {k: list(v) for k, v in ORIG0.items()}
        for n in BODYP: orig[n][0] = CM[body]
        return orig
    def set_layer(layer, orig):
        for ob in cobjs:
            for i, sl in enumerate(ob.material_slots):
                m = orig[ob.name][i]; ink = m is not None and m.name == INKM.name; team = m is not None and m.name == M['team'].name
                if layer == 'base': sl.material = tgrey if team else m
                else: sl.material = white if team else (holdc if ink else hold)
    P = {o.name: (o.location.copy(), o.rotation_euler.copy()) for o in cobjs}
    def reset():
        for n, (l, r) in P.items(): o = bpy.data.objects[n]; o.location = l.copy(); o.rotation_euler = r.copy()
    def mv(n, dx=0, dy=0, dz=0):
        o = bpy.data.objects[n]; l, _ = P[n]; o.location = (l.x + dx, l.y + dy, l.z + dz)
    def pose(an, k):
        reset()
        if an == 'idle':
            if k: [mv(n, 0, 0, -.03) for n in ('cbody', 'chead', 'cwing-1', 'cwing1')]
            return 0
        ph = k / 4 * 2 * math.pi; s1 = math.sin(ph)
        for sx, s_ in ((-1, s1), (1, -s1)):
            for n in (f'cleg{sx}', f'cfoot{sx}'): mv(n, 0, -.16 * s_, max(0, s_) * .12)
            bpy.data.objects[f'cwing{sx}'].rotation_euler = (0, sx * (.5 + .4 * math.sin(ph * 2)), 0)
        return abs(math.cos(ph)) * .08
    ANIMS_C = [('idle', 2), ('walk', 4)]; DIRS = ['S', 'SE', 'E', 'NE', 'N']
    frames = [(di, an, k) for di in range(5) for an, cnt in ANIMS_C for k in range(cnt)]
    only = argv[3].split(',') if len(argv) > 3 and argv[3] != 'all' else None
    for skin, (groups, body) in SKINS.items():
        if only and skin not in only: continue
        on = {n for g in groups for n in CG[g]}
        for g in CG.values():
            for n in g: bpy.data.objects[n].hide_render = n not in on
        orig = dress(body)
        for idx, (di, an, k) in enumerate(frames):
            lift = pose(an, k); CROOT.location.z = lift; CROOT.rotation_euler = (0, 0, math.radians(di * 45))
            for layer in ('base', 'mask'):
                set_layer(layer, orig); sc.render.filepath = os.path.join(OUT, f'chick_{skin}_{layer}_{idx:03d}.png'); bpy.ops.render.render(write_still=True)
        print('PART_OK chick_' + skin, flush=True)
    json.dump({'cell': SIZE, 'scale': 4.6 / 3.4, 'dirs': DIRS, 'anims': ANIMS_C, 'helms': [], 'plumes': [], 'chicks': list(SKINS), 'frames': [list(f) for f in frames]}, open(os.path.join(OUT, 'sheet.json'), 'w'))
    print('SHEET_OK', len(frames))

if MODE in ('sheet', 'hero'):   # hero: a high-resolution idle (5 directions) + win set for the menus
    # Sheets: for every helm, a body+helm layer (base and team mask); for every plume, a plume layer occluded by a standard helm.
    # 5 directions x (idle 2, walk 6, swing 4, block 2, hit 1, win 2) = 85 frames per sheet.
    import json
    CELL = SIZE
    cam.ortho_scale = 4.6
    co.location = (0, -D * math.cos(ELEV), 1.45 + D * math.sin(ELEV))
    try:
        sun.use_shadow = False; sc.eevee.taa_render_samples = 8
    except Exception:
        pass
    def flatmat(name, col):
        m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes
        for n in list(N): N.remove(n)
        o = N.new('ShaderNodeOutputMaterial'); e = N.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*col, 1); m.node_tree.links.new(e.outputs[0], o.inputs['Surface']); return m
    hold = bpy.data.materials.new('holdout'); hold.use_nodes = True; N = hold.node_tree.nodes
    for n in list(N): N.remove(n)
    o = N.new('ShaderNodeOutputMaterial'); hd = N.new('ShaderNodeHoldout'); hold.node_tree.links.new(hd.outputs[0], o.inputs['Surface'])
    white = flatmat('maskwhite', (1, 1, 1))
    holdc = hold.copy(); holdc.name = 'holdout_cull'; holdc.use_backface_culling = True
    PAL['tgrey'] = ('#FFFFFF', '#9C9C9C', '#FFFFFF'); tgrey = toon('tgrey', 'tgrey', split=.45, hi_at=.99)
    TEAMS = {M['team'].name, M['plume'].name}
    objs = [o for o in bpy.data.objects if o.type == 'MESH']
    orig = {o.name: [sl.material for sl in o.material_slots] for o in objs}
    def set_layer(layer, solo=()):
        # base/mask/metal: the helm sheets. solo: only the named objects draw (team parts grey), everything visible
        # holds them out. solomask: the named objects draw white, everything else holds out.
        for ob in objs:
            ins = ob.name in solo
            for i, sl in enumerate(ob.material_slots):
                m = orig[ob.name][i]; ink = m is not None and m.name == INKM.name; team = m is not None and m.name in TEAMS
                H = holdc if ink else hold
                if layer == 'base': sl.material = tgrey if team else m
                elif layer == 'mask': sl.material = white if team else H
                elif layer == 'metal': sl.material = white if (m is not None and m.name == M['steel'].name) else H
                elif layer == 'solo': sl.material = (tgrey if team else m) if ins else H
                else: sl.material = (holdc if ink else white) if ins else H
    P = {o.name: (o.location.copy(), o.rotation_euler.copy()) for o in bpy.data.objects}
    def reset():
        for n, (l, r) in P.items(): o = bpy.data.objects[n]; o.location = l.copy(); o.rotation_euler = r.copy()
    def mv(name, dx=0, dy=0, dz=0):
        o = bpy.data.objects[name]; l, _ = P[name]; o.location = (l.x + dx, l.y + dy, l.z + dz)
    def at(name, x, y, z): bpy.data.objects[name].location = (x, y, z)
    def leg(sx, fwd, lift):
        for n in (f'boot{sx}', f'bootcuff{sx}', f'leg{sx}'): mv(n, 0, -fwd, lift)
    def arm(sx, fwd, dz=0):
        for n in (f'cuff{sx}', f'glove{sx}'): mv(n, 0, -fwd, dz)
    SW = bpy.data.objects['sword']; SH = bpy.data.objects['shield']
    def pose(anim, k):
        """returns (lift, tilt): whole-knight vertical offset and forward lean in radians"""
        reset()
        if anim == 'idle':
            return (-.025 if k else 0), 0
        if anim == 'walk':
            ph = k / 6 * 2 * math.pi; s1 = math.sin(ph)
            leg(-1, .3 * s1, max(0, s1) * .18); leg(1, -.3 * s1, max(0, -s1) * .18)
            arm(-1, -.18 * s1, .04); arm(1, .18 * s1, .04)
            return abs(math.cos(ph)) * .1, .1
        if anim == 'swing':
            a = math.radians([200, 245, 292, 340][k]); rr = .64
            SW.location = (math.cos(a) * rr, math.sin(a) * rr, .76); SW.rotation_euler = (math.pi / 2 - .15, 0, a + math.pi / 2)
            at('glove-1', math.cos(a) * .52, math.sin(a) * .52, .74); at('cuff-1', math.cos(a) * .5, math.sin(a) * .5, .76)
            leg(-1, .12, 0); leg(1, -.12, 0)
            return (-.05 if k in (1, 2) else 0), [.05, .14, .18, .1][k]
        if anim == 'block':
            SH.location = (.08, -.72, .9); SH.rotation_euler = (0, 0, 0)
            at('glove1', .12, -.55, .84); at('cuff1', .2, -.5, .84)
            return (-.05 if k else -.03), .08
        if anim == 'hit':
            arm(-1, .1, .3); arm(1, .1, .3); leg(-1, -.1, 0); leg(1, .1, .06)
            return .04, -.3
        if anim == 'win':
            SW.location = (-.46, -.08, 1.35 if k == 0 else 1.55); SW.rotation_euler = (0, -.2, 0)
            at('glove-1', -.46, -.1, 1.3 if k == 0 else 1.5); at('cuff-1', -.5, -.08, 1.25 if k == 0 else 1.45)
            return (0 if k == 0 else .16), -.05
        return 0, 0
    ANIMS = [('idle', 2), ('walk', 6), ('swing', 4), ('block', 2), ('hit', 1), ('win', 2)]
    DIRS = ['S', 'SE', 'E', 'NE', 'N']
    frames = [(di, dn, an, k) for di, dn in enumerate(DIRS) for an, cnt in ANIMS for k in range(cnt)]
    if MODE == 'hero': frames = [(di, dn, 'idle', 0) for di, dn in enumerate(DIRS)] + [(0, 'S', 'win', 1)]
    rz0 = ROOT.location.z
    CP = bpy.data.objects['capepivot']
    CAPE = {'idle': (0, .05), 'walk': (.3, .38, .3, .22, .3, .38), 'swing': (.18, .26, .3, .22), 'block': (.12, .14), 'hit': (-.05,), 'win': (.2, .34)}
    def render_all(prefix, layers, solo=()):
        for idx, (di, dn, an, k) in enumerate(frames):
            lift, tilt = pose(an, k); ROOT.location.z = rz0 + lift; ROOT.rotation_euler = (tilt, 0, math.radians(di * 45))
            CP.rotation_euler = (CAPE[an][k], 0, 0)
            for fname, kind in layers:
                set_layer(kind, solo); sc.render.filepath = os.path.join(OUT, f'{prefix}_{fname}_{idx:03d}.png'); bpy.ops.render.render(write_still=True)
        ROOT.location.z = rz0; ROOT.rotation_euler = (0, 0, 0); CP.rotation_euler = (0, 0, 0)
    only = argv[3].split(',') if len(argv) > 3 and argv[3] != 'all' else None
    HL = tuple(argv[4].split(',')) if len(argv) > 4 else ('base', 'mask', 'metal')
    STAND = {'helm_great', 'hilt', 'blade_steel', 'cape'}   # always-present stand-ins that hold out a solo layer
    names_of = lambda gs: {n for g in gs for n in GROUPS[g]}
    jobs = [('helm_' + h, {'helm_' + h}, [(l, l) for l in HL], ()) for h in HELMS]
    jobs += [('plume_' + pl, STAND | {'plume_' + pl}, [('plume', 'solo')], names_of(['plume_' + pl])) for pl in PLUMES]
    jobs += [('blade_' + b, (STAND - {'blade_steel'}) | {'blade_' + b}, [('solo', 'solo')], names_of(['blade_' + b, 'hilt'])) for b in BLADES]
    jobs += [('cape', STAND, [('solo', 'solo')], names_of(['cape']))]
    jobs += [('capepat_' + pt, STAND | {'capepat_' + pt}, [('mask', 'solomask')], names_of(['capepat_' + pt])) for pt in PATS]
    jobs += [('emb_' + k, STAND | {'emb_' + k}, [('solo', 'solo')], names_of(['emb_' + k])) for k in EMBS]
    for name, vis, layers, solo in jobs:
        if only and name not in only: continue
        show(vis); render_all(name, layers, solo); print('PART_OK', name, flush=True)
    json.dump({'cell': CELL, 'dirs': DIRS, 'anims': ANIMS, 'helms': HELMS, 'plumes': PLUMES, 'blades': BLADES, 'pats': PATS, 'embs': EMBS, 'frames': [[di, an, k] for di, dn, an, k in frames]}, open(os.path.join(OUT, 'sheet.json'), 'w'))
    print('SHEET_OK', len(frames))

if MODE == 'variants':
    ROOT.rotation_euler = (0, 0, math.radians(45))
    for h in HELMS:
        show((DEFAULT - {'helm_great'}) | {'helm_' + h}); sc.render.filepath = os.path.join(OUT, f'var_helm_{h}.png'); bpy.ops.render.render(write_still=True)
    for pl in PLUMES:
        show((DEFAULT - {'plume_feather'}) | {'plume_' + pl}); sc.render.filepath = os.path.join(OUT, f'var_plume_{pl}.png'); bpy.ops.render.render(write_still=True)
    print('VARIANTS_OK')

if MODE == 'parts':
    # every blade (SE), every emblem (S) and every cape pattern (N), with the default kit
    for b in BLADES:
        ROOT.rotation_euler = (0, 0, math.radians(45)); show((DEFAULT - {'blade_steel'}) | {'blade_' + b}); sc.render.filepath = os.path.join(OUT, f'part_blade_{b}.png'); bpy.ops.render.render(write_still=True)
    for k in EMBS:
        ROOT.rotation_euler = (0, 0, 0); show((DEFAULT - {'emb_star'}) | {'emb_' + k}); sc.render.filepath = os.path.join(OUT, f'part_emb_{k}.png'); bpy.ops.render.render(write_still=True)
    for pt in ['plain'] + PATS:
        ROOT.rotation_euler = (0, 0, math.radians(180)); show(DEFAULT | ({'capepat_' + pt} if pt != 'plain' else set())); sc.render.filepath = os.path.join(OUT, f'part_cape_{pt}.png'); bpy.ops.render.render(write_still=True)
    print('PARTS_OK')
