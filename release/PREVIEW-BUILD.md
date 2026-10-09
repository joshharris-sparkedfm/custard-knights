# Local playable preview — 0.3.0-alpha.4

Exported 9 October 2026 from commit `9e8ac15e23f3ab11c137d7b38f78b0e74ca65d6e`. Later evidence/docs changes do not alter the packaged runtime.

Ready-to-run folder:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.4-preview`

Open **Custard Knights.exe** inside it. Keep the whole folder together. Windows x64 is required. This unsigned preview is not a Steam release; minimum hardware, real controllers and WAN acceptance remain open.

- Preview ZIP: 178900232 bytes; SHA256 `437a1de62952a5f69b5397c31cb3cf3c26dafa8769c4e7cbf27ed3bbc1a3d7ee`.
- Application archive: `ceaacd1e6c0f1ea2e8795323742cb2c132e94a9484d4a722ad8b9cb7790801a4`.
- All 42 packaged runtime/metadata entries matched source; ZIP integrity and exact copied runtime checks passed.
- Actual packaged faction connections at 8/40/100 slots, both visors, deltas and synthetic DOM movement passed. Save/restart, launcher reuse and relocation passed with isolated profiles.

The main menu contains arena play, **The Great Pudding War**, **Custard Cup**, Wardrobe and **Faction Front**. For offline faction play, choose mode and **Army size**, then **Play with bots**. F11 toggles fullscreen. Normal saves stay under `%APPDATA%/Custard Knights`.

Alpha.4 adds private host-issued player accounts, SQLite-backed ratings/history and full-human skill queues, with in-game rating/leaderboard feedback. Authenticated casual battles use stored skill for team/bot balancing without awarding ranked points. Blank casual matchmaking selects a compatible room or creates a new one rather than getting stuck on a full/finished default room. See [PRIVATE-LADDER.md](PRIVATE-LADDER.md) for setup and exact limits. No public server, Steam identity or public ranked season is included.

## Sharing with friends

Share the complete `outputs/Custard-Knights-Friends-0.3.0-alpha.4.zip`, not the EXE alone. It contains the same game under `Game/`, `START-HERE.txt`, offline `FEEDBACK.html` and `BUILD-INFO.json`. Friends extract the ZIP and open `Game/Custard Knights.exe`. Offline play needs no Steam account or developer tools; online faction play still needs a supplied server and private ladder play additionally needs a host-issued key.

- Friends ZIP: 178897085 bytes; SHA256 `b4ffb21b8b3424e42c7c6431df3482e05be277a086b2334d98415f263c9984b0`.
- All 73 game files match the frozen preview byte-for-byte.

These ZIPs remain local, not GitHub release attachments. Older alpha.3/alpha.2/alpha.1/0.2.2 builds are preserved. Another machine can build from GitHub with `npm ci` then `npm run package:win`. See `qa/reviews/private-ladder-2026-10-09.md` and RESUME-CHECKPOINT.md for verification and remaining gates.
