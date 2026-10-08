# Custard Knights — Steam preparation handoff

Updated 8 October 2026. Developer/publisher: **Sparked FM Ltd**. Recommended base price: **£7.99 / US$9.99**, subject to the owner's final storefront decision. No price has been submitted. This is a Windows candidate for testing and Steam preparation, not an approved public release.

## Required release and current implementation

The earlier arena-only cutline is superseded. The release includes the existing eight arena modes and six arenas, the first eight encounters of **The Great Pudding War**, the three-round **Custard Cup**, and six additional earned cosmetic rewards. All three new systems are integrated and packaged; acceptance evidence is tracked in `LAUNCH-STATUS.md`. Version 0.2.1 adds the animation, gameplay clarity and desktop journey refinements described in `GAMEPLAY-REVIEW.md`. Use the 0.2.1 candidate with its accompanying BUILD-INFO source revision and hash. The old 0.1.0 archive is arena-only; 0.2.0 is the prior expanded baseline.

The Great Pudding War contains seven main-path encounters and an optional Biscuit Toll, a winding map, story exchanges, independent spoon goals, checkpoints, assistance, Steve's rescue, a two-phase boss and a playable final rescue. Later kingdoms appear in the lore but are not playable chapters in this release. Do not advertise the untested 20–30 minute design target as measured playtime.

Custard Cup links three arena rounds with human standings, tied placements, arena votes, ready-up and awards based on recorded events. A knight joining mid-Cup waits for the next Cup. Disconnected knights cannot block ready-up or score through replacement bots.

The new wardrobe collection adds Tea Towel, Burnt Toast, Golden Whisk, Rooster Crown, Rice Guard and Steve Strut. It uses pinned goals, retained partial progress, first-reward choice and presets while preserving all existing tiers and challenge ownership. Cosmetic geometry does not change combat values.

## Desktop build and saves

Run `npm ci`, `npm run vendor`, `npm run music`, `npm test`, and `npm run package:win`. If dependency install scripts were suppressed, run `node node_modules/electron/install.js` once before launching Electron. The package is `dist/Custard Knights-win32-x64`. Launch `Custard Knights.exe` with all sibling files intact. F11 toggles fullscreen. The candidate is unsigned.

Normal saves live under `%APPDATA%/Custard Knights`, independently of the installation directory. Browser and desktop origins differ; browser saves do not automatically migrate. The backup UI provides validated export/import of wardrobe, shared progression and campaign saves. Import merges earned ownership and spoons while preserving an existing campaign checkpoint. Settings are not part of this backup.

The renderer has no Node access, runs sandboxed with context isolation, serves only allowed bundled assets, and blocks external navigation. Fonts, sprites, audio and the PeerJS client are local. Online signaling still requires internet access and PeerJS infrastructure; this is not Steam matchmaking or a guaranteed relay service. Updated protocol rooms are separate from old builds.

The desktop wrapper uses a single instance for normal play. Automated acceptance uses explicitly marked temporary profiles and verifies a genuine process restart, settings/earned rewards/equipped kit, a second-instance launch, relocated installation, offline assets and fullscreen repeat handling.

## Verification commands and evidence

- `npm test`: progression, campaign objectives/checkpoints, Cup scoring/readiness, collection ownership/backups, settings recovery, desktop asset routing, staging and Steam configuration.
- `node qa/run.js regression`: seat continuity, stale/duplicate results, input lifecycle, volume/voice behavior and runtime integration.
- `node qa/run.js campaign`: all eight objectives plus actual combat, shield, projectile and crate collisions, failure/retry, save/checkpoint reload and mode exits.
- `node qa/run.js cup`: three-round scoring, human-only standings, ready-up, tied placement and lobby flow.
- `node qa/network-acceptance.cjs`: three isolated profiles using live PeerJS signaling and data channels. Includes capacity, invalid room code, late joins, drops, rematches and a complete Cup.
- `node tests/desktop-acceptance.cjs` or append the packaged EXE path: real process restart, offline assets and relocation checks.
- `node qa/run.js full`, `modes`, `perf`, `soak`: broader arena simulation and real-time renderer/audio stability. Scripted simulation is not human playtesting.

Evidence is saved under `qa/results` and copied into the output QA folder. The one-hour baseline soak began before the expanded features landed; its result must not be presented as certification of the campaign, Cup or collection. Physical pads, a second PC and different-network online play require actual device/network tests.

