# Custard Knights — Steam preparation handoff

Updated 9 October 2026. Developer/publisher: **Sparked FM Ltd**. Proposed base price: **£7.99 / US$9.99**, subject to the owner's final storefront decision. No price has been submitted. The current exported build is **0.3.0-alpha.2**, a Windows development preview; see [PREVIEW-BUILD.md](PREVIEW-BUILD.md) for the latest exported identity. Public-sale acceptance remains pending.

## Required release and current implementation

The required scope includes the existing eight arena modes and six arenas, the first eight encounters of **The Great Pudding War**, the three-round **Custard Cup**, six additional earned cosmetic rewards, and **Faction Front**. Faction Front implements Brawl, Capture the Flag and Castle Siege with 4v4, 20v20 and 50v50 total combatants, four tactical roles and bots filling empty slots. All formats have Easy, Medium, Hard and STEVE difficulty choices. Current evidence and remaining acceptance are tracked in [LAUNCH-STATUS.md](LAUNCH-STATUS.md).

The accepted rounded art, connected sword presentation and free saved closed/open visors remain. The 0.2.2 art, animation and desktop reviews are historical evidence for that source freeze, not certification of the 0.3.0 additions. Alpha.2 adds the faction sprite cache and subsequent checkpoints investigate network performance. Use the versioned exported build and its recorded hash; preserve older archives separately.

Faction bot practice is immediately playable. Online faction rooms require a separately running authoritative WebSocket server; no public service is deployed. The protocol has scripted 100-client capacity evidence, but timing, bandwidth, WAN and operational acceptance are incomplete. Anonymous session standings are unranked. Persistent authenticated rankings and calibrated skill matchmaking remain unfinished; no store copy should promise them. See [MASS-BATTLE-SERVER.md](MASS-BATTLE-SERVER.md).

The Great Pudding War contains seven main-path encounters and an optional Biscuit Toll, a winding map, story exchanges, independent spoon goals, checkpoints, assistance, Steve's rescue, a two-phase boss and a playable final rescue. Later kingdoms appear in the lore but are not playable chapters in this release. Do not advertise the untested 20–30 minute design target as measured playtime.

Custard Cup links three arena rounds with human standings, tied placements, arena votes, ready-up and awards based on recorded events. A knight joining mid-Cup waits for the next Cup. Disconnected knights cannot block ready-up or score through replacement bots.

The new wardrobe collection adds Tea Towel, Burnt Toast, Golden Whisk, Rooster Crown, Rice Guard and Steve Strut. It uses pinned goals, retained partial progress, first-reward choice and presets while preserving all existing tiers and challenge ownership. Cosmetic geometry does not change combat values.

## Desktop build and saves

Run `npm ci`, `npm run vendor`, `npm run music`, `npm test`, and `npm run package:win`. If dependency install scripts were suppressed, run `node node_modules/electron/install.js` once before launching Electron. The package is `dist/Custard Knights-win32-x64`. Launch `Custard Knights.exe` with all sibling files intact. F11 toggles fullscreen. The candidate is unsigned.

Normal saves live under `%APPDATA%/Custard Knights`, independently of the installation directory. Browser and desktop origins differ; browser saves do not automatically migrate. The backup UI provides validated export/import of wardrobe, shared progression and campaign saves. Import merges earned ownership and spoons while preserving an existing campaign checkpoint. Settings are not part of this backup.

The renderer has no Node access, runs sandboxed with context isolation, serves only allowed bundled assets, and blocks external navigation. Fonts, sprites, audio and the PeerJS client are local. Original arena/Cup signaling requires internet access and PeerJS infrastructure. Faction online requires the separate WebSocket service described above. Neither implements Steam matchmaking or a guaranteed relay service. Updated protocol rooms are separate from old builds.

The desktop wrapper uses a single instance for normal play. Automated acceptance uses explicitly marked temporary profiles and verifies a genuine process restart, settings/earned rewards/equipped kit, a second-instance launch, relocated installation, offline assets and fullscreen repeat handling.

