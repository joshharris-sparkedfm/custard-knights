# Chicken Race and mouse controls

The reported Chicken Race problem exposed missing mouse attacks and a zero-damage peck path that could knock out another racing chicken. Players and bots now share a nonlethal shove, dash protection and a visible peck ring. Click or Space (controller A) pecks toward the player's aim.

Arena keyboard movement can be combined with mouse aiming, left-click attack and right-click guard. Mouse button chords support shield bash. Focus loss, pointer exit and pause release held mouse input. Assigned keyboard couch seats retain mouse control while another player uses a pad. Explicit human aim is respected instead of being replaced by melee aim assistance. Guests send a validated optional aim angle; seven-field legacy input remains accepted.

Duplicate weapon pickups retain levels through ammo exhaustion and swaps, capped at III until defeat. Ammo is capped at six refills. Sword reach upgrades also stack to III and persist until defeat. Saves are unchanged; this is per-life arena progression, not a new Faction Front progression system.

## Evidence

- `qa/results/player-controls/final-acceptance/report.json`: 23 browser checks, zero exceptions, including actual CDP mouse button chords, synthetic pad/keyboard coexistence, race pecks, upgrade lifetime and invalid input rejection.
- `qa/results/player-controls-network/report.json`: 16 checks across two real PeerJS profiles. Keyboard movement, independent mouse aim, bow fire, guard, release, angle validation and guest Chicken Race shove passed without exceptions.
- Release regression runner: 26 checks passed, including seat continuity, awards, stale input/snapshot rejection and audio lifecycle.
- Read-only review found mouse button chord and couch-device conflicts; both were corrected before final acceptance.

Earlier local harness failures are retained: duplicate top-level lexical declarations, an unregistered mock connection and checking pad hint state before its animation-frame poll. They are not hidden as game fixes. Tests are controlled same-machine browser evidence, not physical-device, WAN or human enjoyment acceptance. The previous exported beta.6 ZIP has not changed; these source changes await the next packaged build with the story/map work.
