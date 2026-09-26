# Custard Knights QA summary

18 simulated matches, 54 minutes of play, run 2026-09-26T08-43-01.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 33.0 | 19.0 | 1.0 | 5% | 7.0s |
| camper | 1 | 4.0 | 18.0 | 8.0 | 0% | 6.3s |
| collector | 1 | 29.0 | 18.0 | 1.0 | 11% | 8.2s |
| pacifist | 1 | 0.0 | 0.0 | 8.0 | - | 0.0s |
| fuzzer | 1 | 0.0 | 23.0 | 8.0 | 9% | 5.6s |
| idle | 1 | 0.0 | 7.0 | 8.0 | 0% | 10.5s |
| parrier | 1 | 11.0 | 15.0 | 8.0 | 7% | 10.2s |
| pro | 1 | 21.0 | 20.0 | 1.0 | 10% | 6.1s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 44.2 | 5% | 5% | 472px | sword 47%, bomb 16%, bow 9%, cannon 7% |
| frost | 3 | 50.8 | 40% | 6% | 422px | pit 38%, sword 35%, bomb 5%, cannon 5% |
| factory | 2 | 46.5 | 15% | 6% | 457px | sword 43%, bow 13%, pit 8%, bomb 8% |
| dungeon | 2 | 41.3 | 19% | 2% | 458px | sword 39%, lava 15%, bow 15%, bomb 10% |
| roof | 2 | 55.2 | 59% | 9% | 471px | pit 58%, sword 24%, bomb 5%, cannon 5% |
| bog | 2 | 45.3 | 27% | 3% | 466px | sword 35%, pit 22%, bomb 10%, bow 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 820 | 36% |
| pit | 521 | 23% |
| bomb | 194 | 9% |
| bow | 163 | 7% |
| cannon | 123 | 5% |
| peck | 114 | 5% |
| heavy | 92 | 4% |
| bees | 49 | 2% |
| lava | 38 | 2% |
| mine | 32 | 1% |
| spike | 29 | 1% |
| chickens | 22 | 1% |
| meteor | 15 | 1% |
| catapult | 13 | 1% |
| stab | 10 | 0% |
| thorns | 8 | 0% |
| norr | 7 | 0% |
| steve | 2 | 0% |

## Combat feel

- Sword swings that connected: humans 48% of 704, bots 55% of 5283
- Ranged shots that hit: humans 44% of 55, bots 41% of 2463
- Blocks (clangs): 468; parries: 91; guard breaks: 13; dashes: 1686
- Heavy swings: 872; dash-stabs: 49; shield bashes: 358; hits absorbed by spawn protection: 12
- Ring-outs (pit deaths credited to an attacker): 273 of 2252 KOs (12%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bouncy | 62 |
| bees | 55 |
| ghost | 53 |
| giant | 52 |
| banana | 48 |
| shield | 40 |
| big | 39 |
| swap | 39 |
| mines | 39 |
| magnet | 36 |
| thorns | 30 |
| heart | 27 |
| meteors | 27 |
| speed | 26 |
| norr | 26 |
| tiny | 24 |
| custard | 23 |
| boss | 23 |
| chicken | 22 |
| blackout | 20 |
| jelly | 19 |
| disco | 18 |
| steve | 16 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 20 | 88 |
| boss | 23 | 136 |
| bounty | 10 | 45 |
| catapult | 10 | 47 |
| chicken | 22 | 103 |
| custard | 23 | 99 |
| disco | 18 | 53 |
| gust | 12 | 69 |
| jelly | 19 | 69 |
| meteors | 27 | 114 |
| slowmo | 5 | 9 |
| stampede | 10 | 61 |
| supply | 9 | 11 |
| tiny | 24 | 83 |
| trapdoor | 10 | 81 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 5 | 16.4 | 11.4 |
| spicy | pro | 1 | 21.0 | 20.0 |
| spicy | collector | 1 | 29.0 | 18.0 |
| spicy | parrier | 1 | 11.0 | 15.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 54s | You 15 | 0 |
| kotp | frost | rusher | ended | 180s | You 34 | 0 |
| heist | factory | rusher | ended | 74s | Sir Cumference 2 | 0 |
| race | dungeon | rusher | ended | 44s | Count Custard 72 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (80,760) | 2 |
| frost (720,600) | 2 |
| frost (40,120) | 2 |
| courtyard (1160,760) | 2 |
| courtyard (1240,160) | 2 |
| frost (720,360) | 2 |
| dungeon (560,200) | 2 |
| courtyard (1200,320) | 1 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