## Music and provenance

Joshua confirmed ownership of existing artwork and repository material, and commercial-use rights for the existing Suno menu theme. Retain the source and subscription/creation records. Third-party font and code notices remain bundled.

Twelve soundtrack slots, filenames, cue routing and full Suno production prompts are prepared in `SUNO-SOUNDTRACK.md`. Only the existing menu theme recording has been supplied. Missing tracks fall back to available music; prompts are not twelve shipped songs. New exported recordings must be added, the manifest regenerated, and their loops/transitions auditioned before claiming the complete soundtrack.

Record AI-generated music and any generated promotional art accurately in Steam's content survey. Ownership and disclosure are separate questions.

## Steam upload preparation

When Steam supplies the App ID and Windows depot ID, run `node scripts/steam-config.cjs APP_ID DEPOT_ID`. It generates preview VDFs under `build/steam` with Preview=1 and no live branch. It does not upload. Configure `Custard Knights.exe`, no launch arguments, installation root as working directory, and the full packaged directory in the depot.

Use Valve's authorized SteamCMD workflow to review a preview manifest, upload a build and test it on a private branch before public selection. See [Valve's upload guide](https://partner.steamgames.com/doc/sdk/uploading). Steam achievements, Cloud, verified Deck support and Steam lobbies have not been implemented or certified; do not enable those badges.

## Remaining external release gates

| Gate | Required evidence |
|---|---|
| Steam onboarding | Fee, bank/tax verification and real App/depot IDs. |
| Steam installation | Install the private branch on a second PC; verify updates, saves, Alt-Tab/fullscreen and relaunch. |
| Controllers | Two to four physical pads, reversed join order, five rematches, unplug/replug, keyboard/pad mixing and Steam Input. |
| Online across households | Two PCs on different networks; repeat joins/rematches, late join, guest departure, host departure and capacity rejection. |
| Minimum specifications | Measure a supported low-end PC; do not derive public minimum specs from headless FPS here. |
| Additional music | Actual Suno exports for the remaining recordings, followed by listening/loop checks. |
| Store administration | Support contact, final price approval, accurate content survey, asset selection, store/build review. |

[Valve's onboarding documentation](https://partner.steamgames.com/doc/gettingstarted/onboarding) specifies a 21-day fee wait for initial releases and at least two weeks of public Coming Soon visibility. [Store/build review](https://partner.steamgames.com/doc/store/review_process) adds lead time. Since onboarding has not begun, preparation this weekend is feasible; public Steam release this weekend is not.

## Draft store copy

**Short description:**

Armoured knights. Flying pies. Absolute nonsense. Brawl through six hazardous arenas, compete in a three-round Custard Cup, or rescue a dessert kingdom in The Great Pudding War. Earn ridiculous outfits as every battle descends into custard-fuelled chaos.

**About this game:**

Welcome to a tournament where a noble duel can end with a custard cannon, a lava bath or a very angry chicken.

Swing, dash, block and parry in colourful top-down battles for up to eight knights. Learn the swordplay, then keep your composure as power-ups and arena events make the fight increasingly ridiculous.

- **Eight arena modes, six arenas.** Fight over pies and flags, race chickens, and try to survive Hot Pie across a courtyard, frozen keep, pie factory, lava larder, rooftops and sticky bog.
- **The Great Pudding War.** Play an eight-encounter story chapter with pudding defence, shield duels, a flan bridge, Steve's rescue and a rice fortress boss. Revisit encounters for three independent spoon goals and enable assistance when you want it.
- **Custard Cup.** Three rounds, cumulative human standings, arena votes, ready-up and awards for the mischief you actually caused.
- **Bots, couch seats and room-code play.** Three bot difficulties and shared local progression. Online play requires an internet connection; confirm hardware/network acceptance before publishing support badges.
- **Earn your ridiculous wardrobe.** Keep existing tier and challenge rewards, pin goals for six extra cosmetics, preview items and save outfits. No paid currency or combat advantages.
- **Adjust the commotion.** Music, sound, screen shake, flash controls and campaign assistance.

Remove internal verification instructions from public copy after the corresponding claims have passed acceptance. Store media must show the implemented chapter and actual gameplay, not concepts for later kingdoms. The recommended price assumes this complete feature set.
