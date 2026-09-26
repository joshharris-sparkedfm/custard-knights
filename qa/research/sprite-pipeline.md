# Sprite pipeline for Custard Knights

Research date: 26 September 2026. Scope: how to move the knights from the procedural Canvas 2D renderer (`drawKnight`, `drawBody`, `drawHelm`, `cel`, `custardCrown` in `index.html`) to pre-rendered or skeletal art with a much richer animated cartoon look, while keeping 8 knights at 60 fps on integrated laptop graphics and Steam Deck, keeping every customisation option, and keeping the game playable at every step.

Companion documents in this folder: `cartoon-character-craft.md` (art direction, readability, how other games handle directions and layers) and `ai-art-pipeline.md` (AI tools, licences, Blender toon rendering overview). This document is the engineering half: runtimes, measured costs, file formats, code and the migration plan.

Numbers marked **measured** were produced for this report on the dev PC (AMD Ryzen 9 9950X3D, RTX 5090, Chrome 154 headless, Blender 5.2.1 LTS). Everything else is cited.

---

## Executive summary

1. **The procedural renderer is the frame-rate problem, not just the look.** Measured: one `drawKnight` call costs 1.3 to 1.6 ms of main-thread time in Chrome on a top-end desktop CPU, so 8 knights take 11 to 13 ms of a 16.7 ms frame. That matches the existing `qa/run.js perf` result of 81 to 94 fps on this PC, and it means integrated laptops and Steam Deck (roughly 2 to 3 times slower single-threaded) will fall well below 60 fps. Drawing a cached knight sprite cost 0.013 ms, and 8 stacked layers cost 0.025 ms per knight: 60 to 100 times cheaper.
2. **Stay on Canvas 2D and switch knights to pre-rendered layered sprites.** About 60 to 100 `drawImage` calls a frame is far inside what Canvas 2D handles on integrated GPUs (published: 1,100 to 1,600 sprites at 60 fps on 2011 to 2012 Intel HD graphics [20]). PixiJS v8 is excellent (200,000 sprites at 60 fps on its own benchmark [15][16]), but it adds 231 KB gzipped (measured), and WebGL refuses `file://` images [27]. That would break "open `index.html`" and the QA harness, which loads the game from `file://`. Keep Pixi as a later option behind the same renderer seam.
3. **Make the art in 3D and bake it to 2D in Blender, headless.** A 2D skeletal tool (Spine, Rive, DragonBones) needs a separate rig and animation set for every facing, so five facings means five times the animation work. In 3D each extra direction costs only machine time. Measured on Blender 5.2.1: EEVEE with toon shading renders a 192 px frame in 0.38 s once shadows and ray tracing are switched off (1.14 s with defaults). A full knight set of about 850 frames bakes in about 6 minutes. Cycles cannot run the Shader to RGB toon node [37], and Workbench (0.095 s a frame) suits flat mask passes.
4. **Keep customisation cheap: parts on sockets, not every combination baked.** There are 285,120 knight loadouts (6 x 5 x 3 x 8 x 11 x 6 x 6), so baking every loadout is impossible. Only the parts that deform are rendered per frame: the body, the cape, and the cloth in team colour. Rigid parts (helm, plume, shield, blade, emblem) are rendered once per direction and placed each frame on sockets exported from Blender. The blade rotates continuously to the exact aim angle. Eyes, the custard crown and status effects stay procedural and are drawn on sockets.
5. **Team colours are exact with no pixel reads.** The current palette is `shade(c,-0.3)`, which is c x 0.7, and `shade(c,+0.38)`, which is 38% white over c. That is exactly "greyscale layer multiplied by colour, plus a white highlight layer". Baking a 2048 x 2048 tint page per colour with `multiply` then `destination-in` costs 0.67 ms (measured). The alternative, a `getImageData` gradient map, costs 155 ms a page (measured) and throws on `file://` [26]. Bake once per colour per match, not per knight.
6. **Use 8 facings from 5 unique renders (S, SE, E, NE, N) and mirror SW, W and NW.** Snap with about 6 degrees of hysteresis and never crossfade between directions. Because the blade, eyes and emblem are drawn on sockets after the mirror, they do not flip. Moving to 16 facings later costs about 80% more frames and memory and no extra art labour. Knight Squad 2 sidestepped the problem entirely by going real-time 3D [48], which is worth remembering for the planned Godot build.
7. **Budget** (60 fps, 16.7 ms): knights 1.5 ms, procedural overlays 1.5 ms, effects 3 ms, arena 2 ms, HUD 1 ms, simulation 4 ms, headroom 3.5 ms. At most 16 `drawImage` calls per knight. Atlas pages of 2048 x 2048 or smaller. Decoded knight art about 44 MB at 2x and 11 MB at 1x (Steam Deck's 1280 x 800 screen is exactly the logical canvas, so 1x is pixel-perfect there). Download at most 6 MB.
8. **Migration keeps the game playable at every step** behind `?r=proc|cache|sprite` and a Settings toggle. Step 1 adds the renderer seam and a frame-time HUD. Step 2 caches today's procedural knights as sprites, which proves the atlas, facing and pose code and wins frame rate with zero new art. Step 3 is a one-helm, one-body Blender spike. Step 4 is the full part set and tint baker. Step 5 covers chickens, Steve and the boss, then switches the default. Any loadout missing a part falls back to the procedural knight.

---

## 1. Runtime options in a browser

### 1.1 What the current renderer costs (measured)

`drawKnight` builds every part from `Path2D` objects each frame. `cel()` fills the path, clips to it, draws two even-odd "crescent" fills for shadow and highlight, then strokes an ink outline. Metals use a fresh `createLinearGradient` or `createRadialGradient` per part per frame. The plume, cape, crown and eyes add more of the same. That is dozens of path fills, clips and gradient creations per knight per frame.

Micro-benchmark (headless Chrome 154, GPU-accelerated canvas, 2560 x 1600, knights drawn at 2x, 4,000 iterations, 8 mixed loadouts, script kept in the session scratchpad as `bench.js`):

| Test | Time per knight | 8 knights |
|---|---|---|
| Procedural `drawKnight` | 1.34 to 1.61 ms | 10.7 to 12.9 ms |
| One cached sprite per knight (`drawImage` with a squash transform) | 0.013 ms | 0.10 ms |
| Eight stacked layer sprites per knight | 0.025 ms | 0.20 ms |
| Procedural on a CPU canvas (after a `getImageData` readback) | 1.64 ms | 13.1 ms |

The existing QA perf run on the same PC reports 81 to 94 fps across the six arenas (`qa/results/2026-09-26T12-22-03/summary.md`), about 11 to 12 ms a frame. So knights are most of the frame. Integrated laptops and Steam Deck run Chrome's main thread roughly 2 to 3 times slower than a 9950X3D, which puts the procedural renderer alone over budget. Any of the options below fixes that. The question is which one gives the best art for the least risk.

### 1.2 (a) Sprite sheets on Canvas 2D

- **Throughput.** Chrome's Canvas 2D is GPU accelerated for `drawImage` [21]. Published figures from EaselJS `drawImage` tests: Intel HD3000 1,100 sprites at 60 fps, HD4000 1,600 at 60 fps, a GT330m 2,500 at 60 fps [20]. Chrome's own demo drew 180 transformed 256 x 256 sprites at 30 to 60 fps on a low-powered laptop, back in 2012 [21]. The cost is per call (bindings and bookkeeping), so it rises with call count, not with pixels [19]. Custard Knights needs about 8 knights x 8 layers = 64 calls, plus effects. That is one to two orders of magnitude under the ceiling.
- **Rules that keep it fast** [22]: pre-render repeated drawing to offscreen canvases; avoid `shadowBlur`; minimise state changes; use `createImageBitmap` for decoded atlases; keep the main context `alpha:false` if the arena covers the whole frame. Integer coordinates matter less at this sprite count, and sub-pixel motion looks smoother for a cartoon.
- **Composite modes are slow per frame** on some browsers: Mozilla measured under 2,000 ops/s for most non-`source-over` modes [24]. Use `multiply` and `destination-in` only at bake time, never per knight per frame.
- **Atlas size.** Canvas 2D exposes no texture limit, but a GPU-backed image larger than the GPU's maximum texture size falls back to slow paths, and Firefox has had `drawImage` failures at 16384 x 16384 [51]. WebGL2 `MAX_TEXTURE_SIZE` is at least 4096 on 99.95% of devices, 8192 on 95.8% and 16384 on 83% [28]. Use 2048 x 2048 pages: safe everywhere, and memory arrives in 16 MB steps.
- **Memory.** Decoded RGBA is 4 bytes a pixel, whatever the PNG size on disk. A 2048 x 2048 page is 16 MB. See section 6.4 for the full estimate.
- **Pixel reads.** `getImageData` on a canvas that has drawn a `file://` image throws a SecurityError, because Chrome treats each local file as its own origin [26]. The game itself never reads canvas pixels (checked: `index.html` has no `getImageData` or `toDataURL`). So a sprite renderer that recolours only with composite operations works from `file://`, GitHub Pages and Electron alike. The knight lab (`art/lab/sheet.js`) calls `toDataURL`, so once it draws sprites it must be served over http.

### 1.3 (b) Spine

- **Licence.** Essential is $69 (listed as reduced from $99). Professional is $379 (reduced from $449). Enterprise is $2,499 plus $379 a user and is required once the business turns over more than $500,000 a year [1]. "Each user of the Products must obtain their own Spine Editor license" to integrate the runtimes. Players need nothing. Products already shipped can keep shipping after a licence lapses, but new integrations need a current licence [1][2]. Essential has no meshes [1].
- **Web runtimes, sizes measured today from jsDelivr (v4.2 IIFE builds):**

| Package | Minified | Gzipped | Notes |
|---|---|---|---|
| `spine-canvas` | 162 KB | 46 KB | No meshes, no clipping, tint applies alpha only [3][4] |
| `spine-webgl` | 216 KB | 66 KB | Every feature, including two-colour "tint black" [4] |
| `spine-pixi-v8` | 195 KB | 56 KB | Plus Pixi (231 KB gzipped). npm latest is 4.3.13 and needs Pixi 8.16 or newer [5] |
| `spine-player` | n/a | n/a | An embeddable viewer for web pages, not suited to a game loop |

- **Customisation fit.** Skins mix and match at runtime (`skin.addSkin(...)`, then `skeleton.setSkin(...)` [5]), which suits helms, plumes and blades. But spine-canvas cannot tint, so team colours need spine-webgl or Pixi, or a pre-tinted atlas per colour.
- **Directions.** Spine is 2D. Each facing is its own set of drawings and usually its own animations. For 5 facings x 11 animations, that is where the labour goes.
- **Verdict.** Good tool, wrong axis of cost for an 8-direction top-down brawler. Worth it only if the art style moves to side-on or 3-facing characters.

### 1.4 (c) DragonBones

- A free Spine-like editor with a JSON export and a Pixi runtime [11]. But DragonBones Pro is effectively abandoned: the developer has not responded for years and the download link has been reported dead [13]. The last JS runtime release (5.8.1) is about three years old, with only Pixi 4 and 5 era integrations [12] and community forks for newer Pixi.
- **Verdict.** Do not build on it. If a free 2D rig tool is wanted, Spriter Pro ($59.99 on Steam, with "character maps" for part swaps [14]) is alive, but its JS runtime story is thin. A custom animator (section 5.3) is less risk.

### 1.5 (d) Rive

- **Runtimes** are open source under MIT and free for commercial use [8]. The **editor** is not: the free plan has "no exports", paid plans are Cadet $9 a seat per month and Voyager $32 a seat per month, and Enterprise ($120) applies from $10M revenue [7]. Shipping needs at least Cadet for the export.
- **Renderers.** `@rive-app/webgl2` uses the Rive Renderer with full editor fidelity. `@rive-app/canvas` draws through Canvas 2D, lacks vector feathering and handles blend modes more cheaply on mobile. `@rive-app/canvas-lite` also drops text, layout, audio and scripting [6]. Browsers cap WebGL contexts, so many instances need `useOffscreenRenderer: true` [6].
- **Sizes measured today from jsDelivr:** canvas-lite `rive.js` 424 KB (93 KB gzipped) plus `rive.wasm` 862 KB (360 KB gzipped). Canvas `rive.wasm` 1.9 MB (802 KB gzipped). WebGL2 `rive.wasm` 2.2 MB (903 KB gzipped). A project that tried the React WebGL2 build reported about 925 KB of gzipped WASM plus about 450 KB of JS glue [10].
- **State machines and customisation.** Rive's strength is interactive state machines, and data binding can swap images at runtime for avatars and skins [9]. But vector art is re-rendered every frame. On the canvas runtime that is the same class of work as today's `Path2D` renderer, so it will not solve the frame-rate problem. On WebGL2 it would be faster, but it adds about 1 MB and Rive's own context management. It is also 2D, so each facing needs its own artboard or animations.
- **Verdict.** Great for menus, the Wardrobe preview, banners and UI flourishes. Wrong for 8 always-on characters that face any direction.

### 1.6 (e) PixiJS v8 as the renderer, game logic unchanged

- **Performance.** Bunnymark with 100,000 moving sprites: CPU time went from about 50 ms (v7) to about 15 ms (v8), and GPU time from about 9 ms to about 2 ms [15]. Pixi claims 200,000 sprites at 60 fps with normal sprites and 1,000,000 with the v8 `ParticleContainer` [16]. A third-party benchmark with 10,000 moving sprites measured Pixi at 47 fps, Phaser 43 and Babylon 56 (hardware not stated) [19]. Bunnymark "does not reflect typical real-world rendering" [16].
- **Batching.** Sprites batch across up to 16 textures (hardware dependent). Blend-mode changes break batches. Filters are expensive and each filtered object renders to its own target. Masks cost scissor (cheap) up to stencil and sprite masks (dear) [17].
- **Tint.** `sprite.tint` multiplies per vertex, so it stays in the batch. v8 also inherits tint and blend mode down containers [15]. A greyscale cloth layer tinted per knight gives team colours at zero memory cost. That is the main advantage over Canvas 2D, which has to bake a tinted copy.
- **Outlines.** `OutlineFilter` (pixi-filters v6.1.5) takes thickness, colour and quality, and higher quality is slower [18]. As a filter it breaks batching and adds a render pass per knight. Bake outlines into the art instead.
- **Palette or gradient-map recolour** needs a custom shader. The standard approaches are an index or greyscale texture plus a palette uniform or lookup texture [29][30]. In Pixi a per-sprite custom filter breaks the batch. A custom batcher or a mesh shader avoids that, but it is real work. For 8 knights, tint plus a white highlight layer (section 2.3) is enough.
- **Size.** `pixi.min.js` 8.21.0 is 809 KB minified and 231 KB gzipped (measured). It must load before the game, from a CDN or vendored (no build step needed; the IIFE build works from a script tag).
- **`file://`.** WebGL rejects cross-origin images, and every local file is its own origin, so `texImage2D` throws [27]. With Pixi, the README's "open `index.html`" would need a local server or atlases embedded as data URIs. `qa/run.js` and `art/lab/render.py` would need to serve over http. For Electron, serve assets through a custom protocol or a local server in any case.
- **Verdict.** Keep as phase 6 in the plan (section 6.6), and only if profiling after the sprite switch shows effects, particles or lighting ("Lights Out", "Disco Fever") as the bottleneck. The renderer seam and the atlas format are the same, so nothing is wasted.

### 1.7 Summary table

| Option | Cost | Payload (gzipped) | Handles 8 facings | Team colour | Works from `file://` | Fit |
|---|---|---|---|---|---|---|
| Canvas 2D + baked layered sprites | free | 0 KB code, about 4 to 6 MB art | yes, via the bake | baked per colour, composite ops | yes | **Recommended** |
| PixiJS v8 + same atlases | free (MIT) | 231 KB + art | yes | free via `tint` | no | Later, if needed |
| Spine + spine-webgl or Pixi | $69 to $379 a seat | 66 KB (+231 KB) | one rig per facing | tint black | webgl: no | Poor for 8 facings |
| Rive | $9 a seat per month or more | 453 KB (lite) to about 1 MB | one artboard per facing | data binding | canvas: yes | UI only |
| DragonBones | free, abandoned | about 60 to 100 KB | one rig per facing | via Pixi | no | Avoid |

---

## 2. Customisation with pre-rendered art

### 2.1 The combinatorics

Loadouts: 6 helms x 5 plumes x 3 metals x 8 emblems x 11 colours x 6 capes x 6 blades = **285,120**, before chicken skins. Pre-baking whole knights is out. Layers turn the product into a sum:

| Slot | Variants | How it is produced | Per frame or per direction |
|---|---|---|---|
| Body armour (legs, torso, arms) | 3 metals | Rendered 3 times in Blender, one per metal | per frame (deforms) |
| Cloth (tabard, pauldrons, crest) | 1, greyscale | Rendered once, tinted at runtime | per frame |
| Cloth highlight | 1, white with alpha | Rendered once, drawn untinted | per frame |
| Cape | 1 greyscale + 5 pattern overlays | Cape tinted; pattern overlays are cream, untinted | cape cycle per direction x moving or still |
| Helm | 6 x 3 metals | Rendered once per direction | per direction, placed on the `head` socket |
| Plume | 5, greyscale | Rendered per direction x 4 sway poses | on the `head` socket |
| Shield | 3 metals | Per direction | on the `offhand` socket; emblem drawn on top |
| Blade | 6 | One image each, rotated at runtime | on the `hand` socket at the exact aim angle |
| Emblem | 8 | Tiny images or today's `drawEmblem` | on the `chest` and `shield` sockets, never mirrored |
| Eyes, custard crown, status FX | procedural | Today's code | on the `visor` and `head` sockets |
| Chickens | 6 skins | Rendered per skin | per frame |

The authoring cost is the **sum** of variants (about 45 part images per direction). The runtime cost is at most one composite stack per knight.

### 2.2 Layer order and occlusion

Two methods, used together:

1. **Holdout only against invariant parts.** When rendering the cape layer, set the body mesh to holdout, so the cape is cut exactly where the body hides it. That is always correct, because the body is always present. Never hold out one variant slot against another. A horned helm held out of the plume layer would leave a hole when the player picks a kettle hat.
2. **Draw order per direction and frame, computed at bake time.** For each frame, project every slot's anchor into camera space and sort by depth (`world_to_camera_view` returns depth in `z` [40]). Store the order in the manifest. This replaces today's hand-tuned rules (`fy<-.25` weapon behind, `fy<-.55` cape in front, `shieldBehind`) with numbers from the actual 3D pose.

### 2.3 Recolouring: why tint plus a white layer is exact for this game

`shade()` in `index.html` does `r+=(255-r)*k` for positive `k` (a mix towards white) and darkens for negative `k`. The cel palette per part is therefore:

- base = c
- shadow = `shade(c,-0.3)` = c x 0.7
- highlight = `shade(c,+0.38)` = c + 0.38 x (white - c) = white at 38% alpha over c

So a cloth layer rendered in **two greys** (sRGB 255 for base, 179 for shadow), multiplied by the team colour, then overdrawn with a **white highlight layer** at 38% alpha, reproduces today's colours to the rounding. No gradient maps and no pixel reads.

Blender outputs linear light, so set ramp colours in linear values that land on the sRGB targets: linear = ((s + 0.055) / 1.055)^2.4. That gives 1.0 for 255 and 0.445 for 179. Also set the view transform to Standard, not AgX, so flat colours are not remapped (section 4.3).

Metals keep their hue shifts (gold's shadow is brown `#7E4F10`, not a darker yellow). Multiply tint cannot do that, so metals are rendered 3 times: machine time only, and helms are tiny.

**Canvas 2D bake (works on `file://`, measured 0.67 ms per 2048 x 2048 page; composite modes per [23]):**

```js
// Tint one greyscale atlas page to a team colour. Composite ops only: no getImageData, so it works from file://.
function tintPage(src, colour) {              // src: ImageBitmap of a page that holds only tintable layers
  const c = new OffscreenCanvas(src.width, src.height), x = c.getContext('2d');
  x.drawImage(src, 0, 0);
  x.globalCompositeOperation = 'multiply';    // grey x colour: 255 -> colour, 179 -> colour x 0.7
  x.fillStyle = colour; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'destination-in'; // multiply also painted the transparent area; restore the alpha
  x.drawImage(src, 0, 0);
  return c;                                   // usable directly as a drawImage source
}
```

**Gradient map with pixel reads.** Use this only if a future art style needs hue-shifted ramps on cloth. It needs http(s), Electron or a Worker with fetched bytes, and is measured at 155 ms per page:

```js
const x = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true }); // CPU canvas, no GPU readback [25]
x.drawImage(page, 0, 0);
const d = x.getImageData(0, 0, w, h), p = d.data;
for (let i = 0; i < p.length; i += 4) if (p[i + 3]) { const g = p[i] * 3; p[i] = lut[g]; p[i + 1] = lut[g + 1]; p[i + 2] = lut[g + 2]; }
x.putImageData(d, 0, 0);
```

**WebGL (Pixi) equivalent.** `cloth.tint = 0xFF5A4E` on the greyscale sprite, plus an untinted highlight sprite above it. Both stay in one batch.

### 2.4 How much to bake, and when

- **Offline (Blender):** every part variant x direction x frame in the table above.
- **At load:** decode atlases to `ImageBitmap` [22].
- **At match start, per distinct colour (not per knight):** tint the pages that hold tintable layers. Free-for-all has at most 8 colours and team modes have 2. Measured 0.67 ms a page, about 5 ms for 8 colours. Run it during the "3, 2, 1" countdown or lazily on the first draw of that colour. Cache by `page + colour` and drop the cache when the match ends.
- **Page grouping matters.** Pack tintable layers (cloth, cape, plumes) on their own pages, grouped by variant (one page per plume), so a colour bake touches only the pages that loadout uses. Pack metal-specific layers by metal, so a match with no gold knights never decodes gold pages.
- **Optional per-knight flatten.** For the eight knights in a match you could flatten each loadout into one image per frame (1 draw per knight instead of about 8). Measured, 8 layers cost only 0.012 ms more per knight than 1. Flattening would also cost about 7 MB per knight at 2x, so do not flatten unless a slow device proves otherwise.

---

## 3. Directions

### 3.1 How many

- **8 is the norm for top-down and 3/4 characters**, typically drawn or rendered as 5 unique (S, SE, E, NE, N) with 3 mirrored [cartoon-character-craft.md 1.3]. Commercial packs sell 8-direction knights as standard [52].
- **16 for vehicles and RTS units.** StarCraft rotated sprites in 22.5 degree steps (16 directions) and mirrored half of them [46]. Diablo II used 8 or 16 per animation. Supergiant renders many angles from 3D for Hades [45].
- **Knight Squad** (2015) was 2D [47]. No source was found for its direction count. **Knight Squad 2** moved to real-time 3D ("everything is rendered in 3D for the second game") [48], which removes the question entirely. Worth noting because the README plans a Godot 4 build: the same Blender knight could be used in real time there.
- **For Custard Knights, 8 is right for the body.** The right stick aims continuously, so what reads as "facing" is mostly the blade and the swing arc. Those are drawn at the exact angle (section 2.1). 16 costs 9 unique renders instead of 5 (+80% frames and memory) and no art labour. Consider it later for idle and walk only.

### 3.2 Mirroring

Mirroring halves the work, but it flips asymmetric details: sword hand, shield side, a sallet's tail, asymmetric emblems (moon, pie, bolt). Here those details sit on sockets and are drawn after the mirror, unflipped:

- The blade and shield take their positions from mirrored socket coordinates but are drawn with their own un-mirrored images. When the knight faces west the sword simply moves to the other hand, which players do not notice at 50 px.
- Emblems and eyes are drawn unflipped at the mirrored socket position.
- If a part needs true asymmetry (the sallet tail), render all 8 directions for that part only. It is on a socket, so it is cheap.

### 3.3 Blending between directions

- **Snap, do not crossfade.** Crossfading two facings ghosts the silhouette. Snap to the nearest sector with hysteresis so a knight aiming near a boundary does not flicker.
- **Sell the in-between** with a small rotation of the body by the residual angle (up to about plus or minus 6 degrees). Today's renderer already leans the torso with velocity (`ctx.rotate(clamp(e.vx/...))`), so keep that.
- **Turn frames.** For a snappier cartoon feel, a 180 degree turn can play a 2-frame squash (reuse the existing `sq` squash) rather than dedicated turn animations.

```js
// Sector 0 = E, then clockwise in canvas space (y down): 1 SE, 2 S, 3 SW, 4 W, 5 NW, 6 N, 7 NE.
const UNIQUE = ['S', 'SE', 'E', 'NE', 'N'];
const SECT = [[2, false], [1, false], [0, false], [1, true], [2, true], [3, true], [4, false], [3, false]]; // [row, mirror]
function facing(e) {
  const S = Math.PI / 4, TAU = Math.PI * 2, a = ((e.face % TAU) + TAU) % TAU;
  const s = e._sect, d = s == null ? 9 : Math.abs(((a - s * S + 3 * Math.PI) % TAU) - Math.PI);
  if (d > S / 2 + 0.1) e._sect = Math.round(a / S) & 7;   // 0.1 rad (about 6 degrees) of hysteresis
  const [row, mirror] = SECT[e._sect];
  return { row, mirror, residual: ((a - e._sect * S + 3 * Math.PI) % TAU) - Math.PI };
}
```

---

## 4. 3D-to-2D bake pipeline in Blender 5.x, headless

### 4.1 Why 3D

Dead Cells is the reference case. A 3D model and skeleton, rendered tiny with no antialiasing and cel shaded, gave the team hand-drawn-looking animation. Retakes took minutes ("adjust the timing of the animations dozens of times in minutes"), and armour attached to the skeleton was "probably the single most useful little trick in our workflow" [44]. Supergiant renders its Hades characters from 3D at many angles [45]. The repo already builds a procedural knight in Blender (`art/blender/knight.py`, untracked at the time of writing) and renders an 8-direction turnaround. The pipeline below extends that script, it does not replace it.

### 4.2 Scene conventions

- **Units:** the knight is about 2.1 Blender units tall (per `knight.py`). The root empty sits at the feet, at the centre of the ground shadow, which becomes the sprite pivot (`e.x, e.y`).
- **Rotate the character, not the camera, and keep the key light fixed to the camera.** Today's cel style puts highlights upper left and shadows lower right in screen space. Rotating the model under a fixed light keeps that consistent in every direction. Orbiting a camera rig would move the highlight around the knight.
- **Camera:** orthographic, about 35 degrees above the horizon, which matches the game's frontal 3/4 knights. Ortho scale is fixed for the whole set, so every part and frame shares one pixel scale.
- **Sockets:** empties parented to bones: `head`, `visor`, `hand`, `offhand`, `chest`, `back`, `feet`. They are projected to pixels per frame and written to the manifest with rotation and depth.
- **Slots:** one collection per slot and variant (`body.steel`, `helm.horned.gold`, `plume.flame`...). A layer render shows one collection and hides the rest.

### 4.3 Render settings: measured timings

A toy knight (3 meshes, toon material, 192 x 192, 8 TAA samples) rendering 5 directions x 8 walk frames x 2 layers = 80 frames:

| Engine and settings | Seconds per frame | Notes |
|---|---|---|
| EEVEE, defaults | 1.14 | shadows and ray tracing on by default |
| EEVEE, defaults + Freestyle | 1.23 | Freestyle added about 8% here, and grows with poly count and RAM [39] |
| EEVEE, `render(animation=True)` per direction | 1.29 to 1.60 | no gain from batching the call |
| **EEVEE, shadows and ray tracing off** | **0.38** | recommended; toon ramps do not need cast shadows |
| Cycles, OptiX, 16 samples | 0.43 | **Shader to RGB is EEVEE-only [37], so no toon ramp**; not usable for this look |
| Workbench | 0.095 | flat colours; good for ID or mask passes and fast previews |

A packer run (below) turned 40 frames into a 2048 x 256 atlas in 3.4 s including Blender start-up, and was verified pixel-exact against the source frames.

**Estimate for a full set:** 280 body frames x 3 metals + cloth, highlight and cape cycles, helms, plumes, shields, chickens and Steve comes to about 850 to 1,500 renders, or 6 to 10 minutes at 0.38 s. Iterating on one animation (5 directions x 8 frames x 4 layers) takes about a minute.

**Blender 5.x API points that bite** [35][50]:
- The EEVEE engine identifier is `BLENDER_EEVEE` again. `BLENDER_EEVEE_NEXT` is gone.
- `ImageFormatSettings.media_type` must be set before `file_format`.
- `scene.node_tree` was removed. Compositor graphs are now `scene.compositing_node_group`.
- The legacy Action API was removed. Use slots and channelbags. When assigning an action, set `animation_data.action_slot` if the action has several slots.
- `Material.use_nodes` is deprecated (removal planned for 6.0). New materials already have node trees.
- Render pass names were expanded (`Z` became `Depth`, and so on).
- Blender 5.1 added a Raycast shader node for NPR effects, but it is expensive, so bake it if used [36].

Set the view transform to **Standard** (not AgX) and the look to None, so flat toon colours come out exactly as authored.

EEVEE is rasterised and stable in background mode, so it suits batch and CI renders [49]. On this machine, pass `--factory-startup` for EEVEE bakes: a user add-on printed a traceback on every background start. Do not pass it for Cycles GPU renders, because the OptiX device choice lives in user preferences.

### 4.4 Toon shading and outlines

- **Shading.** Diffuse BSDF into Shader to RGB into a constant ColorRamp into Emission. Two or three bands match today's `cel()` (base, shadow crescent, highlight crescent) [37].
- **Outlines at sprite scale.** Freestyle works in EEVEE but is slow on heavy meshes and only visible after a full render [39]. The Line Art modifier gives the best lines but is slow per frame [38]. Inverted hull (Solidify modifier, flipped normals, backface-culled ink material) is cheapest and real time, and matches today's per-part ink outline, since every part gets its own rim. Render at 2x the display size and set hull thickness so the outline is about 5 to 7 px at 2x (today's `lineWidth` is 7.5 under and 2.4 over at 1x).
- **Outer silhouette.** If the composite knight needs a thicker outer outline for readability on busy floors, add it once per colour bake by drawing the layers in ink colour offset in 8 directions under the stack. Only do this if playtests ask for it.

### 4.5 Bake script

The core below is **tested**: it ran headless in Blender 5.2.1 and produced the frames and socket JSON timed above. Holdout, depth ordering and inverted hull are marked as untested additions.

```python
# art/blender/bake.py  --  blender -b --factory-startup --python art/blender/bake.py -- art/frames 192
import bpy, math, os, sys, json
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "art/frames"
RES = int(argv[1]) if len(argv) > 1 else 192
DIRS = ["S", "SE", "E", "NE", "N"]          # yaw 0, 45, 90, 135, 180 degrees; W side is mirrored at runtime
scene = bpy.context.scene

# ---- camera: orthographic 3/4, fixed; the character root rotates underneath it ----
cam = scene.camera or bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
if cam.name not in scene.collection.objects: scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.4
ELEV, DIST = math.radians(35), 10.0
cam.location = (0, -DIST * math.cos(ELEV), 0.7 + DIST * math.sin(ELEV))
cam.rotation_euler = (math.radians(90) - ELEV, 0, 0)
# Key light: a SUN parented to nothing, fixed, upper left as seen from the camera, so highlights stay screen-consistent.

# ---- render settings ----
r = scene.render
r.engine = "BLENDER_EEVEE"                  # Blender 5.x identifier
r.resolution_x = r.resolution_y = RES; r.resolution_percentage = 100
r.film_transparent = True; r.filter_size = 1.0
ims = r.image_settings
if hasattr(ims, "media_type"): ims.media_type = "IMAGE"   # 5.0+: set before file_format
ims.file_format = "PNG"; ims.color_mode = "RGBA"; ims.color_depth = "8"; ims.compression = 90
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "None"
ee = scene.eevee; ee.taa_render_samples = 8
for attr in ("use_shadows", "use_raytracing", "use_volumetric_shadows"):   # measured 3x faster with these off
    if hasattr(ee, attr): setattr(ee, attr, False)

root = bpy.data.objects["root"]
SOCKETS = [o for o in bpy.data.objects if o.name.startswith("socket_")]

def px(obj):                                 # socket -> [x, y, depth] in top-left pixel space, like canvas
    co = world_to_camera_view(scene, cam, obj.matrix_world.translation)
    return [round(co.x * RES, 2), round((1 - co.y) * RES, 2), round(co.z, 4)]

def show_only(coll_name):                    # isolate one slot variant (tested with per-object hide_render)
    for c in bpy.data.collections:
        if c.name.startswith(("body.", "cloth", "cape", "helm.", "plume.", "shield.")):
            c.hide_render = (c.name != coll_name)

def set_action(action):
    ad = root.animation_data or root.animation_data_create()
    ad.action = action
    if getattr(ad, "action_slot", None) is None and getattr(action, "slots", None):
        ad.action_slot = action.slots[0]     # 5.x slotted actions

manifest = {"cell": RES, "scale": 2, "dirs": DIRS, "anims": {}, "sockets": {}, "order": {}}
LAYERS = json.load(open(os.path.join(os.path.dirname(__file__), "layers.json")))  # {"walk": ["body.steel", "cloth", ...]}
for action_name, layer_list in LAYERS.items():
    act = bpy.data.actions[action_name]; set_action(act)
    f0, f1 = map(int, act.frame_range); n = f1 - f0 + 1
    manifest["anims"][action_name] = {"frames": n, "fps": 12, "loop": act.use_cyclic if hasattr(act, "use_cyclic") else True}
    for d, dname in enumerate(DIRS):
        root.rotation_euler.z = math.radians(d * 45)
        for i, f in enumerate(range(f0, f1 + 1)):
            scene.frame_set(f)
            key = f"{action_name}/{dname}/{i}"
            manifest["sockets"][key] = {s.name[7:]: px(s) for s in SOCKETS}
            # UNTESTED: draw order from socket depth, nearest last
            manifest["order"][key] = sorted(layer_list, key=lambda L: -manifest["sockets"][key].get(L.split(".")[0], [0, 0, 0])[2])
            for layer in layer_list:
                show_only(layer)
                r.filepath = os.path.join(OUT, layer, f"{key.replace('/', '_')}.png")
                bpy.ops.render.render(write_still=True)
json.dump(manifest, open(os.path.join(OUT, "bake.json"), "w"), indent=1)
print("BAKE_OK")
```

Rigid parts (helms, plumes, shields) use the same loop with `n = 1` (or 4 sway poses for plumes) and a neutral pose. The runtime places them on sockets.

**Holdout (untested):** before rendering the cape, set `bpy.data.objects["body"].is_holdout = True`, and reset it afterwards. Only hold out invariant parts (section 2.2).

**Toon material (tested):**

```python
def toon(name, shadow, base, light):         # colours in LINEAR values: sRGB 179 -> 0.445, sRGB 255 -> 1.0
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.clear()
    diff, s2r = nt.nodes.new("ShaderNodeBsdfDiffuse"), nt.nodes.new("ShaderNodeShaderToRGB")
    ramp, emit = nt.nodes.new("ShaderNodeValToRGB"), nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    cr = ramp.color_ramp; cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, (*shadow, 1)
    cr.elements[1].position, cr.elements[1].color = 0.35, (*base, 1)
    cr.elements.new(0.8).color = (*light, 1)
    nt.links.new(diff.outputs[0], s2r.inputs[0]); nt.links.new(s2r.outputs["Color"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], emit.inputs["Color"]); nt.links.new(emit.outputs[0], out.inputs["Surface"])
    return m
CLOTH = toon("cloth", (0.445,) * 3, (1.0,) * 3, (1.0,) * 3)   # highlight band goes to its own white layer
```

**Inverted hull outline (untested sketch):**

```python
def add_hull(obj, thickness=0.02):
    ink = bpy.data.materials.get("ink") or bpy.data.materials.new("ink")
    ink.use_backface_culling = True
    ink.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.012, 0.006, 0.03, 1)  # INK, linear
    obj.data.materials.append(ink)
    mod = obj.modifiers.new("hull", "SOLIDIFY")
    mod.thickness = thickness; mod.offset = 1; mod.use_flip_normals = True
    mod.material_offset = len(obj.data.materials) - 1
```

### 4.6 Packing atlases

- **Free packers:** Free Texture Packer (MIT, GUI plus CLI and `free-tex-packer-core` on npm). It does MaxRects and trimming and exports JsonHash, Pixi and Phaser formats [43]. TexturePacker is the commercial standard. `blender_directional_spritesheets` ships a Rust packer and a 4, 8, 16 or 32-direction render script [41]. A simpler render-and-combine script is described in [42].
- **No new dependencies:** the packer below uses only Blender's bundled Python and NumPy. It is **tested**: pixel-exact output with trimming, and TexturePacker "JSON hash" format, which Pixi's `Spritesheet` reads directly.

```python
# art/blender/pack.py  --  blender -b --factory-startup --python art/blender/pack.py -- <frames_dir> <out_prefix> [2048] [2]
import bpy, numpy as np, os, sys, json
a = sys.argv[sys.argv.index("--") + 1:]; IN, OUT = a[0], a[1]
MAX = int(a[2]) if len(a) > 2 else 2048; PAD = int(a[3]) if len(a) > 3 else 2

def load(path):
    img = bpy.data.images.load(path, check_existing=False); w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32); img.pixels.foreach_get(px); bpy.data.images.remove(img)
    return np.flipud(px.reshape(h, w, 4))    # Blender is bottom-up

frames = []
for name in sorted(os.listdir(IN)):
    if not name.endswith(".png"): continue
    p = load(os.path.join(IN, name)); h, w = p.shape[:2]
    ys, xs = np.nonzero(p[:, :, 3] > 0.004)
    x0, x1, y0, y1 = (xs.min(), xs.max() + 1, ys.min(), ys.max() + 1) if len(xs) else (0, 1, 0, 1)
    frames.append(dict(key=name[:-4], px=p[y0:y1, x0:x1], sx=int(x0), sy=int(y0), W=w, H=h))

frames.sort(key=lambda f: -f["px"].shape[0])   # shelf pack, tallest first
x = y = shelf = used = 0
for f in frames:
    fh, fw = f["px"].shape[:2]
    if x + fw + PAD > MAX: x, y, shelf = 0, y + shelf + PAD, 0
    f["x"], f["y"] = x, y; x += fw + PAD; shelf = max(shelf, fh); used = max(used, x)
H = y + shelf
if H > MAX: sys.exit("PACK_FAIL: split this layer set across pages")
AW, AH = 1 << (used - 1).bit_length(), 1 << (H - 1).bit_length()
atlas = np.zeros((AH, AW, 4), dtype=np.float32)
meta = {"frames": {}, "meta": {"image": os.path.basename(OUT) + ".png", "size": {"w": AW, "h": AH}, "scale": 1}}
for f in frames:
    fh, fw = f["px"].shape[:2]; atlas[f["y"]:f["y"] + fh, f["x"]:f["x"] + fw] = f["px"]
    meta["frames"][f["key"]] = {"frame": {"x": f["x"], "y": f["y"], "w": fw, "h": fh}, "rotated": False, "trimmed": True,
        "spriteSourceSize": {"x": f["sx"], "y": f["sy"], "w": fw, "h": fh}, "sourceSize": {"w": f["W"], "h": f["H"]}}
img = bpy.data.images.new("atlas", AW, AH, alpha=True); img.pixels.foreach_set(np.flipud(atlas).ravel())
img.filepath_raw = OUT + ".png"; img.file_format = "PNG"; img.save()
json.dump(meta, open(OUT + ".json", "w"), separators=(",", ":"))
print("PACK_OK", len(frames), f"{AW}x{AH}")
```

A final step (a few lines of Python) merges `bake.json` and the page JSONs into `assets/knight/knight.manifest.js` (section 6.3). It also writes a 1x set by downscaling each page 50% with a box filter.

---

## 5. 2D skeletal pipeline alternative

### 5.1 Hand-drawn parts in a rig tool

- **Workflow:** draw each part per facing (5 facings), rig in the tool, animate each facing, export JSON and atlas, and play it back with the tool's runtime.
- **Tools:** Spine (paid, best runtime and skins [1][5]), Spriter Pro ($59.99, character maps [14]), DragonBones (free, abandoned [12][13]). Rive suits UI better (section 1.5).
- **Cost:** 5 facings x 11 animations = 55 hand animations, plus redraws of every part per facing. The customisation side is trivial, because each part is its own image. The animation side is 5 times the work of the 3D route.

### 5.2 Blender as a cutout animator

A middle path. Put hand-drawn part images on planes in Blender, parented to an armature, one plane set per facing. Animate in Blender, and export per-frame transforms with the same socket exporter from section 4.5 instead of rendering pixels. This keeps hand-drawn art, uses one free tool for everything, and produces exactly the runtime format below.

### 5.3 A custom lightweight animator in plain JS

This is the runtime the recommended pipeline already needs: parts are images, and each frame is a list of transforms. Whether those transforms come from Blender sockets or from hand-keyed tracks makes no difference.

```js
// Minimal keyframe cutout animator: parts are images; tracks are keyframes of transforms per facing.
// anim = { len: 0.66, loop: true, tracks: { torso: [[0, x, y, rot, sx, sy], [0.33, ...], ...], helm: [...] } }
function sample(track, t) {                    // linear interpolation between keys; t in seconds
  let i = 0; while (i < track.length - 2 && track[i + 1][0] <= t) i++;
  const a = track[i], b = track[Math.min(i + 1, track.length - 1)], k = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 0;
  return a.map((v, j) => j ? v + (b[j] - v) * Math.min(1, Math.max(0, k)) : v);
}
function drawRig(ctx, rig, anim, t, parts, order) {
  const tt = anim.loop ? t % anim.len : Math.min(t, anim.len);
  for (const name of order) {
    const tr = anim.tracks[name]; if (!tr) continue;
    const [, x, y, rot, sx, sy] = sample(tr, tt), p = parts[name];   // p = {img, sx, sy, sw, sh, px, py} pivot in image
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
    ctx.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, -p.px, -p.py, p.sw, p.sh); ctx.restore();
  }
}
```

Hierarchical bones are unnecessary if the exporter bakes world transforms per key, which the Blender socket export does. Easing can be added per key later.

---

## 6. Recommended architecture and migration plan

### 6.1 Architecture

```
               offline                                   runtime (index.html)
Blender 5.2  --bake.py-->  art/frames/*.png  --pack.py-->  assets/knight/*.png + knight.manifest.js
(knight.py model,            (gitignored)                      |
 actions, sockets)                                             v
                                         loadSprites() -> ImageBitmap pages
                                         tintPage() per colour per match (0.7 ms a page)
                                         drawKnightSprite(e): facing(e) + pose(e) -> frame key
                                            -> body, cloth, cape layers per frame
                                            -> helm, plume, shield, blade on sockets
                                            -> procedural eyes, custard crown, FX on sockets
```

- **One seam:** `KnightRenderer = { proc, cache, sprite }`, chosen by `?r=` or `SET.renderer`, each exposing `prepare(match)` and `draw(e)`. `drawKnight(e)` becomes `R[mode].draw(e)`. Shadows, team rings, `isMine` rings and overhead UI stay outside the seam, because they are shared.
- **Pose from existing state, no new animation state.** Frames are picked from values the simulation already has (`e.walk`, `e.swing / e.swingDur`, `e.charge`, `e.blocking`, `e.stun`, `e.flash`, `G.over && G.winners`, `e.falling`). Rendering stays deterministic and identical for online clients, which already receive these fields.

```js
function pose(e) {                       // returns [anim, phase 0..1]
  if (e.falling > 0) return ['fall', 1 - e.falling / 0.7];
  if (e.stun > 0) return ['stun', (G.clock * 0.75) % 1];
  if (e.swing > 0) return [e.swingKind === 'heavy' ? 'heavy' : 'swing', 1 - e.swing / (e.swingDur || 0.22)];
  if (e.charge > 0) return ['charge', (G.clock * 2) % 1];
  if (e.blocking) return ['block', 0];
  if (e.flash > 0) return ['hit', 0];
  if (G.over && G.winners && G.winners.includes(e)) return ['win', (performance.now() / 1000 * 1.5) % 1];
  if (Math.hypot(e.vx, e.vy) > 30) return ['walk', (e.walk / (Math.PI * 2)) % 1];  // tied to distance: no foot sliding
  return ['idle', ((G.clock + e.id * 0.37) * 0.5) % 1];
}
function drawKnightSprite(e) {           // sketch: called inside today's translate(e.x, e.y) and KV scale
  const M = CK_SPRITES, f = facing(e), [anim, ph] = pose(e), A = M.anims[anim];
  const i = A.loop ? Math.floor(((ph % 1) + 1) % 1 * A.frames) : Math.min(A.frames - 1, Math.floor(ph * A.frames));
  const key = `${anim}/${M.dirs[f.row]}/${i}`, sock = M.sockets[key];
  ctx.save(); ctx.rotate(f.residual * 0.3); ctx.scale((f.mirror ? -1 : 1) / M.scale, 1 / M.scale);
  for (const slot of M.order[key]) {
    const part = partName(e, slot);      // e.g. 'helm' -> 'helm.horned.gold', 'cloth' -> 'cloth'
    const fr = M.frames[`${part}/${key}`] || M.frames[`${part}/${M.dirs[f.row]}`];   // rigid parts: per direction only
    if (!fr) continue;
    const src = M.tint[slot] ? tinted(fr.p, e.color) : PAGES[fr.p], s = M.attach[slot] && sock[M.attach[slot]];
    if (s) { ctx.save(); ctx.translate(s[0] - M.cell / 2, s[1] - M.pivotY); ctx.drawImage(src, fr.x, fr.y, fr.w, fr.h, fr.ox, fr.oy, fr.w, fr.h); ctx.restore(); }
    else ctx.drawImage(src, fr.x, fr.y, fr.w, fr.h, fr.ox - M.cell / 2, fr.oy - M.pivotY, fr.w, fr.h);
  }
  ctx.restore();
  // Unmirrored overlays at mirrored socket positions: blade (drawSword at the exact e.face), eyes on 'visor' for
  // S, SE and E rows, custardCrown on 'head', emblem on 'chest', status FX exactly as today.
}
```

The two snippets above are design sketches and not yet run. The facing and tint code earlier is small enough to trust, and the tint bake was measured.

### 6.2 File formats

| What | Format | Why |
|---|---|---|
| 3D source | `art/blender/knight.py` (procedural build) plus optional `.blend` via Git LFS | the model is code and diffs cleanly; keep binaries out of the Pages repo |
| Intermediate frames | PNG RGBA 8-bit in `art/frames/` (gitignored) | lossless; regenerated in minutes |
| Atlas pages | PNG RGBA, pages of 2048 x 2048 or smaller, `@2x` and `@1x` sets | loads everywhere; flat toon art compresses very well. Lossless WebP is optional and smaller |
| Page metadata | TexturePacker JSON hash | the standard format, readable by Pixi, Phaser and free-tex-packer [43] |
| Runtime manifest | `knight.manifest.js` assigning `window.CK_SPRITES = {...}` | a `<script>` tag works from `file://`, where `fetch()` of JSON does not |

Manifest shape:

```js
window.CK_SPRITES = {
  version: 1, scale: 2, cell: 192, pivotY: 150,
  dirs: ['S', 'SE', 'E', 'NE', 'N'],
  pages: { '2x': ['knight@2x-0.png', 'knight@2x-1.png'], '1x': ['knight@1x-0.png'] },
  tint: { cloth: true, cape: true, plume: true },          // slots multiplied by team colour
  attach: { helm: 'head', plume: 'head', shield: 'offhand', blade: 'hand' },
  anims: { walk: { frames: 8, fps: 12, loop: true }, swing: { frames: 5, fps: 12, loop: false } /* ... */ },
  frames: { 'body.steel/walk/S/0': { p: 0, x: 0, y: 0, w: 46, h: 92, ox: 73, oy: 63 } /* ... */ },
  sockets: { 'walk/S/0': { head: [96, 38, 0.02], hand: [132, 110, -0.4], visor: [96, 52, 0], chest: [96, 96, 0] } },
  order: { 'walk/S/0': ['cape', 'body', 'cloth', 'clothHi', 'shield', 'helm', 'plume'] }
};
```

### 6.3 Folder layout

```
custard-knights/
  index.html                      renderer seam + sprite renderer (inline, no build step)
  assets/
    knight/  knight@2x-*.png  knight@1x-*.png  knight.manifest.js
    chicken/ chicken@2x-*.png chicken.manifest.js
    steve/   ...
  art/
    blender/
      knight.py                   model build (exists)
      bake.py                     directions x frames x layers -> art/frames
      pack.py                     frames -> atlas pages + JSON
      manifest.py                 merge -> assets/*/*.manifest.js, write the 1x set
      layers.json                 which slots each action renders
    frames/                       intermediate PNGs (gitignored)
    lab/                          existing turnaround sheet (serve over http once sprites are on)
  qa/
    run.js                        add ?r= and a p95 frame-time readout to `perf`
    research/sprite-pipeline.md   this document
```

### 6.4 Performance and memory budget

**Per frame at 60 fps (16.7 ms), measured on the slowest target (Steam Deck, or an integrated-GPU laptop in Chrome or Electron):**

| Item | Budget | Basis |
|---|---|---|
| Simulation and bots | 4 ms | measure current |
| Arena and background (cached layers) | 2 ms | |
| **Knights, 8 x sprite stacks** | **1.5 ms** | measured 0.2 ms on desktop for 8 x 8 layers; allows 5x slower hardware plus sockets |
| Procedural overlays (eyes, crowns, status FX) | 1.5 ms | profile `custardCrown`; convert to sprites if it overruns |
| Particles, custard, projectiles | 3 ms | |
| HUD, names, hearts | 1 ms | bitmap text if needed |
| Headroom (GC, compositor) | 3.5 ms | |
| Draw calls | at most 16 `drawImage` per knight, about 400 per frame in total | |

**Memory and download (estimates from trimmed part sizes at 2x):**

| Set | Decoded at 2x | Decoded at 1x |
|---|---|---|
| Body armour, 3 metals x 280 frames (5 directions x 56 frames) | 20 MB | 5 MB |
| Cloth + highlight | 5 MB | 1.2 MB |
| Cape + 5 pattern overlays | 8 MB | 2 MB |
| Helms, plumes, shields, blades | 4.5 MB | 1.1 MB |
| Chickens (6 skins), Steve | 6.5 MB | 1.6 MB |
| **Source total** | **about 44 MB** | **about 11 MB** |
| Tint cache, 8 colours x (cloth, cape, chosen plume) | about 44 MB | about 11 MB |
| PNG download | about 4 to 6 MB | about 1 to 1.5 MB |

**Choosing a set:** `k = scale * devicePixelRatio`, where `scale` is the existing letterbox scale. If `k <= 1.2`, load `@1x`, otherwise `@2x`. Steam Deck (1280 x 800, `k = 1`) gets pixel-perfect 1x. A 1080p laptop (`k = 1.35`) and anything bigger gets 2x.

**Frame counts (12 fps, on twos, which suits the cartoon style):** idle 6, walk 8, dash 4, light swing 5, heavy swing 7, charge 3, block 2, hit 3, stun 4, win 8, fall 6. That is 56 frames per direction.

**Steam Deck context:** RDNA 2 GPU (8 CUs, up to 1.6 TFLOPS), 16 GB LPDDR5 shared, 1280 x 800 screen [31]. The Deck runs the Windows build through Proton unless a Linux build is marked for it [32]. Electron on Proton has been reported working well in fullscreen [34], and tooling exists to ship Pixi or vanilla HTML5 games through Electron with Deck fixes [33].

### 6.5 How to measure

- Extend `node qa/run.js perf` to take `r=proc|cache|sprite` and report p50 and p95 frame time, not just fps. The current run gives 81 to 94 fps with the procedural renderer on the dev PC.
- Add the knight micro-benchmark (the scratchpad `bench.js` from this research) as `qa/bench-knights.js`. It prints milliseconds per knight for each renderer.
- On real hardware, add a `?hud=perf` overlay showing frame time, the p95 of the last 5 seconds, draw-call count and tint-cache MB. Check it on a Steam Deck and an Intel or AMD integrated laptop before switching the default.

### 6.6 Migration plan (playable at every step)

| Step | What ships | Default renderer | Exit check |
|---|---|---|---|
| **0. Seam** | `KnightRenderer` interface, `?r=`, Settings toggle, perf HUD, `qa/run.js perf` with frame times | `proc` | no visual change; perf numbers recorded |
| **1. Cached procedural** (`r=cache`) | At match start, render each knight's procedural drawing into sprite frames: 8 facings x (idle 4, walk 8, swing 5, block 1, hit 1) using today's `drawKnight` on an offscreen canvas. Draw with `facing()` and `pose()`. Crown, eyes and FX stay live | `proc` (try `cache`) | Knight cost drops by about 60x. Proves the atlas, facing, pose and draw code with zero new art. Can become the default if it looks right |
| **2. Blender spike** | One body (steel), cloth, one helm, one plume; idle + walk; 5 directions; `bake.py` + `pack.py` + manifest; sprite renderer draws it; knight lab shows old and new side by side | `proc` or `cache` | Art direction sign-off at game scale (1x and 2x strips in `art/lab`); frame time within budget |
| **3. Full part set** | All helms, plumes, metals, capes and patterns, blades on sockets, tint baker, all 11 animations, 1x and 2x sets | `cache` | Every loadout renders; any loadout with a missing part falls back to `cache` or `proc` for that knight |
| **4. Chickens, Steve, boss, specials** | Chicken skins, Steve riding pose, boss crown, Giant Head and Tiny Town scale checks, Ghost alpha, Disco hue (tint the plume page per frame, or keep Disco plumes procedural) | `sprite` | QA full matrix passes; perf on Deck and an integrated laptop within budget |
| **5. Clean-up** | Keep `proc` behind `?r=proc` for the knight lab and as a fallback; strip unused procedural helpers only when the sprite path has run for a release | `sprite` | |
| **6. Optional Pixi** | Only if effects are the bottleneck: Pixi renderer behind the same seam, `tint` instead of baked pages, local http for QA and Electron | `sprite` | Measured win on the slowest target |

**Rules that keep it playable:**
- Never remove the procedural renderer while the sprite path is incomplete. The fallback is per knight: if `partName()` finds no frames for that loadout, the knight is drawn by `cache` or `proc`.
- Load sprites asynchronously. Until `SPR.ready`, draw `proc`, so a slow download never blocks a match.
- If `CK_SPRITES` is missing (for example the `assets/` folder was not copied), fall back silently to `proc`.
- Online play needs no protocol change, because pose and facing derive from state already sent.

---

## References

1. Esoteric Software, Spine purchase and pricing: https://esotericsoftware.com/spine-purchase
2. Spine Runtimes License Agreement: https://en.esotericsoftware.com/spine-runtimes-license
3. spine-ts README (backends, feature limits): https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/spine-ts/README.md
4. Esoteric blog, "spine-ts: one runtime to serve all your HTML5 needs": http://esotericsoftware.com/blog/spine-ts-released
5. spine-pixi runtime documentation (v8 package, skins, tint black): https://en.esotericsoftware.com/spine-pixi
6. Rive, Canvas vs WebGL2: https://rive.app/docs/runtimes/web/canvas-vs-webgl
7. Rive pricing: https://rive.app/pricing
8. Rive, getting started with the runtimes (MIT licence): https://rive.app/docs/runtimes/getting-started
9. Rive blog, data binding lists, images and artboards: https://rive.app/blog/data-binding-supercharged-lists-images-and-artboards
10. teddy-static issue on Rive WebGL2 vs canvas-lite size: https://github.com/uwmadison-chm/teddy-static/issues/4
11. DragonBones download page: https://dragonbones.github.io/en/download.html
12. DragonBonesJS repository: https://github.com/DragonBones/DragonBonesJS
13. Slant, DragonBones Pro alternatives (discontinuation reports): https://www.slant.co/options/15725/alternatives/~dragonbones-pro-alternatives
14. Spriter Pro on Steam: https://store.steampowered.com/app/332360/Spriter_Pro/
15. PixiJS v8 launch post (Bunnymark CPU and GPU figures, tint inheritance): https://pixijs.com/blog/pixi-v8-launches
16. PixiJS, ParticleContainer in v8 (200k and 1M sprite claims): https://pixijs.com/blog/particlecontainer-v8
17. PixiJS v8 performance tips: https://pixijs.com/8.x/guides/concepts/performance-tips
18. PixiJS Filters, OutlineFilter: https://pixijs.io/filters/docs/OutlineFilter.html
19. Shirajuki, JS game rendering benchmark: https://github.com/Shirajuki/js-game-rendering-benchmark
20. David Rousset, benchmarking sprite animations across devices: https://www.davrous.com/2013/04/26/html5-gaming-benchmarking-your-sprites-animations-to-target-all-devices-browsers/
21. Chrome for Developers, GPU acceleration in the 2D canvas: https://developer.chrome.com/blog/taking-advantage-of-gpu-acceleration-in-the-2d-canvas
22. MDN, Optimising canvas: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
23. MDN, globalCompositeOperation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
24. Mozilla bug 762973, non source-over composite operations slow: https://bugzilla.mozilla.org/show_bug.cgi?id=762973
25. Kevin Schiener, Chrome's willReadFrequently: https://www.schiener.io/2024-08-02/canvas-willreadfrequently
26. MDN, CORS-enabled images and tainted canvases: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image
27. WebGL Fundamentals, cross-origin images: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
28. Web3D Survey, WebGL2 MAX_TEXTURE_SIZE: https://web3dsurvey.com/webgl2/parameters/MAX_TEXTURE_SIZE
29. pvigier, palette swapping with shaders: https://pvigier.github.io/2019/10/06/palette-swapping-with-shaders.html
30. Cyanilux, swapping colours: https://www.cyanilux.com/tutorials/color-swap/
31. Steam Deck tech specs: https://www.steamdeck.com/en/tech
32. Steamworks, Steam Deck and Proton: https://partner.steamgames.com/doc/steamdeck/proton
33. steam-electron-build: https://github.com/alexanderthurn/steam-electron-build
34. Schemescape, porting a browser game to Steam on Linux: https://log.schemescape.com/posts/game-development/web-game-on-steam-for-linux.html
35. Blender 5.0 release notes, Python API: https://developer.blender.org/docs/release_notes/5.0/python_api/
36. Blender 5.1 release notes: https://developer.blender.org/docs/release_notes/5.1/
37. Blender manual, Shader To RGB node: https://docs.blender.org/manual/en/latest/render/shader_nodes/color/shader_to_rgb.html
38. Blender manual, Line Art modifier: https://docs.blender.org/manual/en/latest/grease_pencil/modifiers/generate/line_art.html
39. Artisticrender, Freestyle with EEVEE and Cycles: https://artisticrender.com/a-guide-to-blender-freestyle-rendering-with-eevee-and-cycles/
40. Blender Python API, bpy_extras.object_utils (world_to_camera_view): https://docs.blender.org/api/3.1/bpy_extras.object_utils.html
41. Maghwyn, blender_directional_spritesheets: https://github.com/Maghwyn/blender_directional_spritesheets
42. Yasen Dinkov, Blender sprite renderer: https://yasendinkov.com/posts/sprite-generator/
43. Free Texture Packer (and CLI): https://github.com/odrick/free-tex-packer and https://github.com/odrick/free-tex-packer-cli
44. Game Developer, Dead Cells 3D pipeline for 2D animation: https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-
45. Wikipedia, Hades (pre-rendered 3D characters): https://en.wikipedia.org/wiki/Hades_(video_game)
46. Campaign Creations, StarCraft Editing Bible, sprites and graphical data: https://files.campaigncreations.org/misc/tutorials/starcraft/bible/chap4_a3images.shtml
47. Knight Squad on Steam: https://store.steampowered.com/app/294000/Knight_Squad/
48. Xbox Tavern, Knight Squad 2 review: https://www.xboxtavern.com/knight-squad-2-review/
49. Headless Blender toolkit (EEVEE in background mode): https://github.com/AleBrito124356/blender-python-toolkit
50. Blender 5.0 release notes, EEVEE and Viewport: https://developer.blender.org/docs/release_notes/5.0/eevee/

51. Mozilla bug 1402711, canvas drawImage fails at 16384 x 16384: https://bugzilla.mozilla.org/show_bug.cgi?id=1402711
52. Example commercial 8-direction knight sprite pack: https://gegx.itch.io/knight-hero-128

Measured sizes came from jsDelivr on 26 September 2026: `pixi.js@8/dist/pixi.min.js`, `@esotericsoftware/spine-canvas@4.2`, `spine-webgl@4.2`, `spine-pixi-v8@4.2` (IIFE min builds), `@rive-app/canvas-lite`, `@rive-app/canvas` and `@rive-app/webgl2` (`rive.js` and `rive.wasm`). npm latest versions on the same day: pixi.js 8.21.0, spine-pixi-v8 4.3.13, @rive-app/canvas-lite 2.43.1, pixi-filters 6.1.5.
