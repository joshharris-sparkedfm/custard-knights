# The Great Pudding War: playable first chapter

Implemented 8 October 2026. The game now offers **A Very Bad Banquet**, all eight authored encounters from the campaign specification. Seven encounters form the main route, with the Biscuit Toll as an optional reflection trial. Later kingdoms remain explicitly labelled story destinations beyond the playable chapter.

| Encounter | Playable success condition | Authored behavior |
|---|---|---|
| Somebody Has Thrown a Pie | Defeat two guards, then capture the pantry exit | Sparse combat, clearly marked doorway |
| Protect the Puddings | Clear two waves with at least one stand surviving | Raiders target three destructible stands; visible warnings precede stand attacks and nearby player attacks |
| A Spoon at a Sword Fight | Defeat one rice guard | Predictable frontal shield, heavy/bash guard breaks and flanking |
| The Biscuit Toll | Physically reflect three arrows | Infinite training arrows, refillable guard and a bonus five-reflection window |
| A Bridge Too Flan | Reach three checkpoints, then capture the far end | Three narrow dashable gaps; safe outer route; three allowed falls and checkpoint respawns |
| Your Knighthood Is Pending | Block three swings, defeat Stirling, hold lunch | Three scripted phases, actual block/parry attribution, contested objective and phase checkpoints |
| Release the Chicken | Break a real crate cage, collect the egg, ride three gates | Guaranteed Steve pickup, mounted route, replacement egg if the power expires |
| Skin in the Game | Defeat Rind and free the rice soldier | Fixed slam telegraph, generous punish window, second-phase shield guards, explicit allied sweep damage, playable living-skin rescue |

The map shows the next destination, prerequisites, optional route, three independently saved spoons and exact requirements. Dialogue can be skipped and replayed. Failure offers retry, a specific tip and optional assistance. Assistance grants additional campaign health and slower authored warnings; it can complete the story. Boss/examination checkpoints survive reload. Resuming a checkpoint cannot award the full-run flawless spoon. Replaying a different encounter preserves an unfinished boss checkpoint.

Campaign results bypass normal match coins and Cup placements. The integrated household cosmetic callback credits one encounter completion per actual victory and grants Steve/chapter milestones. The collection integration deduplicates its reward and finish callbacks using the encounter round receipt. Cosmetic rewards change no combat stats.

## Verification

- `node --test tests/campaign.test.cjs`: 22 passing regression cases for prerequisites, corrupt/migrated saves, independent spoons and duplicate receipts, objective failures and phase transitions, checkpoints, assistance, imported-save merge, unrelated-node replay preservation, cancelled stand attacks, contested objectives and boss timing cues.
- `node qa/run.js campaign`: 49 passing checks through the real inline engine. This includes sword hits, heavy shield breaks, melee blocks, projectile reflections, crate collisions and egg pickup; every encounter's success path; KO failure, retry, reload and mode exit; once-per-encounter cosmetic goals and earned Rice Guard/Steve Strut rewards; named checkpoint controls in the map, story and failure screens.
- `node qa/campaign-visual.cjs --input`: an automated policy completes all eight encounters using only actual WASD/Space/Shift/E inputs. It injects no health damage, positions, crate events or objective progress during play. The save is unlocked beforehand solely to select encounters independently. Actual pause/resume buttons are also checked against the running objective clock.
- `node qa/campaign-visual.cjs`: inspected desktop map/story/boss telegraph and mobile chapter map. Mobile routes scroll horizontally and focus the selected node, avoiding overlapping cards. Campaign HUD omits party score and chaos clutter.

Latest input acceptance: `qa/results/2026-10-08T10-37-13-campaign-input/raw.json` and its `summary.md`. Earlier failed input runs led to an aligned pantry doorway and readable pudding-raider attack warnings. The final input policy completes normal difficulty with zero bridge falls and successfully baits, evades and punishes Rind before breaking the rescue crate.

## Animation and fairness refinement for 0.2.1

The review identified a concrete fairness defect: a raider displaced from a pudding stand could keep a partly completed attack timer, then return and damage the stand without a complete new warning. Stun, leaving attack reach and changing the target now cancel that timer and its warning. Returning starts the full 1.4-second warning. Two focused regressions cover interruption and destruction of the previous target.

Attack warnings now fill toward the impact time and show a progress ring. Enemy melee windups also show the aimed sector. Rind raises a visible spoon during the warning, leaves a short impact ring and cracks at the fixed target, then shows a lodged spoon and a green recovery countdown around his vulnerable position. The normal 1.15-second warning and 2.8-second recovery, and assisted 1.5/3.8-second windows, are unchanged. These effects use simulation time, respect pause and have bounded lifetimes. No flashing effect was added. Labels sit above knight nameplates after visual inspection found an overlap in the first revision.

Capture points show actual hold progress. Contested lunch changes to amber and explicitly asks the player to clear the circle, explaining why its timer stops. The map, resume story and failure screen name the saved phase (for example, Shield wall) and explain that retry restores health. Save format and the eight encounters are preserved.

Inspected frames are in `qa/results/2026-10-08T10-37-08-campaign-visual/`: early/middle/late Rind warnings, impact, recovery, examiner warning, contested pie, named checkpoint retry and desktop/mobile map. Scene positions and checkpoint state were deterministic screenshot setup; those captures are visual inspection, not input acceptance. The separate input policy completed all eight normal encounters after the changes, including the bridge in 5.53 simulated seconds with no falls and Rind in 34.07 seconds with two accepted hits. Pause/resume still passes. These expert-policy timings are reachability evidence, not expected newcomer chapter length.

These are automated engineering checks, **not human playtesting**. The skilled deterministic policy clears encounters faster than the design document's first-attempt 20–30 minute target. Chapter duration, newcomer learning, difficulty, controller feel on real hardware and voluntary return remain unvalidated; no duration or retention claim should be made from these checks.

The campaign stays a short initial chapter. It does not implement the later Angelic Delight, Jelly, Crumble or Trifle regions, co-op campaign or cinematics. Its lore names those kingdoms without promising completed encounters there.
