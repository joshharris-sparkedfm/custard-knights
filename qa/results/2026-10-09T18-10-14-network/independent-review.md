# Guest prediction change: independent review and live PeerJS acceptance

Reviewed the frozen `index.html` diff and ran the existing `qa/network-acceptance.cjs` without modification, using bundled Node v24.19.0. All **25 live PeerJS acceptance checks passed**; process exit code 0. The harness creates three fresh, isolated headless Chrome profiles, connects real PeerJS peers, and closes those processes at completion. The user's running game and profile were not accessed.

Source SHA-256 was verified unchanged after the run: `b74a99b498c033266b7d931a738836b1975fa4ed1bb98f26fdc39c6195643e14`.

## Independent code review

No blocking regression found in the changed paths.

- Guest collision and movement operate on `prediction`, `target`, and `shown` coordinate copies. Host-provided `e.vx`/`e.vy`, HP, score, deaths, lives, dead/falling state and round identity are not recalculated by the new presentation path.
- `clientRecv` retains its matching-round and active-round guards. Wrong-round snapshots and packets received after the round ends do not enter the changed snapshot path.
- Invalid actor count or nonfinite position/velocity rejects the packet before resetting the 150 ms prediction budget.
- The expiry budget uses unscaled elapsed wall time, including delayed animation frames. Slow motion reduces projected travel rather than extending a stale packet's predictive lifetime.
- Matching-round duplicate snapshots retain the existing acceptance behavior; there is no new sequence-number protocol. Each accepted duplicate resets the target from the packet's authoritative coordinates rather than accumulating travel from the previous prediction. Ordered reliable PeerJS transport remains the existing delivery assumption. This change does not claim general same-round out-of-order snapshot rejection.
- Health, scores and round rewards remain host supplied. The live suite verified authoritative rewards, no awards to waiting players, one match count per participating guest across three rematches, Cup rewards and guest disconnect handling.

The implementing agent's separate targeted browser report, `qa/results/client-containment/final/report.json`, was read and checked: 962 cases, zero escapes, zero recorded failures and zero browser exceptions, on the same source hash. It contains explicit gameplay-state invariants and wrong-round, invalid-packet, duplicate and delayed-frame cases. That suite was reviewed, not redundantly rerun here.

## Limits

The 25 live checks run on one machine/network; they do not establish cross-network NAT/WAN behavior or physical controller acceptance. The existing live harness fails on evaluated page exceptions but does not subscribe to every asynchronous browser exception; no blanket zero-console-error claim is made for it. Direct prediction/state invariants are covered by the separate targeted fixture, while live PeerJS coverage exercises lobbies, active/waiting peers, rematches, rewards, Cups, cosmetic synchronization and disconnect recovery.
