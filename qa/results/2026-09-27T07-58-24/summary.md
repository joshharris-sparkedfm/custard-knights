# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-27T07-58-24.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 35.0 | 22.0 | 1.0 | 14% | 5.5s |
| camper | 1 | 3.0 | 10.0 | 8.0 | 0% | 12.5s |
| collector | 1 | 40.0 | 15.0 | 1.0 | 0% | 7.7s |
| pacifist | 1 | 0.0 | 11.0 | 8.0 | 0% | 16.3s |
| fuzzer | 1 | 1.0 | 19.0 | 8.0 | 21% | 6.4s |
| idle | 1 | 0.0 | 10.0 | 8.0 | 0% | 11.1s |
| parrier | 1 | 9.0 | 17.0 | 7.0 | 0% | 8.8s |
| pro | 1 | 22.0 | 11.0 | 1.0 | 9% | 8.3s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 39.7 | 5% | 3% | 461px | sword 48%, bomb 11%, bow 11%, cannon 8% |
| frost | 3 | 39.3 | 19% | 3% | 430px | sword 50%, pit 16%, heavy 8%, bow 6% |
| factory | 2 | 44.0 | 8% | 3% | 459px | sword 51%, bow 13%, heavy 8%, cannon 5% |
| dungeon | 2 | 37.8 | 16% | 2% | 410px | sword 43%, heavy 9%, cannon 8%, spike 7% |
| roof | 2 | 18.5 | 29% | 5% | 390px | sword 40%, pit 24%, heavy 13%, bow 8% |
| bog | 2 | 40.8 | 12% | 3% | 464px | sword 47%, heavy 10%, bomb 9%, pit 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 882 | 46% |
| peck | 155 | 8% |
| heavy | 153 | 8% |
| bow | 149 | 8% |
| pit | 147 | 8% |
| bomb | 118 | 6% |
| cannon | 103 | 5% |
| bees | 46 | 2% |
| spike | 38 | 2% |
| chickens | 27 | 1% |
| mine | 25 | 1% |
| catapult | 22 | 1% |
| thorns | 16 | 1% |
| lava | 14 | 1% |
| meteor | 11 | 1% |
| norr | 10 | 1% |
| stab | 7 | 0% |
| steve | 4 | 0% |
| hotpie | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 37% of 868, bots 56% of 5459
- Ranged shots that hit: humans 52% of 88, bots 49% of 1802
- Blocks (clangs): 450; parries: 80; guard breaks: 24; dashes: 1891
- Heavy swings: 1069; dash-stabs: 69; shield bashes: 345; hits absorbed by spawn protection: 11
- Ring-outs (pit deaths credited to an attacker): 91 of 1931 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| ghost | 56 |
| bouncy | 56 |
| banana | 49 |
| swap | 47 |
| bees | 46 |
| heart | 40 |
| mines | 39 |
| shield | 36 |
| giant | 33 |
| big | 31 |
| magnet | 30 |
| norr | 30 |
| disco | 26 |
| thorns | 25 |
| jelly | 22 |
| chicken | 22 |
| speed | 20 |
| custard | 19 |
| meteors | 19 |
| boss | 18 |
| steve | 17 |
| blackout | 17 |
| potion | 16 |
| tiny | 14 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 17 | 51 |
| boss | 18 | 80 |
| bounty | 10 | 37 |
| catapult | 12 | 50 |
| chicken | 22 | 103 |
| custard | 19 | 66 |
| disco | 26 | 102 |
| gust | 12 | 57 |
| jelly | 22 | 75 |
| meteors | 19 | 87 |
| slowmo | 10 | 20 |
| stampede | 11 | 68 |
| supply | 6 | 8 |
| tiny | 14 | 44 |
| trapdoor | 9 | 43 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 14.6 | 10.9 |
| spicy | pro | 1 | 22.0 | 11.0 |
| spicy | collector | 1 | 40.0 | 15.0 |
| spicy | parrier | 1 | 9.0 | 17.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 33s | You 11 | 0 |
| kotp | frost | rusher | ended | 180s | You 30 | 0 |
| heist | factory | rusher | ended | 115s | Squire Squish 2 | 0 |
| race | dungeon | rusher | ended | 114s | Earl Grey 10 | 0 |
| hotpie | roof | rusher | ended | 52s | You 7 | 0 |
| flags | bog | rusher | ended | 114s | Sir Render 32 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (80,720) | 2 |
| frost (80,720) | 2 |
| dungeon (480,200) | 2 |
| courtyard (400,760) | 1 |
| courtyard (1080,720) | 1 |
| courtyard (840,480) | 1 |
| courtyard (80,280) | 1 |
| courtyard (240,240) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
