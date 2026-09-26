# Cartoon character craft for Custard Knights

Research note, 26 September 2026. Question: how do the best animated-cartoon 2D games build, animate and customise their characters, and what should Custard Knights do to get a "brilliant animated cartoon style" for 8 customisable knights that are about 50px tall in play and up to 5x in menus?

Sources are cited inline as [n] and listed at the end. Where a studio has never published a number, this note says so rather than guessing. It complements `qa/research/ai-art-pipeline.md` (what AI can and cannot do) and `qa/reviews/art-direction.md` (the art review of the current knights).

---

## Executive summary

1. **The cartoon games people admire fall into three camps.** Hand-drawn frame by frame: Cuphead, Hollow Knight, Battle Chef Brigade, Skullgirls. 2D cutout rigs: Castle Crashers, Rayman Origins and Legends, Brawlhalla, Guacamelee, Don't Starve, Cult of the Lamb, Darkest Dungeon. 3D rendered to 2D: Hades, Bastion, Transistor, Ori, Dead Cells. Frame by frame is out for Custard Knights. It costs about 25 minutes per frame at Cuphead quality [11][13], and Custard Knights needs 8 directions and about 285,000 part combinations (6 x 5 x 3 x 8 x 11 x 6 x 6, before chicken skins).
2. **The reference game's own sequel has already made this choice.** Chainsawesome dropped Knight Squad's 2D sprites for stylised 3D cartoon knights in Knight Squad 2, built by 2 artists in a team of 6, because "the 2D art style had hurt Knight Squad in its marketing" [22]. Reviewers called the new knights "far easier to parse and distinguish" [24].
3. **Dead Cells is the closest technical match.** One artist built low-poly 3D models and rendered them tiny, with a toon shader and no anti-aliasing, at 30fps. The characters are about 50px tall, the same as ours. Animations were reused across models, and the artist says the pipeline "saved hundreds of hours" [1][2].
4. **Pre-rendering multiplies work by directions x frames x variants, so layer it.** A Supergiant developer said one Zagreus bow attack is 104 frames x 32 angles = 3,328 images, and that this is why Hades has no outfits [5]. The fix is to render layers rather than finished combinations. Diablo II composited up to 16 body-part layers per direction [54]. Don't Starve and Spine swap parts ("symbols" and "attachments") on one animation [21][48]. Fall Guys applies colours and patterns to one body at runtime [29].
5. **Readability is a set of rules, not a matter of taste.** Valve's TF2 rules: design the silhouette first, shade from dark feet up to a light chest, and put the highest contrast where the weapon is held [38]. Fall Guys adds a zoom-out test: characters are small on screen and "little details can get lost" [29]. For us the helm is the silhouette. Each player owns one colour, shown on the plume, cape and shield face. Colour is never the only identifier [57].
6. **Impact comes from timing, not frame count.** A 2022 study ranks hit-stop among the three features that most drive "impact feel" [41]. Capcom's beat 'em ups freeze for 4 to 11 frames at 60fps, and in The Punisher the victim freezes 2 frames longer than the attacker [40]. Arc System Works got a hand-drawn look out of 3D with stepped "limited animation" and a small mesh deformation on every key [46].
7. **Option (a), better procedural vector drawing, is the cheapest route and the best for customisation, but it has the lowest ceiling.** Keep procedural code for the things it is best at: eyes, springs (plume, custard, cape flutter), smears and effects.
8. **Option (b), Spine cutout, customises well but costs the most drawing and animating in top-down.** Customisation is solved through skins. The licence is $379 for Professional [48], and there is an official Godot runtime. But a top-down knight needs every part drawn in 5 views and every animation authored per view. That makes it the most human-art-heavy route. The Canvas 2D runtime also drops mesh deformation [48].
9. **Option (c), 3D toon renders to sprites from Blender, gets directions for free.** Extra directions cost render time, not artist time. It can be scripted end to end, which suits this agent-driven workflow and the planned Godot 4 build. The cost moves into pipeline code and texture memory. Customisation works through layered renders, material-ID colour ramps and a UV pass for emblems and cape patterns.
10. **Recommendation: option (c), layered.** The spec:
    - 8 true directions, not mirrored, because the sword and shield hands would swap.
    - A knight about 100px tall in 128px cells, which is 2x the 1280x800 play size.
    - A separate 320px menu set.
    - Stepped animation at 15fps with held frames, 544 to 592 frames per layer.
    - Separate body, helm, plume, blade, cape and custard layers.
    - Colours applied by ramp, and emblems and cape patterns by UV lookup.
    - Springs and eyes driven at runtime.

    Start with a one-week spike on a single knight before committing. Keep real-time 3D in Godot (the Knight Squad 2 route) as the fallback if the layer compositor proves costly.

---

## 1. How the best animated-cartoon games build and animate characters

### 1.1 Summary table

| Game | Pipeline | Animation rate | Directions | Customisation method | Confidence |
|---|---|---|---|---|---|
| Castle Crashers (The Behemoth) | Flash cutout rigs baked to sprites for an in-house engine | Game capped at 30fps, raised to 60fps in the 2015 update [26] | Side-on, mirrored | 4 knights share one rig and sprite sheet, differing in colour, helm and weapon [27] | Medium: rig detail is from rippers, not the studio |
| Knight Squad (Chainsawesome) | 2D sprites, "pixel art aesthetic" [23] | Not published | Top-down | Colour-coded knights, each with a unique select animation [23] | Medium |
| Knight Squad 2 | Stylised real-time 3D models converted from KS1 designs [22] | Real-time | Any | 3D models, colour per knight [25] | High |
| Cuphead (Studio MDHR) | Pencil and paper, inked, frame by frame [11] | 24fps "on ones" in a 60fps game [12] | Side-on, mirrored | None | High |
| Rayman Origins and Legends (UbiArt) | 2D painted parts rigged with bones in GenAnim, real-time [15] | 60fps real-time | Side-on | Costumes as alternate part sets | High for pipeline, low for numbers |
| Hollow Knight (Team Cherry) | Frame by frame in Photoshop, PNGs, 2D Toolkit in Unity [16] | About 12fps sprite playback (community measurement, unverified) [17] | Side-on, mirrored | Charms are not visual | Medium |
| Ori and the Blind Forest (Moon) | 3D models animated and rendered to sprites [9][10] | 30fps sprites; runs rendered at 120fps so playback speed can vary [9] | Side-on | None | High |
| Don't Starve (Klei) | Flash symbol-based cutout, exported as separate "build" (art) and "anim" (motion) [20] | Not published | Four-faced (down, side, up; side mirrored) [21] | `OverrideSymbol` swaps one part's art on a shared animation; costume and colour swapping [20][21] | High |
| Hades, Bastion, Transistor, Pyre (Supergiant) | 3D modelled in ZBrush and Maya, hand-painted line work, rendered to frames [3][6][7] | Not published | 32 angles for Zagreus [5] | None for Zagreus, because of the frame count [5] | High |
| Dead Cells (Motion Twin) | Low-poly 3D in 3ds Max, rendered small with toon shader, no anti-aliasing [1][2] | 30fps [2] | Side-on | Weapons and outfits reuse the same animations across models [2] | High |
| Battle Chef Brigade (Trinket) | Hand-drawn, hand-animated; "very few shortcuts" [37] | Not published | Side-on | None | Medium |
| Guacamelee (DrinkBox) | Flash animations imported as animated geometry, not sprite sheets [18] | 60fps, scalable, low memory [18] | Side-on | Costumes; chicken form | High |
| Overcooked (Ghost Town) | Real-time 3D | Real-time | Any | Different chef heads on one uniform body; player accent colours blue, red, green, yellow [30] | Medium |
| Fall Guys (Mediatonic) | Real-time 3D | Real-time | Any | About 50 each of tops, bottoms, colours, patterns and faces, mixed at runtime [29] | High |
| Brawlhalla (Blue Mammoth) | Adobe AIR (Flash-based) vector art [31] | 60fps real-time | Side-on | Skins replace art over shared weapon animations; each legend has unique signature moves [31] | Medium: the rig detail is inferred |
| TowerFall (Thorson, Medeiros) | Hand pixel art at 320x240 [32] | Not published | Side-on | Colour identity per archer, kept on alternate costumes; hats can be knocked off and picked up [32] | High |
| Duck Game (Podbielski) | Pixel art | Not published | Side-on | Hats are 32x32 overlays with a second "quack" frame and an optional cape frame [33] | High |
| Moving Out (SMG, DevM) | Real-time 3D | Real-time | Any | Hair, colour, wheelchair, hijab options [34] | Medium |
| Heave Ho (Le Cartel) | 2D heads with physics-driven stretchy arms [35] | Physics | Side-on | Hats and accessories [35] | Medium |
| Party Animals (Recreate) | Real-time 3D with active ragdoll physics [36] | Physics | Any | Costumes and accessories on physics bodies [36] | Medium |

