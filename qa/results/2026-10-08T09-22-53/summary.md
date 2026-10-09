# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-10-08T09-22-53.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 43.0 | 21.0 | 1.0 | 14% | 5.8s |
| camper | 1 | 1.0 | 3.0 | 8.0 | 0% | 72.4s |
| collector | 1 | 11.0 | 18.0 | 7.0 | 0% | 6.1s |
| pacifist | 1 | 2.0 | 9.0 | 8.0 | 0% | 11.4s |
| fuzzer | 1 | 4.0 | 19.0 | 7.0 | 5% | 6.1s |
| idle | 1 | 0.0 | 10.0 | 8.0 | 10% | 12.7s |
| parrier | 1 | 5.0 | 19.0 | 8.0 | 0% | 6.9s |
| pro | 1 | 30.0 | 19.0 | 1.0 | 11% | 7.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 44.2 | 6% | 5% | 455px | sword 49%, bomb 14%, bow 9%, cannon 7% |
| frost | 3 | 38.8 | 25% | 3% | 430px | sword 44%, pit 22%, heavy 8%, bow 5% |
| factory | 2 | 44.8 | 13% | 3% | 493px | sword 44%, bow 16%, cannon 8%, spike 7% |
| dungeon | 2 | 33.2 | 15% | 1% | 407px | sword 41%, bow 13%, bomb 12%, spike 8% |
| roof | 2 | 28.0 | 24% | 6% | 390px | sword 51%, pit 23%, heavy 11%, bomb 4% |
| bog | 2 | 38.8 | 9% | 3% | 472px | sword 38%, bomb 12%, cannon 11%, bow 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 863 | 44% |
| pit | 170 | 9% |
| bow | 164 | 8% |
| bomb | 150 | 8% |
| peck | 144 | 7% |
| heavy | 123 | 6% |
| cannon | 106 | 5% |
| bees | 57 | 3% |
| spike | 51 | 3% |
| mine | 41 | 2% |
| chickens | 22 | 1% |
| catapult | 21 | 1% |
| thorns | 14 | 1% |
| lava | 14 | 1% |
| meteor | 11 | 1% |
| norr | 9 | 0% |
| hotpie | 6 | 0% |
| stab | 4 | 0% |
| steve | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 40% of 794, bots 57% of 5286
- Ranged shots that hit: humans 39% of 87, bots 47% of 1899
- Blocks (clangs): 469; parries: 91; guard breaks: 25; dashes: 1806
- Heavy swings: 991; dash-stabs: 63; shield bashes: 339; hits absorbed by spawn protection: 15
- Ring-outs (pit deaths credited to an attacker): 112 of 1971 KOs (6%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| giant | 54 |
| mines | 51 |
| bouncy | 50 |
| banana | 48 |
| ghost | 46 |
| bees | 45 |
| swap | 43 |
| potion | 39 |
| magnet | 37 |
| speed | 35 |
| heart | 35 |
| thorns | 32 |
| boss | 29 |
| norr | 28 |
| custard | 27 |
| shield | 26 |
| big | 26 |
| blackout | 24 |
| chicken | 23 |
| jelly | 20 |
| tiny | 17 |
| steve | 16 |
| disco | 13 |
| meteors | 13 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 24 | 84 |
| boss | 29 | 125 |
| bounty | 11 | 58 |
| catapult | 11 | 41 |
| chicken | 23 | 112 |
| custard | 27 | 114 |
| disco | 13 | 39 |
| gust | 12 | 49 |
| jelly | 20 | 75 |
| meteors | 13 | 66 |
| slowmo | 9 | 22 |
| stampede | 8 | 44 |
| supply | 10 | 9 |
| tiny | 17 | 58 |
| trapdoor | 8 | 37 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 17.0 | 10.7 |
| spicy | pro | 1 | 30.0 | 19.0 |
| spicy | collector | 1 | 11.0 | 18.0 |
| spicy | parrier | 1 | 5.0 | 19.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 48s | You 9 | 0 |
| kotp | frost | rusher | ended | 180s | You 38 | 0 |
| heist | factory | rusher | ended | 74s | Lady Bug 2 | 0 |
| race | dungeon | rusher | ended | 94s | Earl Grey 22 | 0 |
| hotpie | roof | rusher | ended | 61s | You 7 | 0 |
| flags | bog | rusher | ended | 79s | Sir Render 29 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| courtyard (1200,760) | 2 |
| courtyard (1200,680) | 2 |
| dungeon (520,240) | 2 |
| courtyard (1040,200) | 1 |
| courtyard (360,680) | 1 |
| courtyard (560,440) | 1 |
| courtyard (960,360) | 1 |
| courtyard (1160,520) | 1 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
