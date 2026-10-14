# FE09-C Steve service route: independent browser QA

14 October 2026. **32 distinct selected checks pass; no unresolved browser-check failure.** These are isolated headless Chrome/CDP engineering checks, not human, physical controller, WAN, Steam Input, GPU, native startup or packaging acceptance. Actual keyboard movement/sword attacks collect the egg, traverse the original ordered gates and complete the encounter. Living guards were explicitly stunned to isolate traversal; this is not a combat playthrough.

Behavior source: `a8f92fef7ee41cae422e01fec1ce1e582af03b8d`. Every behavior report records unchanged before/after runtime SHA256. Campaign `1b4e0acc3c07f91515b58b1ef77bf1e6f1db3c5275c05f69b2d0772b9489349b`; scenery helper `fc57f8204e0d83276676073d039a3d261c609185d77a262dd3d690a76a79c924`; scenes `559b3f07c7ce651b77c01cf0d3f35ea2bb9ece4f2381bd93c5f27eeffb08cd68`; UI `9d9c4afea69e109dfca770c65e378045a37ce96a2ca90c61eefaa0806ed190d2`.

Final cue source: `656974da0bace0c0af26be415205cce35ae9e80d`. Only campaign objective wording changed, to remove “Bowl winch → bowl winch”; final campaign SHA256 `0d334f48aabc4398820c6170871963669a19e405ae5f504c016806fa5b8a3bbd`. A separate labeled visual fixture verifies `Medium · Gate 3/3 · Bowl winch` and compact bounds at that hash. The unchanged full route was not repeated.

## Evidence and scope

- `../results/steve-route-2026-10-14/summary.json` selects the latest assertions: 32 pass, 0 fail. `manifest.json` hashes retained reports, screenshots and the harness. `qa/steve-route-browser.cjs` supports `CK_QA_ROOT` for a later separately reported packaged-assets check.
- `run1/report.json`: 21 pass, 3 interrupted suites. Actual intro/outro scene captions connect bakery scraps to the service gates and bowl winch. Actual pause → Quit to menu, timer failure → UI Retry, historical completed-save reload and map non-award checks passed.
- `corrections/report.json`: 18 pass, 3 remaining harness assertions. Natural ten-second mount expiry, route preservation, unmounted second-gate rejection, actual egg reacquisition and remaining-gate completion pass. An explicitly labeled elapsed-only fixture beyond cage-open+60 excludes the timed spoon while completion remains earned.
- `correction-cage-ride/report.json`: 16 pass, 0 fail. Actual sword inputs open the original cage (9,8); nearby egg collection mounts Steve using ordinary engine behavior. Unmounted gates and mounted out-of-order second/third gates reject progress. Actual ordered route earns completion and the within-60-seconds spoon. Repeated terminal calls preserve save and collection exactly.
- `final-cue-correction/report.json`: 3 pass, 0 fail. Final wording and compact bounds at the cue-only source. Full snapshots record all source hashes, labeled inputs/fixtures and browser exceptions; no uncaught exception occurred in any gameplay run.

The three gates retain (580,300), (820,540), (1100,440). Screenshots show the shed, scraps, actual cage, marked trail, gate posts and winch/bowl approach at 1280×800 and 800×500. Persistent HUD names the target when scenery lies outside the compact camera. Some world labels crop at screen edges or overlap entities; the HUD/target remain readable. This does not establish uncoached destination comprehension or TV-distance acceptance.

## Preserved harness failures and corrections

The sandboxed initial browser exited before `Runtime.enable`; `initial/report.json` contains zero product checks. The scoped isolated Chrome run then succeeded.

The first cage navigation attempted to walk through the intact crate from its east side and stopped at x417; corrected navigation goes north and west around it. Two final-gate movement helpers waited for x1100 after the legitimate radius-trigger win had frozen the player around x1028; the helper now recognizes terminal status.

The first correction incorrectly required the egg to remain visible and the player to remain unmounted after opening the cage. Ordinary sword-lunge proximity had already collected the egg: retained state is eggOpened≈7, mount≈9.3, pickup empty. The assertion now accepts that normal collection. The out-of-order detour then consumed the ordinary ten-second mount; the corrected case waits for natural expiry away from the egg and reacquires by actual movement before testing the ordered route. No mount physics, gate state or route physics was injected for those behavioral checks.

The first final-cue fixture asserted before the first live UI frame (elapsed0 and old HUD text); it is retained in `final-cue-polish/report.json`. The corrected visual-only fixture waits for a live frame, stages route2/mounted position, then refreshes the real UI. These are explicitly visual fixtures, not fresh gameplay completion evidence.

Copied prerequisite/old-completion saves, guard stuns, direct theatre-outro result preview, elapsed boundary and failure countdown are individually labeled in reports. The old save retains all three historical spoon booleans, attempts4, best31, assistance marker and receipt; merely opening the map cannot reward again. Neither source edits nor normal user profiles/saves were used by this QA task.
