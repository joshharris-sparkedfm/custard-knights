# Custard Knights: cosmetics worth earning

Implementation sequence and dependencies are in the [master build plan](BUILD-PLAN.md). This document defines the gameplay-earned cosmetic collection and progression rules.

Design recommendation · 8 October 2026

**Every cosmetic is earned by playing. No microtransactions. The collection should make players think “I want to look like that”, then give them a clear, enjoyable route to getting it.**

This records Josh's requirement and the proposed design. It does not implement assets, progression or payments. Read with [The Great Pudding War](THE-GREAT-PUDDING-WAR.md) and the [player-behaviour roadmap](PLAYER-BEHAVIOUR-ROADMAP.md).

## Product rules

- No paid cosmetics, premium currency, paid random drops, paid progression skips or paid battle passes.
- No loot boxes or duplicate drops. Players see what they will earn and how.
- No expiring cosmetic rewards or punished login streaks. A player returning after a month can still finish their chosen goal.
- Cosmetics never change damage, range, health, movement, visibility rules or hitboxes. No set bonuses.
- Keep attractive choices available from the start. A new player should look like a character, not an unfinished mannequin.
- Retain every item players already own. Future changes must not relock an existing entitlement.
- The base game's collection is obtainable through play. The purchase model for the game itself remains a separate decision.

## What already exists

The current source has six helmets, five plume styles, metal finishes, emblems, colours, cape patterns, blade skins and six chicken skins. Its 18-tier track unlocks cosmetics every 25 earned Custard Coins. Six challenges offer early unlocks. Wooden, baguette, fish, candy-cane and spoon blades already exist; they should not be presented as new assets.

Progress is currently stored in one browser-wide `PROG` object. Looks can vary by local seat, but permanent progression is not independently owned by every couch player. Online challenge attribution also needs the fixes identified in the roadmap.

Keep that collection as the starting wardrobe. Add memorable new pieces and better ways to choose a goal before increasing the number of tiers.

## Four ways to earn things

| Route | Player promise | Example |
|---|---|---|
| **Adventure** | “I brought this back from somewhere.” | A Rice Guard helmet for completing the rice chapter; an Angelic cape for helping the pink court |
| **Chosen collection goal** | “I can work towards the item I actually want.” | Pin the Rooster Crown and earn its published milestones through completed encounters or rounds |
| **Mastery** | “This shows something I learned to do.” | A distinct reflected-arrow emblem or embroidered cape for a specific skill feat |
| **Party memories** | “This reminds us of that ridiculous evening.” | A Cup trophy decoration, team pennant or victory pose earned from finishing a cup or a shared objective |

The first release should use deterministic rewards. A spinning reward wheel adds nothing useful to the promise.

### A choice of goals without another currency

Keep the existing Custard Coins as cumulative earned progress for the legacy track. They are not purchased or spent. Introduce a small goal board with one pinned item at a time and a clear requirement, such as “Complete six rounds or campaign encounters”. Show partial progress, allow free switching, and retain the progress already earned for each selected goal.

Completion progress counts while the goal is pinned; switching does not retroactively apply past rounds to every item. Story and mastery achievements can be recorded whether pinned or not. This distinction must be explicit in the data and understandable in the UI.

Avoid adding separate rice tokens, pink gems, recipe fragments and crafting dust. The interesting decision is which look to pursue.

### Let everyone earn a good look

Provide an accessible route to each main visual theme. Where practical, a base item can be unlocked by a story milestone **or** a visible play-based goal, so party-only players can collect it too. Reserve an extra badge, trim or title for the specific accomplishment.

For example, the Rice Guard helmet can come from clearing the rice chapter or completing a published series of combat encounters. Marshal Rind's distinctive crest can remain tied to his optional mastery challenge. Never make the basic pink, rice or chicken look dependent on beating expert players online.

Wins and advanced feats can earn special recognition, but ordinary completion must also feel worthwhile. Reward objective play rather than making KO farming the only efficient path. Avoid goals that ask players to sabotage teammates, repeatedly target beginners or lose deliberately.

## What makes a cosmetic worth wanting

Give a new piece at least one visible characteristic beyond a colour swap: a recognisable shape, well-crafted material, restrained movement, or a strong comic idea. Design it at actual gameplay scale first, then enlarge it for the wardrobe.

Build sets from mixable pieces. A player should be able to wear a rice helmet, a custard cape and a fish sword without the combination looking broken. Keep the base knight silhouette, attack silhouettes and team indicators readable.

Most character should come from helmets, capes and poses. Plumes, emblems and colour variants are useful supporting rewards. Reserve screen-filling effects for gameplay powers, not ownership status.

### Proposed collection

These are design concepts. Existing items are identified explicitly; all other art and behaviours still need production.

| Item or set | Why someone might want it | Proposed route |
|---|---|---|
| **Tea Towel cape** | A proper checked kitchen towel, clipped on with an oversized peg | Choice after the first meaningful accomplishment |
| **Burnt Toast cape** | Toast-shaped cloth, singed edges and a small butter patch | A short chosen goal; accessible without winning |
| **Rice Guard helmet** | Pudding-bowl crown, rice-grain detailing and a severe little visor | Rice chapter or a published completion goal |
| **Marshal's Crest** | A distinctive spoon crest and stitched rice emblem | A readable Marshal Rind mastery feat |
| **Angelic court set** | Pink whipped plume, pearlescent metal and a flowing napkin cape | Pink chapter or alternative goal; later content |
| **Golden Whisk blade** | A polished whisk with a clear, chunky outline | A longer chosen goal, with no change to reach |
| **Rooster Crown** | A grand helmet with a ridiculous red comb | A substantial but finite chosen goal; preview from the start |
| **Steve Strut** | Your knight attempts Steve's strut on the result podium | Rescue Steve or finish a short party objective sequence |
| **Jelly plume** | A wobbling plume that settles when you stop | Jelly chapter; later animation work |
| **Trifle ceremonial cape** | Three beautifully stitched layers and a cherry clasp | Campaign completion; later content |
| **Order of the Reflected Spoon** | A bold shield emblem and title linked to a real counter | A clear reflection challenge with an optional practice route |
| **Baguette, fish and spoon blades** | Existing comedy weapons that deserve a better showcase | Preserve current earned ownership and existing routes |

