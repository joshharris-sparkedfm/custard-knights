# Custard Knights: The Great Pudding War

Implementation sequence and gameplay/graphics priorities are in the [master build plan](BUILD-PLAN.md). This document defines the proposed story and campaign.

Story world and campaign proposal · 8 October 2026

**A kitchen recruit sets out to recover the Golden Spoon, wins a succession of increasingly pointless dessert wars, and discovers that everybody has forgotten to stir.**

Proposed fiction, not existing game canon or implemented functionality. Angel Delight is the dessert Josh confirmed as the inspiration for the pink rival. The proposed original faction name is **the Angelic Delight Empire**. Existing Custard Knights characters, arenas and mechanics are the starting material; new characters and encounters below are proposals.

**Cosmetic requirement:** Josh wants desirable unlockable cosmetics with no microtransactions. [Cosmetics worth earning](COSMETIC-PROGRESSION.md) defines the collection, gameplay-only unlock routes, reward previews, first-session choice, shared couch ownership and a six-item initial capsule. Campaign rewards carry into multiplayer without affecting combat.

## The backstory

For three hundred years, the Custard Knights have fought the Rice Pudding Kingdom over one question:

**Is custard a pudding, or merely something you put on a pudding?**

Custardia considers this an insult to its entire civilisation.

Rice Pudding considers it a reasonable question.

The Angelic Delight Empire considers both sides rather heavy.

There have been seventeen peace treaties, forty-one sieges and one particularly unpleasant incident involving a raisin. Nobody agrees on who started it. Everybody has a painting proving it was somebody else.

At the latest peace banquet, the Golden Spoon is placed between the three rulers. It is the oldest object in the kingdom, the symbol of their shared table, and, according to the palace inventory, "probably quite important".

The rice king rises to make a speech.

A custard pie hits him squarely in the visor.

The Angelic Delight ambassador whispers, "This is why we serve everything cold."

Chairs go over. Guards draw spoons. Somebody declares war on a napkin. In the confusion, a thin, leathery figure slips beneath the table and takes the Golden Spoon.

The player is the kitchen recruit sent to clean up. Their armour does not fit. Their cape is an apron. Their family runs the little bakery outside the castle walls, which is now directly beneath an approaching rice-pudding siege bowl.

They pick up a saucepan lid, hold the pantry door and get the kitchen staff out. Sir Stirling, the kingdom's elderly training knight, sees them still standing when the proper soldiers have retreated.

"Congratulations," he says. "You're the army."

The recruit is sent to recover the Spoon and save the bakery. The court supplies a map, a wooden sword and a bill for the apron.

Across the kingdom, custard rivers stop flowing. A rubbery film creeps over fountains. Pastries turn up wrapped in a pale, unbreakable membrane. Custardia blames rice. Rice blames pink pudding. Pink pudding sends a statement denying that it has ever touched anything so beige.

The recruit fights through the Rice Pudding border and defeats Marshal Rind by drawing out his heavy swings and striking while his spoon is stuck in the ground. Inside his fortress, they find a soldier trapped beneath the same creeping film. The recruit cuts him free. The marshal lowers his shield.

"That isn't ours," he says.

At the Angelic Delight palace, the recruit finds an entire ballroom sealed beneath the stuff. Empress Angelica will lend her wind machines, but only after somebody saves her musicians. The march through enemy territory becomes a series of rescues. Former opponents begin turning up to help, usually while insisting they are doing nothing of the kind.

At the edge of the Great Custard Lake, Sir Stirling pushes his sword through the surface. The whole lake lifts with it.

Underneath, something laughs.

"When did anyone last stir this?" asks the recruit.

Nobody answers.

**Lord Skin has returned.**

He is the layer left on top of every pudding nobody wanted. For centuries he has been scraped off, pushed aside and quietly hidden under jam. Now he intends to cover the entire land. Nothing will move. Nothing will spill. Nobody will ever pick him off again.

The Golden Spoon was not made to crown a ruler. It was made to keep the world moving.

At Trifle Citadel, each former rival opens part of the route: rice shields hold back the flood, Angelica's fans clear the fumes, jelly bridges bounce the recruit across the broken floor. They reach the Spoon together.

Lord Skin offers the recruit a crown. They use it to wedge open his machinery.

Then they stir.

The membrane tears. Custard pours through the kitchens. Steve, who has spent the final battle attempting to eat the royal banners, is carried through the throne room on a wave of pudding.

