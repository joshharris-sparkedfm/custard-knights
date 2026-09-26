# Custard Knights: level and spawn design review

Reviewer: level design agent, 26 Sep 2026. Every proposed quadrant was checked with a script against the real mirroring: each has 8 spawns, every floor tile can be reached, spawns are at least 7.6 tiles apart, and no spawn is within 3 tiles of a pit or lava. The moat map was checked in both bridge phases.

## Three code problems that cause spawn deaths

- **Spawn protection doesn't stop pits.** The pit check doesn't look at `e.inv`, so a knight inside the 1.6s protection still falls. The norr roar pushes protected knights, and gusts and conveyors move them too. Lava and spikes do respect protection.
- **The spawn picker is too crude.** `spawnPointFor` looks only at the single nearest enemy, adds ±20% random noise, and ignores line of sight, nearby hazards and which spawn was just used.
- **Spawns come in close pairs.** Mirroring a spawn at quadrant row 6 gives two spawns 120px apart (Courtyard, Factory). Row 5 gives 200px apart (every other map).

A sword hit moves a knight about 37px on normal floor but about 300px on ice (knockback 520 against friction 14 vs 1.7). That explains Frost's pit deaths. On Rooftop Rumble, 37px is enough because four spawns sit right next to a pit.

## 1. Per arena

**Castle Courtyard.** The well plus 4 weapon pads is a good centre. The problems: spawns in 120px pairs, the single spike tiles do nothing, and 6 rows are open end to end. Fix: move the spawns, and add a hedge at (11,5) for cover near the pads.
```
"S.......S......","..hhh..........","..h.....^......",".......x....#..","....##.........","....#......h...",".x...........W.","...........^..w"
```
**Frosty Keep.** The ice bridge between pits is the best ring-out stage you have. The problems: the spawn at (1,5) pairs with its mirror, the ice near spawns does nothing, and the centre corridor is empty. Fix: put the pads on the bridge (risky pickups) and a 2x2 crate block in the dead centre.
```
"S.......S......","..~~~~~...##...",".~~##~~~....ooo","..~#.....x..ooo","...........~W~~","....##.....^ooo","..~~~~.x....ooo","..~~~~........x"
```
**Pie Factory.** The belts carry you nowhere. Hazards are 7% of KOs, and 10 rows are open end to end. Fix: the top belt now runs straight into a 4-wide centre pit, and the middle belts now converge on spikes by the pads. Also move the spawn off the belt line and add a crate at (11,2) to break row 2.
```
"S......x.......","...>>>>>>>>>>oo","...........x...","..#x#..S.^...##","..#.#..........","......>>>>>>>^.","..x..........W.","..........x...."
```
**Dragon's Larder.** Lava at 15% of KOs is right, because lava bounces you out rather than killing outright. The corner lava sits 2 tiles from a spawn, and the centre corridor has no reason to go there. Fix: move the lava pool to (3-4,2-3), and put a 2x2 spike trap in the dead centre in place of the (4,7) spike.
```
"S.....x.S....LL",".............LL","...LL.#....^.LL","...LL.#........","...x.....LL....",".........LL..#.","..........x..#.","..........W...^"
```
**Rooftop Rumble: rebuild it.** Pits are 20% of the arena, and 4 spawns sit 1 tile from a pit. The corner spawn at (0,0) is boxed in by pits with one exit, which is a spring. Twelve rows are open end to end. The new version has 33% fewer pits, a 2-wide pit bridge on the north-south line through the centre, pits you can reach from the pads, a spring that flings you across a pit, and two chimneys to break sightlines.
```
"S.......S......","..x.........x..","....#..........","..oo.......ooo.","..oo.......ooo.","......j..#.....","...x..oo....W..","......oo..oo..."
```
**Custard Bog.** The mud diagonal reads well, but nothing kills (4% hazards), and the portal at (2,2) drops enemies right next to a spawn. Fix: add sinkholes at the centre end of the mud (slow ground next to a pit makes ring-outs), put a pit above each pad, and move the portal.
```
"S....mm.S......",".....mm...hhh..",".....mmm.......","..p...mmm..x...","..hh....mmo....",".........mo..p.","....x.....W....","......^........"
```

## 2. Spawn system

- **Placement rules (enforce in a map linter):**
  - At least 3 tiles from any pit or lava.
  - At least 2 tiles from a belt that feeds a hazard.
  - At least 4 tiles from a weapon pad.
  - At least 7 tiles from any other spawn.
  - Never in a pocket with only one exit.
  - Default layout: 4 corners plus a spawn at (8,0) in each quadrant. For teams that gives each side 2 back and 2 forward spawns.
