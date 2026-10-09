# Gameplay and animation review — 8 October 2026

This review combines the repository's current build plan, inspected gameplay captures, actual engine tests and automated input policies. It is not a human playtest. The shipped candidate scope is tracked separately in LAUNCH-STATUS.md.

## Completed 0.2.2 character refinements

The original rounded model style is retained. Every helmet has a closed visor (default, no visible eyes) and an open option with small recessed eyes. Both are free wardrobe choices, retained in local profiles, outfits, backups and online appearance. The connected shoulder/elbow/wrist renderer removes the duplicate melee arm/hand; charge, contact and recovery are smoothed, victory raises the blade, and the floating shield-side glove is corrected. Combat rules remain unchanged.

Both complete sprite families were rebuilt together with matching arm-free, tint and occluded companion layers. Actual in-game review covered all six helmets, metal tints, eight facings, attacks, earned headgear, cape patterns, Steve and victory poses. Closed/open grip checks passed 3,225/3,207 assertions; 31 visor/controller/save/reload/asset checks passed, along with 41 actual-sprite animation checks. Source acceptance also passed 59 unit tests, 24 regressions, 25 live PeerJS checks and 41 classic-renderer animation checks. No new soak was necessary; the prior completed soaks remain correctly scoped below.

Mixed closed/open knights measured 60.0–60.2 FPS across six short arena samples on the QA host, after render jobs stopped. This is not a minimum-spec claim. Packaged offline/online/restart/relocation checks and eight controller/window journey checks passed. All 35 runtime payloads match source byte-for-byte; generated package metadata matches field-by-field. Four sprite roots have a combined unique RGBA pixel budget of 206.86 MiB; this excludes browser/GPU overhead and is not resident-memory measurement. Human enjoyment and hardware/network acceptance remain unperformed.

## Baseline findings

The expanded-source 72-match suite completed 216 simulated minutes with no reported errors. Human scripted sword contacts landed 50% of 4,243 swings; bots landed 49% of 23,946. An aggressive rusher averaged 39.2 KOs/23.8 deaths, while the more defensive pro averaged 33.8/18.8. Those results show an offence/survival tradeoff in these policies, but cannot establish human readability or balance. No blanket damage, cooldown or bot-difficulty retuning is justified by these automated policies alone.

Arena hazard shares range from 4% in the courtyard to 31% on the rooftops. Median respawn separation ranges 390–477 pixels, compared with a roughly 44-pixel knight. Idle players had 2% early deaths; immediately attacking rushers had 14%, and attacks intentionally end spawn protection. The rooftop remains the most demanding movement arena. Preserve the distinct hazards; test novice understanding with people before flattening difficulty from bot statistics.

All eight campaign encounters were completed on normal assistance settings using only real movement/attack/block/dash input during play. The checks also verified real-time pause/resume, bridge falls/checkpoints and boss recovery. Automated completion is faster than a first human playthrough; no 20–30-minute duration claim is supported. The chapter is a sequence of short authored encounters, and the repeatable arena/Cup formats are the core replay content.

Legacy reviews from 26 September are historical and contain superseded observations, such as missing gamepad support. New review conclusions use the implemented controls, invites, tutorial, death feedback and baked art rather than copying those obsolete findings.

## Completed 0.2.1 refinements

The shared four-frame baked swing now follows actual attack startup, contact and recovery. Light, heavy, dash-stab and shield bash have distinct weapon movement. Charge anticipation, velocity-directed dash lean, hitstun, guard-break and whiff cues improve the visible state of combat. Cosmetic depth order, crown clearance and reduced-flash behavior were corrected in both baked and classic renderers. Guest snapshots retain millisecond swing precision and the additional presentation fields. Real combat timing, range, damage, cooldown and hit-stop are unchanged.

Campaign attacks show timed warning progress and aimed sectors. Rind raises his spoon, strikes with visible cracks and enters a clearly marked recovery period. An interrupted pudding attack now cancels completely and restarts its warning before another attempt. Contested objectives show capture progress, and retry panels name the checkpoint and restored health. These cues use simulation time and pause correctly. Normal and assisted boss timings remain unchanged.

The desktop journey review also fixed controller checkbox/slider activation, lost focus and scroll after saving wardrobe changes, stretched result portraits and horizontal menu overflow at the minimum window size.

Validation: 57 unit tests; 41 focused animation/browser checks; 24 regression checks; 21 live PeerJS checks; 49 campaign integration checks; all eight normal encounters completed using automated keyboard input; and six packaged desktop journey checks. All 34 packaged runtime files match source. The refined six-arena performance pass measured 60.1–60.2 FPS on the documented QA host. Packaged offline play, live online rounds, fresh profiles, normal process restart and installation relocation passed. Detailed attack windows and review procedures are in `qa/ANIMATION-REVIEW.md`; campaign evidence is in `game/CAMPAIGN-ACCEPTANCE.md`; desktop evidence is in `release/DESKTOP-ACCEPTANCE.md`.

The rendered comparison sheets and boss/objective frames accompany the output candidate. These checks establish correctness and inspected presentation, not human enjoyment, novice difficulty or minimum hardware requirements. Physical controller and different-network testing remain external. Soak scope/results are recorded in LAUNCH-STATUS.md. The tested 0.2.0 archive remains available as the prior baseline.
