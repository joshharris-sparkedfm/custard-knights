"""Local material and chef-cap adaptation; no changes to community source files."""
import bpy

def linear(hex):
 values=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values)+(1,)

def pip_style(meshes):
 # Pip keeps the source's white coat and cap; red piping becomes teal and the trousers deep teal.
 top=max((m.matrix_world@v.co).z for m in meshes for v in m.data.vertices)
 for mesh in meshes:
  attr=mesh.data.color_attributes.new(name='LegRegion',type='FLOAT_COLOR',domain='POINT')
  for v,color in zip(mesh.data.vertices,attr.data):color.color=(float((mesh.matrix_world@v.co).z<top*.35),)*3+(1,)
  for material in mesh.data.materials:
   nodes=material.node_tree.nodes;links=material.node_tree.links;bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
   original=bsdf.inputs['Base Color'].links[0].from_socket
   hsv=nodes.new('ShaderNodeSeparateColor');hsv.mode='HSV';links.new(original,hsv.inputs[0])
   lo=nodes.new('ShaderNodeMath');lo.operation='LESS_THAN';lo.inputs[1].default_value=.022;links.new(hsv.outputs[0],lo.inputs[0])
   hi=nodes.new('ShaderNodeMath');hi.operation='GREATER_THAN';hi.inputs[1].default_value=.95;links.new(hsv.outputs[0],hi.inputs[0])
   hue=nodes.new('ShaderNodeMath');hue.operation='MAXIMUM';links.new(lo.outputs[0],hue.inputs[0]);links.new(hi.outputs[0],hue.inputs[1])
   sat=nodes.new('ShaderNodeMath');sat.operation='GREATER_THAN';sat.inputs[1].default_value=.6;links.new(hsv.outputs[1],sat.inputs[0])
   red=nodes.new('ShaderNodeMath');red.operation='MULTIPLY';links.new(hue.outputs[0],red.inputs[0]);links.new(sat.outputs[0],red.inputs[1])
   trim=nodes.new('ShaderNodeMixRGB');links.new(red.outputs[0],trim.inputs[0]);links.new(original,trim.inputs[1]);trim.inputs[2].default_value=linear('#2ec4b6')
   region=nodes.new('ShaderNodeVertexColor');region.layer_name='LegRegion'
   light=nodes.new('ShaderNodeMath');light.operation='GREATER_THAN';light.inputs[1].default_value=.55;links.new(hsv.outputs[2],light.inputs[0])
   legs=nodes.new('ShaderNodeMath');legs.operation='MULTIPLY';links.new(region.outputs['Color'],legs.inputs[0]);links.new(light.outputs[0],legs.inputs[1])
   shade=nodes.new('ShaderNodeMixRGB');shade.blend_type='MULTIPLY';shade.inputs[0].default_value=1;links.new(original,shade.inputs[1]);shade.inputs[2].default_value=linear('#2a8f88')
   mix=nodes.new('ShaderNodeMixRGB');links.new(legs.outputs[0],mix.inputs[0]);links.new(trim.outputs[0],mix.inputs[1]);links.new(shade.outputs[0],mix.inputs[2])
   links.new(mix.outputs[0],bsdf.inputs['Base Color'])
   for key,value in [('Metallic',0),('Roughness',.8)]:
    for link in list(bsdf.inputs[key].links):links.remove(link)
    bsdf.inputs[key].default_value=value
 return meshes

def apply_style(meshes,arm,name):
 if name=='t-pose-chef':return pip_style(meshes)
 if name not in ['canteen-lady','bakers-delight']:return meshes
 for mesh in meshes:
  attr=mesh.data.color_attributes.new(name='ApronRegion',type='FLOAT_COLOR',domain='POINT')
  for v,color in zip(mesh.data.vertices,attr.data):
   p=mesh.matrix_world@v.co;inside=(.35<p.z<1.06 and p.y<.015 and abs(p.x)<.31) if name=='canteen-lady' else p.z<1.06
   color.color=(float(inside),)*3+(1,)
  for material in mesh.data.materials:
   nodes=material.node_tree.nodes;links=material.node_tree.links;bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
   original=bsdf.inputs['Base Color'].links[0].from_socket
   region=nodes.new('ShaderNodeVertexColor');region.layer_name='ApronRegion'
   if name=='canteen-lady':
    value=nodes.new('ShaderNodeRGBToBW');links.new(original,value.inputs[0])
    dark=nodes.new('ShaderNodeMath');dark.operation='LESS_THAN';links.new(value.outputs[0],dark.inputs[0]);dark.inputs[1].default_value=.18
   else:
    hsv=nodes.new('ShaderNodeSeparateColor');hsv.mode='HSV';links.new(original,hsv.inputs[0])
    low=nodes.new('ShaderNodeMath');low.operation='GREATER_THAN';links.new(hsv.outputs[0],low.inputs[0]);low.inputs[1].default_value=.14
    high=nodes.new('ShaderNodeMath');high.operation='LESS_THAN';links.new(hsv.outputs[0],high.inputs[0]);high.inputs[1].default_value=.43
    dark=nodes.new('ShaderNodeMath');dark.operation='MULTIPLY';links.new(low.outputs[0],dark.inputs[0]);links.new(high.outputs[0],dark.inputs[1])
   mask=nodes.new('ShaderNodeMath');mask.operation='MULTIPLY';links.new(region.outputs['Color'],mask.inputs[0]);links.new(dark.outputs[0],mask.inputs[1])
   mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MIX';links.new(mask.outputs[0],mix.inputs[0]);links.new(original,mix.inputs[1]);mix.inputs[2].default_value=linear('#c27889' if name=='canteen-lady' else '#d0a64d');links.new(mix.outputs[0],bsdf.inputs['Base Color'])
   for key,value in [('Metallic',0),('Roughness',.8)]:
    for link in list(bsdf.inputs[key].links):links.remove(link)
    bsdf.inputs[key].default_value=value
   for node in nodes:
    if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.18
 if name=='bakers-delight':return meshes
 capmat=bpy.data.materials.new('Mabel cream chef cap');capmat.diffuse_color=linear('#fff2cf');capmat.use_nodes=True
 capmat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=linear('#fff2cf');capmat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.8
 cap=[]
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.145,depth=.075,location=(0,.015,1.415))
 band=bpy.context.object;band.name='Mabel cap band';cap.append(band)
 bevel=band.modifiers.new('Soft brim','BEVEL');bevel.width=.018;bevel.segments=3;bpy.context.view_layer.objects.active=band;bpy.ops.object.modifier_apply(modifier=bevel.name)
 for i,(position,scale)in enumerate([((0,.015,1.52),(.17,.15,.14)),((-.105,.015,1.50),(.105,.13,.10)),((.105,.015,1.50),(.105,.13,.10))]):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=position);o=bpy.context.object;o.name=f'Mabel cap puff {i}';o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);cap.append(o)
 for o in cap:
  o.data.materials.append(capmat)
  for p in o.data.polygons:p.use_smooth=True
  group=o.vertex_groups.new(name='Head');group.add(list(range(len(o.data.vertices))),1,'REPLACE')
  mod=o.modifiers.new('Follow head','ARMATURE');mod.object=arm
 return meshes+cap
