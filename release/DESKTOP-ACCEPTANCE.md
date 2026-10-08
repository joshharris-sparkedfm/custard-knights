# Windows desktop acceptance — 0.2.1

Completed 8 October 2026 against the expanded, branded Windows x64 package. This evidence covers the local desktop candidate, not a Steam-installed release or another computer.

The package includes 34 application runtime files. `tests/desktop-package.cjs` verified each packaged file matches the current source, including campaign, Cup, collection, preferences, sprites, audio manifest and desktop shell. Developer/scratch files and development package metadata are excluded. The exact per-file hashes, archive hash and executable hash are recorded in `build/desktop-evidence.json` and copied to the outputs QA evidence folder.

Application archive SHA256: `746c4411928c4f304d249c4ab3d9a0a674603573de625dd988a180406991f29b`.

Combined runtime source SHA256: `829cab30bb9c06969570744380021353d3417ba53c3d132955c1255016dc8f1c`.

## Passed checks

- Seven desktop/build unit checks: runtime asset confinement; controlled missing-file errors; isolated acceptance profile validation; future game-module/license inclusion; scratch exclusion and staging cleanup; invalid Steam IDs/incomplete build rejection; versioned preview-only VDF generation.
- Packaged offline smoke: local sprites/fonts/PeerJS client loaded, renderer Node access absent, a match completed, earned progress survived page reload with external HTTP/WebSocket requests blocked.
- Four independent acceptance processes plus a duplicate child launch: fresh profile creation; ordinary window close; process restart; same-profile launcher reuse; relocated complete installation retaining the same profile. Tests created marked temporary profiles and removed them after their processes exited. Normal player saves were not used.
- Saved state survived both process restart and installation relocation: earned legacy coins/unlocks and receipts; Checker cape equipped on player two; first-result Burnt Toast choice owned and equipped on player one; pinned Golden Whisk with partial progress; outfit preset; real first campaign encounter completion with three spoons and next-node unlock; campaign assistance; music/SFX/shake/flashing settings and match setup.
- Campaign completion used the actual simulation, accepted damage and pantry objective, with scripted positioning/damage as QA setup. It did not directly assign completed save data. This acceptance verifies persistence rather than campaign balance or human difficulty.
- Expanded campaign, Cup and collection scripts fetched successfully offline. Shell internals, package metadata and foreign custom-protocol hosts were inaccessible to the renderer. F11 entered/exited fullscreen; auto-repeat did not flip it repeatedly.
- Packaged live PeerJS smoke: two isolated desktop sessions connected, completed three rounds, delivered guest challenge rewards and recovered to the menu when the host left. Same machine/network only.
- Windows file metadata verified: Sparked FM Ltd, Custard Knights, version 0.2.1, `Copyright © 2026 Sparked FM Ltd`. The generated multiresolution branded icon is applied to the executable; the window uses the matching PNG.
- Six focused journey checks passed against the packaged renderer in a sandboxed Electron window with a temporary profile and external network blocked. A standard gamepad was simulated through `navigator.getGamepads`: A toggles reduced flashing; left/right adjusts the focused screen-shake range; saving an outfit preserves focus and wardrobe scroll position; joining and starting a couch match works; Cup ready preserves focus. The 800×600 outer window (784×561 client area on this PC) has no horizontal menu overflow. Screenshots cover both 1280×800 and 800×600 menus, wardrobe/rewards, campaign results and Cup results. This does not establish physical-controller compatibility.

## Release fixes

The shell now creates the user-data directory before setting it, preventing a missing-directory startup failure on a fresh installation. Ordinary launches take a single-instance lock and focus the primary window, avoiding two active windows sharing one save database. Window close explicitly flushes DOM storage. The custom protocol serves only runtime assets, rejects foreign hosts, Windows path/stream forms and symlink escapes, and returns controlled missing-file responses. Navigation redirects and new windows are denied; renderer sandbox, context isolation and disabled Node integration remain enabled.

Packaging stages an explicit desktop file list and filtered runtime asset directories, includes third-party notices/fonts, excludes scratch/developer files and removes its stage after success or failure. Steam configuration validates IDs, checks the complete package and derives its candidate description from the current version. Generation remains local and preview-only; no upload, login or branch activation occurs.

The 0.2.1 journey review caught controller settings that only accepted mouse/keyboard, wardrobe actions losing focus after rebuilding their controls, and horizontal overflow at the minimum desktop window size. Targeted source fixes were rechecked in the packaged renderer. The earlier 0.2.0 evidence and screenshots remain separately named in the outputs folder.

## Reproduce

```text
node --test tests/desktop.test.cjs
npm run package:win
node tests/desktop-package.cjs
node tests/desktop-acceptance.cjs "dist/Custard Knights-win32-x64/Custard Knights.exe"
node tests/desktop-journey.cjs --assert-ux
"dist/Custard Knights-win32-x64/Custard Knights.exe" --smoke-test
"dist/Custard Knights-win32-x64/Custard Knights.exe" --online-smoke
```

The smoke processes emit `DESKTOP_SMOKE_PASS` / `ONLINE_SMOKE_PASS` and an exit code; automation should wait for the process, since PowerShell can return immediately from a GUI executable launch.

Steam installation/update/uninstall through the client, a second PC, physical controllers/Steam Input, difficult NAT conditions, minimum system requirements and Steam review remain separate platform/hardware checks. The package is unsigned. Crash/power-loss recovery is not claimed by the normal-close acceptance.
