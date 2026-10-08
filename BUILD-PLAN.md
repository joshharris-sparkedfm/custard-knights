# Custard Knights: master build plan

8 October 2026 · Design and implementation plan

**Build a funny, readable arena brawler with a solo dessert-war campaign, a compelling party Cup and cosmetics earned entirely through play.**

This is the implementation entry point. It consolidates the research and the subsequent story/cosmetic decisions. Where earlier documents suggest different sequencing, use this plan. The planning exercise itself made no runtime changes. Subsequent implementation delivered the first campaign chapter, Custard Cup, earned collection and Windows package; consult [launch status](release/LAUNCH-STATUS.md) for current evidence. Remaining proposals are not automatically shipped features.

## 1. Product decisions

- **Core:** short, satisfying fights with understandable counters and player-created comic moments.
- **Solo:** The Great Pudding War, with a winding level map, short authored encounters, optional spoons and bosses.
- **Friends:** local and online play, initially organised around a three-round Custard Cup with a persistent group score and quick ready-up.
- **Identity:** desirable, mixable cosmetics. No microtransactions, premium currency, paid skips, loot boxes or paid battle passes. No combat advantages from cosmetics.
- **Presentation:** chunky cartoon knights, strong silhouettes, expressive animation and readable dessert-themed environments. Continue the current Blender-to-sprite pipeline while measuring its limits.
- **Distribution:** browser validation first. Steam packaging is a separate spike after the core slice works. Retain the existing game and content; do not make an engine port a prerequisite for player testing.

Supporting specifications:

1. [Player behaviour, research and measurement](PLAYER-BEHAVIOUR-ROADMAP.md)
2. [The Great Pudding War: story and first chapter](THE-GREAT-PUDDING-WAR.md)
3. [Cosmetic progression and collection](COSMETIC-PROGRESSION.md)

## 2. What the review actually establishes

The planning review inspected source at `9b94a5707916ceb808adef9f0c4e882552b551c0`, matching remote HEAD when checked earlier in this task. It included a local browser smoke inspection, historical QA reports and external research. It did not include a full human playtest, an online network test or a fresh automated suite run. No retention baseline or live release is verified.

| Area | Already in the current source | Next action |
|---|---|---|
| Combat | Light/heavy/stab/bash, parry/riposte, guard, hit-stun, hit-stop, dash protection and knockback | Tune and teach; do not add duplicate systems |
| Bots | Difficulty-specific reactions, attack limits, parries, heavies and punish behaviour | Observe whether difficulty feels fair; test objective competence |
| Recovery | Two-second spawn protection, protection checks on pits/gusts/conveyors, death tips | Regress hazard interactions and identify unfair repeated deaths |
| Characters | Layered baked knights/chickens, tinting, high-resolution menu poses and classic fallback | Improve animation distinction, silhouettes and composition cost |
| Party | Four local seats, online host/guest flow, waiting for the next round | Fix seat persistence and guest reward attribution; then build Cups |
| Progression | 18 cosmetic tiers and six challenges, local saves | Preserve ownership; introduce chosen goals and reliable rewards |

The 26 September reviews are useful history, not an unfiltered backlog. In particular, their claims that hit-stun, gamepads or baked characters are absent are superseded. The current source uses five rendered directions with mirroring and 17 animation frames per direction, not the eight-direction pipeline proposed in older research.

Sources: `index.html` around 410–412, 760–867, 929–930, 1090–1098 and 1715–1792; `art/blender/knight.py`; `art/blender/pack.py`; [QA documentation](qa/README.md). Historical QA findings retain their original dates.

## 3. Gameplay improvements

### A. Make every important action legible

Prototype distinct visual and sound cues for light swing, charged heavy, shield bash and dash-stab. The baked renderer currently selects the same four-frame swing animation for all swing kinds. Charging and dashing also need readable poses before spending time on extra cosmetic motion.

Align the weapon arc, anticipation and recovery with actual hit timing. Tune animation around the combat rules first; change rules deliberately when testing shows a problem. Introduce clearer range information in practice encounters without painting permanent attack cones over every live fight.

Give block, parry, guard break and whiff separate feedback. Ensure a successful defensive action leaves an understandable opportunity. Keep the control set compact; do not add a stamina bar or extra attack button at this stage.

