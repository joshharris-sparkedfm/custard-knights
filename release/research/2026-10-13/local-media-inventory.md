# Local media inventory — 13 October 2026

Read-only inventory by `/root/local_media_inventory`, gpt-6-luna/high, after the user provided `C:\Users\Joshua\Documents\LocalAI\Game-Agent-Asset-Prompt.txt`. No generation, asset copying or runtime integration occurred. ComfyUI had one unrelated SaturdayForever job running; no competing job was submitted.

## Located footage

- `outputs/Story-review/banquet-opening.webm` and `outputs/Story-review-source-capture/banquet-opening.webm`: identical SHA256 `bf36f39939bf4d563567a6641b4788383e3c8497402f736cb4e6dc016cab5aa4`, 6,592,471 bytes, VP9, silent, 1000x700, 24.276 seconds. The capture report identifies an actual in-game opening revision, captured from CKStoryScenes and captions. It is QA footage, not a recovered generated cinematic or a packaged movie.
- `art/review/factions-2026-10-09/Custard-Knights-Faction-Preview.mp4` and the output Faction-review copy: H.264/AAC, 1920x1080, 20 seconds, SHA256 `66c155d390fe70c50ef3a627b7affec5702fd5c2756f3d188f5b0d77a32416a2`. Capture notes describe scripted local play and bots before later difficulty edits, not humans or online acceptance.

The bounded search covered repository story/QA/release/art-review/media paths, output story/faction/store footage and expected LocalAI ComfyUI output folders. Five generic Wan/LTX videos lacked matching older prompt provenance in current history. No Custard-labelled generated video was found in that scope; other copies may exist elsewhere. Preserve and locate existing work before regenerating requested scenes.

## Style and one bounded future use

Maintain rounded knights and both visors, cream/yellow/deep-purple presentation. Existing story scene palette includes ink #291c31, gold #ffd46b, cream #fff2c9, rice blue #c3d6e3 and pink #eda0b4; the scene canvas is 1000x560. Custardia saucepan/bell armour/aprons and Rice bowl shields/stepped plates should retain readable role gear and distinct silhouettes.

Once the playable story finale and an approved widescreen game-rendered reference exist, one candidate is a five-second homecoming transition after the player diverts the siege bowl: familiar bakery, rescued cooks, visible consequence. This must not replace the player's action. `storyCard()` in `game/campaign-ui.js` provides the theatre/captions/skip/replay surface; any video integration needs captions, skip/replay, reduced-motion and unavailable-media fallback. The opening capture does not supply this later beat.

Use the provided `10 - LTX2.5 - 1080p Image to Video-api.json` only when the shared queue permits: tested 121 frames at24fps, batch1, refined/cropped1920x1080. Longer continuous clips remain untested. Establish a shot/style/performance specification, inspect a small sample, save workflow/prompt/seed/model/reference/output provenance, and verify the accepted asset in the actual scene. No asset has been accepted or integrated on the basis of this inventory.
