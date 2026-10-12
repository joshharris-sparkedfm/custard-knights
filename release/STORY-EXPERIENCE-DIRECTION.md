# A chapter worth playing

12 October 2026. Response to the owner's assessment that the matches are okay but the story and overall experience are not good enough.

**Status: authored direction and source review, not shipped functionality.** Reviewed against beta.7/main `042d2267ddd4f93981baeb878741595726f56426`. The beta.7 executable and archives are unchanged. This document does not mark story acceptance complete. The original [Great Pudding War treatment](../THE-GREAT-PUDDING-WAR.md) remains the wider world; six kingdoms are not added to the current delivery commitment.

## The judgement

There is a promising comic combat game here. There is not yet evidence of an exceptional complete game. The owner's response is direct evidence that the story has not landed. Automated encounter completion establishes that objectives can work; it cannot overrule that response or establish character attachment, pacing or fun.

The strongest material already exists in the premise: an ordinary kitchen recruit, a family bakery caught in an absurd war, proud enemies who need one another, a chicken with no interest in politics, and a villain who is literally the unwanted skin on neglected pudding. The delivery needs to make the player experience those ideas.

### What the current source gets wrong

| Observed delivery | Effect on the experience | Required change |
|---|---|---|
| `game/campaign.js` promises an approaching siege bowl and threatened family bakery; the next encounter protects three generic pudding stands. | The personal stake is announced, then replaced with an abstract task. | Visit the bakery, meet someone there and see exactly what the player is saving. |
| Seven of eight encounters select the courtyard arena; bridge selects frost. | New scene backgrounds do not create a journey through distinctive playable places. | Author a small number of recognisable spaces with different routes, silhouettes and objective layouts. |
| Shield lesson, reflection toll and Stirling's examination interrupt the rescue/war. | The recruit appears to run errands while an urgent threat waits politely. | Teach existing mechanics through urgent actions; put optional practice off the critical route. |
| `game/campaign-ui.js` repeatedly separates scenes, objectives, results and the map. The aftermath is an optional results action. | Story and combat feel assembled separately; important consequences can be missed. | Make the default continuation include the consequence, with an explicit skip and retained replay. |
| Cooks are rescued but mostly cease to matter afterwards. Rind's change of heart arrives at the end. | Actions produce counters rather than relationships or later help. | Let rescued people visibly contribute to the next problem and let a recurring enemy become an ally. |
| Rind's outro says the Spoon is still missing and the chapter ends here. | It stops at a hook without paying off the immediate promise to save home. | Resolve the local siege and return home before opening the larger mystery. |

These are structural findings, not a claim that every battle or joke is bad. Keep responsive arena combat, the accepted models, assistance, optional spoons, saves and replayability.

## The first chapter: Closing Time

**Player promise:** You are a baker's apprentice wearing borrowed armour. Get your people home, stop the siege bowl rolling into the bakery, and discover that the supposed enemy can help.

**Chapter question:** Can you save home without becoming another knight who keeps the war going?

**Ending:** The bakery survives through the recruit's actions and an uneasy alliance with Rice. The Golden Spoon and Lord Skin remain the larger mystery. Finishing this chapter must feel like winning something, even if the player never sees another kingdom.

The following roles and beats are authored proposals. Mabel's relationship to the recruit and the recurring Rice guard are new direction, not existing implemented canon.

### Keep the cast small

- **The recruit:** practical, concerned with people and unfinished work. Let player actions express bravery; do not continually call the player chosen or heroic.
- **Mabel, the bakery's lead baker:** knows the recruit before they wear armour. Wants everyone home, not a royal victory. Starts the chapter handing the recruit a delivery and ends it welcoming the rescued cooks and a Rice guest.
- **Sir Stirling:** thinks regulations keep people safe. Initially gives orders, eventually chooses to hold a dangerous position himself while the recruit acts. His change should be visible, not another speech.
- **Marshal Rind and one recognisable Rice guard:** believe Custardia has sabotaged their food supply. The guard meets the player before becoming trapped; Rind must see the rescue that challenges his certainty.
- **Steve:** establish his obsession with bakery scraps before his escape. His route through the siege machinery pays off that behaviour. He never becomes a wise talking quest giver.