The recruit returns to the bakery with the Spoon. Their parent takes one look at it.

"Good. You can do the washing-up."

The kingdoms sign a new agreement. Future disputes will be settled in supervised arena tournaments, with protective headgear and no attacks on bakeries. These become the **Custard Cups**.

Peace lasts until someone asks whether jelly counts as a proper pudding.

## A world where the joke changes the way you play

The comedy comes from serious people defending absurd positions. Each faction needs a recognisable silhouette, a fighting rule and a small cast. Most dialogue should fit in one or two lines.

| Region | People and argument | Combat identity | Boss concept |
|---|---|---|---|
| **Custardia** | Custard Knights: custard is the meal; everything else is decoration | Familiar sword, block, dash and food weapons; safe introduction to chaos | **Sir Stirling**, an overqualified examiner who keeps adding regulations |
| **Rice Pudding Kingdom** | Proud, slow-moving knights who regard lumps as structural integrity | Shield walls, deliberate heavy swings, sticky patches; teach flank, parry and guard break | **Marshal Rind**, with an enormous spoon and a skin-covered shield |
| **Angelic Delight Empire** | Pink cloud palaces; Empress Angelica insists her people are "lightly whipped", never beaten | Telegraph floaty lunges, gusts and knockback; teach positioning and dash timing | **Empress Angelica**, whose ceremonial fans push players towards arena edges |
| **Jelly Marshes** | The Wobbling Court has never taken a firm position on anything | Bounces, springs and unstable routes; teach movement and ring-outs | **Baron Wobble**, a heavily telegraphed slam that launches rather than instantly kills |
| **Crumble Crags** | Crumble miners insist the topping is the important part | Breakable cover, warned floor collapses and hot caramel zones; teach route planning | **The Crumbfather**, who systematically dismantles his own arena |
| **Trifle Citadel** | Three rival courts stacked in one building; every floor claims to be in charge | Combine previously learned counters in distinct phases | **Lord Skin**, peeling back defences, then trying to reseal the battlefield |

Only the first region and one rice boss belong in the initial prototype. The full map is a direction, not a promise of six finished worlds.

Steve remains a giant cockerel called Steve. Every kingdom has a different legend about him. He is mainly interested in food. His rescue introduces the existing mount power through a memorable character beat.

Norr belongs to the **Savoury Reserve**, a military unit repeatedly told it is at the wrong banquet. Their shepherd's pie is admitted under a clause allowing "any pudding with sufficient confidence". Keep the existing roar and power-up; do not add a separate combat system just to explain it.

## The campaign path

Use the winding node-map idea Josh described: a visible destination, a clear next battle and a few optional branches. The knights still fight in arenas. The map connects those battles into a journey.

```text
                    OPTIONAL: The Biscuit Toll
                              /       \
Banquet → Pantry → Courtyard → Bridge → Sir Stirling → Steve → Rice border

                                                         → Marshal Rind
                                                               |
                                      Angelic Delight → Jelly → Crumble → Trifle
```

This is the conceptual route; the first playable slice ends at Marshal Rind. Later regions should be silhouettes or previews, not a screen full of numbered locked nodes.

Each main-path node contains:

- A short title and one clear objective.
- A one- or two-line character exchange, skippable and replayable.
- A 90-second to three-minute encounter, with a visible progress condition.
- An immediate result, the next node, and optional mastery objectives.

Bosses can run longer, with checkpoints between major phases if testing supports them. Do not turn every node into a three-minute free-for-all with a different title. Alternate duels, small team fights, captures, rescues and movement challenges.

### Three spoons instead of stars

The first spoon means **finish the encounter** and opens the main route. Two additional spoons recognise separate, visible feats. For example: return the stolen pie; block three attacks; finish without falling into a pit.

State the conditions before play. Save each spoon independently so a player can complete the extra feats across different attempts. Optional spoons unlock cosmetic variants, funny enemy biographies and side encounters. They never block the main story or grant stronger PvP weapons.

After a failure, offer an immediate retry, a specific counter-tip and an optional easier setting. Repeated failure should not become the return loop. Keep assistance compatible with story completion and clearly label any difficulty-specific mastery badge.

Save after every node and return the player to the next playable battle when they reopen the game. Show one nearby interesting destination, such as Steve's cage or the rice castle. A visible next event is a more useful prompt than a generic progress percentage.

