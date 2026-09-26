# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T16-57-44.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 43.0 | 22.0 | 1.0 | 5% | 5.6s |
| camper | 1 | 2.0 | 10.0 | 8.0 | 0% | 9.5s |
| collector | 1 | 30.0 | 17.0 | 1.0 | 0% | 8.0s |
| pacifist | 1 | 0.0 | 14.0 | 8.0 | 0% | 8.4s |
| fuzzer | 1 | 1.0 | 11.0 | 5.0 | 9% | 5.1s |
| idle | 1 | 0.0 | 14.0 | 8.0 | 0% | 11.7s |
| parrier | 1 | 14.0 | 16.0 | 4.0 | 0% | 8.4s |
| pro | 1 | 33.0 | 17.0 | 1.0 | 6% | 6.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 44.0 | 3% | 2% | 473px | sword 51%, bow 13%, bomb 13%, cannon 6% |
| frost | 3 | 41.9 | 17% | 4% | 430px | sword 50%, pit 15%, heavy 8%, peck 8% |
| factory | 2 | 47.2 | 11% | 1% | 463px | sword 48%, bow 10%, cannon 8%, bomb 7% |
| dungeon | 2 | 36.8 | 18% | 5% | 390px | sword 38%, cannon 11%, bow 10%, lava 9% |
| roof | 2 | 14.3 | 38% | 5% | 390px | sword 40%, pit 29%, bow 7%, heavy 6% |
| bog | 2 | 42.3 | 13% | 4% | 463px | sword 43%, bow 11%, bomb 10%, heavy 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 898 | 45% |
| bow | 160 | 8% |
| peck | 152 | 8% |
| pit | 142 | 7% |
| bomb | 141 | 7% |
| heavy | 121 | 6% |
| cannon | 106 | 5% |
| bees | 53 | 3% |
| mine | 48 | 2% |
| spike | 41 | 2% |
| catapult | 24 | 1% |
| meteor | 20 | 1% |
| lava | 19 | 1% |
| thorns | 18 | 1% |
| chickens | 17 | 1% |
| steve | 13 | 1% |
| norr | 7 | 0% |
| stab | 5 | 0% |
| hotpie | 2 | 0% |

## Combat feel

- Sword swings that connected: humans 41% of 893, bots 55% of 5424
- Ranged shots that hit: humans 47% of 103, bots 46% of 1756
- Blocks (clangs): 425; parries: 103; guard breaks: 15; dashes: 1807
- Heavy swings: 1074; dash-stabs: 50; shield bashes: 326; hits absorbed by spawn protection: 6
- Ring-outs (pit deaths credited to an attacker): 84 of 1987 KOs (4%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| mines | 61 |
| bouncy | 49 |
| bees | 48 |
| swap | 46 |
| ghost | 39 |
| giant | 37 |
| banana | 36 |
| shield | 35 |
| potion | 34 |
| thorns | 33 |
| magnet | 32 |
| speed | 31 |
| norr | 28 |
| big | 27 |
| meteors | 26 |
| disco | 22 |
| chicken | 21 |
| jelly | 21 |
| custard | 20 |
| boss | 20 |
| blackout | 20 |
| heart | 17 |
| steve | 17 |
| tiny | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 20 | 69 |
| boss | 20 | 89 |
| bounty | 8 | 45 |
| catapult | 13 | 49 |
| chicken | 21 | 98 |
| custard | 20 | 75 |
| disco | 22 | 80 |
| gust | 9 | 28 |
| jelly | 21 | 56 |
| meteors | 26 | 111 |
| slowmo | 11 | 18 |
| stampede | 9 | 52 |
| supply | 10 | 12 |
| tiny | 15 | 65 |
| trapdoor | 11 | 72 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.0 | 9.7 |
| spicy | pro | 1 | 33.0 | 17.0 |
| spicy | collector | 1 | 30.0 | 17.0 |
| spicy | parrier | 1 | 14.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 54s | You 7 | 0 |
| kotp | frost | rusher | ended | 180s | You 43 | 0 |
| heist | factory | rusher | ended | 119s | Earl Grey 3 | 0 |
| race | dungeon | rusher | ended | 101s | Earl Grey 15 | 0 |
| hotpie | roof | rusher | ended | 51s | You 6 | 0 |
| flags | bog | rusher | ended | 67s | Sir Cumference 30 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (80,720) | 3 |
| dungeon (520,240) | 2 |
| dungeon (520,280) | 2 |
| dungeon (920,600) | 2 |
| courtyard (1160,760) | 1 |
| courtyard (80,720) | 1 |
| courtyard (1040,400) | 1 |
| courtyard (960,360) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
