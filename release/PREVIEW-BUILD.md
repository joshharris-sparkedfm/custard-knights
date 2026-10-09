# Private friends beta — 0.3.0-beta.4

Frozen runtime source `6eec04154419dbab0c3cc5f2a5a6936a60ce3f45` adds Simple / Normal / Insane arena chaos and the rare Oh Nae Nae/AK47 and McGinley lightning events. It includes the original native WAV song and retains beta.1–3 movement/spawn, Crossbow/Croissant and bounded guest-prediction corrections. Later QA/docs commits do not change the frozen runtime.

- Friends ZIP: `outputs/Custard-Knights-Friends-0.3.0-beta.4.zip`, 547104027 bytes, SHA256 `fe3f1450e377f36a003bd8843a61befec0a49cd8b401eb06c44f428cc4a13776`.
- Preview folder: `outputs/Custard-Knights-Windows-0.3.0-beta.4-preview`.
- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-beta.4-preview.zip`, 547102469 bytes, SHA256 `0c29594eed230981d29860d4b87e68525292a53557d15d9a29fa1acbe28dbb80`.
- ASAR SHA256: `1920f8077f0c15af57d36d346eba84ee6ef6c172838f546e233f3f51caad4a95`.

All 56 packaged entries match source/metadata; the kit carries 73 verified game files. The frozen ASAR passes 85 packaged chaos/native-WAV/isolation checks with zero exceptions/media errors. Both ZIP integrity checks and actual EXE save/restart/launcher/relocation passed. Source checks pass 21 chaos/preferences/weapons tests, 10 catalog/desktop tests, 83 actual-browser checks and 17 live same-network PeerJS checks. Hosted Battle core run37973139408 passed all six jobs, and Soundtrack portability run37973139390 passed both jobs, on the first attempt. Evidence: `qa/results/chaos-events/`, `qa/results/rare-network/third/`; read their README limits and preserved harness iterations.

Extract the complete Friends ZIP, close any older running copy normally, then launch `Game/Custard Knights.exe`. Share that ZIP, not just its EXE. The included start guide describes the new chaos options and rare-event rules, and FEEDBACK.html works offline. Existing older exports remain separate. No public upload or sending has been performed.

Rare events each have a 1% selection chance per eligible Normal/Insane arena round, with at most one selected; a busy or ending round may prevent its appearance. They are off in Simple, races, Story and Faction Front. Human fun/balance, music listening, real controllers, WAN, second PC and minimum hardware still need playtest evidence. This is a private test beta, not Steam or public-sale approval.

# Historical private friends beta — 0.3.0-beta.3

Frozen source `c75f9e0497ee64c0cb71768218caa6dbdd757a6a` adds bounded guest prediction to beta.2's expanded weapons and beta.1's host/solo movement/spawn fixes. A guest now stops predicting after 150 ms without a valid host update and keeps its displayed knight inside arena walls. Host combat state stays authoritative.

- Friends ZIP: `outputs/Custard-Knights-Friends-0.3.0-beta.3.zip`, 530999751 bytes, SHA256 `443881c93fbd4668f609c026496f115308832e82c7d8563dd883ff466576ff4c`.
- Preview folder: `outputs/Custard-Knights-Windows-0.3.0-beta.3-preview`.
- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-beta.3-preview.zip`, 531005073 bytes, SHA256 `498030ee732addc69a0dfb65d1044601d880bcd00318250819a78fb833de6e12`.
- ASAR SHA256: `24f78f700b8c28aec14bc49daa59f165ae1b94ba36cc5de0a64eb59e9c13077b`.

All 54 package entries match source. Both ZIP integrity checks and actual EXE save/restart/launcher/relocation passed; the friends kit contains 73 hashed game files. Source verification passed 962 guest containment/recovery cases, 25 live same-network PeerJS checks and 26 release regressions. All six hosted CI jobs passed run 37971620380. The audio fixture's initial fixed-wait failure and later bounded observations are retained honestly; no audio runtime fix is claimed. Evidence is under `qa/results/client-containment/`.