**Acceptance:** observers can distinguish the four attacks at game scale; novices can explain why a block or counter worked; no cosmetic changes collision or attack range. Verify feedback on host and guest. Host hit-stop currently pauses simulation updates and snapshot progression, so increasing it requires network-feel testing.

### B. Improve the first fight and loss recovery

Test Courtyard as the first arena, with a short objective and fewer simultaneous threats. Compare four versus eight total knights on the same setup. Teach move/swing, block and dash through action; let experienced players skip the introduction.

Provide one early opportunity to participate in a signature event. Retune Steve's timing by format: current logic uses remaining time and therefore behaves very differently in 90-second versus 180-second rounds. The campaign gets explicit event triggers; party rounds retain controlled variability.

On death, make the cause and next useful action clear. Preserve quick recovery, check every environmental protection interaction and avoid reintroducing spawn trapping. A defeat can still produce a useful skill accomplishment or funny award.

**Acceptance:** a first-time player can identify their knight, perform an intentional action and describe their last death without coaching. Compare voluntary rematches, not just kills or tutorial completion.

### C. Give enemies and arenas tactical purpose

Campaign enemies: one teaching guard, one shield guard, one ranged guard, then combinations. Rice formations teach flank/guard break; pink gusts teach positioning later. Keep enemy tells truthful and reaction windows compatible with the selected difficulty. No invisible stat changes to force close outcomes.

Party bots: test whether they pursue the actual objective in Pie Heist, King of the Pie and Flag Frenzy; handle a disconnected player taking over as a bot. Inspect stuck behaviour and human dogpiles. Do not tune solely against the automated rusher persona.

For each arena, define the safe route, contested reward and hazard counter. Audit spawn access and objective reachability. Start with Courtyard and the first boss arena; tune the remaining maps from observed problems. Preserve deliberate differences between a clean teaching arena and an advanced hazard arena.

**Acceptance:** no unreachable critical objective; bots complete relevant modes; a novice can name a hazard warning and avoidance route. Record accidental versus player-caused hazard deaths to guide changes, rather than enforcing an arbitrary kill-share target on every map.

### D. Make chaos attributable and paced

Give major events clear setup, action and aftermath. Try one voted House Rule between Cup rounds and one prototype chain reaction using existing pies/knockback/hazards. Test whether both victim and attacker understand what happened.

Avoid stacking a teaching card, major announcement and several screen-wide effects. Retain the existing optional Chaos+ treatment for disruptive modifiers. Test recovery and fairness before adding extra powers for eliminated chickens.

**Acceptance:** a new viewer can explain a short clip without commentary, and less successful players still choose another round. Repeated laughter from one winner alone is insufficient evidence.

## 4. Graphics and audio improvements

### Visual direction

Use broad shapes, clear team markings, chunky weapons, warm highlights and coloured shadows. Give each kingdom its own architecture and materials while keeping a consistent camera, scale and lighting language. Custardia begins with custard-yellow accents and kitchen heraldry; rice uses bowl forms and heavy silhouettes; pink courts use whipped shapes and airy structures later.

Reserve the strongest contrast for the player, immediate threat and current objective. Floors and repeating decoration should support those elements. Readability must also work through shape, labels and patterns, not colour alone.

| Work | Concrete change | Verification |
|---|---|---|
| **Player identity** | Persistent compact seat/name marker, clear rim/ground marker and coherent team tint; reposition markers when characters enlarge or ride Steve | Find each local player quickly on all six arenas, including dark/gold kits and colour-vision simulations |
| **Character silhouettes** | Improve distinctive helmet outlines and weapon thickness; remove details that disappear at play scale | Black-silhouette sheet and actual-size in-game comparisons; include new Rooster Crown and Rice Guard helmet |
| **Combat animation** | Separate heavy, stab and bash poses; visible charge, dash and recovery; improve hit/KO personality | All directions, mirrored views, held weapons, shields, cosmetics, chicken/boss/Steve states; visual timing matches gameplay |
| **Background hierarchy** | Reduce distracting repetitive detail where it competes with play; strengthen walkable-floor/pit separation and wall edges | Side-by-side captures on Courtyard, Bog, Frost and Roof; test at the actual intended screen size |
| **Hazard language** | Consistent warning phase, active phase and safe recovery phase; distinct pickup/objective/hazard shapes | Players identify danger without guessing from colour; warnings remain readable under chaos |
| **Effects budget** | Prioritise one dominant aura per knight; bound callouts/particles; move announcements away from critical action | Stress scene with eight knights, power-up stacking, Steve and major event; reduced-flashing and zero-shake settings respected |
| **Campaign map** | Winding path, readable node states, kingdom landmarks, next boss silhouette and small environmental changes after victories | Controller/touch/keyboard navigation, clear next playable node and no dependence on tiny text |
| **Wardrobe and podium** | Locked-item preview, actual-size preview, visible goal, instant equip choice and expressive result pose | Players can identify a wanted item and its unlock route; rewards do not delay the next round |
| **Audio feedback** | Distinct swing/whiff/block/parry/guard-break sounds; duck less important sounds under warnings; short faction motifs later | Gameplay remains understandable with sound off; audio remains useful with effects reduced; no large volume spikes |

