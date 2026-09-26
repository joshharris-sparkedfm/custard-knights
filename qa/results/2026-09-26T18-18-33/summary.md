# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T18-18-33.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 40.0 | 22.0 | 1.0 | 14% | 5.6s |
| camper | 1 | 4.0 | 12.0 | 8.0 | 0% | 9.5s |
| collector | 1 | 27.0 | 21.0 | 1.0 | 5% | 6.1s |
| pacifist | 1 | 0.0 | 13.0 | 8.0 | 0% | 8.8s |
| fuzzer | 1 | 3.0 | 20.0 | 5.0 | 5% | 7.1s |
| idle | 1 | 0.0 | 15.0 | 8.0 | 0% | 8.3s |
| parrier | 1 | 11.0 | 13.0 | 6.0 | 0% | 10.6s |
| pro | 1 | 27.0 | 17.0 | 1.0 | 6% | 8.2s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 42.6 | 4% | 2% | 479px | sword 48%, bow 14%, bomb 12%, heavy 7% |
| frost | 3 | 40.2 | 22% | 3% | 430px | sword 52%, pit 17%, peck 6%, heavy 5% |
| factory | 2 | 50.5 | 8% | 3% | 470px | sword 54%, bow 9%, bomb 9%, heavy 7% |
| dungeon | 2 | 38.2 | 14% | 3% | 402px | sword 44%, bow 11%, heavy 9%, bomb 7% |
| roof | 2 | 19.5 | 42% | 4% | 390px | pit 38%, sword 33%, heavy 7%, bomb 7% |
| bog | 2 | 43.5 | 14% | 2% | 473px | sword 45%, heavy 10%, bow 10%, bomb 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 938 | 46% |
| pit | 171 | 8% |
| peck | 161 | 8% |
| bow | 157 | 8% |
| bomb | 149 | 7% |
| heavy | 142 | 7% |
| cannon | 90 | 4% |
| bees | 42 | 2% |
| spike | 41 | 2% |
| chickens | 27 | 1% |
| catapult | 25 | 1% |
| mine | 24 | 1% |
| lava | 15 | 1% |
| stab | 12 | 1% |
| thorns | 11 | 1% |
| meteor | 11 | 1% |
| hotpie | 4 | 0% |
| norr | 3 | 0% |
| steve | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 45% of 805, bots 56% of 5367
- Ranged shots that hit: humans 34% of 114, bots 46% of 1878
- Blocks (clangs): 362; parries: 101; guard breaks: 14; dashes: 1746
- Heavy swings: 1027; dash-stabs: 65; shield bashes: 324; hits absorbed by spawn protection: 9
- Ring-outs (pit deaths credited to an attacker): 99 of 2024 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 14%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 60 |
| giant | 56 |
| bouncy | 52 |
| swap | 51 |
| bees | 48 |
| big | 42 |
| mines | 41 |
| ghost | 36 |
| magnet | 33 |
| thorns | 33 |
| heart | 29 |
| blackout | 26 |
| meteors | 25 |
| shield | 24 |
| custard | 24 |
| potion | 24 |
| chicken | 23 |
| speed | 22 |
| norr | 22 |
| jelly | 21 |
| boss | 20 |
| disco | 18 |
| tiny | 17 |
| steve | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 26 | 88 |
| boss | 20 | 92 |
| bounty | 9 | 28 |
| catapult | 12 | 59 |
| chicken | 23 | 109 |
| custard | 24 | 80 |
| disco | 18 | 77 |
| gust | 10 | 47 |
| jelly | 21 | 79 |
| meteors | 25 | 79 |
| slowmo | 10 | 18 |
| stampede | 10 | 60 |
| supply | 12 | 14 |
| tiny | 17 | 55 |
| trapdoor | 7 | 43 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.4 | 11.6 |
| spicy | pro | 1 | 27.0 | 17.0 |
| spicy | collector | 1 | 27.0 | 21.0 |
| spicy | parrier | 1 | 11.0 | 13.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 34s | You 8 | 0 |
| kotp | frost | rusher | ended | 180s | You 48 | 0 |
| heist | factory | rusher | ended | 76s | Sir Render 3 | 0 |
| race | dungeon | rusher | ended | 136s | Lord Nibbles 14 | 0 |
| hotpie | roof | rusher | ended | 46s | You 9 | 0 |
| flags | bog | rusher | ended | 77s | Sir Cumference 29 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1000,200) | 1 |
| courtyard (1240,400) | 1 |
| courtyard (280,360) | 1 |
| courtyard (1080,400) | 1 |
| courtyard (40,720) | 1 |
| courtyard (960,160) | 1 |
| frost (1120,720) | 1 |
| frost (1080,280) | 1 |

## Sim speed

Average 0.7s of CPU per 3-minute match (update only, no rendering).