## First playable chapter: A Very Bad Banquet

Eight encounters, targeting roughly 20–30 minutes for a first attempt, subject to playtesting. The story is told through short exchanges and changes to the map, with no dependency on finished cinematics.

| Node | Story beat and objective | What it teaches | Reuse and new work |
|---|---|---|---|
| **1. Somebody Has Thrown a Pie** | Reach the pantry door, bonk two attacking guards, get out | Move, swing, identify your knight | Courtyard layout subset; scripted two-enemy encounter; no eight-bot pile-up |
| **2. Protect the Puddings** | Defend three pudding stands through two short waves | Block, telegraphs, choosing which enemy matters | Existing combat plus new defendable-object objective |
| **3. A Spoon at a Sword Fight** | Defeat a rice guard who blocks predictable frontal attacks | Heavy attack or flanking | Existing block/guard/heavy systems; authored enemy behaviour and telegraphs |
| **4. The Biscuit Toll** | Optional branch: earn passage by reflecting three training arrows | Reflection and timing | Existing bow/block; new success counter and reset loop |
| **5. A Bridge Too Flan** | Cross a hazard course and capture the far end | Dash across gaps; read safe routes | Frosty Keep geometry as a prototype; checkpoint and finish trigger |
| **6. Your Knighthood Is Pending** | Pass Sir Stirling's three short tests: defend, counter, hold the pie | Combine skills under a clear objective | Existing combat and hill scoring; scripted phases and fair restart |
| **7. Release the Chicken** | Break Steve's cage, collect the egg, ride through the courtyard | Discover a signature power in context | Existing crates and Steve effect; new cage trigger and short route; repeatable |
| **8. Skin in the Game** | Beat Marshal Rind, free a trapped soldier and open the rice road | Bait, evade, punish, recognise the new threat | One boss controller using existing attacks; no general boss framework required |

Main-path links: 1 → 2 → 3 → 5 → 6 → 7 → 8. Node 4 branches from 3 and rejoins at 5. Optional challenge completion is never required to continue.

### Marshal Rind: a boss that teaches

Phase one: he raises his spoon and marks the slam zone. The player dashes aside; the spoon lodges in the floor, exposing his back.

Phase two: he calls two shield guards and starts a slow sweep. The player can lure him into disrupting his own formation. Reuse knockback and guard behaviour, but make allied collision consequences explicit in the boss script.

Final beat: his skin shield tears. A separate patch of living skin attacks one of his own soldiers. The player frees the soldier through a short playable rescue. The marshal's line, "That isn't ours", changes the story's direction without a long cutscene.

Avoid random invulnerability, tiny unmarked damage windows or a boss whose only distinction is more health. Start with a readable two-phase prototype; the rescue is a short scripted ending.

## Sample dialogue

**Opening order**

Sir Stirling: "Your mission is to restore peace."

Recruit: "With this sword?"

Sir Stirling: "We tried a letter. They ate it."

**Rice border**

Marshal Rind: "We do not run."

Recruit: "Because of your honour?"

Marshal Rind: "Because of our consistency."

**Angelic Delight palace**

Angelica: "You cannot defeat us."

Recruit: "Why?"

Angelica: "We have already been whisked."

**Steve's introduction**

Narrator: "From the dawn of time came a creature of unimaginable power."

Sir Stirling: "That's Steve. He was in the shed."

**Norr's arrival**

Pink guard: "This is a dessert conflict."

Norr: "PIE."

**Lord Skin**

"You pushed me to the edge of the bowl. Now there is only edge."

**Post-campaign cup**

Royal notice: "The war is over. Competitive pie throwing resumes at six."

## Using the existing imagery and videos

