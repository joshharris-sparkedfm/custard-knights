# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-10-08T08-45-20.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 40.0 | 22.0 | 1.0 | 14% | 5.6s |
| camper | 1 | 3.0 | 10.0 | 8.0 | 0% | 17.5s |
| collector | 1 | 32.0 | 21.0 | 1.0 | 14% | 4.7s |
| pacifist | 1 | 0.0 | 10.0 | 8.0 | 0% | 18.7s |
| fuzzer | 1 | 1.0 | 21.0 | 8.0 | 14% | 5.9s |
| idle | 1 | 0.0 | 10.0 | 8.0 | 0% | 14.2s |
| parrier | 1 | 4.0 | 17.0 | 8.0 | 0% | 7.4s |
| pro | 1 | 25.0 | 21.0 | 1.0 | 14% | 4.3s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.6 | 5% | 4% | 459px | sword 44%, bow 12%, bomb 11%, peck 8% |
| frost | 3 | 40.8 | 18% | 4% | 430px | sword 53%, pit 16%, heavy 8%, peck 5% |
| factory | 2 | 45.3 | 13% | 3% | 512px | sword 49%, heavy 8%, bow 7%, cannon 7% |
| dungeon | 2 | 39.7 | 18% | 3% | 370px | sword 40%, bomb 8%, spike 8%, lava 8% |
| roof | 2 | 25.3 | 28% | 3% | 390px | sword 53%, pit 27%, heavy 8%, bomb 2% |
| bog | 2 | 40.8 | 12% | 4% | 473px | sword 46%, heavy 13%, bomb 9%, bow 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 931 | 46% |
| pit | 179 | 9% |
| peck | 175 | 9% |
| heavy | 134 | 7% |
| bow | 130 | 6% |
| bomb | 129 | 6% |
| cannon | 90 | 4% |
| mine | 55 | 3% |
| spike | 41 | 2% |
| bees | 41 | 2% |
| catapult | 26 | 1% |
| thorns | 20 | 1% |
| lava | 19 | 1% |
| chickens | 18 | 1% |
| norr | 14 | 1% |
| meteor | 12 | 1% |
| stab | 11 | 1% |
| steve | 3 | 0% |
| hotpie | 2 | 0% |

## Combat feel

- Sword swings that connected: humans 38% of 824, bots 57% of 5348
- Ranged shots that hit: humans 36% of 85, bots 47% of 1724
- Blocks (clangs): 445; parries: 81; guard breaks: 22; dashes: 1827
- Heavy swings: 1005; dash-stabs: 67; shield bashes: 322; hits absorbed by spawn protection: 7
- Ring-outs (pit deaths credited to an attacker): 111 of 2030 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| mines | 59 |
| bouncy | 57 |
| giant | 53 |
| bees | 53 |
| ghost | 48 |
| swap | 48 |
| banana | 47 |
| shield | 35 |
| thorns | 32 |
| norr | 31 |
| big | 28 |
| magnet | 26 |
| boss | 25 |
| meteors | 25 |
| potion | 24 |
| chicken | 22 |
| heart | 22 |
| custard | 21 |
| speed | 21 |
| blackout | 18 |
| disco | 18 |
| steve | 17 |
| tiny | 14 |
| jelly | 12 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 18 | 47 |
| boss | 25 | 119 |
| bounty | 7 | 31 |
| catapult | 10 | 51 |
| chicken | 22 | 114 |
| custard | 21 | 77 |
| disco | 18 | 70 |
| gust | 14 | 68 |
| jelly | 12 | 41 |
| meteors | 25 | 108 |
| slowmo | 7 | 10 |
| stampede | 13 | 76 |
| supply | 9 | 12 |
| tiny | 14 | 35 |
| trapdoor | 9 | 61 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 13.7 | 10.4 |
| spicy | pro | 1 | 25.0 | 21.0 |
| spicy | collector | 1 | 32.0 | 21.0 |
| spicy | parrier | 1 | 4.0 | 17.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 34s | You 6 | 0 |
| kotp | frost | rusher | ended | 180s | You 37 | 0 |
| heist | factory | rusher | ended | 86s | Dame Crumpet 2 | 0 |
| race | dungeon | rusher | ended | 130s | Sir Cumference 14 | 0 |
| hotpie | roof | rusher | ended | 48s | Lord Nibbles 6 | 0 |
| flags | bog | rusher | ended | 103s | Dame Crumpet 37 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (680,680) | 2 |
| dungeon (360,600) | 2 |
| courtyard (1200,600) | 1 |
| courtyard (360,440) | 1 |
| courtyard (1240,440) | 1 |
| courtyard (80,160) | 1 |
| courtyard (40,720) | 1 |
| courtyard (960,280) | 1 |

## Sim speed

Average 0.3s of CPU per 3-minute match (update only, no rendering).
