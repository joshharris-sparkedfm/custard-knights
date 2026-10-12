# Player feedback integration — 12 October 2026

Scheduled automation was removed at the user's request. Work follows direct feedback, with checked tasks pushed and merged individually. Controls/Chicken Race pecks/per-life upgrades merged in PR19 at 45e763d300f950a7d2c2b96ba434e4e8e85360a7. Story presentation and the playable pantry rescue merged in PR20 at b1838b35e7b8b676a2d7cc318620479ceae8eb9d. Hosted story CI38232944584 passed all six jobs. Optional Roomier geometry, a newly reproduced Rooftop race-navigation issue and combined beta.7 export are in progress; beta.6 below remains the last frozen playable export until the new artifact is verified.

Controls have 23 local browser checks, 16 actual same-network PeerJS checks and 26 regressions. Story has 26 campaign and four scene tests, 58 integration checks, all eight input-only encounters and 25 presentation checks. See qa/reviews/player-controls-2026-10-12.md and qa/reviews/story-opening-2026-10-12.md for limits. Actual game footage is in outputs/Story-review/index.html beside the workspace. The user says earlier generated story videos already exist; their location is pending after local searches. Do not represent the new canvas scenes as recovered prior video assets. Do not regenerate videos unnecessarily.

The user rejected the prior story quality. These playable revisions still need their judgement; automated completion does not establish a polished chapter. Preserve ordinary saves and running user sessions, all old exports, rounded art and both visor choices. No public upload or sending has occurred. This remains a private friends beta, not Steam approval.

## Historical frozen build and roadmap context

# Custard Knights — friends beta checkpoint, 12 October 2026

The user selected a downloadable Windows beta for friends tonight and authorizes pushing and merging each completed, checked task before proceeding. No public upload or sending has been performed. Do not use or close the user's normal game/save profile during QA.

## Current checkpoint

PR #18 prepares beta.6 at frozen runtime `83f81e4a467fcd7d03af94ae04f4dbb4ebcfc323`. CK-05 optional Settings first-fight studies independently compare curated/random arenas and four/eight total knights. Both are solo Easy/Simple 90-second FFA trials; settings, seats and tutorial counters restore, and no progression is awarded. Explicit local-report consent is required. Assignment reuse and completion blocking last only while the report retains them; cleared/truncated data does not establish a unique participant. Recognition is self-report; continuation requires an actual subsequent offline normal arena start. See `release/playtest/FIRST-FIGHT-STUDY.md`.

18 focused module tests, 38 source and 38 packaged study checks, 30 source and 30 packaged reporting checks pass. All 58 package entries match source; actual EXE save/restart/launcher/relocation passes. Review found and fixed pagehide/back-forward-cache resumption of an abandoned study; final browser checks cover it. An initial harness failure used a nonexistent bakery map; that fixture failure is retained separately. Hosted CI run 38223169999 passed all six jobs at the frozen runtime. The final friends ZIP is 547116732 bytes, SHA256 `3abd4d7af4ab5481e4627721e69c8a773107016f93fafca7176b333c03d418cd`; all 73 game files and final ZIP integrity passed. PREVIEW-BUILD.md records preview/ASAR identities. Later docs/evidence commits do not alter the frozen runtime. Nothing has been publicly uploaded or sent to testers.