Reviewed contact sheets in `C:\Users\JoshH\higgsfield-sprint-2026-09-30\video\custard\`:

| Existing material | Actual observed content | Proposed story use |
|---|---|---|
| `CK1_strip.jpg` / `CK1_4k.mp4` | Medieval banquet, standing knight, pie to the face | The failed peace banquet and inciting incident |
| `CK2_720p_strip.jpg` / `CK2_4k.mp4` | Custard-covered knight with the food fight behind | The aftermath; a solemn narrator attempting to describe an undignified defeat |
| `CK3_720p_strip.jpg` / `CK3_4k.mp4` | A mounted approach followed by a giant rooster reveal | Steve's exaggerated legend |

The still sequences were inspected; the videos were not watched end to end in this turn. Finished banquet/standoff exports and a Steam-trailer-named file are present, but their full edit, provenance and publication readiness were not verified.

A useful framing device is **The Official History, According to the Winner**. Each court's account is ridiculously grand. We cut to the small cartoon knight who actually had to do the work. It gives the existing cinematic concepts a narrative purpose while keeping arena action visually coherent.

For the prototype, use these as creative references and place short text/storyboard placeholders between playable nodes. The repo's earlier art research recommends avoiding generated player-facing material. This proposal does not copy footage into the game or publish anything; a decision about final cinematic assets can be made when the first chapter is worth producing.

## How this changes the retention plan

The campaign gives solo players a finite journey with a visible next destination. The Cup gives groups a session they want to finish. Both use the same movement, combat and cosmetic identity.

| Player motivation | Campaign response | Behaviour to observe |
|---|---|---|
| Curiosity | New kingdom silhouette, unusual boss, recurring mystery | Chooses the next node without a researcher prompting |
| Competence | One new counter at a time, then a combination test | Uses the counter independently in the next encounter |
| Completion | Clear main path; optional spoons | Returns to an optional challenge after progressing |
| Expression | Titles, capes and enemy-inspired cosmetics | Equips a reward rather than simply collecting it |
| Social connection | Tell a friend about Steve; use the same knight in Cups | Moves from campaign into a successful friend session |
| Anticipation | Map changes and a nearby chapter destination | Starts another session on a later day |

These are hypotheses. The previous research supports testing competence, choice and social connection; it does not prove that a story map will retain this audience. Compare campaign and Quick brawl onboarding with new solo players and separately observe group play.

Keep every core multiplayer mechanic and party mode available without completing the campaign. The story should teach useful skills, not become homework before friends can play. Cosmetic rewards can carry between modes. Campaign AI and authored event timing should not silently alter party-match rules.

## Implementation order and cut line

1. Retain the roadmap's seat, reward and measurement fixes as the foundation.
2. Define encounter data: ID, prerequisites, arena, starting positions, enemy roster, scripted events, objectives, dialogue IDs, spoon conditions and rewards.
3. Build a small campaign map, versioned save and idempotent node rewards. Reuse existing progression where appropriate without double-paying both a generic match and campaign reward unintentionally.
4. Build nodes 1, 3 and 8 as a rough test of teaching, variation and boss payoff. Use placeholder dialogue and existing art.
5. If that sequence is readable and players request the next encounter, complete the eight-node chapter. Add save/resume, failure recovery and optional branch testing before inviting more players.
6. Test chapter return over a week. Compare the benefit with the three-round Custard Cup. Expand the stronger direction first; retain both only if capacity supports them.

Move weekly Royal Recipes, browser clip capture and cosmetics beyond the initial six-item capsule later to make room for this campaign experiment. The capsule is scoped in [Cosmetics worth earning](COSMETIC-PROGRESSION.md), with prototypes using existing assets first. Keep the full six-region campaign, full faction art sets, co-op campaign, long cinematics and level editor out of the first build.

Success means players can explain the objective, learn the intended counter, choose to continue, and return voluntarily. Finishing a satisfying chapter is also valuable: do not stretch it into filler merely to increase time played.

## Reference and editorial note

- Dessert identity checked against the [official strawberry Angel Delight product](https://angeldelightdesserts.co.uk/products/angel-delight-strawberry-flavour-59g/). The brand is the inspiration named by Josh; the fictional court, people and conflict are original proposals.
- The winding map is the interaction pattern requested by Josh. No Candy Crush progression formulas, current level counts or retention claims are assumed.
- Read alongside the [player-behaviour roadmap](PLAYER-BEHAVIOUR-ROADMAP.md) for repository findings, research sources and measurement definitions.

Editorial self-assessment of the backstory, not a player-test result: Quest with a discovery turn; hook is a disputed identity escalating into a banquet disaster. Story atoms 87.5/100; architecture 87.5; craft 85; tension/stakes 81.25; transformation 87.5; economy/rhythm 81.25; weighted overall 85.3/100. Main remaining craft risk: the travel section needs playable character moments to give the alliances weight. The requested fiction is intentionally invented; the skill's factual-story prohibition on fabricated evidence does not apply to fictional dialogue. No claim of audience appeal is established by this editorial score.