Specific arena edits are candidates for fresh capture and testing, not claims that all old art complaints remain present. Do not apply the old recommendation to brighten Bog by a fixed percentage without comparing the current renderer.

### Preserve and improve the existing pipeline

`art/blender/knight.py` defines the toon character; `pack.py` packs cropped layers; `sprites/knight.js`, `chicken.js` and `hero.js` supply runtime atlases. Update sources and regenerate assets reproducibly rather than hand-editing generated atlases.

Profile composition, lazy decoding and memory under a worst-case kit mix. Investigate bounded cached compositions or asset loading changes only where measurements justify them. Warm the assets needed for the selected match so first-use decoding does not interrupt a fight. Keep a visible, stable fallback if loading fails.

Test mirrored weapon/shield poses and heraldic symbols before deciding whether all directions need unique renders. Prototype the new attack poses on one knight and one helm before regenerating every combination. Maintain the existing classic renderer as a compatibility path while the art changes stabilise.

Provisional target: smooth 60 fps on an agreed baseline laptop at 1280×720, with frame-time percentiles, loading stalls and memory recorded. Select and document the actual hardware before declaring this met. Browser touch input is tested; a full mobile commercial launch is not part of this slice.

### Research behind the direction

Valve's original rendering paper describes distinctive silhouettes, controlled detail and contrast that support recognising characters under varied lighting. The application here is to prioritise recognition and readable action when judging an art upgrade. [Valve: Illustrative Rendering in Team Fortress 2](https://cdn.steamstatic.com/apps/valve/2007/NPAR07_IllustrativeRenderingInTeamFortress2.pdf).

Motion Twin documents building 3D assets for 2D presentation, and its artist's first-person production account explains the Dead Cells animation pipeline. That supports continuing to evaluate our existing layered renders; it does not establish that their exact rendering settings or pixel style fit Custard Knights. [Motion Twin FAQ](https://motiontwin.com/faq), [Thomas Vasseur's production account](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-).

The behavioural research and comparable party games are cited in the [research roadmap](PLAYER-BEHAVIOUR-ROADMAP.md). These are sources for design hypotheses, not evidence of this game's retention or guaranteed virality.

## 5. First milestone: a complete playable slice

The first milestone should contain:

- A reliable baseline combat encounter with improved readability and attack feedback.
- Three campaign encounters: banquet escape, shield-guard lesson and Marshal Rind boss prototype, connected by a small map with save/resume.
- A three-round Cup using existing modes, persistent seats, clear scores, ready-up and three event-backed awards.
- A wardrobe with a first reward choice and one pinned goal, preserving existing ownership. Use existing assets until new items pass their art review.
- Up to six new signature cosmetics after validation, as specified in the cosmetic plan.
- Session, encounter, reward and invitation events sufficient to evaluate real behaviour.

Build the campaign and Cup sequentially if one engineer owns the code. Do not wait for all six kingdoms, full cinematics or final cosmetic art to test the slice. Complete the remaining five encounters of the first chapter only after the three-node sequence works.

## 6. Sequenced delivery

Plan in phases, with provisional two-week planning windows where useful. Team size and availability are unconfirmed, so these are scope/order decisions, not a promised calendar. Re-estimate each phase after its first technical/art spike. No autonomous delegation or implementation is started by this document.