### 1.2 Notes per game

**Castle Crashers.** Dan Paladin's style came from placeholder art that set the look, size and scale, then several partial drawings per asset, one of which was finished [28]. The 4 starting knights are a single rig and share a sprite sheet. Colour, helm and weapon tell them apart [27]. After Alien Hominid, Paladin stopped making backgrounds full-bright and moved to greyer, duller backgrounds so the characters stand out. That comes from a fan wiki, not the studio, so treat it as reported. The PC version was 30fps until a 2015 update raised the frame rate and texture sizes [26]. Lesson: a shared rig plus swapped heads, colours and weapons is how a small team gets many knights.

**Knight Squad and Knight Squad 2.** Knight Squad began at a 48-hour game jam and took about 18 months from prototype to release [23]. Each knight has a colour and a personal select animation, such as finger guns or a guitar solo on the sword [23]. For the sequel, Laurent Mercure said the 2D style "had hurt Knight Squad in its marketing". Families and children were the audience, so the team moved to "stylized 3D cartoon". The 3D knights were quick to make because the designs already existed [22]. The team was 2 programmers, 2 artists, 1 QA and 1 in marketing [22]. One review called the 3D knights "far easier to parse and distinguish" [24]. Another noted that the 8 colours are the primary and secondary colours of the colour wheel plus pink and a white and black combination, and that everything casts a shadow [25].

**Cuphead.** Everything is hand-drawn on paper and inked, then coloured [11][13]. Animation runs at 24fps on ones while the game runs at 60fps [12]. The team counts about 50,000 frames, and one complicated frame could take more than 25 minutes [13][14]. MDHR leans on loops because 1930s cartoons did [12]. Rubber-hose limbs have "no bones, no joints" [11]. This is the quality ceiling, and it is priced accordingly.

**Rayman Origins and Legends (UbiArt Framework).** Artists paint parts, attach a skeleton of pivot points in GenAnim, and the engine animates them in real time at 60fps in full HD [15]. Ubisoft says the Origins trailer "required the intervention of only a few graphic artists" [15]. The 2013 GDC talk "Rayman Reinvented" covers the artist-led tools [15]. Lesson: painted cutout parts on bones can look like hand animation if the poses are strong and the parts deform.

**Hollow Knight.** Team Cherry drew all art and animation in Photoshop and saved it as PNG frames, played through 2D Toolkit in Unity [16]. Some secondary sources wrongly describe it as skeletal. A community recreation measured sprite playback at about 12fps [17]. That figure has not been confirmed by the studio.

**Ori.** Moon Studios animated 3D models and rendered them to sprites. In Blind Forest, Ori is a 2D sprite animated at 30fps [10]. From the GDC 2015 notes [9]:
- Walk, jog and run were rendered at 4x the normal frame rate so the game could play them back at variable speeds.
- Swimming used 23 pre-rendered pose variants.
- Ori squashes to about 10 pixels on impact.
- An orthographic camera avoided perspective errors.
- Motion blur was baked into the sprites.
- Readability came from a near-white character against lush backgrounds.

The sequel moved to real-time 3D models [10].

**Don't Starve.** Klei animates in Adobe Flash with symbol-based animation. Jeff Agala and Aaron Bouthillier's GDC 2017 talk covers "costume and color swapping, and animation re-use" [20]. At runtime, `AnimState:OverrideSymbol(symbol, build, folder)` replaces one symbol's art (a hat, a weapon, a face) on any animation [21]. Entities choose how many facings they have with calls such as `Transform:SetFourFaced()` [21]. This is the cleanest published example of the structure Custard Knights needs: one animation set and many swappable parts.

**Supergiant (Bastion, Transistor, Pyre, Hades).** Characters are 3D models made in ZBrush and Maya, textured in Substance. The artist then paints "all of the black linework to try and match the 2D look" by hand on a line-art layer [3]. Most NPCs began from one of two base models [3]. A Supergiant developer confirmed they render "thousands upon thousands of frames... from many different angles" [6]. For one bow attack that is 104 frames x 32 angles. The same developer said outfits for Zagreus were not feasible because each would multiply every one of those frames again [5]. Hades shipped 942,489 character and enemy animation frames [4]. Camilo Vanegas, the studio's only 3D artist and animator at the time, covered Red (Transistor) and Rukey (Pyre) in a 2018 GDC talk [7][8]. Lesson: baking whole characters kills customisation, and that is exactly what Custard Knights must avoid.

**Dead Cells.** Thomas Vasseur was the only artist for a year [1]. His pipeline [1][2]:
1. Draw a 2D model sheet.
2. Build a low-poly model and skeleton in 3ds Max.
3. Animate pose to pose, and add interpolation only once the keys are approved.
4. Render each frame small, with a toon shader and no anti-aliasing, plus a normal map for lighting.
5. Export PNG sequences at 30fps.

He says a 3D model is not worth much effort for a 50px character, so low-poly is enough. Reusing one animation on different models "saved hundreds of hours", and he could change "dozens of animation timings in a couple of minutes" when combat balance changed [2]. That speed of retiming matters for a combat game still in tuning.

**Battle Chef Brigade.** The art is hand-drawn and hand-animated. Trinket's Kickstarter warns there are "very few shortcuts to creating hand-drawn animations" [37]. It has no customisation.

**Guacamelee.** DrinkBox animators worked in Flash, and in Toon Boom according to a job listing [19]. The game imported Flash animations "as animated geometry" instead of sprite sheets, which gave "60 fps animated characters that could be scaled up and down without resolution issues, while using significantly less memory" [18]. Guacamelee also has a chicken form, as Custard Knights does.

**Overcooked and Fall Guys.** Both are real-time 3D.
- Overcooked keeps one uniform body and swaps the head. Each player's chef is marked by an accent colour [30].
- Fall Guys customises in four parts: face, colour and pattern, top, and bottom. There are about 50 of each, giving thousands of combinations [29]. The designers chose little legs and big arms "so they can be expressive when they fall over" [29]. They advise costume designers to zoom out and check that a design still reads at play size [29].
- Mediatonic says having up to 60 characters on screen limits how much fidelity each costume can have [29].

**Brawlhalla.** The game runs on Adobe AIR, which is Flash technology [31]. The art goal is the look of "a 2D Saturday morning" cartoon [31]. All legends that share a weapon also share its basic attack animations. Each legend adds three signature moves per weapon, and skins re-dress the same animations [31]. This is one animation set with many costumes over it.

**TowerFall.** The game runs at 320x240, and Thorson says the pixel art "abstracts things and lets players fill in the blanks", which helps local multiplayer readability [32]. Alternate archers keep their original colour, so the colour stays the player's identity while the silhouette changes [32]. Hats can be knocked off by near misses and picked up again [32]. That is a direct precedent for a helm popping off on a KO.

**Duck Game.** A hat is a 32x32 frame, a second 32x32 frame shown while quacking, and optionally a third cape frame [33]. It is a tiny, readable, layered customisation system on one shared duck.

