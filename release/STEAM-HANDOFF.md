# Custard Knights — Steam preparation handoff

Updated 8 October 2026. This branch is a Windows candidate for testing and Steam preparation. It is not an approved commercial release. Joshua is starting Steamworks onboarding.

## Candidate scope

Windows x64 desktop wrapper for the existing game, six arenas, eight modes, bots, local party play and PeerJS room-code multiplayer. Runtime assets, fonts and the PeerJS client are bundled locally. Online signaling still needs the internet and uses PeerJS infrastructure; this build does not implement Steam lobbies or a guaranteed relay service.

The campaign, Cups, new progression roadmap, Steam achievements, Steam Cloud, Deck verification and twelve completed songs are not included. Store copy must not present them as shipped features.

## Build and run

Use a current Node.js runtime supporting the pinned packaging tools. Run `npm ci`, `npm run vendor`, `npm run music`, `npm test`, then `npm run package:win`. If the environment suppresses dependency install scripts, run `node node_modules/electron/install.js` once before launching Electron.

The resulting folder is `dist/Custard Knights-win32-x64`. Launch `Custard Knights.exe` with its sibling files intact; do not distribute the EXE by itself. F11 toggles fullscreen. The candidate is unsigned and currently uses Electron's generic application icon. Replace it with approved branded artwork before the public build.

Normal desktop saves and settings live under `%APPDATA%/Custard Knights`, independently of the installation folder.

Developer checks: `node qa/run.js regression`, `node qa/run.js full`, `node qa/run.js modes`, `node qa/run.js perf`, `npm run smoke:desktop`, `npx electron . --online-smoke`. The same `--smoke-test` and `--online-smoke` switches work on the packaged executable and use temporary save profiles.

## Changes and save policy

- Party rematches retain seat assignments, including controllers joined in a different order from device indices. Starting a new quick-play session clears the old party assignments.
- The host sends a round ID and final results, including per-knight combat feats. Guests apply only their own knight's award. Stale round results and repeated end packets cannot repeatedly grant awards during normal play.
- Local couch progression is one shared household save: one completed match and the highest local coin award per round. All local seats can contribute cumulative challenges. The three-ringout challenge must still be achieved by one knight within a match.
- Progress is normalized and versioned, preserving valid legacy earned coins and challenge unlocks. The most recent 128 awarded round IDs are retained. Browser saves are not automatically migrated to the desktop app because they have a different origin.
- Sound effects have a 64-voice ceiling and disconnect their graphs when finished. This addresses unbounded allocation found during accelerated testing. The earlier renderer crash remains recorded; a passing accelerated rerun does not replace a long real-time soak.
- The desktop shares room codes. Web builds share web links. Protocol v2 rooms are intentionally separate from older v1 builds; host and guest must use the updated build.
- Music has twelve named slots. Only the existing menu theme is supplied today; see `SUNO-SOUNDTRACK.md` for prompts, filenames and routing.

## Evidence from this preparation

- Seven progression unit tests passed: legacy saves, malformed saves, duplicate awards, guest feats, shared couch progression, mode-specific wins and invalid results.
- Fourteen browser release checks passed, including five rematches, stale/duplicate guest results, second-seat contributions, audio allocation/cleanup and soundtrack routing.
- Twenty quick matches passed. The 108-match mode sweep passed. An initial longer run crashed the Chrome renderer; after bounding and cleaning up audio, all 72 full-suite matches completed without reported errors.
- A short headless frame-rate sample measured approximately 60 FPS on all six arenas on this machine. This is a diagnostic, not a minimum-spec claim.
- Two isolated desktop profiles connected through live PeerJS, completed three rounds, delivered guest parry rewards, and recovered to the menu when the host left. This tests one machine/network, not different households or difficult NAT configurations.
- The packaged executable loaded its sprites and fonts, completed a match, and kept progress through a page reload with external HTTP/WebSocket traffic blocked. Renderer Node access was unavailable as intended.
- Six unedited 1920×1080 gameplay captures were produced from the running game for store screenshot review. They use bot matches and contain the actual in-game UI.

## Steam upload preparation

