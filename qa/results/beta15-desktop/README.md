# Beta.15 frozen package evidence

Frozen source `f201acab3ee61a7bcb6900d206b4dc9715cf9b41`, version 0.3.0-beta.15. Critical arena/campaign banners take priority over flavour/reward messages; the local SFX mixer reserves eight of 64 voices for warnings, and critical banners duck music to 35% of its current local base level. Saved volume/mute choices apply. Single-banner arbitration leaves other world tells independent. Delayed positive snapshot TTL has no host-clock age guard; arena spike audio remains at rise rather than prewarning. Faction Front and cinematic/status presentation are separate. The prior accurate sword tap/hold-through-recovery/charge/release guidance is retained. No normal player settings or saves were edited.

## Package and functional checks

All **65** packaged source/metadata files match, including new game/warnings.js and audio/warning-mixer.js. Standard staging recursively ships these files; no packaging configuration changed. Actual EXE lifecycle write/read/launcher/relocated-install checks pass on their first invocation with fresh marked isolated profiles, normal close, separate processes, saved rewards/outfit/campaign/settings, fullscreen and offline assets. Normal saves and user windows remain untouched.

The exact extracted ASAR passes the current full default warning harness **11/11** (eight local and three network), plus separate campaign **2/2**, on first invocations. Both have zero errors and stable frozen source hashes. Reports: [default](../beta15-packaged-warning/report.json), [campaign](../beta15-packaged-warning-campaign/report.json). The default run already includes its three actual same-host PeerJS cases; separate source network evidence overlaps and is not added as a second package count. Direct forced producers/snapshots/state/completion fixtures are labelled. Native WebAudio graph/digital RMS and muted-browser envelope checks establish no human audibility, recognition, physical speaker, responsiveness, WAN or minimum-spec acceptance.

Hosted CI passes at the exact freeze on first attempts: all six general jobs in [38409174611](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/38409174611) and both soundtrack jobs in [38409174541](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/38409174541). ci-summary.json records them.

## Native instrumented warning fixture and retained failures

Final **eight** native instrumented checks pass in actual-warning-fixture4.json. A marked fresh profile runs the actual EXE and native origin. Its own QA window is shown without taking focus from the user. Acceptance.run is replaced in memory, and the native index response receives only a bounded async fixture at its unique final closure marker; other assets retain the standard native handler. The fixture calls production banner functions inside their closure and uses programmatic menu/slider/mute/pause controls. It exposes no CK query helpers. Original index SHA256 `6f5565642e4f5e33b6df126704f0b1e63af9519e47a0f811c9e54aa924d967eb` matches packaged source; original/instrumented index hashes are logged before load and recorded on success. On-disk ASAR stays unchanged. Untouched EXE lifecycle evidence is separate.

This is an **instrumented renderer fixture**, not untouched-renderer/input-only/physical gameplay acceptance. Checks cover protected warning priority, live local music volume/duck, mute/unmute SFX bus, pause/resume and clearing back to the selected level. Every predicate/assertion records banner, saved/base/duck/music volume, bus gain, AudioContext state/currentTime, hidden/menu/paused/demo/over/audio-blocked state. All readiness gates are bounded to ten seconds. The final mute/unmute gates observe scheduled AudioParam changes; this establishes no physical hardware latency, sound quality or audibility.

All three earlier helpers/reports/logs remain preserved:

- actual-warning.cjs/json/run.log failed because production closure-local sfxMixer was unavailable to the external executeJavaScript fixture. No runtime defect is claimed.
- actual-warning-fixture.cjs/json/run.log reached the inserted production-closure fixture but failed a same-task combined banner/volume assertion without state diagnostics. Its exact cause remains unproven; authored music fades motivated the changed observed gates.
- actual-warning-fixture3.cjs/json/run.log passed warning priority/duck/live volume, then observed mute=true, paused music and zero music volume while the same-task AudioParam gain still read approximately .41. This does not establish a runtime mute defect. The reviewed fourth fixture kept assertions, added bounded bus observations and AudioContext diagnostics, and passed once. No production patch/autoplay-policy override occurred.

## Packaging and export provenance