**Moving Out, Heave Ho and Party Animals.** These are physics-first. Heave Ho's heads have physics arms, and hats are the customisation [35]. Party Animals uses active ragdolls with costumes [36]. Moving Out offers hair, colour and accessibility options such as a wheelchair and a hijab [34]. They show that physics wobble can be the comedy. They do not publish art pipelines worth copying.

**Two useful outliers.**
- **Guilty Gear Xrd.** A 40,000-triangle 3D character made to look hand-drawn [46]:
  - inverted-hull outlines with thickness controlled per vertex
  - a fixed light direction for each character, not scene lighting
  - hand-edited normals so the cel shading falls where an artist would draw it
  - no interpolation between keys ("limited animation")
  - heavy use of scale keys for squash, stretch and exaggeration
  - the mesh deformed on every key to add "imperfection"
- **Cult of the Lamb.** Its followers are Spine characters with swappable animal forms and colours [63]. The art director regretted early rig decisions but could not "redo 300 animations" [63].

### 1.3 How games handle 8 or more directions in top-down and 3/4 view

- **Five drawn, three mirrored.** For symmetrical characters, artists draw S, SE, E, NE and N, then flip the others. Only "five orientations [are] necessary to complete the circle" [55]. Slynyrd's order of work: rough every orientation in one scene, animate the front, then the side, then the back, then the diagonals, and finally sync the whole ring together [55].
- **Four drawn with angled sides.** Sunnyside angles its left and right sprites slightly towards the camera so they can also serve the down-left and down-right diagonals. That covers most of the ground with 4 sets instead of 5 [55].
- **Asymmetric characters need all 8.** Slynyrd notes that unique equipment breaks mirroring [55]. A knight with the sword in the right hand and the shield in the left swaps hands when flipped.
- **Rendered angles are cheap in labour.** Supergiant renders 32 angles [5]. Diablo II used between 1 and 32 directions per animation, typically 8 or 16 [54]. Once a character is in 3D, each extra direction costs machine time, not artist time.
- **Don't Starve uses four facings** set per entity [21], which is the right level for a lot of top-down creatures.

### 1.4 How games handle customisation layers

1. **Shared rig with part swaps.** Castle Crashers knights [27], Don't Starve's `OverrideSymbol` [21], Brawlhalla skins [31], Spine skins [48] and Spriter "character maps" [51]. Parts are named by slot, for example "head", and the animation keys the slot rather than the specific art [48].
2. **Pre-rendered part layers composited at runtime.** Diablo II split each player animation into head, torso, legs, right arm, left arm, right hand, left hand, shield and up to eight extra slots. A per-animation file set which parts to draw and in what order [54]. This is the pre-rendered version of a cutout rig.
3. **Runtime tint and pattern.** Fall Guys colours and patterns [29]. Palette-swap shaders map grey values or indices to a ramp [59]. "UV-mapped sprites" store texture coordinates in each pixel's red and green channels, so a texture such as an emblem or a cape pattern can be swapped on every frame without redrawing [60].
4. **Real-time 3D.** Knight Squad 2, Overcooked, Fall Guys and Party Animals make customisation almost free because nothing is baked [22][29][30][36].

---

## 2. Readability at small size in crowded 8-player brawlers

### 2.1 Silhouette first

- Valve builds characters in this order: silhouette, interior shapes, model sheet, model, skin, in game. It explicitly solves "design problems using silhouette only", and every character should be "identifiable at first read" [38].
- TF2 characters were checked against flat, unlit versions to prove they read without any internal detail [38].
- **For Custard Knights the helm is the silhouette.** Six helms must be told apart as solid black shapes at about 50px. The art review already sets targets: a flat-topped great helm 1.15x wider than it is tall, a kettle hat brim at 1.6x the head radius, a sallet flaring backwards, a tall barbute, horns 30% bigger. Its rule: "If two look the same, change one" (`qa/reviews/art-direction.md`, section 1.3). The custard dollop is on every knight, so it is a brand mark, not an identifier. Keep it the same size on every helm so it never competes with the helm shape.

### 2.2 Value and colour hierarchy

- TF2 read hierarchy [38]:
  1. Team colour.
  2. Class silhouette.
  3. The weapon: "Highest contrast at chest level, where weapon is held", with a "Gradient from dark feet to light chest".
- TF2 also keeps shadows cool rather than black, and emphasises silhouettes with rim highlights. Large areas are muted and "small areas of saturation" are reserved for what matters [38].
- Castle Crashers used duller, greyer backgrounds so its bright characters pop (reported by a fan wiki, not the studio). Ori used a near-white hero against lush scenery [9].
- **Rules for us:**
  - Arenas at mid value and lower saturation.
  - Knights brighter and more saturated than any floor.
  - The lightest value and the strongest contrast in the helm, face and weapon zone.
  - Legs and feet darker.
  - Pickups and hazards keep their own reserved hues. The art review already asks for teal pickups and keeps yellow for hazards.

### 2.3 Outline weights

- At play size, a dark outer contour carries the silhouette on any floor. The art review found the 3px ink contour right at 1280 wide, but 1.5px inner lines disappear. It recommends a 2px minimum and a 2px player-colour rim outside the ink on dark maps.
- Guilty Gear Xrd used an inverted-hull outline because artists could preview it while modelling, and could vary its thickness per vertex through vertex colours [46].
- **Target at 1x play scale:** outer contour 2.5 to 3px in dark plum ink (not pure black), interior lines 1.5 to 2px. At the recommended 2x render scale, that means 5 to 6px outer lines and 3 to 4px inner lines, so they survive downscaling.

### 2.4 Team and player colour placement

- **One owner per colour.** Put the player's colour on the biggest, most visible surfaces: plume, cape and shield face. Keep metal neutral, as the art review recommends. Overcooked uses one accent colour per player [30]. TowerFall keeps an archer's colour even when the costume changes [32].
- **Teams override personal colour on the big surfaces** (red or blue on the cape, plume and shield). Personal colour stays only on the emblem. TF2 does the same thing with warm red and cool blue [38].
- **Never colour alone.** The Game Accessibility Guidelines say to "use colour as a back-up for another means of communicating the information", such as shapes, symbols, patterns or contrast. Orange against blue works for most colour-vision types [57]. Colour-blind players also identify their own character by silhouette ("the one wearing the top hat") [57]. Custard Knights already has helm shapes, emblems, a YOU tag and a ring under each knight. Keep the P-number and emblem visible in every mode.
- **Eleven colours are too many to separate at 50px.** Knight Squad 2's eight are the primaries and secondaries plus pink and a white and black combination [25]. Guarantee that the 8 colours in any one match are maximally separated, and let the extra colours be cosmetic choices that the game reassigns if two players clash.

### 2.5 Shape language for cartoon knights

- Circles read as friendly and cute, squares as sturdy and dependable, triangles as dangerous and dynamic [58].
- **Knights:**
  - Square, chunky torsos and armour plates.
  - A soft, round custard dollop and round eyes.
  - Triangles only on things that hurt: blade tips, horns, spikes, the sallet's tail.
  - The chicken form is all circles, so it reads as harmless at a glance. That fits its role, since chickens can only peck.
- Fall Guys tested humanoid and circle shapes before choosing the bean, which "was instantly loveable and funny when it fell" [29]. Build the knight around how funny it looks when it gets hit.

### 2.6 Head-to-body ratio and exaggeration

- Most cartoons sit between 2 and 6 heads tall. Top-down cameras cause overlap, so heads should be larger than usual [56]. Chibi characters are about 2 to 3 heads tall, with the head a third to a half of total height [56].
- The art review measured the current knights at about 55% head. It asks for about 45%, with a taller torso, real arms and boot capsules.
- **Target: the helm plus face at 42 to 48% of body height, with the dollop on top.** About 2.2 heads tall.
- Weapons should be deliberately oversized and chunky. The review asks for 1.6x the current width and a real crossguard. Hands and feet can be a little large. Exaggerate knockbacks too. Cooper's advice is to "sell" hits by launching the victim so the hit reads from a distance [44].

