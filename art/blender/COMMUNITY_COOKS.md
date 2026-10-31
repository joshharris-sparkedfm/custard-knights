# Community cooks

Mabel uses **canteen lady by wis.domzcd**; Alf uses **Baker's Delight by beingwallflower**; Pip uses **T-Pose Chef by ivan.morev** (added 29 October 2026, style id `t-pose-chef`: red piping recoloured teal, trousers deep teal). Their source pages displayed CC0 when downloaded on 23 October 2026. Exact source links, hashes, triangle counts, rig task IDs and atlas hashes are in `sprites/community/cooks-sources.json`.

The original downloads are preserved outside Git. Separate Blender Decimate copies reduced them to 59,999 and 60,000 triangles while retaining UVs/materials. Alf's upload copy also reduced textures from 2048 to 1024 pixels to fit the MCP transport limit. Meshy rigging cost five credits per character and supplied walking/running with 24-joint skeletons. These account-produced animation outputs are recorded separately from the original CC0 geometry. No new model generation or AI texturing was used.

## Rebuild from the archived rig outputs

Use Blender **4.1.1**, Python with Pillow, and the archived `walk.glb`/`run.glb` for each source. The scripts do not contact Meshy. Put each actor's inputs under `<input-root>/canteen-lady/rig` and `<input-root>/bakers-delight/rig`.

For each source, run the following with its source ID substituted for `<source>`:

```text
blender --background --python art/blender/bake_cook_sprites.py -- --input <input-root>/<source>/rig/walk.glb --output <input-root>/<source>/sprite-pilot --style <source>
blender --background --python art/blender/bake_cook_sprites.py -- --input <input-root>/<source>/rig/run.glb --output <input-root>/<source>/run-pilot --style <source> --height <worldHeight>
python art/blender/pack_cook_sprites.py --input-root <input-root> --output <staging-directory>
```

Read `worldHeight` from that source's `sprite-pilot/bake.json` before running its run bake. This keeps walk/run framing identical. Keep `cook_style.py` beside the baker. It adds Mabel's head-weighted cream cap and rose apron, and changes Alf's clothing to mustard without overwriting the source files.

Each actor has eight directions and 14 frames per direction: two idle, six walk, six run. The camera follows the hip translation to bake movement in place. Idle averages opposite walk poses and adds slight shoulder breathing. Direction zero faces screen-right, increasing clockwise. The packer rejects any source frame with less than two pixels of border clearance. It writes trimmed sprite rectangles, PNGs and hashes. Copy its two PNGs to `sprites/community/` and `community-cooks.js` to `sprites/` only after checking the staged result.

## Runtime and validation

`game/cook-sprites.js` loads the two PNGs independently. Missing images, unknown actors and classic mode use the existing illustrated fallback. The optional bakery actor hook draws cooks in opening, aftermath, homecoming, siege and banquet scenes. Escort speed/heading follow actual route movement; waiting cooks return to idle. Pip uses the same pipeline; its rig upload copy used 1024 px JPEG textures to fit the MCP limit. Three atlases total about 7.1 MiB decoded (3 MiB per cook budget in tests).

The 224 frames occupy 1,572,580 bytes on disk and 5,410,816 bytes of decoded RGBA pixels (5.16 MiB). No GLB, skeleton or 3D renderer runs in the game. Tests check all atlas rectangles, directional frame selection, partial load/failure behavior and escort animation stopping. Native Canvas scene captures verified carried props and preserved story/actor data. Live browser input and performance testing remains outstanding; offline captures are not gameplay recordings.

## Baked scenery props

`bake_props.py` and `pack_props.py` bake every bakery prop with one shared camera, three-light rig and AgX look; settings and palette tints live in `props.json`, provenance in `sprites/community/props-sources.json`. Run `blender --background --python art/blender/bake_props.py -- --spec art/blender/props.json --models <models dir> --output <bake dir>` then `python art/blender/pack_props.py --spec art/blender/props.json --baked <bake dir> --output <staging>`.
