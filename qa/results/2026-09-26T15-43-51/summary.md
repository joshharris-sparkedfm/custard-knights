# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T15-43-51.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 32.0 | 24.0 | 1.0 | 21% | 6.3s |
| camper | 1 | 3.0 | 6.0 | 8.0 | 17% | 6.3s |
| collector | 1 | 24.0 | 19.0 | 1.0 | 0% | 6.4s |
| pacifist | 1 | 3.0 | 11.0 | 8.0 | 0% | 8.9s |
| fuzzer | 1 | 0.0 | 17.0 | 8.0 | 12% | 6.9s |
| idle | 1 | 0.0 | 17.0 | 8.0 | 0% | 6.8s |
| parrier | 1 | 12.0 | 15.0 | 6.0 | 0% | 9.3s |
| pro | 1 | 26.0 | 18.0 | 1.0 | 6% | 7.8s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 44.3 | 6% | 7% | 464px | sword 46%, bomb 13%, bow 8%, cannon 7% |
| frost | 3 | 39.0 | 19% | 4% | 430px | sword 54%, pit 17%, heavy 8%, peck 7% |
| factory | 2 | 48.0 | 10% | 2% | 487px | sword 39%, bow 15%, bomb 10%, cannon 8% |
| dungeon | 2 | 36.0 | 18% | 2% | 407px | sword 41%, bomb 10%, lava 8%, bow 7% |
| roof | 2 | 19.7 | 31% | 8% | 390px | sword 53%, pit 30%, heavy 8%, bomb 3% |
| bog | 2 | 41.0 | 11% | 3% | 477px | sword 41%, bomb 13%, heavy 11%, bow 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 885 | 44% |
| peck | 192 | 10% |
| pit | 171 | 9% |
| bomb | 158 | 8% |
| bow | 141 | 7% |
| heavy | 139 | 7% |
| cannon | 87 | 4% |
| bees | 54 | 3% |
| spike | 44 | 2% |
| mine | 41 | 2% |
| lava | 18 | 1% |
| chickens | 17 | 1% |
| thorns | 13 | 1% |
| norr | 13 | 1% |
| meteor | 10 | 0% |
| catapult | 9 | 0% |
| stab | 8 | 0% |
| hotpie | 4 | 0% |
| steve | 2 | 0% |

## Combat feel

- Sword swings that connected: humans 40% of 806, bots 57% of 5296
- Ranged shots that hit: humans 45% of 92, bots 47% of 1711
- Blocks (clangs): 397; parries: 88; guard breaks: 15; dashes: 1816
- Heavy swings: 996; dash-stabs: 56; shield bashes: 294; hits absorbed by spawn protection: 11
- Ring-outs (pit deaths credited to an attacker): 110 of 2006 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 13%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 58 |
| banana | 52 |
| mines | 49 |
| bouncy | 48 |
| giant | 43 |
| thorns | 40 |
| norr | 37 |
| ghost | 35 |
| swap | 35 |
| heart | 34 |
| big | 31 |
| potion | 31 |
| shield | 31 |
| magnet | 29 |
| speed | 27 |
| chicken | 24 |
| boss | 24 |
| jelly | 22 |
| meteors | 21 |
| custard | 20 |
| blackout | 20 |
| tiny | 20 |
| steve | 16 |
| disco | 16 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 20 | 58 |
| boss | 24 | 111 |
| bounty | 9 | 32 |
| catapult | 5 | 13 |
| chicken | 24 | 134 |
| custard | 20 | 77 |
| disco | 16 | 52 |
| gust | 16 | 63 |
| jelly | 22 | 87 |
| meteors | 21 | 71 |
| slowmo | 11 | 21 |
| stampede | 11 | 71 |
| supply | 7 | 10 |
| tiny | 20 | 61 |
| trapdoor | 11 | 70 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 15.4 | 11.7 |
| spicy | pro | 1 | 26.0 | 18.0 |
| spicy | collector | 1 | 24.0 | 19.0 |
| spicy | parrier | 1 | 12.0 | 15.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 42s | You 8 | 0 |
| kotp | frost | rusher | ended | 180s | You 38 | 0 |
| heist | factory | rusher | ended | 85s | Sir Render 1 | 0 |
| race | dungeon | rusher | ended | 130s | Sir Loin 15 | 0 |
| hotpie | roof | rusher | ended | 61s | You 8 | 0 |
| flags | bog | rusher | ended | 106s | Squire Squish 40 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,600) | 4 |
| courtyard (1240,760) | 2 |
| courtyard (800,160) | 1 |
| courtyard (80,160) | 1 |
| courtyard (480,200) | 1 |
| courtyard (1200,120) | 1 |
| courtyard (80,120) | 1 |
| courtyard (400,240) | 1 |

## Sim speed

Average 0.5s of CPU per 3-minute match (update only, no rendering).
