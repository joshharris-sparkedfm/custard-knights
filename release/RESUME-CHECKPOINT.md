# Custard Knights — friends beta checkpoint, 9 October 2026

The user selected a downloadable Windows beta for friends tonight and authorizes pushing and merging each completed, checked task before proceeding. No public upload or sending has been performed. Do not use or close the user's normal game/save profile during QA.

## Current checkpoint

PR #15 contains **0.3.0-beta.4**. It adds Simple / Normal / Insane arena chaos, bounded rare AK47/song and McGinley lightning events, and the original native WAV “Oh Nae Nae, What's Your Name?”. Frozen runtime source is 6eec04154419dbab0c3cc5f2a5a6936a60ce3f45. Source checks pass 21 chaos/preferences/weapons tests, 10 catalog/desktop tests, 83 real-browser cases and 17 live same-network PeerJS cases. The package matches all 56 entries and passes actual EXE save/restart/launcher/relocation. Frozen exports are recorded in PREVIEW-BUILD.md; use its hashes as the archive identity. Packaged rare-event checks pass 85/85 with zero exceptions/media errors. Hosted Battle core run37973139408 passes all six jobs and Soundtrack run37973139390 passes both jobs. Evidence is under qa/results/chaos-events and qa/results/rare-network/third; all specialist work is complete.

The latest completed export is beta.4: `outputs/Custard-Knights-Friends-0.3.0-beta.4.zip`, 547104027 bytes, SHA256 `fe3f1450e377f36a003bd8843a61befec0a49cd8b401eb06c44f428cc4a13776`. Runtime source remains 6eec041; later QA/docs changes do not alter it. All 56 package entries and 73 friends files, ZIP integrity and EXE lifecycle pass. PREVIEW-BUILD.md records preview/ASAR hashes. Earlier exports are preserved. PR #14 previously merged at 176a3d3; do not remerge it.

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