Lord Skin appears through evidence: stiffened custard, a membrane choking a channel, the same material on both sides. Save the villain explanation for later; this chapter needs a question the player can recognise, not six factions of exposition.

### Playable sequence

| Beat | What the player does | Why this leads to the next beat | Payoff and change of pace |
|---|---|---|---|
| **Before the pie** | Briefly move through the bakery yard carrying the banquet delivery. Mabel is working; Steve steals scraps beyond a fence. No mandatory text quiz or combat examination. | The delivery takes the recruit to the peace banquet. | Establish home and a familiar silhouette before threatening them. Let returning players skip this opening. |
| **Somebody has thrown a pie** | The banquet erupts. Break the pantry blockage and escort Mabel's fellow cooks through guards. Preserve the existing staged rescue foundation. | The rescued cooks identify the route back through the service lane; a siege bowl is visible on that route. | First small fight, rescue and brief safety. People react to being saved. |
| **The last delivery** | Reach the bakery forecourt; protect cooks moving essential supplies behind cover rather than three anonymous stands. Existing block/heavy/flank skills create openings against the Rice guard. | A membrane jams the sluice that could divert the siege bowl. A direct assault will not stop it. | Show the threat travelling between authored stages, not a continuous hidden timer. Failure should reset the encounter, not erase the chapter. |
| **Across the cooling channel** | Cross a broken service bridge with clear safe landings. Stirling holds pursuers while the recruit opens the route. Optional biscuit reflection challenge sits beside the route. | The controls are beyond the channel, held by Rind; Steve's enclosure blocks the service access. | Short movement and discovery section between fights. Stirling helps rather than demanding an exam. |
| **Release the chicken** | Free Steve and ride through clearly marked service gates toward the bowl's winch. Bakery scraps explain his destination. | Steve opens access to the machinery, but Rind believes the recruit is sabotaging it. | A joyful escalation using the existing mount. Establish the destination before control returns; avoid surprise camera/steering changes. |
| **Skin in the game** | Fight Rind with existing readable two-phase attacks. Between phases, the previously met Rice guard is visibly trapped by the membrane. Cut them free during a clearly safe rescue interval. | Rind witnesses the rescue and recognises the same material afflicting his people. | The player's action supplies the argument. Do not make compassion a hidden bonus or require a menu morality choice. |
| **One good turn** | Together, hold back pursuers and clear the jammed sluice. Rescued cooks carry tools, Stirling protects the approach and Rice shields cover the winch. The recruit delivers the final action that diverts the bowl. | The immediate danger ends because people cooperate. | A short playable finale built from existing guard, breakable and hold-area mechanics, not another long boss or new combat system. |
| **Still open** | Walk into the saved bakery for a brief playable homecoming. The same people and objects from the opening are now safe, battered and changed. | A sample of the membrane and the missing Spoon point to a wider problem. | Deliver closure first. Optional spoons/results and the map follow the homecoming; no compulsory replay of story on retries. |

Initial pacing target: establish the person/place within the first two minutes and give the player a clear reason to act before the first extended fight. Exact encounter and chapter durations must come from uncoached playtests, not the fast automated route. Do not add filler to hit a nominal runtime.

### Sample scenes: fewer words, more consequence

**Bakery opening — delivered while the player moves.**

Mabel puts a covered tray by the door. Steve watches from the fence.

Mabel: “Peace banquet. Six trays. Bring back seven.”

Recruit: “Seven?”

Mabel: “They still have one from the last war.”

Steve takes a bun. Mabel does not even turn around: “Not you, Steve.”

The tray and familiar doorway supply the task; a long lore card does not.

**Rind — after the player frees the guard.**

Rind raises his spoon, then sees the guard breathing. The membrane sticks to both uniforms.

Rind: “You came back for him.”

Recruit: “He was stuck.”

Rind looks at the approaching bowl: “So are we.”

