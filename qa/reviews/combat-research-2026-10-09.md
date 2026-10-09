# Sword, weapon and faction battle review

9 October 2026. Baseline: Windows/source 0.2.2, commit f718313. This review combines primary-source research, source inspection, actual-renderer images and controlled browser reproductions. It is not a human playtest or a claim of optimal balance.

## Recommendation

Keep the fast, rounded cartoon brawler. Improve consistency before adding attack complexity: the player should understand what hit them, why a defence failed, and when control returns. Retain light/heavy/stab/bash and the existing guard meter; another universal stamina meter would add friction without addressing the defects below. Cosmetics must remain mechanically equal.

## Research applied to this game

- Mariel Cartwright's [GDC animation presentation](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf), especially slides 5–10 and 19–30, prioritises readable silhouettes, brief player anticipation, strong key poses, follow-through and impact pauses. More in-between frames do not automatically produce stronger attacks. Application: preserve the connected arm/hand, make light attacks brisk, reserve the bigger wind-up for heavies, and judge contact at normal gameplay size.
- Mihir Sheth's [God of War combat presentation](https://media.gdcvault.com/gdc2019/presentations/Sheth_Mihir_EvolvingCombat.pdf), especially slides 20–40 and the targeting sections, treats accessible controls and manageable threats as essential to confident offensive play. Application: reduce input surprises and constrain bot pressure around the player. Its close camera solutions should not be copied wholesale into this overhead party game.
- Mike Stout's [Enemy Attacks and Telegraphing](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing) explains why players need to understand incoming attacks before avoidance becomes a meaningful choice. Application: distinct cues for guard-breaking heavy/bash; keep Chill bot tells. A longer player wind-up is not a substitute for readable enemy intent.

These sources establish design principles, not ideal numeric timings for Custard Knights. The recommendations and proposed acceptance targets below are our design judgments.

## What the current combat actually does

| Action | Animation / contact window | Base reach | Damage / knockback | Role |
|---|---|---:|---|---|
| Light | 220 ms / strictly 60–160 ms | 46 | 1 / 420 | Quick pressure, recovery reward on hit |
| Heavy | 300 ms / strictly 60–240 ms | 52.9; 68.8 at extended charge | 1 / 820 | Break guard, launch enemies |
| Dash-stab | 180 ms / strictly 60–120 ms | 69 | 1 / 600 | Reach and chase |
| Shield bash | 180 ms / strictly 60–120 ms | 48.3 | 0 / 650 | Break guard and ring out |

Reach excludes the target radius and modifiers. Damage is normally one heart for heavy: its advantage is force and guard break, not secretly double damage. Light whiff cooldown is 550 ms; hitCd is a cap of 360 ms applied on contact, not necessarily 360 ms from attack start. Parry requires blockAge below 120 ms, stuns the attacker for 500 ms and grants a 1.5-second riposte opportunity. Dash lasts 160 ms and protects against melee/projectiles while more than 60 ms remains. Guard lasts up to 1.5 seconds, regenerates when released and locks for 800 ms when depleted.

Bow fires fast reflectable arrows; higher levels add spread and piercing. Cannon is slower area-pressure presentation with strong knockback and slip; the inspected projectile path applies direct-hit damage, so the old proposal for splash must not be described as shipped. Bombs trade delayed area denial against placement and fuse time. Pickups have ammunition and replace the melee input temporarily; cosmetic sword shapes do not change stats.

## Reproduced baseline findings

Run `node qa/combat-audit.cjs`. Observations are deliberately diagnostic: a recorded behaviour is not a passing quality gate. Baseline evidence: `qa/results/2026-10-09T04-44-39-combat-audit/observations.json`; renderer filmstrip accompanies it.

1. **P1: directional attacks hit directly behind the attacker.** At 49 px centre distance, light, heavy, stab and bash all registered rear contact; at 51 px none did. The `d > br + ar + 6` exception disables the angle test at close range. A forgiving sweep is understandable, but a forward thrust/shield shove hitting behind the back contradicts its silhouette. Fix the directional moves first; do not remove all close-range assistance without testing crowded combat.
2. **P1: buffered dash bypasses stun.** With a pending 100 ms dash buffer and 10 ms cooldown remaining, the next 60 Hz update launched a dash while 283 ms of stun remained. Current input is suppressed during stun, but the buffered execution path omits the stun check. The execution condition must enforce the same rule as fresh input.
3. **P1 presentation: blade/contact phase mismatch.** A target 64 px straight ahead was hit on the first active sample, 66.7 ms, for both light and heavy. The actual mounted blade is still above/behind that direction in the filmstrip. Collision uses cubic progress across the whole swing; presentation uses quadratic progress across only the active interval. Keep one authoritative phase for the contact edge, and show a short swept trail for the intentionally forgiving cumulative sector. Review both renderers, both visors and mirrored directions before shipping a visual correction. Do not replace the sector with thin blade collision: that would materially change accessibility and network tolerance.
4. **P2 input expectation: dash-stab is timing-sensitive.** Attack with 90 ms of dash left produces a light attack; attack on the update that ends the dash produces a stab. This follows the existing “right after a dash” wording, but a novice may reasonably expect dash+attack to queue a stab. Test a 100–150 ms final-dash buffer as an option, with an explicit rule for simultaneous presses, rather than silently altering combos.
5. **P2 charge explanation:** holding attack after a whiff starts charging at about 583 ms in the controlled 60 Hz run and reaches the extended-range threshold at 933 ms. The initial light attack and cooldown happen first. Explain “keep holding after your swing, release the charge” and provide a distinct ready cue; test whether people expect an immediate heavy instead. Do not treat the older proposed 400 ms charge as current behaviour.

## Keep, improve, test

Keep the current weapon decisions and distinct whiff/hit sounds. Give heavy and bash clear guard-break cues that remain readable with reduced flash and muted audio. Keep recovery visible; avoid extending control lock just to show a prettier follow-through. Use brief shoulder/body counter-rotation and a crisp contact key, not wide wrist-only circles. Both accepted visor options remain.

For a crowded faction battle, replace global impact pauses with local presentation pauses or carefully bounded feedback. Existing `G.hitstop` skips the whole arena update, including unrelated players. This is especially unsuitable as the match population increases. Do not simply lengthen hitstop to create “weight”. Limit particles, overlapping hit sounds and floating labels before they obscure the player.

Competitive networking needs separate evaluation: a smooth animation does not prove a fair remote parry. Test real latency/loss and report the server's collision decision clearly. Keep match outcomes authoritative. Avoid a global ranked label until identities, result validation and rating persistence are trustworthy.

## Human acceptance session still required

Use at least one novice and one experienced player, with keyboard and physical controller. In a short isolated duel, ask each to demonstrate light, heavy, parry, bash and dash-stab without coaching after reading the controls. Record accidental moves, unexplained hits and successful identification of guard-break cues. Then run a crowded match with both visors, muted audio and reduced flash. Ask for responsiveness, readability and frustration scores separately. Proposed targets: every participant can explain why a reviewed hit landed; no rear thrust/shove contacts; no action launches during stun; at least four of five intended move attempts succeed after practice. These are review targets, not measured results.

The 0.2.2 package remains the reproducible baseline. New corrections and faction modes require their own acceptance evidence and package identity; previous passing tests must not be presented as verification of new features.
