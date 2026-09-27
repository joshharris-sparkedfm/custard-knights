# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-27T07-16-52.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 27.0 | 23.0 | 1.0 | 13% | 5.6s |
| camper | 1 | 3.0 | 9.0 | 8.0 | 11% | 9.7s |
| collector | 1 | 19.0 | 18.0 | 2.0 | 6% | 6.7s |
| pacifist | 1 | 0.0 | 10.0 | 8.0 | 0% | 13.0s |
| fuzzer | 1 | 3.0 | 20.0 | 6.0 | 15% | 5.1s |
| idle | 1 | 1.0 | 12.0 | 8.0 | 0% | 11.2s |
| parrier | 1 | 8.0 | 19.0 | 8.0 | 5% | 6.7s |
| pro | 1 | 29.0 | 16.0 | 1.0 | 0% | 6.8s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.1 | 4% | 3% | 482px | sword 46%, bomb 14%, bow 11%, cannon 9% |
| frost | 3 | 37.4 | 23% | 4% | 430px | sword 47%, pit 18%, heavy 6%, peck 4% |
| factory | 2 | 46.5 | 14% | 1% | 466px | sword 47%, bow 12%, cannon 9%, spike 8% |
| dungeon | 2 | 37.0 | 14% | 6% | 405px | sword 41%, bomb 11%, cannon 9%, spike 8% |
| roof | 2 | 21.2 | 33% | 4% | 390px | sword 36%, pit 26%, heavy 9%, bomb 6% |
| bog | 2 | 39.3 | 12% | 2% | 462px | sword 39%, heavy 11%, bomb 11%, pit 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 810 | 42% |
| peck | 187 | 10% |
| pit | 164 | 8% |
| bomb | 149 | 8% |
| bow | 149 | 8% |
| heavy | 121 | 6% |
| cannon | 104 | 5% |
| spike | 53 | 3% |
| bees | 49 | 3% |
| mine | 36 | 2% |
| catapult | 22 | 1% |
| chickens | 20 | 1% |
| thorns | 17 | 1% |
| norr | 16 | 1% |
| lava | 14 | 1% |
| stab | 10 | 1% |
| meteor | 6 | 0% |
| steve | 3 | 0% |
| hotpie | 3 | 0% |
| bash | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 45% of 720, bots 55% of 5172
- Ranged shots that hit: humans 42% of 104, bots 45% of 1832
- Blocks (clangs): 446; parries: 88; guard breaks: 27; dashes: 1744
- Heavy swings: 1018; dash-stabs: 62; shield bashes: 330; hits absorbed by spawn protection: 10
- Ring-outs (pit deaths credited to an attacker): 103 of 1934 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 56 |
| mines | 55 |
| giant | 54 |
| bouncy | 49 |
| swap | 49 |
| banana | 41 |
| ghost | 40 |
| heart | 35 |
| potion | 32 |
| thorns | 32 |
| speed | 32 |
| shield | 31 |
| norr | 30 |
| magnet | 29 |
| big | 29 |
| jelly | 26 |
| chicken | 22 |
| tiny | 20 |
| disco | 19 |
| custard | 19 |
| blackout | 17 |
| steve | 16 |
| boss | 16 |
| meteors | 14 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 17 | 42 |
| boss | 16 | 69 |
| bounty | 10 | 44 |
| catapult | 10 | 42 |
| chicken | 22 | 108 |
| custard | 19 | 77 |
| disco | 19 | 77 |
| gust | 4 | 18 |
| jelly | 26 | 83 |
| meteors | 14 | 62 |
| slowmo | 11 | 19 |
| stampede | 11 | 63 |
| supply | 13 | 19 |
| tiny | 20 | 77 |
| trapdoor | 11 | 64 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.7 | 10.1 |
| spicy | pro | 1 | 29.0 | 16.0 |
| spicy | collector | 1 | 19.0 | 18.0 |
| spicy | parrier | 1 | 8.0 | 19.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 139s | Sir Cumference 14 | 0 |
| kotp | frost | rusher | ended | 180s | You 50 | 0 |
| heist | factory | rusher | ended | 51s | Earl Grey 3 | 0 |
| race | dungeon | rusher | ended | 97s | Sir Loin 19 | 0 |
| hotpie | roof | rusher | ended | 72s | You 7 | 0 |
| flags | bog | rusher | ended | 74s | Squire Squish 30 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (1200,640) | 3 |
| dungeon (520,640) | 2 |
| courtyard (360,680) | 1 |
| courtyard (880,720) | 1 |
| courtyard (1160,160) | 1 |
| courtyard (160,520) | 1 |
| courtyard (440,320) | 1 |
| courtyard (200,320) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
