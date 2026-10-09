# Battle stability and bot review — 9 October 2026

This pass changes diagnostics and continuous integration, not game rules or the exported preview.

## Native failure isolation

`qa/core-isolation.cjs` executes the existing synchronous assertions without the `node:test` child process and flushes each entered test to JSONL. On the local Node 24 runtime it passed the first 31 cases, then exited with `0xC0000005` during the 100-participant/35-second simulation case. This reproduces the failure outside the test runner. Prior Node 22, Node 24 and JIT-disabled failures remain retained; none is reclassified as a pass.

The exact same tracked core and tests passed on independent GitHub-hosted Windows and Linux runners with both Node 22 and Node 24. Run: https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37890962347 . This is evidence against a universally reproducible JavaScript assertion defect. It does not identify the local native-crash cause, certify local server stability or establish hardware failure. No machine settings were changed.

Pinned official Actions now run the core matrix and an independent full-suite/server-load check when relevant code changes. Logs/artifacts retain failures as well as passes for 14 days; retained summaries below should be kept in the repository for longer-term handover.

## Actual browser simulation

- `2026-10-09T05-56-14-faction-bot-audit`: all 12 mode/profile combinations completed 35 simulated seconds with 100 bots, combat activity and finite bounded state.
- `2026-10-09T05-58-13-faction-objective-audit`: all 12 mode/profile combinations completed a seeded full match (seed 123, maximum 600 simulated seconds). Every CTF match reached three captures. Easy and Hard siege destroyed a castle; Medium and STEVE reached the time limit with both castles damaged and resolved by remaining health. Those timed outcomes are not claimed as castle destructions. Brawls reached their score limit.
- This is functional objective coverage, not evidence that STEVE feels hardest to human players. Full-match multi-seed balance, physical controls and novice feedback remain outstanding.

## Rendering sample

`2026-10-09T05-56-57-faction-performance/performance.json` measures ten seconds per size in headless Chrome at a 1600×950 viewport on the documented local QA host. The local observer is stationary and protected at the centre after 20 simulated seconds of warmup; normal viewport culling is enabled.

| Combatants | Mean FPS | 95th-percentile frame | 99th-percentile frame |
|---|---:|---:|---:|
| 8 | 60.10 | 16.9 ms | 17.0 ms |
| 40 | 60.10 | 16.9 ms | 17.0 ms |
| 100 | 50.00 | 33.4 ms | 50.0 ms |

The 100-combatant sample misses a consistent 60 FPS target. This is a measured optimization task, not proof of acceptable minimum specifications. No networking, human play or other PC rendering was included.

## Independent full suite and delta load

[Actions run 37891071166](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37891071166), commit `1b8fad09499f190720626567966bcf622de4fc57`, passed all six jobs. Both Windows Server 2025 and Ubuntu 24.04 ran **110/110 unit tests with zero skipped tests** on Node 24.21.0. Their downloaded TAP archives were SHA256-verified against the job logs, then the TAP files were retained under `qa/results/stability-2026-10-09/`.

Each server job then completed 60 seconds with 100 active loopback WebSocket clients decoding every full/delta snapshot. Both had zero disconnections, decoding errors, rejected inputs or rate-limit rejections. These are connection/protocol stability passes; the load harness does not enforce a timing budget.

| Measure | Windows runner | Linux runner |
|---|---:|---:|
| Wall time | 60.06 s | 60.04 s |
| Simulation advancement | 54.50 s | 59.36 s |
| Actual input delivery/client | 9.22 Hz | 12.01 Hz |
| Actual received snapshots/client | 11.99 Hz | 12.50 Hz |
| Maximum snapshot gap | 300.45 ms | 183.76 ms |
| Aggregate application payload | 122.06 Mbps | 132.30 Mbps |
| Mean delta packet | 12,501 bytes | 13,023 bytes |
| Payload saving vs same-run extrapolated full snapshots | 76.71% | 75.82% |
| Simulation tick p95 | 6.46 ms | 4.92 ms |

**The configured 20 Hz target was not sustained.** One process runs the server plus all 100 decoders/scripted clients, so these timings include artificial shared-event-loop contention. They are not an isolated-server capacity result, and the Windows run lost about 9.3% of real-time simulation advancement. The reduction is relative to a same-run full-state extrapolation, not a controlled before/after bandwidth experiment. Raw load JSON, source hashes and job IDs are retained in the same evidence directory. Git text checkout uses different line endings on Windows and Linux, so raw source hashes differ across those hosts.

Next actionable work: separate server/client load processes to attribute contention; optimize the measured 100-combatant rendering bottleneck; then test representative network latency/loss and human responsiveness. Do not re-run this unchanged passing matrix merely to accumulate more checks. The local native runtime fault is still unresolved and must not be described as repaired by remote success.
