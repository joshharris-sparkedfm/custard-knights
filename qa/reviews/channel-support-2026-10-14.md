# FE09-B focused channel/support engineering QA — 14 October2026

Tested runtime commit `29291248115eba0b3418e335509c778d2a2db2e7` on branch `codex/channel-stirling-support`. This is bounded local engineering evidence, not human story acceptance or input-only combat completion. Runtime bytes remained identical before/after every browser invocation.

## Results and original failures

- `run-01/report.json`:35 pass,5 fail; exit1. Preserve this result. Its25 passing non-layout checks include actual ordered gate/safe route/fall/dash movement, tools advancement without blocks, ally exclusion, gate collision, continuous hold resets/opening, copied checkpoint1/2 reconstruction and resumed spoon exclusion, duplicate-safe receipts, actual theatre captions and no uncaught browser exceptions. Ten compact gameplay geometry checks pass. Four failures incorrectly demanded a visible gameplay HUD while theatre/result overlays intentionally hide it. The fifth used the inherited immediate navigate/read helper for reload, which did not wait for the new document to finish. The precise race was not separately instrumented; the synchronized targeted reload below passes.
- `corrections/report.json`:8 pass,2 fail; exit1. Corrected active-surface geometry passes for both actual theatres; a genuine Page.reload followed by complete-document wait retains the copied historical save and collection exactly, with raw localStorage and before/after snapshots in `compatibility`. Two remaining failures demanded the entire existing scrollable result panel fit into500px, including costume reward content. The retained screenshots show visible Continue/map actions and ordinary overflow scrolling. These are overly strict harness assertions, not evidence that runtime failed the task.
- `results-correction/report.json`:6 pass,0 fail; exit0. Result-only targeted checks confirm visible Continue actions and horizontal fit, then actual CDP mouse-wheel scrolling reveals the lower reward actions in both result overlays. No unchanged route/hold/combat suite was repeated.

Do not sum these overlapping invocations as independent acceptance coverage. All required focused behavioral cases have passing evidence; the original failed logs remain available. No runtime changes were made in response to these harness corrections. Each run records source and harness SHA256, inputs, fixtures and exceptions. Original harnesses are retained alongside their reports.

## Actual inputs and fixtures

W/A/S/D drives the upper dry path (y200) through real collision physics. Landing approaches x480/x800 clear the solid abutments before entering gold gates. Visiting the far gate first cannot advance route0. The safe route completes with no fall/dash/Biscuit and spoon flags `[true,true,false]`. A separate actual walk into the second pit restores checkpoint1. The optional dash uses actual D+G input after explicitly staging the player at x290,y440; only that approach position is injected.

Stirling phase0 advances the cart using actual movement/proximity with zero blocks. Stirling is scripted support outside hostile entities; the live blocked-pursuer counter increments. Living enemies are explicitly stunned to isolate traversal; access defender KO is explicitly injected, so this does not establish combat balance or an input-only defeat. Phase2 uses actual player movement to collide with the closed gate, leave/re-enter the circle, and finish the hold. One living stunned enemy is explicitly relocated into the circle to exercise contested reset, then away to finish. Column21 has no floor shortcut across rows1..16 before the hold; the gate opens only after success. Copied legacy checkpoint1/2 fixtures reconstruct delivered tools/support and retain the stage meaning; checkpoint2 assistance is true. Resumed runs cannot earn a new flawless spoon. Existing all-three ownership/best31/attempts4/assistance/receipt and collection survive full reload.

Repeated finish calls leave durable save/collection unchanged; reported completions are unique and tied to launched rounds. Optional parry remains unearned in the zero-block run; historic parry ownership remains owned. No new claim about physically earning a parry was tested here.

## Layout evidence and limits

Actual captures are1280x800 and800x500. `run-01/02-channel-first-landing-*`, `04-channel-recovered-*`, `05-channel-gap-dash-*`, `07-access-defender-*`, `08-tool-hold-*` and `11-contested-tool-hold-*` preserve live staging. `corrections/post-expiry-tools-support-*` waits6.5 seconds of ordinary frames, without hiding UI, so transient startup banner/controls have expired. The compact frame shows cart, movement prompt, Stirling's support label/counter and objective; the HUD still overlaps part of the north actors. The initial compact tools frame has a banner/HUD overlap and should not be represented as fully clear startup readability. Channel checkpoint banners also temporarily overlap the upper view. No TV-distance or fresh-player comprehension acceptance is claimed.

Actual theatre captions describe channel/tools/support. Corrected theatre captures are `corrections/12-theatre-{bridge,stirling}-*`. Result scroll reachability is in `results-correction/result-{bridge,stirling}-scrolled-800x500.png`. The original result compact captures show the ordinary vertical scroll state.

Each browser invocation uses an isolated temporary Chrome profile and closes only that owned browser. No normal user save, normal browser session, game process, native failure retry, GPU fixture, broad soak, physical controller, Steam Input, WAN or package acceptance was involved.

## Exact identity

| File | SHA256 |
|---|---|
| index.html | e0904ae54bbace909bfae3d963821599c665e2a5c53cb98df12ac42c72711820 |
| game/campaign.js |321b0cfada69df1222010c1d1e8b51cf4e6dbd6b0565e036dd446b4d9dd8995a |
| game/channel-support.js |64735a3bc5fb17a6e32be1835c10bd84c6c732880eccd950cd3ed3bfa37dd16e |
| game/campaign-ui.js |a00ca2529125c8900211db65d27c6bbcd2ac773d9e690e2b2ea7efcf2aff8d54 |
| game/story-scenes.js |cf2b469e07f817923d37af56f7fa63232a678a9d3dd70c113e85e36df28d42f1 |
| game/campaign-integration.js |2b8050791432238cc3ec48cf7a71ca36f9a33ba335b1e3a2a0e730d22b06bbd9 |
| game/bakery-opening.js |49204ee38bda412fd62e78348968ce8bdec23f5a9d458d26d01557d5a28f8919 |

Harness SHA256: run01 `051d772cb46ec81dce6a94c4b3fc80804377eb09093fa339c3a99149e28c873d`; corrections `115006e772b2b78606b112e252d1b3011df4973707b1a16497de1c25e573a223`; final/result correction `3631f6a22fe451aaa1e9ad664a8fc4a2f3d8d491e98048f263126e56fd5482f7`. Harness syntax check passes. Evidence manifest records retained file hashes.

Implementer-reported source validation (not independently repeated): `node --test tests/campaign.test.cjs tests/channel-support.test.cjs tests/story-scenes.test.cjs tests/story-transitions.test.cjs`, exit0;43 tests pass,0 fail (campaign31/channel3/scenes4/transitions5), duration157.3647ms. Implementer reports syntax checks for campaign/helper/scenes all exit0. Root separately records successful CI run38545366019 at this source commit in the result directory.