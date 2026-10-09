# Rare-event PeerJS evidence

The completed run is **third/report.json** and **third/summary.md**: 17 checks passed, no browser runtime errors, exit code 0. Production source and audio hashes match before and after the run. The witness screenshot was visually reviewed for the rare banner and recipient/ammo HUD; screenshots also preserve both guest views.

This used three isolated Chrome profiles on one machine and network, with real PeerJS signaling/data connections. The host's rare plan and recipient were chosen with QA hooks; live host frames then broadcast ordinary snapshots. Guest firing used a browser keyboard event and the actual guest input sender. Bots were disabled and human protection extended to isolate network behavior. Audio verification checked WAV playback state and time advancement with Chrome output muted; it was not an auditory quality review. Cross-network NAT, public hosting and physical controllers were not tested.

Earlier harness attempts are retained honestly:

- `report.json`: preflight failed before browsers launched because the harness used an abbreviated WAV filename. Corrected to the actual catalog filename.
- `final/report.json`: three checks passed before the harness reused a top-level `const g` in DevTools evaluation. Corrected the fixture to block scope; this was not a game error.
- `second/report.json`: seven checks passed before the harness's audio observer was unavailable. Enabled the Page domain before registering its document observer. This was not a game error.

The existing `qa/network-acceptance.cjs` was unchanged, and its full historical matrix was not rerun.
