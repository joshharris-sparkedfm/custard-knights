# Orchestrator execution queue

13 October 2026 · Durable handoff for the explicitly renewed 30-minute build loop. Active automation ID: `custard-knights-build-orchestrator` (verified by root; every 30 minutes).

The user renewed automation authorization after the earlier removal. Historical removal remains true; its no-recreation instruction is superseded for this requested build loop. The root orchestrator owns coordination, integration and this queue. [FULL-EXPERIENCE-PLAN.md](FULL-EXPERIENCE-PLAN.md) and [ACCEPTANCE-MATRIX.md](ACCEPTANCE-MATRIX.md) remain the scope and acceptance authority. Documentation is not a gameplay pass. Latest friends beta.9 is frozen at `ae262b505ca9758de008df53418a06e26695a8a7`; earlier exports remain preserved.

## FE-01 bounded inventory

Read-only inspection of the original checkout on `codex/playable-bakery-opening` found modified `game/campaign-integration.js`, `game/campaign-ui.js`, `game/campaign.js`, `index.html`, plus untracked `game/bakery-opening.js`. Tracked diff: 39 additions/12 deletions across four files; this count excludes the untracked renderer. Source suggests a quiet bakery prelude, Mabel/tray/lane proximity stages, a renderer/script hookup, speech overlay, opening/skip/replay controls and continuation through aftermath. These are intended changes, not demonstrated behavior.

Inventory complete; WIP isolation, save effects, route/collision reachability, input/skip/pause/retry and callback/reward idempotency validation remain pending. No gameplay tests or ordinary saves were touched. Preserve the original checkout, exports and running user sessions. Do not merge the bakery WIP wholesale. Selectively carry a reviewed patch into a fresh task worktree when FE-08 prerequisites are met. Existing-video location is still pending; do not regenerate assets because of that uncertainty.

## Priority and dependencies

| Order | Work | Dependency / next bounded output |
|---|---|---|
| 0 | FE-01 inventory | Above complete; isolate and validate WIP during FE-08, retain beta.7 evidence separately |
| 1 | FE-04 ranged-aim contract prerequisite | Implement visible arena pad aim cue and Faction reticle; explicit retention/deadzone policy and seat ownership; review before full menu/physical-seat acceptance |
| 2 | FE-02 / FE-03 references and home | Lock existing game references/provenance, then four routes, Back/focus/modal ownership, clear loading/results; unavailable video input does not stop menu code |
| 3 | FE-04 / FE-05 couch and persistent room | Complete remap/prompts/seat reconnect after FE-03; room/Cup preserves seats/rules/outfits/readiness; honest departure/rematch paths |
| 4 | FE-06 / FE-07 combat clarity and CK-09 | Affected weapon/race/map cases after FE-04; warning mixer/banner priority after combat cues |
| 5 | FE-08 / FE-09 coherent story | FE-01/02/03/06 first; isolate bakery→pantry→siege consequence; then channel/Steve/Rind/sluice/homecoming, compatible saves and retries |
| 6 | FE-10 live art/media | FE-02/06/08; rounded faction/role silhouettes, both visors, approved media/captions/audio |
| 7 | FE-13 native network | FE-04/05; supported host-sofa WAN first, versioned guest multiseat for 4+4 next; RPT remains separate |
| 8 | FE-14 / FE-15 service and 200 total | FE-01/05 service adapters/party/identity; FE-06/10/14 then 8→40→100→200 capacity, replication/backpressure and distributed/rendered measurements |
| 9 | FE-11 / FE-12 CK-22 / CK-24 | FE-05/07; bounded House Rule/attributable chain, then opt-in local gameplay sharing/cost; recipient pilot requires explicit messaging authorization |
| Continuous | FE-16 / FE-17 | Bounded new native-fault hypotheses and named-PC profiling; human discovery once FE-05/08 support it; revise observed defects |
| Final | FE-18 / FE-19 | Freeze only advertised checked scope, isolated saves/package; actual devices/second PC/WAN and Steam account/platform acceptance stay separate |

