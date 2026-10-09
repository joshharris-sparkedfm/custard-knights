# Deterministic faction objective audit

Completed 9 October 2026, 04:58:47 UTC, with Node **v24.19.0** in a hidden child process. The retained parent process record confirms child PID 16964 exited **0**; stderr was empty. The audit source SHA-256 is **796475c3d6c29406f96e8b1e103465b95621bf96e788843c4f0371e3038f6d3a** (`game/mass-battle.js`).

All nine matches used **100 bots**, 50 per faction, seeds 123/987/456, and a 600-second match limit. This was accelerated deterministic simulation, not a live 100-human session.

| Mode | Seed | Simulated seconds | Result |
|---|---:|---:|---|
| Brawl | 123 | 128.917 | Rice score victory, 379–401 |
| Brawl | 987 | 124.067 | Rice score victory, 356–400 |
| Brawl | 456 | 131.500 | Rice score victory, 378–400 |
| CTF | 123 | 126.233 | Rice flag victory, 2–3 |
| CTF | 987 | 171.500 | Rice flag victory, 2–3 |
| CTF | 456 | 283.717 | Custardia flag victory, 3–2 |
| Siege | 123 | 180.967 | Custardia destroyed Rice castle |
| Siege | 987 | 600.000 | Rice won at time; remaining castle health 1599.6–1974.1 |
| Siege | 456 | 94.050 | Custardia destroyed Rice castle |

The process completed all nine samples. Mean simulation-step cost per sample was **0.02154–0.03034 ms** on the development machine, excluding rendering, serialization and networking. Final JSON snapshots were **42,904–54,703 bytes**. Neither statistic proves minimum hardware or public-server capacity. Three seeds per mode do not establish faction balance; all three sampled brawls favoured Rice. Actual human sessions must assess strategic choices, fairness, travel time, roles and fun.

The accompanying core suite passed **23/23 tests**, including directional light/heavy/bash attacks, front/rear guard, timed parry, dash during stun, simultaneous opposing contacts, bot refill, trusted-rating adaptation, CTF recovery/capture, siege objectives, simultaneous-result draws and bounded state. Ordinary attacks and dash do not spend guard energy. New battle startup/active/recovery timings intentionally differ from the original arena.

`audit.json` contains complete sample measurements and source identity. `exit.json` retains the real child exit status. `stdout.log` is the small 11 KB-or-less audit transcript. Earlier inline tool invocations reported exit 1, including one native V8 stack; the detached retained run did not reproduce those interruptions. Their cause was not established, and no engine fix is claimed.

## Cosmetic amendment after the objective audit

The core subsequently gained a sanitized per-human `visor` field, included in snapshots and reset to closed when a bot refills a vacated seat. It changes no movement, combat, AI or objective rule. This amended core SHA-256 is **1e08cc3c46fa360d32592315fe1d3470a998f5580cd31baab7f32ac15e9fedfd**. Its suite passed **24/24 tests** on Node v24.19.0, including independent open/closed choices, invalid-visor rejection and the existing 50v50 objective regression. The nine-match audit JSON intentionally retains its original source hash and pre-amendment snapshot byte counts; those counts exclude the later visor field.
