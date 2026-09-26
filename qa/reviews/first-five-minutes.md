# Custard Knights: first five minutes, playtest review

Reviewer: playtest lead agent, 26 Sep 2026. Built from the code, README and screenshots; the agent did not run the game.

Numbers that shape everything below: a match lasts 180s. Chaos fills at `dt/115` plus 0.025 per knockout, so Silly arrives at about 0:35 and Unhinged at about 1:10. Bots default to Spicy and the arena to "Surprise me". There is no gamepad support anywhere in the file.

## Personas

**(a) 9-year-old, laptop trackpad**
- **0:00–0:30:** Sees a tall purple panel and clicks the big red button without reading. Controls are collapsed below a wall of text, so they never open them.
- **0:30–1:30:** "THIS IS YOU" lands. They mash arrows and click the trackpad, and clicking does nothing. They find Space by accident. They're knocked out by Spicy bots within about 20s. "Sir Cumference bonked You" scrolls past in small text top-right. There's no reason given and no "dash over pits".
- **1:30–3:00:** They pick up a "?" crate and "Magnet Mitts" floats up, with no hint of what it does. The chaos bar means nothing to them.
- **3:00–5:00:** They finish 8th on 0. The end card says "You finished #8 with 0 KOs". Risk they quit.
- **Delights:** names like Lord Nibbles, chickens, "bonked", the helmet flying off.

**(b) Two friends, one keyboard, at a party**
- **0:00–1:00:** Find "2 on one keyboard", then open Controls. P1 uses F/G/H for swing/dash/block. P2 uses K/L/J, a different order from the solo J/K/L mapping. Their hands collide around G/H/J, and shouts on 1–4 and 7–0 mean letting go of movement.
- **1:00–3:00:** Laptop key ghosting drops inputs when both players press four keys at once. P2's pointer sits under the knight and gets lost under the feed.
- **3:00–5:00:** They laugh at Steve and Norr and want a rematch. It's one click, which is good.
- **Delights:** the Norr roar, Bounty on each other, Red vs Blue co-op.

**(c) Steam player, Xbox pad, never reads**
- **0:00:** The pad does nothing, in the menu or in the match. This is a hard stop. They go back to the keyboard grudgingly, or leave.
- **If they persist:** same as (a), minus any patience.

**(d) Streamer, 60 seconds to find something funny**
- **0:00–0:20:** Menu setup and "FIGHT!".
- **0:20–1:00:** Only Sensible power-ups are live. With luck they get one arena event (Trapdoors or Gale Force). The chickens, Swap Party and Jelly Arena, the actual clip material, show up after they've left.
- **Also:** power-up names pile up on top of each other ("PRICKLED / Prickly Armour / Magnet Mitts / Pie Traps" in `t_norr.png`) and are unreadable on stream. The feed prints "You has the power of Norr".
- **Delights:** THE POWER OF NORR banner, Steve, bots panicking.

**(e) Opens an invite link**
- **0:00:** The menu loads. The code is pre-filled, but the instruction sits in small grey text under the Join field, below the big red Start button. Many will press Start and end up in a solo game.
- **If they Join:** the lobby shows "Waiting for the host to start", with no controls, arena or colour.
- **Late arrival:** someone clicking after the match started is bounced to the menu with "That match has already started". They never come back.
- **In match:** no pause, and no reminder of controls.
- **Delights:** it's instant with no install, and their name shows over their knight.

## 12 fixes, ranked

1. **Gamepad support.** Use the Gamepad API with up to 4 pads.
   - Left stick moves, A swings, B dashes, RB/LT blocks, D-pad shouts, Start pauses.
   - The menu can be driven from the D-pad.
   - The first pad to press A becomes P1 or P2.
2. **Invite landing card.** When `?join` is present, show only this: "You've been summoned to room ABCDE", with the name field focused, a big **Join** button, and a small "or play on your own" link.
   - Late joiners get "Match on. You're in the next round" and wait in the lobby instead of being bounced.
