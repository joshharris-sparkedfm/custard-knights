# AI in the Custard Knights art pipeline

Research note, 26 September 2026. Scope: what AI can and cannot do for a cartoon, top-down, 8-player party brawler with customisable knights, built in Canvas 2D and headed for Steam Early Access, using the tools already on Josh's RTX 5090 PC and the paid services he holds. Nothing was generated and no credits were spent while writing this. Model lists and prices in section 5 were read live from the Higgsfield and OpenArt connectors on 26 September 2026.

Numbers in square brackets point to the references at the end.

---

## Executive summary

1. **Do not ship AI pixels for the knights.** AI still cannot hold one character perfectly steady across 8 directions, dozens of animation frames and thousands of part combinations. Specialist tools admit that even their best output needs curating and repainting [15][16], and the one game that shipped inconsistent AI characters in 2026 (Vapor World) went to 25 to 36% positive on Steam [48][49].
2. **The knights are already code-drawn, and that is the consistency answer.** `CK.drawKnight` renders every helm, plume, metal, emblem, colour, cape and blade combination from the same code, in 8 directions and every state (`art/lab/sheet.js`). Keep that architecture: separate parts, fixed draw order, colour applied at runtime. Upgrade the drawing, not the system.
3. **The best route to a "brilliant animated cartoon" look on this PC is 3D to 2D.** Build modular knight parts in Blender, animate one rig, toon-shade and outline, render each part as its own layer in 8 (or 5 plus mirrored) directions, then composite and recolour in Canvas. Dead Cells shipped this way with one artist [36], and the tooling for it is mature [37][38][39][40].
4. **Where AI earns its keep is pre-production:** style exploration, colour scripts, turnaround reference sheets for modelling, blockout reference meshes and animation timing reference. Valve says its disclosure is about content that "ships with your game and is consumed by players", and it has exempted efficiency tools since January 2026 [42][44][45].
5. **Best local models for that work are all Apache 2.0 or MIT:** Qwen-Image 2512 (already wired into `art/concepts/gen.py`), Qwen-Image-Edit-2511 for multi-angle turnarounds, FLUX.1 schnell, FLUX.2 klein 4B, Z-Image-Turbo, Wan 2.2 for motion reference, TRELLIS.2 for reference meshes, UniRig for rig tests, BiRefNet for cut-outs [3][4][7][8][9][10][28][32].
6. **Keep FLUX.1 dev, FLUX.1 Kontext dev, JuggernautXL and RMBG-2.0 out of anything commercial.** FLUX.1 dev's licence (v2.0, 25 November 2025) says outputs may be used commercially but only allows the model itself to be run for non-commercial purposes; a commercial entity may only test and evaluate "in a non-production environment" [1]. RMBG-2.0 is non-commercial [26]. Juggernaut adds RunDiffusion's own restrictions [6]. The photoreal SDXL checkpoints are the wrong style anyway.
7. **Hunyuan3D open weights are not licensed in the UK.** The licence territory excludes the EU, the UK and South Korea [29][30]. Use TRELLIS.2 (MIT) locally instead. Hosted Hunyuan3D v3 on Higgsfield sits under Higgsfield's terms, but check the upstream position before relying on it.
8. **Paid services allow commercial use of outputs** (Higgsfield on every plan [55], OpenArt from Plus upwards [57], Scenario [58], Leonardo on paid plans [61], Firefly with indemnity only on qualifying enterprise plans and only for Firefly's own models and named GA partner models [59][60]). But pure AI output has no copyright in the US [62], and the UK is moving to remove its computer-generated-works protection [63], so anything AI-made that ships is effectively unprotectable.
9. **Reputation is the real risk, not the law.** About one in five new Steam releases now carries an AI disclosure [46]; a 2025 analysis found disclosed AI cut review counts by about 53% with more negative sentiment [47]; Clair Obscur lost its Indie Game Awards over placeholder textures [51]; Larian dropped AI concept art after backlash [52][53]. A charming party game lives on streamer and press goodwill, so "no AI in anything players see" is the recommended stance.
10. **Budget reality:** Higgsfield has 3.22 credits left on Ultra (a 500-credit top-up is $29.41), OpenArt has 40 credits (enough for 1 to 4 images, no video). Nothing in the recommended pipeline needs either; the local 5090 does all of it for the cost of electricity.

---

## 1. AI for 2D game character art: what works and what is hype

### 1.1 The consistency problem, stated plainly

A shippable game character needs the same proportions, silhouette, line weight, palette and details in every direction and every frame. General image models generate each image independently, so small things drift: the number of rivets, the side the emblem sits on, the thickness of the outline, the exact red. The FreeGameSprites 2026 round-up puts it bluntly: "Your knight's idle frame and walk frame look like they belong to different games", and concludes that the realistic workflow is generate, curate, then repaint by hand, saving roughly 60% of time rather than replacing the artist [16]. Ludo's own September 2026 comparison of seven sprite tools lists consistency and custom-style limits for almost every product [15].

For Custard Knights the problem is multiplied. Six helms, five plume types, several metals, emblems, colours, cape patterns, five blade skins and chicken forms produce thousands of combinations. No generative approach renders thousands of combinations identically. Only a parts-based system does, which is what the game already has.

### 1.2 Techniques and where each stands in 2026

| Technique | What it does | Honest verdict for this game |
|---|---|---|
| Style LoRA (FLUX, SDXL, Qwen, Z-Image) | Trains a small adapter on 20 to 50 images of one art style so every output matches it. Typical recipe: 12 to 20 images for a character, about 50 varied subjects for a style, rank 16, 1,000 to 2,000 steps [14]. | Good for locking a *concept* style once you have 30 or more hand-made images to train on. Does not fix frame-to-frame drift. Train only on Apache or MIT bases (see section 4). |
| Character LoRA | Same, but for one character. | Useful for marketing-style illustrations of a mascot. Useless for 8 directions of a 64 px sprite. |
| IP-Adapter / reference latents | Feeds a reference image into generation. FLUX Kontext uses a `ReferenceLatent` node chain in ComfyUI [13]. | Works for "same character, new pose" at illustration scale. Kontext dev carries the FLUX dev non-commercial licence, so avoid it [2]. |
| Instruction editing models | Qwen-Image-Edit-2511 (Apache 2.0, December 2025) accepts up to three reference images, reduces drift over 2509 and adds multi-angle views from one reference [10]. A community multiple-angles LoRA rotates a character with camera controls [11]. | The strongest local tool for **turnaround reference sheets** you then model or draw from. Output is still "nearly the same", not identical. |
| Character-sheet workflows | Consistent Character Creator 3.8 on Qwen-Image-Edit-2511 (turnarounds, expressions, dataset export) [12]; VNCCS character workflow on Qwen Image plus SeedVR2 [12]. | Good reference generators. They are built for human faces, not chunky knights, so expect prompt work. |
| Specialist sprite tools | Retro Diffusion (grid-true pixel art, $0.015 to $0.18 per image), PixelLab (4 and 8-direction rotation, skeleton animation, from about $12 a month), Scenario (custom style training from $45 a month), Ludo (sprites plus animation from 600 motion presets, $20 to $50 a month), Layer.ai (studio volume, usage billing), AutoSprite, Sprite AI, God Mode AI [15][17][18][19]. | Almost all are built around **pixel art**. Custard Knights is a smooth cel-shaded cartoon, so the best of these (Retro Diffusion, PixelLab) do not fit the look. Scenario's custom training is the closest fit but still produces drift across frames. |
| Higgsfield AutoSprite | Listed in the Higgsfield connector as `autosprite`: turns one character image into a sprite sheet (idle, walk, run, attack, jump, custom, plus five isometric directions), 2 to 64 frames at 32 to 512 px, turbo/pro/max tiers, optional background removal. | Worth one paid test on a *finished* hand-made knight to see if it gives useful animation reference. Not a production path: it animates one flattened image, so it cannot respect the part layers or customisation. |

**2026 entrants worth knowing:** Qwen-Image 2512 (31 December 2025, Apache 2.0) is the strongest open model for clean flat illustration and is what `gen.py` already uses [9]. FLUX.2 klein 4B is Apache 2.0, runs in about 13 GB and supports multi-reference editing [4]. Z-Image-Turbo (6B, Apache 2.0, November 2025) is very fast [8]. On the closed side, Gamelabs Studio, Sorceress Auto-Sprite v2 and Sprite AI all chain an image model into a video model into background removal [20][21].

### 1.3 What actually works versus hype

- **Works:** rapid style exploration (hundreds of variations of "cel-shaded chibi knight, custard crown" in an afternoon), colour and palette studies, prop and arena mood boards, turnaround sheets as modelling reference, and upscaling or cleaning your own renders.
- **Partly works:** generating a single hero illustration for a pitch deck (with repainting), and generating 4 or 8 directions of a *simple* pixel-art character in PixelLab.
- **Hype:** "prompt to finished, consistent, animated, 8-direction sprite sheet". Every vendor demo uses one hero character, one or two directions and a short loop. None shows 40 customisation parts that must line up frame by frame.

---

## 2. AI for animating game characters

### 2.1 Video models

The frontier image-to-video models (Seedance 2.0 and 2.5, Kling 3.0, Veo 3.1, Wan 2.7 and 3.0, MiniMax H3, Gemini Omni) are all available through Higgsfield and OpenArt (section 5). They are very good at making a single illustration move. The 2026 sprite tools use them this way: generate a character, animate it with Wan 2.7 or Kling 3.0 image-to-video, then strip the background and align frames [21].

Problems for a top-down brawler (my assessment from the tool behaviour, consistent with the Vapor World reviews [48][49]):

- They are trained mostly on eye-level footage. A steep top-down three-quarter camera held perfectly still is not what they want to produce; many add drift, parallax or camera moves.
- Details morph between frames (plume shape, emblem, number of fingers). At 64 to 128 px on screen this reads as shimmer.
- Loops rarely close cleanly. The first and last frame of a walk cycle must match exactly.
- Timing is naturalistic, not snappy. Cartoon brawlers need held anticipation frames and smears, which you key by hand.

**Pose-conditioned generation.** ControlNet OpenPose and DWPose (via the ComfyUI `comfyui_controlnet_aux` preprocessors) still help pose a single keyframe. AnimateDiff, the SD 1.5 and SDXL era motion module, has largely been overtaken by Wan. The current open leader is **Wan 2.2 Animate** (native in ComfyUI since September 2025, V2 since): one reference image plus a driving pose video gives an identity-preserving animation [22][23]. This is the right local tool if you want to film yourself doing a sword swing and see it on a knight as **timing reference**. Wan 2.2 is Apache 2.0 [7].

### 2.2 Frame interpolation

Flow-based interpolators (RIFE, FILM) fail on cartoons because of big non-linear motion and flat colour areas. ToonCrafter (SIGGRAPH Asia 2024) is the cartoon-specific generative interpolator, but tops out at 16 frames at 512x320 [24]. Newer research (motion-aware generative interpolation, January 2025) improves on it but is research code [25]. For sprites the better answer is to render in-betweens from the 3D rig, where they are free and exact.

### 2.3 Transparent backgrounds

Image and video models do not output real alpha. Tools work around this by generating on a flat chroma colour and keying, which leaves fringing, stray pixels and damaged soft edges that need manual threshold and edge tuning [20]. Background removal models:

- **BiRefNet:** original weights MIT, good quality, available through the ComfyUI-RMBG node pack [26][27]. Safe to use.
- **RMBG-2.0 (BRIA):** built on BiRefNet but the checkpoint is **non-commercial only**; commercial use needs a BRIA agreement [26]. The same ComfyUI node pack offers it, so pick BiRefNet deliberately.
- **Higgsfield Image and Video Background Remover, SAM 3 video:** listed in the connector; fine for marketing tests.

**Verdict:** AI video output is not clean enough for a production sprite sheet with transparency in a cel-shaded style. A 3D render with a real alpha channel is.

---

## 3. Image-to-3D, auto-rigging and 3D-to-2D rendering

### 3.1 Image-to-3D models

| Model | Licence and access | Notes |
|---|---|---|
| **TRELLIS.2** (Microsoft, December 2025) | MIT, open weights, self-host [28] | 4B parameters, single image to PBR GLB at 512 to 1536 resolution. "Best quality-to-freedom ratio" and "zero commercial ambiguity" per Cinevva [30]. NVIDIA nvdiffrast and nvdiffrec dependencies carry their own licences. On an RTX 5090 (Blackwell) expect to need CUDA 12.8 or newer builds of its dependencies. |
| **Hunyuan3D 2.1** (Tencent) | Open weights, but the licence **does not apply in the EU, UK or South Korea** [29] | Strongest open texturing stack and the most detail at high settings [31], but not usable by a UK developer under that licence. |
| **Hunyuan3D v3 / v3.1** | Hosted (Higgsfield `hunyuan3d_v3_image_to_3d`, text variant) | Up to 1.5M faces, LowPoly and Geometry-only modes. Hosted use falls under Higgsfield's terms. |
| **Meshy 5 / 6 / 7** | Hosted (Higgsfield `meshy_v7_image_to_3d`, multi-image, remesh, retexture, rigging) | Free tier output is CC BY 4.0, paid is private [30]. Quad remesh, low-poly mode, A-pose or T-pose output, rigging to a Mixamo-style skeleton and a 678-clip animation library (the connector lists sword attacks such as `Sword_Judgment` id 102 and parries ids 147 to 155). |
| **Tripo H3.1** | Hosted (Higgsfield `tripo_h3_1_image_to_3d`, multiview, text) | Free tier non-commercial, paid commercial [30]. Quad option, rigging for seven creature types. |
| **SAM 3 3D Objects / 3D Body** (Meta) | Hosted (Higgsfield) | Lifts one object or body from a photo. More useful for props than stylised characters. |
| **Rodin / Hyper3D Gen-2** | Hosted, $30 to $120 a month | Sculpt-level detail; Cinevva rates it less suited to cartoon styles [30]. |

**What Higgsfield's `generate_3d` uses:** the connector's 3D list on 26 September 2026 contains Meshy (image, multi-image, v6 text, v7 image, remesh, retexture, rigging), Tripo H3.1 (image, multiview, text), Tencent Hunyuan3D v3 (image) and v3.1 (text), and Meta SAM 3 (3D Objects and 3D Body). The connector does not publish per-model 3D prices.

**Honest verdict:** image-to-3D gives a lumpy, over-detailed, triangle-soup mesh with baked lighting in the texture. For a chunky chibi knight with a clean silhouette, hand box-modelling in Blender is faster than cleaning a generated mesh. Use generated meshes as **blockout reference** only (volume and proportion checks in the viewport), then model over them.

### 3.2 Auto-rigging

- **Mixamo:** free, humanoid only, dated animations; prototypes only [33][34].
- **Reallusion AccuRIG 2.0 (2025):** free, strongest Mixamo replacement for humanoids, but fussy about scale and orientation [33][34].
- **Tripo and Meshy rigging:** one click, Meshy rigging and its motion presets cost zero credits on Meshy's own plans [35]. Tripo handles stylised and non-humanoid shapes well but over-smooths shoulders; Meshy's hip weights misbehave with foot IK [33].
- **UniRig (SIGGRAPH 2025):** MIT, self-hosted, predicts skeleton and skin weights for arbitrary meshes including birds and quadrupeds [32]. The chicken form is a natural test case.
- **Cascadeur:** physics-assisted posing for hand-keyed animation, not a mesh-to-rig generator [33].

No auto-rigger handles capes, plumes or a wobbling custard dollop; the May 2026 showdown concludes secondary motion and art-directed animation remain manual [33]. Chibi proportions (big head, short limbs) also retarget badly from human mocap. **Recommendation:** rig one knight by hand in Blender (Rigify or a simple custom rig, about a day), use AccuRIG or Mixamo clips only as timing reference, and keep the custard wobble procedural in the game code where it already lives.

### 3.3 Toon rendering in Blender 5.2 to 2D sprites

- **Shading:** Eevee with Shader to RGB into a two or three-step colour ramp gives controllable cel bands; the Toon BSDF also exists but is Cycles-only and less controllable [38][39].
- **Outlines, three options:**
  - *Inverted hull* (Solidify modifier, flipped normals, backface culling, outline material). Cheapest, real-time in Eevee, consistent thickness in world space [39].
  - *Line Art modifier* on Grease Pencil (v3 since Blender 4.3). Detects silhouettes, creases and material borders and can produce filled shapes [37]. Highest quality lines, slow per frame on the CPU.
  - *Freestyle.* Works in Eevee and Cycles, flexible line styles, slowest.
  - **For sprites that end up 64 to 128 px tall**, a fourth option is often best: render colour plus an object or material ID pass, then draw the outline at the *final* pixel size, either in the Blender compositor after downscaling or in Canvas at runtime. Outlines rendered at 4x and scaled down go thin and grey.
- **Directions:** render 8 directions from a camera rig around the character, or render 5 (S, SE, E, NE, N) and mirror 3. Mirroring swaps the sword hand and flips the shield emblem, so check it reads correctly. Ready-made tools include the "Render 8 Directions" add-on and several itch.io sprite-sheet add-ons [40][41].
- **Layers for customisation:** put each part (body and tabard, cape, each helm, each plume, shield, each blade) in its own collection and render each as its own view layer with the other parts set to holdout. The occlusion is then baked into each layer, so the game can stack layers in a fixed order and always get the right overlap.
- **Recolouring:** render mask passes (AOVs or Cryptomatte) for team colour, metal and emblem areas, and tint in Canvas (`globalCompositeOperation = 'source-atop'` or `'multiply'`). Pre-bake each player's knight into an offscreen canvas atlas when they change outfit, so a match draws 8 cached sprites, not 8 stacks of layers.

### 3.4 Small studios doing 3D to 2D

- **Dead Cells (Motion Twin):** most animations are 3D pre-rendered with a pixel shader; frames exported with normal maps for toon lighting; reusing rigs and parts "spares hundreds of hours" and let a single artist ship [36].
- **Kalia and the Fire Staff (January 2025 devlog):** a solo developer moving to a Blender 3D-to-2D sprite pipeline because it made asset creation "quicker and more pleasant" [41].
- The classic precedents (pre-rendered Diablo II and StarCraft units) used the same idea: model once, render many angles.

---

## 4. Licences and Steam

### 4.1 Model licences (local)

| Model on this PC | Licence | Can outputs go in a commercial game? |
|---|---|---|
| FLUX.1 dev fp8 | FLUX [dev] Non-Commercial Licence v2.0 (25 November 2025) [1] | The licence says "You may use Output for any purpose (including for commercial purposes)", but running the model is limited to non-commercial purposes, and use by a for-profit entity only for "testing, evaluation, or non-commercial research and development in a non-production environment" [1]. Version 1.1 (June 2025) had removed the explicit commercial-outputs line and caused confusion [2]. **Treat it as non-commercial; buy a BFL licence if you ever want it in production.** FLUX.1 Kontext dev is under the same terms. |
| FLUX.1 schnell fp8 | Apache 2.0 [3] | Yes. |
| JuggernautXL v8 | CreativeML OpenRAIL-M plus RunDiffusion terms; no API or service deployment without a licence [6] | Outputs for your own use are generally accepted, but the terms are custom and the style is photoreal. Not worth the ambiguity. |
| RealVisXL V5, DreamShaperXL Turbo | SDXL fine-tunes inheriting CreativeML OpenRAIL++-M use restrictions [5] | Yes, subject to the use restrictions. Wrong style for this game. |
| Qwen-Image 2512 | Apache 2.0 [9] | Yes. Already used in `gen.py`. |
| Qwen-Image-Edit-2511 | Apache 2.0 [10] | Yes. Recommended addition. |
| FLUX.2 klein 4B | Apache 2.0 [4] | Yes. (Check the larger klein variants separately; only 4B is confirmed Apache here.) |
| Z-Image-Turbo | Apache 2.0 [8] | Yes. |
| Wan 2.1 and 2.2 | Apache 2.0 [7] | Yes. Keep the licence notice with any redistribution. |
| TRELLIS.2 | MIT (plus NVIDIA dependency terms) [28] | Yes. |
| Hunyuan3D 2.x open weights | Tencent community licence excluding EU, UK, South Korea [29] | **No, not from the UK.** |
| BiRefNet | MIT [26] | Yes. |
| RMBG-2.0 | Non-commercial [26] | **No** without a BRIA agreement. |
| UniRig | MIT [32] | Yes. |

### 4.2 Paid services

- **Higgsfield:** does not claim ownership of inputs or outputs; commercial use allowed on every plan with no separate licence; Higgsfield may train on your content unless you delete it (enterprise excluded); you may not use outputs to train or distil a model without permission [55]. Its July 2026 terms change drew criticism for a broad licence back to Higgsfield, which it then revised [56]. Upstream model terms (Meshy, Tripo, Tencent) may still apply to hosted third-party models.
- **OpenArt:** makes no ownership claim; commercial use of outputs requires the Plus plan or higher [57]. Confirm which plan the account is on before using any output commercially.
- **Adobe Firefly:** Firefly's own models are trained on licensed and public-domain content and marketed as commercially safe; IP indemnity applies to qualifying (mainly enterprise) plans [59]. Partner models (Google, OpenAI and others) inside Firefly are *not* covered by Firefly indemnity; only named GA Google and OpenAI models in Firefly Creative Production for Enterprise get a narrower copyright-only indemnity [60].
- **Scenario:** you own generated assets and can use them commercially; you are responsible for rights in any training data for custom models; self-serve content may be used to improve Scenario's services [58].
- **Leonardo:** full ownership and commercial use on paid plans; free-tier content is public and Leonardo keeps rights in public images [61].
- **Canva:** not researched in depth here; its generate-image and background-removal tools are available through the connector, but check Canva's AI product terms before using output in the game.

### 4.3 Copyright of AI output

The US Copyright Office's January 2025 report confirms that purely AI-generated material is not copyrightable, and that prompts alone, however detailed, do not make you the author; human selection, arrangement and modification can be protected case by case [62][64]. The UK's section 9(3) CDPA currently gives computer-generated works a form of protection, but the government's 2026 report signalled that protection should be removed [63]. Practical effect: an AI-made knight could be copied by anyone. Hand-made knights, even if informed by AI references, are yours.

### 4.4 Steam's AI disclosure

- Since January 2024 the Content Survey asks about **pre-generated** content ("any kind of content that ships with your game and is consumed by players that is created with the help of AI tools during development") and **live-generated** content (created while the game runs, which also needs a description of guardrails) [42]. Much of the disclosure is shown on the store page [64].
- On 16 January 2026 Valve clarified that "efficiency gains through the use of these tools is not the focus of this section": code assistants and other development tools are exempt, and the focus is content players consume, "artwork, sound, narrative, localization" [42][44][45].
- Commentators read this as exempting concept art used only as reference and never shipped [44]. Valve's own wording supports that reading, but it is an interpretation, not an explicit Valve list.
- Store page art, capsules and trailers: Valve's text does not spell this out [42], but the store page must be consistent with the game and disclosure summaries treat marketing material as in scope [64]. **Treat any AI in the capsule, screenshots or trailer as disclosable.**
- Custard Knights has no live generation, so only the pre-generated question applies.

### 4.5 How players and press reacted, 2025 to 2026

- **Volume:** around 8,000 Steam games disclosed AI in the first half of 2025 against about 1,000 in all of 2024, and by 2026 roughly one in five new releases carries a disclosure [46].
- **Effect on reviews:** an analysis reported by PC Gamer found "AI stigma" cut the number of reviews a game gets by about 53%, with more negative reviews [47].
- **Vapor World: Over The Mind** (August 2026) had over 100,000 wishlists; AI-animated cutscenes with an inconsistent main character drove it to 25 to 36% positive, and the studio pulled the cutscenes [48][49].
- **Clair Obscur: Expedition 33** lost its Indie Game Awards (December 2025) because AI placeholder textures had briefly shipped [51].
- **Larian** said in January 2026 it would stop using generative AI for Divinity concept art after a backlash to its exploratory use [52][53].
- **False accusations cut both ways:** Shrine's Legacy (October 2025) was review-bombed for AI it says it never used [50]. A clean, documented, hand-made pipeline is also a defence.
- **Counter-view:** Tim Sweeney argued in November 2025 that store AI labels "make no sense" because AI will be in nearly all production [54]. Players have not come round to that view.

For a small indie party game whose pitch is charm, the risk is asymmetric: AI saves a few weeks of art time but can cost half the reviews and most of the streamer goodwill.

---

## 5. What is available right now (live connector check, 26 September 2026)

Method: `models_explore` (image, video, 3D lists), `balance`, `transactions` (last 300 spends, to get real per-job costs, since `models_explore` does not publish prices) and `show_plans_and_credits` on Higgsfield; `openart_model_list` and `openart_model_cost` on OpenArt. No generation calls were made.

- **Higgsfield:** Ultra plan, **3.22 credits** left. Top-ups: 500 credits $29.41, 1,000 $55.56, 2,000 $105.26, 4,000 $210.53, so one credit is about $0.053 to $0.059. Top-up credits expire after 90 days. Free-trial "unlimited" generations are not available on this account.
- **OpenArt:** **40 credits**. Every video mode is unaffordable at that balance; only images are.
- **Adobe Firefly:** the Adobe for Creativity connector needs authentication in this session, so its model list was not read.
- **Canva:** has `generate-image` and `remove-background` tools but no model or cost listing.

The full model and cost table follows section 6.

---

## 6. Recommendation for Custard Knights

### 6.1 Split of work

| Job | AI? | Tool on this PC | Ships? |
|---|---|---|---|
| Style exploration, mood boards, colour scripts | **Yes** | Qwen-Image 2512 via `gen.py`; FLUX.1 schnell and Z-Image-Turbo for fast variations; FLUX.2 klein 4B for multi-reference edits | No (reference only) |
| Knight turnaround reference (front, side, back, top-down three-quarter) | **Yes** | Qwen-Image-Edit-2511 plus the multiple-angles LoRA, seeded from a hand-drawn or current in-game knight | No |
| Part designs (6 helms, plumes, capes, blades, chicken forms) | Assist | Generate 20 to 50 thumbnails per part type, pick, then draw the final by hand | Only the hand-drawn version |
| 3D base meshes | Reference only | TRELLIS.2 local (MIT) for a volume check; model the real mesh by hand over it | No |
| Rig | No | Blender Rigify or a small custom rig; UniRig for a quick chicken test | Hand-made |
| Animation | Reference only | Film yourself, or Wan 2.2 Animate for timing reference; key the actual animation by hand in Blender; AccuRIG or Mixamo clips as timing reference | Hand-keyed |
| Toon render to sprite layers | No AI needed | Blender 5.2 Eevee, Shader to RGB bands, ID pass for runtime outlines, per-part view layers with holdouts, mask AOVs for recolour, 8 directions (or 5 plus mirror) | Yes, fully hand-made pipeline |
| Custard wobble, cape flutter, squash and stretch | No | Keep procedural in Canvas code | Yes |
| Arena props and tiles | Assist | AI mood boards only; build props in Blender with the same toon setup | Hand-made |
| Background removal on your own renders | Not needed | Render with real alpha. If ever needed, BiRefNet, never RMBG-2.0 | n/a |
| Store capsule, key art, trailer | No | Hand-made from in-game renders; After Effects scripted | Yes, hand-made |

### 6.2 Keeping all 8 knights and every part perfectly consistent

1. **One source of truth per part.** Each helm, plume, cape, blade and emblem exists once, as a Blender asset (or a hand-drawn vector part), never as a generated image.
2. **One rig, one set of animations.** Every knight uses the same skeleton and actions; parts are parented to fixed bones (helm to head, plume to a helm socket, blade to hand).
3. **Render every part through every action and direction with the same camera, lighting and outline settings**, driven by one Python script so nothing is set by hand per render.
4. **Occlusion baked per layer** with holdouts, so layer order in Canvas is fixed and always correct.
5. **Colour is data, not pixels.** Mask channels for team colour, metal tint and emblem; the game tints at runtime. This is how 8 players with free colour choice all stay on-model.
6. **Atlas cache per player.** When a player changes outfit, composite their layers once into an offscreen canvas atlas.
7. **Automated QA.** Extend `art/lab/render.py` so it renders every part combination the unlock track can produce (or a random sample of a few hundred) into contact sheets, and add a pixel-diff check that fails when a part's anchor point drifts between frames.
8. **A written style sheet:** outline width in final pixels, shadow band count and angle, palette hex values per metal, silhouette rules for each helm type so they read at 64 px.

### 6.3 Staged plan

1. **Week 1:** style exploration with the existing `gen.py` (Qwen-Image 2512). Pick one direction; write the style sheet.
2. **Week 2:** model one knight (body, one helm, one plume, cape, shield, sword) and rig it. Set up Eevee toon shading and the render script for 5 directions and three actions (idle, walk, swing).
3. **Week 3:** load the layers into a copy of the Canvas renderer and compare side by side with the current code-drawn knight using `art/lab/render.py`. Go or no-go on the 3D-to-2D route.
4. **If go:** build out the remaining parts and actions. **If no-go:** keep the procedural renderer and raise its quality with hand-authored vector parts (Path2D) drawn from the AI-explored style.

### 6.4 Staying safe on licences and Steam

- **Allow-list for anything that feeds the game:** Qwen-Image 2512, Qwen-Image-Edit-2511, FLUX.1 schnell, FLUX.2 klein 4B, Z-Image-Turbo, Wan 2.1 and 2.2, TRELLIS.2, UniRig, BiRefNet. **Block-list:** FLUX.1 dev, FLUX.1 Kontext dev, JuggernautXL, RMBG-2.0, Hunyuan3D open weights. `gen.py` already follows this for concepts.
- **Keep a provenance log** (one line per asset: file, how it was made, tools, models, whether AI output survives in the shipped file). This answers the Steam survey honestly, protects against false accusations [50] and supports a copyright claim on the hand-made work.
- **Target a clean "no" on the Steam pre-generated question:** AI used only for internal reference that never ships. If any AI pixel, texture, mesh or sound does ship, tick the box and describe it precisely (for example "AI tools were used to create early reference images; all in-game art was modelled and drawn by hand"), because a discovered but undisclosed use is far worse than a disclosed small one [51].
- **Never use AI in the capsule, store screenshots or trailer.**
- **Do not upload unreleased key art to services that train on your content** (Higgsfield, Scenario self-serve) unless you accept that [55][58].

---

## Available models and costs (26 September 2026)

Higgsfield costs are the real charges seen in the account's transaction history (16 to 25 September 2026); ranges reflect different resolution and quality settings. Dollar figures use about $0.055 per credit (the top-up rate). OpenArt costs are the connector's default-configuration quotes. Local models cost only electricity.

| Service | Model (connector id) | Type | Cost per job | Approx $ | Fit for Custard Knights |
|---|---|---|---|---|---|
| Higgsfield | GPT Image 2.5 Flare (`gpt_image_2_5`) | Image | 0.25 to 4.5 credits | $0.01 to $0.25 | Style boards; has a transparent-background option |
| Higgsfield | GPT Image 2 (`gpt_image_2`) | Image | 6.5 credits | $0.36 | Style boards |
| Higgsfield | Nano Banana Pro (`nano_banana_pro`) | Image | 2 credits | $0.11 | Reference-image edits, turnarounds |
| Higgsfield | Recraft V4.1 (`recraft_v4_1`) | Image, vector | 8 to 10 credits | $0.45 to $0.55 | Flat vector part ideas, palette-locked |
| Higgsfield | Cinema Studio Image 2.5 | Image | 2 credits | $0.11 | Not a fit |
| Higgsfield | Bytedance Image Upscale | Image upscale | 2 credits | $0.11 | Marketing only |
| Higgsfield | Nano Banana 2, Seedream 4.5 / 5, FLUX.2, Flux Kontext, Kling O1 Image, Grok Image, Z Image, Soul 2.0 | Image | Not published; no spend history | n/a | Price-check in the web app first |
| Higgsfield | AutoSprite Animation (`autosprite`) | Image to sprite sheet | Not published; turbo cheapest, max dearest | n/a | One test on a finished knight, reference only |
| Higgsfield | Veo 3.1 Lite (`veo3_1_lite`) | Video | 9 credits per clip | $0.50 | Cheapest motion reference |
| Higgsfield | Kling v3.0 (`kling3_0`) | Video | 10.5 credits per clip | $0.58 | Motion reference |
| Higgsfield | Seedance 2.5 (`seedance_2_5`) | Video | 26 to 54 credits (typically 42) | $1.43 to $2.97 | Trailer tests only |
| Higgsfield | Seedance 2.0 (`seedance_2_0`) | Video | 45 to 108 credits (typically 72) | $2.48 to $5.94 | Not needed |
| Higgsfield | FLUX 3 Video (`flux_3_video`) | Video | 45 credits | $2.48 | Not needed |
| Higgsfield | Cinema Studio Video 3.0 | Video | 80 credits | $4.40 | Not needed |
| Higgsfield | Wan 2.6 / 2.7 / 3.0, MiniMax H3, Grok Video, Gemini Omni, Kling 3.0 Turbo | Video | Not published; no spend history | n/a | Wan runs locally for free instead |
| Higgsfield | Meshy 7 Image to 3D, Meshy multi-image, remesh, retexture, rigging; Tripo H3.1; Hunyuan3D v3 / v3.1; SAM 3 3D | 3D | Not published; no spend history | n/a | Blockout reference only; TRELLIS.2 locally is free |
| OpenArt | Kling 3 Omni | Image | 10 credits | n/a | Cheapest image |
| OpenArt | Nano Banana 2 Lite; Seedream 4.5; Seedream 5 Lite; Wan 2.7 Image (pro, 4K) | Image | 15 credits each (Wan standard 6) | n/a | Seedream is listed as strong at 2D animation styling |
| OpenArt | Nano Banana 2 | Image | 20 credits | n/a | Reference edits |
| OpenArt | Grok Imagine Image 2.0 | Image | 26 (text) / 33 (edit) credits | n/a | Edits |
| OpenArt | Seedream 5 Pro | Image | 30 credits (1K) | n/a | Stylised quality |
| OpenArt | Nano Banana Pro; GPT Image 2; GPT Image 2.5 Flare / Sunburst | Image | 40 credits (42 for edits, unaffordable) | n/a | Uses the whole balance |
| OpenArt | PixVerse V6 (540p, 5 s) | Video | 50 credits | n/a | Unaffordable |
| OpenArt | Wan 3.0 (480p, 5 s); MiniMax H3 Max Turbo | Video | 100; 75 credits | n/a | Unaffordable |
| OpenArt | Veo 3.1 (4 s); Wan 2.7 (720p, 5 s); MiniMax H3 Max | Video | 120; 125; 125 credits | n/a | Unaffordable |
| OpenArt | Kling 3.0 / 3 Omni (5 s) | Video | 175 credits | n/a | Unaffordable |
| OpenArt | Seedance 2.0 Mini / 2.5 / 2.0 Fast / 2.0 | Video | 200 / 300 / 350 / 400 credits | n/a | Unaffordable |
| OpenArt | Gemini Omni Flash and 1.1; Grok Imagine 1.5; MiniMax H3 | Video | 250; 400 to 405; 450 credits | n/a | Unaffordable |
| Local | Qwen-Image 2512 fp8 | Image | Free | $0 | **Primary concept model (Apache 2.0)** |
| Local | Qwen-Image-Edit-2511 (to install) | Image edit | Free | $0 | **Turnarounds (Apache 2.0)** |
| Local | FLUX.1 schnell fp8; Z-Image-Turbo; FLUX.2 klein 4B (to install) | Image | Free | $0 | Fast variations (Apache 2.0) |
| Local | FLUX.1 dev fp8; JuggernautXL v8 | Image | Free | $0 | **Do not use for this game** |
| Local | RealVisXL V5; DreamShaperXL Turbo | Image | Free | $0 | Allowed, wrong style |
| Local | Wan 2.1 / 2.2 (Animate) | Video | Free | $0 | Motion and timing reference (Apache 2.0) |
| Local | TRELLIS.2 (to install); UniRig (to install) | 3D, rigging | Free | $0 | Reference meshes, rig tests (MIT) |
| Local | BiRefNet via ComfyUI-RMBG | Matting | Free | $0 | Only if needed; never RMBG-2.0 |

---

## References

1. Black Forest Labs, FLUX [dev] Non-Commercial License v2.0 (updated 25 Nov 2025). https://bfl.ai/legal/non-commercial-license-terms
2. Hugging Face discussion, "Licence v-1.1 removes commercial outputs line", FLUX.1-Kontext-dev. https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/discussions/6
3. Black Forest Labs, FLUX.1 [schnell] model card (Apache 2.0). https://huggingface.co/black-forest-labs/FLUX.1-schnell
4. Black Forest Labs, FLUX.2 [klein] 4B model card; VentureBeat launch coverage. https://huggingface.co/black-forest-labs/FLUX.2-klein-4B and https://venturebeat.com/technology/black-forest-labs-launches-open-source-flux-2-klein-to-generate-ai-images-in
5. Stability AI, SDXL base 1.0 licence (CreativeML Open RAIL++-M). https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
6. RunDiffusion, Juggernaut-XL v8 model card and terms. https://huggingface.co/RunDiffusion/Juggernaut-XL-v8
7. Wan-Video, Wan2.2 licence (Apache 2.0). https://github.com/Wan-Video/Wan2.2/blob/main/LICENSE.txt
8. Tongyi-MAI, Z-Image-Turbo model card (Apache 2.0). https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
9. VentureBeat, "Open source Qwen-Image-2512 launches" (Jan 2026). https://venturebeat.com/technology/open-source-qwen-image-2512-launches-to-compete-with-googles-nano-banana-pro
10. Qwen, Qwen-Image-Edit-2511 model card. https://huggingface.co/Qwen/Qwen-Image-Edit-2511
11. Stable Diffusion Art, "Multiple Angle Consistent Character with Qwen Edit LoRA". https://stable-diffusion-art.com/qwen-image-edit-multiple-angle-lora/
12. RunComfy, Consistent Character Creator 3.8 and VNCCS character workflows. https://www.runcomfy.com/comfyui-workflows/consistent-character-creator-3-8-in-comfyui-hyperrealistic-consistent-ai-characters and https://www.runcomfy.com/comfyui-workflows/comfyui-vnccs-character-workflow-qwen-image-seedvr2
13. Earngenix, "Flux Kontext Character Consistency in ComfyUI". https://www.earngenix.com/tutorials/flux-kontext-character-consistency-comfyui
14. Apatero, "Train Cartoon Style LoRA for Flux, SDXL, Z Image" (2025); Tech Insider LoRA guide (2026). https://www.apatero.com/blog/train-cartoon-lora-complete-guide-2025 and https://tech-insider.org/train-custom-ai-image-lora-2026/
15. Ludo.ai, "7 Best AI Sprite Generators in 2026, Honestly Compared" (Sep 2026). https://ludo.ai/compare/best-ai-sprite-generators
16. FreeGameSprites, "AI Pixel Art Generation in 2026: Tools, Workflows, and Why Hand-Crafted Still Wins". https://freegamesprites.com/en/news/ai-pixel-art-generation-2026-tools-and-workflows
17. GameDev AI Hub, "Retro Diffusion vs PixelLab (2026)". https://gamedevaihub.com/retro-diffusion-vs-pixellab/
18. PixelLab docs, "Create 8-directional sprite (Pro)". https://www.pixellab.ai/docs/tools/create-8-rotations-pro
19. Ludo.ai, Sprite Generator announcement. https://ludo.ai/blog/bring-your-characters-to-life-introducing-all-new-sprite-generator
20. Gamelabs Studio, "How to generate transparent background sprite sheets using AI (2026)". https://gamelabstudio.co/blog/how-to-ai-spritesheet-transparency
21. Sorceress, "How to Make a Sprite Sheet in 2 Minutes (With AI in 2026)". https://sorceress.games/blog/how-to-make-a-sprite-sheet-in-2-minutes-with-ai-in-2026
22. ComfyUI docs, "Wan2.2 Animate ComfyUI native workflow". https://docs.comfy.org/tutorials/video/wan/wan2-2-animate
23. ComfyUI blog, "WAN2.2 Animate and Qwen-Image-Edit 2509 native support". https://blog.comfy.org/p/wan22-animate-and-qwen-image-edit-2509
24. ToonCrafter: Generative Cartoon Interpolation (SIGGRAPH Asia 2024). https://github.com/Doubiiu/ToonCrafter
25. "Motion-Aware Generative Frame Interpolation", arXiv 2501.03699 (Jan 2025). https://arxiv.org/html/2501.03699v1
26. BRIA, RMBG-2.0 model card (non-commercial). https://huggingface.co/briaai/RMBG-2.0
27. 1038lab, ComfyUI-RMBG node pack (BiRefNet, RMBG-2.0, SAM and more). https://github.com/1038lab/ComfyUI-RMBG
28. Microsoft, TRELLIS.2 repository (MIT). https://github.com/microsoft/TRELLIS.2
29. Tencent, Hunyuan3D-2.1 licence (territory excludes EU, UK, South Korea). https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
30. Cinevva, "Best AI 3D Model Generators in 2026" (updated 14 Sep 2026). https://app.cinevva.com/guides/ai-3d-model-generators
31. 3DAI Studio, "Pixal3D vs Trellis 2 vs Hunyuan 3D". https://www.3daistudio.com/blog/pixal3d-vs-trellis-2-vs-hunyuan-3d-comparison
32. VAST-AI-Research, UniRig (SIGGRAPH 2025, MIT). https://github.com/VAST-AI-Research/UniRig
33. StraySpark, "AI Auto-Rigging Showdown 2026: Tripo, Meshy, Cascadeur, AccuRig, and Mixamo" (May 2026). https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo
34. Cinevva, "Free Character Animations and Auto-Rigging: Mixamo and Its Alternatives (2026)". https://app.cinevva.com/guides/free-character-animations-rigging
35. Meshy, "AI Auto Rigging". https://www.meshy.ai/features/ai-auto-rigging
36. Game Developer, "Art Design Deep Dive: Using a 3D pipeline for 2D animation in Dead Cells". https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-
37. Blender 5.2 Manual, Line Art modifier. https://docs.blender.org/manual/en/latest/grease_pencil/modifiers/generate/line_art.html
38. Blender 5.2 Manual, Toon BSDF. https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/toon.html
39. Blender Secrets, "Inverted Hull Toon Outline"; StraySpark, "How to Get an Anime / Toon Look in Blender (2026)". https://www.3dsecrets.com/secrets/inverted-hull-toon-outline-bnpr-blender-tutorial and https://www.strayspark.studio/blog/how-to-get-anime-toon-look-blender
40. "Render 8 Directions" Blender plugin (itch.io). https://auteddy.itch.io/8-directions-render-plugin-for-blender
41. Kalia and the Fire Staff, devlog 7 (Jan 2025), 3D-to-2D sprite pipeline. https://gdn001.itch.io/kalia-and-the-fire-staff/devlog/877160/katfs-alpha-devlog-7-january-2025
42. Valve, Steamworks Content Survey documentation (AI section). https://partner.steamgames.com/doc/gettingstarted/contentsurvey
43. Valve, "AI Content on Steam" (Steamworks news, Jan 2024). https://store.steampowered.com/news/group/4145017/view/3862463747997849618
44. StraySpark, "Steam's 2026 AI Disclosure Rules: What Indie Developers Actually Need to Know". https://www.strayspark.studio/blog/steam-ai-disclosure-rules-2026-indie-developer-guide
45. Outlook Respawn, "Valve Updates Steam AI Policy: Efficiency Tools Exempt" (Jan 2026). https://respawn.outlookindia.com/gaming/gaming-news/valve-clarifies-steam-ai-policy-focus-shifts-to-content-consumed
46. Tech Insider, "Steam AI Disclosure Hits 20% of Games" (2026). https://tech-insider.org/steam-ai-disclosure-2026/
47. PC Gamer, "Data analyst finds AI stigma on Steam can reduce the number of reviews a game gets by around 53%". https://www.pcgamer.com/software/ai/data-analyst-finds-ai-stigma-on-steam-can-reduce-the-number-of-reviews-a-game-gets-by-around-53-percent-and-the-reviews-it-does-get-are-more-negative/
48. PC Gamer, "Steam Week in Review: A touch of AI is all it takes to trigger backlash". https://www.pcgamer.com/gaming-industry/steam-week-in-review-a-touch-of-ai-is-all-it-takes-to-trigger-backlash-as-a-promising-new-indie-falls-afoul-of-slop-skeptics/
49. GamesRadar+, "After 25% positive Steam reviews, Soulslike dev realizes people hate AI slop"; Everything Edinburgh, "Vapor World Pulls AI Cutscenes". https://www.gamesradar.com/games/action/after-25-percent-positive-steam-reviews-soulslike-dev-realizes-people-hate-ai-slop-and-admits-if-it-looks-like-the-effort-is-not-there-that-is-a-fair-reading-of-what-is-on-screen/ and https://everythingedinburgh.com/games/news/vapor-world-steam-ai-cutscene-backlash/
50. PC Gamer, "RPG dev pushes back against Steam review AI accusations" (Shrine's Legacy). https://www.pcgamer.com/games/rpg/rpg-dev-pushes-back-against-steam-review-ai-accusations-we-poured-years-of-our-lives-into-this-game-and-only-worked-with-real-human-artists-on-everything/
51. Engadget, "The Indie Game Awards snatches back two trophies from Clair Obscur over its use of generative AI" (Dec 2025). https://www.engadget.com/gaming/the-indie-game-awards-snatches-back-two-trophies-from-clair-obscur-over-its-use-of-generative-ai-164730842.html
52. Kotaku, "Divinity Maker Revises AI Stance After RPG Fan Blowback". https://kotaku.com/divinity-gen-ai-larian-bg3-reddit-ama-2000658429
53. Forbes, "Larian Says It Won't Use GenAI Art Or Writing In Divinity Development" (9 Jan 2026). https://www.forbes.com/sites/paultassi/2026/01/09/larian-says-it-wont-use-genai-art-or-writing-in-divinity-development/
54. PC Gamer, "Epic boss Tim Sweeney thinks stores like Steam should stop labelling games as being made with AI" (Nov 2025). https://www.pcgamer.com/software/ai/epic-boss-tim-sweeney-thinks-stores-like-steam-should-stop-labelling-games-as-being-made-with-ai-it-makes-no-sense-he-says-because-ai-will-be-involved-in-nearly-all-future-production/
55. Higgsfield Help Center, "Who owns my generations and can I use them commercially". https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially
56. Higgsfield, "Updates to Higgsfield's Terms of Use and Privacy Policy"; Startup Fortune coverage of the licence criticism. https://higgsfield.ai/blog/terms-of-use-privacy-policy-update and https://startupfortune.com/higgsfield-ai-tells-creators-they-own-their-videos-but-quietly-claims-a-perpetual-worldwide-license-to-train-on-them/
57. OpenArt, Terms of Service. https://openart.ai/suite/terms
58. Scenario, Terms and Conditions and FAQ. https://www.scenario.com/terms-and-conditions and https://help.scenario.com/articles/1129045411-frequently-asked-questions-faq
59. Adobe, "Adobe Firefly: commercially safe AI" (Firefly approach). https://business.adobe.com/products/firefly-business/firefly-ai-approach.html
60. Adobe Help, "Partner models in Firefly Creative Production for Enterprise" (indemnity scope). https://helpx.adobe.com/firefly/web/work-with-enterprise-features/creative-production/partner-models-in-firefly-creative-production-for-enterprise.html
61. Leonardo.Ai Help Center, "Commercial Usage". https://intercom.help/leonardo-ai/en/articles/8044018-commercial-usage
62. US Copyright Office, "Copyright and Artificial Intelligence, Part 2: Copyrightability" (Jan 2025). https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf
63. Herbert Smith Freehills Kramer, "UK Government Report on Copyright and AI concludes more evidence is needed although s9(3) CDPA could go" (Mar 2026). https://www.hsfkramer.com/notes/ip/2026-03/uk-government-report-on-copyright-and-ai-concludes-more-evidence-is-needed-although-s9-3-cdpa-could-go
64. Promise Legal, "AI Game Assets: Copyright, Platform and Publisher Risks" (9 Sep 2026). https://blog.promise.legal/ai-game-assets-three-layer-risk-map-2026/
