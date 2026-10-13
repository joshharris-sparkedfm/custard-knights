# FE05 room continuity implementation handoff

Read-only source audit by /root/room_contract_audit (gpt-6-luna, high), 13 October 2026, against the beta.13 controls worktree. No tests were run for this audit. Implementation must begin only after PR30 is checked and merged.

## Concrete gap

`index.html` uses a dense `PARTY.seats` device array. Deliberate `partyLeave(i)` splices it; rendering, `SEATS[n-1]`, device-seat lookup, actor creation, profile loading and `startCup()` derive logical identity from the resulting indices. Removing a middle participant can therefore shift the surviving device, cosmetic profile and `local:<seat>` Cup key. Temporary device loss already reserves the seat in beta.12 and must retain that behavior. Beta.13 controls also follow logical P1–4, not transient controller indices.

`game/cup.js` already removes disconnected entrants from readiness and votes while retaining their historical points. Only connected listed keys score; late remote arrivals are observers for the current Cup and join a fresh Cup. Remote keys are live PeerJS connection IDs, not durable authenticated reconnect identities. Host loss has no migration.

## Bounded next implementation

Keep four fixed logical local profile slots (`local:1` through `local:4`), separating occupancy and device binding. Deliberate Leave deactivates a slot without relabelling survivors; temporary controller loss reserves it for deliberate reclaim. Preserve the existing `ck-profile`/numbered cosmetic profiles and saved controls. A Cup departure should retain historical points, remove readiness/vote requirements and prevent later scoring; continue with a visible vacancy. New entrants wait for the next Cup. Rejoining the same local slot should reclaim its profile, without inventing account identity.

Room continuity here is in-memory across results, Options, rounds and a second Cup. Do not claim persistence across app reload, Steam identity, host migration, native guest multiseat or authenticated parties. Keep the supported host-sofa plus individual-guest topology. Native two-sofa work remains FE13.

Likely touchpoints: `index.html` party model/render/leave/start, `deviceSeats`, `reclaimDevice`, `humanInput`, `prepareArenaSeats`, `newGame`, `startCup`; `game/cup.js` departure/state validation; `game/cup-ui.js` vacancy/readiness copy. Preserve existing recovery and remapping invariants.

## Required focused evidence (not performed by this audit)

- Middle local seat leaves: remaining logical keys, devices, outfits and control maps stay unchanged.
- Temporary loss and deliberate reclaim still target the same P number; occupied devices cannot steal a seat.
- Three Cup rounds and a second Cup retain keys, appearance and selected rules; readiness/vote ties remain deterministic.
- Local departure and remote disconnect remove absent readiness, retain past points and cannot score afterward.
- Late guest remains an observer until the next Cup; host loss reports interruption honestly.
- Local 1/2/4 and supported host-local plus individual guests exercise the implementation. Synthetic same-host evidence remains distinct from physical-pad, human and WAN acceptance.

The plan and acceptance matrix remain the scope authority. Full FE05 acceptance also needs real household/device and repeated-session evidence.
