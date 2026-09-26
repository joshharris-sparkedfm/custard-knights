# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T14-05-46.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 32.0 | 19.0 | 1.0 | 5% | 6.0s |
| camper | 1 | 3.0 | 10.0 | 8.0 | 0% | 5.6s |
| collector | 1 | 29.0 | 16.0 | 1.0 | 0% | 7.8s |
| pacifist | 1 | 0.0 | 12.0 | 8.0 | 0% | 13.7s |
| fuzzer | 1 | 0.0 | 16.0 | 8.0 | 19% | 7.8s |
| idle | 1 | 0.0 | 13.0 | 8.0 | 0% | 9.7s |
| parrier | 1 | 10.0 | 18.0 | 7.0 | 6% | 7.2s |
| pro | 1 | 29.0 | 15.0 | 1.0 | 7% | 9.2s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.1 | 4% | 4% | 483px | sword 50%, bomb 11%, cannon 10%, bow 9% |
| frost | 3 | 40.1 | 20% | 3% | 430px | sword 58%, pit 17%, heavy 9%, peck 4% |
| factory | 2 | 46.7 | 11% | 4% | 476px | sword 45%, bow 10%, bomb 9%, heavy 7% |
| dungeon | 2 | 35.3 | 13% | 3% | 371px | sword 34%, bow 12%, bomb 10%, heavy 10% |
| roof | 2 | 21.8 | 32% | 6% | 390px | sword 49%, pit 26%, heavy 7%, catapult 5% |
| bog | 2 | 38.8 | 11% | 2% | 461px | sword 37%, bomb 13%, bow 12%, heavy 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 876 | 46% |
| pit | 165 | 9% |
| peck | 147 | 8% |
| heavy | 147 | 8% |
| bomb | 144 | 8% |
| bow | 140 | 7% |
| cannon | 98 | 5% |
| spike | 41 | 2% |
| bees | 36 | 2% |
| mine | 28 | 1% |
| norr | 15 | 1% |
| catapult | 15 | 1% |
| chickens | 14 | 1% |
| meteor | 14 | 1% |
| lava | 11 | 1% |
| stab | 9 | 0% |
| thorns | 7 | 0% |
| steve | 6 | 0% |
| hotpie | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 42% of 685, bots 58% of 5106
- Ranged shots that hit: humans 48% of 140, bots 45% of 1674
- Blocks (clangs): 391; parries: 82; guard breaks: 18; dashes: 1693
- Heavy swings: 958; dash-stabs: 61; shield bashes: 307; hits absorbed by spawn protection: 13
- Ring-outs (pit deaths credited to an attacker): 98 of 1917 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| swap | 52 |
| giant | 52 |
| bees | 47 |
| ghost | 46 |
| bouncy | 42 |
| mines | 42 |
| thorns | 39 |
| potion | 37 |
| shield | 36 |
| banana | 36 |
| norr | 32 |
| big | 29 |
| heart | 28 |
| magnet | 28 |
| chicken | 27 |
| speed | 24 |
| custard | 23 |
| jelly | 23 |
| boss | 20 |
| meteors | 20 |
| tiny | 18 |
| blackout | 17 |
| steve | 15 |
| disco | 11 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 17 | 41 |
| boss | 20 | 101 |
| bounty | 9 | 30 |
| catapult | 9 | 31 |
| chicken | 27 | 114 |
| custard | 23 | 85 |
| disco | 11 | 50 |
| gust | 9 | 38 |
| jelly | 23 | 74 |
| meteors | 20 | 84 |
| slowmo | 6 | 10 |
| stampede | 7 | 36 |
| supply | 17 | 27 |
| tiny | 18 | 49 |
| trapdoor | 9 | 61 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 14.9 | 9.3 |
| spicy | pro | 1 | 29.0 | 15.0 |
| spicy | collector | 1 | 29.0 | 16.0 |
| spicy | parrier | 1 | 10.0 | 18.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 31s | You 7 | 0 |
| kotp | frost | rusher | ended | 180s | You 40 | 0 |
| heist | factory | rusher | ended | 59s | Lord Nibbles 3 | 0 |
| race | dungeon | rusher | ended | 78s | Earl Grey 38 | 0 |
| hotpie | roof | rusher | ended | 57s | Sir Loin 5 | 0 |
| flags | bog | rusher | ended | 87s | Earl Grey 35 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1040,120) | 2 |
| dungeon (1040,560) | 2 |
| courtyard (1120,320) | 1 |
| courtyard (280,640) | 1 |
| courtyard (840,640) | 1 |
| courtyard (1200,480) | 1 |
| frost (1120,120) | 1 |
| frost (800,280) | 1 |

## Sim speed

Average 0.8s of CPU per 3-minute match (update only, no rendering).
