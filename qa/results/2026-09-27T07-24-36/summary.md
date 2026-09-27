# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-27T07-24-36.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 35.0 | 23.0 | 1.0 | 17% | 5.9s |
| camper | 1 | 3.0 | 8.0 | 8.0 | 0% | 18.5s |
| collector | 1 | 26.0 | 20.0 | 1.0 | 10% | 6.4s |
| pacifist | 1 | 0.0 | 8.0 | 8.0 | 0% | 17.4s |
| fuzzer | 1 | 0.0 | 22.0 | 8.0 | 14% | 6.4s |
| idle | 1 | 2.0 | 15.0 | 8.0 | 0% | 6.1s |
| parrier | 1 | 15.0 | 14.0 | 4.0 | 0% | 9.1s |
| pro | 1 | 22.0 | 17.0 | 1.0 | 12% | 8.1s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 39.9 | 4% | 5% | 463px | sword 50%, bomb 12%, bow 11%, peck 6% |
| frost | 3 | 41.8 | 20% | 2% | 430px | sword 53%, pit 18%, heavy 9%, bow 5% |
| factory | 2 | 49.7 | 10% | 4% | 456px | sword 48%, bow 9%, bomb 9%, cannon 6% |
| dungeon | 2 | 36.8 | 20% | 1% | 426px | sword 42%, spike 11%, bow 10%, heavy 9% |
| roof | 2 | 29.0 | 29% | 5% | 390px | sword 48%, pit 23%, heavy 7%, bees 6% |
| bog | 2 | 42.0 | 9% | 3% | 460px | sword 46%, bow 12%, heavy 9%, cannon 7% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 968 | 48% |
| pit | 176 | 9% |
| peck | 159 | 8% |
| bow | 148 | 7% |
| heavy | 130 | 6% |
| bomb | 122 | 6% |
| cannon | 85 | 4% |
| bees | 52 | 3% |
| spike | 51 | 3% |
| mine | 27 | 1% |
| catapult | 20 | 1% |
| lava | 15 | 1% |
| thorns | 14 | 1% |
| chickens | 14 | 1% |
| meteor | 13 | 1% |
| stab | 12 | 1% |
| norr | 10 | 0% |
| steve | 8 | 0% |
| hotpie | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 45% of 820, bots 58% of 5515
- Ranged shots that hit: humans 35% of 91, bots 48% of 1786
- Blocks (clangs): 418; parries: 95; guard breaks: 22; dashes: 1811
- Heavy swings: 1011; dash-stabs: 67; shield bashes: 367; hits absorbed by spawn protection: 15
- Ring-outs (pit deaths credited to an attacker): 111 of 2028 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| ghost | 54 |
| bees | 52 |
| giant | 52 |
| bouncy | 51 |
| swap | 49 |
| mines | 47 |
| banana | 45 |
| magnet | 40 |
| heart | 31 |
| shield | 30 |
| big | 28 |
| norr | 28 |
| jelly | 26 |
| chicken | 25 |
| speed | 24 |
| thorns | 23 |
| potion | 23 |
| meteors | 22 |
| disco | 22 |
| blackout | 19 |
| boss | 18 |
| custard | 17 |
| steve | 17 |
| tiny | 16 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 19 | 66 |
| boss | 18 | 102 |
| bounty | 11 | 42 |
| catapult | 10 | 44 |
| chicken | 25 | 127 |
| custard | 17 | 71 |
| disco | 22 | 87 |
| gust | 9 | 47 |
| jelly | 26 | 106 |
| meteors | 22 | 78 |
| slowmo | 11 | 20 |
| stampede | 9 | 56 |
| supply | 6 | 7 |
| tiny | 16 | 56 |
| trapdoor | 12 | 80 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 15.9 | 10.4 |
| spicy | pro | 1 | 22.0 | 17.0 |
| spicy | collector | 1 | 26.0 | 20.0 |
| spicy | parrier | 1 | 15.0 | 14.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 28s | You 6 | 0 |
| kotp | frost | rusher | ended | 180s | You 39 | 0 |
| heist | factory | rusher | ended | 54s | Dame Crumpet 2 | 0 |
| race | dungeon | rusher | ended | 97s | Duchess Dumpling 19 | 0 |
| hotpie | roof | rusher | ended | 57s | You 8 | 0 |
| flags | bog | rusher | ended | 106s | Count Custard 35 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (240,520) | 2 |
| frost (160,320) | 2 |
| courtyard (40,760) | 1 |
| courtyard (1120,440) | 1 |
| courtyard (160,280) | 1 |
| courtyard (1120,280) | 1 |
| courtyard (920,360) | 1 |
| courtyard (600,480) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