The ranged-aim task is an early FE-04 engineering prerequisite, not a claim that FE-04's FE-03 dependency or physical acceptance is complete. Original CK-01–24 retain their mappings in the plan: CK-01–03→FE-04/05/13/18; CK-04/05→FE-17; CK-06–08→FE-06/10; CK-09→FE-07; CK-10–13→FE-08/09; CK-14–16→FE-05; CK-17/18→FE-03/10/17; CK-19–21→FE-16/17/18; CK-22→FE-11; CK-23→FE-18/19; CK-24→FE-12. Public parties/ranking and 100v100 remain required unfinished work, not waived by external gates.

## Current task records

Every active record must retain owner, model, effort, branch, files, progress, evidence and next action. Replace placeholders with actual agent/worktree identities when dispatched; never describe a proposed branch as created.

| Task | Owner / model / effort | Branch / files | Progress / evidence | Next action |
|---|---|---|---|---|
| Queue and FE-01 inventory | Root coordinator + scoped documentation child / gpt-6.1-sol / medium | `codex/orchestrator-build-loop`; queue and roadmap documents | Complete; PR24 merged at `ca0ec8e`, verified on origin/main on 13 October | Preserve original bakery WIP; validate only in its scoped story task |
| Ranged-aim prerequisite | `/root/aim_implementation` / gpt-6.1-sol / high; `/root/aim_qa` / gpt-6-luna / high; `/root/aim_review` and `/root/aim_beta_package` / gpt-6.1-sol / medium; root integration | `codex/ranged-aim-contract`, `work/custard-knights-aim` from `ca0ec8e`; game/input/QA plus beta.8 manifests and guide; PR25 | Complete engineering/package: 26 focused tests, affected final pause7, Chrome20, PeerJS16, packaged20 and actual EXE save/restart/launcher/relocation pass. 60 package entries/73 friends files and both ZIPs verified. Independent review cleared; all six CI jobs passed run38370863397 at frozen5c9b02f. Evidence: qa/results/beta8-desktop and ranged-aim-2026-10-13. No physical acceptance | Root merges PR25 before dispatching FE-02/03. Verify current remote/PR state on resume; do not duplicate completed aim work |

PR25 was verified merged at `e162741509816b94a7276ec1e39701896ce92897` before this next task started; the ranged-aim row's merge action is complete.

| Active task | Owner / model / effort | Branch / files | Progress / evidence | Next action |
|---|---|---|---|---|
| FE-02 existing home asset lock | `/root/home_references` / gpt-6-luna / high | `codex/four-route-home`, `work/custard-knights-home`; release/research/2026-10-13/home-asset-lock.md only | Complete bounded reuse inventory; reuse existing art/fonts/research, prior story-video location remains unresolved | Deliver provenance/composition constraints to implementer; no new generation |
| FE-03 four-route home increment | `/root/home_implementation` / gpt-6.1-sol / high | Same clean branch from e162741; index.html and bounded menu modules/tests | Source complete; 64 focused tests and 44 actual-browser checks pass; independent review cleared focus, held-A and minimum-window fixes | Independent browser QA/review, affected checks, then root integrates PR |
| FE-03 browser QA | `/root/home_qa` / gpt-6.1-sol / medium | Same branch; qa/home-navigation-browser.cjs and qa/results/home-navigation-2026-10-13 | Run3 passes44/44 with stable hashes and no console errors; fresh/returning, Back/modal/focus, seat preservation and 800x600/1280x800 captured; failed runs retained | Run final production source, retain failures; physical/human acceptance remains separate |

Use Sol at medium/high for implementation and Luna at medium/high for bounded audits/tests. Astra requires a recorded complex escalation reason. Assign one scoped code owner; the independent reviewer receives the tested final diff and evidence. Root handles integration. Complete, check, push, PR and merge each task before the next integration task starts. Parallel work requires disjoint files and separate worktrees; never duplicate an active agent's task.

## Each 30-minute wake

