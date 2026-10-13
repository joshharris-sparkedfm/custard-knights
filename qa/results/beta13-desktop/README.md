# Beta.13 frozen package evidence

Frozen source `dd4906bcae1266355a11e50072bdccaff930f6f8`, version 0.3.0-beta.13. Index SHA256 `e8d08e7589c9222d5753f8f57b5f1b8424807d2827b46bff3f1745b9b7d58b6f`; controls module SHA256 `a65a941fbe3614ab467207d8b216eecdffa77668d1f1bb171f4ad4a6c2405b40`. Locked dependencies copied from the tested couch checkout with nondeleting robocopy /E (exit 1 success), no npm update. Bundled Node 24.19 and Python; Electron 44.7.0.

The package has 63 exact source/metadata entries, including game/controls.js. Standard isolated actual EXE write/read/launcher/relocation passes on its first invocation. Fresh marked profiles, normal close, separate processes, saved rewards/settings/outfit/campaign, offline assets, fullscreen and launcher reuse are isolated from normal saves/user windows.

The final extracted-ASAR controls harness passes 33/33 checks, zero errors, stable source hashes on its first invocation. Report: [beta13-packaged-controls](../beta13-packaged-controls/report.json). This uses real Chrome/CDP keyboard/mouse with synthetic standard navigator pads and observed-poll gates. Direct routing and malformed-storage fixtures are labelled; online guest coverage is a routing fixture, not live transport. This establishes no physical controller, Steam Input, human play or native combat acceptance.

Actual packaged native-origin controls smoke passes 9/9 on its first invocation, using programmatic DOM clicks/select changes, local storage and native reload, with no CK helpers/query hook. The synthetic navigator pad's initial readiness gate observes three real polls within 10 seconds. It tests editor entry, Cancel, conflict blocking, Solo/Player 1 Apply, updated help, reset-Cancel and reload persistence. It does not inject gameplay button pulses or claim native combat timing, responsiveness, physical input, second-process remap persistence or human usability. Standard lifecycle restart acceptance is separate. Acceptance.run is replaced in memory through the main inspector; ASAR stays unchanged. See actual-controls.cjs/json/run.log.

All six hosted CI jobs pass on the first attempt at this exact frozen source in run [38388857005](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/38388857005); ci-summary.json records jobs.

## Retained helper failure and extraction provenance

The known unchanged native extractor Invalid checksum failure from beta.12 was not retried. The evidence-only beta.12 Python extraction adapter was copied directly. Its first beta.13 attempt failed because its JavaScript template interpreted the Python evidence JSON trailing `\n` as a literal newline in a quoted Python string; build-adapter-first-failure.log is preserved. The helper now double-escapes that newline. Only evidence serialization changed. Successful build-adapter-run.log, packaging-workaround.json and python-template.json record adapter provenance/hash, cached ZIP SHA256/CRC and every template file byte comparison. Standard packageWindows/createStage/icon/metadata/ASAR configuration is unchanged; no dependency or game patch. Template timestamps use extraction time, not preserved ZIP mtimes. Verified identity is paths/lengths/CRC/hashes/content.

Generated audio/vendor assets were compared to exact frozen Git blobs after newline normalization, then written as exact blob bytes; all were already identical. generated-restoration.json records each result. No CRLF package mismatch invocation or runtime restoration failure occurred in beta.13.

## Local exports

Preview: 547160415 bytes, SHA256 `7d1753cc9906df916dd767a699a59318d9c9d564c9d0922a6c5c4140cc3184d3`.
Friends: 547153491 bytes, SHA256 `344c9698f79eeafbc9fe4e501e4a793e79e00d6d2b54a7e46e6444520122fe1f`.
ASAR: `5cc759db8a29a1d415bf4785e5991b55538e56682ec76e85b67613ca66d5bcfd`.
EXE: `ea1e85a9caa682b4ab93e7b09b8cb609edeb7ebf1eff8f22023b5c44b9861bdf`.

The first export-verifier invocation passed CRC/hash/game-file checks, then failed its new START-HERE comparator because read_text() used the Windows default encoding against UTF-8 archive text. verification-first-failure.log is retained. The comparator now explicitly reads both material templates as UTF-8. The added raw frozen-Git template comparison then failed on checkout CRLF versus Git LF; verification-raw-template-failure.log is also preserved. That check now applies exactly the standard bundler's UTF-8 decoding and CRLF-to-LF text transformation before comparing frozen source templates, then checks the complete substituted ZIP materials byte-for-byte. No archive/runtime/source change was needed. The final verification checks both ZIP CRC/hash and all 73 Friends game files against frozen dist, preview and BUILD-INFO inventory. START-HERE and FEEDBACK metadata/materials are checked exactly against frozen templates after the standard bundler's explicit UTF-8/newline transformation and metadata substitutions. friends-materials-verification.json records that transformation and final material hashes. exports.json is the final verification record. Preview's RESUME-CHECKPOINT is the earlier documentation snapshot copied during export; this evidence and current PREVIEW-BUILD supersede its latest-build status. Later documentation/evidence commits do not change frozen runtime bytes. Older exports and every failed attempt remain preserved. No sending/public upload occurred.

## Commands

Use bundled Node/Python at C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies (Node binary: node/bin/node.exe). From the frozen checkout:

```text
node qa/results/beta13-desktop/build-python-extract.cjs
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta13-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/controls-remap-browser.cjs qa/results/beta13-packaged-controls
node qa/results/beta13-desktop/actual-controls.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta13-desktop/export-preview.py dd4906bcae1266355a11e50072bdccaff930f6f8
python scripts/playtest-bundle.py <preview.zip> <friends.zip> --sha256 <preview SHA> --version 0.3.0-beta.13 --source-commit dd4906bcae1266355a11e50072bdccaff930f6f8 --asar-sha256 5cc759db8a29a1d415bf4785e5991b55538e56682ec76e85b67613ca66d5bcfd
python qa/results/beta13-desktop/verify-exports.py
```

Physical controllers, Steam Input, human couch/usability/fun/balance, WAN/second PC, minimum hardware, long soak and Steam acceptance remain open. Earlier native anomalies remain unresolved. This is bounded private-beta evidence, not completion of the full-experience milestone.
