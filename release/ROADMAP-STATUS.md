# Roadmap completion audit — 12 October 2026

**The roadmap is not fully complete.** The Windows friends beta is available; missing engineering and unperformed human/platform acceptance remain. This audit reconciles the original [master plan](../BUILD-PLAN.md), [behaviour research](../PLAYER-BEHAVIOUR-ROADMAP.md), [campaign](../THE-GREAT-PUDDING-WAR.md), [collection](../COSMETIC-PROGRESSION.md) and [faction brief](../FACTION-BATTLES.md). It does not silently remove unfinished requirements or turn conditional future ideas into shipped features.

Audited repository baseline: `cb820ba1da814f4fd50ca4a1e643f659041559ea` on main, including merged PRs through #15. Fresh fetch and remote main lookup matched that commit with zero commits ahead/behind and a clean worktree before this documentation change. Runtime/package version is `0.3.0-beta.4`; frozen exported runtime is `6eec04154419dbab0c3cc5f2a5a6936a60ce3f45`. [PREVIEW-BUILD.md](PREVIEW-BUILD.md) supplies the immutable ZIP identities. Documentation updates do not rebuild or replace those archives.

Method: source inspection plus retained, version-scoped test/review evidence. No new human, hardware, network or gameplay tests were performed for this audit. Implementation status and release acceptance are separate: an implemented feature can still need people and devices to satisfy its original "done when" criterion.

## Every original engineering ticket

