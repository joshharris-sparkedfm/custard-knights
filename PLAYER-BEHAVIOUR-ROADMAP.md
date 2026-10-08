# Custard Knights: player behaviour and growth roadmap

For the consolidated implementation order, gameplay/graphics work and ticket backlog, start with the [master build plan](BUILD-PLAN.md). This document remains the research and measurement reference.

Research and repository review: 8 October 2026.

**Recommendation: make Custard Knights the game a group opens for a quick brawl and ends up playing for a whole evening. Prioritise a reliable party experience, readable comedy, a compelling sequence of rounds, and stories players want to share.**

The game already has substantial breadth. More modes, weapons and currencies are not the most defensible next investment. The strongest new feature to test is a **Custard Cup**, supported by **Mischief Awards**, player-selected **House Rules**, and a small set of mastery goals.

This is a proposed roadmap, not a commitment to build every feature. Later stages depend on observed behaviour. Virality is an outcome to measure, not a feature or a promise.

**Cosmetic requirement, 8 October:** Josh explicitly wants desirable unlockable cosmetics without microtransactions. [Cosmetics worth earning](COSMETIC-PROGRESSION.md) adds concrete rewards, accessible and mastery unlock routes, a first-session choice, previews and an initial six-item capsule. Retain the existing wardrobe and earned ownership. Use placeholder/current assets to test progression before producing the capsule; all further cosmetic volume remains conditional. For couch play, the recommended first version uses a clearly shared household wardrobe with contributions from any local human, rather than the current first-player-only reward selection.

**Campaign addition, 8 October:** Josh wants a ridiculous dessert-war backstory and a solo level path, with Rice Pudding and Angel Delight-inspired rivals. [The Great Pudding War](THE-GREAT-PUDDING-WAR.md) proposes the world, a branching map and an eight-encounter first chapter. After the foundation fixes, test a three-encounter campaign slice alongside the proposed Cup work, sized to actual capacity. Move weekly recipes, browser clip capture and extra cosmetics later to fund this experiment. The timetable below is the original party-first sequence, not a commitment to deliver both tracks simultaneously. Compare solo continuation/return separately from group continuation/return before expanding either track.

## Evidence and limits

- Reviewed `C:\Users\JoshH\Projects\custard-knights`, commit `9b94a5707916ceb808adef9f0c4e882552b551c0`. Remote HEAD matched that commit when checked. The checkout was clean before this document was added.
- Read the current game source, README, QA harness, existing design reviews, and the 27 September QA summary. Opened the local build and inspected the home screen and first-match presentation.
- This was not a real-human playtest, a full controller test, an online latency test or a production audit. The existing automated QA suite was not rerun for this planning review.
- No real-player retention cohorts, acquisition funnel, interview transcripts or public player feedback were found in the reviewed material. Automated personas provide mechanical evidence, not evidence of laughter, satisfaction, sharing or retention.
- Recommendations assume friends-first browser play now, with Steam as a likely distribution route. Team capacity, budget, intended age range and commercial model remain unconfirmed. Do not infer a mobile free-to-play business from the existing touch controls.
- Existing 26 September reviews are historical: gamepads, teaching cards, progression and several modes are now implemented. Their earlier missing-feature lists should not be reused as a current backlog.

## 1. What is already working as a foundation

| Existing layer | Current evidence | Strategic value |
|---|---|---|
| Immediate access | Browser build; Quick brawl; invite links | Low commitment to trying it |
| Social formats | Up to four local players; online rooms; bots fill eight knight slots | Friends can play without a public matchmaking population |
| Combat depth | Heavy attacks, parry/riposte, guard, dash attacks, shield bash and ring-outs | Players can improve beyond button mashing |
| Comic identity | Steve, Norr, chickens, food weapons, escalating chaos | Recognisable moments with potential to become group jokes |
| Variety | Eight modes, six arenas, hazards and stackable power-ups | Enough material to test a structured party session |
| Expression | Wardrobe, 18 cosmetic tiers, six challenges | A starting point for personal goals and identity |
| Teaching and accessibility | First-match tips, death explanations, Chill introduction, controller/touch input, shake/flashing settings | Existing features to refine through observation |

Source: [README](README.md); `index.html` around lines 397–499, 806–916, 2274–2315 and 2380–2414.

