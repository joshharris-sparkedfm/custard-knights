# Ranged aim browser run 1

Captured before fixture corrections; this is the console output retained from the first browser execution. It used the same implementation source later hashed in `report.json` run 2.

```text
PASS Actual game loads in isolated browser profile
FAIL Keyboard movement and pointer aim are independent
PASS Roomier scaled canvas pointer coordinates fire toward the selected world point
PASS Mouse aim is stable while stationary
PASS Arena radial deadzone preserves a diagonal right-stick aim while left stick moves
PASS Neutral right stick retains aim without jitter
FAIL Keyboard-only movement takes facing while right stick is neutral
FAIL Parked mouse aim cannot override a later pad aim: CDP Object reference chain is too long
PASS Pointer aim and attack follow the kb1 couch seat
PASS Pointer does not steal the pad-owned couch seat
PASS Pause and blur clear held pointer actions
FAIL Faction starts a real local practice battle: fixture assumed local player id was exactly `local`
FAIL Dependent Faction aim checks: no battle/cue state after the bad fixed-id assertion
PASS Faction modal entry clears held mouse attack and guard
```

The fixed-ID Faction assertion and CDP object serialization error were fixture defects. The keyboard-only check had been executed while the first seat was pad-owned, so it also tested an invalid ownership setup. Run 2 corrected these cases and captured structured input results.
