# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-10-08T10-14-15-full.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 39.2 | 23.8 | 1.0 | 14% | 5.2s |
| camper | 6 | 3.7 | 9.2 | 7.7 | 2% | 10.4s |
| collector | 6 | 16.2 | 22.8 | 4.5 | 16% | 5.1s |
| pacifist | 6 | 0.0 | 5.5 | 7.8 | 3% | 15.1s |
| fuzzer | 6 | 3.3 | 15.0 | 7.7 | 8% | 7.6s |
| idle | 6 | 0.0 | 9.5 | 8.0 | 2% | 10.2s |
| parrier | 6 | 11.7 | 16.7 | 5.3 | 2% | 7.4s |
| pro | 6 | 33.8 | 18.8 | 1.0 | 15% | 6.5s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 9 | 40.5 | 4% | 3% | 461px | sword 50%, bomb 13%, cannon 9%, bow 8% |
| frost | 9 | 38.8 | 20% | 4% | 430px | sword 52%, pit 16%, heavy 7%, peck 7% |
| factory | 9 | 45.0 | 12% | 4% | 477px | sword 46%, bomb 10%, bow 9%, heavy 7% |
| dungeon | 9 | 40.5 | 20% | 3% | 408px | sword 42%, bow 8%, bomb 8%, lava 8% |
| roof | 9 | 23.6 | 31% | 7% | 390px | sword 51%, pit 27%, peck 5%, heavy 5% |
| bog | 9 | 42.3 | 14% | 5% | 456px | sword 43%, pit 12%, bow 11%, bomb 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3548 | 43% |
| pit | 794 | 10% |
| bomb | 693 | 8% |
| heavy | 659 | 8% |
| bow | 630 | 8% |
| cannon | 453 | 5% |
| peck | 366 | 4% |
| spike | 253 | 3% |
| bees | 190 | 2% |
| mine | 127 | 2% |
| lava | 107 | 1% |
| chickens | 104 | 1% |
| catapult | 74 | 1% |
| stab | 72 | 1% |
| thorns | 59 | 1% |
| meteor | 50 | 1% |
| norr | 43 | 1% |
| steve | 39 | 0% |

## Combat feel

- Sword swings that connected: humans 50% of 4243, bots 49% of 23946
- Ranged shots that hit: humans 37% of 633, bots 45% of 8009
- Blocks (clangs): 2074; parries: 519; guard breaks: 164; dashes: 9425
- Heavy swings: 5643; dash-stabs: 637; shield bashes: 1884; hits absorbed by spawn protection: 70
- Ring-outs (pit deaths credited to an attacker): 438 of 8261 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 17%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bouncy | 219 |
| giant | 217 |
| ghost | 216 |
| banana | 199 |
| swap | 199 |
| bees | 197 |
| mines | 172 |
| heart | 141 |
| speed | 126 |
| thorns | 126 |
| potion | 126 |
| big | 125 |
| shield | 124 |
| magnet | 115 |
| norr | 115 |
| chicken | 103 |
| tiny | 97 |
| meteors | 91 |
| jelly | 87 |
| custard | 80 |
| blackout | 78 |
| boss | 75 |
| disco | 73 |
| steve | 68 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 78 | 277 |
| boss | 75 | 394 |
| bounty | 36 | 125 |
| catapult | 40 | 170 |
| chicken | 103 | 560 |
| custard | 80 | 316 |
| disco | 73 | 297 |
| gust | 35 | 162 |
| jelly | 87 | 308 |
| meteors | 91 | 330 |
| slowmo | 38 | 59 |
| stampede | 42 | 249 |
| supply | 40 | 67 |
| tiny | 97 | 331 |
| trapdoor | 58 | 343 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 2 | 51.0 | 22.5 |
| chill | pro | 2 | 35.5 | 18.0 |
| spicy | rusher | 6 | 39.2 | 23.8 |
| spicy | pro | 6 | 33.8 | 18.8 |
| spicy | collector | 6 | 16.2 | 22.8 |
| spicy | parrier | 6 | 11.7 | 16.7 |
| brutal | rusher | 3 | 23.0 | 24.0 |
| brutal | pro | 3 | 22.3 | 14.0 |
| brutal | collector | 3 | 14.3 | 22.7 |
| brutal | parrier | 3 | 4.7 | 19.3 |

## Teams

- frost with pro: red 30, blue 15
- factory with rusher: red 72, blue 49

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (80,160) | 3 |
| dungeon (1240,760) | 3 |
| roof (800,560) | 3 |
| bog (1080,160) | 3 |
| factory (80,760) | 3 |
| courtyard (1200,720) | 2 |
| courtyard (200,160) | 2 |
| courtyard (40,760) | 2 |

## Sim speed

Average 0.3s of CPU per 3-minute match (update only, no rendering).