3. **Pre-match control card, 3s, skippable.** Shown every time until you've landed 3 hits.
   - Show four icons for the chosen input: Move, Swing, Dash, Block.
   - For 2P, show a split keyboard with P1 in teal and P2 in pink.
   - Copy: "Press Swing when you're ready."
4. **Death card, bottom centre, for the 2.2s respawn.** Use `how` and `lastSrc` from `ko()`.
   - "Bonked by Earl Grey's sword. Block with E."
   - "You fell in a pit. Dash hops pits."
5. **Power-up caption for the picker.** Show the name plus a 6-word effect for 1.8s, pinned above your knight: "Magnet Mitts: power-ups fly to you".
   - Other knights' floaters drop to 60% size.
   - Cap at 2 stacked, offset 18px.
6. **Chaos tier-up moments.**
   - When the meter crosses each third: a 2s banner, "CHAOS: SILLY. Crates just got daft.", plus a sting.
   - Put three tiny icons under the bar.
   - First hover or first match: "Chaos rises with time and knockouts."
7. **Chaos speed option.** Normal / Fast (`dt/45`) / Unhinged from the off (start at 0.66).
   - Also add a 90s match-length option.
   - Default Fast for "Quick brawl".
8. **First-run defaults.** Chill bots for the first 2 matches (localStorage flag), then remember the last settings.
9. **HUD collisions.**
   - Move the kill feed to the bottom-right.
   - Hide feed rows that overlap your knight or the "THIS IS YOU" pointer.
   - Bold and colour your own KOs in the feed.
10. **Couch keyboard layout.** Make P2's J/K/L mean swing/dash/block, matching both the solo mapping and P1's F/G/H order.
    - Show "Laptop keyboards can drop keys. Plug in a pad for best results."
11. **Copy bugs.**
    - "You has the power of Norr" should read "You have". It happens because the check is on `e.name==='You'`; use `isMine`.
    - Lower-case "you" in feed lines ("bonked you").
    - "THIS IS YOU" should never render under the feed.
12. **Spike traps read as dice.** Show visible spikes on a timer, and pulse them red 0.5s before they pop.

## Menu structure

1. **Title.** An attract-mode brawl plays behind, as it does now. Logo, then three big tiles:
   - **Quick brawl**
   - **Couch (2–4)**
   - **Online**
   - Small links: How to play, Settings. "Press any key or A" works throughout.
2. **Setup** (shared by Quick and Couch):
   - Arena carousel with thumbnails from `docs/m_*.png`.
   - Mode, Bots, Chaos speed, Match length.
   - A live control diagram for the detected inputs.
   - Big **Start the brawl**.
3. **Online.** Two tabs, Host and Join. Name at the top.
4. **Lobby.**
   - Big code, Copy link.
   - Player list with colour dots.
   - Arena, mode and bots editable by the host here, not back in the main menu.
   - The joiner sees the settings and their controls.
5. **How to play.** Three cards: Fight (swing, block, dash), Weapons, and Chaos with the three power-up tiers. The current wall of text moves here.

**Teach-as-you-play tips.** One at a time, 1.5–2.5s, bottom centre, at least 8s apart, never while a banner is up, each shown once per player:
- **First weapon pickup:** "Bow: Swing fires. Grab another to level up."
- **First arrow heading at you:** "Block bounces arrows back."
- **Within 120px of a pit:** "Dash hops over pits."
- **First ice, conveyor or mud tile:** a one-liner each.
- **First time you're the bounty:** "Everyone wants you. Leg it."
- **Egg spawn:** "Grab the golden egg to ride Steve."
- **Pie spawn:** keep "Eat it and feel the power of Norr" (already good).
- **First respawn:** "Crates can hide power-ups. Give them a whack."

## Steam page

**Pitch:** Eight knights, one arena, and power-ups that start sensible and end with everyone as chickens.

**Taglines:**
- Proper knightly combat, with the proper bit taken out.
- It starts with a longer sword. It ends with a giant cockerel called Steve.
- Mind the trapdoor, dodge the pie, eat the shepherd's pie. NORRRRRRRR.
