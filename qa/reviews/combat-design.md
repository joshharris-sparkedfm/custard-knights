# Custard Knights combat review

Reviewer: combat design agent, 26 Sep 2026, based on the code and the QA run 2026-09-26T08-09-52.

## 1. What's wrong, ranked by impact

1. **Getting hit costs you nothing, so mashing is the best strategy.** `hurt()` adds knockback (520) but has no hitstun and doesn't cancel the victim's swing. Input friction (`k=14`) hands control back in about 70ms, and the knockback only carries about 37px. So trading hits is always correct. One attacker kills in about 0.94s (3 swings at `atkCd .46`), and `inv .3` is shorter than the cooldown, so it never slows a combo down.
2. **Blocking gives no reward.** A clang pushes the attacker back 420px (`doHit`), out of the blocker's reach. Bots then keep blocking for the rest of `blockT .4`, which uses up most of the attacker's 0.6s penalty. Holding block is free: no meter, a 132° cone, and it reflects arrows. Nobody gains by using it, which is why there were 1,614 blocks against 15,663 swings.
3. **Gang-ups end fights instantly.** The inv bypass in `doHit` lets a second attacker hit within 0.4s. With about 45 KOs a minute, the median human life is 4.5s and they spend about a third of the match dead.
4. **Players can't see or feel their reach.** A swing connects out to 68px (46 reach + 22 radius), and there is no reach indicator. `aimAssist` only turns you 75% of the way to the target, and your facing is locked during the swing. There's also a clause, `d>br+ar+6`, that makes anything within about 50px a 360° hit, so close-range whiffs feel random.
   - Harness caveat: the rusher persona swings at d<80 while bots only swing at d<72 with a perfect `faceTo`, so part of the 81% vs 48% accuracy gap is the persona script, not the game.
5. **Difficulty doesn't change how bots fight.** `DIFFS` only scales react, aggro, dash and speed. Brutal bots move at speed 1.03, faster than a human, and still pick their target as roughly the nearest of 7. They kill each other more, and the rusher picks up the pieces.
6. **Spawn protection leaks.** Humans die within 3s of respawning 24 to 34% of the time, and 25% on Roof. `startFall`, gusts, conveyors and Norr's shove all ignore `inv`.
7. **Dash is only for movement.** It has no i-frames, you can't attack out of it, and its only special property is crossing pits.

## 2. Changes (numbers to try)

- **Hitstun:** 0.18s on any sword hit. It cancels the victim's swing, sets `k=4` so knockback carries about 95px, and cuts base knockback to 420.
- **Light attack:**
  - Active window 0.06 to 0.16s.
  - Cooldown 0.36s if it hits, 0.55s if it whiffs. The whiff penalty is what punishes mashing.
  - Third hit in a chain inside 0.8s: knockback 700.
- **Charge attack:** hold 0.4s or longer, move at 40% speed, and show a glowing wind-up. It does 1 damage, 950 knockback and breaks guard. At a full 0.7s charge the reach becomes 60.
- **Dash:**
  - i-frames for the first 0.10s. Cooldown 1.1 → 0.95.
  - Dash-attack: pressing attack within 0.12s of the dash ending gives a stab with a 1.2 rad arc, 72 reach, 1 damage and 600 knockback, then 0.4s of recovery.
- **Block and parry:**
  - Parry: block pressed within 0.12s before the hit. The attacker is stunned for 0.5s and the defender's next hit gets +50% knockback.
  - Held block drains a guard meter: 1.5s max, then a 0.8s lockout. Block cone 1.15 → 1.0.
  - Clang pushback on the attacker drops from 420 to 200, so the blocker can punish.
- **Shield bash:** attack while blocking. 0 damage, 650 knockback, breaks guard, 1.2s cooldown. This is the ring-out tool.
- **Ring-outs:** scale knockback by `1+0.35*(3-hp)`. Keep the 4s `lastHit` credit.
- **Gang-ups:** a victim can take at most one hit per 0.25s from any source.
- **Respawn:**
  - Respawn delay 2.2 → 1.8s. Protection 1.6 → 2.0s, ending early if you attack. While protected, block knockback and pit falls.
  - Spawn points must be at least 2 tiles from a pit and 320px from any enemy.
- **Hit feedback:**
  - Hitstop 55 → 70ms on a light hit, 110ms on a charge hit or parry. Apply it at half strength to any hit within 400px of a human.
  - Add a distinct whiff sound, and raise the hit sound's pitch with each hit in a combo.
- **Stamina:** no. Use the guard meter plus the dash cooldown instead.

## 3. Weapons and power-ups

- **Bombs** (11% of KOs; 2 damage on a 3 HP knight): 1 damage and 760 knockback across the blast. Keep 2 damage only inside the inner 40% of the radius.
- **Bow:** knockback 300 → 420. Make LV3 pierce instead of firing faster (`.22`). Arrow reflection is the best payoff block has, so keep it.
- **Cannon:** fine as a ring-out weapon. Add 40px of splash.
- **Steve** (11 KOs in 55 matches): his 820 knockback flings victims away after one tick. Change to 2 damage and 500 knockback, add a peck on attack with 1.3× reach, cut the duration from 14 to 10s, and make bots flee him like they flee Norr.
- **Bees** (2.7 KOs per pickup, passive): duration 9 → 6s, sting cooldown 0.9 → 1.2s, and let a sword hit swat the swarm.
- **Ghost** (most picked): bots can't target you at all while it's on. Attacking should end it.
- **Giant:** remove its ability to ignore block, or cut it to 1 damage.
- **Cut Mirror Curse.** Reversed controls feel bad in a paid game. Move it and Swap Party behind a "Chaos+" toggle.
- **Add a Spear:** 80 reach, 0.9 rad arc, poke only. It rewards spacing.

## 4. Bot AI

1. **Brutal whiff-punish.** When an enemy within reach+60 ends a swing without `hitLanded`, dash in and swing within 0.12s.
2. **Brutal spacing.** Hover just outside range (want = 72+20, not the current 59), bait a swing, then step in. Drop block the moment it clangs so the counter-hit comes out.
3. **Brutal reads.** Replace the reactive `o.swing>0` check with a parry on predicted startup. Against a player who swings 3 or more times in 1.5s at under 40% accuracy, raise parry chance to 0.6. Prefer low-HP targets and the leader, and line targets up with pits or lava before bashing.
4. **Attack tokens, all difficulties.** At most 1 bot attacks the human at once on Chill, 2 on Spicy, 3 on Brutal. Other bots circle.
5. **Chill teaching.**
   - 0.35s wind-up with a "!" tell before every swing, and 30% of swings come out early.
   - No attacking a human in their first 2.5s after respawn.
   - Hold block with no parries, and move at speed 0.84.

## 5. Metrics for the harness

- Log `hurt` events so it can report time-to-kill from first damage and hits per engagement.
- Swing accuracy by distance bucket. Whiff rate by persona.
- Clang → blocker hits within 0.8s (punish conversion). Parries per minute.
- Share of match spent dead (target under 20%). Spawn deaths under 3s (target under 8%, Roof included).
- Number of simultaneous attackers on the human.
- KD gap by difficulty. Add "spacer" and "parrier" personas.
  - Targets: pro over rusher by at least 1.5× on Brutal; rusher KD under 0.7 on Brutal; pro above 1.2 on Chill.
- KO share by source (sword 50 to 60%, ring-outs 15 to 25%, bees under 3%). KOs per pickup for each power-up.
- KOs in the first 10s. The screenshots show 4 to 7 KOs by the 2:55 mark.
