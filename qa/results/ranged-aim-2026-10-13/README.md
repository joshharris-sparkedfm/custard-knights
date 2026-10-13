# Ranged aim focused QA evidence

`report.json` records the final real-browser run and source SHA-256 hashes. The fixture is `qa/ranged-aim-browser.cjs`; it routes synthetic keyboard, pointer, and standard-pad events through Chrome and the game's normal event/polling loop. The profile is isolated and temporary.

All 20 focused checks passed. Coverage includes Roomier canvas coordinate mapping with an observed live bow projectile trajectory, independent keyboard movement and pointer aim, circular diagonal deadzone, pad aim cue and neutral retention, keyboard move-facing, mouse-to-pad takeover, reversed couch-seat ownership, classic sparse index 1 followed by a late index 0 controller without duplicate ownership, pause/blur input clearing, and Faction camera mapping, reticle, radial aim, neutral retention, keyboard takeover, and modal clearing.

The bounded two-peer `qa/player-controls-network.cjs` run passed all 16 checks and is saved under `online-guest/report.json`. Coverage includes live guest aim and movement serialization, host-owned firing, ammo snapshots, guard, blur sentinel, compatibility, malformed aim rejection, nonlethal chicken peck knockback, snapshots, and no runtime exceptions. The first attempt is preserved as `online-guest/attempt-1-unfocused-report.json`; it dispatched synthetic blur to test clearing but omitted focus restoration before next-round gameplay, which left input intentionally suspended. A narrow fixture fix now dispatches focus after the blur assertion; the full rerun passed.

Screenshots: `arena-pad-aim.png`, `faction-mouse-aim.png`, `faction-pad-aim.png`, and `final-state.png`. Earlier diagnostic attempts are preserved in `attempt-1-notes.md` and `attempt-2-report.json` / `attempt-3-report.json`; their harness failures were corrected and are not the final verdict.

Physical-controller device behavior and human acceptance were not performed.
