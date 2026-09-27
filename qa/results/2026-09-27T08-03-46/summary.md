# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-27T08-03-46.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 31.0 | 22.0 | 1.0 | 0% | 6.0s |
| camper | 1 | 4.0 | 9.0 | 8.0 | 0% | 15.3s |
| collector | 1 | 22.0 | 19.0 | 1.0 | 11% | 6.0s |
| pacifist | 1 | 0.0 | 9.0 | 8.0 | 0% | 10.8s |
| fuzzer | 1 | 3.0 | 18.0 | 8.0 | 11% | 6.2s |
| idle | 1 | 0.0 | 3.0 | 8.0 | 0% | 10.0s |
| parrier | 1 | 18.0 | 15.0 | 3.0 | 0% | 9.1s |
| pro | 1 | 33.0 | 18.0 | 1.0 | 0% | 7.2s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 42.7 | 7% | 3% | 466px | sword 51%, bow 12%, bomb 11%, cannon 7% |
| frost | 3 | 43.0 | 16% | 4% | 430px | sword 54%, pit 14%, heavy 9%, peck 6% |
| factory | 2 | 48.2 | 12% | 2% | 486px | sword 48%, bow 9%, bomb 8%, heavy 8% |
| dungeon | 2 | 35.7 | 21% | 3% | 380px | sword 40%, spike 9%, lava 9%, bow 9% |
| roof | 2 | 19.7 | 26% | 4% | 390px | sword 48%, pit 25%, heavy 8%, bees 5% |
| bog | 2 | 39.8 | 15% | 2% | 477px | sword 42%, bow 11%, pit 10%, heavy 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 920 | 47% |
| peck | 162 | 8% |
| bow | 154 | 8% |
| pit | 152 | 8% |
| heavy | 129 | 7% |
| bomb | 128 | 6% |
| cannon | 93 | 5% |
| spike | 56 | 3% |
| bees | 39 | 2% |
| mine | 29 | 1% |
| catapult | 27 | 1% |
| lava | 19 | 1% |
| thorns | 16 | 1% |
| meteor | 11 | 1% |
| chickens | 11 | 1% |
| stab | 9 | 0% |
| norr | 8 | 0% |
| steve | 4 | 0% |
| hotpie | 3 | 0% |
| bash | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 46% of 766, bots 57% of 5440
- Ranged shots that hit: humans 34% of 88, bots 48% of 1711
- Blocks (clangs): 387; parries: 112; guard breaks: 10; dashes: 1685
- Heavy swings: 1026; dash-stabs: 53; shield bashes: 334; hits absorbed by spawn protection: 10
- Ring-outs (pit deaths credited to an attacker): 96 of 1971 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 11%

## Power-ups picked up

| power-up | pickups |
|---|---|
| ghost | 53 |
| banana | 48 |
| mines | 47 |
| swap | 45 |
| giant | 44 |
| bees | 43 |
| bouncy | 43 |
| potion | 37 |
| thorns | 35 |
| heart | 35 |
| magnet | 28 |
| norr | 25 |
| speed | 25 |
| big | 23 |
| custard | 23 |
| disco | 23 |
| blackout | 23 |
| meteors | 21 |
| chicken | 21 |
| shield | 21 |
| boss | 20 |
| jelly | 18 |
| steve | 16 |
| tiny | 16 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 23 | 87 |
| boss | 20 | 105 |
| bounty | 11 | 44 |
| catapult | 11 | 54 |
| chicken | 21 | 105 |
| custard | 23 | 94 |
| disco | 23 | 69 |
| gust | 6 | 28 |
| jelly | 18 | 69 |
| meteors | 21 | 97 |
| slowmo | 12 | 18 |
| stampede | 6 | 41 |
| supply | 7 | 10 |
| tiny | 16 | 49 |
| trapdoor | 15 | 84 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 15.6 | 9.9 |
| spicy | pro | 1 | 33.0 | 18.0 |
| spicy | collector | 1 | 22.0 | 19.0 |
| spicy | parrier | 1 | 18.0 | 15.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 72s | You 19 | 0 |
| kotp | frost | rusher | ended | 180s | You 39 | 0 |
| heist | factory | rusher | ended | 44s | Sir Cumference 2 | 0 |
| race | dungeon | rusher | ended | 107s | Baron Von Bap 15 | 0 |
| hotpie | roof | rusher | ended | 59s | Lady Bug 7 | 0 |
| flags | bog | rusher | ended | 72s | Earl Grey 37 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (80,160) | 2 |
| frost (80,200) | 2 |
| dungeon (920,600) | 2 |
| courtyard (400,240) | 1 |
| courtyard (120,760) | 1 |
| courtyard (1240,640) | 1 |
| courtyard (1240,760) | 1 |
| courtyard (1200,600) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
