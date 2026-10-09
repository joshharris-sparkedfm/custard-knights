# Local playable preview — 0.3.0-alpha.2

Exported 9 October 2026 from runtime commit `ff6d3b913533a31d52b842ab5ad0e2ad68f32023`. Subsequent checkpoint documentation does not change the packaged runtime.

On Joshua's current machine, the ready-to-run folder is:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.2-preview`

Open **Custard Knights.exe** inside it. The neighbouring ZIP has the same folder name plus `.zip`; extract the whole archive on another Windows x64 computer before opening the executable. This is an unsigned development preview. It has not been cleared for Steam or public 100-person play.

- ZIP size: 178,892,271 bytes.
- ZIP SHA256: `d827b1f89f1402925fe74f47d0eb8d1dee48d143711a1bc8eef6aa0005e21c34`.
- Application archive SHA256: `e5d861f9b2c822bb3a7f0fdfccf9ba526900180aa6faf4b273ad7dfd755ce9b7`.
- 41 package entries checked against current source or generated metadata; copied runtime files verified byte-for-byte; ZIP integrity passed.
- Desktop offline smoke passed sprites/fonts, match completion and progress persistence after page reload.

Choose **Faction Front → Bot practice** for immediate faction play. The story is **The Great Pudding War**. Arena, Cup and wardrobe remain available. F11 toggles fullscreen. Online faction rooms need a separate running server; no public endpoint is bundled. Saves live under `%APPDATA%/Custard Knights`.

Alpha.2 adds the bounded faction sprite composition cache: a controlled short 100-combatant sample improved from 53.61 to 60.09 FPS on this QA host. Exact software-canvas appearance checks and 34 browser interface/online checks passed; see `qa/reviews/faction-render-cache-2026-10-09.md` for coverage and GPU rounding limitations. Native Node crashes and network load-rate limits remain unresolved.

Known blockers and exact coverage are in RESUME-CHECKPOINT.md. The previous validated 0.2.2 and alpha.1 ZIPs remain separate and unchanged. This ZIP is local, not a GitHub release attachment. Another machine can build the repository using `npm ci` then `npm run package:win`.
