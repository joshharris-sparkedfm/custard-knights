# Character model prototype

The owner's review of candidate 0.2.1 requested a larger improvement to the character models. `hero_v2.py` creates an independent editable Blender scene to evaluate that direction. It does not replace the production sprite atlases, change earned cosmetic IDs or change gameplay.

Run with portable Blender 3.6.23:

```text
blender --background --threads 4 --python art/blender/hero_v2.py -- OUTPUT_DIRECTORY
```

The output includes `hero_v2.blend`, a manifest and transparent renders at 512, 96 and 64 pixels. Five idle facings and two exploratory combat poses are exported with a close-up camera and a matched gameplay camera. The latter uses 32° elevation, orthographic scale 4.6 and a target height of 1.45, matching the existing sprite-sheet projection. Lighting and materials intentionally differ.

The initial box-shaped helmet was revised into a tapered faceted pot helmet with oval lenses, a broad dark visor, simplified custard drips and star emblems. Team cloth, boots, mittens, sword and shield use connected 3D geometry rather than independent canvas arms. The body is a new proportion study, not a drop-in compatible animation rig.

Parent review inspected the current live-game contact sheet and matched three-quarter render. The model author inspected front, three-quarter, side, guard and 64px images. Side-view facial readability still needs improvement; a planar front visor becomes thin in profile. There is no full locomotion or attack cycle, integrated wardrobe, production atlas or in-game acceptance yet. See `art/MODEL-REVIEW.md` for the arm-layer, attachment, camera, sprite-scale and cosmetic constraints before a full bake.

The user-facing Model-review output folder contains an interactive comparison, static comparison image, original-model frames, current game-renderer sheet and editable prototype. The tested Windows 0.2.1 candidate remains at source revision 8385006; this art study does not require or imply a new release package.
