# Roomier arenas and Rooftop race acceptance - 2026-10-12

Classic remains the saved default. Roomier uses44-unit tiles instead of40, increases the world from1280x800 to1408x872, and increases the unchanged interior tile layout from1200x640 to1320x704 (21% more area). Knights, human speed and combat reach stay unchanged. Arena setup and Couch party expose the choice. Story and the first-fight comparison force Classic and restore the arena preference afterwards.

World/HUD fitting is separated, backing canvases resize on transitions, previews are keyed by size, and host setup carries a bounded size enum. Missing setup size means Classic. New hello messages advertise arenaSizeVersion:1; the host refuses Roomier when any participating remote lacks that strict capability, with update-or-Classic guidance. Everyone must run a build with Roomier support to use it online. Classic remains compatible with legacy hello/setup messages.

## Verified source acceptance

- arena-size.cjs:101 checks pass, zero exceptions. All six maps in both sizes, unchanged tile topology, expanded positions, all four objective modes with connected routes, spawn/respawn, large wall impulses, cache dimensions, local save reload/fallback, Story/study restoration, touch follow camera/overlay, fixed HUD and couch whole-map view. Seed777 races finish on all six maps in both sizes.
- arena-size-network.cjs:14 checks pass, zero exceptions. Two real PeerJS peers in separate same-machine profiles, a legacy hello refusing Roomier but accepting Classic, current-capability rejoin, Roomier setup, real guest movement beyond the old world edge, matching authoritative/predicted wall limits, and a Classic rematch on the same connection.
- rooftop-race.cjs:18 checks pass, zero exceptions. Results below.
- player-controls.cjs:23 existing checks pass after the geometry/race changes.
- preferences.test.cjs:4 tests pass.

## Rooftop diagnosis and focused fix

The general64px pit-repulsion vector canceled safe route directions in narrow Rooftop lanes. Removing it alone produced excessive falls. Rooftop race bots now commit to cardinal cell-centre waypoints, verify clearance, slow near turns and reset waypoints after respawn. They skip the conflicting broad repulsion and avoid bot dashes on this map. Other map navigation, shared combat steering and human dash are unchanged.

The pre-fix seed777 Easy races finished with zero laps in both sizes after180s; original data and source hash are preserved in qa/results/rooftop-race-before.json. Solo acceptance requires four completed laps with zero deaths. Contested acceptance requires a finish within180s and records deaths; rivals can still shove chickens into pits.

| Difficulty | Size | Seed | Actors | Finish | Winner deaths | Total deaths |
| --- | --- | --- | --- | --- | --- | --- |
| easy | classic | 1 | Contested | 59.02s | 0 | 5 |
| easy | roomier | 1 | Contested | 65.10s | 0 | 3 |
| easy | classic | 7 | Contested | 60.48s | 1 | 8 |
| easy | roomier | 7 | Contested | 61.23s | 1 | 4 |
| easy | classic | 777 | Contested | 53.85s | 0 | 6 |
| easy | roomier | 777 | Contested | 61.95s | 0 | 4 |
| easy | classic | 1 | Solo | 55.98s | 0 | 0 |
| easy | roomier | 1 | Solo | 61.02s | 0 | 0 |
| easy | classic | 7 | Solo | 53.65s | 0 | 0 |
| easy | roomier | 7 | Solo | 58.78s | 0 | 0 |
| easy | classic | 777 | Solo | 57.38s | 0 | 0 |
| easy | roomier | 777 | Solo | 57.08s | 0 | 0 |
| medium | classic | 777 | Solo | 57.38s | 0 | 0 |
| medium | roomier | 777 | Solo | 62.48s | 0 | 0 |
| hard | classic | 777 | Solo | 57.38s | 0 | 0 |
| hard | roomier | 777 | Solo | 62.48s | 0 | 0 |
| steve | classic | 777 | Solo | 51.40s | 0 | 0 |
| steve | roomier | 777 | Solo | 62.48s | 0 | 0 |

## Artifacts and limits

Reports and screenshots are in qa/results/arena-size, qa/results/arena-size-network, qa/results/rooftop-race and qa/results/arena-size-controls. Reports record index hashes; live network acceptance verifies source did not change during its run. All six Roomier maps plus touch/couch screenshots were visually inspected. UTF-8 punctuation was restored to the original characters; product reporting now says0.3.0-beta.7.

Source checks are synthetic, not human playtesting or physical-controller certification. Real multiplayer was tested on one machine/network, not across NATs. Packaged acceptance has not yet run here: after building beta7 use `node qa/arena-size.cjs qa/results/arena-size-packaged --packaged` and `node qa/rooftop-race.cjs qa/results/rooftop-race-packaged --packaged`. These load the produced app.asar through the existing Electron QA launcher and record the archive hash; they do not independently certify the distributable EXE launcher.
