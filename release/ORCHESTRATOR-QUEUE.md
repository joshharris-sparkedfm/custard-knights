# Orchestrator execution queue

13 October 2026 · Durable handoff for the explicitly renewed 30-minute build loop. Active automation ID: `custard-knights-build-orchestrator` (verified by root; every 30 minutes).

The user renewed automation authorization after the earlier removal. Historical removal remains true; its no-recreation instruction is superseded for this requested build loop. The root orchestrator owns coordination, integration and this queue. [FULL-EXPERIENCE-PLAN.md](FULL-EXPERIENCE-PLAN.md) and [ACCEPTANCE-MATRIX.md](ACCEPTANCE-MATRIX.md) remain the scope and acceptance authority. Documentation is not a gameplay pass. Beta.7 remains frozen at `6f1300b6f5e7dab9f31b684e60d1cadd2bbc5842`.

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
| Queue and FE-01 inventory | Root coordinator + scoped documentation child / gpt-6.1-sol / medium | `codex/orchestrator-build-loop`; this file, RESUME-CHECKPOINT, ROADMAP-STATUS, FULL-EXPERIENCE-PLAN | Read-only inventory complete; original status and diff inspected; root documentation review and diff check passed | Root pushes PR and merges this bounded task; next wake verifies its merge before dispatching ranged aiming |
| Ranged-aim prerequisite | Root until assigned; implementation child / Sol / high; independent audit/test child / Luna / medium or high | Proposed `codex/ranged-aim-contract`, fresh worktree from latest `origin/main`; `index.html`, `game/mass-battle-ui.js`, relevant input/settings helpers and focused QA evidence after inspection | Queued; dated `research/2026-10-13/ranged_input_audit.md` identifies existing mouse/right-stick support and parity gaps; no new implementation pass | Inspect ownership and aim transforms; implement cues/retention/deadzones; test changed arena/Faction behavior and mixed-seat ownership; independent review, push PR, merge |

Use Sol at medium/high for implementation and Luna at medium/high for bounded audits/tests. Astra requires a recorded complex escalation reason. Assign one scoped code owner; the independent reviewer receives the tested final diff and evidence. Root handles integration. Complete, check, push, PR and merge each task before the next integration task starts. Parallel work requires disjoint files and separate worktrees; never duplicate an active agent's task.

## Each 30-minute wake

1. Inspect live agents, worktrees, Git status/branches/PRs and this queue. Resume actual work; do not restart completed tasks or overwrite WIP. Use latest `origin/main` for each new implementation worktree.
2. If an owner is progressing, leave it assigned and advance a disjoint actionable task when available. Update records only with actual progress/evidence. Do not spend a turn only polling while engineering is actionable.
3. Diagnose a stalled agent once, retain its patch/evidence, then reassign a bounded task if needed. Avoid repeated unchanged passing tests/soaks and unchanged native-failure retries without a new hypothesis.
4. Run affected checks; independent review follows tests. Resolve findings, then root pushes/opens/merges under standing authorization and records commit/PR/evidence before selecting the next integration task.
5. External asset/hosting/account input blocks only dependent work. Continue independent code; never fabricate human fun/story/music, real device, household WAN, public service or Steam acceptance.
6. Notify only on meaningful change, completion, failure or required user action; stay quiet when unchanged. Stop scheduling work once the authorized roadmap is complete or the user cancels the loop; preserve honest external-gate status.
