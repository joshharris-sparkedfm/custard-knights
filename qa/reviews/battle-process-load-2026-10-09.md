# Separate-process battle load — 9 October 2026

The server can sustain approximately 20 broadcasts/sec in this one-room scripted workload when it has its own event loop. Client decoding and input generation still miss timing targets. This pass changes only diagnostics and documentation: game, server, wire protocol and the alpha.2 package are unchanged.

## Method and provenance

`node qa/mass-battle-process-load.cjs 60 result.json 4` runs one authoritative server process and four client processes, each with 25 real WebSocket connections. Every client parses and applies all full/delta updates and actively chases, aims, attacks, guards, dashes and uses role abilities. The parent coordinates readiness and retains native child-exit failures. Child windows start on IPC receipt after joining; all five processes share one host's CPU/memory and loopback network. Metrics exclude joins. The room uses its existing random seed; these are not controlled same-seed before/after runs.

The local two-second harness check and one 60-second measurement completed. Independent [Actions run 37896205066](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/37896205066), source `09551a4a821aa8ab990f29a296cdd7bdd13e1990`, passed both jobs:

- Windows job `113708006451`, Windows Server 2025, four logical CPUs, AMD EPYC 9V74, Node 24.21.0.
- Linux job `113708006657`, Ubuntu runner, four logical CPUs, AMD EPYC 7763, Node 24.21.0.
- Local host: i9-14900K, Node 24.19.0. The raw JSON records its logical CPU count.

Evidence is retained in `qa/results/process-load-2026-10-09/`. Cloud JSON was extracted from the complete authenticated job logs by removing per-line timestamps; the logged JSON object was then parsed and preserved. Per-file source hashes were recorded before child launch. Git checkout line endings explain raw Windows/Linux hash differences. The workflow retains its original result artifact for 14 days.

## Results and limits

| Measure | Local Windows | Hosted Windows | Hosted Linux |
|---|---:|---:|---:|
| Measurement wall time (server) | 60.01 s | 60.02 s | 60.03 s |
| Simulation advancement | 60.00 s | 60.04 s | 60.05 s |
| Broadcasts/sec | 20.00 | 19.98 | 19.99 |
| Lowest client receive rate | 19.98 Hz | 19.96 Hz | 19.98 Hz |
| Lowest client input rate | 18.58 Hz | 16.10 Hz | 15.62 Hz |
| Worst client receive gap | 92.85 ms | 194.18 ms | **1773.52 ms** |
| Server CPU, percent of one core | 11.82% | 12.57% | 14.54% |
| Each 25-client worker CPU | 21.4–23.7% | 50.4–52.1% | 66.1–67.4% |
| Server tick p95 | 7.98 ms | 18.12 ms | 10.49 ms |
| Server tick frequency | 29.23 Hz | 24.11 Hz | 30.17 Hz |
| Aggregate received application payload | 211.56 Mbps | 205.92 Mbps | 204.81 Mbps |

All three runs retained 100 connected scripted participants, with no decode errors, unexpected disconnections, input rejections or rate-limit rejections. They recorded 395, 406 and 385 combat kills respectively. All child processes exited cleanly. Slightly more simulated than wall time in hosted results comes from the tick crossing the measurement boundary; it is not accelerated gameplay.

**Protocol status passed; timing acceptance did not.** The harness separately records its timing flag (minimum input/receive rate 19 Hz and simulation/wall ratio at least 0.98). It is false on all three hosts because of input delivery. That flag also does not impose a worst-gap budget; the Linux 1.77-second receive stall independently rules out a smoothness claim. Hosted Windows advanced in real time using fewer, larger simulation steps than the 30 Hz timer target. Average rate alone must not be presented as responsiveness.

Compared with the earlier shared-loop 12–12.5 Hz result, these measurements support shared-event-loop contention as a major contributor. They do not prove every delay was caused by it. Worker CPU and event-loop stalls warrant client-decoder profiling before changing replication. The higher payload versus the earlier 122–132 Mbps run accompanies a higher delivered update rate and different match evolution; this is not a bandwidth regression caused by a runtime change. It remains roughly 2.05–2.12 Mbps per recipient, excluding WebSocket/TCP/TLS overhead.

The local run did not crash. **The earlier native failures are still unresolved**; a different paced workload completing does not repair the isolated 100-bot test or identify its cause. No old failed tests were relabelled.

## Next measured work

Profile the wire decoder and quantify one real browser client's receive/apply/render time while other connections load a separate server. Use this to distinguish worker saturation from a single player's cost, then evaluate bounded payload/decoder optimizations with exact reconstruction tests. Reproduce the client-tail stall with instrumentation if needed; do not merely repeat unchanged passing loads. WAN latency/loss, physical controls, human responsiveness, long worst-case matches, minimum hardware and actual deployment remain unperformed. No new package is needed for this diagnostics-only checkpoint.
