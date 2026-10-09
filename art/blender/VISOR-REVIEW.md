# Closed and open visors

The owner requested both visor positions as wardrobe options after reviewing the large exposed-eye study. Closed is the default for missing/legacy values. Open uses small, shallow eyes inside the steel rim. Both retain the original rounded body, armour, custard, plume and helmet silhouettes. The kettle face sits below its brim; the other helmets have individually calibrated faceplate heights and radii.

`visor_review.py` renders the actual six helmet meshes in front, southeast and side views, and exports editable great-helmet Blender proofs. It does not rewrite the original `knight.py`. `visor_bake.py` applies checked in-memory patches to the original generator, including the corrected shield-hand centre placement, arm-free body layers and projected shoulder/elbow/grip sockets. `CK_VISOR_STYLE` is either `closed` or `open`. Use absolute output directories and Blender 3.6.23 with `--threads 4`.

The adopted baker creates each subdivision surface with `use_limit_surface = False`, then applies its BEVEL/SOLIDIFY/SUBSURF modifier prefix once before adding the ink shell. This avoids repeated OpenSubdiv evaluation, which caused native Blender crashes even with a serialized dependency graph. It preserves the rounded silhouettes and ink, but changes about 2.6% of the pixels in the 160px great-helmet cell compared with the earlier limit-surface pilot. The closed/open front and southeast comparisons were reviewed before the full bake. The entire staged candidate was rendered fresh with this one setting; no PNGs from the interrupted limit-surface run were reused.

The runtime contracts are:

| File | Root | State |
|---|---|---|
| sprites/knight.js | CK_SPRITES.knight | Closed, gameplay160 |
| sprites/hero.js | CK_SPRITES.hero | Closed, preview384 |
| sprites/knight-open.js | CK_SPRITES.knightOpen | Open, gameplay160 |
| sprites/hero-open.js | CK_SPRITES.heroOpen | Open, preview384 |

Each family contains its own body/mask/metal, arm-free equivalents and complete matching cape, pattern, emblem, plume and baked alternate-weapon layers. Never swap only a base atlas into an older family. Gameplay preserves 85 frames; each hero has six frames. `visorStyle` and `faceRevision` travel into the packed root. Open families load lazily; the renderer keeps a complete closed family until a validated open family decodes. Cache keys are separate for all four roots. Chicken assets are unchanged.

Staging uses `python scripts/stage-sprites.py visor-pilot --source art/blender/visor_bake.py`, followed by `visor-full` with the returned run directory and, if needed, `--max-visor-estimate-minutes`. The finite/static two-family pilot estimated 13.1 render minutes. The pilot pins SHA-256 hashes for the original generator, visor geometry, baker, packer, validator and stage runner; full and resume reject any drift before replacing those hashes. A filtered resume requires a canonical full rig, and metadata reconstruction runs a complete unfiltered small job. PNG, atlas, rig and decoded-RGBA visor-state validation is mandatory before promotion.

The 2026-10-08 fresh staged candidate is in `../sprite-build/20261008-153830`: each knight family has 5,185 RGBA source PNGs at 160px/85 frames, and each hero family has 366 at 384px/six frames. All four atlas roots have 61 validated atlases and `rig.version = 1`. Closed versus open differs in decoded RGBA for every great-helmet frame (85/85 gameplay and 6/6 hero). The staged `assets` directory contains both families plus `chicken.js`, whose SHA-256 matches the baseline byte-for-byte. An initial final packing subprocess failed inside Pillow; its log was retained, and the pinned-hash resume path revalidated the complete sheets and packed the candidate successfully without re-rendering. The final closed JS files are byte-identical to the earlier validated closed-review files. The manifest records the exact source and asset hashes; staging does not promote files into production.

Final checks include `qa/grip-review.cjs ROOT --full` and `--full --open`, `qa/visor-run.cjs ROOT --assets`, animation/collision checks, wardrobe/preset/backup/controller checks and live online appearance. `CK_PERF_VISORS=1 node qa/run.js perf` measures mixed open/closed families across all six arenas. Packaged restart/relocation and desktop journey acceptance verify both local visor choices and offline loading of both resolutions. None substitutes for physical-controller, different-network or human playtesting.

The completed 0.2.2 visual, performance and packaged acceptance results are recorded in `release/LAUNCH-STATUS.md` and `release/DESKTOP-ACCEPTANCE.md`. These results cover the local Windows candidate; Steam and physical-device acceptance remain separate release gates.