| ID | Implementation | Evidence and remaining acceptance |
|---|---|---|
| CK-01 seats/rematches | Implemented | `index.html` party/rematch paths preserve seats. [Gameplay review](GAMEPLAY-REVIEW.md) records regressions; physical mixed devices, reverse pad order and reconnect acceptance remain open. |
| CK-02 authoritative rewards | Implemented | `index.html` endMatch/clientRecv and [progression](../game/progression.js) validate per-player summaries and deduplicate receipts. Retained regression/live PeerJS evidence; real household networks remain open. |
| CK-03 saves/household policy | Implemented | [Progression](../game/progression.js), [collection](../game/collection.js) and [integration](../game/COLLECTION-INTEGRATION.md) preserve legacy ownership, individual feat attribution and once-per-household round credit. |
| CK-04 product events/baseline | Local foundation implemented; acceptance/attribution open | Beta.5 adds opt-in, bounded [local events](../game/product-events.js), session/build tokens, actual lifecycle hooks, JSON export and explicit join/completion/continuation denominators. [Review](../qa/reviews/local-product-events-2026-10-12.md) records synthetic tests and limits. Human cohort baseline, experiment assignment, referral attribution and aggregate/retention analysis remain unperformed; reserved event names are not shipped sharing features. |
| CK-05 first-fight experiment | Missing experiment | Existing first-two-play Easy bots and hints are implemented. No controlled curated/random or four/eight-knight assignment/outcome measurement exists; campaign teaching does not substitute for the proposed comparison. Depends on CK-04 and observation. |
| CK-06 attack cues | Implemented | [Animation review](../qa/ANIMATION-REVIEW.md), [face/grip review](FACE-AND-GRIP-REVIEW.md) and `index.html` combatBeat/bladeSweep cover distinct heavy/stab/bash/charge/dash presentation. Recorded actual-sprite/classic checks are tied to their source freezes. |
| CK-07 feedback/input | Implemented; acceptance open | Block/parry/guard-break/whiff feedback and host/guest presentation exist; [gameplay](GAMEPLAY-REVIEW.md) and [pause controls](../qa/reviews/pause-controller-2026-10-09.md) retain evidence. Physical input responsiveness and novice explanations are unperformed. |
| CK-08 arena/hazard readability | Implemented; acceptance open | Campaign warnings/objective progress plus [boundary/spawn review](../qa/reviews/friends-beta-boundaries-2026-10-09.md) and [campaign acceptance](../game/CAMPAIGN-ACCEPTANCE.md). Human hazard recognition and actual-device visibility remain open. |
| CK-09 effects/audio priority | Partial | Voice count is bounded, cues are differentiated and reduced flashing is supported. SFX voices still connect directly to the audio destination; no warning-priority/ducking mixer exists. Multiple systems write the shared banner; no complete priority policy or accepted minimum-hardware budget is demonstrated. |
| CK-10 encounter definitions | Implemented | [Campaign](../game/campaign.js) supports authored rosters/objectives, independent reset and the two-guard banquet encounter. [Integration](../game/CAMPAIGN-INTEGRATION.md) documents the engine boundary. |
| CK-11 map/spoons/save | Implemented | [Campaign](../game/campaign.js) and [map UI](../game/campaign-ui.js) implement prerequisites, independent spoons, checkpoints and save normalization/recovery. Human navigation acceptance remains open. |
| CK-12 banquet/shield lesson | Implemented | Encounter data, short skippable story exchanges and success/failure logic exist; retained [campaign acceptance](../game/CAMPAIGN-ACCEPTANCE.md) includes automated input completion. Human learning is unmeasured. |
| CK-13 Rind/rescue | Implemented | Two boss phases, tells, recovery windows, resets and playable rescue exist in [campaign](../game/campaign.js). Human fairness and completion time remain unmeasured. |
| CK-14 Cup state/scoring | Implemented | [Cup](../game/cup.js) defines three rounds, human-only standings, ties and winner selection; [gameplay review](GAMEPLAY-REVIEW.md) links integrated checks. |
| CK-15 ready-up/continuity | Implemented; acceptance open | [Cup](../game/cup.js), [Cup UI](../game/cup-ui.js) and arena network handlers cover readiness, late arrivals and departures. Full mixed-device/WAN sessions are unperformed. |
| CK-16 Mischief Awards | Implemented | [Cup awards](../game/cup.js) derive Parry artist, Mind the gap and Pantry raider from recorded parries, ring-outs and pickups. No invented highlight events. |
| CK-17 collection/choice/goals | Implemented | [Collection](../game/collection.js) and [UI](../game/collection-ui.js) provide first choice, pinned/partial progress, locked previews, presets and backup import/export. Real equip/desirability behaviour is unmeasured. |
| CK-18 six-item capsule | Implemented; human acceptance open | Tea Towel, Burnt Toast, Golden Whisk, Rooster Crown, Rice Guard and Steve Strut exist in [catalogue](../game/collection.js) and [art](../game/collection-art.js). Baked/classic render reviews exist; player preference is not signed off. |
| CK-19 reliability/profiling | Partial | [Stability](../qa/reviews/battle-stability-2026-10-09.md), [process load](../qa/reviews/battle-process-load-2026-10-09.md), [render cache](../qa/reviews/faction-render-cache-2026-10-09.md) and package evidence exist. Local native faults, WAN, physical devices, minimum hardware and operating acceptance remain unresolved. |
| CK-20 human slice study | Unperformed | [Player review](PLAYER-REVIEW.md) and the [friends kit](playtest/README.md) are prepared. No recorded solo/group cohort findings, stopping reasons, voluntary continuation or return evidence. |
| CK-21 remaining chapter | Implemented ahead of its research gate | All eight encounters are implemented and have retained failure/save/input checks. The original CK-20 dependency was not satisfied by human evidence; chapter appeal and measured duration remain open. |
| CK-22 House Rule/chain reaction | Missing prototype | [Cup](../game/cup.js) votes arenas, not House Rules. No rule catalogue/vote/application or dedicated attributable knockable-trap prototype exists. Existing chaos presets, rare powers and hazards do not satisfy this experiment. |
| CK-23 desktop/Steam spike | Partial | Windows packaging, restricted asset protocol, save/restart/relocation and [preview Steam configuration](../scripts/steam-config.cjs) exist. Steam installation/update, overlay/Input and intended hardware acceptance remain open. |
| CK-24 sharing/creator pilot | Partial | Actual gameplay trailer/screenshots exist. No runtime postcard/recording flow, creator pilot, attributed recipient activation or capture-cost acceptance is recorded. Room invite links alone do not complete this ticket. |