The 27 September [QA summary](qa/results/2026-09-27T08-03-46/summary.md) reports 20 simulated matches, no crashes, 46% human-persona sword accuracy and 11% of match time spent dead. The rusher and pro personas each finished first in their one sampled match. This suggests the mechanics warrant testing with people; it does not establish balance or retention. Samples per persona are too small for strong conclusions, and the data is historical.

## 2. Fix the foundations before increasing promotion

These are findings from the current source, with the necessary verification distinguished from inference.

| Priority | Finding | Player consequence | Required action and acceptance |
|---|---|---|---|
| P0 | Couch `partyStart()` sets `SEATS` and `partyGo`; `start()` clears `SEATS` unless `partyGo` is set; Rematch calls `start()` directly. | Mixed keyboard/controller seats or controller join order can change on round two. | Preserve the session's seat mapping across rematches. Verify two keyboard halves, four pads, mixed devices and reverse controller join order across five rematches and a reconnect. Source: lines 890–913, 2303–2305, 2380, 2414. Code-path finding; hardware reproduction pending. |
| P0 | Online challenge rewards read `G.stats.myParries` and `G.log`; snapshots do not transmit those statistics/logs, and clients do not run host combat simulation. | An online guest can perform a challenge without receiving its progress. | Produce a host-authoritative, per-player match summary and deduplicate reward application by match ID. Verify parry, ring-out and lava challenges for host and guest. Source: lines 574, 827, 2399–2406, 2526–2545, 2566–2605. Code-path finding; two-device verification pending. |
| P1 | `PROG` is one browser-wide progress object; the result screen selects the first local human with `find(isMine)`. | Couch friends have separate looks but do not have clearly separate earned progression. | Explicitly choose a shared household wardrobe for the first release, with individual in-session awards. If permanent individual progression is required, introduce named local profiles and migrate existing progress. Do not imply each seat already has its own save. |
| P1 | Match logs are in-memory and reset; saves are localStorage. No acquisition/return event pipeline was found in `index.html`. | We cannot tell whether people return, invite friends, abandon joins or stop after losing. | Add the small measurement specification below. Keep automated runs separate from real players. |
| P1 | First Quick brawl uses Chill for the first two starts, but retains a random map, normal chaos and a 180-second default. | New players may meet complex terrain before understanding movement and combat. | Test a curated first round against current defaults, using the same map/length when isolating individual changes. |
| P1 | Steve triggers when remaining time falls below a random 70–130 seconds. | In a 180-second round the egg appears after roughly 50–110 seconds; in a 90-second round it appears immediately or within 20 seconds. | Make signature-event timing deliberate for each session format. Do not shorten rounds without retuning this logic. Source: lines 575 and 1026–1027. |

Also test joining across real home/mobile networks, a full room, a late arrival, host loss and guest reconnect. Late arrivals already receive a next-round waiting message; improve that existing path rather than claiming it is absent. Host loss currently ends the guest connection; a clear recovery path is the near-term goal, not necessarily seamless host migration.

The network uses a PeerJS host and 20 Hz snapshots. Validate guest input responsiveness and bandwidth before choosing a new networking architecture. The browser UI smoke check does not establish internet reliability.

## 3. What the research suggests

**Players need to feel capable, able to make meaningful choices, and connected to other people.** Research reviewed by Przybylski, Rigby and Ryan links competence, autonomy and relatedness with enjoyment and future play. This is a useful design framework, not a prediction of Custard Knights retention. Build feedback around a skill the player used, give them understandable choices, and make friends matter to the experience. [A Motivational Model of Video Game Engagement](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf).

The following are observed features in relevant games. Their application to Custard Knights is our hypothesis; feature presence does not prove what caused those games' success.

