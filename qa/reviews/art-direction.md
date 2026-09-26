# Custard Knights: art direction review

Reviewer: art direction agent, 26 Sep 2026, from screenshots and the drawing code.

## 1. Character models

**Why it's "good but not great":** the finish is right. Ink outlines, glowing eyes, metal gradients and the wobble on the plumes all look like Knight Squad. The anatomy is what holds it back. Each knight is a round helmet on a small trapezoid with two floating ellipse feet. The sword and shield orbit the body on their own (`drawSword` translates by `r*.7`) and no arm connects them. That makes all 8 the same "bucket with a hat". At 44px only the plume tells them apart, and every knight has the same face.

Changes in priority order:

1. **Arms.** In `drawKnight`, after `drawBody`, draw one short capsule per side from the pauldron (`±r*.6, top+r*.06`) to the weapon hand and the shield grip. Use `lineWidth=r*.22+4` in INK, then `r*.22` in the metal gradient, the same two-pass trick as Steve's legs. This one change fixes the "floating props" look.
2. **Proportions.** Make the head 10% smaller (`hr=r*.78`) and the torso 15% taller (`bot=r*.7`). Swap the ellipse feet for small boot capsules with a toe pointing along `fx`. The head should be about 45% of total height instead of about 55%.
3. **Silhouette per helm.** Push each shape past a circle, because the helm is the silhouette. Great helm: flat top, 1.15x wider than tall. Kettle: brim at `hr*1.6`. Sallet: long tail flaring backwards along `-fx`. Barbute: taller, narrow T-slot. Horned: horns 30% bigger. Test each one as a solid-INK fill at 44px. If two look the same, change one.
4. **Weapon scale.** The blade is `R*.95` long and reads as a needle. Make it 20% shorter, make `w` 1.6x wider, and give it a chunky crossguard. Grow the shield 25% and give it a thicker metal rim.
5. **Face and personality.** Give each knight an eye preset: round, sleepy (the top third clipped), tiny dots, or one big and one small. Add a per-knight brow tilt, and one "tell" such as a moustache poking out of the visor or a dented helm. Store it on `e.kit.face`.
6. **Animation** (all as scalar transforms on the existing groups):
   - **Idle:** breathing, with torso `scaleY 1±.03` at 2Hz. Plume sway is already in. Add a look-around every 4 to 7 seconds: the visor `vx` slides to the other side for 0.4s.
   - **Run:** raise the bob to 5px and add 6° of body lean into the velocity (the current clamp is 0.1 rad at normal speed). Alternate the arm swing against the feet. Emit a dust puff every half cycle.
   - **Attack:** add an 80ms wind-up. Rotate the sword to `face-2.0`, squash the body to `1.1x/0.9y` and lean back. Then swing with the existing ease. Hold the blade 60ms at the end with the torso twisted `+0.15rad`, then return over 120ms.
   - **Hit:** freeze both knights for 3 frames. Squash the victim `0.8x/1.2y` then snap back, and knock it back with 10° of tilt away from the hitter. Show the eyes as X shapes for 0.3s. Keep the white flash but make it 2 frames, not a fill.
   - **KO:** the helm pops off on its own arc and spins, the body drops flat with a 3-frame squash, and 5 stars orbit it. Then "poof" into custard splat decals.
   - **Victory:** knight jumps (`y -= 20`, landing squash), raises the sword overhead and the plume bursts.

## 2. Readability at play scale

- **Colour ownership is split.** The plume, metal and tabard each carry a different hue, and the gold metal clashes with custard pickups. Put `e.color` on the plume, cape and shield face. Keep the metal neutral. Retire gold metal for bots.
- **Dark metal disappears** on the dungeon and bog maps. Add a 2px `e.color` rim just outside the INK stroke on the helm and body. That rim is a character-select-style player colour outline.
- **Outlines:** 3px INK is right at 1280 wide, but the inner lines at 1.5px disappear. Use 2px minimum.
- **Team mode:** the only team marker is a 3.5px ring under the feet. In teams mode, tint the cape, plume and shield to red or blue (override `pc`), and keep personal colour on the emblem only.
- **YOU marker:** there are three layers (pill, dashed ring, "THIS IS YOU"). In `t_pie` and `t_spot` the big label collides with the kill feed. Keep the pulsing ring and the pill. Show "THIS IS YOU" only during the countdown, and clamp it away from the feed rectangle.
- **Names and hearts:** by default show them only for the player, targets within 250px and the leader. Otherwise draw hearts only, at 70% scale. Pickup callouts ("Prickly Armour", "PRICKLED", "CLANG") stack on top of each other in `t_norr`. Show them only for the local player and within 300px, stack them vertically, and cap them at 2.
- **Pickups** sit on yellow rings, which look like the gold bumpers. Put pickups on a teal pedestal with a bob, and keep yellow for hazards and interactables.

