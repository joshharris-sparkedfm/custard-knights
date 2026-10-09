# Private ladder implementation — 9 October 2026

Alpha.4 adds working host-issued identities, SQLite-backed rating/history records, individual skill queues and UI for a private faction ladder. It also fixes blank casual matchmaking getting stuck on full/finished default rooms. Combat, accepted art, save formats, story, Cup and wardrobe rules are unchanged.

## Evidence

- 35 focused Node24 tests passed: nine identity/store cases, nineteen real-socket matchmaking/server cases and seven UI lifecycle cases. Store tests include rollback injected midway through a transaction, idempotent/conflicting result IDs, reopen persistence, revocation, draws, rating bounds and 20/50-player team rosters. Server tests include 8/40/100 human queue launches, balanced counts, owned skill in casual bot balance, no bot awards, late credential revocation, duplicate connections, cancellation, persistence error/retry and no success before commit.
- Seventeen actual integrated headless-browser checks passed with one UI client and seven scripted sockets. The queue remained waiting beyond the connection timeout, cancellation/rejoin worked, a full-human battle rendered, result UI showed a persisted rating, secrets stayed out of browser storage and ratings survived closing/reopening the database. Terminal match state was a fixture, not a human-completed match. First harness attempt used the casual button name for the new ranked action; it failed before joining and was corrected. Both reports are retained.
- The existing 34 faction UI checks passed after updating its obsolete explanatory-text expectation. Offline difficulties, all sizes, synthetic input, casual online, deltas/resync, visor and connection recovery remained functional.
- Packaged alpha.4 matched all 42 runtime/metadata entries. Fresh-process save/restart, relocation and launcher acceptance passed. Actual packaged Electron brawl/CTF/siege connections at 8/40/100 slots passed, with both visors, deltas and synthetic DOM movement. The initial desktop fixture selected the new access-key field by its placeholder and failed authentication; selecting the Room code label corrected the fixture. This was not evidence of a game/server connection failure. The earlier failed fixture remains recorded.

Evidence is retained under `qa/results/private-ladder/`. Headless/synthetic checks do not establish physical controllers, human enjoyment, WAN performance or Steam acceptance. Source hashes in browser reports identify their exact loaded UI. Earlier native full-suite failures are unresolved and were not rerun merely to seek a pass.

## Review corrections and limits

Independent review identified a compatible older matchmaking group blocked by a fresh middle-rated entrant; the selection algorithm now filters each participant's permitted span and checks at most seven widening bands. Unchanged queue retries run once per second rather than every combat tick. The agent measured a 512-entry pure matcher sample at about 2.46 ms; this is diagnostic timing, not cloud capacity acceptance.

Match results freeze their original roster and payload. Writes retry three times with identical IDs/payloads; success is reported after durable commit. Profile-read failures after commit explicitly say the result was saved. Exhausted writes retain the room for host/shutdown retry and expose degraded health; they remain in memory rather than a cross-crash recovery journal. A subsequent process crash can therefore lose a result that never committed.

The private ladder requires complete human teams and disqualifies a match after a departure. This avoids awarding bot-assisted wins but permits intentional disconnects to avoid losses. Reconnect grace, leaver penalties, anti-collusion/sanctions and human calibration remain necessary before calling it a public competitive season. Steam identity, public hosting/TLS and real-device acceptance are not supplied by this feature. Do not represent host-issued access keys as verified Steam ownership.

## Hosted and export handover

The code is being submitted to independent Windows/Linux full-suite and container checks. The container configuration includes a private data volume; its new test covers host-key issuance, full-human launch, container restart preserving identity and revocation. No public host, DNS or certificate has been created. Append completed run IDs and final exported hashes after verification; until then existing alpha.3 artifact references remain historical frozen builds.

## Completed handover

At source `9e8ac15e23f3ab11c137d7b38f78b0e74ca65d6e`, Actions run `37923390377` passed all four core matrix jobs and both server jobs. Full Node24 suites passed **156/156 on Windows and Linux**, zero failures or skips. Both 60-second shared-process 100-client delta loads completed without protocol failures; Windows simulation reached59.64s and Linux60.01s. Payload measured163.59/210.85Mbps. These noisy shared-runner samples remain diagnostics, not WAN/timing or bandwidth acceptance; no controlled speedup claim.

Container run `37923390319` passed its ordinary custom-Origin/delta smoke and seven private-ladder checks: non-root writable storage, eight distinct authenticated humans, zero bots at launch, restart recovery, preserved identity, no rating for abort, and revoked-key rejection. Artifacts were downloaded and verified against their published SHA256 digests before retaining TAP/JSON under `qa/results/private-ladder/ci/`.

The Windows alpha.4 preview and friends ZIP were exported from that source. Preview ZIP:178900232bytes, SHA256 `437a1de62952a5f69b5397c31cb3cf3c26dafa8769c4e7cbf27ed3bbc1a3d7ee`. Friends ZIP:178897085bytes, SHA256 `b4ffb21b8b3424e42c7c6431df3482e05be277a086b2334d98415f263c9984b0`. App archive SHA256 `ceaacd1e6c0f1ea2e8795323742cb2c132e94a9484d4a722ad8b9cb7790801a4`. All73 shared game files matched the preview byte-for-byte. Exact paths and use are in PREVIEW-BUILD.md. No public endpoint or Steam publication occurred.
