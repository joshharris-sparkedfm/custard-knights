# Face refinement on the current rounded knight

Historical large-eye study, superseded by the owner's request for selectable closed and open visors. See `VISOR-REVIEW.md`. Do not promote the bright-face sheets as release art.

The selected **bright** face preserves the existing model style. `face_review.py` evaluates the unchanged original `knight.py`, then replaces face meshes only. Body, outer helmet geometry, custard, plume, pauldrons, cloth, stars, equipment, original lighting, animation and 32-degree camera are retained. The wider dark visor and raised narrow brow leave room for cream eye whites and pupils that sit visibly on the eye surface.

The original pupils were mostly inside the white ellipsoids. The new white center is .035 units outward from the visor radius with .047 half-depth; the pupil is .096 outward with .018 half-depth. Its outer surface therefore sits .032 beyond the white's outer surface. A consistent small upper glint accompanies the substantial dark pupil. Larger white areas leave a readable border at gameplay sizes. The parent selected bright after front and southeast comparison; determined and curious are retained as rejected expression alternatives.

Each of the six helmets has its own face height, width and radial placement. Kettle eyes sit below its wide brim; sallet eyes clear the bevor; the barbute keeps its dark nose guard; horned retains its central steel nasal. Front, southeast and side proofs were inspected for all helmets. The side view has a narrower visible face due to the viewing angle and can still be partly obscured by the unchanged review sword. The separate weapon refinement owns grip and swing improvements.

## Review files

Outputs are in the surrounding Codex workspace's `outputs/Face-review/`:

- `baseline_{SE,S,E}_{512,160,96,64}.png`: original model at the same camera.
- `face_{bright,determined,curious}_{SE,S,E}_{512,160,96,64}.png`: face alternatives on the great helm.
- `face_bright_helm_{great,sallet,horned,crest,kettle,barbute}_{SE,S,E}_{512,160,96,64}.png`: selected face adapted to every current helmet.
- `face_bright_arm_free_SE_*`: proof with only the weapon arm/cuff/glove hidden.
- `face_bright_all_helms.blend`: editable scene containing all six selected face adaptations.
- `manifest.json`: filenames and calibration. Camera is orthographic 4.6, target Z 1.45, elevation 32 degrees; smaller PNGs downsample the 512px RGBA render.

Run the review generator in Blender 3.6.23:

```powershell
& '<Blender executable>' --threads 4 --background --python art/blender/face_review.py -- '<Face-review output>'
```

## Opt-in staged bake

`face_bake.py` makes checked in-memory source substitutions against the original generator and executes that candidate without editing `knight.py`. If the expected source anchors change, it fails and requires review. It preserves the existing render interface and animation frame ordering:

```powershell
& '<Blender executable>' --threads 4 --background --python art/blender/face_bake.py -- '<staging directory>' 160 sheet helm_great base,mask,metal,armfreeBase,armfreeMask,armfreeMetal
```

The face helper registers replacement objects in each helmet group, so visibility, holdouts and recolour/metal layering use the new faces consistently. Default helmet layers include all six above. Output names are `helm_<name>_<layer>_<frame>.png`. Full sheets have 85 frames; hero mode keeps its existing six-frame ordering and the requested output cell size.

Arm-free layers hide `arm-1`, `cuff-1`, `glove-1`, retaining the weapon pauldron, shield limb and every other body part. `sheet.json` exports `rig: {version: 1, weaponArm: [...]}` in that exact frame order. Each entry gives projected `shoulder`, `elbow`, `grip` in actual output-cell pixels with a top-left origin, and `behind` for NE/N. Shoulder uses the root-transformed (-.47,0,1.0) point; elbow/grip use actual mesh bounding-box centers transformed after the authored pose. Geometry and material masks must be rebaked together because visor coverage changed.

This source work does not overwrite production sprites or modify runtime. Staging validation, atlas installation and coherent runtime weapon motion are separate coordinated work.