## 3. Arenas and HUD

- **Courtyard:** the strongest map. Too many grass blades, so cut density to 30%. The riveted blocks read as dice, so give them a bolted plate cross.
- **Frost:** white on white, and steel knights vanish. Darken the floor to `#BFD3E6`, keep the ice lighter, and add a blue ambient tint to the knights' shadows.
- **Factory:** the conveyor chevrons are the loudest thing on screen. Drop them to 60% contrast and animate them slowly. The mint floor looks washed out, so warm it slightly.
- **Dungeon:** the lava is good. The dark leaf-shaped floor smudges look like dirt. Replace them with flagstone cracks. Add a lava glow (additive radial) onto nearby walls.
- **Rooftop:** the scale tiles are a busy repeating pattern. Enlarge them 2x and lower their contrast. The moon and stars are a nice touch.
- **Bog:** far too dark, with the vignette eating the knights. Lift overall brightness 25% and use fog wisps instead of darkness.
- **Consistency:** keep one light direction (top-left, which the helm highlights already use) and one shadow colour for every map. Every map shares the same wall, banner and torch frame, so give each arena a unique top border prop.
- **HUD:** the kill feed overlaps play space, so move it into the top frame band or reduce it to 2 lines. Enlarge the timer plaque 20%. The chaos bar is excellent; keep it.

## 4. Effects and juice

**Add:**
- Hit-stop (3 frames) and screen shake scaled to damage.
- Impact star bursts in the hitter's colour.
- Custard splat decals that last 8 seconds.
- A KO camera punch-in (1.05x for 200ms).
- Slow-mo on the last KO.

**Tone down:**
- **Event banners** sit on the arena centre where the fighting is. Cap them at 1.2 seconds, shrink them to 70% and slide them to the upper third. Subtitles in `t_meteors` overlap other text, so give the subtitle its own plaque.
- **Additive glows** (Norr, the Steve aura, the shield) stack into white mush. Limit to one aura per knight.

**Keep:**
- The meteor warning circles and the Lights Out torch holes. Both read well.

## 5. Title screen and menu

**Title screen**
- Full-bleed live demo arena with a 40% plum dim.
- Logo: centre-left, Lilita at 120px, "CUSTARD" in custard and "KNIGHTS" in pink. Give it a 6px INK stroke and an 8px drop shadow. Add a custard drip path under the letters that drips on a loop, and have the logo tilt ±2° on an idle wobble.
- On the right, 3 knights in idle poses (drawKnight at 3x scale). One swings a sword every 5 seconds.
- A "PRESS ANY BUTTON" prompt that pulses.

**Main menu**
- A vertical stack of 5 chunky buttons on the left: Play, Local Party, Online, Wardrobe, Settings.
- Hovering a button makes a knight on the right react: point, wave, or sword-salute.

**Play screen**
- A horizontal row of mode cards (240x320). Each card has a live mini-arena thumbnail, a title, one line of description and a player count.
- Arena select is a second row of cards, each with a painted preview rendered from `drawBg` at 0.25 scale.

**Wardrobe**
- Left: a large rotating knight preview. Cycle front, side and back every 3 seconds, or drag to rotate. It plays idle, and plays a swing when you select a weapon.
- Right: tabs for Helm, Plume, Metal, Emblem, Colour, Cape, Blade, Taunt. Each tab is a grid of 64px swatches rendered live.
- Randomise button, and a name field.

**Settings**
- Volume sliders, screen shake (0 to 100), colourblind outline mode, text size, and "show all names".

## 6. Customisation for Early Access

**Launch set:** the current 6 helms, 5 plumes, 3 metals, 8 emblems and 8 colours, plus:
- **Cape patterns (6):** plain, stripes, chevron, checker, stars, trim. Clip to the cape Path2D.
- **Blade skins (6):** steel, wooden, baguette, fish, candy cane, spoon. Change the blade path and fill only.
- **Taunts (6):** bow, dance bob, sword twirl, helm tip, flex, custard slurp. Bind to the existing Shout.
- **Victory poses (4).**
- **Chicken skins for Chicken Racing (6):** hen, rooster, rubber chicken, knight chicken (tiny helm), golden, and a chicken in your team's colours. Reuse the `drawChicken` layers.

**Progression**
- "Custard Coins" from matches: +1 per KO, +5 for a win, +3 for playing.
- A 30-tier cosmetic track, where every 5th tier is a helm or blade.
- Per-arena challenges (for example "KO 3 knights with lava on Dragon's Larder") unlock themed items.
- No paid currency in Early Access. Everything is earnable, which the Steam reviews will reward.
