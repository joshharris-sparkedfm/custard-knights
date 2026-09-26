# QA agents

Automated playtesters for Custard Knights. They run the real game in headless Chrome, drive the human knight through the real key state with scripted personas, and measure what happened.

```
node qa/run.js          # full matrix: every arena x every persona, bots-only baselines, difficulty and teams checks
node qa/run.js quick    # one arena per persona
node qa/run.js perf     # real-time frame rate on each arena
```

Results land in `qa/results/<timestamp>/` as `raw.json` (every KO, respawn, pickup and event with time, position, source) and `summary.md` (pace, hazard share, spawn deaths, what kills people, combat feel, power-up use, difficulty, spawn-death hot spots).

Personas (in `agents.js`): rusher, camper, collector, pacifist, fuzzer (random keys, crash hunting), idle, pro. Add one by adding an entry to `P`.

The game exposes itself to the harness only when opened with `?qa=1` (see the bottom of `index.html`). Telemetry lives on `G.log` and `G.stats` in every match, host side, capped at 20,000 entries.
