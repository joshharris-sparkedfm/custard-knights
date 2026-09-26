# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T19-18-03.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 34.0 | 22.0 | 1.0 | 18% | 6.5s |
| camper | 1 | 4.0 | 5.0 | 8.0 | 0% | 40.7s |
| collector | 1 | 20.0 | 20.0 | 2.0 | 10% | 6.6s |
| pacifist | 1 | 1.0 | 7.0 | 8.0 | 0% | 19.4s |
| fuzzer | 1 | 1.0 | 20.0 | 8.0 | 20% | 6.7s |
| idle | 1 | 0.0 | 12.0 | 8.0 | 0% | 14.0s |
| parrier | 1 | 9.0 | 16.0 | 8.0 | 0% | 7.7s |
| pro | 1 | 29.0 | 19.0 | 1.0 | 5% | 7.1s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 43.2 | 5% | 3% | 466px | sword 46%, bow 14%, bomb 9%, cannon 8% |
| frost | 3 | 39.9 | 21% | 4% | 430px | sword 50%, pit 16%, heavy 9%, bow 4% |
| factory | 2 | 49.7 | 13% | 4% | 476px | sword 47%, bow 10%, heavy 7%, bomb 6% |
| dungeon | 2 | 38.2 | 16% | 2% | 408px | sword 42%, bow 12%, bomb 9%, spike 9% |
| roof | 2 | 17.7 | 42% | 8% | 384px | sword 50%, pit 41%, heavy 5%, catapult 2% |
| bog | 2 | 38.7 | 11% | 3% | 451px | sword 41%, bomb 17%, heavy 8%, pit 7% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 887 | 45% |
| pit | 176 | 9% |
| bow | 163 | 8% |
| peck | 150 | 8% |
| bomb | 133 | 7% |
| heavy | 130 | 7% |
| cannon | 84 | 4% |
| bees | 59 | 3% |
| spike | 51 | 3% |
| mine | 28 | 1% |
| catapult | 18 | 1% |
| thorns | 17 | 1% |
| chickens | 15 | 1% |
| stab | 13 | 1% |
| meteor | 13 | 1% |
| norr | 10 | 1% |
| lava | 10 | 1% |
| steve | 5 | 0% |
| hotpie | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 46% of 762, bots 57% of 5394
- Ranged shots that hit: humans 44% of 86, bots 50% of 1642
- Blocks (clangs): 373; parries: 85; guard breaks: 16; dashes: 1757
- Heavy swings: 1030; dash-stabs: 70; shield bashes: 330; hits absorbed by spawn protection: 8
- Ring-outs (pit deaths credited to an attacker): 103 of 1965 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 50 |
| swap | 48 |
| ghost | 47 |
| banana | 44 |
| mines | 40 |
| magnet | 39 |
| giant | 33 |
| thorns | 33 |
| bouncy | 33 |
| shield | 32 |
| speed | 30 |
| heart | 28 |
| blackout | 28 |
| norr | 27 |
| big | 27 |
| potion | 22 |
| jelly | 22 |
| tiny | 21 |
| chicken | 21 |
| custard | 21 |
| boss | 18 |
| meteors | 17 |
| disco | 17 |
| steve | 16 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 28 | 84 |
| boss | 18 | 71 |
| bounty | 11 | 34 |
| catapult | 11 | 46 |
| chicken | 21 | 104 |
| custard | 21 | 77 |
| disco | 17 | 67 |
| gust | 13 | 59 |
| jelly | 22 | 78 |
| meteors | 17 | 78 |
| slowmo | 12 | 16 |
| stampede | 6 | 35 |
| supply | 8 | 12 |
| tiny | 21 | 69 |
| trapdoor | 10 | 62 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.9 | 10.7 |
| spicy | pro | 1 | 29.0 | 19.0 |
| spicy | collector | 1 | 20.0 | 20.0 |
| spicy | parrier | 1 | 9.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 45s | You 7 | 0 |
| kotp | frost | rusher | ended | 180s | You 39 | 0 |
| heist | factory | rusher | ended | 64s | Duchess Dumpling 3 | 0 |
| race | dungeon | rusher | ended | 104s | Sir Loin 14 | 0 |
| hotpie | roof | rusher | ended | 66s | You 12 | 0 |
| flags | bog | rusher | ended | 77s | Baron Von Bap 33 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (1240,120) | 2 |
| roof (1240,320) | 2 |
| courtyard (360,160) | 1 |
| courtyard (1000,760) | 1 |
| courtyard (1120,240) | 1 |
| courtyard (360,640) | 1 |
| courtyard (1040,200) | 1 |
| courtyard (1040,680) | 1 |

## Sim speed

Average 0.7s of CPU per 3-minute match (update only, no rendering).
