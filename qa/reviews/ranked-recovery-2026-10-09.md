# Private ranked recovery — 9 October 2026

Alpha.5 adds durable terminal-result staging and replay, original-slot reconnect, cumulative per-account 20-second absence budgets, explicit forfeit results and manual client reconnect. No combat, model, story or legacy-save rules changed. Server restart aborts live matches without rating; only terminal results successfully staged to SQLite recover. Missing players never become ranked bots. Repeated disconnects cannot replenish grace.

## Evidence

- 55 focused tests passed (15 store, 28 ranked server, 12 UI).
- 26 integrated headless-browser checks passed: real loopback sockets, visible pause, frozen authoritative clock, reserved identity, manual reconnect, expired-departure forfeit, ratings and memory-only credentials. Five-second test override; not a human match or WAN test.
- Six process checks passed: child exits abruptly after staging; actual server startup consumes pending result, awards each account once; second startup preserves the same profiles. Not a power-loss or failed-disk claim.
- 42 desktop package entries matched source. Actual packaged EXE save/restart/launcher/relocation passed using isolated profiles. Packaged brawl8/CTF40/siege100 joins, both visors, deltas and synthetic movement passed.
- Independent read-only review checked storage-failure lifecycle, pending health/retry, reservations and shutdown ordering; no additional blocker found. Hosted CI now passed all six jobs on the corrected test checkpoint; exact results are below.

Evidence is in `qa/results/ranked-recovery/`. Browser-first/final predate the small final forfeit-copy improvement; browser-final2 and desktop-faction-final are the final local checks. Native Node full-suite faults remain unresolved. The isolated later local pass recorded below does not establish repair.

This remains a private host-issued ladder. No public hosting, Steam identity, physical controllers, WAN/minimum-hardware or human fun/balance acceptance is established. Existing external launch gates remain. User has now authorized generating the remaining Suno tracks and requested WAV; that soundtrack work is in progress separately.

## Frozen alpha.5 exports

Source checkpoint: `06e6c596c08e470202b75950231fc8b6ca24d75e`. The tested dist was copied without rebuilding while separate soundtrack work continued. These exports contain the existing 1/12 available tracks.

- Windows preview ZIP: 178901914 bytes, SHA256 `1d666c942ffa3280a81048863aaf0ee8f83c0458e2c3736f44f8d9019ecdbc20`.
- Friends ZIP: 178898283 bytes, SHA256 `cb379a632e0bf39450c3eee03b76dbaca82d0d75139e24a01f4aa8cb5f93704a`.
- Packaged application archive: SHA256 `416e240626f1c803b7b789749fd63f7f9fa4558ac807cb78d8947b371d40a532`.
- Both ZIP integrity checks passed. All 73 game files match between frozen dist, preview folder, preview ZIP and friends `Game/`; build metadata and its file hashes match the same source checkpoint.

The first friends-bundle attempt using PATH Python 3.11.15 exited with native access violation `0xC0000005` before a finished ZIP existed. The 155481468-byte `outputs/tmpiilnkay8.partial` remains preserved; the failure is recorded in `qa/results/ranked-recovery/friends-export-failure.json`. One alternate-runtime attempt using bundled Python succeeded. This does not establish that the native failure is fixed. Exact export and verification results are in `qa/results/ranked-recovery/export.json`; no game rebuild, public upload or GitHub release attachment occurred during export.

## Independent CI follow-up

Run [37925028651](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37925028651) passed all four core matrix jobs and the Linux server suite; Windows passed 175/176. Its existing 100-socket test assumed disconnects completed within 150 ms and observed 100 humans instead of 90. The test now awaits the authoritative 90-human/10-bot snapshot with a bounded timeout, then checks both snapshot and state. No runtime change. The focused test passed; an unplanned full local run also passed 179/179, including three newly added music-catalog tests. That isolated native pass does not resolve the previously recorded native crashes. Both original TAP files remain in `qa/results/ranked-recovery/ci-first/`.

Independent recheck [37925748486](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37925748486), source `f776baf63f33e374f930bbb46e2ea9c3cac4bae8`, passed all six jobs: Windows and Linux Node 24.21.0 each passed 176/176 full-suite tests with zero failures or skips, each passed 6/6 abrupt-process journal recovery checks, and all four Windows/Linux × Node 22/24 core jobs passed. Both 60-second, 100-client scripted loopback loads completed without protocol errors or unexpected disconnections. These shared-process functional results do not establish production timing, WAN, human-play or minimum-hardware acceptance.

Container run [37925028516](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37925028516), source `06e6c596c08e470202b75950231fc8b6ca24d75e`, passed the container smoke and 7/7 private identity/restart/revocation checks. The two server artifact ZIPs and container artifact ZIP each matched the SHA-256 digest returned by GitHub's artifact API. Extracted TAP, journal, load and container evidence, API metadata and digest verification are in `qa/results/ranked-recovery/ci-final/`. The frozen alpha.5 exports retain their original tested runtime; this CI correction changed the asynchronous test assertion only.
