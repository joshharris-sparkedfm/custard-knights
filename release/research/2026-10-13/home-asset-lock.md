# FE-02 home reference and asset lock

13 October 2026 · Bounded existing-asset inventory for the four-route home implementation

This is a reuse brief grounded in the checked-in research and asset records. It does not grant new asset generation, make a human usability/quality approval claim, or change runtime assets. The owner’s selected rounded knight direction and closed/open visor choice are recorded in the source notes below; remaining visual acceptance belongs to implementation review.

## Home composition to implement

Use one illustrated bakery/castle scene with one large, rounded Custard Knights hero as the clear focal point. Keep the route labels and controller prompts high contrast and readable over the scene. The four primary routes are **Quick Brawl**, **Story: The Great Pudding War**, **Play with Friends**, and **Faction Front**. Put Wardrobe, Options, How to Play and Quit in a consistent utility strip. Cup is reached through the social/arena format picker; it remains available to a solo player. Quick Brawl keeps custom setup behind Customize.

Use a warm **cream, custard yellow and deep purple** foundation. Yellow marks the selected route and primary action; it should not fill every surface. Purple supplies outlines, text contrast and structure; cream gives panels breathing room. Preserve the rounded pot-helmet silhouette, both visor states, broad shapes and dark-plum outline. Give the hero meaningful screen area and keep route names, focus state, player prompts and the utility actions readable at TV distance. Keep the main routes in a stable layout rather than a carousel. Any ambient animation should be quiet and removable for reduced motion.

The existing castle image is an environment/style reference rather than a finished hero composition: it is blue/green-dominant and contains no knight. The strongest reuse path is the current game-rendered hero/knight art over or alongside a restrained castle scene, with cream/purple/yellow UI surfaces. If the castle art is adapted, keep the focal knight and controls visually dominant. Avoid using generated store art as a gameplay screenshot or letting its more polished promo rendering imply accepted in-game fidelity.

## Local assets and provenance

| Existing item | Path | Recorded status and use |
|---|---|---|
| Procedural home castle scene | `art/keyart/home.webp` | Existing illustrated environment/palette reference; source prompts identify it as procedural castle artwork. It is not the four-route home composition and has no hero knight. |
| Runtime hero atlases | `sprites/hero.js`, `sprites/hero-open.js` | Actual game-rendered hero preview families, closed and open visor. Use the game's runtime renderer/atlas contract for the home focal where practical. |
| Runtime knight atlases | `sprites/knight.js`, `sprites/knight-open.js` | Actual game-rendered 160px gameplay families, closed and open visor, with matching layers. Do not mix only a base layer between families. |
| Atlas authoring and review | `art/blender/knight.py`, `art/blender/visor_bake.py`, `art/blender/VISOR-REVIEW.md` | Procedural source and accepted closed/open rounded-visor direction. The review records completed local candidate rendering and package acceptance in the 0.2.2 work; it does not certify this new home layout. |
| Castle source and review | `art/blender/keyart.py`, `art/blender/keyart_finish.py`, `art/blender/HERO-V2-REVIEW.md`, `art/MODEL-REVIEW.md` | Existing authored visual sources/reviews. The V2 angular helmet pass was rejected; retain current rounded game art. `MODEL-REVIEW.md` is a diagnostic, not approval of every current sprite detail. |
| Store illustration masters | `art/store/source/landscape.png`, `portrait.png`, `hero.png`, `icon.png` | Created 8 October 2026 with Codex built-in image generation. Prompts, reference roles and requested composition are recorded in `art/store/generation-prompts.json`; exact masters/exports and dimensions/hashes are in `art/store/exports/manifest.json`. Marketing art only; not gameplay evidence. |
| Store exports | `art/store/exports/` | Deterministic promotional crops/icons. `art/store/README.md` records Joshua’s 8 October ownership/commercial-use confirmation for existing and created art, publisher, source files, font use and that no store upload occurred. These are optional visual references, not menu screen assets by default. |
| Display and UI fonts | `vendor/lilita-one-latin-400-normal.woff2`, `vendor/nunito-latin-600-normal.woff2`, `vendor/nunito-latin-800-normal.woff2`, `vendor/nunito-latin-900-normal.woff2`, `vendor/fonts.css` | Already bundled locally with licenses: `vendor/lilita-one-LICENSE.txt` and `vendor/nunito-LICENSE.txt`. Lilita One is the short-display/title face; Nunito is the readable UI/body face. Do not introduce a replacement font or claim a separate commercial redistribution check. |
| Menu music | `menu-theme.mp3` | Existing recording retained unchanged. `release/music/source-provenance.json` records its SHA-256 (`ddf51a60e33a0bbbf53b8d83f4645258e365dccba91d59cd886489fa07463e58`) and the prior owner commercial-use confirmation; no conversion is recorded. Reuse through existing menu playback, without changing the audio asset. |
| Gameplay/capture references | `art/store/generation-prompts.json` references `qa/results/2026-10-08T09-29-19-screenshots/courtyard-ffa.png`; `release/research/2026-10-13/player_journey.md` cites `outputs/Story-review/opening-in-game.png` | These are reference captures. The latter is a paused beta.7 story-review state, not a home screen. Generated store images must not stand in for real gameplay. |