## Later owner additions

| Scope | Delivered | Still open |
|---|---|---|
| Faction battles | Brawl/CTF/siege; 4v4/20v20/50v50 total slots; roles; bot fill; local practice; server-owned simulation/full-and-delta snapshots | Public hosting/TLS/operations, distributed human/WAN acceptance and minimum specifications. Bot slots and loopback sockets do not prove a 100-human service. |
| Rankings/matchmaking | Host-issued identities, durable SQLite ratings, human-only skill queues, duplicate-safe terminal journal/replay and cumulative 20-second reconnect grace/forfeits | Steam/public identity, parties/party-aware assignment, competitive calibration, sanctions and anti-collusion. [Private ladder](PRIVATE-LADDER.md) is the implemented boundary. |
| Art/combat | Accepted rounded models, both saved visor options, connected weapon motion and four difficulties | Real-player clarity, responsiveness and difficulty calibration. |
| Requested beta corrections | Dash-hit containment, safe spawns, Crossbow/Croissant, bounded guest prediction, Simple/Normal/Insane chaos, rare AK/song and McGinley effects | Real playtest regression/balance feedback. Current technical evidence is in [checkpoint](RESUME-CHECKPOINT.md). |
| Music | Thirteen installed cues: twelve native WAV exports and original menu MP3, with [provenance](music/source-provenance.json) | Human audition, mix/loop decisions; Another Helping retains its measured 1.595-second tail. |
| Distribution | Frozen Windows friends ZIP with start guide and offline feedback; checked source is on GitHub | No public download upload, tester sending or Steam submission recorded. Built ZIPs remain local outputs; source checkout can rebuild them. |

## Proposed details that have not shipped

The first campaign chapter and six-item capsule are delivered. Proposed spoon-unlocked biographies/cosmetic variants/side encounters, kingdom landmarks, boss silhouettes and post-victory map changes are not all implemented. These design details must not be advertised as shipped.

Later kingdoms and their Angelic/Jelly/Trifle sets, weekly Royal Recipes, a public editor/Workshop, full replay, co-op campaign and other platforms were expressly deferred in the planning documents. The old blanket "defer ranked" instruction is superseded by the owner's later private-ladder request; public ranking acceptance is still open. Proposed experiments and numerical retention targets are not established results or industry guarantees.

## Remaining work order and completion rules

1. CK-04: the bounded opt-in local reporting foundation is implemented in beta.5. Collect voluntary tester exports using [LOCAL-REPORTS.md](playtest/LOCAL-REPORTS.md), assess coverage and establish a real cohort baseline. Referral/retention attribution remains open; no external service is silently enabled.
2. CK-05/20: prepare the controlled onboarding/density comparison, then run uncoached solo/group sessions. Keep assignments and outcomes separate from opinions, and preserve normal experienced-player flow.
3. CK-09: implement/test warning audio and banner priorities against concrete overlap cases; keep combat timings and accessibility settings intact.
4. CK-22: prototype one safe Cup House Rule and attributable chain reaction with a normal-rules fallback. Retain it only after the plan's fairness/understanding observation.
5. CK-19/23: resolve native-fault investigation under a new hypothesis, execute the device/WAN/minimum-hardware matrix and complete Steam installation/overlay/Input acceptance when actual platform access is available.
6. CK-24 and public faction/ranking requirements: complete the promised sharing/creator and deployed competitive scope with real endpoints, identities and human acceptance before marketing those capabilities.

Steam App/depot IDs and onboarding, hosting account/domain, support contact, second-PC installation, physical controllers, WAN tests, music listening and human playtests remain owner/device inputs. Fees, legal declarations, public prices and publication still require authorization for the concrete action. None are marked complete by this audit. The beta is suitable for collecting private test feedback; this ledger is not sales sign-off.