| Phase | Deliverable | Owner role | Gate |
|---|---|---|---|
| **0. Baseline and trust** | Reproduce/fix seats and guest rewards; save schema; event definitions; reference captures and fresh QA | Engineering; Josh for playtest criteria | Reproduction cases resolved, previous saves retained, baseline recorded |
| **1. Feel and readability** | Attack-cue prototype, first arena pass, first-fight experiment, effects/audio priorities | Gameplay engineering + art/animation | Players understand actions and deaths; no performance/input regression |
| **2. Campaign slice** | Three authored encounters, small map, boss, save/resume, story exchanges | Gameplay engineering + design/writing | Players can finish without coaching and choose to continue; boss failure feels explainable |
| **3. Party session** | Three-round Cup, stable seats/rooms, ready-up, scores and awards | Engineering + design | Groups voluntarily continue; mixed devices and online rematches pass |
| **4. Earned identity** | Preview/goal board, first reward choice, up to six authored items, save migration | Engineering + art | Correct awards for solo/couch/guest; players choose and equip rewards; no gameplay differences |
| **5. Wider validation** | Complete first chapter if supported; creator-ready real gameplay; Steam packaging spike if needed | Engineering + art + Josh | Technical gates hold in real conditions; solo and group returns tracked separately |
| **Later** | Further kingdoms, weekly recipes, full capture, editor, platform expansion | Reassess | Evidence identifies a need and capacity exists |

Phase 0 must precede rewards/Cups; basic art and combat work precedes a polished boss. Phase 4's data design starts in phase 0 so rewards are not retrofitted incompatibly. Final asset production can overlap later engineering only if a separate artist is available.

## 7. Engineering-ready backlog

Effort labels are relative planning sizes: S = bounded change, M = multi-component feature, L = significant feature or uncertain spike. They are not day estimates. All items are proposed and not started.

| ID | Priority / size | Work and dependency | Done when |
|---|---|---|---|
| CK-01 | P0 / S–M | Reproduce and fix `partyStart` → `start` → rematch seat reset | Mixed devices, reverse join order and five rematches retain ownership; reconnect case covered |
| CK-02 | P0 / M | Host-authoritative per-player summary and reward deduplication | Host/guest parry, lava and ring-out goals update correctly once, including replayed messages |
| CK-03 | P0 / M | Versioned save, old-entitlement migration and shared couch award policy; depends CK-02 | Existing collection survives; any local human can qualify under explicit household rules; round credit is not multiplied by seats |
| CK-04 | P0 / M | Event schema and baseline report | QA/demo activity excluded; valid denominators and build IDs; inferred exits labelled |
| CK-05 | P1 / M | First-fight and four/eight-knight experiment; depends CK-04 | Assignment and outcome logged; observe own-knight recognition and voluntary second-round starts |
| CK-06 | P1 / M | Heavy/stab/bash/charge/dash animation spike | One knight demonstrates distinct cues in all views without changing timing accidentally |
| CK-07 | P1 / M | Counter-feedback and input tuning; depends CK-06 | Keyboard/controller/touch checks; host/guest comparison; hitbox and animation alignment verified |
| CK-08 | P1 / M | Courtyard/boss-arena readability and hazard pass | Objectives reachable; player markers and warnings survive representative chaotic scenes |
| CK-09 | P1 / M | Effects/audio prioritisation; depends CK-06–08 | No critical overlapping messages; accessibility settings hold; measured performance stays within agreed budget |
| CK-10 | P1 / M | Data-driven encounters with objectives and roster overrides | Can start/reset/complete a two-enemy encounter independently of the eight-knight party setup |
| CK-11 | P1 / M | Campaign map, prerequisites, spoons and save/resume; depends CK-03,10 | Main route opens on completion; optional feats persist; invalid/missing save state recovers safely |
| CK-12 | P1 / M | Banquet escape and shield lesson; depends CK-07,10,11 | Objectives, teaching and short dialogue work; no required cinematic assets |
| CK-13 | P1 / L | Marshal Rind two-phase boss and rescue ending; depends CK-08,10,12 | Tells, punish windows, resets and completion reliable; no softlocks after phase changes |
| CK-14 | P1 / M | Cup session state and placement scoring; depends CK-01,02 | Three rounds produce a consistent winner/tie; bots do not accidentally take the human Cup trophy |
| CK-15 | P1 / M | Ready-up, room continuity and late-arrival policy; depends CK-14 | All players know when they will play; disconnect/bot replacement handled; host-loss recovery clear |
| CK-16 | P1 / M | Three factual Mischief Awards; depends CK-02,14 | Awards derive from logged events; no fabricated highlights or grief incentives |
| CK-17 | P1 / M | Item catalogue, preview, first reward choice, pinned goals; depends CK-03 | Switch goals without losing progress; locked preview accurate; unlock/equip/reload works |
| CK-18 | P1 / L | Six-item capsule; depends CK-06,17 and silhouette review | Complete render/animation checks; play-scale quality accepted; clear earning routes |
| CK-19 | P1 / M | Real-network/reliability matrix and runtime profiling | Results retained by build; no unresolved severe failures; memory/loading/stalls measured |
| CK-20 | P1 / M | Human slice test and prioritisation report; depends CK-04,12–19 | Solo/group cohorts separated; reasons for stopping recorded; scope decision made from evidence |
| CK-21 | P2 / L | Remaining chapter encounters; depends CK-20 | Eight-node chapter has deliberate variety and passes save/failure testing |
| CK-22 | P2 / M | One House Rule choice and attributable chain-reaction prototype | Improves understood agency without undermining fairness; keep only if supported |
| CK-23 | P2 / M | Steam packaging/overlay/input/save spike | Tested on intended hardware; installation and live-release readiness remain separate |
| CK-24 | P2 / M–L | Postcard/recording and small creator pilot | Real gameplay accurately represented; recipients can join; capture cost measured |

