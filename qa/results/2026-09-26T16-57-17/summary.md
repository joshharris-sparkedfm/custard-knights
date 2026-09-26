# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T16-57-17.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 22.0 | 19.0 | 1.0 | 0% | 6.2s |
| camper | 1 | 4.0 | 10.0 | 8.0 | 0% | 4.9s |
| collector | 1 | 23.0 | 21.0 | 1.0 | 0% | 6.7s |
| pacifist | 1 | 0.0 | 6.0 | 8.0 | 0% | 14.8s |
| fuzzer | 1 | 0.0 | 20.0 | 8.0 | 15% | 6.1s |
| idle | 1 | 0.0 | 15.0 | 8.0 | 0% | 7.0s |
| parrier | 1 | 14.0 | 18.0 | 5.0 | 6% | 7.3s |
| pro | 1 | 40.0 | 19.0 | 1.0 | 0% | 6.0s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 39.4 | 3% | 3% | 459px | sword 48%, bow 12%, cannon 10%, bomb 8% |
| frost | 3 | 41.1 | 21% | 4% | 430px | sword 50%, pit 18%, heavy 10%, peck 5% |
| factory | 2 | 47.5 | 11% | 2% | 508px | sword 46%, bow 12%, cannon 9%, bomb 8% |
| dungeon | 2 | 33.8 | 16% | 0% | 384px | sword 41%, bow 10%, bomb 7%, heavy 7% |
| roof | 2 | 24.5 | 30% | 5% | 390px | sword 43%, pit 24%, heavy 7%, bow 4% |
| bog | 2 | 39.8 | 12% | 5% | 463px | sword 41%, bomb 13%, pit 9%, bow 9% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 892 | 45% |
| pit | 181 | 9% |
| bow | 156 | 8% |
| heavy | 148 | 8% |
| peck | 130 | 7% |
| bomb | 119 | 6% |
| cannon | 112 | 6% |
| bees | 46 | 2% |
| spike | 41 | 2% |
| mine | 38 | 2% |
| catapult | 24 | 1% |
| chickens | 21 | 1% |
| steve | 13 | 1% |
| lava | 10 | 1% |
| thorns | 9 | 0% |
| meteor | 9 | 0% |
| stab | 8 | 0% |
| norr | 8 | 0% |
| hotpie | 4 | 0% |

## Combat feel

- Sword swings that connected: humans 48% of 857, bots 56% of 5211
- Ranged shots that hit: humans 50% of 120, bots 49% of 1899
- Blocks (clangs): 431; parries: 73; guard breaks: 24; dashes: 1726
- Heavy swings: 962; dash-stabs: 61; shield bashes: 335; hits absorbed by spawn protection: 11
- Ring-outs (pit deaths credited to an attacker): 108 of 1969 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 58 |
| swap | 57 |
| giant | 54 |
| bees | 52 |
| bouncy | 50 |
| mines | 49 |
| ghost | 40 |
| heart | 39 |
| magnet | 30 |
| potion | 29 |
| shield | 27 |
| blackout | 27 |
| jelly | 25 |
| norr | 24 |
| boss | 24 |
| speed | 24 |
| thorns | 21 |
| disco | 21 |
| tiny | 20 |
| big | 19 |
| steve | 18 |
| chicken | 18 |
| meteors | 15 |
| custard | 15 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 27 | 110 |
| boss | 24 | 129 |
| bounty | 8 | 27 |
| catapult | 10 | 39 |
| chicken | 18 | 94 |
| custard | 15 | 69 |
| disco | 21 | 61 |
| gust | 7 | 33 |
| jelly | 25 | 81 |
| meteors | 15 | 65 |
| slowmo | 12 | 19 |
| stampede | 14 | 77 |
| supply | 14 | 24 |
| tiny | 20 | 61 |
| trapdoor | 4 | 25 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 17.0 | 9.0 |
| spicy | pro | 1 | 40.0 | 19.0 |
| spicy | collector | 1 | 23.0 | 21.0 |
| spicy | parrier | 1 | 14.0 | 18.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 79s | Sir Render 11 | 0 |
| kotp | frost | rusher | ended | 180s | You 61 | 0 |
| heist | factory | rusher | ended | 54s | Lord Nibbles 2 | 0 |
| race | dungeon | rusher | ended | 86s | Baron Von Bap 30 | 0 |
| hotpie | roof | rusher | ended | 62s | You 7 | 0 |
| flags | bog | rusher | ended | 106s | Baron Von Bap 34 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,600) | 4 |
| courtyard (280,720) | 2 |
| bog (1200,760) | 2 |
| frost (320,680) | 2 |
| frost (1200,720) | 2 |
| bog (520,480) | 2 |
| courtyard (440,640) | 1 |
| courtyard (1240,760) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
