# Custard Knights QA summary

20 simulated matches, 60 minutes of play, run 2026-09-26T15-44-03.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 1 | 36.0 | 18.0 | 1.0 | 11% | 6.6s |
| camper | 1 | 1.0 | 5.0 | 8.0 | 20% | 14.9s |
| collector | 1 | 24.0 | 21.0 | 1.0 | 14% | 5.8s |
| pacifist | 1 | 0.0 | 12.0 | 8.0 | 0% | 12.7s |
| fuzzer | 1 | 2.0 | 20.0 | 7.0 | 10% | 6.8s |
| idle | 1 | 0.0 | 12.0 | 8.0 | 8% | 8.0s |
| parrier | 1 | 6.0 | 13.0 | 8.0 | 0% | 8.7s |
| pro | 1 | 26.0 | 13.0 | 1.0 | 0% | 8.7s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 3 | 40.4 | 5% | 3% | 460px | sword 39%, bomb 13%, bow 12%, heavy 9% |
| frost | 3 | 38.3 | 23% | 4% | 430px | sword 50%, pit 19%, heavy 10%, bomb 3% |
| factory | 2 | 46.7 | 9% | 3% | 480px | sword 46%, bomb 11%, cannon 9%, bow 9% |
| dungeon | 2 | 37.5 | 21% | 1% | 392px | sword 41%, spike 12%, cannon 8%, bomb 8% |
| roof | 2 | 27.8 | 26% | 4% | 390px | sword 40%, pit 23%, heavy 11%, bees 8% |
| bog | 2 | 39.3 | 11% | 4% | 472px | sword 44%, bow 11%, cannon 10%, heavy 10% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 850 | 42% |
| peck | 180 | 9% |
| pit | 172 | 9% |
| heavy | 156 | 8% |
| bomb | 138 | 7% |
| bow | 135 | 7% |
| cannon | 110 | 5% |
| bees | 63 | 3% |
| spike | 55 | 3% |
| mine | 43 | 2% |
| chickens | 18 | 1% |
| lava | 15 | 1% |
| stab | 14 | 1% |
| norr | 14 | 1% |
| catapult | 14 | 1% |
| meteor | 13 | 1% |
| steve | 6 | 0% |
| thorns | 4 | 0% |
| hotpie | 3 | 0% |

## Combat feel

- Sword swings that connected: humans 53% of 952, bots 56% of 5444
- Ranged shots that hit: humans 40% of 120, bots 48% of 1778
- Blocks (clangs): 441; parries: 76; guard breaks: 11; dashes: 1794
- Heavy swings: 1091; dash-stabs: 59; shield bashes: 316; hits absorbed by spawn protection: 8
- Ring-outs (pit deaths credited to an attacker): 102 of 2003 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 12%

## Power-ups picked up

| power-up | pickups |
|---|---|
| bees | 65 |
| mines | 56 |
| banana | 53 |
| ghost | 47 |
| swap | 45 |
| speed | 44 |
| bouncy | 43 |
| giant | 43 |
| heart | 40 |
| norr | 36 |
| boss | 32 |
| potion | 31 |
| magnet | 30 |
| jelly | 28 |
| shield | 24 |
| big | 24 |
| meteors | 22 |
| blackout | 22 |
| chicken | 19 |
| thorns | 19 |
| tiny | 19 |
| custard | 19 |
| disco | 19 |
| steve | 18 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 22 | 74 |
| boss | 32 | 153 |
| bounty | 8 | 24 |
| catapult | 9 | 35 |
| chicken | 19 | 88 |
| custard | 19 | 74 |
| disco | 19 | 45 |
| gust | 13 | 69 |
| jelly | 28 | 102 |
| meteors | 22 | 70 |
| slowmo | 13 | 22 |
| stampede | 11 | 54 |
| supply | 11 | 18 |
| tiny | 19 | 67 |
| trapdoor | 9 | 46 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 7 | 16.0 | 9.9 |
| spicy | pro | 1 | 26.0 | 13.0 |
| spicy | collector | 1 | 24.0 | 21.0 |
| spicy | parrier | 1 | 6.0 | 13.0 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | rusher | ended | 119s | Lady Bug 10 | 0 |
| kotp | frost | rusher | ended | 180s | You 34 | 0 |
| heist | factory | rusher | ended | 48s | Earl Grey 3 | 0 |
| race | dungeon | rusher | ended | 126s | Dame Crumpet 14 | 0 |
| hotpie | roof | rusher | ended | 72s | You 7 | 0 |
| flags | bog | rusher | ended | 96s | Sir Render 26 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| dungeon (920,640) | 3 |
| frost (840,600) | 2 |
| courtyard (1080,600) | 1 |
| courtyard (160,160) | 1 |
| courtyard (760,400) | 1 |
| courtyard (440,360) | 1 |
| courtyard (960,680) | 1 |
| courtyard (200,160) | 1 |

## Sim speed

Average 0.6s of CPU per 3-minute match (update only, no rendering).