---

## 3. Animation principles applied to game characters

### 3.1 Anticipation versus responsiveness

- Anticipation gives a move weight, but too much makes a character feel unresponsive. Enemies and bots should telegraph for longer [44]. Custard Knights already does this, with the "!" over the Chill bots.
- Pedro Medeiros (TowerFall) says a player attack should fill its hitbox on the first frame, with no anticipation, so the input feels instant [65].
- **Rule for us:** player light swings get at most 1 wind-up frame (about 67ms at 15fps). The weight comes from the smear, the contact hold and the follow-through. Charged heavies, bots and bosses can use 2 to 4 anticipation frames.

### 3.2 Follow-through and cancel windows

- Let the follow-through play out, but mark a frame where the player regains control, so a new input interrupts it instead of the animator cutting it short [44]. Export that "cancel from" frame alongside every attack.

### 3.3 Squash and stretch

- Preserve volume: a character stretched vertically gets narrower [44]. Ori squashes to about 10px on landing and stretches its tail to 3x on spins [9].
- Guilty Gear Xrd used scale keys "a LOT" for exaggeration, squash and stretch, and for hiding or revealing parts [46].
- **For us:**
  - Squash to 1.1x wide by 0.9x tall on a swing wind-up.
  - Squash to 0.8x wide by 1.2x tall when hit.
  - A 3-frame squash on landing and on a KO drop (the values the art review proposes).

### 3.4 Smear frames

- A smear is an in-between that stretches or multiplies the form so a fast move reads as speed [45]. Chuck Jones used them in 1942, and they appear in Hollow Knight's nail swings [45].
- **In 3D:** deform the rig or duplicate parts along the arc for one frame [45], or add a separate slash-arc effect. Because Custard Knights aims continuously with the right stick, draw the arc as a runtime effect rotated to the exact aim angle. The 8-direction body can then stay approximate while the slash is always exact.

### 3.5 Hit-stop and hit reactions

- The 2022 study rates hit-stop, sound coherence and camera control as the three features that most shape impact feel [41].
- **Capcom beat 'em ups, measured at 60fps [40]:**

  | Game | Hit-stop |
  |---|---|
  | Final Fight | 6 frames for everything |
  | Captain Commando | 8 frames |
  | Knights of the Round | 6 on the ground, 7 in the air |
  | Warriors of Fate | 4 to 5 frames |
  | The Punisher | Jab 6 (attacker) and 8 (victim); combo ender 9 and 11 |

- Guilty Gear Xrd uses about 7 frames for light attacks and 10 for heavy ones [42].
- Sakurai scales hit-stop with damage and caps the maximum. The attacker vibrates slightly during the freeze, horizontally on the ground and vertically in the air, and the vibration eases off [39]. Vlambeer's "Art of Screenshake" talk lists freeze frames among the core tricks [43].
- **Values for us, at 60fps:**

  | Event | Hit-stop | Extra |
  |---|---|---|
  | Light hit | 4 frames attacker, 5 frames victim | Victim vibrates |
  | Heavy or parry | 8 attacker, 10 victim | |
  | KO | 12 frames | 200ms slow-mo on the last KO of a round |
  | Blocked hit | 3 frames, both | Spark effect |

  Cap it at 14 frames. When 8 players are fighting, apply the freeze only to the knights involved, never to the whole world.
- **Hit reaction:** 3 frames (squash, recoil stretch, settle), X eyes for 0.3s, and a 2-frame white flash rather than a full fill, as the art review suggests.

### 3.6 Idle personality

- Build the idle from a breathing loop with offset timing across the chest, shoulders and head, plus weight shifts [47]. The usual system is a base loop plus 2 to 4 variants played at random intervals [47].
- A knight fiddling with its sword grip is a standard example of a character-driven fidget [47].
- **For us:** an 8-frame breathing loop in all 8 directions. Menus and lobby get 3 variants: a look-around, a poke at the custard, and a sword spin. Knight Squad gives each knight its own select animation [23], and the 18-tier unlock track could award these idle variants.

### 3.7 Secondary motion: plumes, capes and custard

- Cooper recommends physics-driven secondary motion for cloth and hair because it adds quality "with little extra work" [44]. Spine 4.2 added physics constraints for exactly this [67].
- **Custard dollop (the signature):**
  - Drive it with a damped spring at runtime: underdamped (damping ratio about 0.3), stiffness around 200 per second squared.
  - Make it respond to acceleration, dashes and hits.
  - Output it as squash, stretch and lean on the dollop sprite, preserving volume.
  - On a hit, add an impulse against the hit direction. On a KO, it flies off with the helm and lands as a splat decal.
- **Plume:** a separate layer attached at a point on top of the helm. Rotation is driven by a spring lagging behind velocity, plus a 4-frame flutter loop baked into the art.
- **Cape:** bake the cloth motion into each animation in Blender and keep it a separate layer, so its draw order can change with direction. Add a small runtime sway only in idle.

### 3.8 Victory and KO

- **KO:**
  - The helm pops off as its own physics object with the dollop and plume attached.
  - The body drops with a 3-frame squash, stars circle overhead, and it poofs into custard.
  - TowerFall's knocked-off hats [32] and the layered parts make this cheap.
- **Victory:** a hop with a landing squash, the sword raised overhead, and the plume bursting. Victory is only seen at 3x to 5x on the results screen, so author it in 1 to 3 facing directions at menu resolution, not 8 at game resolution.

### 3.9 Recommended frame counts for a party brawler

A generic guide suggests 2 to 4 frames for idle, 6 to 8 for a run, 3 to 6 for an attack, 2 to 3 for a hit and 4 to 6 for a death, with the note that "frame timing beats frame count" [66]. Dead Cells used 30fps, Ori 30fps, Cuphead 24fps and Hollow Knight reportedly 12fps [2][10][12][17]. Custard Knights has more time and more personality to show, so it can go a little above the minimums.

All counts below assume a 15fps base (30fps authored "on twos"), with holds on the extreme poses:

| Animation | Frames per direction | Directions | Notes |
|---|---|---|---|
| Idle | 8 | 8 | Breathing plus a plume beat; about 1.2s loop with holds |
| Run | 8 | 8 | Bob and lean; dust puff as a runtime effect |
| Light swing A and B | 6 each | 8 | Wind-up (0 to 1 frames), smear, contact hold, 2 follow-through, recover; cancellable from frame 4 |
| Heavy charge and release | 4-frame loop plus 8 | 8 | Anticipation lives in the charge |
| Dash | 5 | 8 | Stretch, smear, squash to a stop |
| Block | 2 in plus a 2-frame hold loop | 8 | Parry spark as an effect |
| Hit | 3 | 8 | Plus X eyes swapped in at runtime |
| Stunned | 6-frame loop | 8 | Stars as an effect |
| KO | 10 | 8 | Helm detaches as a separate object |
| Shout | 6 | 8 | Speech bubble is UI |
| Victory | 16 to 24 | 1 to 3, menu set | Results screen |
| Wardrobe pose and idle variants | 12 each | Front and 3/4, menu set | Unlockable |
| Chicken (idle, run, peck, flap-hit, KO) | 6, 6, 5, 4, 8 | 8 | Its own small set |

In-match total per knight layer: 8 + 8 + 12 + 12 + 5 + 4 + 3 + 6 + 10 + 6 = 74 frames x 8 directions = **592 frames**. The single-swing core of 68 frames x 8 gives 544.

---

## 4. The three realistic pipeline options

### 4.1 Option (a): improve the procedural vector drawing

**What it is.** Keep `CK.drawKnight` and push it as far as it will go:
- a pose library of keyed joint angles per animation
- two-bone IK arms connecting to the sword and shield
- volume-preserving squash and stretch
- springs on the plume, cape and custard
- tapered, variable-width strokes
- smear shapes during swings

