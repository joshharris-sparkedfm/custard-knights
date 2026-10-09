# Wire decoder profiling — 9 October 2026

The decoder now copies its already-validated snapshot records directly instead of serializing and parsing the entire returned state. A same-packet Chrome microbenchmark reduced median decoding time from 99.3 ms to 86.8 ms over 630 updates (12.6%). This is a small client CPU improvement, not a network-bandwidth reduction or evidence that the previous long client stalls are fixed.

## Evidence and method

`qa/wire-profile-browser.cjs <baseline-module-path> <result-directory>` starts an otherwise empty headless Chrome page. It loads the actual core and both wire implementations, creates deterministic seed-612 matches with 100 combatants for brawl, CTF and siege, and records 210 encoded updates per mode. Each has two full snapshots and 208 deltas, including periodic recovery baselines, attacks, projectiles and effects. The 630 packets are parsed and recursively frozen once, then reused unchanged for both decoders. Both outputs must exactly match the serialized authoritative snapshot at every update: 1,260 comparisons in total.

Three unmeasured warmup pairs precede eight measured rounds, alternating old/new ordering. Simulation, encoding, JSON network parsing, rendering and output verification are outside the timed loop. CDP samples the baseline decoding phase separately; much of its self time is attributed to `apply` after inlining, with validation next. The parent task separately sampled an actual browser client rather than inferring browser cost from synthetic load workers.

Final evidence: `qa/results/wire-profile-browser-final-2026-10-09/profile.json`.

| Measure | Original decoder | Direct validated-record copy |
|---|---:|---:|
| Median time, 630 packets | 99.3 ms | 86.8 ms |
| Median time per packet | 0.158 ms | 0.138 ms |
| Fastest batch | 93.3 ms | 84.2 ms |
| Slowest batch | 160.7 ms | 155.1 ms |

Chrome was 154.0.8037.98 on the local Windows QA host. Packet SHA256: `daeee5cf73949df6b4e000cd547657e9e8149f3295864889a9afadd375e7b8aa`. Original wire SHA256: `e1a2b6ffe63ae8f51004cfbc42baa1fa4f494e0b1a71926d73be51d98360ceef`. Final wire SHA256: `2352b8315e9a675a0387ea780856dd2809d835c82bb144fa5a85d1a6cb96ff22`. File line endings can change raw hashes on checkout; the benchmark records the bytes it actually loaded.

Earlier candidates are retained, not selectively hidden: the original-vs-original baseline, a generic recursive-copy candidate that was slightly slower (93.2 to 96.0 ms) and was rejected, and the first record-copy run (95.9 to 87.1 ms). The final repeat followed addition of defensive regression tests. Brief CPU work from the initial baseline microprofile may have overlapped the parent task's first 20-second actual-browser measurement; the parent was told immediately so it would not be treated as an uncontended baseline.

## Behaviour preserved and checks

The encoder, wire version, payload precision and ordering rules are unchanged. Full validation still runs before accepting a full snapshot and after constructing a candidate delta. Failed patches cannot advance or partially modify the private baseline. Copies cover all nested mutable branches: players/attacks, world/empty obstacles, control, scores, flags, castles, projectiles and effects. Optional undefined fields remain omitted and negative zero is normalized exactly as before by JSON serialization. Legacy unversioned full snapshots remain readable. No caller receives internal state references.

All seven wire cases ran in Chrome, including the existing 630-frame exact reconstruction test, reconnect/reset, malformed/reordered deltas and legacy snapshots. Three new regressions additionally passed Node 24.19.0: mutation of every returned/packet branch, optional-field/signed-zero compatibility, and rejection after a valid earlier patch branch. Their native output is retained beside the final browser result.

The full original native Node24 wire test process failed before this change. A Node22 profiling attempt produced a native stack trace; both logs are retained in `qa/results/wire-profile-native-failures-2026-10-09/`. The first Node24 profiling attempt also reported a baseline mismatch but did not retain an isolated mismatch artifact before the subsequent native failure; this is an unresolved observation, not a diagnosed core defect or a passing result. Stable Chrome reproduced all exact comparisons. These outcomes do not repair or identify the cause of the previously recorded native failures. `qa/wire-profile.cjs` retains a native profiler for independent-host follow-up.

## Limits and maintenance

Only validated schema records use the direct copier; untrusted top-level patch values still use the existing defensive JSON clone before validation. If a future schema adds another nested object branch, its copier and mutation-isolation tests must be extended together. Timing varies across batches, and the absolute single-player saving is small. Do not claim faster network transport, 100-human deployment readiness, minimum hardware performance or fixed tail latency from this microbenchmark. Integrated browser/server checks and independent hosted tests remain the parent task's acceptance work.
