# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T19-17-52.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 40.0 | 20.0 | 1.0 | 5% | 6.9s |
| camper | 1 | 4.0 | 6.0 | 8.0 | 0% | 32.1s |
| collector | 1 | 25.0 | 22.0 | 2.0 | 9% | 6.2s |
| pacifist | 1 | 0.0 | 13.0 | 8.0 | 0% | 10.4s |
| fuzzer | 1 | 2.0 | 20.0 | 7.0 | 25% | 5.1s |
| idle | 1 | 0.0 | 10.0 | 8.0 | 0% | 13.7s |
| parrier | 1 | 11.0 | 17.0 | 7.0 | 12% | 7.8s |
| pro | 1 | 33.0 | 18.0 | 1.0 | 6% | 8.1s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 42.0 | 3% | 4% | 476px | sword 48%, bow 15%, bomb 12%, cannon 8% |
| frost | 3 | 38.9 | 22% | 3% | 431px | sword 52%, pit 20%, heavy 8%, bow 5% |
| factory | 2 | 44.5 | 9% | 3% | 497px | sword 45%, bow 10%, bomb 10%, cannon 8% |
| dungeon | 2 | 39.7 | 23% | 0% | 423px | sword 37%, bomb 13%, lava 11%, spike 10% |
| roof | 2 | 16.7 | 35% | 9% | 391px | sword 46%, pit 34%, heavy 8%, bomb 4% |
| bog | 2 | 39.2 | 8% | 4% | 433px | sword 40%, bow 14%, bomb 13%, heavy 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 851 | 44% |
| bow | 166 | 9% |
| bomb | 163 | 8% |
| pit | 157 | 8% |
| peck | 134 | 7% |
| heavy | 110 | 6% |
| cannon | 97 | 5% |
| spike | 47 | 2% |
| bees | 41 | 2% |
| mine | 27 | 1% |
| lava | 27 | 1% |
| thorns | 18 | 1% |
| norr | 18 | 1% |
| chickens | 18 | 1% |
| meteor | 12 | 1% |
| steve | 11 | 1% |
| stab | 11 | 1% |
| hotpie | 6 | 0% |
| catapult | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 44% of 786, bots 55% of 5209
- Ranged shots that hit: humans 41% of 125, bots 46% of 1803
- Blocks (clangs): 396; parries: 85; guard breaks: 8; dashes: 1758
- Heavy swings: 1000; dash-stabs: 61; shield bashes: 314; hits absorbed by spawn protection: 7
- Ring-outs (pit deaths credited to an attacker): 108 of 1918 KOs (6%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 62 |
| ghost | 53 |
| giant | 52 |
| mines | 49 |
| swap | 44 |
| potion | 36 |
| bees | 35 |
| norr | 35 |
| heart | 34 |
| bouncy | 33 |
| shield | 32 |
| blackout | 26 |
| magnet | 26 |
| big | 25 |
| thorns | 24 |
| meteors | 24 |
| boss | 23 |
| chicken | 23 |
| tiny | 23 |
| speed | 22 |
| disco | 21 |
| custard | 20 |
| jelly | 16 |
| steve | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 26 | 91 |
| boss | 23 | 135 |
| bounty | 8 | 35 |
| catapult | 5 | 19 |
| chicken | 23 | 100 |
| custard | 20 | 65 |
| disco | 21 | 57 |
| gust | 8 | 40 |
| jelly | 16 | 74 |
| meteors | 24 | 103 |
| slowmo | 18 | 33 |
| stampede | 10 | 52 |
| supply | 11 | 11 |
| tiny | 23 | 71 |
| trapdoor | 8 | 40 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 15.0 | 10.4 |
| spicy | pro | 1 | 33.0 | 18.0 |
| spicy | collector | 1 | 25.0 | 22.0 |
| spicy | parrier | 1 | 11.0 | 17.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 35s | You 9 | 0 |
| kotp | frost | rusher | ended | 180s | Sir Cumference 31 | 0 |
| heist | factory | rusher | ended | 45s | Sir Render 2 | 0 |
| race | dungeon | rusher | ended | 93s | Sir Render 23 | 0 |
| hotpie | roof | rusher | ended | 61s | You 8 | 0 |
| flags | bog | rusher | ended | 121s | Sir Render 33 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| roof (160,560) | 2 |
| dungeon (720,600) | 2 |
| courtyard (1120,240) | 1 |
| courtyard (1240,160) | 1 |
| courtyard (360,560) | 1 |
| courtyard (920,240) | 1 |
| courtyard (920,680) | 1 |
| courtyard (1120,400) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