**What has shipped.**
- Rain World animates its slugcat procedurally: two physics chunks with limbs and tail drawn and animated from inputs [61].
- David Rosen's GDC talk shows fluid animation from "very few key frames" plus procedural layers in Overgrowth [62].
- Guacamelee and Brawlhalla prove that vector geometry at 60fps can look like a cartoon, though that vector art was hand-animated in Flash, not generated by code [18][31].

| | Assessment |
|---|---|
| **Quality ceiling** | Medium. Procedural poses look mechanical because every frame is maths. The appeal of Castle Crashers or Cuphead comes from drawn key poses, drawn smears and acting, which code finds hardest. Rain World is brilliant, but its creature is intentionally simple and animal-like. |
| **Cost in time** | Lowest. A strong upgrade (arms, proportions, poses, springs, hit-stop) is 2 to 4 weeks, and the art review already specifies most of it. |
| **Fit with customisation** | Best possible. Every combination and colour is exact, and at 5x it is still crisp for free. |
| **Risk** | Pays down the wrong debt. Custard Knights is moving to Godot 4, so the Canvas drawing would need porting (to `_draw()` or Polygon2D) anyway. |

### 4.2 Option (b): 2D skeletal or cutout animation

**Tools and terms at the time of research:**

| Tool | Price | Commercial terms | Web runtime | Godot 4 | Notes |
|---|---|---|---|---|---|
| Spine (Esoteric) | Essential $69; Professional $379 (page showed list $449); Enterprise $2,499 plus per-seat, required above $500k revenue [48] | Runtimes may ship in products while you hold a licence; every user needs their own editor licence [48] | spine-ts: WebGL and player support all features; **Canvas lacks meshes, clipping and two-colour tint** [48]; spine-pixi v7 and v8 support everything on WebGL or WebGPU [48] | Official spine-godot, as a GDExtension or custom build [48] | Essential has no meshes, weights, IK or physics [48]; skins and mix-and-match [48]; physics constraints since 4.2 [67] |
| Rive | Free plan cannot export for runtime; paid seats from roughly $9 to $17 a month, depending on plan and billing [49] | Runtimes open source [49] | Official web runtime | Community GDExtensions only, some alpha [49] | Bones, meshes and state machines; built for UI and interactive graphics more than game characters |
| DragonBones | Free | Runtimes MIT [50] | DragonBonesJS | Old community modules | **Editor effectively abandoned**; download down and developer unresponsive [50] |
| Spriter Pro (BrashMonkey) | About $60 [51] | Runtime plugins vary | Third party | Third party | "Character maps" swap and stack art on one animation [51]; tools have aged |
| Godot built-in | Free | MIT | n/a | Skeleton2D, Bone2D, Polygon2D and AnimationPlayer cutout workflow [52] | No dedicated authoring tool, so you animate inside the engine |

