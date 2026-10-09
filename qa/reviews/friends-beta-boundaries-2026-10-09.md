# Friends beta: movement and spawn corrections

The player reported disappearing permanently after dashing and being hit in Quick Brawl. A controlled reproduction uses an actual dash followed by an empowered heavy hit during the final vulnerable dash frames. Before correction, 24 of 48 map/edge/impulse cases escaped. The exact effects in the player's incident are unknown; this reproduces the observed permanent disappearance through a legitimate combat path.

Movement previously advanced the entire impulse before collision. A strong hit crossed a tile, leaving the actor inside a solid wall or beyond the map. The zero-distance collision fallback always pushed upward. Alive actors could remain thousands of pixels off-screen.

The correction subdivides movement according to collision radius and resolves each step using the current reflected velocity. Embedded actors use the nearest valid interior escape face. Bounds are enforced before and after tile resolution, and collisions run again after fighter separation. Damage, attack timing, knockback amounts, pit rules and saved progress are unchanged. Review caught and corrected a top-edge Factory crate that could otherwise eject a knight beyond the new bound.

Respawn candidates previously cached at match creation could later become open or warning trapdoors. Respawns now filter current terrain and pending holes before scoring enemies, prefer unoccupied candidates, and retain authored safe spawns as fallback. No initial spawn marker coordinates needed changes.

Evidence lives in `qa/results/arena-boundary/` and `qa/results/arena-spawns/`. Final reports match index SHA256 `f896534cea163e60616e543c97777315467d3c4f3143165fa8d568f2b392941c`. All 408 boundary cases pass: eight arena modes, six maps, four edges and normal/empowered dash-hit cases, plus 24 embedded-crate, corner and crowding regressions. All 149 spawn/movement checks pass, including real pit falling/dashing, campaign checkpoint recovery and the separate Faction Front movement/spawn path. Both reports have zero browser exceptions. These are isolated headless game checks, not friends' playtest feedback or physical-controller acceptance.

The 26 release regressions and focused combat audit (directional contacts, stun input buffering, 24 blade-contact samples) passed after the movement correction. Existing earlier CI at 94edfde covers beta entry/title changes; it does not claim to execute the new browser boundary checks. Local native runtime anomalies remain unexplained.

New weapon types and rare chaos events are separate subsequent checkpoints. They are not included or advertised by this fix.
