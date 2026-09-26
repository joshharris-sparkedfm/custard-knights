# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T16-57-30.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 43.0 | 20.0 | 1.0 | 15% | 6.6s |
| camper | 1 | 3.0 | 9.0 | 8.0 | 0% | 14.0s |
| collector | 1 | 26.0 | 22.0 | 1.0 | 0% | 6.0s |
| pacifist | 1 | 0.0 | 13.0 | 8.0 | 0% | 8.6s |
| fuzzer | 1 | 2.0 | 15.0 | 8.0 | 0% | 7.6s |
| idle | 1 | 0.0 | 8.0 | 8.0 | 0% | 11.6s |
| parrier | 1 | 14.0 | 16.0 | 4.0 | 0% | 7.2s |
| pro | 1 | 37.0 | 15.0 | 1.0 | 0% | 8.8s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.4 | 4% | 5% | 476px | sword 48%, bomb 12%, bow 10%, cannon 8% |
| frost | 3 | 39.3 | 18% | 4% | 430px | sword 52%, pit 14%, heavy 10%, bow 5% |
| factory | 2 | 52.0 | 12% | 2% | 475px | sword 46%, bomb 11%, bow 9%, heavy 8% |
| dungeon | 2 | 38.3 | 23% | 3% | 393px | sword 41%, lava 10%, bomb 9%, spike 8% |
| roof | 2 | 25.5 | 29% | 5% | 390px | sword 46%, pit 20%, heavy 6%, chickens 5% |
| bog | 2 | 38.7 | 9% | 5% | 456px | sword 39%, heavy 10%, bomb 9%, bow 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 895 | 44% |
| peck | 203 | 10% |
| heavy | 158 | 8% |
| pit | 149 | 7% |
| bomb | 148 | 7% |
| bow | 122 | 6% |
| cannon | 83 | 4% |
| spike | 55 | 3% |
| mine | 47 | 2% |
| bees | 44 | 2% |
| chickens | 35 | 2% |
| catapult | 30 | 1% |
| lava | 23 | 1% |
| thorns | 18 | 1% |
| stab | 14 | 1% |
| norr | 14 | 1% |
| meteor | 5 | 0% |
| hotpie | 4 | 0% |
| steve | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 43% of 980, bots 56% of 5542
- Ranged shots that hit: humans 39% of 126, bots 45% of 1652
- Blocks (clangs): 448; parries: 86; guard breaks: 19; dashes: 1884
- Heavy swings: 1034; dash-stabs: 64; shield bashes: 363; hits absorbed by spawn protection: 13
- Ring-outs (pit deaths credited to an attacker): 91 of 2050 KOs (4%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 57 |
| giant | 54 |
| bouncy | 53 |
| swap | 49 |
| mines | 47 |
| bees | 44 |
| ghost | 38 |
| thorns | 38 |
| shield | 35 |
| norr | 35 |
| disco | 31 |
| blackout | 29 |
| potion | 28 |
| chicken | 28 |
| big | 28 |
| speed | 25 |
| heart | 25 |
| custard | 25 |
| magnet | 25 |
| jelly | 22 |
| steve | 18 |
| tiny | 15 |
| meteors | 14 |
| boss | 12 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 29 | 101 |
| boss | 12 | 71 |
| bounty | 8 | 32 |
| catapult | 14 | 57 |
| chicken | 28 | 125 |
| custard | 25 | 88 |
| disco | 31 | 111 |
| gust | 12 | 66 |
| jelly | 22 | 72 |
| meteors | 14 | 43 |
| slowmo | 9 | 19 |
| stampede | 12 | 74 |
| supply | 8 | 11 |
| tiny | 15 | 42 |
| trapdoor | 9 | 46 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 18.1 | 11.7 |
| spicy | pro | 1 | 37.0 | 15.0 |
| spicy | collector | 1 | 26.0 | 22.0 |
| spicy | parrier | 1 | 14.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 53s | You 10 | 0 |
| kotp | frost | rusher | ended | 180s | You 39 | 0 |
| heist | factory | rusher | ended | 118s | Duchess Dumpling 3 | 0 |
| race | dungeon | rusher | ended | 180s | Dame Crumpet 15 | 0 |
| hotpie | roof | rusher | ended | 74s | You 12 | 0 |
| flags | bog | rusher | ended | 84s | Sir Render 30 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (560,600) | 3 |
| bog (1240,160) | 2 |
| courtyard (1200,160) | 1 |
| courtyard (160,120) | 1 |
| courtyard (1200,680) | 1 |
| courtyard (80,560) | 1 |
| courtyard (960,600) | 1 |
| courtyard (720,640) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