The accepted local menu and character direction is substantiated by the source documentation and owner-recorded choices, not newly approved by this inventory. Do not rely on the separate angular V2 prototype or flat concept studies as the production hero.

## Existing design research to apply

`release/research/2026-10-13/player_journey.md` records three Refero style searches and the inspected Playdate, Wayfinder and Duolingo styles, plus Xbox session-code/Discord invite screens and the Xbox four-screen join-by-code flow. Its bounded transfer is:

- Borrow Playdate’s single focal object and clear hierarchy, Wayfinder’s illustrated world composition, and rounded, approachable controls.
- Keep Custard Knights’ own cream/yellow/deep-purple identity, rounded art and both visors as primary references. Do not copy other brands’ tokens, use tiny ghost controls, or let decorative scenery compete with the routes.
- Use a short display face only for titles, legible UI type for body text, yellow for primary focus/action, and high-contrast persistent focus/pad prompts. The PC 18px / console 26px XAG101 rendered-text figures are reference targets at 1080p; CSS size alone does not establish readability.
- Design the hero framing for 16:9 first and protect the hero and route labels when adapting to 16:10/ultrawide. Controls should not depend on hover.

These are composition and usability references, not evidence of retention gains or a passed TV-distance test. The current research contains no accepted main-menu screenshot; implementation should capture and review one at desktop and TV-scale before anyone calls the layout accepted.

## Prior story videos: unresolved location

Earlier generated story videos are reported by the owner, but their location is still pending. The existing record in `release/research/2026-10-13/gameplay_story.md`, `release/RESUME-CHECKPOINT.md` and `release/ORCHESTRATOR-QUEUE.md` says prior local searches did not locate them; it records no file path, service, output ID, hash, or catalog. The inspected beta.7 scene captures and current canvas-rendered scenes are not recovered prior videos. This bounded home task did not repeat broad searches. Do not invent provenance, call any current scene a recovered video, or regenerate video to fill this gap. When the owner locates the prior files/service outputs, record file/service ID, hash, plot beat, characters, duration, audio and rights before deciding whether any is relevant to the home screen.

## Handoff constraints

- Build the home focal from existing runtime hero/knight art and existing illustrated environment references; new generated images, paid creative jobs and font additions are outside this lock.
- Keep the four routes visually primary, their names explicit, and route focus/navigation readable from a couch. The home is a navigation surface, not a promo capsule.
- Preserve the four existing visor atlas families and their layer pairings. Do not modify accepted art or audio as part of the home composition task.
- Treat every external reference and asset record as a source of composition/provenance only. New menu quality, TV readability and owner acceptance remain to be checked on the implemented screen.
