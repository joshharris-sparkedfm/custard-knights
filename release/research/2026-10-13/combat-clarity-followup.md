# FE06 bounded follow-up audit

Read-only audit by /root/room_contract_audit (gpt-6-luna, high), 13 October 2026, frozen source14a5527b0cf56592ce752e74c4937aaba0625bb4. No files or tests were changed by the auditor. Implement only after PR31 is checked and merged.

## Concrete instruction gap

`index.html` Fight/help, early match cards and dynamic keyboard/pad/touch prompts describe holding Swing for a heavy. The current sword state machine around lines1428–1436 instead resolves the initial press as a light swing, begins charge only after that swing/cooldown while the control remains held, and launches the heavy on release. Players therefore need to keep holding through the first swing/recovery, then release after charging starts. The same explanation issue was recorded in qa/reviews/combat-research-2026-10-09.md.

The heavy normally deals one heart, has stronger knockback and breaks guard; it is not generally a double-damage move. Extended reach depends on charge duration. Pickup weapons have different fire behavior, so sword instructions must not promise heavy attacks while firing a pickup.

The smallest next engineering task is consistent, concise and accurate sword action guidance across canonical Fight text and dynamic/remapped instruction surfaces. Preserve combat timing, balance and all existing controls. Check instructions against actual state transitions and keyboard/pad/touch presentation, then retain novice/experienced physical-input execution and comprehension as human acceptance.

## Existing work to preserve

- player-controls-2026-10-12 review and source/network results cover Chicken Race human peck, mouse/Space input, weapon levels/swaps/ammo reset.
- ranged-aim-2026-10-13 review/results cover independent aim, visible cues, ownership and guest movement/firing.
- arena-size-2026-10-12 and roomier-arena-2026-10-12 reviews cover Classic/Roomier geometry/objectives and Rooftop bot routes.
- weapon-variety-2026-10-09 review covers Crossbow/Croissant ammo/collision/reflection/snapshots.

These are historical, version-scoped automated observations, not human feel, physical-pad, household-network or full-map fun acceptance. The audit did not substantiate another damage/block/whiff source defect: distinct feedback and guard cues already exist. Do not reimplement passed mechanics or claim all FE06 acceptance complete. FE07 warning/banner arbitration follows the bounded instruction fix; playable story dependencies and the explicit native two-sofa/200-combatant milestones remain unfinished.
