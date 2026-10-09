# Local playable preview — 0.3.0-alpha.1

Exported 9 October 2026 from merged commit `cb6882ded98e4560b9ed2af7d24f4034970f87a1`.

On Joshua's current machine, the ready-to-run folder is:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.1-preview`

Open **Custard Knights.exe** inside it. The neighbouring ZIP has the same folder name plus `.zip`; extract the whole archive on another Windows x64 computer before opening the executable. This is an unsigned development preview. It has not been cleared for Steam or public 100-person play.

- ZIP size: 178,890,587 bytes.
- ZIP SHA256: `9d2b4ddb9662ecac0a569ecf719a91fbf7413accd88897bf07e6832efb5f668b`.
- Application archive SHA256: `2bb59b91fd2639fd157e7e0a629ebe3dcec60de8a2e2812afedebae092e900d8`.
- 41 package entries checked against current source or generated metadata; copied runtime files verified byte-for-byte; ZIP integrity passed.
- Desktop offline smoke passed sprites/fonts, match completion and progress persistence after page reload.

Choose **Faction Front → Bot practice** for immediate faction play. The story is **The Great Pudding War**. Arena, Cup and wardrobe remain available. F11 toggles fullscreen. Online faction rooms need a separate running server; no public endpoint is bundled. Saves live under `%APPDATA%/Custard Knights`.

Known blockers and exact coverage are in RESUME-CHECKPOINT.md. The previous validated 0.2.2 ZIP remains separate and unchanged. This ZIP is local, not a GitHub release attachment. Another machine can build the repository using `npm ci` then `npm run package:win`.
