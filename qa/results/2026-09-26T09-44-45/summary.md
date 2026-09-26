# Custard Knights QA summary

19 simulated matches, 57 minutes of play, run 2026-09-26T09-44-45.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 32.0 | 19.0 | 1.0 | 0% | 6.1s |
| camper | 1 | 5.0 | 7.0 | 8.0 | 0% | 22.2s |
| collector | 1 | 30.0 | 18.0 | 1.0 | 11% | 6.8s |
| pacifist | 1 | 0.0 | 12.0 | 8.0 | 0% | 12.6s |
| fuzzer | 1 | 5.0 | 16.0 | 6.0 | 6% | 6.9s |
| idle | 1 | 0.0 | 11.0 | 8.0 | 0% | 13.6s |
| parrier | 1 | 10.0 | 15.0 | 7.0 | 0% | 8.8s |
| pro | 1 | 35.0 | 19.0 | 1.0 | 5% | 6.0s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.2 | 5% | 2% | 479px | sword 46%, bomb 12%, bow 9%, cannon 7% |
| frost | 3 | 40.1 | 21% | 3% | 430px | sword 46%, pit 18%, heavy 9%, peck 7% |
| factory | 2 | 47.7 | 12% | 5% | 513px | sword 47%, bomb 12%, bow 9%, cannon 6% |
| dungeon | 2 | 39.3 | 22% | 1% | 396px | sword 32%, bow 12%, lava 10%, spike 9% |
| roof | 2 | 19.3 | 25% | 2% | 390px | sword 48%, pit 22%, heavy 9%, bees 6% |
| bog | 2 | 40.7 | 11% | 5% | 466px | sword 43%, bomb 14%, heavy 11%, bow 11% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 831 | 43% |
| peck | 157 | 8% |
| bomb | 153 | 8% |
| pit | 150 | 8% |
| bow | 143 | 7% |
| heavy | 131 | 7% |
| cannon | 97 | 5% |
| bees | 58 | 3% |
| spike | 47 | 2% |
| mine | 31 | 2% |
| chickens | 28 | 1% |
| lava | 23 | 1% |
| norr | 18 | 1% |
| catapult | 16 | 1% |
| meteor | 8 | 0% |
| thorns | 8 | 0% |
| steve | 7 | 0% |
| stab | 6 | 0% |
| hotpie | 6 | 0% |

## Combat feel

- Sword swings that connected: humans 46% of 804, bots 56% of 5082
- Ranged shots that hit: humans 46% of 98, bots 47% of 1730
- Blocks (clangs): 406; parries: 90; guard breaks: 18; dashes: 1742
- Heavy swings: 1017; dash-stabs: 56; shield bashes: 307; hits absorbed by spawn protection: 8
- Ring-outs (pit deaths credited to an attacker): 93 of 1918 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| giant | 65 |
| banana | 53 |
| bouncy | 51 |
| ghost | 49 |
| mines | 46 |
| bees | 45 |
| swap | 43 |
| potion | 32 |
| magnet | 32 |
| norr | 32 |
| speed | 29 |
| disco | 29 |
| shield | 27 |
| custard | 27 |
| thorns | 27 |
| big | 23 |
| chicken | 22 |
| boss | 21 |
| heart | 19 |
| blackout | 17 |
| steve | 16 |
| meteors | 15 |
| tiny | 13 |
| jelly | 13 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 17 | 75 |
| boss | 21 | 125 |
| bounty | 4 | 9 |
| catapult | 9 | 34 |
| chicken | 22 | 99 |
| custard | 27 | 104 |
| disco | 29 | 96 |
| gust | 12 | 58 |
| jelly | 13 | 56 |
| meteors | 15 | 68 |
| slowmo | 11 | 20 |
| stampede | 9 | 59 |
| supply | 15 | 17 |
| tiny | 13 | 53 |
| trapdoor | 8 | 38 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 6 | 15.2 | 11.0 |
| spicy | pro | 1 | 35.0 | 19.0 |
| spicy | collector | 1 | 30.0 | 18.0 |
| spicy | parrier | 1 | 10.0 | 15.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 30s | Baron Von Bap 6 | 0 |
| kotp | frost | rusher | ended | 180s | You 44 | 0 |
| heist | factory | rusher | ended | 84s | Sir Prize 3 | 0 |
| race | dungeon | rusher | ended | 115s | Earl Grey 14 | 0 |
| hotpie | roof | rusher | ended | 76s | You 10 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| factory (160,400) | 2 |
| courtyard (520,760) | 1 |
| courtyard (280,120) | 1 |
| courtyard (1120,760) | 1 |
| courtyard (680,720) | 1 |
| courtyard (1080,360) | 1 |
| courtyard (400,760) | 1 |
| courtyard (960,320) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
