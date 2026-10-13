# Custard Knights social play and reasons to return

Research date: 13 October 2026. Focused additional round for the owner's emphasis on polished online/couch play and lasting enjoyment. Read existing player_journey.md and gameplay_story.md first; inspected clean read-only plan checkout. No game played, code changed, assets generated or other agents used. External evidence below is primary developer/support material. All timings, cohorts, success criteria and proposed features are design hypotheses, not observed results, retention benchmarks or promised implemented scope.

## What social experience should identify the game, and which player arrangements must it support?

### Takeaway

Position the game as expressive, funny knight combat that friends can learn together and turn into a shared Custard Cup. Give groups both rivalry and teamwork through the existing arena rules; distinguish competitive team play and friends-versus-bots from an actual cooperative story campaign.

### Cited Findings

- Current Cup is three fixed rounds: FFA, King of the Pie, Hot Pie; each config has a 120-second limit and teamSplit:false. Cup has one-to-eight human entrants, per-human keys, connected state, readiness/map votes, standings and earned awards. This is an individual competition, not an implemented cooperative Cup. [cup.js](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/cup.js), [cup-ui.js](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/cup-ui.js).
- Current Couch Party advertises two-to-four players and has four seat cards; source maps joined devices through SEATS. Arena still has eight combatant slots. Existing broader notes establish 100-total faction preview and single-player story; none of these establish accepted mixed couch/remote or 100-versus-100 support. [index.html](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/index.html), [existing gameplay evidence](gameplay_story.md).
- Additional release-source inspection establishes host local seats plus remote peers, but each native guest connection owns exactly one entity. Two multi-seat guest households are not currently supported. Faction UI has one localId/camera, so faction couch support is not established. [Release reliability findings](release_reliability.md), [host/guest source](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/index.html#L2916), [player creation](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/index.html#L626).
- Boomerang Fu's developer describes quick rounds for up to six players, simple controls with deflection/curved throws, combinable power-ups, joining friends against AI, and configurable friendly fire/power-ups. This is a concrete example of accessible rivalry and teamwork within one combat identity. Its marketing is not a measured retention study. [Developer game page](https://www.boomerangfu.com/).
- Ultimate Chicken Horse's official support explicitly allows local and remote players together, still within four total seats; additional local players join inside the online lobby. It distinguishes public discoverability from private code sharing. [Developer mixed-play support](https://cleverendeavourgames.freshdesk.com/support/solutions/articles/32000028877-can-i-play-with-people-locally-and-online-at-the-same-time-).
- Its Remote Play support says streamed players behave as local players, can join local or online lobbies, and share one keyboard/mouse input; others need controllers. This establishes that streamed local input and native networking are different arrangements. It does not establish Custard Knights compatibility. [Developer Remote Play support](https://cleverendeavourgames.freshdesk.com/support/solutions/articles/32000028878-how-do-i-use-steam-remote-play-).

### Inferences

**Audience and value proposition (proposal):** Friends/couples/households with mixed combat experience who want a readable, silly competitive session on one PC or across PCs, plus players who want an authored solo adventure and visible mastery between gatherings. Core value: simple-to-start physical knight combat, recoverable mistakes, memorable custard/food incidents and a shared session with a satisfying finish. Larger battles are an additional experience; they should not obscure the small-group identity or become the only reason to buy.

**One social front door:** Play with Friends creates a persistent group first, then chooses single match or Cup, with a clear Teams toggle only for compatible rules. Preserve private code/Steam invite access and a route for returning to the same room. Default the first mixed-skill session to a respawning combat round, then offer objectives or Cup. Do not make a novice's first experience two minutes of elimination watching.

**Topology and honest release contract:**

| Arrangement | Proposed product behavior | Evidence/status and gate |
|---|---|---|
| One player | Story or bot practice; learn without finding a lobby | Existing formats; authored story polish remains separate |
| 2–4 people on one PC | Join devices, choose FFA or compatible teams, play standalone/Cup | Existing four-seat shell; physical controller acceptance still required |
| 2–8 humans across PCs | Private room, stable human identities, fill only unranked vacancies with labelled bots | Arena/Cup limits in source; WAN/session acceptance unproven |
| Four on host sofa + remote friends | Preserve four host-local identities while admitting up to four individual remote guests | Source supports narrower host-local topology; physical/WAN acceptance unproven. Test4host-local+1remote and4host-local+4remote connections |
| Two sofas | Four local players on each of two PCs in the same room | Not currently supported natively: guest multi-seat ownership protocol is a new task. Do not advertise until implemented and all eight ready/vote/input paths pass |
| Remote Play Together | Stream host's four local seats; clear shared-input/device rules | Optional separate compatibility milestone; cannot silently count as eight native connections |
| Friends on same team against bots | Compatible team arena preset with chosen bot difficulty, friendly fire off by default | Prefer reuse over a new campaign; inspect team allocation/control support before committing |
| Human-only ranked | All admitted participants verified human; equal competitive rules; no bots | Ranked/network acceptance belongs to multiplayer workstream; bot-filled play is unranked |
| Large faction session | Army total and human/bot split displayed accurately | Current 50v50 =100 total preview. Requested100v100 =200 combatants is an additional capacity milestone |
| Co-op Story | If commissioned later, shared objectives, checkpoints, revive/leave policies and scaling need design | Current story is single-player. Do not advertise co-op Story or imply arena team support delivers it |

**Teamwork with existing rules:** Pie Heist: one carrier, one escort/route-clearer, one defender; show the carried objective and return condition. Flag Frenzy: capture/contest/hold, with distinct objective feedback. Team brawl: share pressure and protect retreat without requiring complicated roles. Faction siege: squad acts on an obvious local objective, using existing role kit. Record capture, return, defence and assists where reliably attributable; personal kills must not be the only visible useful contribution. These are communication/balance targets, not a request for a separate new mode.

**Avoid fragmentation:** Launch one recommended party Cup and a small set of compatible rules in private rooms. Existing custom modes remain available. Do not launch eight separate public queues, a new PvE queue and multiple Cup ladders together. Public matchmaking needs demonstrated concurrent demand and live hosting before any population promise. Ranked remains a distinct fairness contract, not a toggle inside a bot-filled social Cup.

### Gaps

Mixed host-local/remote seat continuity, Steam identity ownership for couch guests, device reconnect, public discovery and physical controllers require real acceptance. Two-sofa support requires explicit guest multi-seat admission, input ownership, readiness, reconnect and cosmetics/reward ownership work. Faction couch capability has not been established. No audience interview or sales evidence validates the proposed audience. Existing Castle Crashers developer research in gameplay_story.md already illustrates a separately built cooperative campaign; this pass does not duplicate it or infer that Custard Knights has one.

## How should a match become an evening, while keeping novices and eliminated players involved?

### Takeaway

Use the existing three-round Cup as a finite social unit with continuous seats and deliberate intermissions, then offer another Cup without rebuilding the room. Participation should come primarily from respawns/objectives/short rounds, with optional support for mixed skill disclosed to everyone.

### Cited Findings

- Current Cup resets readiness and votes after each finish, advances only once all connected players are ready, and removes a disconnected player's ready/vote state. Round scoring ranks only eligible human rows; awards are tied to recorded parries/ring-outs/pickups. UI makes the host's next-round action explicit. These are useful foundations, not a proven robust evening. [cup.js](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/cup.js), [cup-ui.js](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/cup-ui.js).
- Ultimate Chicken Horse's developer support describes a voluntary self-handicap that reduces the chooser's scoring percentage, cannot increase it above normal, and cannot be imposed on another player. It is a clear example of consensual mixed-skill help. [Developer score-balancer support](https://cleverendeavourgames.freshdesk.com/support/solutions/articles/32000028992-how-to-use-score-balancer).
- Its custom-rule support documents explicit round/minute limits, run limits, extra attempts, configurable point sources and saved presets. This demonstrates bounded sessions and legible repeatable setup rather than an endless compulsory loop. [Developer rules/presets support](https://cleverendeavourgames.freshdesk.com/support/solutions/articles/32000028991-custom-rules-and-presets).
- TowerFall's developer describes accessible fundamentals with limited arrows, dodge vulnerability and projectile retrieval. Its end-of-match final-kill replay is explicitly intended to help new players learn a victor's technique. Do not infer proven learning/retention rates. [Developer game page](https://www.towerfallgame.com/).

### Inferences

**Concrete session structure (proposed targets):**

1. **Short match:** Two-minute default, objective explained in one sentence before control begins. FFA/team brawl respawns keep play continuous. Results first explain winner/objective, then offer rematch in the same room; changing rules is secondary. Aim for a ready group to launch in under90seconds from entering Play with Friends after initial onboarding, an internal test target.
2. **Custard Cup:** Retain current three-round individual Cup as the first recommended package. It supplies six minutes of capped round time; target an8–12minute complete Cup including loading/explanations/intermissions, to be measured. Reveal all three upcoming goals, maintain seats/appearance/input ownership, show cumulative standings and a concise earned moment after each round. A ready group proceeds without re-entry, manual reinvite or repeating tutorial material.
3. **Cup evening:** A30–45minute optional gathering can contain a practice round and several Cups. These are planning targets, not claims of existing duration. After each Cup, give a genuine stopping point and three actions: Another Cup / Change Rules / Leave. Avoid forced countdowns, compulsory reward animations and default requeue without consent. Reusing the same group is more valuable than inventing a six-hour tournament shell.
4. **Team option:** Existing compatible team matches available beside Cup. A separate Team Cup would need shared scoring, team persistence and compatible round selection; the current FFA/KOTP/HotPie Cup does not become team-cooperative by changing its label. Treat Team Cup as an optional later extension after team matches test well.

**Continuity contract:** The room survives results and outfit/settings changes. Device-to-seat mapping, human key, chosen team and readiness belong to each player; host controls setup, not everyone's cosmetics or vote. Seats do not shift after a departure. A late arrival watches the current round and joins the next eligible round; a competitive Cup already underway clearly excludes them from that Cup's standings until the next Cup, rather than inventing retroactive points. Display absent players and remove their ready requirement. Reconnection restores identity only where the network contract actually supports it. Host departure must show the implemented recovery/end-room outcome; do not promise migration without implementation.

**Downtime:** Prioritize respawning modes in the mixed-skill recommended path. For Hot Pie/Last Knight Standing, show remaining participants/lives and an honest time ceiling. Existing chicken involvement needs bounded, non-score-changing mischief or a neutral spectator role; eliminated players should not gain the power to choose the winner. Do not introduce resurrection into competitive survival rules without separately balancing/testing it. Offer an optional short winning-moment recap only once reliable capture/replay exists; never block ready players on a replay feature that is still a proposal.

**Fairness:** Equal base competitive statistics and match-local weapon gains; keep deaths resetting the existing per-life levels. Bots visibly named and excluded from rank. Let players choose easier bot opponents or cooperative team practice, and split teams visibly by agreement without forced sofa separation. Any later voluntary self-score handicap belongs only to a labelled private unranked preset, resets/displays each session, and requires Cup scoring/UI work. No hidden novice damage bonus, automatic winner punishment, forced handicap or paid combat advantage. Skill help should improve learning and shared contribution, not make scored results inexplicable.

### Gaps

No human elimination-wait tolerance, mixed-skill balance or Cup duration is measured. Current Cup's all-ready state still needs observation for deadlocks, ambiguous host control and disruptive departures. A final-kill replay, team contribution awards and voluntary score handicap are proposals, not current features.

## Why would people return a week later, and what exact observations should release approval require?

### Takeaway

Return value should come from combat mastery, different group stories, meaningful objective choices, earned cosmetic identity and authored solo closure. Verify those reasons through voluntary choices and a follow-up opportunity; do not manufacture a daily obligation or invent a retention percentage.

### Cited Findings

- Ultimate Chicken Horse's developer describes an expressive repeat loop: jointly placing obstacles before running the changed level; it also lists customizable rules, shareable levels and timed challenge competition. Its identity is clear and its variation is part of play, not merely reward quantity. [Developer game page](https://www.cleverendeavourgames.com/ultimate-chicken-horse).
- Its unlock support documents completed matches and mystery boxes for levels/characters/outfits, with online recipients not always being the collector. These are documented rules, not evidence that randomness or gated maps causes retention; Custard Knights should not copy them uncritically. [Developer unlock support](https://cleverendeavourgames.freshdesk.com/support/solutions/articles/32000028873-how-do-i-unlock-levels-characters-outfits-).
- Existing Custard Knights local reporting distinguishes explicit rematch intent/goal pinning/equip from enjoyment, excludes bots/QA/late-arrival contexts where appropriate, and has no human cohort baseline or return-rate measurement. [Local reporting review](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/qa/reviews/local-product-events-2026-10-12.md). Existing playtesting research already provides Valve's observation methodology; this follow-up builds on it rather than repeating the source. [Gameplay research](gameplay_story.md).

### Inferences

**Replayable content priorities:** First polish a small readable map set with genuinely different routes, contested pickups and hazard answers. Reuse those spaces through FFA/team/possession objectives and compatible chaos presets. Cup offers map votes and a bounded arc. Weapon mastery comes from learning trajectory, guard/parry/counter and movement relationships, not collecting permanent damage. Story supplies authored places, characters, consequences, assistance and replayable checkpoints already proposed in gameplay_story.md. Cosmetic goals celebrate observable actions and personal style; they are optional and cannot gate the arenas a visiting friend needs to enjoy a party.

**Three explicit reasons to return:** Social: challenge the same friends to another Cup or cooperate against a chosen bot difficulty. Personal: try a different weapon/counter, improve an objective contribution or earn a clearly described wardrobe item. Narrative: continue a saved meaningful story objective or replay a favourite encounter. A personal-best/training medal layer could strengthen mastery later, but must be marked new scope. Display one chosen goal after results and preserve progress during absence. No expiring daily streak, attendance punishment, randomized scarcity or mandatory battle-pass grind.

**Progress ownership and fairness:** Fresh guest gets full base combat kit and the host's available arena rules. Cosmetic/save ownership must identify PC profile versus authenticated account versus temporary couch guest; do not claim every guest receives Steam Cloud progress without an ownership implementation. Story unlocks can be prestige cosmetics; factions retain matched statistics/readable silhouettes. Late joining, bot practice and assistance receive honest goal-credit rules. A player's week away never weakens them in competitive matches. Save replay/checkpoint/unlock receipts once, and allow rematch before opening wardrobe.

**Proposed first human evidence round: six groups /24participants, not a statistical estimate.** Recruit two four-person mixed-skill sofa groups, two four-person all-remote groups, and two four-person mixed groups (2host-local+2individual remote connections). Include newcomers and experienced action players; record exact experience/input/hardware/network, build and help received. Separately run topology engineering acceptance with4host-local+1remote and4host-local+4individual remote connections. Test4+4 across two PCs only after new guest multi-seat protocol work; human cohort coverage alone does not certify eight-seat capacity. Observe one30–45minute optional session per group. Offer the same build again seven days later without forcing attendance; compensate research participation independently of how long they play. Report people versus groups and actual stopping reasons, not a blended bot/human denominator.

**Exact acceptance observations, with records preserved:**

| Question | Observable evidence to collect | Proposed release decision |
|---|---|---|
| Can friends begin? | Time from social entry to correct seats/match; host wrong-mode/team/bot choices, repeated invites, staff prompts | Every topology completes unassisted after onboarding; reproduce/fix any seat blocker.90s launch is a provisional UX target, not an industry bar |
| Do groups persist? | Same human/device/appearance/team key across all three rounds, second Cup, setting changes and one controlled disconnect | Zero seat stealing, duplicate rewards/standings, wrong-device actions or forced reinvites in acceptance runs |
| Is scoring understood? | Ask each person to explain round objective, winner and why their Cup points changed before explaining it to them | Revise any repeated same misunderstanding; human-only Cup/rank rows and tied outcomes independently verified |
| Are novices involved? | Per-person longest noninteractive interval; deaths understood; contribution opportunities; targeting/handicap complaints | Revise repeated disengagement or domination patterns before expanding mode count; no undisclosed balance assist |
| Is elimination tolerable? | Time from final life to next playable round, chicken influence on winner, controller abandonment, requests to skip | No unbounded waits or eliminated-player winner selection; target<=30s truly idle segments in recommended party path, otherwise change rotation/rules |
| Is another round wanted? | At first Cup finish, offer Another Cup and Stop equally; record voluntary choice and each person's assent | Record exact group choices and reasons; zero-rematch pattern requires product iteration. Do not claim one rematch proves lasting retention |
| Is a week-later reason real? | Whether participants initiate/accept return, what they choose without briefing, remembered objective/weapon/character, ability to resume save | Report qualitative evidence and exact counts. Absence is investigated, not labelled churn or punished in-game |
| Is departure graceful? | One guest exits, controller disconnects, host leaves, late guest arrives; remaining people follow visible recovery path | No ready deadlock, concealed host loss or misleading reconnect claim; no corruption of saved cosmetics/story |

### Gaps

No retention baseline, target market size, promised hours of content or player satisfaction benchmark exists. Six groups is a proposed formative sample that can expose defects and motives; it cannot estimate Steam population retention. Public-online moderation/safety and hosting capacity require their own release work; this note does not establish their implementation. No evidence supports daily-grind systems as necessary to this game's value. Human observation must precede any claim that the complete product is enjoyable or polished.
