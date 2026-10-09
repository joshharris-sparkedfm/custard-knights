# Faction sprite composition cache — 9 October 2026

The 100-combatant renderer repeatedly composed identical layered knight frames. CPU sampling attributed roughly 1,115 ms of the ten-second profile to native drawImage, compared with 38 ms to botInput. The new faction-only LRU cache retains completed body pixels while continuing to calculate and draw connected arms, swords, effects and simulation normally. No combat rules or accepted sprite atlases changed.

Keys distinguish atlas family, frame, helmet, metal, plume, team colour, cape, emblem, blade and weapon/arm composition. The cache invalidates when any atlas finishes decoding and clears on entering/leaving faction mode. Retained RGBA pixels are capped at 32 MiB; browser canvas overhead and delayed GPU reclamation are additional, unmeasured memory.

## Measured result

Same Chrome process, fixed seed 123, 100-combatant brawl, 1600×950 viewport, central protected stationary player, 20 simulated seconds of warmup plus one real rendering second, then ten seconds per condition:

| Condition | FPS | Frame p95 | Frame p99 |
|---|---:|---:|---:|
| Cache disabled | 53.61 | 33.3 ms | 33.4 ms |
| Cache enabled | 60.09 | 16.8 ms | 16.9 ms |

The enabled sample recorded 34,138 hits and 427 misses, retaining 327 frames / 33,484,800 RGBA bytes. Evidence: `qa/results/2026-10-09T06-29-38-faction-cache-performance/performance.json`. This is one short headless QA-host sample, with disabled measured first; it is not a minimum-spec claim or sustained worst-case benchmark. A separate post-change 8/40/100-combatant sample also measured approximately 60 FPS, but used a different seed from the earlier baseline and is only corroborating evidence.

## Appearance and lifecycle

- Exact software 2D-canvas comparison passed 1,044 cases: both visor families, all six helmets, every third animation frame, held bow/swing states and varied colours/cosmetics. Zero changed RGBA channels. Cache hits, eviction and actual faction entry/exit cleanup passed. Evidence: `qa/results/2026-10-09T06-31-12-faction-cache-review/observations.json`.
- Initial GPU readback comparisons exposed 1–2-channel-level rounding differences between scratch recomposition and the copied canvas. One tolerance-1 diagnostic passed, another rejected a delta of 2. The final exact test explicitly disables accelerated 2D canvases to isolate composition semantics; this does **not** establish bit-identical GPU output. Normal accelerated screenshots were inspected with no visible kit/colour/weapon discontinuity.
- The normal-browser faction interface suite passed 34 checks, including authoritative online STEVE difficulty, deltas/resync, independent remote visor, menu lifecycle and no runtime exceptions. Evidence: `qa/results/faction-cache-ui/checks.json`.
- Source index SHA256 for these checks: `0ff7767ce533418f4a0f8c6e6946d9a86ae6a5f7223465a8c02b65c191acebc4`. Result sourceCommit fields identify the pre-change parent; this hash identifies the tested uncommitted runtime precisely.

## Remaining work

The local native Node failures remain unresolved. This change does not address the 12–12.5 Hz shared-process network load result. Next measured investigation: separate authoritative server and load-client processes to attribute CPU contention. Existing independent CI and full objective checks remain valid for unchanged simulation/server code. Physical controllers, WAN, novice play, minimum hardware and Steam acceptance remain unperformed.
