# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-27T07-24-24.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 28.0 | 21.0 | 1.0 | 5% | 6.1s |
| camper | 1 | 1.0 | 4.0 | 8.0 | 0% | 26.3s |
| collector | 1 | 28.0 | 22.0 | 1.0 | 5% | 6.5s |
| pacifist | 1 | 0.0 | 10.0 | 8.0 | 0% | 9.0s |
| fuzzer | 1 | 2.0 | 18.0 | 7.0 | 17% | 5.5s |
| idle | 1 | 0.0 | 14.0 | 8.0 | 0% | 11.6s |
| parrier | 1 | 9.0 | 17.0 | 8.0 | 0% | 8.3s |
| pro | 1 | 31.0 | 18.0 | 1.0 | 0% | 7.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 43.4 | 5% | 3% | 469px | sword 41%, bomb 13%, bow 13%, cannon 9% |
| frost | 3 | 41.7 | 24% | 3% | 431px | sword 54%, pit 21%, heavy 7%, cannon 4% |
| factory | 2 | 44.5 | 8% | 4% | 518px | sword 44%, bow 13%, bomb 9%, heavy 7% |
| dungeon | 2 | 34.5 | 18% | 2% | 372px | sword 41%, lava 10%, heavy 8%, spike 7% |
| roof | 2 | 12.8 | 38% | 12% | 390px | sword 55%, pit 29%, heavy 8%, catapult 5% |
| bog | 2 | 41.5 | 8% | 2% | 472px | sword 43%, heavy 14%, bomb 7%, cannon 7% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 881 | 45% |
| pit | 161 | 8% |
| heavy | 155 | 8% |
| bow | 146 | 7% |
| bomb | 135 | 7% |
| peck | 121 | 6% |
| cannon | 118 | 6% |
| mine | 55 | 3% |
| spike | 44 | 2% |
| bees | 35 | 2% |
| thorns | 25 | 1% |
| lava | 20 | 1% |
| norr | 20 | 1% |
| meteor | 13 | 1% |
| catapult | 12 | 1% |
| chickens | 11 | 1% |
| stab | 10 | 1% |
| steve | 4 | 0% |
| hotpie | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 41% of 937, bots 57% of 5457
- Ranged shots that hit: humans 36% of 137, bots 46% of 1869
- Blocks (clangs): 422; parries: 70; guard breaks: 19; dashes: 1862
- Heavy swings: 1074; dash-stabs: 65; shield bashes: 355; hits absorbed by spawn protection: 11
- Ring-outs (pit deaths credited to an attacker): 103 of 1970 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| mines | 53 |
| banana | 49 |
| ghost | 48 |
| bouncy | 47 |
| thorns | 46 |
| bees | 44 |
| giant | 43 |
| swap | 39 |
| speed | 35 |
| shield | 35 |
| potion | 33 |
| magnet | 30 |
| norr | 29 |
| heart | 29 |
| tiny | 27 |
| big | 25 |
| disco | 25 |
| meteors | 23 |
| custard | 21 |
| boss | 20 |
| chicken | 19 |
| jelly | 16 |
| steve | 15 |
| blackout | 13 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 13 | 43 |
| boss | 20 | 82 |
| bounty | 10 | 60 |
| catapult | 7 | 31 |
| chicken | 19 | 82 |
| custard | 21 | 81 |
| disco | 25 | 94 |
| gust | 11 | 52 |
| jelly | 16 | 65 |
| meteors | 23 | 92 |
| slowmo | 12 | 21 |
| stampede | 5 | 29 |
| supply | 13 | 19 |
| tiny | 27 | 83 |
| trapdoor | 12 | 71 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 13.1 | 9.9 |
| spicy | pro | 1 | 31.0 | 18.0 |
| spicy | collector | 1 | 28.0 | 22.0 |
| spicy | parrier | 1 | 9.0 | 17.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 46s | Squire Squish 7 | 0 |
| kotp | frost | rusher | ended | 180s | Squire Squish 43 | 0 |
| heist | factory | rusher | ended | 79s | Duchess Dumpling 3 | 0 |
| race | dungeon | rusher | ended | 93s | Dame Crumpet 23 | 0 |
| hotpie | roof | rusher | ended | 57s | You 4 | 0 |
| flags | bog | rusher | ended | 180s | Sir Prize 25 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1200,160) | 2 |
| factory (280,200) | 2 |
| dungeon (280,720) | 2 |
| bog (760,440) | 2 |
| courtyard (1240,160) | 1 |
| courtyard (1240,480) | 1 |
| courtyard (640,560) | 1 |
| courtyard (80,160) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
