# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-09-26T08-45-40.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 31.7 | 25.0 | 1.3 | 17% | 4.5s |
| camper | 6 | 3.2 | 15.3 | 8.0 | 4% | 6.4s |
| collector | 6 | 21.7 | 24.7 | 3.2 | 22% | 4.8s |
| pacifist | 6 | 0.3 | 7.3 | 8.0 | 0% | 16.8s |
| fuzzer | 6 | 1.7 | 16.5 | 7.8 | 8% | 6.9s |
| idle | 6 | 0.0 | 14.5 | 8.0 | 0% | 8.4s |
| parrier | 6 | 9.5 | 21.2 | 7.3 | 9% | 5.4s |
| pro | 6 | 29.0 | 18.3 | 1.2 | 12% | 6.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 39.8 | 5% | 3% | 465px | sword 46%, bow 12%, bomb 12%, cannon 7% |
| frost | 9 | 50.3 | 40% | 7% | 421px | pit 38%, sword 35%, bomb 6%, heavy 5% |
| factory | 9 | 45.8 | 20% | 4% | 492px | sword 42%, pit 13%, bow 10%, bomb 8% |
| dungeon | 9 | 47.0 | 21% | 4% | 437px | sword 42%, lava 17%, bow 9%, bomb 8% |
| roof | 9 | 53.9 | 57% | 9% | 455px | pit 55%, sword 24%, heavy 4%, bow 4% |
| bog | 9 | 47.0 | 23% | 6% | 467px | sword 41%, pit 20%, bow 9%, bomb 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3586 | 36% |
| pit | 2344 | 23% |
| bomb | 767 | 8% |
| bow | 751 | 7% |
| heavy | 657 | 7% |
| cannon | 511 | 5% |
| peck | 296 | 3% |
| lava | 269 | 3% |
| bees | 206 | 2% |
| spike | 176 | 2% |
| mine | 159 | 2% |
| chickens | 81 | 1% |
| catapult | 59 | 1% |
| thorns | 57 | 1% |
| meteor | 54 | 1% |
| stab | 52 | 1% |
| norr | 35 | 0% |
| steve | 25 | 0% |

## Combat feel

- Sword swings that connected: humans 50% of 4296, bots 50% of 24510
- Ranged shots that hit: humans 37% of 618, bots 40% of 10964
- Blocks (clangs): 2538; parries: 547; guard breaks: 183; dashes: 8452
- Heavy swings: 5248; dash-stabs: 352; shield bashes: 2125; hits absorbed by spawn protection: 52
- Ring-outs (pit deaths credited to an attacker): 1100 of 10085 KOs (11%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 19%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 231 |
| bouncy | 226 |
| ghost | 221 |
| giant | 216 |
| mines | 215 |
| swap | 213 |
| banana | 203 |
| magnet | 160 |
| big | 158 |
| heart | 151 |
| speed | 149 |
| thorns | 148 |
| shield | 146 |
| norr | 123 |
| jelly | 122 |
| meteors | 110 |
| tiny | 109 |
| blackout | 104 |
| custard | 103 |
| chicken | 98 |
| disco | 93 |
| boss | 86 |
| steve | 72 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 104 | 412 |
| boss | 86 | 455 |
| bounty | 38 | 142 |
| catapult | 45 | 196 |
| chicken | 98 | 518 |
| custard | 103 | 403 |
| disco | 93 | 330 |
| gust | 48 | 273 |
| jelly | 122 | 440 |
| meteors | 110 | 453 |
| slowmo | 43 | 84 |
| stampede | 40 | 280 |
| supply | 33 | 57 |
| tiny | 109 | 398 |
| trapdoor | 40 | 328 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 43.0 | 26.0 |
| chill | pro | 2 | 31.0 | 20.5 |
| spicy | rusher | 6 | 31.7 | 25.0 |
| spicy | pro | 6 | 29.0 | 18.3 |
| spicy | collector | 6 | 21.7 | 24.7 |
| spicy | parrier | 6 | 9.5 | 21.2 |
| brutal | rusher | 3 | 28.7 | 22.7 |
| brutal | pro | 3 | 25.0 | 17.0 |
| brutal | collector | 3 | 18.7 | 20.3 |
| brutal | parrier | 3 | 4.3 | 17.3 |

## Teams

- frost with pro: red 42, blue 39
- factory with rusher: red 70, blue 50

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (760,320) | 8 |
| frost (520,320) | 6 |
| roof (760,440) | 6 |
| frost (720,320) | 5 |
| roof (120,280) | 5 |
| bog (480,520) | 5 |
| frost (680,560) | 4 |
| frost (520,560) | 4 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
