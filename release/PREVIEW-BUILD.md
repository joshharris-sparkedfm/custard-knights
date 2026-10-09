# Local playable preview — 0.3.0-alpha.3

Exported 9 October 2026 from commit `3a46a2903045d6f2dfe71e08e40a028e3e63e17e` (runtime changes at `ddbac8b`). Subsequent deployment/evidence documentation does not change the packaged runtime.

On Joshua's current machine, the ready-to-run folder is:
`C:\Users\Joshua\Documents\Codex\2026-10-08\rea\outputs\Custard-Knights-Windows-0.3.0-alpha.3-preview`

Open **Custard Knights.exe** inside it. The neighbouring ZIP has the same folder name plus `.zip`; extract the whole archive on another Windows x64 computer before opening the executable. This is an unsigned development preview. It has not been cleared for Steam or public 100-person play.

- ZIP size: 178,895,577 bytes.
- ZIP SHA256: `ea709da91813a11e0f5beea162d6c17b111aa5afea28f836f97c2802a42d3b23`.
- Application archive SHA256: `94f7e327bb682904212c30b0edc795c2342410711160cba4037bf6d95cb21ca0`.
- 42 package entries checked against source/generated metadata; copied runtime files verified byte-for-byte; ZIP integrity passed.
- Actual packaged faction connections passed for brawl/CTF/siege at 8/40/100 participants and both visors, with synthetic DOM movement. Save/restart/relocation and the packaged desktop journey passed.

Choose **Faction Front → Bot practice** for immediate faction play. The story is **The Great Pudding War**. Arena, Cup and wardrobe remain available. F11 toggles fullscreen. Online faction rooms need a separate running server; no public endpoint is bundled. Saves live under `%APPDATA%/Custard Knights`.

Alpha.3 fixes controller pause-menu navigation and the desktop faction Origin rejection, and adds a measured lossless decoder copy optimization. The new real-browser load sample measured 59.93 FPS and 20.04 received updates/sec on this host; this is not WAN or minimum-hardware acceptance. See `qa/reviews/sales-readiness-2026-10-09.md`. Both hosted full suites passed 121 tests. Earlier native crashes and large-battle timing/bandwidth acceptance remain unresolved. Alpha.2's sprite composition cache is retained.

Known blockers and exact coverage are in RESUME-CHECKPOINT.md. Previous 0.2.2, alpha.1 and alpha.2 ZIPs remain separate and unchanged. This ZIP is local, not a GitHub release attachment. Another machine can build the repository using `npm ci` then `npm run package:win`.
