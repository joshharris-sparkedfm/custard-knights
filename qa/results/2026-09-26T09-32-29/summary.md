# Custard Knights QA summary

18 simulated matches, 54 minutes of play, run 2026-09-26T09-32-29.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 36.0 | 20.0 | 1.0 | 5% | 6.8s |
| camper | 1 | 2.0 | 12.0 | 8.0 | 0% | 8.7s |
| collector | 1 | 27.0 | 19.0 | 1.0 | 0% | 6.8s |
| pacifist | 1 | 0.0 | 6.0 | 8.0 | 0% | 25.3s |
| fuzzer | 1 | 3.0 | 19.0 | 8.0 | 16% | 5.3s |
| idle | 1 | 1.0 | 11.0 | 8.0 | 0% | 13.7s |
| parrier | 1 | 14.0 | 16.0 | 6.0 | 0% | 7.6s |
| pro | 1 | 46.0 | 18.0 | 1.0 | 6% | 6.2s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 42.0 | 4% | 3% | 465px | sword 52%, bow 12%, bomb 10%, cannon 9% |
| frost | 3 | 42.9 | 21% | 4% | 430px | sword 52%, pit 17%, heavy 7%, bow 5% |
| factory | 2 | 46.0 | 7% | 5% | 492px | sword 45%, bow 12%, bomb 11%, cannon 7% |
| dungeon | 2 | 40.2 | 16% | 4% | 404px | sword 39%, bomb 10%, spike 9%, cannon 8% |
| roof | 2 | 26.0 | 28% | 8% | 390px | sword 54%, pit 20%, heavy 10%, meteor 4% |
| bog | 2 | 40.0 | 9% | 4% | 441px | sword 46%, bomb 9%, heavy 8%, bow 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 910 | 47% |
| peck | 180 | 9% |
| bow | 146 | 7% |
| bomb | 135 | 7% |
| pit | 127 | 7% |
| heavy | 126 | 6% |
| cannon | 101 | 5% |
| mine | 47 | 2% |
| spike | 43 | 2% |
| meteor | 31 | 2% |
| bees | 31 | 2% |
| chickens | 15 | 1% |
| norr | 14 | 1% |
| catapult | 13 | 1% |
| thorns | 11 | 1% |
| lava | 8 | 0% |
| stab | 7 | 0% |
| steve | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 51% of 767, bots 57% of 5240
- Ranged shots that hit: humans 45% of 113, bots 49% of 1713
- Blocks (clangs): 397; parries: 107; guard breaks: 20; dashes: 1687
- Heavy swings: 961; dash-stabs: 74; shield bashes: 341; hits absorbed by spawn protection: 10
- Ring-outs (pit deaths credited to an attacker): 73 of 1949 KOs (4%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| swap | 57 |
| mines | 56 |
| banana | 53 |
| giant | 53 |
| ghost | 53 |
| bouncy | 42 |
| bees | 39 |
| potion | 37 |
| norr | 35 |
| heart | 30 |
| chicken | 28 |
| speed | 28 |
| magnet | 26 |
| boss | 25 |
| tiny | 23 |
| meteors | 22 |
| custard | 20 |
| big | 19 |
| shield | 19 |
| blackout | 19 |
| disco | 17 |
| thorns | 16 |
| steve | 14 |
| jelly | 14 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 19 | 76 |
| boss | 25 | 115 |
| bounty | 12 | 43 |
| catapult | 5 | 21 |
| chicken | 28 | 149 |
| custard | 20 | 67 |
| disco | 17 | 57 |
| gust | 13 | 59 |
| jelly | 14 | 37 |
| meteors | 22 | 119 |
| slowmo | 12 | 17 |
| stampede | 7 | 43 |
| supply | 8 | 10 |
| tiny | 23 | 77 |
| trapdoor | 9 | 51 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 5 | 15.2 | 11.4 |
| spicy | pro | 1 | 46.0 | 18.0 |
| spicy | collector | 1 | 27.0 | 19.0 |
| spicy | parrier | 1 | 14.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 56s | Squire Squish 8 | 0 |
| kotp | frost | rusher | ended | 180s | You 35 | 0 |
| heist | factory | rusher | ended | 58s | Lady Bug 2 | 0 |
| race | dungeon | rusher | ended | 118s | Sir Loin 11 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,600) | 3 |
| frost (80,760) | 2 |
| factory (40,720) | 2 |
| roof (1040,120) | 2 |
| courtyard (200,120) | 1 |
| courtyard (1160,120) | 1 |
| courtyard (1160,480) | 1 |
| courtyard (1160,280) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
