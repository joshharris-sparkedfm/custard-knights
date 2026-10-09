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
