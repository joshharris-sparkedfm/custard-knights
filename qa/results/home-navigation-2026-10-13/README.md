# Home-navigation evidence

Final technical browser record: `run-3/report.json` — 44 passed checks, zero failed checks/uncaught exceptions, stable source hashes. Screenshots are captured from actual isolated Chrome after atlas loading. Review and limits: [home-navigation review](../../reviews/home-navigation-2026-10-13.md).

`run-1` and `run-2` preserve diagnostic failures and screenshots; they are not final acceptance. The review distinguishes the real held-A/layout defects from corrected QA selector and button/modal assumptions.

Reproduce from the repository root with bundled Node:

```powershell
& 'C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' qa/home-navigation-browser.cjs qa/results/home-navigation-2026-10-13/new-run
```

The harness creates temporary Chrome profiles and closes only its spawned browser processes. No normal saves, user game, physical devices, Steam service, or external multiplayer accounts are involved.
