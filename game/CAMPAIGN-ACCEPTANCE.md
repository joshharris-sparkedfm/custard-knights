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

- `node --test tests/campaign.test.cjs`: 18 passing regression cases for prerequisites, corrupt/migrated saves, independent spoons and duplicate receipts, objective failures and phase transitions, checkpoints, assistance, imported-save merge and unrelated-node replay preservation.
- `node qa/run.js campaign`: 46 passing checks through the real inline engine. This includes sword hits, heavy shield breaks, melee blocks, projectile reflections, crate collisions and egg pickup; every encounter's success path; KO failure, retry, reload and mode exit; once-per-encounter cosmetic goals and earned Rice Guard/Steve Strut rewards.
- `node qa/campaign-visual.cjs --input`: an automated policy completes all eight encounters using only actual WASD/Space/Shift/E inputs. It injects no health damage, positions, crate events or objective progress during play. The save is unlocked beforehand solely to select encounters independently. Actual pause/resume buttons are also checked against the running objective clock.
- `node qa/campaign-visual.cjs`: inspected desktop map/story/boss telegraph and mobile chapter map. Mobile routes scroll horizontally and focus the selected node, avoiding overlapping cards. Campaign HUD omits party score and chaos clutter.

Latest input acceptance at implementation time: `qa/results/2026-10-08T10-21-01-campaign-input/raw.json` and its `summary.md`. Earlier failed input runs led to an aligned pantry doorway and readable pudding-raider attack warnings. The final input policy completes normal difficulty with zero bridge falls and successfully baits, evades and punishes Rind before breaking the rescue crate.

These are automated engineering checks, **not human playtesting**. The skilled deterministic policy clears encounters faster than the design document's first-attempt 20–30 minute target. Chapter duration, newcomer learning, difficulty, controller feel on real hardware and voluntary return remain unvalidated; no duration or retention claim should be made from these checks.

The campaign stays a short initial chapter. It does not implement the later Angelic Delight, Jelly, Crumble or Trifle regions, co-op campaign or cinematics. Its lore names those kingdoms without promising completed encounters there.