The known native extractor and beta.14 DEFLATE roundtrip anomaly were not retried. Locked copied dependencies, bundled Node 24.19/Python and Electron 44.7.0 were used. Extraction uses the byte-identical reviewed corrected Python helper, SHA256 `d00b38740e9344e8b10b1ae2d6c9fd28dacf5ff2ac2a5b49d8a0e1c898e2427f`; its newline escaping was already corrected. Cached Electron ZIP CRC/hash and every extracted template file byte/hash are checked in python-template.json. Timestamps use extraction time, not original ZIP mtimes. Generated vendor/catalog content was compared after newline normalization and restored to exact frozen Git bytes before package source verification; all generated content was already identical. packaging-workaround.json and generated-restoration.json record this.

Both beta.15 exports use **ZIP_STORED immediately** and refuse existing outputs. There is no invented beta.15 failed compressed archive. The unchanged frozen standard Friends bundler executes in memory with exactly two asserted substitutions: ZIP_DEFLATED/compresslevel=4 to ZIP_STORED, and failed-partial cleanup to a no-op. Standard rendering/path/checksum/ASAR/version/commit validation remains intact; source bytes are hashed before and asserted unchanged after. friends-adapter.json records source/in-memory hashes and substitutions. No beta.15 archive failure occurred. All older outputs, including the failed beta.14 547162447-byte partial, remain preserved.

- Preview ZIP: **800718857 bytes**, SHA256 `0a86368c9899d95b02e12d0355a094077701b9afa34ecfbc78fc2008382cb1ef`.
- Friends ZIP: **800700135 bytes**, SHA256 `65c0ff3027eb176a9b9f4a42c5f09654beb7a0aa7a7c2563140a604e0dcd958e`.
- ASAR SHA256: `b603fc4b7957f7beea066ebea4f4aa40a49b1ddce0fc22980cded8cadd53f953`.
- EXE SHA256: `7c0e6e346ea12ecafc83da99faa40b59beee741b6923f794ba992efde6fd7ed3`.

Final Python verification passes its first invocation: both ZIP CRC/hash, all 73 game files against frozen dist/preview/BUILD-INFO, exact START-HERE/FEEDBACK templates and substitutions using explicit UTF-8 and the standard CRLF-to-LF transformation, frozen normalized bundler and exact adapter substitutions. exports.json records this. Independent .NET ZipArchive, compiled CRC32 and SHA256.HashData verifies every **75 preview / 76 Friends** member against inventories/material manifests in dotnet-archive-verification.json. ZIP_STORED sizes exceed earlier compressed kits.

No sending/public upload occurred. Preview's copied RESUME-CHECKPOINT is its earlier documentation snapshot; current PREVIEW-BUILD and this evidence supersede its latest-build status. Later documentation/evidence commits do not change frozen runtime bytes. Physical controllers, Steam Input, human usability/fun/balance/listening, WAN/second PC, minimum hardware, long soak and Steam acceptance remain open. Earlier native anomalies remain unresolved.

## Commands

Use bundled Node/Python under `C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies`, from the frozen checkout:

```text
node qa/results/beta15-desktop/build-python-extract.cjs
python qa/results/beta15-desktop/restore-generated.py f201acab3ee61a7bcb6900d206b4dc9715cf9b41
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta15-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/warning-priority-browser.cjs qa/results/beta15-packaged-warning
CK_QA_ROOT=<extracted ASAR> CK_QA_CAMPAIGN_ONLY=1 node qa/warning-priority-browser.cjs qa/results/beta15-packaged-warning-campaign
node qa/results/beta15-desktop/actual-warning-fixture4.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta15-desktop/export-preview-stored.py f201acab3ee61a7bcb6900d206b4dc9715cf9b41
python qa/results/beta15-desktop/export-friends-stored.py
python qa/results/beta15-desktop/verify-exports.py
pwsh -File qa/results/beta15-desktop/verify-dotnet.ps1
```

Unset local/network/campaign-only flags for the full default 11-check run. These commands describe evidence; do not overwrite or rerun its accepted artifacts. Earlier native helper commands are retained with their failed logs.
