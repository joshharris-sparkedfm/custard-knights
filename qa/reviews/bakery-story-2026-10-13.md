# Independent FE08 bakery slice review — 13 October 2026

Scoped Chrome verification supports the playable bakery → pantry → return → actual bakery siege journey. This is engineering and captured-layout evidence; human story quality, physical devices, native EXE, Steam and household networks are unassessed. The broader chapter remains outside this slice.

## Evidence and provenance

The independent harness is `qa/bakery-story-browser.cjs`. It launches only isolated temporary headless Chrome profiles, records actual CDP keys/clicks and production input observations, captures the integrated game, and records SHA-256 before and after each run. `CK_QA_ROOT` selects an extracted package root without changing the harness root. No owner saves, normal Chrome sessions, runtime files, Git or release documents were changed by this reviewer.

| Run | Result | Meaning |
|---|---|---|
| `qa/results/bakery-story-2026-10-13/initial/report.json` | 5 passes, then tray-pickup timeout | Earlier candidate. CDP tap was dispatched down/up without intervening frames. Held talk worked. Pulse sampling was a fixture hypothesis, not established as a game defect; the full failed trace is retained. |
| `qa/results/bakery-story-2026-10-13/final/report.json` | 34 passes, 1 failed assertion; stable sources | Full coherent candidate at index `c140afd3`, campaign `014c31e1`, UI `0cac734e`, integration `df567f9a`, renderer `9732108d`. The failed assertion incorrectly demanded removal of the old quiet run object before the next briefing. The next scene was visible and play had stopped. |
| `qa/results/bakery-story-2026-10-13/skip-confirmation/report.json` | 3 passes; unchanged candidate sources | Corrected only the skip predicate: next scene visible, game stopped, quiet elapsed unchanged, and explicit scene skip starts actual next combat. No runtime fix was inferred from this success. |
| `qa/results/bakery-story-2026-10-13/corrections/report.json` | 7 passes; stable final sources | Focused recheck after specific lifecycle and readability changes: explicit skip, natural aftermath terminal cleanup/save invariance, compact talk/return/siege captures, no browser exceptions. The full 35-case route was not rerun unchanged; its unaffected mechanics evidence is transparently reused. |

Final observed SHA-256 values:

| File | SHA-256 |
|---|---|
| `index.html` | `c140afd3e72185bdedbabecf91f4e776c68fa040c61a1a9212ad06dfe9994163` |
| `game/campaign.js` | `014c31e1a9bb842f0f370a921dc7035a063f3fdd3d457ee6733a9f02d2aff8db` |
| `game/campaign-ui.js` | `00bf29c6bfa0d0cf083f10b80f79954942ad9c25f2b886831a0411fb80ebbb08` |
| `game/campaign-integration.js` | `cc25d908affb074e5ac0c7e69a9ffd11fce579b34cb64d882a43860b83d41dd7` |
| `game/bakery-opening.js` | `f1487619319d98306be38e7f58a4f4aaf659823bcb7ee45ecc0b088ddb5b1470` |
| `game/story-scenes.js` | `ee84901ced69557e22fda8105cc254f05c05da486873f31756561e39608e508c` |

## What was actually exercised

Fresh map navigation enters the bakery. Actual WASD/Space inputs talk to Mabel, approach the solid table by its safe southern route, pick up and visibly carry the tray, observe Steve's independent scrap theft, and deliver east into pantry combat. Holding Interact while approaching the next prompt does not automatically pick up the tray. Quiet play grants no spoons or receipts. Actual Escape, Options, Back and Resume preserve the paused objective clock.

Pantry combat was explicitly isolated by marking the initial guards and later reinforcements dead. Player positions, breakable damage, cook progress, holds and exits were not injected. Actual sword contacts break the reachable blockade; actual WASD brings Mabel, Alf and Pip through the narrow doorway, completes the defence hold and reaches the exit. This proves route and objective plumbing, not combat difficulty or an entirely input-only rescue.

Default result continuation returns to a playable bakery with the same three names. Actual input collects supplies and proceeds to the existing siege encounter. The actual siege uses the bakery geometry, named supply stations, moving cooks and visible siege bowl. A live raider reaches a station using production movement; living raiders are then explicitly stunned for 99 seconds so actual player WASD can check all three station approaches. Enemy/stand reachability and scenery were captured; this is not a complete input-only siege win.

Direct result/failure and copied legacy-save fixtures separately verify explicit aftermath skip/replay, reward invariance, direct retry, quit, reload, all eight node IDs, independent spoon ownership, Stirling's checkpoint phase and duplicate-receipt rejection. A saved controls fixture plus real Q input verifies remapped interaction. A synthetic standard pad at the navigator boundary, owned seat and safe position verifies sampled A interaction only. No physical-controller claim follows from it. Touch was not tested.

## Captured readability

Initial compact captures exposed the long objective HUD over Mabel's name/head. The concise quiet HUD is clear in subsequent talk, tray and Steve captures. Later review exposed dialogue over the delivery/supply table labels and overlapping moving cook names. The final focused captures show both labels and the supply-causality caption clear, with shortened/separated cook names.

Inspect `corrections/corrected-talk-800x500.png`, `corrected-aftermath-800x500.png`, and `corrected-siege-doorwork-800x500.png`, plus the wide counterparts. Earlier route captures include `final/tray-carried-800x500.png`, `steve-stolen-bun-800x500.png`, `05-three-cooks-safe.png`, `11-siege-raider-reaches-station.png`, and `12-siege-player-stations.png`. The wide actual siege captures show the bowl and bakery together. At 800×500 the eastern pen/gate/bowl can lie beyond the initial camera and become visible as the player moves east; these captures do not establish TV-distance or controller camera usability. The first seconds of spawn protection and combat help are transient and are not sustained-art acceptance.

No unresolved progression or save defect was observed within these bounded cases. This review does not close uncoached character/causality comprehension, pacing, enjoyment, difficulty, touch, physical pad, missing media, packaged execution or the later channel/Steve/Rind/sluice/homecoming work.
