# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T18-16-07.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 31.0 | 22.0 | 1.0 | 5% | 5.7s |
| camper | 1 | 4.0 | 11.0 | 8.0 | 9% | 10.8s |
| collector | 1 | 16.0 | 22.0 | 7.0 | 14% | 4.8s |
| pacifist | 1 | 1.0 | 11.0 | 8.0 | 0% | 11.9s |
| fuzzer | 1 | 1.0 | 20.0 | 8.0 | 30% | 7.4s |
| idle | 1 | 0.0 | 10.0 | 8.0 | 0% | 17.7s |
| parrier | 1 | 11.0 | 16.0 | 6.0 | 0% | 8.9s |
| pro | 1 | 32.0 | 23.0 | 1.0 | 13% | 4.9s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 41.8 | 4% | 3% | 464px | sword 53%, bomb 11%, bow 9%, cannon 6% |
| frost | 3 | 41.0 | 20% | 4% | 430px | sword 49%, pit 18%, heavy 10%, peck 7% |
| factory | 2 | 46.2 | 10% | 4% | 477px | sword 47%, bow 12%, bomb 8%, heavy 6% |
| dungeon | 2 | 37.0 | 18% | 2% | 388px | sword 45%, spike 9%, bomb 7%, heavy 7% |
| roof | 2 | 16.8 | 29% | 11% | 390px | sword 54%, pit 20%, heavy 8%, chickens 7% |
| bog | 2 | 40.2 | 12% | 2% | 461px | sword 41%, bomb 12%, bow 10%, pit 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 896 | 47% |
| peck | 158 | 8% |
| pit | 154 | 8% |
| bomb | 133 | 7% |
| heavy | 129 | 7% |
| bow | 125 | 7% |
| cannon | 91 | 5% |
| bees | 59 | 3% |
| spike | 48 | 3% |
| chickens | 27 | 1% |
| mine | 26 | 1% |
| lava | 15 | 1% |
| norr | 13 | 1% |
| thorns | 10 | 1% |
| stab | 9 | 0% |
| catapult | 9 | 0% |
| steve | 7 | 0% |
| meteor | 4 | 0% |
| hotpie | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 44% of 728, bots 57% of 5233
- Ranged shots that hit: humans 35% of 85, bots 45% of 1689
- Blocks (clangs): 362; parries: 91; guard breaks: 19; dashes: 1684
- Heavy swings: 988; dash-stabs: 59; shield bashes: 314; hits absorbed by spawn protection: 15
- Ring-outs (pit deaths credited to an attacker): 97 of 1916 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 50 |
| ghost | 48 |
| banana | 46 |
| swap | 45 |
| mines | 44 |
| bouncy | 36 |
| thorns | 35 |
| big | 35 |
| norr | 34 |
| giant | 34 |
| heart | 29 |
| magnet | 27 |
| chicken | 26 |
| shield | 25 |
| potion | 25 |
| disco | 23 |
| custard | 21 |
| speed | 21 |
| boss | 19 |
| blackout | 17 |
| steve | 15 |
| meteors | 14 |
| tiny | 13 |
| jelly | 13 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 17 | 69 |
| boss | 19 | 109 |
| bounty | 8 | 29 |
| catapult | 6 | 24 |
| chicken | 26 | 117 |
| custard | 21 | 80 |
| disco | 23 | 90 |
| gust | 10 | 46 |
| jelly | 13 | 41 |
| meteors | 14 | 46 |
| slowmo | 10 | 10 |
| stampede | 13 | 63 |
| supply | 9 | 8 |
| tiny | 13 | 44 |
| trapdoor | 11 | 69 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.7 | 10.1 |
| spicy | pro | 1 | 32.0 | 23.0 |
| spicy | collector | 1 | 16.0 | 22.0 |
| spicy | parrier | 1 | 11.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 53s | You 16 | 0 |
| kotp | frost | rusher | ended | 180s | You 32 | 0 |
| heist | factory | rusher | ended | 48s | Earl Grey 2 | 0 |
| race | dungeon | rusher | ended | 99s | Baron Von Bap 17 | 0 |
| hotpie | roof | rusher | ended | 44s | You 10 | 0 |
| flags | bog | rusher | ended | 68s | Count Custard 29 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,600) | 3 |
| factory (1240,760) | 2 |
| roof (200,560) | 2 |
| dungeon (320,600) | 2 |
| dungeon (920,640) | 2 |
| courtyard (1200,720) | 1 |
| courtyard (1200,280) | 1 |
| courtyard (360,520) | 1 |

## Sim speed

Average 0.8s of CPU per 3-minute match (update only, no rendering).
