# Beta.9 packaged home checks

Actual ASAR from frozen source `ae262b505ca9758de008df53418a06e26695a8a7`, version `0.3.0-beta.9`, was extracted to ignored `build/beta9-packaged-payload`. Bundled Node ran the new `qa/home-navigation-browser.cjs` fixture with `CK_QA_ROOT` pointing there.

First attempt passes all 44 checks with zero browser exceptions and stable before/after hashes. `report.json` records exact root, checks and hashes; `browser-run.log` and screenshot PNGs retain details. Index/campaign UI/Faction UI hashes match the reviewed frozen runtime and the ASAR inventory.

Coverage includes fresh/returning Story, four primary routes and utilities, actual mouse/keyboard and synthetic-pad navigation/back focus, routes into retained play modes, settings integrity and constrained-window layouts. Chrome uses temporary profiles and the extracted payload file origin. Separate actual EXE desktop origin/restart/launcher/relocation and four-route/Quit-cancel evidence is in `../beta9-desktop/`.

No normal saves or user game were touched. Synthetic pads do not establish physical-device compatibility; no human usability, network, second-PC or Steam acceptance is claimed.
