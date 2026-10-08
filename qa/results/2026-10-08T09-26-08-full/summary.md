# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-10-08T09-26-08-full.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 39.2 | 24.2 | 1.0 | 10% | 5.4s |
| camper | 6 | 3.2 | 10.8 | 7.5 | 11% | 7.5s |
| collector | 6 | 21.3 | 21.5 | 2.2 | 26% | 4.6s |
| pacifist | 6 | 0.2 | 6.0 | 7.8 | 0% | 15.3s |
| fuzzer | 6 | 2.2 | 14.5 | 8.0 | 8% | 8.5s |
| idle | 6 | 0.0 | 11.7 | 8.0 | 0% | 8.5s |
| parrier | 6 | 11.0 | 14.0 | 5.3 | 0% | 8.0s |
| pro | 6 | 35.0 | 18.3 | 1.0 | 10% | 6.9s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 39.1 | 5% | 2% | 463px | sword 43%, bomb 13%, bow 11%, cannon 7% |
| frost | 9 | 40.6 | 21% | 3% | 430px | sword 51%, pit 17%, heavy 7%, bomb 4% |
| factory | 9 | 46.1 | 13% | 4% | 473px | sword 45%, bomb 10%, bow 10%, pit 6% |
| dungeon | 9 | 40.9 | 19% | 3% | 416px | sword 43%, lava 9%, bow 9%, bomb 8% |
| roof | 9 | 25.7 | 32% | 9% | 390px | sword 48%, pit 29%, heavy 5%, bees 4% |
| bog | 9 | 42.5 | 13% | 4% | 462px | sword 44%, bow 11%, pit 10%, bomb 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3532 | 42% |
| pit | 828 | 10% |
| bomb | 713 | 9% |
| bow | 674 | 8% |
| heavy | 652 | 8% |
| cannon | 415 | 5% |
| peck | 330 | 4% |
| spike | 235 | 3% |
| bees | 219 | 3% |
| mine | 176 | 2% |
| lava | 117 | 1% |
| chickens | 107 | 1% |
| stab | 88 | 1% |
| catapult | 75 | 1% |
| thorns | 60 | 1% |
| norr | 58 | 1% |
| meteor | 58 | 1% |
| steve | 26 | 0% |

## Combat feel

- Sword swings that connected: humans 51% of 4136, bots 50% of 23773
- Ranged shots that hit: humans 32% of 663, bots 44% of 8025
- Blocks (clangs): 2050; parries: 500; guard breaks: 161; dashes: 9507
- Heavy swings: 5452; dash-stabs: 670; shield bashes: 1852; hits absorbed by spawn protection: 47
- Ring-outs (pit deaths credited to an attacker): 427 of 8363 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 16%

## Power-ups picked up

| power-up | pickups |
|---|---|
| mines | 235 |
| giant | 229 |
| bees | 216 |
| swap | 209 |
| ghost | 201 |
| banana | 201 |
| bouncy | 200 |
| thorns | 133 |
| shield | 131 |
| potion | 131 |
| magnet | 127 |
| heart | 124 |
| norr | 120 |
| big | 119 |
| speed | 109 |
| jelly | 106 |
| chicken | 105 |
| custard | 95 |
| blackout | 93 |
| tiny | 93 |
| disco | 88 |
| meteors | 78 |
| steve | 71 |
| boss | 63 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 93 | 316 |
| boss | 63 | 323 |
| bounty | 37 | 136 |
| catapult | 44 | 180 |
| chicken | 105 | 537 |
| custard | 95 | 352 |
| disco | 88 | 289 |
| gust | 32 | 151 |
| jelly | 106 | 366 |
| meteors | 78 | 309 |
| slowmo | 48 | 80 |
| stampede | 44 | 272 |
| supply | 52 | 78 |
| tiny | 93 | 354 |
| trapdoor | 36 | 213 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 48.5 | 20.5 |
| chill | pro | 2 | 36.0 | 18.5 |
| spicy | rusher | 6 | 39.2 | 24.2 |
| spicy | pro | 6 | 35.0 | 18.3 |
| spicy | collector | 6 | 21.3 | 21.5 |
| spicy | parrier | 6 | 11.0 | 14.0 |
| brutal | rusher | 3 | 26.3 | 20.0 |
| brutal | pro | 3 | 22.0 | 14.0 |
| brutal | collector | 3 | 11.7 | 21.7 |
| brutal | parrier | 3 | 3.0 | 18.3 |

## Teams

- frost with pro: red 13, blue 12
- factory with rusher: red 64, blue 62

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (720,520) | 4 |
| roof (760,440) | 4 |
| factory (1240,160) | 3 |
| roof (1120,280) | 3 |
| roof (160,600) | 3 |
| roof (240,720) | 3 |
| roof (960,480) | 3 |
| frost (40,120) | 3 |

## Sim speed

Average 0.3s of CPU per 3-minute match (update only, no rendering).