Beta.5 (PR #17) supplied CK-04's default-off bounded local reporting and remains preserved. First-fight engineering now exists, but actual uncoached human sessions are required for CK-05 acceptance. Next engineering is CK-09 warning audio/banner priority, then CK-22 safe Cup House Rules/attributable chain reaction and CK-24 sharing/creator gaps. Review ROADMAP-STATUS.md and original done-when criteria; keep later kingdoms/editor/weekly recipes deferred absent a scope decision. Push/merge each checked task separately. The roadmap and real-world sales acceptance remain incomplete.

Prior PR #16 documentation reconciliation: [ROADMAP-STATUS.md](ROADMAP-STATUS.md) audits all CK-01–24 tickets and later owner additions. It identified missing product reporting/onboarding experiment/House Rules and partial audio-priority/sharing work. Beta.5 now supplies the local reporting foundation; human baseline/attribution remains open. Historical plans must not be treated as all completed or all unstarted. The audit checked all 24 ticket IDs and 115 local links without repeating gameplay tests.

PR #15 contains **0.3.0-beta.4**. It adds Simple / Normal / Insane arena chaos, bounded rare AK47/song and McGinley lightning events, and the original native WAV “Oh Nae Nae, What's Your Name?”. Frozen runtime source is 6eec04154419dbab0c3cc5f2a5a6936a60ce3f45. Source checks pass 21 chaos/preferences/weapons tests, 10 catalog/desktop tests, 83 real-browser cases and 17 live same-network PeerJS cases. The package matches all 56 entries and passes actual EXE save/restart/launcher/relocation. Frozen exports are recorded in PREVIEW-BUILD.md; use its hashes as the archive identity. Packaged rare-event checks pass 85/85 with zero exceptions/media errors. Hosted Battle core run37973139408 passes all six jobs and Soundtrack run37973139390 passes both jobs. Evidence is under qa/results/chaos-events and qa/results/rare-network/third; all specialist work is complete.

The preserved previous export is beta.4: `outputs/Custard-Knights-Friends-0.3.0-beta.4.zip`, 547104027 bytes, SHA256 `fe3f1450e377f36a003bd8843a61befec0a49cd8b401eb06c44f428cc4a13776`. Runtime source remains 6eec041; later QA/docs changes do not alter it. All 56 package entries and 73 friends files, ZIP integrity and EXE lifecycle pass. PREVIEW-BUILD.md records preview/ASAR hashes. Earlier exports are preserved. PR #14 previously merged at 176a3d3; do not remerge it.

## Completed gameplay corrections

- PR #12: legitimate dash/knockback could tunnel through a wall and remain off-screen. Movement now uses substeps, valid nearest-face recovery and bounds after separation. Respawns recheck hazardous/occupied terrain. 408 boundary and 149 spawn/movement checks passed across arena modes/maps, story bridge and faction sizes. Review: `qa/reviews/friends-beta-boundaries-2026-10-09.md`.
- PR #13: Crossbow and Returning Croissant join the ordinary arena pool, bots, presentation and snapshots. Six module and 30 real-browser checks passed; CI37970655784 passed all six jobs. Review: `qa/reviews/weapon-variety-2026-10-09.md`.
- PR #14: guest prediction now consumes a maximum 150 ms real-time budget per accepted host snapshot and uses collision-aware presentation. 962 cases, 25 live same-network PeerJS checks and 26 regressions passed. An initial audio fixed-wait fixture failure and bounded follow-up are retained; no audio runtime repair was claimed. Review: `qa/reviews/guest-prediction-2026-10-09.md`.

## Retained scope

Eight original arena modes/six arenas, four couch seats, original arena PeerJS rooms, eight-encounter Great Pudding War chapter, three-round Custard Cup, goals/wardrobe/presets/earned cosmetics, accepted rounded art and both free saved visor choices. Preserve legacy saves and original combat rules. Easy / Medium / Hard / STEVE difficulty is independent of chaos.

Faction Front includes brawl, CTF and castle siege, 4v4/20v20/50v50 total combatants, roles and bot fill. A separate authoritative server supplies full/delta snapshots. Offline faction play: choose mode and Army size, then Play with bots. It is not a deployed public 100-human service. Private host-issued identities, SQLite ratings, human-only skill queues, durable result replay and cumulative 20-second disconnect grace exist. Public Steam identity, competitive calibration/anti-collusion and parties remain unfinished. See `release/PRIVATE-LADDER.md`.

## Music

The original menu MP3 plus twelve native Suno WAV exports are in source (13 cues). The eleven prior instrumental exports are unchanged. The new 90-second vocal rare-event song is recorded with prompt, lyrics, source URL, screenshot and byte hash in `release/music/`. No conversion or public Suno publishing. Human musical quality/loudness/loop review remains open; Another Helping retains its 1.595-second silent tail. `outputs/Soundtrack-WAV/index.html` is the portable listening review.

## Continue on another computer

Clone the repo, check out main, run `npm ci`, then `npm start`. `npm run package:win` builds the Windows folder. For faction rooms, `npm run battle:server` starts a separate local server; no public endpoint is deployed. Read PREVIEW-BUILD.md for exact frozen export identity. Friends extract the entire Friends ZIP and run `Game/Custard Knights.exe`, after normally closing any older running copy. The guide and offline feedback form travel with the kit; no developer tools or Steam are needed for offline play.

## Evidence limits and remaining gates

Focused automated checks are supporting evidence, not human fun, physical-controller, WAN, second-PC or minimum-hardware acceptance. Earlier faction objective audits, packaged journeys, animation/grip checks and completed soaks remain recorded in qa/reviews; do not rerun unchanged tests merely because an old prompt listed them. The prior controlled faction sprite cache sample improved 53.61 to60.09FPS; one actual headless browser beside99 scripted clients sampled59.93FPS/20.04receiveHz. These are host-specific samples, not minimum hardware or100people.

Local Node0xC0000005/0x80000003 and Python process anomalies remain unexplained, including a fresh official Node24.21.0 reproduction. Independent Windows/Linux CI successes do not fix or explain them. Do not retry unchanged failing native suites without a new hypothesis. Report any actual beta game crash separately with its build and steps.

Hosting account/domain question is pending; no repeat needed. Steam App/depot IDs/onboarding, private second-PC Steam install, physical pads/Steam Input, WAN tests, novice/friends review, measured minimum specs and public support contact remain. Sparked FM Ltd is developer/publisher; art ownership and existing Suno rights confirmed; proposed GBP7.99/USD9.99 remains unsubmitted. Do not pay Steam fees, submit legal declarations, set public prices or publish to Steam without authorization for that concrete action. Repository merge is not Steam approval.

Prior rejected deletion under `C:\face-block-fix` remains in force. No obsolete agents or failed Blender bakes should be resumed.
