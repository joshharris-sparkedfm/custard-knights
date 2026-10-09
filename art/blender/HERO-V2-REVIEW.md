# Independent knight model prototype

`hero_v2.py` constructs actual mesh geometry in Blender 3.6. It does not import the old knight generator, replace its output, or modify game runtime. The editable scene and review PNGs are saved to `outputs/Model-review/prototype/` in the surrounding Codex workspace.

Run:

```powershell
& '<Blender3.6 executable>' --threads 4 --background --python art/blender/hero_v2.py -- '<review output directory>'
```

The stronger silhouette has an octagonal steel pot helmet with a tapered crown and broad bevels, a large dark front visor with separated cream oval lenses, one custard dollop with two broad attached drips, red team tabard, cream stars, planted sculpted boots with a visible gap, and mesh hands, sword, shield and cape. Broad material areas and soft key/fill/rim lighting replace the original model's many small rivets, cuffs and helmet details. Equipment is parented to arm groups rather than drawn as an unrelated 2D overlay.

The first angular helmet revision read too much like a robot and was rejected during review. Its original scene and renders are retained under `angular-reference/`; the main prototype files contain the revised pot helmet.

## Review outputs and calibration

- `hero_v2.blend`: editable scene, saved in the southeast idle pose with the matched game camera.
- `hero_v2_game_idle_{S,SE,E,NE,N}_{512,96,64}.png`: transparent turnaround at the actual game sheet camera, 32-degree elevation, orthographic scale 4.6, target Z 1.45.
- `hero_v2_game_{guard,contact}_SE_{512,96,64}.png`: coherent staged equipment poses at that same camera.
- `hero_v2_idle_*`, `hero_v2_guard_*`, `hero_v2_contact_*`: closer review camera, orthographic scale 3.6, target Z 1.40, same elevation.
- `manifest.json`: exact filename mapping, camera settings, geometry height and review scope.

All PNGs originate from the actual Blender scene. The 96px and 64px files downsample its 512px RGBA render. The geometry ground is Z .015, helmet crown Z 2.36 and custard tip Z 2.76. Comparison must use the `game` filenames: the closeups frame the character larger and are not a fair comparison against existing game sheets.

The script completed in Blender 3.6.23. Front, southeast, side, guard, contact and 64px outputs were visually inspected. Front and southeast read clearly; the 90-degree side view necessarily reduces the planar visor to a thin edge. The side visor needs additional design if this direction is adopted. The prototype establishes model shape, not a finished production animation set: guard/contact are staged poses, not complete transitions. It has no recolour masks, cosmetic variants, skeletal rig, full walk/attack bake or runtime registration. Those belong to a later integration step following visual review. The current game model remains the fallback.
