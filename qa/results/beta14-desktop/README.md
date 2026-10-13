# Beta.14 frozen package evidence

Frozen source `14a5527b0cf56592ce752e74c4937aaba0625bb4`, version 0.3.0-beta.14. This adds stable logical room slots and Cup departure/readiness rules. Package source/metadata verification passes all 63 entries. The frozen extracted-ASAR room harness passes its complete 23 checks with zero errors and stable source hashes on its first invocation; see [the report](../beta14-packaged-room/report.json). It uses actual Chrome/CDP keyboard/mouse, synthetic standard navigator pads and bounded observed-poll gates. Direct result completion, short Cup and injected network-state fixtures are labelled. Actual PeerJS cases run on the same host; they establish no WAN or physical-pad acceptance.

Actual EXE lifecycle write/read/launcher/relocated-install acceptance passes on its first invocation using fresh marked isolated profiles, normal close and separate processes. Normal saves and user windows remain untouched. Native-origin room smoke passes seven checks on its first invocation: four logical joins, middle Leave retaining survivor labels/colours/control prompts, vacant-slot rejoin, missing P3 reservation/start blocking, selected P3 recovery, and actual Cup entry. The smoke uses programmatic DOM clicks and synthetic navigator pads, with three observed polls per phase bounded to ten seconds. It uses no CK helpers/query hook. It does not establish physical/input-only operation, combat completion, native Cup-result readiness, real transport, Steam Input, responsiveness or human usability. Acceptance.run is replaced only in memory through the main inspector; the ASAR stays unchanged. See actual-room.cjs/json/run.log. All six hosted CI jobs pass first attempt at this freeze in [run 38391808897](https://github.com/joshharris-sparkedfm/custard-knights/actions/runs/38391808897).

## Packaging provenance

Locked dependencies were copied from the tested controls checkout without updates. Bundled Node 24.19/Python and Electron 44.7.0 were used. The known native extraction Invalid checksum failure was not retried. The reviewed corrected beta.13 Python extraction adapter was copied byte-identically: SHA256 `d00b38740e9344e8b10b1ae2d6c9fd28dacf5ff2ac2a5b49d8a0e1c898e2427f`. It already double-escapes the Python evidence newline; no inherited escaping failure occurred in this build. Standard packageWindows/createStage/icon/metadata/ASAR configuration is unchanged. Cached Electron ZIP SHA256/CRC and every extracted template file's content/hash are checked in python-template.json. Template timestamps are extraction time, not preserved ZIP mtimes. Packaging/build checks passed on their first invocations.

Generated vendor/audio assets were compared after CRLF normalization to exact frozen Git blobs, then restored to those exact bytes. All generated content was already identical. generated-restoration.json records this; no game/dependency patch occurred.

## Preserved export failure and recovery

The first DEFLATE preview export failed its ZIP CRC assertion. The log preview-export-run.log and `outputs/Custard-Knights-Windows-0.3.0-beta.14-preview.zip.partial` remain preserved, 547162447 bytes. The copied preview folder matches frozen dist. Raw inspection of the failed app.asar member decompressed 415067233 bytes versus 415067217 declared/source bytes; CRC and SHA256 differ. preview-crc-details.json/script/log record the diagnosis. This establishes an observed DEFLATE roundtrip corruption, not its writer/reader/hardware root cause or a runtime defect.

A separately reviewed ZIP_STORED export bypasses compression/decompression using a distinct .zip.stored.partial and refuses overwrite. It reuses the verified copied folder, verifies all 75 members' CRC/hash/content and renames only after success. The failed DEFLATE partial stays untouched. Friends export similarly executes the frozen standard bundler in memory with exactly two asserted substitutions: ZIP_DEFLATED/compresslevel=4 becomes ZIP_STORED, and failed-partial cleanup becomes a no-op so evidence would survive failure. Standard rendering, inventory, path/version/commit/checksum validation remain intact. The frozen script bytes are unchanged; friends-adapter.json records original/in-memory hashes and exact substitutions. No Friends export failure occurred.

## Verified local exports

- Preview: 800700407 bytes, SHA256 `47d7c2dae927da8fb5d588994d2dcdaf97996a9e9d18a1a98ee37305d43275e1`.
- Friends: 800688106 bytes, SHA256 `bf539090dd7a2b17d6afebda7409d414310fcf9b8c5fe73ce64bebf6ce18351a`.
- ASAR: `97703de7fe1daf699183fcfd86ed5fe9f83b3a8ae9f9944e056d690066eb5593`.
- EXE: `53783b2fe8a30c05a15d5d17bfeb33446d421471236b2cc8b90556bf50f26fff`.

Both final ZIPs use ZIP_STORED and are larger than earlier compressed kits. verify-exports.py passes on its first invocation: ZIP CRC/hash, all 73 game files against dist/preview/BUILD-INFO, exact START-HERE/FEEDBACK metadata/materials against frozen templates after the standard bundler's UTF-8/CRLF-to-LF transformation, frozen normalized bundler/source and exact adapter substitutions. exports.json is the final record. Independent .NET ZipArchive reading, separately compiled CRC32 and SHA256.HashData verifies all 75 preview and 76 Friends members against manifests in dotnet-archive-verification.json. No public upload or sending occurred. Older outputs and the failed artifact remain preserved.

Preview's RESUME-CHECKPOINT contains the earlier documentation snapshot copied at export. Current PREVIEW-BUILD and this evidence supersede its latest-build status. Later docs/evidence commits do not change frozen runtime bytes. Physical controllers, Steam Input, human couch/usability/fun/balance, WAN/second PC, minimum hardware, long soak and Steam acceptance remain open; earlier native anomalies remain unresolved.

## Commands

From the frozen checkout, use bundled Node/Python under `C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies`:

```text
node qa/results/beta14-desktop/build-python-extract.cjs
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta14-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/room-continuity-browser.cjs qa/results/beta14-packaged-room
node qa/results/beta14-desktop/actual-room.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta14-desktop/restore-generated.py
python qa/results/beta14-desktop/export-preview.py 14a5527b0cf56592ce752e74c4937aaba0625bb4  # preserved failed attempt
python qa/results/beta14-desktop/export-preview-stored.py
python qa/results/beta14-desktop/export-friends-stored.py
python qa/results/beta14-desktop/verify-exports.py
pwsh -File qa/results/beta14-desktop/verify-dotnet.ps1
```

Keep CK_QA_FOCUSED unset for the complete 23-check packaged harness. Helpers refuse existing export destinations; these commands describe evidence, not permission to overwrite/repeat frozen outputs.
