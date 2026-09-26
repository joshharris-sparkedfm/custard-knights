# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-09-26T09-26-51.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 39.2 | 24.5 | 1.0 | 14% | 5.1s |
| camper | 6 | 2.8 | 9.7 | 8.0 | 9% | 10.2s |
| collector | 6 | 22.3 | 24.5 | 2.5 | 17% | 4.9s |
| pacifist | 6 | 0.3 | 6.3 | 8.0 | 0% | 15.4s |
| fuzzer | 6 | 2.2 | 14.0 | 8.0 | 7% | 8.7s |
| idle | 6 | 0.0 | 11.3 | 7.8 | 3% | 8.2s |
| parrier | 6 | 12.8 | 17.2 | 5.0 | 2% | 7.2s |
| pro | 6 | 33.7 | 18.5 | 1.0 | 8% | 5.9s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 40.7 | 6% | 5% | 462px | sword 47%, bomb 13%, bow 12%, cannon 7% |
| frost | 9 | 41.1 | 23% | 3% | 430px | sword 51%, pit 18%, heavy 9%, bow 4% |
| factory | 9 | 44.6 | 11% | 3% | 481px | sword 44%, bow 9%, bomb 9%, cannon 8% |
| dungeon | 9 | 39.2 | 20% | 3% | 398px | sword 41%, lava 8%, bomb 8%, bow 8% |
| roof | 9 | 24.8 | 37% | 8% | 390px | sword 44%, pit 31%, heavy 6%, chickens 3% |
| bog | 9 | 41.9 | 12% | 5% | 462px | sword 45%, pit 9%, bow 9%, bomb 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3591 | 43% |
| pit | 813 | 10% |
| heavy | 723 | 9% |
| bomb | 697 | 8% |
| bow | 647 | 8% |
| cannon | 455 | 5% |
| spike | 249 | 3% |
| peck | 237 | 3% |
| bees | 188 | 2% |
| mine | 142 | 2% |
| lava | 114 | 1% |
| chickens | 96 | 1% |
| catapult | 90 | 1% |
| meteor | 73 | 1% |
| stab | 65 | 1% |
| norr | 58 | 1% |
| thorns | 54 | 1% |
| steve | 18 | 0% |

## Combat feel

- Sword swings that connected: humans 53% of 4355, bots 50% of 23766
- Ranged shots that hit: humans 36% of 664, bots 44% of 8218
- Blocks (clangs): 2291; parries: 594; guard breaks: 174; dashes: 8321
- Heavy swings: 5518; dash-stabs: 375; shield bashes: 1976; hits absorbed by spawn protection: 39
- Ring-outs (pit deaths credited to an attacker): 441 of 8310 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 17%

## Power-ups picked up

| power-up | pickups |
|---|---|
| swap | 226 |
| ghost | 218 |
| mines | 213 |
| bouncy | 205 |
| banana | 199 |
| giant | 198 |
| bees | 181 |
| magnet | 160 |
| big | 149 |
| heart | 148 |
| shield | 142 |
| speed | 135 |
| norr | 135 |
| thorns | 133 |
| disco | 102 |
| boss | 99 |
| tiny | 96 |
| jelly | 86 |
| meteors | 84 |
| chicken | 79 |
| custard | 76 |
| blackout | 74 |
| steve | 72 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 74 | 265 |
| boss | 99 | 483 |
| bounty | 44 | 136 |
| catapult | 41 | 178 |
| chicken | 79 | 399 |
| custard | 76 | 295 |
| disco | 102 | 397 |
| gust | 39 | 196 |
| jelly | 86 | 310 |
| meteors | 84 | 358 |
| slowmo | 48 | 88 |
| stampede | 45 | 272 |
| supply | 33 | 63 |
| tiny | 96 | 293 |
| trapdoor | 40 | 235 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 59.5 | 22.0 |
| chill | pro | 2 | 37.0 | 21.5 |
| spicy | rusher | 6 | 39.2 | 24.5 |
| spicy | pro | 6 | 33.7 | 18.5 |
| spicy | collector | 6 | 22.3 | 24.5 |
| spicy | parrier | 6 | 12.8 | 17.2 |
| brutal | rusher | 3 | 33.3 | 21.3 |
| brutal | pro | 3 | 23.7 | 17.3 |
| brutal | collector | 3 | 12.0 | 16.3 |
| brutal | parrier | 3 | 9.3 | 18.0 |

## Teams

- frost with pro: red 20, blue 8
- factory with rusher: red 63, blue 60

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (560,280) | 4 |
| courtyard (320,440) | 2 |
| courtyard (80,640) | 2 |
| courtyard (1240,160) | 2 |
| frost (520,320) | 2 |
| frost (560,600) | 2 |
| factory (1240,760) | 2 |
| factory (1240,720) | 2 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