After Steam assigns the real App ID and Windows depot ID, run `node scripts/steam-config.cjs APP_ID DEPOT_ID`. The script creates VDFs under `build/steam`, with Preview set to 1 and SetLive empty. It does not upload anything. Configure the Windows launch executable as `Custard Knights.exe` with no launch arguments and the installation root as working directory. Include the complete packaged folder in the Windows depot.

Use the Steamworks SDK's SteamCMD workflow with your authorized build account. First inspect the preview manifest; then change Preview to 0 for the actual upload. Assign the uploaded build to a password-protected test branch and test installation through Steam before selecting a release build. The exact upload and launch workflow is documented by [Valve](https://partner.steamgames.com/doc/sdk/uploading).

## Still required before submission/release

| Item | Status / next action |
|---|---|
| Steam account, fee, bank/tax verification, App ID and depot | User starts onboarding and provides IDs when issued. |
| Store capsule, library art and application icon | Produce approved branded exports in Steam's required sizes; six gameplay screenshot candidates are ready for selection. |
| Trailer | Record actual current gameplay and assemble a short trailer; campaign/Cups must not appear as shipped features. |
| Audio provenance | Existing Suno theme: commercial rights confirmed by Joshua. Keep creation/subscription evidence with release records. New tracks have prompts only. |
| Other asset provenance and AI content survey | Confirm origins and rights for existing key art and shipped sprites; answer the survey from that record. Do not infer all art is cleared from the music confirmation. |
| Hardware controller check | Test two to four physical pads, reversed join order, five rematches, unplug/replug, keyboard/pad mixing and Steam Input. Automated seat checks passed; hardware has not been verified. |
| Clean installation and persistence | Install via Steam on a second PC; verify exit/relaunch, updates, settings, earned items, fullscreen/Alt-Tab and uninstallation behavior. |
| Online acceptance | Two PCs on different networks; repeated rematches, joining during a match, guests leaving, host leaving, capacity limit and rejected/invalid codes. Same-machine live connection passed. |
| Real-time stability | Run at least a 60-minute session with sound and sprites, multiple rematches and chaotic modes; record crashes, frame time and audio behavior. |
| System requirements | Measure the minimum supported PC. Do not convert this machine's headless FPS result into a public GPU/RAM claim. |
| Pricing, release model and support contact | User decisions needed before store submission. |
| Steam approvals | Store and build review, public Coming Soon period and applicable fee wait remain external gates. |

Valve's current [onboarding documentation](https://partner.steamgames.com/doc/gettingstarted/onboarding) specifies a 21-day fee wait for initial releases and a public Coming Soon period of at least two weeks. The [review process](https://partner.steamgames.com/doc/store/review_process) needs additional lead time. The achievable immediate milestone is a tested candidate plus submission materials, while onboarding runs.

## Draft store text

**Short description:**

Armoured knights. Flying pies. Absolute nonsense. Brawl across six hazardous arenas in eight modes, fight bots or friends, and earn ridiculous cosmetic rewards as every match descends into custard-fuelled chaos.

**About this game:**

Welcome to a tournament where a noble duel can end with a custard cannon, a lava bath or a very angry chicken.

Custard Knights is a colourful top-down arena brawler for up to eight knights. Learn to swing, dash, block and parry, then keep your composure as power-ups and arena events make the fight increasingly ridiculous.

- Six arenas: a castle courtyard, frozen keep, pie factory, lava-filled larder, treacherous rooftops and a sticky bog.
- Eight modes, from free-for-all and team battles to Pie Heist, King of the Pie, Chicken Racing and Hot Pie.
- Bots with three difficulty levels, local party play, and online rooms shared by code.
- Earn cape patterns, blade skins, colours and chicken cosmetics through matches and challenges. No paid currency or combat advantages.
- Adjustable music, sound, screen shake and flashing settings.

This description reflects implemented systems. Verify multiplayer and controller claims against the acceptance checks before publishing. Do not select full controller support, Steam Cloud, achievements, Steam lobbies, Steam Deck compatibility or other unverified feature badges.

## Next autonomous work

Finish remaining store artwork and trailer preparations; run and record the real-time stability session; inspect release regressions if anything fails. When the user's Suno exports arrive, add the named files, regenerate the manifest, audition transitions and loops, rebuild and retest. When Steam IDs arrive, generate the actual upload configuration. Do not repeatedly prompt for dependencies that have already been explained.
