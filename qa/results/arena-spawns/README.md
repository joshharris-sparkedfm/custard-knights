# Arena spawn audit

The user reported a Quick Brawl dash/collision disappearance and asked that spawn points also be checked. This audit covers spawn placement separately from the movement boundary investigation.

`qa/arena-spawn-checks.cjs` runs the actual game in isolated headless Chromium with a fresh temporary profile. It calls the existing QA API's `newGame`, `hurt`, `startMayhem`, and `update`; it does not operate the user's running EXE or profile.

## Before fix

- `before/report.json`: all six maps' initial eight spawn positions and ordinary KO/respawn cycles passed (12 checks). The real trapdoor event produced an unsafe respawn.
- `before-teams/report.json`: expanded to both FFA and team modes, with 24 initial/ordinary respawn checks passing and the same trapdoor check failing. No browser exceptions.
- `before-warning/report.json`: also covers pending trapdoors. Both trapdoor regressions fail; the 24 ordinary checks still pass. The pending-hole case uses seed 76 at `(1060, 460)`; the normal respawn completes with 0.1633 seconds remaining before that warning tile opens.
- Reproduction: courtyard, deterministic random seed 3. Actual trapdoor mayhem opens the precomputed floor candidate at `(100, 580)`. The test marks the other candidates recently used to isolate the scoring decision, then uses a real lethal `hurt` and advances the ordinary 1.8-second respawn timer. The player reappears at `(100, 580)` on the live `o` pit tile, with two seconds of spawn protection.
- The test does not place a character into a fabricated pit or teleport it out of bounds. Other entities are held dead to isolate spawn selection from unrelated combat.

The initial spawn definitions on all six maps were finite, distinct, and on safe terrain in both FFA and teams: 96 checked initial placements plus 12 real KO/respawn cycles. The defect is reuse of cached floor candidates after trapdoors change terrain, not the authored spawn coordinates.

The requested production correction is to recheck current safe terrain and pending/open trapdoors before scoring respawn candidates, retaining the permanent spawn markers as fallback. The parent agent owns the production `index.html` edit and movement regression.

## After parent fix

`after-initial/report.json` passed the original 27 checks (24 ordinary, two trapdoor regressions, no browser exceptions). The shell call also ran an unrelated search that returned no matches, so its combined shell exit code was 1; the QA report itself has no failed checks.

`all-modes-first/report.json` and the latest `all-modes-final/report.json` pass **149/149 checks**, with zero browser exceptions:

- 8 arena modes × 6 maps: 384 initial knight positions checked, plus 48 actual lethal-hit/respawn cycles (96 checks).
- Open and pending trapdoor regressions both pass (2 checks).
- All 8 arena modes: keyboard walking into an authored Rooftop pit causes exactly one KO and a safe respawn; ordinary keyboard dash crosses that same two-tile pit without a KO (16 checks).
- Deliberately crowded knight pairs remain inside each of the four arena walls after separation (4 checks).
- All 8 campaign encounters start with finite actors on safe ground (8 checks). The actual bridge encounter is launched with a disposable unlocked campaign fixture; keyboard movement takes the safe outer route to earn the first checkpoint, then walks into the next pit. The normal falling, KO, shared respawn, and campaign event sequence returns the player to `(440, 440)`, with one fall and the encounter still playing (1 check).
- Faction Front's separate core: all 3 modes × 3 supported army sizes have finite, protected initial rosters; a human knight moves and repeatedly dashes from its generated spawn to all four world limits without escaping (18 checks). In each mode, two humans approach from their generated spawn positions, the attacker uses actual heavy attacks until the victim dies, and the normal timer respawns the victim with finite coordinates and protection (3 checks).
- No browser exceptions (1 check).

No production edits were made by this audit. The fixed runtime hash and the unchanged campaign/Faction source hashes are recorded in `all-modes-final/report.json`. `all-modes-first` is the first execution of the expanded harness. During provenance annotation, the hash guard detected the parent's subsequent collision `contain()` change and refused to stamp newer hashes onto the older result. The affected suite was then rerun to produce `all-modes-final`. No gameplay test failures were suppressed or assertion thresholds loosened.

### Limits

This is targeted automated regression coverage, not an exhaustive gameplay soak or physical controller acceptance. Boundary and pit cases use controlled starting positions on real safe map terrain, then actual game input, collisions, hazards, damage and respawn; they do not inject an out-of-bounds character and call that a reproduction. Other actors and incidental pickups are suppressed where needed to isolate the case. Faction boundary travel uses a vanguard and suppresses unrelated bots; the initial roster checks include all four roles. The parent separately owns the expanded arena dash/knockback boundary matrix and packaged EXE acceptance.