1. Inspect live agents, worktrees, Git status/branches/PRs and this queue. Resume actual work; do not restart completed tasks or overwrite WIP. Use latest `origin/main` for each new implementation worktree.
2. If an owner is progressing, leave it assigned and advance a disjoint actionable task when available. Update records only with actual progress/evidence. Do not spend a turn only polling while engineering is actionable.
3. Diagnose a stalled agent once, retain its patch/evidence, then reassign a bounded task if needed. Avoid repeated unchanged passing tests/soaks and unchanged native-failure retries without a new hypothesis.
4. Run affected checks; independent review follows tests. Resolve findings, then root pushes/opens/merges under standing authorization and records commit/PR/evidence before selecting the next integration task.
5. External asset/hosting/account input blocks only dependent work. Continue independent code; never fabricate human fun/story/music, real device, household WAN, public service or Steam acceptance.
6. Notify only on meaningful change, completion, failure or required user action; stay quiet when unchanged. Stop scheduling work once the authorized roadmap is complete or the user cancels the loop; preserve honest external-gate status.

Beta.9 release owner: /root/home_package, gpt-6.1-sol medium, same branch; package version/manifests/guide and qa/results/beta9-* only. Preparation complete; frozen source and actual EXE/ZIP verification next. Root integrates Git and queue/checkpoint. Physical/human acceptance remains open.

## Beta.9 completed increment and next dispatch

PR26 records the four-route home increment from e162741. Frozen runtime ae262b505ca9758de008df53418a06e26695a8a7; source64 focused tests, independent Chrome44, packaged44, actual EXE routes/Quit cancel13 and save/restart/launcher/relocation passed. All60 package entries/73 Friends files and both ZIPs verified; all6 hosted jobs passed run38373900190. Independent /root/home_review (gpt-6.1-sol medium) cleared after focus, held-A and minimum-window fixes. Owners completed; source/package evidence is in qa/results/home-navigation-2026-10-13 and beta9-desktop. Root verifies PR26 merged before next integration; don't resume completed agents or repeat unchanged checks.

Next bounded engineering: remaining FE-03 first-launch accessible setup and optional learning path, reusing existing settings and never forcing reporting, signup or tutorial. Also retain remaining loading/failure/online-match-menu acceptance as explicit FE-03 work. Then complete FE-04/05 couch ownership/persistent rooms and FE-06 before the causal story slice. The four-route home alone does not close FE-03; physical/human acceptance remains pending. Existing video location remains unresolved; menu engineering needs no new generation.

## Active onboarding task — 13 October 2026

PR26 verified merged at4e00591703de06cff0fb2c1e6dd46722fe2fdfea; beta.9 is frozen and its agents are complete. New clean worktree work/custard-knights-onboarding, branch codex/first-launch-practice, starts from that main commit. Original bakery WIP preserved unchanged.

| Task | Owner/model/effort | Files | State / next action |
|---|---|---|---|
| First-launch setup and real-action practice | /root/onboarding_implementation; gpt-6.1-sol high | index.html, scoped new game modules and unit tests | Active; skippable existing settings, replayable safe practice, restore normal state and exclude training rewards/reports |
| Browser QA | /root/onboarding_qa; gpt-6.1-sol medium | qa/onboarding-browser.cjs, dated results/review | Prepare isolated fresh/returning/skip/replay/input/progression/state restoration checks, then verify stable final source |
| Independent source audit | /root/onboarding_review; gpt-6-luna high | Read-only runtime/evidence | Audit state/reward/report boundaries; review final diff, escalate specific complex uncertainty if needed |

Root owns integration/checkpoint/Git. No generation, version/package freeze or merge until affected checks and independent review pass. First-launch setup exposes existing audio/motion/flashing only, not an invented remapping/text-scale claim. Normal saves and running user games must not be used. Human/device learning acceptance remains separate.

Onboarding source implementation complete: owner reports65 affected tests; independent actual Chrome finalrun4 passes38/38 with unchanged source hashes and no Runtime exceptions. /root/onboarding_review (gpt-6-luna high) cleared the scoped state/reward/event boundaries. /root/onboarding_package (gpt-6.1-sol medium) owns beta.10 manifests/guide and qa/results/beta10-* only; prep ready, awaiting frozenSHA before exports. No human/device acceptance claimed; root integrates each checked PR before next work.
