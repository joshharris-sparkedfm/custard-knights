# CK-05 optional first-fight study - 12 October 2026

Frozen runtime: 83f81e4a467fcd7d03af94ae04f4dbb4ebcfc323 (beta.6). This closes the engineering gap for independent solo arena-selection and density comparisons; CK-05 human acceptance remains open.

The Settings flow requires explicit local-report consent and offline solo enrollment. Curated/random arenas both use eight knights; four/eight density variants both use Courtyard. Other setup is FFA, one human, Easy bots, Simple chaos and 90 seconds. Existing hints are shared. No variant-specific weapon/HUD/combat redesign is added. A random map can legitimately be Courtyard.

Assignment is reused after abandonment and completed comparisons are blocked only while their records are retained. Clearing, opt-out, storage loss, truncation or another device can allow repeats. This is not participant identity. Results are retained solo trials grouped by build/variant, not unique people, causal lift or retention. Recognition is an optional self-report. Normal-round continuation is a later offline normal arena start in the same session, not immediate second-round attribution. General round metrics also include study rounds; their trial fields and separate summaries distinguish them.

Settings, seats and tutorial counters restore after completion/abandonment; studies grant no progression and do not increment the beginner-play count. Normal experienced-player flow is unchanged. A review found that pagehide previously restored settings but could leave the study alive on a back-forward-cache return. It now returns to the menu before recording exit. The new focused lifecycle assertion covers this correction.

## Evidence

- `qa/results/first-fight/unit.tap`: 18 focused tests (7 study/report assertions, 11 existing collector tests).
- `source-lifecycle/report.json` and `packaged-lifecycle/report.json`: 38 checks each, zero exceptions. All four variants, linked assignment/outcomes, actual timer completion, recognition deduplication, configuration/progression/counter restoration, retry, normal continuation, consent erasure, network rejection, story/Cup/faction/menu transitions and cached-page return.
- `reporting-source/report.json` and `reporting-packaged/report.json`: 30 regression checks each, zero exceptions.
- `package-final.json`: all 58 archive entries match runtime source or generated metadata. `desktop-final.json`: actual EXE isolated save, normal close, restart, launcher and relocated installation pass.
- `ci-summary.json`: run 38223169999, all six Windows/Linux Node core/server jobs passed at the frozen runtime.
- `exports.json`: final preview/friends identities; all 73 friends game files and both ZIP integrity checks pass. PREVIEW-BUILD.md carries the human-readable identities.

Paths above are relative to `qa/results/first-fight/` except the first fully qualified path. Initial `source/report.json` is a retained harness failure: the fixture set nonexistent map `bakery`, causing ordinary rematch to reject undefined map data. Correcting the fixture to existing `factory` passed (`source-final`). No runtime map fix is claimed. Pre-lifecycle package/source results are retained but final identity is in the lifecycle and final package reports. An initial metadata-document edit failed on the system text encoding; it was rerun explicitly as UTF-8 before the final exports. No gameplay error was suppressed.

These are synthetic isolated-profile tests with forced assignments and timer/transition fixtures, not human observations, real controller or WAN acceptance. No user save was used or normal player window closed. No data upload, public release or tester sending occurred. Earlier local Node/Python native failures remain unexplained despite hosted CI success. See release/playtest/FIRST-FIGHT-STUDY.md for the human session procedure.
