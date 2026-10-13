# Beta.16 frozen package evidence

Frozen source `a7e5ed4b653823ee2a84cb6df84d425206c46072`, version 0.3.0-beta.16. FE08 adds the first playable bakery story slice: talk to Mabel, take the covered tray, deliver it at the banquet gate while Steve independently steals a bun, rescue Mabel/Alf/Pip from the pantry, then collect their prepared supplies and go east to the actual bakery defence with its visible siege bowl. Quiet Interact uses the current Swing map or left click; combat retains its existing actions. Fresh Story offers Begin at the bakery; replay and explicit pause skip remain available. FE09's fuller playable treatment of the remaining story is unfinished. No human comprehension/fun, physical-device or finished-game/Steam acceptance is claimed.

## Exact package and checks

All **66** packaged source/metadata entries match, including new game/bakery-opening.js. Standard recursive staging, media and package configuration remain unchanged. Actual EXE lifecycle write/read/launcher/relocated-install checks pass on their first invocation with fresh marked isolated profiles, normal close and separate processes. Saved rewards/outfit/campaign/settings, offline assets and fullscreen are exercised without accessing normal player saves or closing a user game.

The exact extracted ASAR passes broad bakery **36/36** on its first invocation, with zero errors and stable source hashes: [report](../beta16-packaged-bakery/report.json). The estimate before execution was 35; 36 is the actual current harness count. Real Chrome/CDP keyboard/mouse and sampled synthetic standard pads exercise UI/navigation, opening interaction and carry/delivery, independent theft, pantry collision/escort/hold/exit and default return. Inert guard/raider fixtures, direct completed/retry/checkpoint/storage setups and shortened observations are explicitly recorded. These are not input-only combat or physical/controller/human acceptance.

A focused final-correction supplement passes **7/7** once, zero errors/stable hashes: [report](../beta16-packaged-bakery-followup/report.json). It covers quiet skip/natural terminal cleanup and corrected Talk/return/siege compact readability beyond the native fixture's scope. It overlaps broad cases; it is not 43 unique package cases. The unchanged warning/broad other-mode suites were not rerun.

All six hosted Battle core portability jobs pass on the first attempt at this exact freeze in [run 38418272612](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/38418272612); ci-summary.json records the workflow/jobs.

## Native clean-reload programmatic UI

Reviewer-cleared actual-bakery.cjs SHA256 `f010d2efd16386ab56544eebf3ddc34e1076f11b9a7d7f92e2575e3991038f5e` passes **eight** checks on its first invocation. Standard acceptance arguments initially bootstrap `?qa=1` in a fresh marked temporary profile. The in-memory acceptance.run replacement then explicitly loads a **second clean** `custard://game/index.html` document before measured inputs. The report records bootstrapQaQuery=true separately from checkedDocumentQuery='' and checkedDocumentQaHelpers=false. This is native programmatic UI on a clean reload after QA bootstrap, not ordinary untouched production startup.

The measured renderer/source is not instrumented. Native synthesized mouse/Escape events and read-only DOM/campaign-save observations cover fresh bakery entry, objective/speech, pause, explicit replay/skip into pantry combat, quit cleanup and theatre replay/skip. Ten-second observed readiness predicates and a three-minute child watchdog bound execution. Its own window is shown without taking focus; the isolated root/profile/marker, input trace, helper hash, original ASAR index hash and full ASAR before/after hashes are recorded. Full ASAR remains unchanged. No direct game-state injection, autoplay override, native movement/delivery/rescue-combat completion, physical input, responsiveness, human comprehension or listening acceptance is claimed. Untouched lifecycle checks above are separate. Pre-run reviewer catches of bootstrap disclosure and prompt wording were corrected before invocation; no failed beta.16 native invocation occurred.

## Packaging/export provenance

Reviewed corrected Python extraction adapter is byte-identical, SHA256 `d00b38740e9344e8b10b1ae2d6c9fd28dacf5ff2ac2a5b49d8a0e1c898e2427f`. Known native-extractor and earlier beta.14 DEFLATE roundtrip faults were not retried. Cached Electron ZIP CRC/hash and every extracted template file's bytes/hash are checked in python-template.json; template timestamps use extraction time rather than original ZIP mtimes. Locked copied dependencies, bundled Node 24.19/Python and Electron 44.7.0 were used without updates. Generated vendor/catalog content was newline-normalized against the exact freeze then restored to exact Git bytes before source verification; all content was already identical. packaging-workaround.json/generated-restoration.json record this.

Both exports use **ZIP_STORED directly**, refusing existing destinations. The unchanged frozen standard Friends bundler executes in memory with exactly the reviewed ZIP_DEFLATED/compresslevel→ZIP_STORED and failed-partial-cleanup→retention substitutions. Standard path/version/commit/checksum/ASAR validation, rendering and UTF-8/newline transformation remain intact; original/in-memory hashes and exact substitutions are recorded. Old outputs and the beta.14 failed partial remain preserved. No beta.16 export failure occurred; larger stored ZIP sizes are intentional.

- Preview: **800745130 bytes**, SHA256 `5e84a7849d1e7e4e837c6f96f5d28b202a8592245a5a4c282c1e8ad67321911f`.
- Friends: **800720142 bytes**, SHA256 `af8c7c69dbf3db2d7aa6dab4edfc3655547805a7b6bda14c27579b7f265e0024`.
- ASAR: `860e6aaef17248ca0e9c99b393c3b4d26e48b80b08911da3546ec8c4313494b1`.
- EXE: `eb271f2acf7aefae39ab99c21b78e15e1aa187ad9a4b11f7a6f34b635f24ee35`.

Final Python verification passes its first invocation: ZIP CRC/hash, all 73 game files against frozen dist/preview/BUILD-INFO, exact frozen START-HERE/FEEDBACK after standard UTF-8/CRLF-to-LF transformation/build substitutions, frozen normalized bundler/exact adapter substitutions and native source/ASAR gates. exports.json records this. Independent .NET ZipArchive, compiled CRC32 and SHA256 verifies all **75 preview / 76 Friends** entries against manifests/material hashes. No public upload/sending occurred. Current evidence supersedes PREPARATION.md's historical pending status and the preview's earlier copied RESUME-CHECKPOINT latest-build status; later docs/evidence commits do not change runtime bytes.

Legacy warning single-banner/delayed-positive-snapshot/spike-at-rise limits, controller/WAN/second-PC/minimum-hardware/long-soak/human/Steam acceptance and earlier native anomalies remain open. This is a private beta for one checked story increment.

## Commands

Use bundled Node/Python under `C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies` from the frozen checkout:

```text
node qa/results/beta16-desktop/build-python-extract.cjs
python qa/results/beta16-desktop/restore-generated.py a7e5ed4b653823ee2a84cb6df84d425206c46072
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta16-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/bakery-story-browser.cjs qa/results/beta16-packaged-bakery
CK_QA_ROOT=<extracted ASAR> CK_QA_CASES=followup CK_QA_LIFECYCLE=1 node qa/bakery-story-browser.cjs qa/results/beta16-packaged-bakery-followup
node qa/results/beta16-desktop/actual-bakery.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta16-desktop/export-preview-stored.py a7e5ed4b653823ee2a84cb6df84d425206c46072
python qa/results/beta16-desktop/export-friends-stored.py
python qa/results/beta16-desktop/verify-exports.py
pwsh -File qa/results/beta16-desktop/verify-dotnet.ps1
```

Unset case/lifecycle flags for the broad run. Commands describe the retained evidence; accepted outputs must not be overwritten or passing unchanged checks repeated.