Extract the full friends ZIP, close any older game normally, then launch `Game/Custard Knights.exe`. The kit contains the start guide and offline feedback form. No upload/sending performed. Physical controllers, WAN, another PC, minimum hardware and human fun/balance acceptance remain open. Simple/Normal/Insane controls and the rare Oh Nae Nae/AK47 and McGinley events are not included yet.

# Historical private friends beta — 0.3.0-beta.2

Frozen source `944305e1f336e4dccb37700659ac89154047ff7e` adds Crossbow and Returning Croissant to beta.1's movement/spawn fixes. Later QA/docs commits do not change the runtime. All 54 packaged entries match source; actual EXE save/restart/launcher/relocation checks and both ZIP integrity checks pass. Six module tests, 30 browser weapon checks and all six hosted CI jobs passed (run 37970655784).

- Friends ZIP: `outputs/Custard-Knights-Friends-0.3.0-beta.2.zip`, 530998941 bytes, SHA256 `41f7200ac56f44fc2904dc6c4fa69d1472677b79f2b844aefab2dde16cc9dc95`.
- Preview folder: `outputs/Custard-Knights-Windows-0.3.0-beta.2-preview`.
- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-beta.2-preview.zip`, 531003850 bytes, SHA256 `b11a238327f1768e2709432932e400ced251602d77e037680c5ab8438e36f9ea`.
- ASAR SHA256: `c196508dc044a43b27123375678f66d4ca395140af368e76316a660c67f7d7a0`.
- Friends kit contains 73 hashed game files, guide and offline feedback form. No public upload or sending performed.

Known pending correction: during a long interruption in host snapshots, original-arena guests continue extrapolating and can drift off-screen until another packet arrives. This is separate from the corrected host/solo movement bug. Bounded guest prediction is the next task. Chaos presets, the requested Oh Nae Nae recording and rare AK47/lightning events are not yet included. Offline/couch testing is available now; physical-controller/WAN/human acceptance remains open.

# Historical private friends beta — 0.3.0-beta.1

Frozen runtime is merged source `9caeea061030c76bd0784a972459c9d3aa49fa9e` (PR #12). This fixes permanent off-screen dash/knockback escape and unsafe trapdoor respawns, Faction menu focus, and adds the installed version to the desktop window title. New weapons and rare chaos events are not included yet.

- Ready-to-run folder: `outputs/Custard-Knights-Windows-0.3.0-beta.1-preview`.
- Friends ZIP: `outputs/Custard-Knights-Friends-0.3.0-beta.1.zip`, 530996339 bytes, SHA256 `e8b79c0044ee1ee4651b4b923c2299a9e7236c35af2920bee8e38ec926fa53a4`.
- Preview ZIP: `outputs/Custard-Knights-Windows-0.3.0-beta.1-preview.zip`, 531000716 bytes, SHA256 `12a780b356fa85a934869e872df0ddf2c4b730199f2c24eaa2f8b6fd0ff3fb1a`.
- Application archive SHA256: `d2a90da4cdaebffc75c448cbc4138600068ff0ae67270aa90cf0a26793735cc1`.

All 53 packaged runtime/metadata entries match source; all 73 files are carried into the friends kit with hashes. Both ZIP integrity checks passed. Actual beta.1 EXE acceptance passed offline assets, version title, earned progress/settings/visors/preset and campaign save persistence, restart, single-instance launcher and relocation using isolated profiles. Source checks passed 408 boundary cases and 149 spawn/movement cases. Evidence: `qa/results/friends-beta-1/final-package/`, `qa/results/arena-boundary/final/`, `qa/results/arena-spawns/all-modes-final/`.

Friends extract the entire ZIP, then open `Game/Custard Knights.exe`. Close the older game normally first: versions share one running-game lock. The kit contains the start guide and offline feedback form. It has not been sent to anyone or uploaded as a public release. Physical controllers, WAN play and human balance/fun review remain unperformed. Alpha.6 and earlier exports remain preserved, but beta.1 contains the reported movement fix.

# Historical local playable preview — 0.3.0-alpha.6

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
