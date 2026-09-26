# Custard Knights QA summary

55 simulated matches, 165 minutes of play, run 2026-09-26T08-23-56.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 23.5 | 23.5 | 1.7 | 11% | 5.0s |
| camper | 6 | 1.7 | 13.0 | 7.7 | 19% | 6.4s |
| collector | 6 | 19.0 | 24.5 | 3.5 | 15% | 4.5s |
| pacifist | 6 | 0.0 | 8.0 | 8.0 | 2% | 13.8s |
| fuzzer | 6 | 2.7 | 15.8 | 8.0 | 3% | 7.8s |
| idle | 6 | 0.0 | 11.0 | 8.0 | 0% | 8.1s |
| pro | 6 | 27.0 | 20.0 | 1.0 | 13% | 5.4s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 8 | 36.8 | 5% | 2% | 481px | sword 46%, bomb 13%, bow 11%, cannon 9% |
| frost | 8 | 47.2 | 45% | 6% | 436px | pit 43%, sword 32%, bomb 6%, heavy 6% |
| factory | 8 | 43.8 | 21% | 3% | 492px | sword 42%, pit 15%, bow 9%, bomb 9% |
| dungeon | 8 | 43.4 | 27% | 4% | 451px | sword 38%, lava 22%, bow 9%, bomb 8% |
| roof | 8 | 53.5 | 61% | 8% | 452px | pit 60%, sword 23%, bow 4%, bomb 3% |
| bog | 8 | 41.5 | 30% | 6% | 478px | sword 35%, pit 27%, bomb 9%, bow 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 2529 | 35% |
| pit | 1810 | 25% |
| bomb | 575 | 8% |
| bow | 523 | 7% |
| heavy | 441 | 6% |
| cannon | 406 | 6% |
| lava | 226 | 3% |
| bees | 181 | 3% |
| mine | 118 | 2% |
| spike | 103 | 1% |
| chickens | 69 | 1% |
| catapult | 48 | 1% |
| thorns | 42 | 1% |
| stab | 41 | 1% |
| meteor | 36 | 1% |
| norr | 31 | 0% |
| steve | 11 | 0% |
| bash | 1 | 0% |

## Combat feel

- Sword swings that connected: humans 52% of 2430, bots 52% of 16789
- Ranged shots that hit: humans 37% of 479, bots 41% of 8078
- Blocks (clangs): 1434; parries: 231; guard breaks: 38; dashes: 6066
- Heavy swings: 3477; dash-stabs: 228; shield bashes: 1194; hits absorbed by spawn protection: 16
- Ring-outs (pit deaths credited to an attacker): 879 of 7191 KOs (12%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 17%

## Power-ups picked up

| power-up | pickups |
|---|---|
| swap | 185 |
| ghost | 181 |
| banana | 176 |
| bouncy | 170 |
| bees | 170 |
| giant | 168 |
| mines | 165 |
| magnet | 118 |
| speed | 115 |
| shield | 112 |
| big | 111 |
| thorns | 107 |
| heart | 106 |
| norr | 97 |
| jelly | 92 |
| blackout | 84 |
| custard | 81 |
| boss | 79 |
| tiny | 78 |
| meteors | 78 |
| chicken | 70 |
| disco | 63 |
| steve | 55 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 84 | 262 |
| boss | 79 | 361 |
| bounty | 34 | 167 |
| catapult | 40 | 170 |
| chicken | 70 | 188 |
| custard | 81 | 334 |
| disco | 63 | 210 |
| gust | 28 | 152 |
| jelly | 92 | 344 |
| meteors | 78 | 283 |
| slowmo | 27 | 51 |
| stampede | 26 | 167 |
| supply | 29 | 51 |
| tiny | 78 | 257 |
| trapdoor | 37 | 283 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 1 | 24.0 | 11.0 |
| chill | pro | 1 | 25.0 | 11.0 |
| spicy | rusher | 6 | 23.5 | 23.5 |
| spicy | pro | 6 | 27.0 | 20.0 |
| spicy | collector | 6 | 19.0 | 24.5 |
| brutal | rusher | 1 | 34.0 | 21.0 |
| brutal | pro | 1 | 17.0 | 15.0 |
| brutal | collector | 1 | 8.0 | 16.0 |

## Teams

- frost with pro: red 51, blue 41
- factory with rusher: red 68, blue 52

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (720,320) | 4 |
| frost (560,560) | 4 |
| roof (360,400) | 4 |
| bog (440,360) | 4 |
| frost (720,560) | 3 |
| frost (560,600) | 3 |
| frost (720,600) | 3 |
| factory (560,680) | 3 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
