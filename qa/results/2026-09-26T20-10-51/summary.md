# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T20-10-51.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 9.0 | 5.0 | 6.0 | 20% | 5.1s |
| camper | 1 | 3.0 | 4.0 | 8.0 | 0% | 41.4s |
| collector | 1 | 23.0 | 23.0 | 1.0 | 4% | 5.3s |
| pacifist | 1 | 0.0 | 9.0 | 8.0 | 0% | 11.2s |
| fuzzer | 1 | 2.0 | 17.0 | 8.0 | 12% | 6.5s |
| idle | 1 | 0.0 | 12.0 | 8.0 | 0% | 11.0s |
| parrier | 1 | 18.0 | 14.0 | 2.0 | 0% | 10.7s |
| pro | 1 | 31.0 | 18.0 | 1.0 | 11% | 6.8s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 35.3 | 3% | 3% | 474px | sword 52%, bomb 10%, bow 10%, cannon 8% |
| frost | 3 | 38.6 | 17% | 4% | 430px | sword 56%, pit 14%, heavy 8%, peck 4% |
| factory | 2 | 49.5 | 13% | 3% | 489px | sword 49%, bomb 11%, bow 9%, cannon 6% |
| dungeon | 2 | 35.5 | 19% | 2% | 433px | sword 39%, bomb 13%, bow 11%, lava 9% |
| roof | 2 | 20.7 | 37% | 4% | 390px | sword 44%, pit 31%, heavy 9%, cannon 3% |
| bog | 2 | 42.5 | 15% | 6% | 455px | sword 42%, heavy 10%, bomb 9%, cannon 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 898 | 47% |
| pit | 153 | 8% |
| bomb | 149 | 8% |
| peck | 149 | 8% |
| heavy | 124 | 6% |
| bow | 113 | 6% |
| cannon | 90 | 5% |
| spike | 43 | 2% |
| mine | 38 | 2% |
| bees | 37 | 2% |
| catapult | 28 | 1% |
| chickens | 22 | 1% |
| lava | 20 | 1% |
| stab | 14 | 1% |
| norr | 12 | 1% |
| meteor | 12 | 1% |
| thorns | 10 | 1% |
| steve | 4 | 0% |
| hotpie | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 41% of 779, bots 56% of 5291
- Ranged shots that hit: humans 34% of 77, bots 45% of 1735
- Blocks (clangs): 374; parries: 112; guard breaks: 20; dashes: 1778
- Heavy swings: 1029; dash-stabs: 72; shield bashes: 322; hits absorbed by spawn protection: 9
- Ring-outs (pit deaths credited to an attacker): 97 of 1917 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 11%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bouncy | 68 |
| bees | 52 |
| ghost | 51 |
| swap | 50 |
| giant | 50 |
| banana | 48 |
| mines | 45 |
| speed | 38 |
| shield | 35 |
| potion | 30 |
| thorns | 29 |
| custard | 29 |
| norr | 28 |
| heart | 27 |
| disco | 26 |
| magnet | 25 |
| big | 25 |
| boss | 21 |
| meteors | 21 |
| tiny | 18 |
| chicken | 17 |
| steve | 17 |
| blackout | 15 |
| jelly | 12 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 15 | 57 |
| boss | 21 | 101 |
| bounty | 15 | 40 |
| catapult | 11 | 52 |
| chicken | 17 | 75 |
| custard | 29 | 84 |
| disco | 26 | 108 |
| gust | 7 | 28 |
| jelly | 12 | 38 |
| meteors | 21 | 61 |
| slowmo | 10 | 16 |
| stampede | 9 | 51 |
| supply | 7 | 10 |
| tiny | 18 | 60 |
| trapdoor | 11 | 74 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 14.6 | 8.4 |
| spicy | pro | 1 | 31.0 | 18.0 |
| spicy | collector | 1 | 23.0 | 23.0 |
| spicy | parrier | 1 | 18.0 | 14.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 56s | You 10 | 0 |
| kotp | frost | rusher | ended | 180s | You 45 | 0 |
| heist | factory | rusher | ended | 62s | Lord Nibbles 2 | 0 |
| race | dungeon | rusher | ended | 116s | Sir Prize 14 | 0 |
| hotpie | roof | rusher | ended | 52s | You 7 | 0 |
| flags | bog | rusher | ended | 115s | You 30 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1200,160) | 2 |
| courtyard (880,760) | 1 |
| courtyard (1120,160) | 1 |
| courtyard (120,120) | 1 |
| courtyard (120,560) | 1 |
| courtyard (320,160) | 1 |
| frost (1160,720) | 1 |
| frost (120,120) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
