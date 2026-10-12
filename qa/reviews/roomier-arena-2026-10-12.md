# Roomier arenas and beta.7 integration — 12 October 2026

The player asked for slightly larger maps alongside the Chicken Race, mouse-input, weapon-level and story revisions. Arena setup and Couch party now offer Classic (the existing default) and Roomier. Roomier uses 44-pixel rather than 40-pixel tiles on the same grid: 10% longer distances on each axis, about 21% more playable floor area. Knights, movement speed, attack reach and combat timing remain unchanged. Story, menu demos and the optional controlled first-fight study retain Classic geometry.

The world, collision boundaries, obstacles, spawn selection, objectives, minimaps and cached background surfaces use the selected geometry. HUD layout remains independently fitted to 1280 by 800. The preference is saved with strict enum normalization. Host setup carries the selected size; old setup packets default to Classic. Roomier starts require each participating guest to advertise the new size capability, with an actionable lobby message for older clients. Classic remains compatible with older guests.

## Evidence

Final source acceptance passes 101 geometry/browser checks and 14 real PeerJS checks, with zero browser exceptions. These cover all six maps in both sizes, objective and respawn fixtures, high-impulse boundaries, setup replay, small/touch/couch viewports and restoration around Story and the first-fight study. PeerJS covers a legacy hello blocked from Roomier but allowed in Classic, a current-capability join, movement beyond the old world edge and a same-connection Classic rematch. Both final reports identify index SHA256 `b045dec79b6b088c24e55205231a68c07dd38b9831828d083bf60ab6a1413a27`. Actual PeerJS checks use two isolated profiles on one machine; they do not establish WAN connectivity or latency acceptance. Package results follow after export checks.

An additional full-race check found bots unable to finish Rooftop on both Classic and Roomier. The shared 64-pixel pit-repulsion force cancelled the hazard-aware flow-field direction on narrow Rooftop paths. Merely removing it allowed finishes but left unwanted falls, so that approach was not accepted. Rooftop racers now follow cardinal cell-centre waypoints, slow before corners and refresh their waypoint after respawning. They do not dash on this narrow course; human dashing, other maps and combat steering retain their existing behavior. The conflicting repulsion is bypassed only for Rooftop race navigation.

`qa/rooftop-race.cjs` passes 18 source assertions: Easy seeds1/7/777 in both sizes, contested and solo, plus Medium/Hard/STEVE seed777 solo in both sizes. All solo routes complete four laps with zero deaths; contested races complete in about54–65 simulated seconds and record falls that may follow shoves. This is deterministic simulation evidence, not human race balance. The original stalled seed777 evidence and intermediate diagnostic runs remain under `qa/results/`.

## Scope and limits

Controls and upgrades are reviewed in [player-controls-2026-10-12.md](player-controls-2026-10-12.md); the revised scenes and playable opening are reviewed in [story-opening-2026-10-12.md](story-opening-2026-10-12.md). The user has also identified previously generated story videos; their location has been requested after local searches found the gameplay trailer, sword studies and new actual-game opening recording, but no earlier story-video set. The new canvas scenes do not establish that those prior videos have been recovered or installed.

This is a private friends beta. Human story/pacing, map-size preference, balance, physical controllers, WAN, second-PC and minimum-hardware acceptance remain open. No Steam publication or public download is performed by this task. Earlier local native-runtime faults remain unexplained.
