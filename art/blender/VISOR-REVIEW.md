# Closed and open visors

The owner requested both visor positions as wardrobe options after reviewing the large exposed-eye study. Closed is the default for missing/legacy values. Open uses small, shallow eyes inside the steel rim. Both retain the original rounded body, armour, custard, plume and helmet silhouettes. The kettle face sits below its brim; the other helmets have individually calibrated faceplate heights and radii.

`visor_review.py` renders the actual six helmet meshes in front, southeast and side views, and exports editable great-helmet Blender proofs. It does not rewrite the original `knight.py`. `visor_bake.py` applies checked in-memory patches to the original generator, including the corrected shield-hand centre placement, arm-free body layers and projected shoulder/elbow/grip sockets. `CK_VISOR_STYLE` is either `closed` or `open`. Use absolute output directories and Blender 3.6.23 with `--threads 4`.

The runtime contracts are:

| File | Root | State |
|---|---|---|
| sprites/knight.js | CK_SPRITES.knight | Closed, gameplay160 |
| sprites/hero.js | CK_SPRITES.hero | Closed, preview384 |
| sprites/knight-open.js | CK_SPRITES.knightOpen | Open, gameplay160 |
| sprites/hero-open.js | CK_SPRITES.heroOpen | Open, preview384 |

Each family contains its own body/mask/metal, arm-free equivalents and complete matching cape, pattern, emblem, plume and baked alternate-weapon layers. Never swap only a base atlas into an older family. Gameplay preserves 85 frames; each hero has six frames. `visorStyle` and `faceRevision` travel into the packed root. Open families load lazily; the renderer keeps a complete closed family until a validated open family decodes. Cache keys are separate for all four roots. Chicken assets are unchanged.

Staging uses `python scripts/stage-sprites.py visor-pilot --source art/blender/visor_bake.py`, followed by `visor-full` with the returned run directory and a suitable `--max-estimate-minutes`. The current two-family pilot estimated 54.8 minutes. Source hashes must stay stable during the full run. PNG, atlas, rig and state metadata validation is mandatory before promotion.

Final checks include `qa/grip-review.cjs ROOT --full` and `--full --open`, `qa/visor-run.cjs ROOT --assets`, animation/collision checks, wardrobe/preset/backup/controller checks and live online appearance. `CK_PERF_VISORS=1 node qa/run.js perf` measures mixed open/closed families across all six arenas. Packaged restart/relocation and desktop journey acceptance verify both local visor choices and offline loading of both resolutions. None substitutes for physical-controller, different-network or human playtesting.

The current build status is in `release/LAUNCH-STATUS.md`; the presence of these scripts does not establish that the pending 0.2.2 package passed acceptance.
