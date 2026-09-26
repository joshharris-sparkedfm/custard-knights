# Custard Knights: Steam Early Access readiness review

Reviewer: producer agent, 26 Sep 2026. Read the README, all of index.html, qa/run.js, qa/agents.js and the 26 Sep QA summary.

## 1. Gaps for a credible Early Access launch

**What already works:** 55 simulated matches ran with no crashes, the bots are good, there is plenty of chaos content, and the host holds the authoritative game state. Two numbers need fixing:
- **Spawn deaths:** 24–34% of active personas' deaths happen within 3s of respawning. Rooftop Rumble is at 25%, and all 8 spawn-death hot spots are on that map. Each map has only 8 fixed spawn tiles (`S`, mirrored), and spawn protection is 1.6s.
- **Sword hit rate:** humans connect with 48% of swings, bots with 81%.

**Packaging:** Use **Electron + steamworks.js** for EA. Don't port to Godot yet.
- Tauri uses the system webview (WebView2 on Windows, WebKitGTK on Linux and Steam Deck), which is weaker on Gamepad API and canvas performance.
- Use steamworks.js for the overlay (`electronEnableSteamOverlay`), achievements, rich presence ("Pie Factory, 3:12 left, 5 knights") and lobbies.
- The logical canvas is 1280×800, which is exactly Steam Deck resolution. Aim for Deck Verified.

**Networking:** Move to **Steam lobbies with Steam Datagram Relay**. It gets through NAT for free and hides players' IPs. Keep PeerJS only for the browser demo.
- Support **Remote Play Together**. Once local multiplayer takes 4 pads, this gives online play almost for free. It also becomes a store bullet.

**Input:** The code has no Gamepad API support at all. For a couch game this is mandatory.
- Mapping: left stick moves, right stick aims (and gives aim assist a direction), A swings, B dashes, RB or X blocks, and the D-pad sends shouts.
- Start pauses. Select shows the scoreboard.
- Players join by pressing A in a lobby slot. Pads can be unplugged and plugged in again mid-match.
- Allow keyboard P1/P2 plus up to 4 pads, with no more than 8 local players.

**Settings:**
- Display: fullscreen, windowed or borderless.
- Audio: sliders for master, music and SFX.
- Controls: rebinding for keyboard and pads.
- Accessibility:
  - Screen shake from 0 to 100%. `G.shake` is triggered in dozens of places.
  - A "reduce flashing" option for Disco Fever, flashes and Lights Out, plus a photosensitivity warning.
  - Colour-blind palettes, and a player number or shape marker so players don't have to rely on colour. Note that BLUE_COLS contains teal (#2EC4B6), which is also used in the FFA colours.

**Save data:** Today `localStorage` holds only the player's name. Add a versioned JSON save for the loadout, unlocks, lifetime stats and settings, and sync it with Steam Cloud.

**Onboarding:** The menu is one long panel with rules text on it. Replace that with a 90-second guided first match: move, swing, block an arrow, dash over a pit, pick up a weapon. Then drop the player into Chill FFA.

**Online:**
- **Late joins:** mid-match joins are rejected. Put joiners into the next round instead.
- **Host migration:** there isn't any. For EA, when the host leaves, end the match cleanly, show the scoreboard and return everyone to the lobby. Proper host migration comes after EA.
- **Lag:** your own knight has no client-side prediction, so input lag is round-trip time plus the 50ms snapshot interval. Predict at least your own movement.
- **Bandwidth:** snapshots are full-state JSON at 20Hz. Delta-encode them and set a bandwidth budget.
- **Region:** show a region and ping in the lobby.
- **Connection failures:** show readable messages with a retry button.

**Performance targets:**
- Locked 60fps at 1080p on Steam Deck and on integrated laptop graphics, with 8 knights during an Unhinged event.
- p99 frame time under 16.7ms.
- Memory grows less than 50MB over a 30-minute session.

**Localisation:** Launch in English only. Move all strings into a table now so they're ready. The jokes are pun-heavy, so budget for transcreation (French, German, Spanish, Brazilian Portuguese, Simplified Chinese) after EA.

**Store assets:**
- Capsules at every required size, readable at small thumbnail size: one knight, one chicken, the logo.
- A 30–45s trailer that opens on Steve.
- 5 screenshots and 3 GIFs: Norr roar, Swap Party, Trapdoors.

**Early Access messaging:**
- What's in: 6 arenas, 5 modes, bots, local play for up to 8 (2 on keyboard plus pads), online play and Remote Play Together.
- What's coming: Chicken Racing, more arenas, host migration, localisation.
- Give an honest EA length of 6–9 months.

**Price:** $7.99. Launch at 10% off. The fact that only the host needs to own the game for Remote Play Together is a selling point.

**Legal:**
- **Fonts:** Lilita One and Nunito load from Google Fonts at runtime, which fails offline. Bundle them and ship the OFL licence text.
- **PeerJS:** bundle PeerJS (MIT) too; it currently loads from jsDelivr.
- **Servers:** the free public PeerServer and TURN have no guarantee of uptime. Self-host them or leave them for Steam.
- **Privacy policy:** WebRTC exposes players' IP addresses.
- **Music:** confirm where the `menu-theme.mp3` licence comes from.
- **Steam forms:** complete the AI content disclosure for any generated art or audio, and the IARC age rating questionnaire.
- **Timing:** Steam needs the $100 fee paid 30 days before release, and a Coming Soon page live for at least 2 weeks.

## 2. Game modes

