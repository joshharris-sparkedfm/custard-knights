# Local playable preview — 0.3.0-alpha.5

Exported 9 October 2026 from full source checkpoint `06e6c596c08e470202b75950231fc8b6ca24d75e`. The existing tested desktop build was frozen and copied without rebuilding. Later evidence/docs and ongoing Suno WAV work do not alter these exports; this checkpoint still includes 1/12 soundtrack tracks.

Ready-to-run folder:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.5-preview`

Open **Custard Knights.exe** inside it. Keep the whole folder together. Windows x64 is required. This unsigned preview is not a Steam release; minimum hardware, real controllers and WAN acceptance remain open.

- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-alpha.5-preview.zip`, 178901914 bytes; SHA256 `1d666c942ffa3280a81048863aaf0ee8f83c0458e2c3736f44f8d9019ecdbc20`.
- Application archive SHA256: `416e240626f1c803b7b789749fd63f7f9fa4558ac807cb78d8947b371d40a532`.
- Executable SHA256: `838928a6fcfe0da8f93adc2e1b8eb3f1e55ac31e808e9a757d35abe5bfed1edf`.
- All 42 packaged runtime/metadata entries matched source; ZIP integrity and exact copied runtime checks passed.
- Actual packaged faction connections at 8/40/100 slots, both visors, deltas and synthetic DOM movement passed. Save/restart, launcher reuse and relocation passed with isolated profiles.

The main menu contains arena play, **The Great Pudding War**, **Custard Cup**, Wardrobe and **Faction Front**. For offline faction play, choose mode and **Army size**, then **Play with bots**. F11 toggles fullscreen. Normal saves stay under `%APPDATA%/Custard Knights`.

Alpha.5 retains private host-issued accounts, SQLite ratings/history and human-only skill queues, and adds durable terminal-result staging/replay, reserved-slot reconnect, cumulative disconnect grace and rated forfeits. The UI offers manual reconnect and explains paused matches and forfeit results. Local verification passed 55 focused tests, 26 integrated recovery browser checks and six staged-result process checks. See [PRIVATE-LADDER.md](PRIVATE-LADDER.md) for setup and exact limits. No public server, Steam identity or public ranked season is included.

## Sharing with friends

Share the complete `outputs/Custard-Knights-Friends-0.3.0-alpha.5.zip`, not the EXE alone. It contains the same game under `Game/`, `START-HERE.txt`, offline `FEEDBACK.html` and `BUILD-INFO.json`. Friends extract the ZIP and open `Game/Custard Knights.exe`. Offline play needs no Steam account or developer tools; online faction play still needs a supplied server and private ladder play additionally needs a host-issued key.

- Friends ZIP: 178898283 bytes; SHA256 `cb379a632e0bf39450c3eee03b76dbaca82d0d75139e24a01f4aa8cb5f93704a`.
- All 73 game files match the frozen preview byte-for-byte.

Both ZIPs passed integrity checks; preview folder/ZIP, frozen dist and friends `Game/` match for all 73 game files. `BUILD-INFO.json` records the full source commit and verified archive hashes. The first friends-packaging attempt under PATH Python 3.11.15 exited with native `0xC0000005`; its partial file and failure record remain preserved. The bundled Python runtime completed the export and verification. The native failure is unresolved, not repaired by that successful export.

These ZIPs remain local, not GitHub release attachments. Older alpha.4/alpha.3/alpha.2/alpha.1/0.2.2 builds are preserved. Another machine can build from GitHub with `npm ci` then `npm run package:win`. See `qa/reviews/ranked-recovery-2026-10-09.md`, `qa/results/ranked-recovery/export.json` and RESUME-CHECKPOINT.md for verification and remaining gates.
