# Beta.11 frozen package evidence

Frozen source `5c8549db9d5293005fe3b5bd83998a5e66ac32df`, version `0.3.0-beta.11`. Bundled Node v24.19.0/Python, Electron 44.7.0 and unchanged locked deps copied from onboarding (robocopy exit 1 success). No npm updates.

Final build, 62-entry exact source/payload metadata and standard actual EXE acceptance passed first final-freeze invocation. Acceptance uses marked isolated profiles, normal close/separate-process restart, rewards/settings/outfit/campaign/offline assets, launcher reuse and relocated installation. Normal saves and user game are untouched.

Native actual-recovery.cjs passed 13/13 first invocation. The main inspector replaces acceptance.run in memory only; ASAR stays unchanged. Native DOM/storage smoke covers Online invalid-code, pending/status/Cancel/focus, failed-admission Retry/new attempt, saved progress/setup, host arena Menu, Match menu controls, Resume, host Close room and reload. FakePeer injects admission faults only. This bounded native smoke does not prove real transport, simulation/input neutrality, responsiveness or human acceptance; detailed input/logic cases are separate extracted-ASAR Chrome QA.

Commands from frozen checkout use bundled Node/Python:

```text
node scripts/package.cjs
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node --input-type=module -e "import * as asar from '@electron/asar'; asar.extractAll('dist/Custard Knights-win32-x64/resources/app.asar','build/beta11-final-packaged-payload')"
CK_QA_ROOT=<extracted ASAR> node qa/online-recovery-browser.cjs qa/results/beta11-packaged-recovery
node qa/results/beta11-desktop/actual-recovery.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
python qa/results/beta11-desktop/export-preview.py 5c8549db9d5293005fe3b5bd83998a5e66ac32df
python scripts/playtest-bundle.py <preview.zip> <friends.zip> --sha256 <preview SHA> --version 0.3.0-beta.11 --source-commit 5c8549db9d5293005fe3b5bd83998a5e66ac32df --asar-sha256 <ASAR SHA>
python qa/results/beta11-desktop/verify-exports.py
```

Superseded e43c8f9 passed package62, standard EXE and narrower extracted36 before root visual review found compact CSS hid critical status. No exports at that freeze. Full dist retained under dist/Custard Knights-win32-x64-e43c8f9, extraction build/beta11-packaged-payload, logs/metadata first-freeze-e43c8f9 and browser beta11-packaged-recovery-first-freeze-e43c8f9. Final38 fixture strengthens rendered critical status at800x600/500.

Catalog/vendor normalized diff empty. Earlier exports preserved. No sending/public upload/Git changes by packaging. Human fun/usability/balance, physical controllers, WAN/second-PC, minimum hardware, Steam and long soak remain open. Earlier native-runtime anomalies are unresolved. Documentation preparation had one cp1252 Unicode arrow encoding error; rewriting with explicit UTF-8 corrected it before exports, no validation retry involved.

Root reports six hosted CI jobs pass in run38381138348 at e43c8f9. Final freeze only changes critical-note CSS. This covers unchanged JavaScript/tests, not CI at final5c8549. Root owns ci-summary.json.

Final extracted ASAR Chrome QA passes 38/38 first invocation with stable hashes and zero Runtime exceptions, including real bundled PeerJS same-host DataConnections and compact critical-status visibility. See ../beta11-packaged-recovery/README.md.

Final export verification passes first invocation: both ZIP CRC/SHA256 checks, all73 Friends Game files byte-identical to frozen dist/preview and BUILD-INFO inventory, stable ASAR/EXE hashes, exact extracted QA source hashes and native13 checks. Preview547150623 bytes SHA256 890f1924bb6252ab6a0f2bde9b5c720cfbf4a6fa65ed1fa03bbf6cf7fabdc2a2; Friends547146843 bytes SHA256 01af8ffdabe1d6b6f1e883bacba18aca58afd5c4ea69b3057de0fe9422571cd3.

verify-exports.py was tightened before its sole invocation to require measured62 package entries,38 extracted checks,13 native checks and actual same-host PeerJS coverage (rather than positive counts). This was preparation after counts were measured, not a failed validation correction. No final build/test/native/export failures.
