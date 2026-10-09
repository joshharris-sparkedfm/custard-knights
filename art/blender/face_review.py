"""Face-only review on the unchanged rounded Custard Knights model.
Blender 3.6: blender --threads 4 --background --python face_review.py -- OUT
Reusable apply_face(original_knight_namespace, option) is an opt-in staging hook.
"""
import bpy
import math
import os
import sys
import json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

OPTIONS = ['bright', 'determined', 'curious']

FACE_CONFIG = {
    'great': (1.485,.622,.43,.151,.178,1.24,1.70),
    'sallet': (1.565,.642,.39,.146,.158,1.37,1.755),
    'horned': (1.51,.632,.46,.148,.171,1.27,1.73),
    'crest': (1.485,.622,.43,.151,.178,1.24,1.70),
    'kettle': (1.15,.755,.38,.145,.135,.97,1.345),
    'barbute': (1.535,.638,.40,.144,.158,1.34,1.73),
}

def apply_face(ns, option='bright', helmet='great'):
    """Replace only great-helmet face meshes; return names added for staging.
    Outer helm, custard, plume, body, materials, equipment and animation remain
    the original generator's. Only face and brow geometry is opt-in changed.
    """
    if option not in OPTIONS:
        raise ValueError('Unknown face option: '+option)
    originals=ns.setdefault('_review_original_faces',{})
    original=originals.setdefault(helmet,list(ns['GROUPS']['helm_'+helmet]))
    prefixes = ('face', 'visorband', 'eye', 'pupil', 'glint', 'slot', 'slit', 'tbar')
    for name in original:
        if name.startswith(prefixes):
            bpy.data.objects[name].hide_render = True
    before=set(bpy.data.objects.keys())
    z,radius,azimuth,eye_width,eye_height,low,high=FACE_CONFIG[helmet]
    cream = ns['flat']('Face warm cream '+option, ns['hexs']('#FFF4D6'))
    ns['visor_band']('review_open_face_'+helmet,low,high,r=radius,amax=1.13,n=36)
    # Keep the old round steel language; move the face's brow clear of the eyes.
    if helmet in ('great','crest','horned'):
        ns['lathe']('review_brow_'+helmet,[(.589,high),(.608,high+.02),(.608,high+.075),(.579,high+.095)],
                    ns['M']['visor'],sub=0,outline=.020)
    for side in (-1,1):
        az=side*azimuth
        nx,ny=math.sin(az),-math.cos(az)
        tx,ty=math.cos(az),math.sin(az)
        center_z=z+(side*.018 if option=='curious' else 0)
        width=eye_width
        height=eye_height if option!='determined' else eye_height*.86
        if option=='curious' and side==1:
            width=.163; height=.192
        def feature(name,depth,tangent,dz,scale,material,outline=0):
            obj=ns['sphere']('review_'+helmet+'_'+name+str(side),(0,0,0),scale,material,outline=outline,sub=0)
            obj.rotation_euler.z=az
            obj.location=(nx*(radius+depth)+tx*tangent,ny*(radius+depth)+ty*tangent,center_z+dz)
            return obj
        # Pupils sit visibly outside the white, not mostly buried in its sphere.
        feature('white',.035,0,0,(width,.047,height),cream,.011)
        tangent=.013 if option!='curious' else -.014
        pupil_height=min(.102,height*.58)
        feature('pupil',.096,tangent,.020,(.066,.018,pupil_height),ns['M']['pupil'])
        feature('glint',.117,tangent-.022,.055,(.022,.009,.026),cream)
        if option=='determined':
            # One broad slanted lid, seated on the eye surface, rather than micro brows.
            lid=ns['cube']('review_lid'+str(side),(0,0,0),(.17,.030,.043),ns['M']['dark'],
                           bevel=.025,outline=0,sub=0)
            lid.rotation_euler=(0,side*-.26,az)
            lid.location=(nx*.714,ny*.714,center_z+.123)
        if option=='curious' and side==-1:
            feature('lid',.084,0,.14,(.145,.023,.043),ns['M']['dark'])
    added=[name for name in bpy.data.objects.keys() if name not in before]
    ns['GROUPS']['helm_'+helmet]=[name for name in original if not name.startswith(prefixes)]+added
    return added

def apply_all_faces(ns, option='bright'):
    for helmet in ns['HELMS']:apply_face(ns,option,helmet)
    ns['show'](ns['DEFAULT'])

