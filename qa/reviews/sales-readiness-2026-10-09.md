# Sales preparation fixes — 9 October 2026

This pass fixes two buyer-facing defects and reduces measured decoder copy cost. It does not establish public-sale acceptance or deploy a hosted faction service.

## Fixed defects

The standard controller could pause an arena, story or Cup match but could not navigate to Quit; A always resumed. The existing menu navigation now receives paused input. Seven extracted-router tests and 36 real-browser synthetic-pad checks passed across those three formats. Physical controllers remain an external check. See `pause-controller-2026-10-09.md`.

The faction server rejected the desktop app's actual `custard://game` Origin. An Electron source-shell test reproduced this before the fix. The default server policy now admits only that exact custom origin, while explicit operator origin lists still replace defaults and lookalikes fail. Two focused real-socket origin tests passed. The packaged app subsequently joined brawl/CTF/siege at 8/40/100 total participants, received deltas, preserved closed/open/closed visors and sent movement through the actual DOM input path. Evidence: `qa/results/sales-readiness/desktop-packaged/result.json`.

The first hidden-window movement fixture used a fixed 350–500 ms deadline; it failed inconsistently because its hidden renderer delivered input later. Diagnostics show initial input frames about a second apart in that hidden test. The corrected harness waits for the authoritative movement condition, bounded by eight seconds, and records server input samples. This is a connection/functional check, **not** a responsiveness or physical-keyboard test. Both failed fixture runs and the original genuine origin rejection remain recorded. A separate headless Chrome rendering measurement supplies frame/receive timing below.

## Actual browser under load

One headless Chrome player connected alongside 99 scripted clients in separate worker processes to a separate local server. The viewport was 1600×950 with normal culling. The browser walked from spawn, then held attack during a 20-second measurement in a 30-second load. It was defeated and respawned, so this sample includes a spawn-area view rather than a permanently crowded central camera.

| Measure | Before | After |
|---|---:|---:|
| FPS | 59.87 | 59.93 |
| Frame p95 | 16.9 ms | 16.9 ms |
| Received snapshots/sec | 19.99 | 20.04 |
| Decoder p95 | 0.5 ms | 0.4 ms |
| Maximum receive gap | 71.5 ms | 69.5 ms |
| Decode errors / resyncs | 0 / 0 | 0 / 0 |

Both browser runs had zero captured exceptions and retained 100 participants. Evidence is under `qa/results/sales-readiness/browser-before` and `browser-after`. Source hashes and CPU profiles are retained. The earlier sample may briefly overlap a four-second microprofile from another worker; match seeds also differ. Therefore this table is integrated functional/performance evidence, **not a controlled decoder speedup estimate**. CPU profiling adds overhead. Neither test includes WAN or a minimum-spec host.

The separate controlled immutable-packet benchmark measured decoder median 99.3 → 86.8 ms for 630 updates, with 1260 exact comparisons and seven wire cases passing in Chrome. The direct copier preserves validation, isolated caller state, failed-patch atomicity, precision and legacy behavior. See `wire-profile-2026-10-09.md` for native failures, rejected candidates and maintenance limits. No payload reduction or tail-latency repair is claimed.

## Packaged verification

Alpha.3 matched 42 packaged entries to source/generated metadata. The actual Electron package passed the faction connection checks above and separate-process save/restart, launcher reuse and complete-directory relocation acceptance, preserving legacy/earned collection ownership, presets, campaign progress and settings. The existing packaged desktop journey also completed. These tests use isolated temporary profiles and never overwrite the player's saves.

## Still required for sale

The local native failure was also tested with a freshly downloaded official Node24.21.0 executable, verified against Node's SHA256 manifest; the installed Node24.19.0 executable separately matches its own official checksum. The fresh runtime still lost the core-test subprocess to `0xC0000005` (parent TAP: 88 passed, one failed subprocess; many child cases did not report). The source passed all121 hosted tests. This narrows away an on-disk executable checksum mismatch but does not identify the runtime/host cause, establish hardware failure or close the issue. See `runtime-verification.json` and `local-node2421-full.tap`; no system settings or PATH were changed.

The native Node failures and a prior microprofile mismatch remain unresolved observations; subsequent browser/hosted successes do not identify their cause. Faction bandwidth remains substantial and hosted-worker tail timing is unaccepted. No public server, authenticated persistent ranking, Steam configuration/approval, actual controller/WAN/second-PC acceptance, minimum-spec measurement or novice playtest is supplied by these checks. Eleven requested soundtrack recordings and the public support contact remain outstanding. Release documents now distinguish current implemented scope from historical acceptance and unperformed checks.

## Independent final checks

Actions run 37899377152 at `3a46a2903045d6f2dfe71e08e40a028e3e63e17e` passed the four OS/Node core jobs and both server jobs. Each full suite passed 121 tests with zero skips or failures. The initial submission had omitted the new smoke module from a staging test fixture; that fixture was corrected and its seven focused tests passed before resubmission. No runtime change was needed. Downloaded server artifacts were SHA256-verified against the upload logs; their full TAP and load JSON are retained under `qa/results/sales-readiness/`.

Container run 37899639763 passed the loopback build, health, exact desktop-Origin connection and three decoded CTF deltas. Public-overlay Compose syntax passed with an inert placeholder hostname. The Docker daemon was unavailable locally; no public instance, DNS change or certificate was created. See `deploy/README.md`. These passes do not repair the earlier native failures or certify WAN/hosted timing.
