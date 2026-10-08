"""Actual original-style helmet alternatives, isolated from the active bright bake.
blender --background --threads 4 --python visor_review.py -- ABSOLUTE_OUTPUT
"""
import bpy, math, os, sys, json

# eye height, plate radius, lower edge, upper edge; each original helm keeps its silhouette.
VISOR_CONFIG={
    'great':(1.515,.635,1.20,1.72), 'sallet':(1.545,.655,1.34,1.74),
    'horned':(1.515,.655,1.22,1.72), 'crest':(1.515,.635,1.20,1.72),
    'kettle':(1.185,.725,1.01,1.35), 'barbute':(1.535,.645,1.27,1.73)}

def apply_visor(ns, option='closed', helmet='great'):
    if helmet not in VISOR_CONFIG:raise ValueError(helmet)
    if option not in ('closed', 'recessed'):
        raise ValueError(option)
    names=list(ns['GROUPS']['helm_'+helmet])
    prefixes=('face','visorband','eye','pupil','glint','slot','slit','tbar')
    for name in names:
        if name.startswith(prefixes): bpy.data.objects[name].hide_render=True
    before=set(bpy.data.objects.keys())
    def band(name,z0,z1,r,material,amax=1.12):
        obj=ns['visor_band'](name,z0,z1,r=r,amax=amax,n=40)
        obj.data.materials[0]=material
        return obj
    z,r,low,high=VISOR_CONFIG[helmet]
    # Steel remains the outer surface; all eye detail is inside its rim.
    band('visor_lower_plate',low,z-.060 if option=='recessed' else z-.030,r,ns['M']['visor'])
    band('visor_upper_plate',z+.080 if option=='recessed' else z+.040,high,r,ns['M']['visor'])
    band('visor_shadow',z-.080,z+.100 if option=='recessed' else z+.060,r-.031,ns['M']['dark'])
    # Understated ventilation cuts sit on the curved lower faceplate.
    for side in (-1,1):
        for j in range(2):
            az=side*(.39+j*.18)
            obj=ns['cube']('visor_breath_'+str(side)+'_'+str(j),(0,0,0),(.019,.010,.055),ns['M']['dark'],bevel=.014,outline=0,sub=0)
            obj.rotation_euler.z=az
            obj.location=(math.sin(az)*(r+.021),-math.cos(az)*(r+.021),(low+z-.08)/2)
    if option=='recessed':
        white=ns['flat']('Quiet eye whites',ns['hexs']('#E5DAC2'))
        for side in (-1,1):
            az=side*.32
            def eye(name,r,scale,mat,dz=0):
                obj=ns['sphere']('visor_'+name+str(side),(0,0,0),scale,mat,outline=0,sub=0)
                obj.rotation_euler.z=az
                obj.location=(math.sin(az)*r,-math.cos(az)*r,z+dz)
            eye('white',r-.022,(.096,.009,.051),white)
            eye('pupil',r-.010,(.024,.005,.035),ns['M']['pupil'])
    added=[n for n in bpy.data.objects.keys() if n not in before]
    ns['GROUPS']['helm_'+helmet]=[n for n in names if not n.startswith(prefixes)]+added
    ns['show'](ns['DEFAULT'])
    return added,names

def apply_all_visors(ns,option='closed'):
    option='recessed' if option=='open' else option
    for helmet in ns['HELMS']:apply_visor(ns,option,helmet)
    ns['show'](ns['DEFAULT'])

def main():
    args=sys.argv[sys.argv.index('--')+1:]
    out=os.path.abspath(args[0]);os.makedirs(out,exist_ok=True)
    original=os.path.join(os.path.dirname(os.path.abspath(__file__)),'knight.py')
    saved=sys.argv[:];sys.argv=[original,'--',out,'512','visor_review_no_render']
    ns={'__file__':original,'__name__':'visor_original_source'}
    exec(compile(open(original,encoding='utf-8').read(),original,'exec'),ns)
    sys.argv=saved
    ns['cam'].ortho_scale=4.6
    ns['co'].location=(0,-ns['D']*math.cos(ns['ELEV']),1.45+ns['D']*math.sin(ns['ELEV']))
    manifest={'scope':'Great-helmet face direction proof; unchanged original body; not production sprites',
              'options':['closed','recessed'],'camera':{'elevation':32,'ortho':4.6},'files':[]}
    for option in ('closed','recessed'):
        for helmet in ns['HELMS']:
            added,names=apply_visor(ns,option,helmet)
            ns['show']((ns['DEFAULT']-{'helm_great'})|{'helm_'+helmet})
            for direction,degrees in [('SE',45),('S',0),('E',90)]:
                ns['ROOT'].rotation_euler.z=math.radians(degrees)
                stem='visor_'+option+('' if helmet=='great' else '_'+helmet)+'_'+direction
                path=os.path.join(out,stem+'_512.png')
                ns['sc'].render.filepath=path;bpy.ops.render.render(write_still=True)
                manifest['files'].append(os.path.basename(path))
                if direction=='SE' and helmet=='great': bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'visor_'+option+'.blend'))
            for name in added:
                obj=bpy.data.objects.get(name)
                if obj:bpy.data.objects.remove(obj,do_unlink=True)
            ns['GROUPS']['helm_'+helmet]=names;ns['show'](ns['DEFAULT'])
    with open(os.path.join(out,'visor-manifest.json'),'w') as f:json.dump(manifest,f,indent=2)
    print('VISOR_REVIEW_OK',out,flush=True)

if __name__=='__main__':main()