## Verification commands and evidence

Run checks appropriate to changes rather than repeating completed soaks. Local native Node crashes remain unresolved even though independent CI passes. Preserve a failed run's logs and investigate its cause; a later pass alone does not close it. [RESUME-CHECKPOINT.md](RESUME-CHECKPOINT.md) and the linked reviews distinguish current, historical and unperformed checks.

- `npm test`: progression, campaign objectives/checkpoints, Cup scoring/readiness, collection ownership/backups, settings recovery, desktop asset routing, staging and Steam configuration.
- `node qa/run.js regression`: seat continuity, stale/duplicate results, input lifecycle, volume/voice behavior and runtime integration.
- `node qa/run.js campaign`: all eight objectives plus actual combat, shield, projectile and crate collisions, failure/retry, save/checkpoint reload and mode exits.
- `node qa/run.js cup`: three-round scoring, human-only standings, ready-up, tied placement and lobby flow.
- `node qa/network-acceptance.cjs`: three isolated profiles using live PeerJS signaling and data channels. Includes capacity, invalid room code, late joins, drops, rematches and a complete Cup.
- `node tests/desktop-acceptance.cjs` or append the packaged EXE path: real process restart, offline assets and relocation checks.
- `node qa/run.js full`, `modes`, `perf`, `soak`: broader arena simulation and real-time renderer/audio stability. Scripted simulation is not human playtesting.
- `node --test tests/mass-battle.test.cjs tests/mass-battle-wire.test.cjs tests/mass-battle-server.test.cjs`: faction core, wire reconstruction and server protocol cases.
- `node qa/mass-battle-ui-checks.cjs`: faction browser/menu/online integration. Faction performance and process-load results are documented in the reviews linked from LAUNCH-STATUS.md, with host and workload limits.

Evidence is saved under `qa/results` and copied into the output QA folder. The one-hour baseline soak began before the expanded features landed; its result must not be presented as certification of the campaign, Cup or collection. Physical pads, a second PC and different-network online play require actual device/network tests.

## Music and provenance

Joshua confirmed ownership of existing artwork and repository material, and commercial-use rights for the existing Suno menu theme. Retain the source and subscription/creation records. Third-party font and code notices remain bundled.

Twelve soundtrack slots, filenames, cue routing and full Suno production prompts are prepared in `SUNO-SOUNDTRACK.md`. Only the existing menu theme recording has been supplied. Missing tracks fall back to available music; prompts are not twelve shipped songs. New exported recordings must be added, the manifest regenerated, and their loops/transitions auditioned before claiming the complete soundtrack.

Record all shipped player-facing AI-assisted content accurately in Steam's content survey, including relevant music, art and narrative. STORE-FIELDS.md records known provenance facts; it is not a completed declaration. Ownership and disclosure are separate questions.

## Steam upload preparation

When Steam supplies the App ID and Windows depot ID, run `node scripts/steam-config.cjs APP_ID DEPOT_ID`. It generates preview VDFs under `build/steam` with Preview=1 and no live branch. It does not upload. Configure `Custard Knights.exe`, no launch arguments, installation root as working directory, and the full packaged directory in the depot.

