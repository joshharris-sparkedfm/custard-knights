# Custard Knights QA summary

13 simulated matches, 39 minutes of play, run 2026-09-26T08-09-38.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 41.0 | 21.0 | 1.0 | 10% | 5.8s |
| camper | 1 | 5.0 | 7.0 | 8.0 | 0% | 16.9s |
| collector | 1 | 23.0 | 17.0 | 1.0 | 18% | 6.9s |
| pacifist | 1 | 0.0 | 13.0 | 8.0 | 0% | 10.3s |
| fuzzer | 1 | 2.0 | 30.0 | 8.0 | 30% | 3.6s |
| idle | 1 | 0.0 | 19.0 | 8.0 | 11% | 5.7s |
| pro | 1 | 26.0 | 15.0 | 1.0 | 7% | 9.8s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 46.8 | 5% | 10% | 420px | sword 65%, bomb 8%, bow 6%, bees 5% |
| frost | 2 | 44.3 | 24% | 5% | 383px | sword 51%, pit 22%, bomb 9%, bees 7% |
| factory | 2 | 42.3 | 8% | 7% | 461px | sword 56%, bomb 14%, bow 10%, cannon 6% |
| dungeon | 2 | 42.0 | 16% | 5% | 420px | sword 46%, lava 14%, bees 12%, bow 8% |
| roof | 2 | 59.7 | 53% | 13% | 495px | pit 52%, sword 30%, bomb 8%, bees 4% |
| bog | 2 | 37.5 | 4% | 5% | 472px | sword 44%, bomb 20%, cannon 11%, bow 11% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 874 | 49% |
| pit | 259 | 15% |
| bomb | 191 | 11% |
| bow | 118 | 7% |
| bees | 110 | 6% |
| cannon | 85 | 5% |
| mine | 38 | 2% |
| lava | 35 | 2% |
| spike | 19 | 1% |
| chickens | 16 | 1% |
| thorns | 8 | 0% |
| meteor | 8 | 0% |
| catapult | 7 | 0% |
| norr | 5 | 0% |
| steve | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 49% of 348, bots 81% of 2878
- Ranged shots that hit: humans 23% of 75, bots 41% of 1823
- Blocks (clangs): 440; dashes: 1165

## Power-ups picked up

| power-up | pickups |
|---|---|
| bouncy | 55 |
| mines | 48 |
| swap | 42 |
| bees | 42 |
| banana | 38 |
| ghost | 38 |
| giant | 36 |
| big | 28 |
| norr | 27 |
| shield | 25 |
| custard | 25 |
| magnet | 24 |
| speed | 24 |
| thorns | 23 |
| heart | 22 |
| blackout | 22 |
| chicken | 18 |
| mirror | 17 |
| jelly | 15 |
| boss | 14 |
| steve | 13 |
| tiny | 12 |
| swapparty | 9 |
| disco | 9 |
| meteors | 8 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 22 | 93 |
| boss | 14 | 46 |
| bounty | 13 | 50 |
| catapult | 6 | 26 |
| chicken | 18 | 64 |
| custard | 25 | 92 |
| disco | 9 | 36 |
| gust | 5 | 33 |
| jelly | 15 | 46 |
| meteors | 8 | 47 |
| mirror | 17 | 47 |
| slowmo | 5 | 7 |
| stampede | 5 | 27 |
| supply | 11 | 13 |
| swapparty | 9 | 36 |
| tiny | 12 | 37 |
| trapdoor | 7 | 58 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 1 | 41.0 | 21.0 |
| spicy | pro | 1 | 26.0 | 15.0 |
| spicy | collector | 1 | 23.0 | 17.0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1200,400) | 3 |
| courtyard (1200,520) | 2 |
| courtyard (1200,440) | 2 |
| courtyard (120,400) | 2 |
| factory (1200,440) | 2 |
| roof (720,560) | 2 |
| roof (560,560) | 2 |
| roof (600,400) | 2 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
