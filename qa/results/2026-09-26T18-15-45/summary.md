# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T18-15-45.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 37.0 | 19.0 | 1.0 | 0% | 6.5s |
| camper | 1 | 1.0 | 4.0 | 8.0 | 0% | 42.5s |
| collector | 1 | 31.0 | 18.0 | 1.0 | 0% | 7.6s |
| pacifist | 1 | 0.0 | 11.0 | 8.0 | 0% | 13.1s |
| fuzzer | 1 | 1.0 | 19.0 | 7.0 | 11% | 6.8s |
| idle | 1 | 0.0 | 11.0 | 8.0 | 0% | 13.9s |
| parrier | 1 | 11.0 | 16.0 | 8.0 | 0% | 9.0s |
| pro | 1 | 30.0 | 17.0 | 1.0 | 6% | 7.6s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 41.6 | 5% | 3% | 460px | sword 49%, bomb 13%, bow 10%, cannon 7% |
| frost | 3 | 41.1 | 17% | 4% | 430px | sword 52%, pit 14%, heavy 10%, bomb 4% |
| factory | 2 | 44.0 | 12% | 3% | 467px | sword 48%, bomb 10%, bow 9%, cannon 7% |
| dungeon | 2 | 41.0 | 28% | 2% | 411px | sword 35%, spike 13%, lava 11%, bomb 11% |
| roof | 2 | 21.0 | 40% | 6% | 390px | sword 38%, pit 33%, heavy 6%, catapult 4% |
| bog | 2 | 40.2 | 11% | 4% | 451px | sword 41%, bow 11%, cannon 9%, pit 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 891 | 44% |
| peck | 180 | 9% |
| pit | 161 | 8% |
| bomb | 144 | 7% |
| bow | 142 | 7% |
| heavy | 130 | 6% |
| cannon | 97 | 5% |
| spike | 56 | 3% |
| bees | 39 | 2% |
| mine | 37 | 2% |
| chickens | 28 | 1% |
| lava | 28 | 1% |
| thorns | 22 | 1% |
| catapult | 17 | 1% |
| meteor | 14 | 1% |
| stab | 13 | 1% |
| norr | 12 | 1% |
| steve | 6 | 0% |
| hotpie | 5 | 0% |
| bash | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 42% of 871, bots 56% of 5264
- Ranged shots that hit: humans 32% of 90, bots 45% of 1920
- Blocks (clangs): 435; parries: 85; guard breaks: 24; dashes: 1852
- Heavy swings: 965; dash-stabs: 70; shield bashes: 326; hits absorbed by spawn protection: 10
- Ring-outs (pit deaths credited to an attacker): 95 of 2023 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| giant | 54 |
| mines | 52 |
| thorns | 51 |
| banana | 49 |
| swap | 44 |
| bees | 43 |
| bouncy | 39 |
| ghost | 38 |
| big | 37 |
| magnet | 36 |
| norr | 30 |
| shield | 28 |
| heart | 28 |
| speed | 26 |
| blackout | 24 |
| disco | 24 |
| chicken | 24 |
| custard | 24 |
| potion | 21 |
| tiny | 18 |
| boss | 17 |
| steve | 16 |
| jelly | 16 |
| meteors | 13 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 24 | 70 |
| boss | 17 | 87 |
| bounty | 10 | 29 |
| catapult | 9 | 35 |
| chicken | 24 | 120 |
| custard | 24 | 88 |
| disco | 24 | 87 |
| gust | 12 | 55 |
| jelly | 16 | 44 |
| meteors | 13 | 57 |
| slowmo | 8 | 12 |
| stampede | 11 | 64 |
| supply | 9 | 11 |
| tiny | 18 | 60 |
| trapdoor | 12 | 72 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 17.9 | 11.1 |
| spicy | pro | 1 | 30.0 | 17.0 |
| spicy | collector | 1 | 31.0 | 18.0 |
| spicy | parrier | 1 | 11.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 51s | You 11 | 0 |
| kotp | frost | rusher | ended | 180s | You 47 | 0 |
| heist | factory | rusher | ended | 115s | Lady Bug 2 | 0 |
| race | dungeon | rusher | ended | 129s | Sir Cumference 13 | 0 |
| hotpie | roof | rusher | ended | 57s | You 8 | 0 |
| flags | bog | rusher | ended | 68s | Lord Nibbles 28 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| roof (960,760) | 2 |
| roof (1240,760) | 2 |
| dungeon (920,640) | 2 |
| courtyard (200,160) | 1 |
| courtyard (1240,120) | 1 |
| courtyard (1240,160) | 1 |
| courtyard (1240,760) | 1 |
| courtyard (200,360) | 1 |

## Sim speed

Average 0.8s of CPU per 3-minute match (update only, no rendering).
