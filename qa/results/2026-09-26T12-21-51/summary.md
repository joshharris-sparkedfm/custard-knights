# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T12-21-51.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 34.0 | 21.0 | 1.0 | 10% | 6.1s |
| camper | 1 | 4.0 | 9.0 | 8.0 | 0% | 9.7s |
| collector | 1 | 29.0 | 21.0 | 1.0 | 14% | 5.6s |
| pacifist | 1 | 0.0 | 10.0 | 8.0 | 0% | 6.8s |
| fuzzer | 1 | 0.0 | 22.0 | 8.0 | 14% | 5.5s |
| idle | 1 | 0.0 | 7.0 | 8.0 | 0% | 9.6s |
| parrier | 1 | 14.0 | 16.0 | 4.0 | 0% | 9.2s |
| pro | 1 | 27.0 | 18.0 | 1.0 | 0% | 6.6s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 41.8 | 4% | 2% | 468px | sword 53%, bow 13%, bomb 10%, heavy 6% |
| frost | 3 | 39.3 | 26% | 3% | 431px | sword 49%, pit 22%, heavy 8%, peck 6% |
| factory | 2 | 49.2 | 14% | 5% | 491px | sword 51%, bow 13%, spike 8%, heavy 6% |
| dungeon | 2 | 36.0 | 15% | 3% | 379px | sword 38%, bomb 11%, bow 10%, spike 9% |
| roof | 2 | 29.2 | 35% | 6% | 390px | sword 39%, pit 30%, heavy 8%, bees 5% |
| bog | 2 | 41.5 | 15% | 4% | 457px | sword 54%, pit 8%, heavy 7%, bow 6% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 948 | 46% |
| pit | 201 | 10% |
| peck | 185 | 9% |
| bow | 144 | 7% |
| heavy | 139 | 7% |
| bomb | 111 | 5% |
| cannon | 79 | 4% |
| spike | 55 | 3% |
| bees | 45 | 2% |
| chickens | 33 | 2% |
| mine | 25 | 1% |
| catapult | 20 | 1% |
| stab | 17 | 1% |
| thorns | 13 | 1% |
| lava | 11 | 1% |
| steve | 8 | 0% |
| norr | 8 | 0% |
| meteor | 8 | 0% |
| hotpie | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 43% of 828, bots 57% of 5465
- Ranged shots that hit: humans 42% of 100, bots 49% of 1742
- Blocks (clangs): 385; parries: 111; guard breaks: 15; dashes: 1825
- Heavy swings: 1017; dash-stabs: 55; shield bashes: 353; hits absorbed by spawn protection: 11
- Ring-outs (pit deaths credited to an attacker): 115 of 2053 KOs (6%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 52 |
| swap | 51 |
| giant | 49 |
| ghost | 48 |
| bouncy | 43 |
| mines | 43 |
| bees | 42 |
| magnet | 39 |
| speed | 36 |
| thorns | 33 |
| chicken | 30 |
| norr | 30 |
| custard | 30 |
| disco | 30 |
| potion | 28 |
| heart | 25 |
| shield | 24 |
| big | 23 |
| blackout | 23 |
| jelly | 21 |
| steve | 18 |
| meteors | 18 |
| boss | 16 |
| tiny | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 23 | 82 |
| boss | 16 | 81 |
| bounty | 9 | 41 |
| catapult | 11 | 46 |
| chicken | 30 | 126 |
| custard | 30 | 125 |
| disco | 30 | 112 |
| gust | 8 | 36 |
| jelly | 21 | 85 |
| meteors | 18 | 74 |
| slowmo | 11 | 21 |
| stampede | 14 | 80 |
| supply | 8 | 10 |
| tiny | 15 | 45 |
| trapdoor | 10 | 59 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.3 | 11.0 |
| spicy | pro | 1 | 27.0 | 18.0 |
| spicy | collector | 1 | 29.0 | 21.0 |
| spicy | parrier | 1 | 14.0 | 16.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 45s | Dame Crumpet 7 | 0 |
| kotp | frost | rusher | ended | 180s | Sir Loin 45 | 0 |
| heist | factory | rusher | ended | 96s | Sir Prize 2 | 0 |
| race | dungeon | rusher | ended | 149s | Sir Prize 14 | 0 |
| hotpie | roof | rusher | ended | 48s | You 11 | 0 |
| flags | bog | rusher | ended | 98s | Lady Bug 30 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (520,600) | 3 |
| courtyard (680,240) | 2 |
| factory (600,520) | 2 |
| courtyard (40,760) | 1 |
| courtyard (960,120) | 1 |
| courtyard (1200,400) | 1 |
| courtyard (1040,680) | 1 |
| frost (1240,720) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
