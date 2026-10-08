# Custard Knights store artwork

Developer and publisher: **Sparked FM Ltd**. Candidate artwork exports prepared 8 October 2026. No store upload or publication has been performed.

The source masters are in `source/`. The exact upload files are in `exports/`. `scripts/store-assets.cjs` performs deterministic sizing and format conversion, then adds the game's established Lilita One logotype in its existing custard-yellow/pink colours. It also creates the Windows application ICO and copies the 256px window icon to `desktop/icon.png`. The generated marketing illustrations are not used as gameplay screenshots.

| Upload slot | Export | Size |
|---|---|---|
| Header capsule | header-capsule.png | 920 × 430 |
| Small capsule | small-capsule.png | 462 × 174 |
| Main capsule | main-capsule.png | 1232 × 706 |
| Vertical capsule | vertical-capsule.png | 748 × 896 |
| Library capsule | library-capsule.png | 600 × 900 |
| Library header | library-header.png | 920 × 430 |
| Library hero | library-hero.png | 3840 × 1240; no text |
| Library logo | library-logo.png | 1280 × 720; transparent PNG |
| Shortcut icon | shortcut-icon.png | 256 × 256 PNG |
| Community/app icon | app-icon.jpg | 184 × 184 JPG |
| Windows executable icon | app.ico | 16, 24, 32, 48, 64, 128 and 256px frames |

Sizes checked against Valve's [graphical asset overview](https://partner.steamgames.com/doc/store/assets?language=english), [store specifications](https://partner.steamgames.com/doc/store/assets/standard) and [library specifications](https://partner.steamgames.com/doc/store/assets/libraryassets?language=english) on 8 October 2026. Capsules contain the title and artwork only. The small capsule prioritises readable title lettering, including Steam's generated 120 × 45 presentation. The hero keeps the lead knight's face near its centre; select the library logo position in Steamworks' preview so it does not cover the main knight.

The 3840px hero is exported from a 2206px generated source; this is an upscaled delivery asset, not an original 3840px render. All masters are retained for future revisions.

## Ownership and generation record

- Joshua explicitly confirmed **“everything here is mine”** in response to the menu and character artwork ownership question on 8 October 2026, and authorised its use for the commercial release. Existing castle and sprite artwork also has procedural Blender source under `art/blender/`.
- Joshua separately confirmed commercial rights to the existing Suno menu theme. Audio subscription/creation evidence remains part of the release record.
- Four new promotional artwork masters were created with Codex's built-in `image_gen` tool, using the existing castle and an actual gameplay capture as visual references. Full prompts and source roles are recorded in `generation-prompts.json`. These are pre-generated illustrations; the application icon derived from them is included in the packaged desktop build. Do not omit these assets from the AI content record when completing Valve's [content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey).
- The title uses bundled Lilita One; its licence is included in `vendor/lilita-one-LICENSE.txt`. Font licence copying is already part of game packaging.
- Actual gameplay screenshots and the gameplay trailer are separate capture deliverables. Screenshots must remain actual gameplay rather than the generated illustrations in this directory.

## Regenerate

Use the Codex dependency runtime's Node packages (or install `sharp` and `@napi-rs/canvas` in a build workspace), then run `node scripts/store-assets.cjs` with `NODE_PATH` pointing to those packages. Run `npm ci` first so the Lilita One WOFF source is available. The script leaves the four source masters unchanged and replaces only its deterministic exports and generated desktop icon.

The manifest records the exact files and sizes. Final Steamworks preview, store submission and review require the real application account and IDs.
