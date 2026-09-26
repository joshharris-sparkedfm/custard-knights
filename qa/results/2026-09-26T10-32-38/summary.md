# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-09-26T10-32-38.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 33.8 | 22.7 | 1.0 | 14% | 5.5s |
| camper | 6 | 2.3 | 9.2 | 7.8 | 4% | 10.3s |
| collector | 6 | 19.2 | 19.3 | 3.5 | 15% | 5.2s |
| pacifist | 6 | 0.3 | 6.3 | 8.0 | 0% | 15.1s |
| fuzzer | 6 | 1.8 | 15.0 | 7.8 | 4% | 7.8s |
| idle | 6 | 0.0 | 9.0 | 7.7 | 0% | 10.3s |
| parrier | 6 | 11.2 | 17.0 | 5.5 | 4% | 7.7s |
| pro | 6 | 33.0 | 17.7 | 1.2 | 7% | 7.1s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 41.0 | 5% | 3% | 469px | sword 48%, bow 12%, bomb 12%, cannon 7% |
| frost | 9 | 38.5 | 21% | 4% | 430px | sword 53%, pit 18%, heavy 7%, peck 4% |
| factory | 9 | 44.0 | 12% | 3% | 491px | sword 45%, bow 11%, bomb 11%, heavy 6% |
| dungeon | 9 | 41.3 | 18% | 4% | 405px | sword 44%, lava 9%, bomb 9%, bow 8% |
| roof | 9 | 19.2 | 34% | 7% | 390px | sword 50%, pit 31%, heavy 7%, catapult 3% |
| bog | 9 | 42.1 | 12% | 5% | 461px | sword 46%, bow 11%, bomb 10%, pit 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3505 | 43% |
| pit | 759 | 9% |
| bow | 694 | 9% |
| bomb | 678 | 8% |
| heavy | 651 | 8% |
| cannon | 402 | 5% |
| peck | 241 | 3% |
| spike | 238 | 3% |
| bees | 197 | 2% |
| mine | 130 | 2% |
| lava | 120 | 1% |
| chickens | 95 | 1% |
| catapult | 92 | 1% |
| stab | 81 | 1% |
| norr | 55 | 1% |
| meteor | 49 | 1% |
| thorns | 47 | 1% |
| steve | 36 | 0% |

## Combat feel

- Sword swings that connected: humans 51% of 4128, bots 49% of 23412
- Ranged shots that hit: humans 39% of 579, bots 44% of 8122
- Blocks (clangs): 2036; parries: 469; guard breaks: 168; dashes: 9438
- Heavy swings: 5521; dash-stabs: 630; shield bashes: 1912; hits absorbed by spawn protection: 50
- Ring-outs (pit deaths credited to an attacker): 388 of 8070 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 16%

## Power-ups picked up

| power-up | pickups |
|---|---|
| ghost | 218 |
| giant | 218 |
| bees | 206 |
| swap | 206 |
| banana | 203 |
| bouncy | 199 |
| mines | 187 |
| magnet | 128 |
| potion | 121 |
| norr | 121 |
| thorns | 117 |
| shield | 115 |
| speed | 113 |
| big | 112 |
| heart | 106 |
| tiny | 98 |
| meteors | 95 |
| disco | 87 |
| boss | 82 |
| chicken | 81 |
| blackout | 80 |
| jelly | 74 |
| custard | 73 |
| steve | 66 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 80 | 253 |
| boss | 82 | 424 |
| bounty | 45 | 163 |
| catapult | 45 | 199 |
| chicken | 81 | 404 |
| custard | 73 | 278 |
| disco | 87 | 351 |
| gust | 33 | 163 |
| jelly | 74 | 293 |
| meteors | 95 | 404 |
| slowmo | 41 | 62 |
| stampede | 44 | 247 |
| supply | 35 | 52 |
| tiny | 98 | 339 |
| trapdoor | 46 | 258 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 40.0 | 24.0 |
| chill | pro | 2 | 34.5 | 19.5 |
| spicy | rusher | 6 | 33.8 | 22.7 |
| spicy | pro | 6 | 33.0 | 17.7 |
| spicy | collector | 6 | 19.2 | 19.3 |
| spicy | parrier | 6 | 11.2 | 17.0 |
| brutal | rusher | 3 | 18.7 | 15.7 |
| brutal | pro | 3 | 23.3 | 15.7 |
| brutal | collector | 3 | 15.3 | 21.3 |
| brutal | parrier | 3 | 5.3 | 18.0 |

## Teams

- frost with pro: red 29, blue 22
- factory with rusher: red 70, blue 53

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| factory (80,720) | 3 |
| courtyard (1240,160) | 2 |
| courtyard (680,400) | 2 |
| frost (600,240) | 2 |
| frost (720,640) | 2 |
| factory (40,120) | 2 |
| factory (1200,680) | 2 |
| factory (1240,120) | 2 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