Avoid an all-at-once rewrite of `index.html`. Extract bounded modules as the relevant ticket is implemented: session state, result/progression model, encounter definitions, campaign controller and UI. Add stable interfaces between simulation events and presentation. Do not let campaign scripts or cosmetic data bypass authoritative combat/results.

## 8. Verification and player research

### Technical gates

Use the existing `node qa/run.js quick` for targeted gameplay changes, `node qa/run.js` for a broader integrated release check, and `node qa/run.js perf` as a starting performance sample. Confirm runtime/browser prerequisites first. Extend tests for new behaviour; existing scripts do not cover all new requirements or prove real-world online quality.

Add meaningful regressions for seat persistence, per-player rewards, duplicate delivery, old-save migration, campaign prerequisites, objective completion, boss phase resets and Cup ties/disconnects. Reuse appropriate harness components rather than writing tests that merely repeat configuration data.

Run actual devices: mixed keyboard/controllers, four pads, an agreed baseline laptop, a representative touch device and two machines on different networks. Include poor network conditions, host departure, guest reconnect and late join. Test both renderers where supported. Record failures and build IDs.

For art, retain before/after captures at play scale, a direction/animation contact sheet and an effects stress scene. Check colour/shape identification, text layout, reduce-flashing and zero-shake. Headless FPS alone is not proof of performance on the player's laptop or TV setup.

### Behavioural gates

Use the earlier proposed eight friend groups and eight solo newcomers for discovery, not statistical claims. Let them play without coaching. Follow access over two weeks and distinguish spontaneous return from booked research sessions.

- **First fight:** can players identify themselves, act intentionally and explain a death?
- **Campaign:** do they understand the next objective, learn the counter and choose the next node? Where do they stop or repeatedly fail?
- **Cup:** do groups voluntarily start rounds two and three? Does the least successful player still participate?
- **Cosmetics:** what do they preview, pursue, earn and actually equip?
- **Graphics:** can they identify attacks, threats and objectives more easily after the change?
- **Return:** does a solo player resume the campaign, and does a group reconvene? These are separate outcomes.

The numeric starting gates in the research roadmap are provisional internal targets, not industry benchmarks. Report denominators, sample size, uncertainty and observed reasons alongside any percentages. Do not call the game “viral” from views, share-button clicks or creator interest alone.

## 9. Scope controls and immediate order

Keep all existing earned items and party modes. Defer new currencies, paid cosmetics, ranked matchmaking, a full engine rewrite, all six kingdom art sets, long cinematics, proximity voice, co-op campaign and a public editor.

The first concrete work order is **CK-01 → CK-02 → CK-03/04 → CK-06/08 → CK-05/07/09 → the three-node campaign slice → the three-round Cup → the cosmetic capsule → human validation**. Slashes indicate closely related work, not permission to start parallel agents or an assumption of extra staffing.

If the campaign is enjoyable but the Cup is weak, improve party flow before marketing the social promise. If people like the look but cannot read the combat, spend on animation and hierarchy before more costumes. If they understand the mechanics but do not want another round, revisit encounter decisions and pacing before adding content volume.

The next build should demonstrate that the game feels better, looks clearer and gives both solo players and friend groups a reason to continue.
