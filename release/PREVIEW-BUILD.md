# Local playable preview — 0.3.0-alpha.6

Exported 9 October 2026 from full source checkpoint `d15c4b66f66b489241343f9c4e282f4e58b46868`. The tested alpha.6 desktop build was frozen before export. All 12 soundtrack slots are enabled: 11 new WAV recordings and the retained original menu MP3. Later evidence/docs changes do not alter these exports.

Ready-to-run folder:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.6-preview`

Open **Custard Knights.exe** inside it. Keep the whole folder together. Windows x64 is required. This unsigned preview is not a Steam release; minimum hardware, real controllers and WAN acceptance remain open.

- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-alpha.6-preview.zip`, 530999088 bytes; SHA256 `5f1dc520c54aeb01d35121973973066881bef67438349c92581faf1cf43153cd`.
- Application archive SHA256: `d23dacaf2ebe5464a83a67ba7e50aa5e03211209199524978ad9ef996253cf45`.
- Executable SHA256: `5172149dedd8d597546f984fad5dcd69858dae1a721cde148de888a426ec3c04`.
- All 53 packaged runtime/metadata entries matched source; ZIP integrity and exact copied runtime checks passed.
- Packaged media passed 85 checks using the frozen ASAR and its real desktop asset handler: 12 native playback cues, 11 WAV decodes, mute, volume, scene routing and one music instance, with zero media errors/browser exceptions.
- Actual alpha.6 EXE save/restart, launcher reuse, relocated-install persistence, fullscreen and offline assets passed using isolated profiles. Earlier alpha.5 ranked/network checks remain applicable to unchanged game logic; they were not repeated for this soundtrack update.

The main menu contains arena play, **The Great Pudding War**, **Custard Cup**, Wardrobe and **Faction Front**. For offline faction play, choose mode and **Army size**, then **Play with bots**. F11 toggles fullscreen. Normal saves stay under `%APPDATA%/Custard Knights`.

Alpha.6 adds the remaining 11 soundtrack recordings as native WAV files. It retains alpha.5 private host-issued accounts, SQLite ratings/history, human-only skill queues, durable terminal-result staging/replay, reserved-slot reconnect, cumulative disconnect grace and rated forfeits. See [PRIVATE-LADDER.md](PRIVATE-LADDER.md) for exact online limits. No public server, Steam identity or public ranked season is included. Functional audio checks do not establish musical quality, seamless looping or listening acceptance; those require review of the recordings.

## Sharing with friends

Share the complete `outputs/Custard-Knights-Friends-0.3.0-alpha.6.zip`, not the EXE alone. It contains the same game under `Game/`, `START-HERE.txt`, offline `FEEDBACK.html` and `BUILD-INFO.json`. Friends extract the ZIP and open `Game/Custard Knights.exe`. Offline play needs no Steam account or developer tools; online faction play still needs a supplied server and private ladder play additionally needs a host-issued key.

- Friends ZIP: 530994978 bytes; SHA256 `18dd31367b193134e9525c70467f84f61bde07cd8c42877b2f9d1d0dea1371cb`.
- All 73 game files match the frozen preview byte-for-byte.

Both ZIPs passed integrity checks; preview folder/ZIP, frozen dist and friends `Game/` match for all 73 game files. The 11 WAVs are inside `resources/app.asar`, so the outer game-file count remains 73. `BUILD-INFO.json` records the full source commit and verified archive hashes. Bundled Python was used for both alpha.6 exports. The separate alpha.5 PATH-Python native failure and partial file remain preserved in that checkpoint's evidence; this pass makes no claim to repair it.

These ZIPs remain local, not GitHub release attachments. Older alpha.5/alpha.4/alpha.3/alpha.2/alpha.1/0.2.2 builds are preserved. Another machine can build from GitHub with `npm ci` then `npm run package:win`. See `qa/results/wav-soundtrack/README.md`, `qa/results/wav-soundtrack/export.json` and RESUME-CHECKPOINT.md for verification and remaining gates.
