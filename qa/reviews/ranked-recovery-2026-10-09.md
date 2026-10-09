# Private ranked recovery — 9 October 2026

Alpha.5 adds durable terminal-result staging and replay, original-slot reconnect, cumulative per-account 20-second absence budgets, explicit forfeit results and manual client reconnect. No combat, model, story or legacy-save rules changed. Server restart aborts live matches without rating; only terminal results successfully staged to SQLite recover. Missing players never become ranked bots. Repeated disconnects cannot replenish grace.

## Evidence

- 55 focused tests passed (15 store, 28 ranked server, 12 UI).
- 26 integrated headless-browser checks passed: real loopback sockets, visible pause, frozen authoritative clock, reserved identity, manual reconnect, expired-departure forfeit, ratings and memory-only credentials. Five-second test override; not a human match or WAN test.
- Six process checks passed: child exits abruptly after staging; actual server startup consumes pending result, awards each account once; second startup preserves the same profiles. Not a power-loss or failed-disk claim.
- 42 desktop package entries matched source. Actual packaged EXE save/restart/launcher/relocation passed using isolated profiles. Packaged brawl8/CTF40/siege100 joins, both visors, deltas and synthetic movement passed.
- Independent read-only review checked storage-failure lifecycle, pending health/retry, reservations and shutdown ordering; no additional blocker found. Independent hosted CI pending at this source checkpoint.

Evidence is in `qa/results/ranked-recovery/`. Browser-first/final predate the small final forfeit-copy improvement; browser-final2 and desktop-faction-final are the final local checks. Native Node full-suite faults remain unresolved; no unchanged native crash reruns were used as evidence of repair.

This remains a private host-issued ladder. No public hosting, Steam identity, physical controllers, WAN/minimum-hardware or human fun/balance acceptance is established. Existing external launch gates remain. User has now authorized generating the remaining Suno tracks and requested WAV; that soundtrack work is in progress separately.