Use Valve's authorized SteamCMD workflow to review a preview manifest, upload a build and test it on a private branch before public selection. See [Valve's upload guide](https://partner.steamgames.com/doc/sdk/uploading). Record Steam build/depot manifest IDs alongside the source revision and archive hash. Steam achievements, Cloud, verified Deck support and Steam lobbies have not been implemented or certified; do not enable those badges.

## Remaining external release gates

| Gate | Required evidence |
|---|---|
| Steam onboarding | Fee, bank/tax verification and real App/depot IDs. |
| Steam installation | Install the private branch on a second PC; verify updates, saves, Alt-Tab/fullscreen and relaunch. |
| Controllers | Two to four physical pads, reversed join order, five rematches, unplug/replug, keyboard/pad mixing and Steam Input. |
| Online across households | Two PCs on different networks; repeat joins/rematches, late join, guest departure, host departure and capacity rejection. |
| Faction service and rankings | Resolve timing/bandwidth acceptance, deploy and operate the intended service, and test actual browser clients over WAN. Persistent authenticated rankings require implementation if retained as a launch promise; session standings are not a substitute. |
| Minimum specifications | Measure a supported low-end PC; do not derive public minimum specs from headless FPS here. |
| Human gameplay | Complete PLAYER-REVIEW.md with novice/experienced players, including sword cues, objectives, all four difficulties and representative large battles; fix observed blockers and retest. |
| Additional music | Actual Suno exports for the remaining recordings, followed by listening/loop checks. |
| Store administration | Support contact, final price approval, accurate content survey, asset selection, store/build review. |

Official documentation checked **9 October 2026**: the live [onboarding page](https://partner.steamgames.com/doc/gettingstarted/onboarding) specifies a 21-day fee wait for initial releases and two weeks of public Coming Soon visibility. Cached search results and the English-query variant still showed 30 days; use the actual app's Steamworks eligibility date rather than promising a date from these conflicting versions. [Store/build review](https://partner.steamgames.com/doc/store/review_process) typically takes 3–5 business days each; Valve asks for at least seven business days of lead time. These gates can overlap but do not disappear when the local build is finished.

The concrete handover sequence is: obtain verified partner/App/depot details; configure the store and survey; authorize the proposed price and selected assets; submit the store for review and make Coming Soon public; upload the frozen candidate to a private branch; complete second-PC, hardware and network acceptance; set the accepted near-final build on the prerelease app's default branch and submit it for review; check both checklists and the account's release eligibility; then authorize the final public release action. [Valve's release process](https://partner.steamgames.com/doc/store/releasing) describes those release controls. No fee, legal declaration, public price or public release is authorized merely by this checklist.

## Draft store copy

**Short description:**

Armoured knights. Flying pies. Absolute nonsense. Brawl through six hazardous arenas, compete in the Custard Cup, rescue a dessert kingdom or lead your faction through flags and castle sieges. Earn ridiculous outfits and face four bot difficulties, all the way up to STEVE.

**About this game:**

Welcome to a tournament where a noble duel can end with a custard cannon, a lava bath or a very angry chicken.

Swing, dash, block and parry in colourful top-down battles. Learn the swordplay, then keep your composure as power-ups and arena events make the fight increasingly ridiculous.

- **Eight arena modes, six arenas.** Fight over pies and flags, race chickens, and try to survive Hot Pie across a courtyard, frozen keep, pie factory, lava larder, rooftops and sticky bog.
- **The Great Pudding War.** Play an eight-encounter story chapter with pudding defence, shield duels, a flan bridge, Steve's rescue and a rice fortress boss. Revisit encounters for three independent spoon goals and enable assistance when you want it.
- **Custard Cup.** Three rounds, cumulative human standings, arena votes, ready-up and awards for the mischief you actually caused.
- **Faction Front bot battles.** Choose Brawl, Capture the Flag or Castle Siege with teams of 4, 20 or 50 combatants. Fight as Vanguard, Ranger, Engineer or Support while bots fill the battlefield.
- **Four bot difficulties.** Start with Easy, step through Medium and Hard, or take on STEVE.
- **Couch tournaments and room-code arenas.** Up to four local seats and eight total arena combatants, with shared local progression. Online arenas require an internet connection.
- **Earn your ridiculous wardrobe.** Keep existing tier and challenge rewards, pin goals for six extra cosmetics, preview items and save outfits. No paid currency or combat advantages.
- **Adjust the commotion.** Music, sound, screen shake, flash controls and campaign assistance.

This is draft copy for the implemented game; publishing it remains gated on final acceptance. It intentionally makes no public hosted-faction, ranked-ladder, complete twelve-track soundtrack or measured-story-length claim. Add any such feature only after implementation and acceptance, with accurate access requirements. Store media must show implemented content and actual gameplay. The proposed price has not been submitted.
