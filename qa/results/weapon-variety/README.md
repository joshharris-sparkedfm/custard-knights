# Actual-browser weapon integration QA

`final/report.json`: **30/30 checks pass**, zero browser exceptions. `final/weapons.png` was visually reviewed: both held weapons are distinct, and the Crossbow and Croissant icons sit above their actual safe Courtyard weapon pads at `(580, 380)` and `(700, 380)`.

The isolated Chromium harness uses a new temporary profile. It never opens or operates the user's EXE/profile. Production integration remains owned by the weapon agent; this QA made no production edits.

Coverage uses the actual arena engine and its existing QA API:

- Weapon pickup, duplicate upgrade/refill, attack-input firing, ammunition consumption, held-input reload limits, firing after reload, and final-round unequip through normal held attack input.
- Crossbow piercing two separate knights; both weapons stopping at actual crates and boundary walls. Each crate loses exactly one health per shot.
- Real block input reflects ownership and allows the returned projectile to damage its original shooter.
- Croissant follows a moving owner, encounters an enemy on both outward and return legs without applying a second hit, expires after actual owner KO or an actual pit fall, and returns to the defender after reflection.
- Eight real shield reflections end at age `1.8166666667`, the first fixed simulation tick beyond its 1.8-second lifetime, preventing an endless reflection loop.
- Both weapons are collected by walking into actual map pads.
- Snapshot serialization/hydration retains held weapons, projectile kinds and pad items; the actual arena renderer draws the hydrated scene without exceptions.

Source hashes in the final report are captured before navigation and verified unchanged after the checks:

- `index.html`: `36c3172ab25657524d731c6aef896557ac857831537ce43331f0bb4934ec70aa`
- `game/weapons.js`: `e281fb8745a024b7e325ed44bb4d25e87e069eb48e2a4b68c2269fbd7bb50fd9`

## Preserved iterations

- `first/failure.txt`: the initial harness constructed a third knight with an incomplete synthetic bot-AI object. That fixture produced NaN while trying to run bot decisions. The third knight became an idle human fixture to isolate projectile collision; no runtime fix was required.
- `second/report.json`: 25 checks passed. Its screenshot used QA-only relocated pads, which appeared above wall tiles; it is diagnostic only and does not establish normal map placement.
- `extended/report.json`: 30 checks passed with actual map pads, falling-owner, reflected-return and repeated-reflection lifetime checks added. Its screenshot also passed visual review.
- `final/report.json`: the same 30 checks pass, with source-stability verification and ammunition exhaustion now exercised through held attack input rather than direct repeated `fire` calls.

## Limits

These are controlled integration fixtures at the game's fixed 60 Hz simulation step, not a long gameplay soak. The once-per-enemy test explicitly clears temporary hit immunity after the first hit and confirms another return contact, so it checks persistent throw history rather than merely temporary invulnerability. Snapshot round trips do not establish actual network transport or WAN behavior. Visual review covers the pictured game scale, not every display size or accessibility configuration. No rare musical chaos event or AK-style weapon is included.
