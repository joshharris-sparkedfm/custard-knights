# Arena weapon variety

Two ordinary arena weapon pickups extend the existing Bow, Bomb Bag and Custard Cannon. The base sword, parry, guard, bash and dash-stab rules are unchanged.

- Crossbow: four starting bolts, one fast piercing shot, slower reload than the Bow. Repeated pickups raise its level and refill ammunition. Blocking reflects the bolt.
- Returning Croissant: three starting throws, an outward leg followed by a return toward the current wielder. It can hit each enemy only once during a throw, including after reflection. Walls stop it; a block transfers return ownership to the defender. Death or falling ends the owner's throw, and a 1.8-second absolute lifetime prevents reflection loops.

Both participate in ordinary weapon pads and supply drops, bot ranged positioning, held/pad/projectile rendering, tips and KO attribution. The existing host snapshot format carries their kind and motion; no save migration or combat protocol schema change is required. Faction role weapons remain separate.

All six focused module tests pass, covering return/catch, moving owners, reflected ownership, lifetime, hit history, invalid state, level bounds and unchanged legacy projectile handling. All 30 actual-browser checks pass with zero exceptions: real pad pickup, ammo/reload, line piercing, crate/wall collision, guarded reflection and damage, return ownership, once-per-enemy hits, owner death/falling, bounded repeated reflections, snapshot hydration and drawing. Evidence: `qa/results/weapon-variety/extended/report.json`. The final screenshot uses actual safe Courtyard pads; earlier diagnostic screenshots used relocated fixture pads. Held weapons and pickup icons were visually inspected and remain distinct/readable at game scale.

The browser report identifies index `36c3172ab25657524d731c6aef896557ac857831537ce43331f0bb4934ec70aa` and weapons module `e281fb8745a024b7e325ed44bb4d25e87e069eb48e2a4b68c2269fbd7bb50fd9`. Snapshot round-trip checks are not live network transport or WAN acceptance. Musical rare events and Simple/Normal/Insane controls remain subsequent tasks and are not included here.