| Reference | Observed design | Hypothesis to test here |
|---|---|---|
| [Duck Game](https://store.steampowered.com/app/312530/Duck_Game/) | Local/online fighting, spectators, solo challenges and an editor | Give friends a readable contest and offer a compact way to practise between gatherings |
| [Stick Fight](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/) | Physics combat and interactive levels within a focused multiplayer format | Get fresh situations from interacting systems before producing another large batch of modes |
| [Ultimate Chicken Horse](https://store.steampowered.com/app/386940/Ultimate_Chicken_Horse/) | Players place hazards; custom rules and shared levels | Player-created mischief may be more memorable than events selected entirely by the game |
| [PEAK](https://store.steampowered.com/app/3527290/PEAK/) | Friends-only multiplayer, rotating daily map, badges and cosmetics | Shared challenges can give a group a reason to reconvene; the right cadence here may be weekly |
| [Content Warning](https://landfall.se/content-warning-faq) | Players can save their in-game recordings | Make a funny moment easy to keep and share, then measure whether recipients actually play |

These examples do not justify copying proximity voice, a daily content treadmill or a level editor immediately. They suggest experiments in social connection, agency, expression and sharing.

## 4. The game layers to add, in order

### Layer A: an understandable first victory

Desired behaviour: **“I know what I did, and I can do it again.”**

Test a short, curated first brawl: a readable arena such as Courtyard, Chill bots, a visible weapon, and three contextual objectives: land a hit, block a hit, use a power-up. Trial four total knights versus eight to assess readability, rather than assuming the current density is ideal. Keep experienced players on the normal flow.

Guarantee an opportunity to participate in one signature event during the first minute. The outcome must still be earned. Compare a simple chicken event and a clearly signposted Steve pickup; do not stack both on top of a long teaching message.

Reward the first meaningful accomplishment with a cosmetic players can equip immediately. The current 25-coin first tier can take several low-scoring matches: a three-coin completion with no extras requires nine completions to pass 25. Give beginners a visible success without increasing their combat power.

Measure time to first purposeful hit/block/pickup, ability to identify their own knight, explanation of their last death, and voluntary second-round starts. If people cannot track themselves, simplify effects, framing and player markers before changing rewards.

### Layer B: Custard Cup, the session loop

Desired behaviour: **“We have to finish the cup. Then I want a rematch.”**

Create a three-round prototype using existing modes. If it works, test a five-round cup lasting about 10–15 minutes. Start with Free-for-all, King of the Pie and Hot Pie; use soft time caps so objective modes do not stall the evening. Curate arena/mode combinations from playtests.

Keep a visible cup score across rounds. Prototype straightforward placement points, such as 3/2/1/0 for four human entrants, with explicit ties and stable scoring. Bots create action but do not compete for the human cup trophy. Team cups need separate team scoring; do not casually mix team and individual point systems in v1.

Between rounds: show results, offer two possible next arenas/rules, and let everyone ready up. Target under ten seconds from everyone being ready to the next round. Allow a clear exit after any round. Avoid compulsory waits, ambiguous auto-starts and lengthy reward ceremonies.

Add **Mischief Awards** based on actual events: best reflected shot, most objective saves, longest ring-out, or a narrow escape. Recognise a fun contribution even when someone loses. Awards should not reward intentional griefing or replace the winner's achievement. Start with text and a still image; a full replay system is unnecessary for the first test.

### Layer C: player-created comedy and fair counterplay

Desired behaviour: **“Did you see what I just did to you?”**

Test **House Rules** as a selection of safe presets between rounds: Baguette Brawl, Slippery Floor or Chicken Finale. Each preset should change one clearly explained rule and reuse existing systems. Begin with a group vote or rotating chooser. Do not give a losing player an opaque stat boost.

Prototype one attributable chain reaction: a visible trap can be knocked towards another knight, who can reflect or escape it. The test is whether observers understand the setup, action and payoff without commentary. Use existing pies, knockback and hazards where possible; defer general-purpose physics.

Preserve moments of calm around major events. Chaos works better as a recognisable escalation than a constant overlay of banners and effects. Add one signature interaction at a time and test whether it improves enjoyment for both the winner and the victim.

Eliminated players already become pecking chickens in Last Knight Standing. Observe whether that participation is amusing or unfair before adding more spectator powers. If early elimination causes exits, test shorter rounds first. Any added chicken intervention must be limited and unable to decide the winner arbitrarily.

### Layer D: mastery and identity

Desired behaviour: **“That is my knight, and I have something I want to get better at.”**

Build on the existing wardrobe and challenges. Let players pin one goal: reflect three arrows, execute a parry/riposte, or secure an objective under pressure. Offer a short optional practice trial for that skill and show personal improvement after a real match. Validate input-specific difficulty.

Add earned titles, a few victory poses and cosmetic mastery badges before expanding the 18-tier currency track. Keep functional tools available from the beginning. A new player should be able to beat an experienced player through play, without grinding for damage or health.

Track challenge selection, completion, reward equip rate, and return after completion. If players finish a challenge and leave satisfied, that is not automatically a failure. The useful question is whether they later choose to play again.

### Layer E: shared reasons to return

Desired behaviour: **“We should try this together this weekend.”**

Test a weekly **Royal Recipe**: a named combination of arena, mode and House Rule. Keep past recipes playable. Pair it with a friend-group score to beat or a cup record, not expiring power or a punished login streak.

A recipe code can initially describe settings. Do not call it an identical seeded challenge until map selection, pickups, bot behaviour and simulation randomness are reproducible and versioned. The current game uses `Math.random()` extensively. Shared inputs alone do not guarantee identical outcomes.

Solo: offer a short skill challenge and personal best. Friends: offer a fresh cup and the chance to reclaim the group trophy. These are distinct return behaviours and should be measured separately.

Defer public global leaderboards until scoring, versioning and trustworthy results exist. Start with local records or explicitly casual friend comparisons.

### Layer F: turn play into invitations

Desired behaviour: **“You need to see this. Come and play.”**

Use a simple loop: funny event → save a moment or result → friend opens a link → friend joins successfully → group finishes rounds → group returns.

Start with an honest match postcard containing the player's knight, an earned award and a working play link. Add short clip capture only if players already want to share moments. Never count opening the share menu as a successful referral.

For Steam, use [Game Recording and Timeline markers](https://partner.steamgames.com/doc/features/timeline) to help players find and save events such as Steve takeovers, reflected projectiles and final knockouts. Markers complement recording; they are not a complete custom replay editor. For browser capture, prototype a bounded recording buffer and test encoding cost and device support before promising universal export.

Film actual gameplay and keep a clear setup and payoff. For vertical clips, use framing that keeps both participants and the decisive hazard visible. A crop that removes the victim or pit destroys the joke.

Creator tests should be small group sessions built around a simple premise, such as “winner chooses the next ridiculous rule”. Prepare a lightweight kit with controls, exact player counts and a tested join route. Do not scale promotion until new players can reproduce the experience in the clip.

### Layer G: community creation, only after demand

Desired behaviour: **“Try the rules we made.”**

Begin with shareable rule presets. A curated arena editor or Workshop integration comes later if groups repeatedly ask for custom situations and the base game has repeat usage. A public editor adds compatibility, validation, moderation and discovery work. It is not the first solution to weak retention.

## 5. Roadmap and decision gates

Indicative sequencing for a small team working on the existing browser build. The weeks are planning windows, not delivery estimates. Re-estimate after the initial reliability work; a production port or networking replacement changes the schedule. Josh acts as product/playtest owner unless another owner is assigned; engineering owns implementation and technical acceptance.

**All numeric gates below are proposed internal starting targets, not industry benchmarks or predictions.** Establish a baseline first, report counts and uncertainty, and adjust targets openly. Passing one small cohort is not proof of product-market fit.

| Window | Outcome and proposed work | Dependencies | Continue when |
|---|---|---|---|
| Now, weeks 1–2 | Reliable repeat play: reproduce/fix seats and guest rewards; define shared couch saves; instrument funnel; observe first-time players; test one onboarding change | None; this is the foundation | Seat/reward regression cases pass; controlled join attempts achieve at least 95% success; at least 80% of observed newcomers make a purposeful action within 30 seconds without coaching |
| Next, weeks 3–4 | “One more”: three-round Custard Cup, running score, ready-up, three event-backed awards | Stable seat/player IDs, per-player summaries | At least 70% of participating groups voluntarily start round two; cup variant improves voluntary continuation over baseline without more “unfair/confusing” reports |
| Next, weeks 5–6 | Mastery and choice: first accomplishment reward, pinned challenge, optional practice, one House Rule choice | Correct reward attribution; cup loop | More novices can explain a useful counter and more losers choose another round; verify improvement is not confined to experienced players |
| Conditional, weeks 7–8 | Sharing and distribution: result postcard, attributed join link, recording prototype or Steam Timeline spike; small creator pilot | Readable moments; reliable joins; packaged Steam build if using Steam features | At least 80% of a small blind clip-viewer sample can explain the action; actual invitees reach and finish a round; capture does not materially degrade play |
| Conditional, weeks 9–12 | Return: weekly recipe, archived recipes, friend/cup records; wider playtest | Repeat-play signal, stable saves and versioned rules | Initial goal: at least 25% of eligible activated groups play together again in days 7–14 without a researcher booking their return; compare with baseline and record why others did not return |
| Later | Custom presets, curated editor, new arenas/weapons, platform expansion | Repeated requests and sustained return behaviour | New content addresses an observed reason to stop, and the team can maintain it |

Reliability remains a gate throughout. If invitations fail, move networking work ahead of sharing. If people laugh but do not rematch, improve the contest and session flow. If they play several rounds but never return, investigate social coordination and replay value before increasing rewards. If cosmetics are ignored, do not enlarge the reward economy.

## 6. How to obtain real behavioural evidence

### First research cohort

Recruit eight existing friend groups of three or four people, plus eight solo newcomers. Include a mix of party-game familiarity and keyboard/controller preferences. Test actual friendship groups because the intended unit of enjoyment is social. Use adults initially unless research with younger players is deliberately arranged.

Give them the game with a short instruction: “Try this together.” Do not coach through the first five minutes. Let them choose when to stop within the research slot, and record when the slot itself ends so researcher-imposed stopping is not labelled churn.

Observe who finds themselves, lands an intentional action, laughs, complains, withdraws, requests a rematch, or takes over setup for everyone else. Capture the game event and context around the reaction. A laughing winner beside three silent players is a different result from shared laughter.

Afterwards ask: “What was the best moment?”, “What felt unfair?”, “What would you try next?”, and “When would you actually play this with these people again?” Compare answers with behaviour. Invite interest is weaker evidence than an invite that leads to play.

Provide access for two weeks. Separate spontaneous return from researcher-scheduled sessions and reminders. The first cohort finds problems; it cannot give a precise population retention estimate. Follow with roughly 30–50 groups for directional comparisons, and calculate sample requirements before claiming a statistically reliable lift.

### Experiment order

| Experiment | Change | Primary observation | Guardrail |
|---|---|---|---|
| E1: first round | Curated arena versus random; test other changes separately | Purposeful action and voluntary second round | Confusion and time unable to control the knight |
| E2: density | Four versus eight total knights on the same setup | Track-self success; understandable deaths | Empty-feeling arena, waiting for action |
| E3: cup | Current standalone rematch versus a three-round cup | Voluntary third-round start | Setup time and “stuck in a session” reports |
| E4: agency | A voted rule versus a comparable automatic rule | Players describe a decision they made; continued play | Perceived fairness, weakest player's participation |
| E5: sharing | Postcard/clip prompt after a real highlight versus no prompt | Unique referred players completing a round | Interruptions and performance |
| E6: return | Weekly recipe with an archive versus unchanged selection | Group return in days 7–14 | Replay motivation, not reward obligation |

Assign social experiments by group, not individual player within a group. Balance play order for qualitative sessions to reduce learning effects. For live comparisons, hold build and acquisition source constant, choose the primary metric in advance, and account for group-level clustering. Do not credit a bundled redesign's improvement to a single component.

## 7. Measurement specification

**Primary product measure: returning friend groups completing at least three rounds together in a week.** Pair it with player-reported enjoyment and the experience of the least successful player. Do not optimise hours played at the expense of voluntary, satisfying sessions.

Define a session as continuous play with a documented inactivity cutoff, initially 30 minutes. Define an activated online group as at least two human participants completing a round together. Track couch sessions separately: a browser cannot reliably identify the real people sitting on the sofa, so use optional named local profiles or a research diary for group-return estimates.

Add events for `session_start`, `invite_opened`, `join_attempt`, `join_succeeded`, `join_failed`, `round_started`, `first_meaningful_action`, `round_completed`, `rematch_selected`, `cup_completed`, `challenge_selected`, `challenge_completed`, `reward_equipped`, `highlight_saved`, `share_intent`, `referral_activated` and `session_exit` where observable. Browser closure is not reliably emitted; use last activity and report inferred exits as such.

Include build version, anonymous installation/player ID where appropriate, session/party/match IDs, local seat ID, input type, mode, arena, bot difficulty, human/bot counts, acquisition/referral token, result and experiment assignment. Avoid names, chat and voice in analytics. LocalStorage IDs measure an installation, not a verified person; browser clearing and cross-device play affect counts.

Keep combat telemetry separate from product events. Extend the existing host event log for per-player accomplishments and highlight candidates. Send one authoritative summary per player per round; deduplicate by match ID and player ID. Resetting or rematching must not pay the same reward twice. Exclude QA/demo/bot-only activity from human product metrics.

| Metric | Definition |
|---|---|
| Join success | Successful connections / valid join attempts; separate full rooms, obsolete links, network failures and user cancellation |
| Time to play | Invite open to first controllable frame; report median/p90 and failure rate, not just successful joins |
| Voluntary continuation | Groups starting the next round / groups completing the prior round with an opportunity to continue; show first-to-second and second-to-third separately |
| First-week return | New players with another completed-round session in days 1–7 / eligible new activated players; split solo, online and local-installation cohorts |
| Group return | Activated groups reconvening with at least two of the same participants in days 7–14 / activated groups observed for the full window |
| Referred activation | Unique new invite recipients completing a round / unique new invite recipients opening an attributed link |
| Referral yield | Unique referred new activated players / activated inviters in the same observation window; include non-inviters in the denominator |
| Fun and fairness | Short self-report plus observed reasons for stopping; segment by skill and whether the player won |

Also record frame time, disconnects, input issues and quit-after-death patterns. None alone reveals why someone stopped. Use session review/interviews to distinguish frustration, boredom, device failure and ordinary life interruptions. Report cohort sizes and uncertainty, not a single unqualified retention percentage.

## 8. Distribution and technical boundaries

Keep browser access as the research funnel. For Steam, test a small desktop packaging spike for controller input, audio, overlay, save persistence and actual devices before committing to Electron or a Godot rewrite. The README contains both prototype/port ambitions and desktop ideas; neither is a finished production plan.

[Remote Play Together](https://partner.steamgames.com/doc/features/remoteplay) lets additional players join a host's local game without all owning/installing it. It is worth testing as a low-friction Steam route for the existing couch mode, but input latency and mixed controllers still need validation. It does not replace native online play or solve all connection problems.

[Steam Playtest](https://partner.steamgames.com/doc/features/playtest) provides a controlled route for recruiting players. Its current documentation also describes experimental friend invitations. Validate eligibility and capacity before using that growth mechanism. No Steam page, Playtest, release or live build was verified in this review.

Extract only the modules needed for the next work: session/seat state, per-player results/progression, product events and rule presets. Keep behaviour covered while moving code. Full architecture replacement would delay answering whether people want another round.

The existing [art research](qa/research/ai-art-pipeline.md) recommends no AI-generated player-facing material. This roadmap needs no new generated art: use the current characters, real gameplay and a small amount of authored UI/cosmetic work.

## 9. Explicitly defer

- New arenas or a ninth mode until playtests identify a content gap.
- Ranked matchmaking before there is sufficient concurrent demand and credible competitive balance.
- Battle passes, daily streak pressure, loot boxes or paid combat advantage.
- Proximity voice before groups demonstrate a need beyond their existing voice tools.
- A full multi-region solo campaign before validating the first chapter described in [The Great Pudding War](THE-GREAT-PUDDING-WAR.md); open world, economy and guild systems remain deferred.
- Full replay reconstruction, a public level editor or Workshop before simpler sharing proves useful.
- A speculative engine rewrite as a substitute for testing the current game.

## First implementation batch

1. Reproduce and fix couch rematch seat persistence.
2. Add per-player match summaries; fix guest challenge progress and reward deduplication.
3. Add a small product-event pipeline and baseline report.
4. Run the first uncoached group/solo sessions and choose one onboarding experiment.
5. Prototype a three-round Custard Cup with a running score and three event-backed awards, and scope the requested solo campaign as a separate three-encounter experiment. Sequence these to capacity; expand according to the behaviour of each audience.

Everything after that should respond to what players actually do.
