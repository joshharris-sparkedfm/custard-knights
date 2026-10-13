# Beta.12 frozen package evidence

Frozen source `be03b64f6ba3104bfcaa6b1154d4348cb2565fb5`, version0.3.0-beta.12. Runtime index SHA25607a3c1be07ab18f3fe1625ed5a3a06e15f24aad6e37210f8fb15c7132c246e8a. Locked dependencies copied from tested recovery checkout by nondeleting robocopy /E (exit1 success), no npm updates. Bundled Node24.19/Python, Electron44.7.0.

Final package62 exact source/metadata entries; standard isolated actual EXE save/restart/launcher/relocation passed first invocation. Marked profiles, normal close and separate-process restart, rewards/settings/outfit/campaign/offline assets and launcher reuse remain isolated from normal saves and user windows. Final extracted-ASAR independent couch23 and native device12 pass. All73 Friends Game files match frozen dist/preview/BUILD-INFO inventory; both ZIP CRC/SHA checks pass first export-verification invocation. Preview547155103bytes SHA256f6c54018fc22ddd3479afa49142f8d706ba9162339f391a0475f98d4e7d1b842; Friends547149989bytes SHA2565a47aff5138b8e03ef5253195e30fd93b5ade34e322cd24cfe6c6c5ed6bc071a. ASAR579c961f45bd09e04f7bae9af57937e4b0751568d8bdeb93c47303b3b187e257; EXE4a4fe584829d3483d53eb1c3e5c71ace8681c37cd04044794f5d783627de6b4f.

## Retained failures and exact workaround

First standard build failed in @electron-internal/extract-zip with Invalid checksum writing template electron.exe (build-run.log). Cached Electron44.7.0 ZIP CRC passes; its exe hash2529b494f4123f152bce346051f7bd855ef95006424a561953cf17c49a3d1ba8 matches copied deps and tested recovery deps. Reviewed evidence-only build-python-extract.cjs overrides Packager.prototype.extractElectronZip in memory, using bundled Python CRC/extraction and all73 template-entry byte comparisons. It calls unchanged scripts/package.cjs packageWindows/createStage and exact metadata/icon/ASAR configuration. No dependency/source patch. See extraction-diagnosis.json, python-template.json, packaging-workaround.json and build-adapter-run.log. The adapter's evidence trailing-newline correction changed JSON output only after the build; recorded final script/hash. This is a packaging workaround, not a native-fault fix.

First payload check failed after git restore generated files as CRLF although frozen blobs/staged payload were LF (package-crlf-restore-failure.log). Only named generated audio/vendor files were restored with exact git show bytes after confirming newline-only differences; final package62 equality passes. Runtime index never changed.

First extracted fixedwait run had18passes/5failures: first pad1 join missed, then four checks cascaded with3seats. Whole report/screenshots remain ../beta12-packaged-couch-first-fixedwait. Independent instrumented extracted single-case diagnostic sampled joins successfully; historical missed pulse remains untraced. Final observed-poll fixture waits for at least2 actual navigator polls per synthetic neutral/press/release within10seconds, logs sampled phases, and passes23 with stable hashes, no Runtime exceptions and actual same-host PeerJS. Canonical report is copied from ../couch-device-2026-10-13/final-extracted-observed, not another invocation.

Native initial fixed230ms helper failed first reverse-pad join; original helper/report/log remain first-native-fixedwait. Diagnose-native-join separately reproduced230ms pulses occurring between sparse native polls with no sampled press. Final hidden-window helper gates synthetic phases on at least3 observed navigator polls within10seconds and passes12 on its second full fixture invocation (69polls); inspector replaces acceptance.run in memory only, packaged ASAR unchanged. It uses native origin without CK/query hooks, synthetic navigator pads and programmatic DOM clicks. This is presentation/recovery evidence, not input timing, combat neutrality, responsiveness, physical pad/Steam Input or human acceptance. Extracted detailed logic checks are separate.

## Commands

Bundled runtimes from C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies; from frozen checkout:

```text
node scripts/package.cjs                         # retained native extraction failure
node qa/results/beta12-desktop/build-python-extract.cjs
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta12-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/couch-device-browser.cjs qa/results/couch-device-2026-10-13/final-extracted-observed
node qa/results/beta12-desktop/actual-device.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta12-desktop/export-preview.py be03b64f6ba3104bfcaa6b1154d4348cb2565fb5
python scripts/playtest-bundle.py <preview.zip> <friends.zip> --sha256 <preview SHA> --version 0.3.0-beta.12 --source-commit be03b64f6ba3104bfcaa6b1154d4348cb2565fb5 --asar-sha256 579c961f45bd09e04f7bae9af57937e4b0751568d8bdeb93c47303b3b187e257
python qa/results/beta12-desktop/verify-exports.py
```

All6 hosted CI jobs pass first attempt at exact frozen source in run38384519905 (ci-summary.json). Original previews/exports preserved; no sending/public upload or normal save/game access. Human/controller/WAN/second-PC/minimum-hardware/Steam/long-soak acceptance remains open; earlier native faults unresolved. An unrelated ComfyUI GPU job was present; no causal claim or performance/minimum-spec measurement follows from these bounded checks. The preview includes its earlier RESUME-CHECKPOINT documentation snapshot; current PREVIEW-BUILD/evidence supersedes its latest-build status.

Final independent package review cleared archive/content identity and acceptance evidence. The Python extraction adapter calls os.utime on each template file, assigning extraction-time timestamps rather than preserving ZIP mtimes. Verified identity is file paths, lengths, CRC and byte hashes; timestamps are not preserved. No timestamp-fidelity claim is made.
