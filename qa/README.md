# QA agents

For current implementation and verification priorities, start with the [master build plan](../BUILD-PLAN.md). Reports in `reviews/` and dated results in `results/` are historical evidence, not a current defect list or proof of a fresh test run. Automated personas cannot establish human enjoyment, sharing or retention; the [player-behaviour roadmap](../PLAYER-BEHAVIOUR-ROADMAP.md) defines the proposed human research.

Automated playtesters for Custard Knights. They run the real game in headless Chrome, drive the human knight through the real key state with scripted personas, and measure what happened.

```
node qa/run.js          # full matrix: every arena x every persona, bots-only baselines, difficulty and teams checks
node qa/run.js quick    # one arena per persona
node qa/run.js perf     # real-time frame rate on each arena
```

Results land in `qa/results/<timestamp>/` as `raw.json` (every KO, respawn, pickup and event with time, position, source) and `summary.md` (pace, hazard share, spawn deaths, what kills people, combat feel, power-up use, difficulty, spawn-death hot spots).

Personas (in `agents.js`): rusher, camper, collector, pacifist, fuzzer (random keys, crash hunting), idle, parrier, pro. Add one by adding an entry to `P`.

The game exposes itself to the harness only when opened with `?qa=1` (see the bottom of `index.html`). Telemetry lives on `G.log` and `G.stats` in every match, host side, capped at 20,000 entries.


## Release acceptance

```text
node --test tests/*.test.cjs         # pure models, saves, settings and desktop/build rules
node qa/run.js regression           # session, seats, rewards and audio regressions
node qa/run.js cup                  # the complete three-round local Cup flow
node qa/run.js campaign             # real engine collision/objective/failure/save hooks
node qa/campaign-visual.cjs --input  # real keyboard policy through all eight encounters
node qa/collection-run.cjs          # rewards, previews, presets, backups and malformed packets
node qa/network-acceptance.cjs      # live PeerJS profiles, joins/rematches/Cup/outfit propagation
node tests/desktop-acceptance.cjs   # real process restart, fresh profile and persistent saves
node tests/desktop-package.cjs      # exact packaged runtime/source comparison after packaging
node qa/run.js soak                 # real-time renderer/audio graph; default 60 minutes
```

`CK_SOAK_MINUTES` sets real-time soak duration. `CK_SOAK_REPORT` sets its live JSON status path. Inspect a running report and process before starting another long soak. A passed older-source run is evidence for that baseline, not automatic certification of later changes.

Campaign engine checks use deterministic positioning/damage setup to isolate collision and objective behavior. The separate input policy drives only the game's real controls during each encounter. Neither measures first-time human difficulty or enjoyment. Live PeerJS checks use one computer/network; physical controllers, Steam Input, other PCs and different-network connections remain separate acceptance tasks.

The release review in `release/GAMEPLAY-REVIEW.md` relates measurements to concrete animation/gameplay decisions. Capture scripts retain actual rendered evidence. Promotional generated illustrations must remain separate from actual game screenshots and footage.