He lowers the shield and takes position at the machinery. Control returns to the shared objective.

**Homecoming — after the bowl is diverted.**

The rescued cooks relight the ovens. The Rice guard tries to straighten a bent chair. Mabel puts a bowl down for them.

Mabel: “Any allergies?”

Rice guard: “Custard.”

A pause.

Rice guard: “Politically.”

Stirling hangs his regulation notice over the broken window. Outside, Steve eats a royal banner. The recruit has saved a place the player now recognises; the final joke belongs to the result.

## How the experience should feel

- **Action carries exposition.** A seized spoon, blocked channel and rescued opponent establish the mystery. Dialogue names what the player has seen instead of narrating what they never get to do.
- **Each space has a job.** Bakery = familiarity and cover; pantry = narrow escape; channel = readable movement; winch yard = boss positioning and cooperative finale. More square metres alone do not create variety.
- **Pressure has breathing room.** Alternate short fights, movement, discovery and a safe reaction. No uninterrupted wave grind and no comic interruption during an important attack warning.
- **Comedy changes play.** Steve follows food; bureaucratic Stirling finally breaks formation to help; proud Rice shields protect a Custard bakery. Avoid adding a joke to every subtitle at the cost of clarity.
- **Consequences persist visibly.** The rescued cooks return, the guard remembers help and the homecoming reflects success. Do not build an expensive branching campaign to achieve this linear payoff.
- **Story presentation serves the game.** Use the earlier generated videos once located and checked for the correct characters, plot, duration and rights. A video should establish a reveal or transition the game cannot communicate as well; it must not replace the rescue or final player action. Retain subtitles, skip, replay, reduced motion and audio controls.
- **Retry respects time.** Restart at a clear checkpoint, repeat only essential objective context, and make full scenes optional on retries. Preserve existing progression and assistance rewards.

## Work order and boundaries

1. **Build the opening as one coherent slice.** Authored bakery forecourt, Mabel/Steve setup, current pantry rescue, return to visible siege threat. Implement scene-to-play and aftermath continuation together. Review actual captured play, not separate attractive scenes. This is the next implementation task.
2. **Make the middle causal.** Replace compulsory exam framing with Stirling's support action, give the channel a distinct playable layout, and make the optional biscuit lesson truly optional. Reuse mechanics; do not silently retune global combat.
3. **Deliver local closure.** Stage Rind's rescue and the winch finale, then the homecoming. Retain saved node IDs or migrate them explicitly; old completions and spoons must survive. Decide replay mapping before changing prerequisites.
4. **Integrate presentation.** Locate/review existing generated footage, align scenes and captions to the final beats, then perform music/listening and camera/readability review. No claim that earlier footage is currently installed.
5. **Observe real players and revise.** Package a new private build only after changed objectives, retries, saves, controls and packaged assets pass focused checks. Push/merge each checked task. Keep beta.7 available throughout.

This is a direction for improving the current chapter, not evidence that these changes have been implemented or a claim that the rest of the game is finished. Keep later kingdoms, an editor and weekly content out of this pass. Public competitive services and Steam acceptance retain their existing separate gates.

## The human quality gate

Use a small first session with people who have not read this treatment. Do not explain the intended meaning before play. Record the build, input device, assistance, stopping points and the actual comments; reporting remains explicitly opt-in and local.

After the opening, ask: “What are you trying to do, and why?” After the chapter, ask: “Who do you remember?”, “What changed because of what you did?”, “Where did it drag or confuse you?” and “What would you choose to do next?” Observe voluntary continuation rather than suggesting the desired answer.

The desired evidence is that people understand the personal stake, recognise at least one relationship changing, feel the bakery resolution was earned and want another match or chapter. These are proposed acceptance questions, not passed results. If the player can only recall objective counters or the ending feels like an advert for an unfinished story, revise before expanding.

Technical acceptance remains necessary: objective signalling, reachable exits, fair checkpoints, no escort soft locks, controller/mouse parity, saved completion compatibility, replay/skip and packaging. It supports the creative judgement; it does not replace it.
