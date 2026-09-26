# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T20-10-32.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 36.0 | 21.0 | 1.0 | 14% | 5.7s |
| camper | 1 | 3.0 | 10.0 | 8.0 | 0% | 10.6s |
| collector | 1 | 36.0 | 20.0 | 1.0 | 5% | 6.2s |
| pacifist | 1 | 0.0 | 2.0 | 8.0 | 0% | 53.2s |
| fuzzer | 1 | 0.0 | 21.0 | 8.0 | 14% | 6.2s |
| idle | 1 | 0.0 | 9.0 | 8.0 | 0% | 10.5s |
| parrier | 1 | 15.0 | 15.0 | 3.0 | 0% | 8.3s |
| pro | 1 | 27.0 | 20.0 | 1.0 | 5% | 6.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 44.4 | 4% | 6% | 458px | sword 49%, bomb 11%, bow 10%, peck 7% |
| frost | 3 | 41.7 | 23% | 3% | 430px | sword 51%, pit 20%, heavy 8%, bomb 5% |
| factory | 2 | 48.2 | 8% | 6% | 473px | sword 48%, bow 11%, bomb 8%, cannon 8% |
| dungeon | 2 | 35.7 | 17% | 3% | 404px | sword 37%, bomb 9%, bow 9%, spike 9% |
| roof | 2 | 17.8 | 41% | 7% | 390px | sword 46%, pit 38%, heavy 7%, bees 3% |
| bog | 2 | 41.7 | 15% | 5% | 461px | sword 43%, pit 11%, bomb 10%, heavy 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 899 | 45% |
| pit | 191 | 9% |
| peck | 188 | 9% |
| bomb | 145 | 7% |
| bow | 141 | 7% |
| heavy | 132 | 7% |
| cannon | 83 | 4% |
| spike | 51 | 3% |
| bees | 50 | 2% |
| mine | 31 | 2% |
| chickens | 21 | 1% |
| stab | 17 | 1% |
| catapult | 16 | 1% |
| norr | 11 | 1% |
| lava | 11 | 1% |
| thorns | 10 | 0% |
| meteor | 7 | 0% |
| steve | 7 | 0% |
| hotpie | 6 | 0% |

## Combat feel

- Sword swings that connected: humans 40% of 880, bots 56% of 5372
- Ranged shots that hit: humans 40% of 108, bots 47% of 1721
- Blocks (clangs): 424; parries: 109; guard breaks: 13; dashes: 1862
- Heavy swings: 1016; dash-stabs: 65; shield bashes: 341; hits absorbed by spawn protection: 16
- Ring-outs (pit deaths credited to an attacker): 109 of 2017 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 62 |
| bees | 57 |
| swap | 47 |
| bouncy | 45 |
| giant | 41 |
| mines | 40 |
| ghost | 39 |
| big | 33 |
| norr | 33 |
| heart | 33 |
| disco | 29 |
| magnet | 25 |
| speed | 24 |
| potion | 24 |
| tiny | 24 |
| shield | 24 |
| thorns | 23 |
| chicken | 22 |
| jelly | 22 |
| boss | 20 |
| custard | 19 |
| meteors | 17 |
| steve | 16 |
| blackout | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 15 | 44 |
| boss | 20 | 112 |
| bounty | 10 | 41 |
| catapult | 11 | 48 |
| chicken | 22 | 127 |
| custard | 19 | 69 |
| disco | 29 | 99 |
| gust | 7 | 30 |
| jelly | 22 | 58 |
| meteors | 17 | 62 |
| slowmo | 10 | 13 |
| stampede | 10 | 49 |
| supply | 10 | 19 |
| tiny | 24 | 83 |
| trapdoor | 11 | 59 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 17.6 | 10.6 |
| spicy | pro | 1 | 27.0 | 20.0 |
| spicy | collector | 1 | 36.0 | 20.0 |
| spicy | parrier | 1 | 15.0 | 15.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 42s | You 9 | 0 |
| kotp | frost | rusher | ended | 180s | You 47 | 0 |
| heist | factory | rusher | ended | 100s | Lady Bug 2 | 0 |
| race | dungeon | rusher | ended | 127s | Lord Nibbles 15 | 0 |
| hotpie | roof | rusher | ended | 64s | You 11 | 0 |
| flags | bog | rusher | ended | 82s | Duchess Dumpling 31 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,600) | 3 |
| courtyard (1200,720) | 2 |
| courtyard (1240,720) | 2 |
| roof (1120,240) | 2 |
| dungeon (360,320) | 2 |
| dungeon (920,640) | 2 |
| courtyard (1080,720) | 1 |
| courtyard (80,320) | 1 |

## Sim speed

Average 0.7s of CPU per 3-minute match (update only, no rendering).
