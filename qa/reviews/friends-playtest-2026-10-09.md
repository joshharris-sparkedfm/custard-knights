# Friends playtest distribution — 9 October 2026

The user asked to keep finishing the game and make it possible to give a copy to friends. This pass adds a shareable kit around the frozen alpha.3 Windows preview. No game runtime, rules, saves or server configuration changed. It does not close sales, hosting or human/device acceptance gates.

## Artifact

- Local ZIP: `outputs/Custard-Knights-Friends-0.3.0-alpha.3.zip` (relative to the workspace, outside this repository).
- Size: 178,893,829 bytes.
- SHA256: `a161b968bf26917b679e45b62ad4cca5790569497de680feb03cf3377031b43d`.
- Frozen source ZIP: `ea709da91813a11e0f5beea162d6c17b111aa5afea28f836f97c2802a42d3b23`.
- Export source commit: `3a46a2903045d6f2dfe71e08e40a028e3e63e17e`.
- Application archive: `94f7e327bb682904212c30b0edc795c2342410711160cba4037bf6d95cb21ca0`.

The ZIP contains `Game/`, `START-HERE.txt`, `FEEDBACK.html` and `BUILD-INFO.json`. It excludes the old developer handover README/checkpoint. Nothing is uploaded, published or sent to friends automatically. The previous standalone preview and ZIP remain intact. Another machine can regenerate a kit with the committed Python standard-library script and its own verified packaged preview; this ZIP is not a GitHub release attachment.

## Verification

Independent archive comparison verified all 73 game files byte-for-byte against the frozen original. ZIP integrity passed and the manifest accounts for every entry. Six negative packaging cases rejected bad source/runtime hashes, existing output replacement, traversal, case-insensitive duplicates and multiple roots; source inputs and existing outputs were preserved, and partial outputs were cleaned up.

Headless Chrome exercised the actual extracted feedback page: 11 checks passed, including real JSON download, exact build identity, literal Unicode/markup, multiple modes, matching copy text, invalid duration validation, blank optional survey, blocked-download fallback, narrow layout, no HTTP requests and no browser exceptions. Evidence: `qa/results/friends-playtest/`. Synthetic survey data only is retained. This does not represent a human gameplay session or physical device test.

No unchanged runtime suites or load soaks were repeated. Existing alpha.3 packaged evidence applies because runtime bytes are identical. Existing native crashes, hosting/ranking gaps, WAN/controller/minimum-hardware/Steam checks, music exports and support contact remain open. The kit states those limitations and gives an immediate offline path, separate from optional original-arena online testing and the unhosted faction service.

## Next

Continue concrete release work when hosting details, external acceptance results or a reproducible defect become available. Collect first-time reactions without coaching and prioritise crashes, lost saves, broken objectives and control/clarity problems before launch. The proposed purchase-price question is optional research, not a public price or store submission.

Independent source review caught and corrected the faction menu route and its distinct controller bindings. It also found that repeated feedback QA could select a previous download; the harness now filters existing files, and a repeat into the same output directory passed all 11 checks. The earlier local kit named Friends-Playtest is superseded by the Friends ZIP identified above; it was never shared.