**What has shipped.**
- Spine: Darkest Dungeon (with Spine's C++ runtime [64]) and Cult of the Lamb (around 300 animations, customisable followers [63]).
- Flash cutout: Castle Crashers [27], Brawlhalla [31], Guacamelee [18], Don't Starve [20].
- UbiArt, an in-house equivalent: Rayman [15].

**The top-down problem.** Every one of those games is side-on, where one view mirrored covers everything. A 3/4 top-down knight needs:
- every part drawn in 5 views: 6 helms x 5 = 30, 5 plumes x 5 = 25, bodies, arms, capes, shields and blades
- every animation authored separately for each view: roughly 11 animations x 5 views = 55 clips
- art mirrored for the other 3 directions, which swaps the sword hand (see 1.3), or else 8 views.

Meshes are needed for good cartoon deformation of capes and custard, but they rule out Spine Essential and the Canvas runtime [48]. Cutout animation interpolates by default, which gives the floaty "Flash look". Stepped keys and swapping in drawn smear frames cure that, but they add drawing work.

| | Assessment |
|---|---|
| **Quality ceiling** | High, near Castle Crashers or Brawlhalla, if a skilled 2D artist draws the parts and a skilled animator poses them. |
| **Cost in time** | High in human art. Roughly 100 to 150 part drawings, plus 55 clips of posing, plus rigging 5 views. As an estimate, 10 to 16 weeks for one experienced 2D artist-animator. AI tools cannot yet hold a part steady across 5 views (see `ai-art-pipeline.md`), so this route needs a hired artist. |
| **Fit with customisation** | Excellent in principle. Spine skins can each be one item, several skins can be shown at once, skin bones let proportions change, and slot tinting recolours parts [48]. |
| **Licence cost** | $379 per seat, or $2,499 plus seats once revenue passes $500k [48]. |

### 4.3 Option (c): 3D models toon-rendered to sprite sheets in Blender

**What it is.** One modular low-poly knight is modelled, rigged and animated in Blender, shaded to look drawn, and batch-rendered into 8 directions x N frames as separate part layers. A runtime compositor then assembles each knight from their chosen parts.

**What has shipped.**
- Dead Cells: one artist, about 50px characters [1][2].
- Hades, Bastion, Transistor and Pyre: 32 angles for Zagreus [3][5][6][7].
- Ori [9].
- Diablo II: up to 16 layered parts, with 8 or 16 directions for players and creatures [54].
- Knight Squad 2 used the same kind of 3D models in real time instead [22].

**Toon shading in Blender:**
- **Cel bands.** EEVEE's Shader to RGB node into a Color Ramp set to Constant. Two stops give a two-tone look, three give a mid-tone [53].
- **Hand-drawn look (Guilty Gear Xrd [46]):**
  - one fixed light direction per character, top-left to match the arenas' highlights
  - hand-edited normals on helms and faces so the shadow shapes are "intentional"
  - vertex-colour offsets for where the shadow threshold falls
  - no normal maps
- **Outline methods:**
  - **Inverted hull.** A Solidify modifier with flipped normals and a dark material. Quick, visible in the viewport, works in EEVEE and Cycles, thickness can vary per vertex. But it only draws silhouettes, doubles the polygon count and can clip [53].
  - **Line Art (Grease Pencil modifier).** Adds creases, intersections and material borders for interior lines [53].
  - **Freestyle.** Most control and most "hand-drawn", but slower and fussier with transparency and collections [53].
  - **Recommended mix:** inverted hull for the outer contour, plus Line Art for a few interior lines. Render at 2x and downscale.
- **Pixel versus smooth.** Dead Cells rendered small with no anti-aliasing for a pixel look [2]. Custard Knights is a smooth cartoon, so render at 2x with anti-aliasing and downscale with good filtering.

**Rendering 8 directions x N frames.** Add-ons exist for 8-direction batch renders and for Diablo-style part layers [53]. A custom Python script is better here: it gives full control over layers, anchor points and draw order, and it can run headless from the command line. The loop is:

```
for direction in 8 (camera orbit at 45 deg steps, fixed 3/4 elevation, orthographic)
  for animation, frame
    for layer in [body, cape, helm_1..6, plume_1..5, blade_1..6, dollop, chicken...]
      render layer with occluding body parts as holdout
      write PNG (trimmed) + JSON: anchor points (hand, helm top, plume base, face), per-layer depth for draw order
```

**Keeping customisation parts as layers.**
- **Holdouts.** Render each part with the body as a holdout, so every layer already has the body's occlusion cut out.
- **Draw order.** Export each part's depth for every frame, as Diablo II's files did [54]. The runtime can then sort cape, shield, helm and plume per frame. A cape sits behind the body facing south and in front facing north.
- **Colour zones.** Render a material-ID mask as well as the value (lit) pass. At runtime, each zone's grey value maps through a ramp [59]:
  - player colour (plume, cape, shield face): 11 colours, 3 to 5-step ramps that keep the cel bands
  - metal (steel, gold, iron): 3 ramps
  - fixed colours (skin, eyes)
- **Patterns and emblems.** Render a UV pass for the cape and for the tabard and shield faces, then sample the 6 cape patterns and 8 emblems in a shader. This is the "UV-mapped sprite" technique [60].
- **Canvas 2D fallback.** Plain Canvas 2D cannot sample per pixel cheaply. The browser prototype can instead bake each knight's atlas once at match start with WebGL, or ship the 8 emblem decals as their own small layers.
- **Rigid items.** Blades can be one sprite per blade rendered at 16 to 32 rotations, placed on the hand anchor and rotated at runtime, rather than a full set per animation.

**Memory estimate.** At a 128x128 cell with trimming, a body layer of about 590 frames is roughly 10MB as raw RGBA. A helm layer (about 40x40) is 2 to 3MB and a plume about 1 to 2MB. Six helms, five plumes, the body, the cape, the dollop and a blade rotation sheet come to roughly 40 to 60MB of raw RGBA for the whole wardrobe at in-match resolution. Only the parts the 8 players picked need loading, and GPU texture compression shrinks it further. For comparison, Hades baked far more for one character [4][5].

| | Assessment |
|---|---|
| **Quality ceiling** | High. Guilty Gear Xrd shows 3D can pass as 2D [46], Dead Cells shows it works at 50px [1], and Supergiant made it look hand-painted [3]. The risk is a CG look, which you fight with stepped keys, hand-shaped normals, ink outlines and simple 2 to 3-band shading. |
| **Cost in time** | Front-loaded. Model kit 1 to 2 weeks, rig 1 week, pipeline and shader 2 weeks, animations 3 to 5 weeks, compositor 1 to 2 weeks: roughly 8 to 12 weeks. Extra directions, retiming and new blades are then cheap. Dead Cells could retime dozens of animations in minutes [2]. |
| **Fit with customisation** | Very good if layered, very bad if baked. Supergiant's baked frames are why Hades has no outfits [5]. |
| **Fit with this team** | Blender is free and can be scripted in Python, headless. Knights are hard-surface shapes (plates, cylinders, bevelled boxes) that suit simple modelling. The custard is a soft blob that suits shape keys or a jiggle simulation. `ai-art-pipeline.md` reaches the same conclusion about fit. |

### 4.4 A fourth option to keep in view: real-time 3D in Godot

Knight Squad 2 [22], Overcooked [30], Fall Guys [29] and Party Animals [36] all render their characters in real time. Customisation becomes a material or a mesh swap, directions are unlimited, the wardrobe is the live model, and physics jiggle comes free. Godot 4 can run a toon shader with an inverted-hull outline in real time, which is Guilty Gear Xrd's method [46]. The cost is losing some of the hand-painted flatness, since everything rotates smoothly unless you snap facings, and it dropping the browser prototype. Build the Blender kit from option (c) cleanly and it serves both routes, so choosing (c) now does not close this door.

### 4.5 Side-by-side

| | (a) Procedural vector | (b) Spine cutout | (c) Blender toon sprites | (d) Real-time 3D |
|---|---|---|---|---|
| Quality ceiling | Medium | High (with a strong 2D artist) | High | High, but reads as 3D unless worked hard |
| Time to good result | 2 to 4 weeks | 10 to 16 weeks, human art | 8 to 12 weeks, mostly scriptable | 6 to 10 weeks |
| 8 directions | Free | 5 views drawn and animated | Free (render time) | Free |
| Customisation | Perfect | Excellent (skins) | Very good if layered | Perfect |
| 5x menus | Free | Needs high-res parts | Separate menu render set | Free (live model) |
| Browser prototype | Native | spine-webgl or spine-pixi | Atlases plus compositor | No |
| Godot 4 | Port | Official runtime | AnimatedSprite2D, or a custom compositor | Native |
| Money | None | $379 per seat | None | None |
| Shipped by small teams | Rain World | Darkest Dungeon, Cult of the Lamb | Dead Cells, Supergiant | Knight Squad 2, Fall Guys |

---

## 5. Recommendation for Custard Knights

**Choose option (c): a modular Blender knight, toon-rendered into layered 8-direction sprites and composited at runtime, with procedural springs, eyes and effects on top.** It is the only route that delivers a drawn-cartoon finish, 8 true directions and about 285,000 combinations without a hired 2D animator. It uses the tools already on this PC, it can be scripted, and it carries over to Godot 4. Keep option (d) as the fallback.

### 5.1 Specification

- **Directions:** 8 rendered, with no mirroring, because the sword stays in the right hand. Snap facing to 45 degree sectors with about 10 degrees of hysteresis so knights do not flicker between two sprites. Swing arcs are runtime effects at the exact aim angle.
- **In-match size:** the knight including the dollop is about 100px tall in a 128x128 cell, which is 2x the 50px it occupies at 1280x800. That is 1x on a 2560x1600 or 1440p screen and a good downscale at 1080p and on the Steam Deck. Anchor at the feet.
- **Menu size:** a separate 320px-tall set for the title, Wardrobe, character select and results screens, shown at 3x to 5x. It covers a turntable idle in 8 directions, wardrobe poses, victory and the idle variants.
- **Frame rate:** authored at 30fps with Constant (stepped) interpolation and exported at 15fps with held extremes. Contact frames can be on ones (30fps). The game still runs at 60fps, as Cuphead does [12].
- **Frame counts:** see the table in 3.9. That is 592 in-match frames per layer, with victory and menu animations in the menu set only.
- **Shading:** 2 or 3 constant bands, one light from the top-left, cool shadows not black ones [38], and hand-edited normals on the helms [46].
- **Outline:** a dark plum inverted-hull contour at 5 to 6px at 2x (2.5 to 3px in play), 3 to 4px Line Art interior lines, and an optional 2px player-colour rim outside the contour at runtime.

### 5.2 How the customisation parts are structured

| Part | Variants | How it is made | Runtime |
|---|---|---|---|
| Body (armour, arms, legs, boots, shield) | 1 | Rendered per direction, animation and frame | Metal zone through one of 3 ramps; shield face uses the player-colour ramp plus the emblem (UV) |
| Tabard | 1 | In the body render, with ID and UV passes | Player colour ramp plus the emblem sampled by UV |
| Cape | 1 shape | Separate layer, with cloth baked into the animations | Pattern (6) sampled by UV and tinted by player colour; draw order per frame |
| Helm | 6 | Separate layer each, occluded by the body | Metal ramp; exports top, plume and face anchors per frame |
| Plume | 5 | Separate layer each, 4-frame flutter | Player colour ramp; spring lag on rotation |
| Custard dollop | 1 | Small set: 8 directions x 3 squash poses | Damped spring for squash, stretch and lean; flies off on a KO |
| Eyes | Presets | Procedural, drawn at the face anchor, as in the current code | Glare, squint, X eyes, blink |
| Blade | 6 | One rotation sheet per blade (16 to 32 angles) | Placed on the hand anchor, rotated at runtime; smear as an effect |
| Chicken | 1 body plus skins | Its own small model and set | Skins by ramp and UV |
| Team mode | n/a | n/a | Cape, plume and shield face use red or blue ramps; the emblem keeps the personal colour |

This mirrors Diablo II's part layers [54] and Don't Starve's symbol swaps [21]. Colour and pattern work as in Fall Guys [29]. KO pop-offs work like TowerFall's hats [32].

### 5.3 Step-by-step plan

1. **Week 1: decision spike (no commitment yet).**
   - Block out one knight: body, one helm, one plume, the dollop.
   - Rig it and animate idle, run and a light swing.
   - Toon-shade and outline it, and render 8 directions with layers.
   - Load it into the browser build behind a flag with a minimal compositor.
   - Compare it with the current `drawKnight` in the lab sheet (`art/lab/render.py`) at 1x on every arena and at 5x.
   - Go or no-go: does it read better at 50px, and does it look drawn rather than CG?
   - If it looks too CG after the shading work, test the same model in real-time Godot (option d) before falling back.
2. **Week 2: model sheet and silhouettes.**
   - Settle the proportions: helm plus face at 42 to 48% of height, taller torso, real arms, chunky boots, an oversized sword and shield.
   - Test all 6 helms as solid fills at 50px (see 2.1) and use the Fall Guys zoom-out check [29].
3. **Weeks 3 and 4: modular kit.**
   - Model the body, 6 helms, 5 plumes, 6 blades, the cape, the shield, the dollop and the chicken.
   - Name everything by slot, for example `helm_great` and `plume_feather`.
   - Place empties as anchors: hand, helm top, plume base, face, dollop base.
   - Keep the polygon count low. Dead Cells shows detail is wasted at 50px [2].
4. **Week 5: rig and shading.**
   - A simple custom rig with a scale bone for squash and stretch.
   - The shader from 5.1: bands, fixed light, edited normals, inverted-hull and Line Art outlines.
   - Material-ID and UV output passes.
5. **Weeks 6 to 9: animation.**
   - The 3.9 set, pose to pose with stepped keys, and one mesh deformation per key for "imperfection" [46].
   - Smear poses on swing and dash frames.
   - Cloth bake for the cape.
   - Export cancel and hitbox-active frames per attack as metadata.
6. **Weeks 6 to 7, in parallel: the render pipeline.**
   - A headless Blender Python script that renders direction x animation x frame x layer with holdouts.
   - It writes trimmed PNGs and a JSON of anchors, per-frame layer depth and the cancel and hit frames.
   - It packs atlases per layer.
   - It is re-runnable, so a retime or a new blade means rerunning the script, not redrawing.
7. **Weeks 8 to 9: the runtime compositor.**
   - **Browser:** a WebGL or Pixi layer, or a load-time atlas bake with Canvas as the fallback.
   - **Godot:** a CanvasGroup per knight with a ramp and UV shader.
   - Per-frame layer sort, springs on the plume, dollop and cape, procedural eyes, a slash-arc effect at the exact aim angle, and hit-stop values from 3.5.
8. **Week 10: menu set.**
   - Render the 320px set.
   - Wire the Wardrobe turntable and the unlockable idle variants.
9. **Week 11: readability QA.**
   - Extend `art/lab/sheet.js` to show 8 random knights on every arena.
   - Run colour-blind simulations of all 11 colours in 8-player matches, and confirm the game reassigns clashing colours.
   - Profile 8 knights plus 8 bots on low-end hardware and the Steam Deck.
10. **Keep the fallback live.** Every asset in steps 3 to 5 is a normal rigged Blender file. If Godot and real-time 3D win the spike or come later, the same kit exports to glTF with the same shader ideas, which is what Knight Squad 2 did with its existing designs [22].

### 5.4 What not to do

- **Do not bake whole knights per combination.** That is the Hades trap [5].
- **Do not mirror asymmetric knights.** The sword would change hands.
- **Do not interpolate every key smoothly.** It reads as Flash and CG. Step the keys and hold the extremes [46].
- **Do not add player anticipation to light swings.** Anticipation belongs in the charged heavy and in bot telegraphs [44][65].
- **Do not let colour carry identity alone** [57].

---

## References

1. Thomas Vasseur, "Art Design Deep Dive: Using a 3D pipeline for 2D animation in Dead Cells", Game Developer. https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-
2. "Dead Cells: Using 3D Pipeline for 2D Animation" (translation of the same article with the 50px and 30fps figures). https://sudonull.com/post/14066-Dead-Cells-Using-3D-Pipeline-for-2D-Animation
3. "Learn how Supergiant brought Hades' hand-painted characters to life", Game Developer. https://www.gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life
4. "Behind the art of Hades", MCV/DEVELOP (59 portraits, 68 models, 942,489 animation frames). https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/
5. Supergiant developer (kid_zomb) on 104 frames x 32 angles and why there are no skins, Steam discussions. https://steamcommunity.com/app/1145360/discussions/0/1864993755183591660
6. Supergiant developer on rendering 3D characters from many angles, Steam discussions. https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/
7. Camilo Vanegas, "From Red to Rukey: Building and Animating Characters in Transistor and Pyre", GDC 2018. https://www.gdcvault.com/browse/gdc-18/play/1025041/Animation-Bootcamp-From-Red-to
8. Same talk on YouTube. https://www.youtube.com/watch?v=g79fH5blPmU
9. Notes on "Animating Ori and the Blind Forest", GDC 2015. https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/
10. "How animation powers Ori and the Will of the Wisps" (Rock Paper Shotgun, reposted). https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/
11. "Cuphead Was Made With Nearly Extinct Cartoon Techniques", Inverse. https://www.inverse.com/article/36647-xbox-one-cuphead-animation
12. "Animating Cuphead: the verve of the 1930s with the tech of now", Game Developer. https://www.gamedeveloper.com/art/animating-i-cuphead-i-the-verve-of-the-1930s-with-the-tech-of-now
13. "See How Cuphead's Incredible Cartoon Graphics Are Made", TIME. https://time.com/4123150/cuphead-preview/
14. "How Many Hand-Drawn Frames of Animation Went into Cuphead", Intel Gaming Access. https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead
15. UbiArt Framework, Wikipedia, and "Rayman Reinvented", GDC 2013. https://en.wikipedia.org/wiki/UbiArt_Framework and https://www.gdcvault.com/play/1017800/Rayman
16. Team Cherry FAQ and Unity's Hollow Knight case study. https://www.teamcherry.com.au/faq and https://unity.com/made-with-unity/hollow-knight
17. HollowKnightGodot community recreation (12fps sprite playback, unverified). https://github.com/tbh272/HollowKnightGodot
18. "Postmortem: DrinkBox Studios' Guacamelee!", Game Developer. https://www.gamedeveloper.com/business/postmortem-drinkbox-studios-i-guacamelee-i-
19. "Get a job: Be a 2D Animator for DrinkBox Studios", Game Developer. https://www.gamedeveloper.com/art/get-a-job-be-a-2d-animator-for-drinkbox-studios
20. "Doing 2D game animation the Klei way", Game Developer, and "2D Animation at Klei", GDC Vault. https://www.gamedeveloper.com/art/video-doing-2d-game-animation-the-klei-way and https://gdcvault.com/play/1020165/2D-Animation-at-Klei
21. Klei forums on `AnimState:OverrideSymbol` and `Transform:SetFourFaced`. https://kleiforums.com/forums/topic/71221-question-about-animstateoverridesymbol/ and https://forums.kleientertainment.com/forums/topic/79799-transformsetfourfaced-hook-in/
22. "Knight Squad 2: Developing and Marketing an Indie Game", 80.lv. https://80.lv/articles/knight-squad-2-developing-and-marketing-an-indie-game
23. "Knight Squad: An Indie Gem + Chainsawesome Games Q&A", FictionTalk. https://fictiontalk.com/2020/03/20/knight-squad-an-indie-gemchainsawesome-games-qa/
24. "Knight Squad 2 for Nintendo Switch: Review", eShopper Reviews. https://eshopperreviews.com/2026/02/25/knight-squad-2-for-nintendo-switch-review/
25. "Knight Squad 2 Review", Xbox Tavern. https://www.xboxtavern.com/knight-squad-2-review/
26. "Castle Crashers update increases frame rate, texture sizes", PC Gamer. https://www.pcgamer.com/castle-crashers-update-increases-frame-rate-texture-sizes/
27. Castle Crashers sprite rips and notes, The Spriters Resource. https://www.spriters-resource.com/pc_computer/castlecrashers/
28. Castle Crashers, Wikipedia (development and art process). https://en.wikipedia.org/wiki/Castle_Crashers
29. "Creating the Character Designs of Fall Guys", PlayStation Blog, and "Meet the minds behind the Fall Guys costumes", ESPN. https://blog.playstation.com/2020/05/25/creating-the-character-designs-of-fall-guys-out-on-ps4-this-summer/ and https://www.espn.com/gaming/story/_/id/29734365/meet-minds-fall-guys-costumes
30. Overcooked chefs and player colours, Overcooked Wiki. https://overcooked.fandom.com/wiki/Chefs
31. Brawlhalla: Wikipedia (Adobe AIR), official wiki on weapons and skins, and the /SKILL interview with Blue Mammoth. https://en.wikipedia.org/wiki/Brawlhalla , https://brawlhalla.wiki.gg/wiki/Weapons , https://brawlhalla.wiki.gg/wiki/Skins and https://www.slashskill.com/brawlhalla-an-interview-with-blue-mammoth-games/
32. TowerFall: "Road to the IGF", Game Developer; "Alternate Archers", TowerFall blog; archers page, TowerFall wiki. https://www.gamedeveloper.com/design/road-to-the-igf-matt-thorson-s-i-towerfall-ascension-i- , https://towerfall.tumblr.com/post/110562144181/alternate-archers and http://towerfall.wikidot.com/archers
33. Duck Game custom hats, Duck Game wiki and Steam guide. https://duckgame.fandom.com/wiki/Custom_Hats and https://steamcommunity.com/sharedfiles/filedetails/?id=494155668
34. "Moving Out dev on the importance of inclusivity and accessibility", GameSpot. https://www.gamespot.com/articles/moving-out-dev-on-the-importance-of-inclusivity-an/1100-6477261/
35. Heave Ho, Wikipedia. https://en.wikipedia.org/wiki/Heave_Ho
36. Party Animals, Wikipedia. https://en.wikipedia.org/wiki/Party_Animals_(video_game)
37. Battle Chef Brigade, Kickstarter and Wikipedia. https://www.kickstarter.com/projects/trinket/battle-chef-brigade and https://en.wikipedia.org/wiki/Battle_Chef_Brigade
38. Valve, "Stylization with a Purpose: The Illustrative World of Team Fortress 2", GDC 2008 slides, and "Illustrative Rendering in Team Fortress 2", NPAR 2007. https://cdn.akamai.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf and https://steamcdn-a.akamaihd.net/apps/valve/2007/NPAR07_IllustrativeRenderingInTeamFortress2.pdf
39. Sakurai, "Thinking About Hitstop", Famitsu column translated by Source Gaming. https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/
40. Shane Sicienski, "Hitstop in Capcom Beat 'Em Ups". https://shane-sicienski.com/blog/blog-post-title-one-55pmn
41. "What Features Influence Impact Feel? A Study of Impact Feedback in Action Games", arXiv 2208.06155. https://arxiv.org/abs/2208.06155
42. Celia Wagar, "Hitstop/Hitfreeze/Hitlag/Hitpause", CritPoints, with Guilty Gear and Street Fighter figures from the search summary. https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/
43. Jan Willem Nijman, "The Art of Screenshake", INDIGO 2013. https://www.youtube.com/watch?v=AJdEqssNZ-U
44. Jonathan Cooper, "The 12 Principles of Animation in Video Games", Game Anim. https://www.gameanim.com/2019/05/15/the-12-principles-of-animation-in-video-games/
45. Christoph Lendenfeld, "Smearframes in Video Games" (thesis), and CGWire on smear frames. https://theses.fh-hagenberg.at/system/files/pdf/Lendenfeld18.pdf and https://blog.cg-wire.com/smear-frames/
46. Junya C. Motomura, "Guilty Gear Xrd's Art Style: The X Factor Between 2D and 3D", GDC 2015 handout. https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf
47. "Idle Animation for Games: Design Guide", MoCap Online, and GarageFarm idle animation tips. https://mocaponline.com/blogs/mocap-news/idle-animation-game-dev-guide and https://garagefarm.net/blog/idle-animation-tips-to-animate-your-characters
48. Spine: purchase page, runtimes licence, spine-ts README, spine-pixi, skins, spine-godot. https://esotericsoftware.com/spine-purchase , https://esotericsoftware.com/spine-runtimes-license , https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/spine-ts/README.md , https://en.esotericsoftware.com/spine-pixi , http://esotericsoftware.com/spine-skins and https://en.esotericsoftware.com/spine-godot
49. Rive: pricing docs, pricing blog, runtime licence, community Godot runtime. https://rive.app/docs/account-admin/pricing , https://rive.app/blog/new-pricing , https://github.com/rive-app/rive-runtime/blob/main/LICENSE and https://github.com/maidopi-usagi/RiveGD
50. DragonBones: JS runtime and the "Did you guys discontinue?" issue. https://github.com/DragonBones/DragonBonesJS and https://github.com/DragonBones/dragonbones.github.io/issues/26
51. Spriter Pro and character maps, BrashMonkey. https://brashmonkey.com/spriter-pro/ and http://www.brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm
52. Godot documentation, "Cutout animation". https://docs.godotengine.org/en/stable/tutorials/animation/cutout_animation.html
53. Blender toon and outline techniques, plus sprite-render add-ons: Shader to RGB manual; Blender Artists outline comparison; BlenderNation outline techniques; Character Renderer for 2D games; Blender Spritesheet Renderer. https://docs.blender.org/manual/en/latest/render/shader_nodes/color/shader_to_rgb.html , https://blenderartists.org/t/whats-the-best-outline-for-toon-anime-freestyle-vs-inverted-hull-method-vs-another-method-in-2-9/1278907 , https://bazaar.blendernation.com/listing/10-outline-techniques-i-wish-i-knew-sooner/ , https://dener.itch.io/character-renderer-for-2d-games and https://github.com/chrishayesmu/Blender-Spritesheet-Renderer
54. Diablo II animation layers (HD, TR, LG, RA, LA, RH, LH, SH, S1 to S8) and directions, Phrozen Keep tutorial. https://d2mods.info/resources/infinitum/tut_files/dcc_tutorial/chapter2.html
55. Slynyrd, "Pixelblog 55: Top Down Character Animation", and Sunnyside, "4, 6... 8 Way Character Movement". https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation and https://danieldiggle.itch.io/sunnyside/devlog/816790/4-6-8-way-character-movement-
56. "Design Tips: In-Game Proportions and Scale", Game Developer, and chibi proportions, Clip Studio Tips. https://www.gamedeveloper.com/design/design-tips-in-game-proportions-and-scale and https://tips.clip-studio.com/en-us/articles/4829
57. Game Accessibility Guidelines, colour; Can I Play That colour-blindness guide. https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/ and https://caniplaythat.com/2020/01/29/color-blindness-accessibility-guide/
58. "Character Shape Language", CGWire. https://blog.cg-wire.com/character-shape-language/
59. Palette and colour swapping: Cyanilux tutorial and Godot Shaders colour remap. https://www.cyanilux.com/tutorials/color-swap/ and https://godotshaders.com/shader/color-remap-shader-palette-swapper/
60. "This guy may just have revolutionized 2D pixel animation" (aarthificial's UV-mapped sprites). https://blog.derlin.ch/this-guy-may-just-have-revolutionized-2d-pixel-animation
61. Rain World animation, GDC 2016 (Joar Jakobsson, James Therrien). https://www.gamedeveloper.com/art/video-animating-i-rain-world-i-and-its-many-squishy-stretchy-creatures and https://www.youtube.com/watch?v=-iXwvoFhPuU
62. David Rosen, "An Indie Approach to Procedural Animation", GDC 2014. https://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approach
63. "Cult of the Lamb art director reveals...", Inverse (Spine rig, 300 animations). https://www.inverse.com/gaming/cult-of-the-lamb-concept-art-interview-massive-monster/amp
64. Darkest Dungeon Spine workflow, Steam workshop group discussion. https://steamcommunity.com/groups/dd-workshop/discussions/0/135514800409348324/
65. Pedro Medeiros, "Simple Attack Animation" (Patreon) and tutorial index. https://www.patreon.com/saint11/posts/simple-attack-6837623 and https://saint11.art/blog/pixel-art-tutorials/
66. "Sprite animation frames: how many do you actually need?", Sprite-AI (general guide, lower authority). https://www.sprite-ai.art/blog/sprite-animation-frames
67. "Spine 4.2: The physics revolution", Esoteric Software. https://en.esotericsoftware.com/blog/Spine-4.2-The-physics-revolution