- **Free-for-all (keep):** 3:00 match, most KOs wins. Bots already play it well. The hook is the Chaos Meter escalating.
- **Red vs Blue (keep, fix):** 4v4, team KOs, 3:00. Right now both humans are forced onto one team. Let players pick teams and use bots to balance them. The hook is team Norr roars.
- **Last Knight Standing:** 3 lives each, no timer, and the Chaos Meter fills twice as fast. Players who are out become ghost chickens that can peck for knockback only. Bots follow the same rules. The hook is being a chicken spectator who still matters. Cheap to build.
- **King of the Pie:** a giant pie zone moves every 30s. You score 1 point per second while you're alone on it, and a contested pie scores nothing. First to 60, or the most after 3:00, wins. Bots weight the pie by distance. The hook is the crust visibly getting eaten as the holder scores.
- **Pie Heist:** Red vs Blue. Carry the enemy pie home to score. The carrier is slower and can't swing. Drop it on KO; it goes home after 8s. First to 3 captures, or 4:00. Bots use escort and intercept roles. The hook is that Steve can carry the pie.
- **Chicken Racing:** everyone is a chicken, it's 3 laps, pecks cause knockback, and pits reset you to a checkpoint. It needs track maps, checkpoints and racing bots. The hook is the premise itself. **Not at launch.** Make it the headline of the first EA update.
- **Hot Pie (new):** a pie with a fuse is stuck to one knight, and a sword hit passes it on. When it explodes, that knight loses a life. The fuse gets shorter each round. Last knight alive wins; rounds take about 90s. Bots flee or chase depending on who holds it. The hook is a panic-sprint hot potato.
- **Norr Knight (new):** the Norr player is a juggernaut, and whoever KOs Norr becomes Norr. You score 1 point per second while you're Norr. First to 45, or 3:00. Bots gang up on Norr (reuse the Boss Mode logic). The hook is a roar dynasty.

**Launch set:** FFA, Red vs Blue, Last Knight Standing, King of the Pie, Pie Heist. Hot Pie is the stretch goal for week 6.

## 3. Six-week plan (QA agents extended each week)

**Week 1: Shell and input.** Electron, steamworks.js, bundled fonts and PeerJS, gamepad layer, settings file. Put the store page up as Coming Soon.
- QA: an `offline-boot` scenario (network blocked; 0 errors; a match starts).
- A `pad` persona drives a stubbed `navigator.getGamepads`. Metrics: frames from button press to swing (≤2), and hot-plug survival.
- `run.js` still loads the game over `file://`, which the Electron build no longer matches. Add an Electron target.

**Week 2: Combat and spawns.**
- Spawn candidates come from all floor tiles at least 3 tiles from pits or lava, scored by distance to enemies and line of sight. Protection lasts 2s but breaks when you attack.
- Add a swing telegraph, an input buffer, a timed-block parry, and aim from the right stick.
- QA targets:
  - Spawn deaths under 10% on every arena.
  - Human sword connect rate 55–65%; Spicy bots at 65% or below.
  - Hazard KO share under 35% per arena (Rooftop Rumble is at 62%).
  - Sword share of KOs between 35% and 50%.
- New `parry` persona.

**Week 3: Menu, customisation, save data, tutorial.**
- Players pick helm, plume, metal and emblem. These already exist as `KITS` and `EMBLEMS`. Separate identity colour from cosmetics.
- QA: a `menu-walker` persona uses the pad only. Metrics: inputs from cold boot to match, and no screen that can't be exited.
- Save round-trip test, and corrupted-save recovery.
- The `idle` and `fuzzer` personas must never softlock the tutorial.

**Week 4: Modes.**
- QA: objective personas (`carrier`, `defender`, `hill-sitter`).
- Metrics:
  - Every match ends within its limit.
  - Draw rate under 10%.
  - Red/Blue win rate 45–55% over 50 matches.
  - Share of the time bots spend on the objective.
  - Comeback rate: how often the leader at half-time loses.

**Week 5: Online.** Steam lobbies and relay, clean handling when the host leaves, local and online players together, delta snapshots.
- QA: a two-instance net harness with injected latency and loss (100ms/2%, 250ms/5%).
- Metrics:
  - Kbps per client, under 64.
  - Client position error against the host, in px.
  - A host drop returns everyone to the lobby cleanly 100% of the time.
  - 50 join/leave cycles with no leaks.

**Week 6: Performance, accessibility, release candidate.**
- QA:
  - Extend `perf` to report p50/p99 frame time per arena and per event, with CPU throttled 4× through CDP.
  - A 30-minute soak test for memory.
  - Screenshots with colour-blind palettes and screen shake set to 0.
  - A full regression across every mode and arena.
- Run a real-human Steam Playtest.

## 4. Top 10 risks and mitigations

1. **Too few wishlists:** get the page up in week 1, post GIFs weekly, and enter Next Fest. Hold back launch rather than ship to silence.
2. **NAT failures online:** use Steam relay, and point people to Remote Play Together.
3. **Electron input or overlay problems on Deck:** test on a Deck from week 1.
4. **The single file grows past 3,000 lines and the AI assistant starts making edits that break things:** split it into modules in week 1, and run QA before every commit.
5. **Chaos hides bad combat:** the week 2 metrics are mandatory.
6. **Bots break the new modes:** build each mode together with its bot behaviour and QA persona.
7. **Flashing complaints or seizure risk:** ship the reduce-flashing option and the warning.
8. **Licence problems (music, fonts):** do an audit in week 1.
9. **Scope creep toward Chicken Racing:** it stays on the roadmap only.
10. **Burnout:** the week 6 cut line is Hot Pie.

## 5. Don't build before EA

- The Godot port, 3D models, or proximity voice.
- Full Chicken Racing, host migration, ranked play or matchmaking.
- Cross-play between browser and Steam.
- A level editor or Workshop support.
- More power-ups (there are already 25), arenas beyond 6, a cosmetics store, accounts, or anti-cheat.