- **How to pick the spawn:** score each spawn as nearest enemy (capped at 600) + 0.3 × second-nearest. Subtract 250 if any enemy within 450px has line of sight to it, and 400 if it was used in the last 2.5s. Skip spawns with an enemy within 240px unless every spawn has one. Cut the noise to ±5%.
- **Protection:** make it 2.0s, and have it end on your first attack. While it lasts: no knockback of any kind, and no pits, conveyors or gusts. Show a visible bubble. Don't show where someone will spawn before they appear.
- **Free-for-all vs teams:** mirrored symmetry is right for teams. For free-for-all, 8 spawns for 8 knights means someone is always near. Add an optional `s` tile for extra spawns used only in free-for-all (3 per quadrant) so the picker has real choices. In teams, if every home spawn has an enemy within 300px, fall back to the safest neutral spawn.

## 3. Arena flow

- **Sightlines:** at most 3 rows open end to end per map, except on deliberate "lane" maps. Bows at 6% of KOs is fine, so this is about how the maps read, not balance.
- **Centre:** every map needs a reason to be in the middle: pads 1 tile from a hazard, a breakable crate block, or a timed trap. Courtyard's well is the model.
- **Pads:** 4 per map, one step from danger, never in line with a spawn.
- **Crates:** 2 to 3 per quadrant, as breakable cover next to hazards and on the way to pads, never on a spawn's direct path.
- **Hazard share of KOs:**

| Band | Target | Current |
|---|---|---|
| Clean | 5–10% | Courtyard 4% |
| Flavour | 10–20% | Dungeon 15%, Frost 22% (top of band); Factory 7% and Bog 4% are below it |
| Gimmick | 20–30% | Roof 62% |

- **Hazard rules:** no map above 35%. At least 70% of hazard KOs should be credited to another player (knocked in) rather than someone walking in alone. Spawn deaths should be at most 8% on every map.

## 4. Three new arenas (roster of 9: 1 clean, 5 flavour, 3 gimmick)

**Pie Crust Bridge.** New tile `c` (crust): stepping on it without dashing cracks it after 0.6s, it becomes a pit for 4s, then it comes back with a 0.5s warning. You can reuse the trapdoor code (`G.holes`, `flows.clear()`). The centre is a crust island with the pads on it, reached by a crust bridge east-west and a solid bridge north-south. It punishes camping.
```
"S.......S......","..x.......x....","...............","....##....oooo.","....#.....occc.","..........occc.","...x......occW.","..........ccccc"
```
**Trifle Pinball.** New tile `b` (bumper): solid. Touching it pushes you away at 650 with a 0.25s slip, and credits your last attacker. Bumpers sit beside pits, and a 2x2 bumper sits in the centre next to the pads.
```
"S.......S......","...............","..b...x....b...","......oo.......","...b..oo...b...","..........oo...","....x..b..oo.W.","..............b"
```
**Drawbridge Keep.** New tiles `d` and `D` (drawbridges): they switch between floor and pit every 7s, in opposite phase, with a 1s rattle warning. Anyone standing on one when it opens falls. The keep can always be reached from 2 sides, and those sides alternate between east-west and north-south.
```
"S.......S......","..x............","...............","......ooDoooooo","......o..##....","......d...#....","......o.....W..","......o........"
```

## 5. What the QA harness should measure next

- **Hazard KOs, credited vs solo**, per map and per tile.
- **Spawn deaths in detail:** the killer, whether that enemy was in line of sight at the respawn, repeat killer-victim pairs within 3s (camping), and deaths that happened while still protected (should be zero once fixed).
- **Per-spawn numbers:** how often each is used, median life, and time to first contact after respawn (target 3–6s).
- **Heatmaps:** where knights are, where they die, and time spent near the centre.
- **Pads:** pickups per pad, and deaths within 2s of a pickup.
- **A static linter in CI:** the placement rules above, reachability, one-exit pockets, rows open end to end, and pairwise spawn distances.
- **Coverage:** 10 or more runs for every map × mode × persona (there are only 2 team runs now), plus confidence intervals.
- **Bot realism:** bots land 81% of sword swings against 48% for humans, so add a humanlike bot profile before trusting the spawn-death rates.
- **Stuck bots:** flag any bot that doesn't move for more than 3s, especially on belts and drawbridges.
