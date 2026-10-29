# Community walk adaptation

`community_motion_bake.py` applies six sampled walk poses to the existing rounded
knight, using `visor_bake.py` for all closed/open visor geometry and layer exports.
It changes the walk branch only. Idle, swing, block, hit and victory poses retain
their existing implementation, frame order and timing. The runtime movement speed
and combat simulation are unchanged.

The six poses carry left/right foot travel, foot height, hand travel, root bob and
lean. World-space foot height is corrected for root bob before baking. Sword and
shield groups move with their corresponding hands, and weapon sockets are exported
from the resulting pose. The game continues to draw its mounted weapon with its
existing combat renderer.

## Source

- Community model: Knight Defender T-pose, by **bryarey**.
- Source: https://www.meshy.ai/posts/01964de9-75b0-786e-ba70-637191871712
- The model page displayed **CC0** at download, 23 October 2026.
- Meshy rig task: `01a16839-17ea-7012-adb3-584c04771204`.
- Motion: the walk supplied with that rig, sampled at 24 points over 1.033333 s;
  every fourth sample maps to one of the game's six walk poses.
- Sample JSON SHA-256: `09dc9325c1ff4ccda61bb749ba6e819db248d3542a766ec0f9ffdbe81fb2ddcc`.
- The rig and animation were produced through the owner's licensed Meshy account.
  This is distinct from the CC0 license on the community model geometry.

The defender mesh is **not shipped as the player**. Its automatic skinning bends
the fused shield, so only suitable movement samples were adapted to the original
separately modelled knight parts. No runtime Meshy service, credentials or GLBs
are needed.

## Rebuild

Run from the repository with Blender 3.6.23 and Python/Pillow available:

```powershell
python scripts/stage-sprites.py visor-pilot --source art/blender/community_motion_bake.py --blender <blender.exe> --run-dir <new-staging-folder>
python scripts/stage-sprites.py visor-full --source art/blender/community_motion_bake.py --blender <blender.exe> --run-dir <same-staging-folder>
```

Pilot source hashes must match the full build. The staging script validates all
layers, image bounds, sockets, visor differences and packed atlas rectangles.
It never promotes staged files automatically. Promote complete matching families,
and preserve `chicken.js` byte-for-byte.

The initial paired pilot checked all five directions: 30 changed walk frames and
55 pixel-identical non-walk frames per visor. All 30 walk sockets changed; all
non-walk sockets were identical. Native Canvas captures can inspect the actual
game compositor, but do not replace browser input, collision and performance QA.