def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    out=os.path.abspath(args[0] if args else os.path.join(os.path.dirname(__file__),'face-review'))
    os.makedirs(out,exist_ok=True)
    original=os.path.join(os.path.dirname(os.path.abspath(__file__)),'knight.py')
    original_args=sys.argv[:]
    sys.argv=[original,'--',out,'512','face_review_no_render']
    ns={'__file__':original,'__name__':'knight_face_source'}
    exec(compile(open(original,encoding='utf-8').read(),original,'exec'),ns)
    sys.argv=original_args
    scene=ns['sc']; camera=ns['co']; root=ns['ROOT']
    ns['cam'].ortho_scale=4.6
    camera.location=(0,-ns['D']*math.cos(ns['ELEV']),1.45+ns['D']*math.sin(ns['ELEV']))
    manifest={'source':'Unchanged art/blender/knight.py','scope':'Face and brow only; bright adapted to all six original helmets',
        'helmets':ns['HELMS'],
        'camera':{'elevation':32,'orthographic_scale':4.6,'target_z':1.45},
        'sizes':[512,160,96,64],'options':OPTIONS,'files':[],
        'geometry':{'white_radial_depth':.035,'white_half_depth':.047,
            'pupil_radial_depth':.096,'pupil_half_depth':.018,'eye_center_z':1.485},
        'production_replacement':False}
    def emit_manifest():
        with open(os.path.join(out,'manifest.json'),'w') as handle:json.dump(manifest,handle,indent=2)
    def capture(stem,option,direction,arm_free=False):
        path=os.path.join(out,stem+'_512.png')
        scene.render.filepath=path
        bpy.ops.render.render(write_still=True)
        files={'512':os.path.basename(path)}
        for size in (160,96,64):
            img=bpy.data.images.load(path,check_existing=False)
            img.scale(size,size);img.file_format='PNG';img.filepath_raw=os.path.join(out,stem+'_'+str(size)+'.png')
            img.save();bpy.data.images.remove(img)
            files[str(size)]=stem+'_'+str(size)+'.png'
        def project(point):
            p=world_to_camera_view(scene,camera,point)
            return [round(p.x*160,4),round((1-p.y)*160,4)]
        glove=bpy.data.objects['glove-1']
        center=sum((Vector(p) for p in glove.bound_box),Vector())/8
        manifest['files'].append({'option':option,'direction':direction,'arm_free':arm_free,'renders':files,
            'sockets160':{'shoulder':project(root.matrix_world@Vector((-.47,0,1.0))),
                          'palm':project(glove.matrix_world@center)}})
        emit_manifest()
        print('FACE_PREVIEW',path,flush=True)
    for direction,degrees in [('SE',45),('S',0),('E',90)]:
        root.rotation_euler.z=math.radians(degrees)
        capture('baseline_'+direction,'baseline',direction)
    originals={name:bpy.data.objects[name].hide_render for name in ns['GROUPS']['helm_great']}
    added=[]
    for option in OPTIONS:
        for name in added:
            obj=bpy.data.objects.get(name)
            if obj:bpy.data.objects.remove(obj,do_unlink=True)
        for name,hidden in originals.items():bpy.data.objects[name].hide_render=hidden
        added=apply_face(ns,option)
        root.rotation_euler.z=math.radians(45)
        capture('face_'+option+'_SE',option,'SE')
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'face_'+option+'.blend'))
        for direction,degrees in [('S',0),('E',90)]:
            root.rotation_euler.z=math.radians(degrees)
            capture('face_'+option+'_'+direction,option,direction)
        if option=='bright':
            root.rotation_euler.z=math.radians(45)
            arm_names=['arm-1','cuff-1','glove-1']
            for name in arm_names:bpy.data.objects[name].hide_render=True
            capture('face_bright_arm_free_SE',option,'SE',True)
            for name in arm_names:bpy.data.objects[name].hide_render=False
    for name in added:
        obj=bpy.data.objects.get(name)
        if obj:bpy.data.objects.remove(obj,do_unlink=True)
    apply_all_faces(ns,'bright')
    for helmet in ns['HELMS']:
        ns['show']((ns['DEFAULT']-{'helm_great'})|{'helm_'+helmet})
        for direction,degrees in [('SE',45),('S',0),('E',90)]:
            root.rotation_euler.z=math.radians(degrees)
            capture('face_bright_helm_'+helmet+'_'+direction,'bright_'+helmet,direction)
    ns['show'](ns['DEFAULT']);root.rotation_euler.z=math.radians(45)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'face_bright_all_helms.blend'))
    print('FACE_REVIEW_OK',out,flush=True)

if __name__=='__main__':main()
