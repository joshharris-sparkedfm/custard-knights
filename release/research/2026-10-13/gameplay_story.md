# Gameplay, story, faction identity and creative production

Research date: 13 October 2026. Read-only checkout: custard-knights-plan at 937cb80. No runtime changes, new gameplay tests, video generation or publishing in this research. Findings below distinguish repository evidence, direct owner feedback, research and proposed targets. The owner says matches are okay but story is weak; latest emphasis is enjoyable online and couch play with enough depth to stay for a while. That is feedback, not a statistically representative player study.

## What should change in the playable experience?

### Takeaway

Make readable, funny social combat the centre of the game. Use Cup to turn individual matches into a shared session, story to provide authored purpose and mastery/cosmetics to support return play. More simultaneous combatants, raw weapon count or permanent damage growth do not establish quality.

### Cited Findings

- Repository beta.7 has eight arena modes, mouse aim/click attacks, nonlethal Chicken Race pecks, capped per-life weapon upgrades and optional Roomier geometry. Package evidence records isolated desktop/browser checks; human balance, physical-controller, WAN and minimum-hardware acceptance remain open. [Frozen package evidence](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/release/PREVIEW-BUILD.md), [controls review](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/qa/reviews/player-controls-2026-10-12.md), [roomier review](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/qa/reviews/roomier-arena-2026-10-12.md).
- Source upgrades a repeatedly collected weapon up to level three, retains levels across swaps/ammo exhaustion during that life and clears them on death. Source gives Crossbow slower reload/piercing and Returning Croissant a return trajectory with one hit per enemy. These are implementation facts, not established balance. [Arena implementation](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/index.html), [weapon definitions](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/weapons.js).
- Easy/Medium/Hard/STEVE alter arena reaction, aggression, defence and aim decisions, not health/damage/movement. Campaign difficulty instead changes enemy pacing and also has separately selectable assistance. Avoid falsely describing one identical difficulty implementation across formats. [Difficulty](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/difficulty.js), [campaign](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/campaign.js), [faction simulation](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/mass-battle.js).
- Chaos is independent of bot difficulty. Source excludes rare powers in Simple, Race, Story, faction and ranked contexts; eligible rounds use one partitioned roll, 1% AK/song or 1% McGinley, mutually exclusive, with durations/ammo and cleanup. [Chaos source](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/chaos.js).
- Chivalry 2's developers explicitly connect understandable deaths to clear action animation. Its published controls include click attacks, held heavy attacks and defensive counters; its advanced guide describes positioning, evasion and projectile counters. This supports understandable offence/defence relationships, not copying its timing or full first-person move set. [Official FAQ](https://chivalry2.com/faq/), [official advanced-combat guide](https://chivalry2.com/2022/03/24/advanced-combat-twitch-stream-recap/).
- Microsoft recommends remapping actions, considering alternatives to simultaneous/held inputs and separating difficulty controls for different mechanics. These are accessibility guidelines, not proof that any particular control scheme is fun. [XAG107 Input](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/107), [XAG108 Difficulty](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/108).
- Valve's Left 4 Dead talk treats believable bot fairness through imperfect knowledge and distinguishes intensity pacing from difficulty; its director varies threat population and allows relaxation periods. We should adapt the principle of breathing room, not transplant a complex director into a small arena game. [Mike Booth, AI Systems of Left 4 Dead](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf).
- Castle Crashers' developer lists local/online four-player play, campaign progression, weapons, companion abilities, arena and a separate minigame. It demonstrates a coherent comic combat product spanning several activities; its inventory size is not a target or evidence that copying it would improve this game. [Developer game page](https://ww2.castlecrashers.com/game/).
- Valve's playtesting talk combines observation with verbal reports, warns that observer presence biases results and calls for explicit design goals. Automated success must stay separate from actual voluntary continuation and player explanation. [Mike Ambinder, Valve's Approach to Playtesting](https://cdn.fastly.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf).

### Inferences

Proposed implementation/acceptance contract, not passed tests or universal benchmarks:

1. **Combat clarity:** Keep light/heavy/guard/parry/bash/dash rules stable initially. Capture attack startup/contact/recovery and collision overlays together, at every facing and both visors. Every damage event must map to a visible attack/projectile/hazard; distinguish hit, guarded hit, parry, whiff and immunity. Local animation must never imply hit before authority confirms it. In human review, ask players what hit them and what they could have done; repeated unexplained deaths are a release defect, even if unit tests pass.
2. **Input parity:** Document one action vocabulary across keyboard, mouse and pad. Keyboard movement + mouse world aiming and click attack remain first-class; keyboard-only directional aim and gamepad right-stick aiming/appropriate assistance should be explicit. Verify actual existing right-stick behavior before promising it. Implement remapping, sensitivity/deadzone and aim-assistance options where missing; prohibit pointer motion stealing a couch partner's seat. Check click/hold/release, aim near UI, pause/focus loss, simultaneous buttons, device reconnect and every menu-to-match transition. Physical tests remain required. Do not equalize hardware by giving enemies hidden information or silently changing damage.
3. **Weapon variety:** Give each weapon one sentence explaining its tactical use/counter. Keep sword dependable, Crossbow deliberate/piercing, Croissant positional/returning and remaining existing weapons distinct. Display current weapon, ammo and upgrade level near the controlled player/HUD without covering targets. Test each level versus guard, reflection, walls, mounts, death and online ownership. Measure whether early pickup control creates unstoppable winners; preserve level-three per-life ceiling and reset on death. Cosmetic progression must not purchase combat advantage; avoid a permanent stat grind in competitive couch play. Tune only after mixed-skill sessions identify a repeatable snowball problem.
4. **Bot fairness:** Retain four labelled difficulties and expose chaos separately. Test objective completion and pathing at each difficulty, including ranged retreat, shield counterplay, teammate separation and bot fill. STEVE should punish recognizable mistakes, not perform impossible input-reading. Log reaction delay/target acquisition in QA and verify line-of-sight/sensed-state rules before claiming fairness. Audit whether grouped bots all focus the only novice; use bounded simultaneous pressure. Keep local chosen difficulty stable during the round.
5. **Chaos:** A party option, not a substitute for core combat. Simple = stable fundamentals, Normal = legible escalation, Insane = denser combinations while preserving warning priority and frame budget. Retain the requested rare events, but present owner, remaining duration/ammo and defensive answer. Use forced-seed QA to test rare events; do not ask testers to wait hundreds of rounds. Music/jokes must yield to danger cues; reduce flashing and independently control music/SFX. Keep serious ranked modes outside this system.
6. **Maps:** Roomier is already shipped (+21% floor area) and remains a setting, not a claim all maps are redesigned. Review travel-to-conflict, safe escape route, contested pickup and visible hazard counter separately per map and player count. Larger empty space can hurt couch readability. Do not shrink characters to fit a giant shared view. Use distinct landmarks/occlusion-safe paths; spawn invariant is reachable safe ground with no immediate unavoidable hazard or trapped exit. Story needs authored layouts rather than the same arena under new scene art.
7. **Social session:** Make a Cup the recommended longer couch/online party session: stable seats, readable round objective, brief results/earned awards, obvious ready/rematch. Preserve meaningful participation after elimination but prevent unlimited revenge pecks from deciding a lives match unfairly. Test novices and experienced friends together; measure eliminated-player waiting, controller handoff, argument over scoring and whether everyone chooses another round. Allow short standalone matches and longer Cup/story choices without forced grind. Earnable wardrobe goals and visible mastery are reasons to return; automated retention targets or reward scarcity are not evidence of enjoyment.

Mode-specific test/experience matrix (every row needs host, guest and supported couch roles; Classic/Roomier where applicable):

| Format | Core player understanding | Necessary failure/edge acceptance |
|---|---|---|
| Free-for-all | Who am I, why did I die, how do I rejoin? | KO attribution, protected safe respawn, ties/timeouts, repeated rematch |
| Red vs Blue | Team identity and ally rules | Balanced seats/bots, own-team hits, departures, simultaneous final scores |
| Last Knight Standing | Lives and chicken participation | Last life, simultaneous elimination, bounded chicken disruption, no spectator soft lock |
| King of the Pie | Occupy uncontested objective | Contested/no score, relocation cue, timer/threshold collision |
| Pie Heist | Steal, carry, return | Carrier death/disconnect, unreachable drop recovery, simultaneous pickup, own-pie requirement |
| Flag Frenzy | Capture then hold three flags | Contested capture, ownership UI, ties and score cadence |
| Chicken Race | Four laps, route, nonlethal directional peck | Humans/bots can peck, no damage exploit, reverse/skip checkpoint, fall recovery, Rooftop routes |
| Hot Pie | Pass the fuse before it blows | Transfer near expiry, invulnerability, final two players, simultaneous demise |
| Custard Cup | Three-round shared arc | Correct human-only standings, ties, readiness, late arrivals, departed seats, interruption/recovery |
| Story | Goal, reason, checkpoint, consequence | Every objective order, escort stuck/dead path, pause, retry, save/migration, skip/replay, no duplicated rewards |
| Faction Brawl/CTF/Siege | Role and objective contribution | Full/partial bot populations, protected rear spawn, role counters, flag recovery, castle stalemate, authoritative end |

### Gaps

No new human or hardware play occurred in this research. Current full remapping/right-stick/toggle coverage needs a direct implementation inventory. Existing automated tests do not establish mixed-skill fairness, target travel time, minimum spec, return rate or all 200-player behavior. Source only permits faction team sizes 4/20/50; 100v100 is a new 200-combatant milestone, not completed by the 100-total preview. Networking/hosting capacity belongs to the separate multiplayer research workstream.

## How should story and faction identity become convincing?

### Takeaway

Deliver one complete local story: a familiar bakery is threatened, rescued people matter, an enemy becomes an ally, and the player resolves the siege and returns home. Distinct factions must read through silhouettes and landmarks at actual gameplay size, while keeping the accepted rounded style and equal competitive statistics.

### Cited Findings

- Authored chapter direction already specifies bakery setup, pantry rescue, causal bridge/Steve sequence, Rind's witnessed rescue, cooperative sluice finale and homecoming. It explicitly marks these as unimplemented direction and preserves later kingdoms as deferred. [Story direction](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/release/STORY-EXPERIENCE-DIRECTION.md), [original treatment](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/THE-GREAT-PUDDING-WAR.md).
- Current campaign source places seven of eight nodes in courtyard and one on frost; progression is mostly isolated tasks. UI can Continue from results without showing aftermath, while already supporting scene skip/replay/subtitles. Current cinematic callback can use riceGuard armour, but live campaign spawn uses great helm and faction battle rendering largely varies colour/role kit. Do not call an integrated faction art family finished. [Campaign](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/campaign.js), [UI](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/game/campaign-ui.js), [shared renderer](https://github.com/joshharris-sparkedfm/custard-knights/blob/937cb80/index.html).
- Supergiant's first-person writing account explains concise reactive narration tied to visible actions, adding meaning rather than merely describing actions, and iterative implementation. Kasavin's GDC slides place exposition in structure and systems as well as dialogue. [Writing Bastion](https://www.supergiantgames.com/blog/in-depth-writing-bastion/), [GDC exposition talk slides](https://media.gdcvault.com/gdconline10/slides/11488-I_Dont_Wantto_Know.pdf).
- Valve's TF2 art paper describes class silhouettes validated without interior detail and contrasting architecture for opposing bases, while limiting visual noise. Use this readability method, not its protected characters or art style. [Valve paper](https://steamcdn-a.akamaihd.net/apps/valve/2007/NPAR07_IllustrativeRenderingInTeamFortress2.pdf).

### Inferences

Bounded production sequence, each checked/merged before next:

**S1 — coherent opening slice:** Author bakery forecourt and service pantry, Mabel's delivery, Steve stealing scraps, interruption and current three-cook rescue. Establish place/person in first two minutes as a provisional target. Return to visible siege threat. Integrate transitions/default aftermath, not just more dialogue cards. Preserve saved node IDs or ship explicit migration. Gate: uncoached players can say what they are saving and why, complete rescue without staff explanation; retry does not repeat long intro.

**S2 — causal middle:** Replace compulsory knight exam with Stirling actually protecting a route. Distinct cooling-channel layout, visible safe landings and optional biscuit practice. Steve's food motivation drives a useful ride into the winch yard. Use existing mechanics; do not add a new cinematic-only gameplay promise. Gate: players can explain why each destination follows the previous action; no route/escort soft locks across assistance/difficulties.

**S3 — earned closure:** Meet Rice guard before Rind fight; during readable safe interval, free that guard. Rind witnesses the action and helps at the sluice; rescued cooks supply tools, Stirling covers approach. Player performs final diversion, then walks into recognizably saved bakery. Gate: ending resolves immediate siege before introducing missing-Spoon hook, with saved completion/spoons and replay working. No requirement to build all six kingdoms to finish this chapter.

**S4 — faction family production:** Start two live factions; third is a style bible until it actually has gameplay. Custardia: round saucepan/bell armour, apron/tabard, ladle/bakery insignia, warm brick/oven roofs. Rice: broad bowl shields, stepped overlapping plates, tall grain crests, pale squared granary/terrace masses. Angelic Delight: swept/light silhouettes and whipped crest/architecture, not just pink recolour. Separate faction shape from role shape: vanguard shield breadth, ranger bow/quiver, engineer tool/pack, support banner/satchel. Equal faction combat stats and matched hitboxes; silhouette cannot disguise attack reach. Paid/earned cosmetics must preserve these signals and both visor choices.

Faction art acceptance target: a small mixed-player panel correctly distinguishes faction and key threat role from randomized grayscale/silhouette and actual-size crowded frames. Record confusion by facing/helmet/cape/visor; require no systematic faction mix-up before full atlas bake. Test all existing layers, mount, attacks and projected equipment sockets, avoiding duplicated vector/baked arms or holdout holes. Keep a constrained memory/texture budget and profile actual crowds. Numeric recognition thresholds should be agreed as internal targets, not cited industry facts.

**S5 — human revision:** Observe initial solo session, mixed-skill couch Cup and remote friends separately. Ask what they are doing/why, memorable character, what changed because of their actions, confusion/drag and what they voluntarily choose next. Avoid briefing the intended message first. Record device, build and actual stopping reason with opt-in reporting; change one major hypothesis per iteration. A polished claim needs these sessions, not another automated count.

### Gaps

Owner rejection of story is direct feedback but not a broad cohort. No current chapter duration, character attachment or enjoyment measure exists. Earlier generated story videos are claimed by owner but location remains pending; do not label canvas captures as recovered videos. This treatment does not authorize six new kingdoms or claim public factions are finished.

## Where should Higgsfield and other creative tools help?

### Takeaway

Use creative tools for controlled references, selected establishing/reveal shots and editable promotional material. Keep combat, rescues and final actions playable; generated film cannot repair weak mission causality or demonstrate multiplayer capacity.

### Cited Findings

- Read-only Higgsfield model search/get on 13 October verified `kling3_0`: start/end image roles, 3–15-second duration, 16:9/9:16/1:1, selectable audio on/off and standard/pro/4k modes. No job submitted. These are live connector capabilities, not guaranteed character consistency or a quality benchmark. The available local [Higgsfield skill](C:/Users/Joshua/.codex/plugins/cache/openai-curated-remote/app-6a3293e129088191abf0875820e839da/2.1.0/skills/higgsfield/SKILL.md) says a provider mention alone is not a preset invocation and ordinary generation uses direct tools.
- [Video-editing skill](C:/Users/Joshua/.codex/plugins/cache/openai-curated-remote/app-6a3293e129088191abf0875820e839da/2.1.0/skills/video-editing/SKILL.md) documents Higgsedit trims, mixing, titles, contact sheets and editable project/render outputs; mere analysis does not activate an editing job. No claim of a local Adobe desktop connection is made by this research.
- Microsoft's captions guidance covers cutscenes and consequential non-speech cues, speaker identification, adjustable text and subtitle availability before the opening. [XAG104](https://learn.microsoft.com/gaming/accessibility/xbox-accessibility-guidelines/104).

### Inferences

Proposed asset pipeline:

1. Inventory existing video files/service output IDs first. Catalogue plot beat, characters, audio, rights, hash, resolution, duration and whether gameplay or generated. Pending location is a dependency, not permission to regenerate everything.
2. Export accepted Blender/game character turnarounds, both visors, weapon/hand proportions, faction reference sheets and environments. Create one approved contact sheet per recurring character/faction, including forbidden drift (new eyes, different anatomy, extra limbs, inconsistent helmet). Adobe can assist approved sheet/layout/crop/export work after capability/session inspection; refero research informs menu hierarchy elsewhere, not battle art imitation.
3. Lock a storyboard against S1–S3: proposed 4–8-second establishing shots, short theft reveal, siege approach and homecoming details. These durations are creative proposals within verified provider limits, not evidence from playtesting. Prefer start/end reference images and one clear action per shot. No generated text/logos baked into film; keep captions editable/localizable.
4. Make low-cost animatic from owned stills/game capture first, with placeholders explicitly labelled. Check pacing in the actual game before paid final generation. Generate only missing approved shots; record request/model/settings/output identities. Review each frame for character drift, weapon contact, misleading physics and continuity.
5. Assemble editable masters, clean audio stems and subtitle cue data; export game-compatible 16:9 playback with a tested fallback still, skip/replay, pause/focus rules, reduced-motion option and subtitles before first frame. Validate actual Electron codec playback, offline access, packaging, seeking and save progression; no external streaming dependence.
6. Trailer uses current actual gameplay for combat/scale claims, with generated story sequences clearly separated. Label bot footage; never use generated crowds to imply proved 200-human battles. Store art should communicate bakery-comedy/social-action promise and match accepted in-game models.
7. Audition existing 13 cues before creating more. Mix warning priority ahead of music/jokes, independent sliders and captions for essential audio, then test crowded Insane scenes for clipping/masking. No new music export dependency currently exists.

### Gaps

Live account constraints and per-job costs can change and must be checked before production. No assets were uploaded to Higgsfield or Adobe, no creative sessions opened and no media rendered here. Generated consistency must be inspected rather than promised. Adobe/Refero detailed capabilities are being assessed by the companion UI researcher. All proposed acceptance targets require actual implementation and evidence.
