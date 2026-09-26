# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-09-26T08-25-52.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 32.2 | 23.2 | 1.0 | 21% | 4.9s |
| camper | 6 | 4.3 | 13.8 | 8.0 | 2% | 8.2s |
| collector | 6 | 19.2 | 24.5 | 3.2 | 21% | 4.7s |
| pacifist | 6 | 0.8 | 8.5 | 8.0 | 2% | 14.7s |
| fuzzer | 6 | 2.2 | 17.2 | 8.0 | 7% | 7.4s |
| idle | 6 | 0.2 | 14.3 | 8.0 | 1% | 7.6s |
| parrier | 6 | 11.3 | 20.8 | 6.7 | 10% | 5.6s |
| pro | 6 | 26.8 | 18.0 | 1.3 | 7% | 6.3s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 39.4 | 6% | 3% | 466px | sword 47%, bomb 12%, bow 11%, cannon 9% |
| frost | 9 | 48.1 | 43% | 8% | 434px | pit 41%, sword 33%, bomb 6%, heavy 5% |
| factory | 9 | 44.9 | 20% | 4% | 479px | sword 46%, pit 13%, bomb 10%, bow 9% |
| dungeon | 9 | 46.3 | 21% | 4% | 438px | sword 44%, lava 17%, bow 9%, bomb 9% |
| roof | 9 | 53.4 | 58% | 9% | 456px | pit 56%, sword 24%, bomb 5%, heavy 4% |
| bog | 9 | 45.2 | 25% | 6% | 460px | sword 38%, pit 23%, bow 9%, bomb 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3653 | 37% |
| pit | 2398 | 24% |
| bomb | 831 | 8% |
| bow | 731 | 7% |
| heavy | 607 | 6% |
| cannon | 521 | 5% |
| lava | 269 | 3% |
| bees | 180 | 2% |
| mine | 180 | 2% |
| spike | 158 | 2% |
| chickens | 118 | 1% |
| catapult | 61 | 1% |
| norr | 54 | 1% |
| stab | 54 | 1% |
| thorns | 47 | 0% |
| meteor | 39 | 0% |
| steve | 23 | 0% |

## Combat feel

- Sword swings that connected: humans 52% of 4323, bots 51% of 23732
- Ranged shots that hit: humans 38% of 501, bots 40% of 10957
- Blocks (clangs): 1972; parries: 574; guard breaks: 140; dashes: 8324
- Heavy swings: 4812; dash-stabs: 382; shield bashes: 1863; hits absorbed by spawn protection: 35
- Ring-outs (pit deaths credited to an attacker): 1110 of 9924 KOs (11%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 18%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 258 |
| bouncy | 258 |
| mines | 220 |
| giant | 215 |
| bees | 211 |
| swap | 199 |
| ghost | 194 |
| speed | 164 |
| shield | 163 |
| heart | 162 |
| big | 148 |
| thorns | 143 |
| magnet | 137 |
| norr | 134 |
| jelly | 119 |
| tiny | 115 |
| blackout | 111 |
| chicken | 109 |
| custard | 106 |
| boss | 104 |
| meteors | 92 |
| disco | 86 |
| steve | 72 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 111 | 402 |
| boss | 104 | 551 |
| bounty | 44 | 199 |
| catapult | 36 | 166 |
| chicken | 109 | 265 |
| custard | 106 | 425 |
| disco | 86 | 295 |
| gust | 43 | 259 |
| jelly | 119 | 464 |
| meteors | 92 | 342 |
| slowmo | 31 | 63 |
| stampede | 58 | 380 |
| supply | 42 | 86 |
| tiny | 115 | 381 |
| trapdoor | 33 | 233 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 33.5 | 24.0 |
| chill | pro | 2 | 35.0 | 21.5 |
| spicy | rusher | 6 | 32.2 | 23.2 |
| spicy | pro | 6 | 26.8 | 18.0 |
| spicy | collector | 6 | 19.2 | 24.5 |
| spicy | parrier | 6 | 11.3 | 20.8 |
| brutal | rusher | 3 | 32.7 | 21.3 |
| brutal | pro | 3 | 28.0 | 16.3 |
| brutal | collector | 3 | 15.7 | 20.3 |
| brutal | parrier | 3 | 6.7 | 18.0 |

## Teams

- frost with pro: red 52, blue 37
- factory with rusher: red 60, blue 50

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (520,320) | 10 |
| frost (760,600) | 10 |
| frost (520,600) | 8 |
| frost (560,320) | 7 |
| frost (760,320) | 7 |
| bog (440,520) | 6 |
| frost (760,560) | 5 |
| roof (120,560) | 5 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