Names and exact requirements are provisional. Do not advertise finished sets or locked silhouettes as promised content before they are in production.

## The wardrobe should sell the idea, not sell the item

The wardrobe is a dressing room and collection book, with no cash interface.

- Preview locked items on your actual knight, including a gameplay-scale preview.
- Show the item's name, one good line of description, exact unlock condition and progress.
- Offer **Work towards this**, **Try it on**, and **Equip** when owned.
- Preview full looks and individual pieces. Save three outfit presets initially.
- Show equipped items clearly in lobbies and on the results podium, where friends have time to notice them.
- On unlock, show the item on the knight with **Equip now** and **Keep current look**. Keep celebrations brief and skippable.
- Explain achievement provenance: “Earned by rescuing Steve.” Do not invent rarity percentages.

Example card:

> **Rooster Crown**
>
> Technically a helmet. Legally a chicken.
>
> Finish 12 rounds or campaign encounters while working towards this goal.
>
> **7 of 12 completed · Work towards this**

The number above is an initial tuning example, not a fixed economy commitment. Measure actual completion time and whether players still want the reward.

## Pacing and collection size

Give the player one memorable permanent choice in their first session. Start with a simple choice between two desirable items; teach the larger collection screen later.

Mix small near-term rewards with a few longer goals. Preview a desirable item early, show a reachable step, and let players change their minds. Do not inflate requirements simply because a goal is popular.

For the first campaign prototype, add **six well-made items at most**: Tea Towel cape, Burnt Toast cape, Golden Whisk blade, Rooster Crown, Rice Guard helmet and Steve Strut. Preserve the existing wardrobe alongside them. Art-test the two helmets first; their recognisability matters more than producing dozens of variants. If poses or helmet production exceed capacity, prototype with existing assets and postpone the affected reward rather than disguising recolours as finished signature items.

The pink, jelly and trifle collections follow the corresponding playable chapters. They do not need to be produced in advance.

## Multiplayer fairness and saves

Use the same owned collection in solo and multiplayer. Campaign-earned cosmetics never unlock combat advantages or basic party modes.

For the first couch release, recommend an explicitly shared household wardrobe: each seat can choose its look, and qualifying accomplishments by any local human can contribute to that wardrobe. General completion progress pays once per household round, not once per seat. Attribute skill feats to individual actors before deciding whether the household earned them; do not accidentally combine three players' separate actions into a feat that says “one knight”.

This requires changing the existing first-local-player reward selection. Online guests need their own authoritative per-player summary and local save updates. Display shared versus individual ownership honestly.

Use stable item IDs, versioned saves and idempotent award records. Preserve old track unlocks and challenge entitlements when adding the goal board. Repeated result messages, reconnects and loading a completed node must not pay twice. Persist partial goal progress and chosen outfits.

For the browser version, provide a tested progress export/import path before promising durable ownership across devices. For a future Steam build, evaluate cloud saves as part of packaging. Neither is implemented by this document.

Cosmetic geometry must stay inside agreed readability bounds. Test all relevant directions and animations; an oversized hat must not hide attack tells or create the impression of a larger hitbox. Preserve team colour markers, settings for flashing and readable projectile effects. Victory poses run after combat and never hold up the group's next round.

## My additional recommendations

1. **Make two or three cosmetics recognisable enough to appear in the game's marketing.** The Rooster Crown and Golden Whisk are candidates, not validated winners. Test small previews with players before producing the whole catalogue.
2. **Make the first reward a choice.** It reveals taste and gives players ownership of their look immediately.
3. **Connect impressive rewards to good memories.** Rescuing Steve is a better explanation for a chicken pose than simply filling another identical progress bar.
4. **Keep a short path and a long path visible.** A player should see something they can earn soon and something they want eventually.
5. **Carry identity between the campaign and Cups.** A solo player's reward becomes a conversation starter when friends arrive.
6. **Treat low equip rates as an art/design problem to investigate.** More items will not fix a collection people do not want to wear.

These are design hypotheses, not measured retention effects. Observe which items players preview, choose, earn, equip and keep wearing. Ask what they hoped the item would look like in play. Compare voluntary return and enjoyment as well as completion; a higher completion count alone can simply mean easier requirements.

## Build sequence and acceptance

First fix save/reward attribution. Then add a data-driven item catalogue and goal board, preserving existing entitlements. Prototype locked-item previews and a first-session reward choice with current assets. Produce the six-item capsule only after the silhouettes and goals make sense to players.

Acceptance checks: existing players retain all items; any couch seat can contribute under the documented shared rules; remote guests receive their own progress; retrying a result cannot award twice; switching goals preserves earlier progress; outfits survive reload; cosmetics cannot affect combat; all unlock routes remain visible and available; and the next round is never blocked by the celebration.

No implementation or live-player validation has been performed for this proposal.
