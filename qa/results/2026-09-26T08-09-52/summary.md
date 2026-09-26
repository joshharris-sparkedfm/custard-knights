# Custard Knights QA summary

55 simulated matches, 165 minutes of play, run 2026-09-26T08-09-52.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 6 | 35.0 | 25.5 | 2.2 | 24% | 4.4s |
| camper | 6 | 7.8 | 17.5 | 7.7 | 31% | 4.7s |
| collector | 6 | 21.3 | 23.0 | 2.3 | 33% | 4.9s |
| pacifist | 6 | 0.7 | 11.5 | 8.0 | 12% | 9.7s |
| fuzzer | 6 | 3.2 | 17.8 | 8.0 | 20% | 5.1s |
| idle | 6 | 0.0 | 13.2 | 8.0 | 4% | 9.5s |
| pro | 6 | 30.8 | 24.8 | 2.2 | 34% | 4.5s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|
| courtyard | 8 | 45.6 | 4% | 7% | 416px | sword 61%, bomb 12%, bow 8%, bees 6% |
| frost | 8 | 48.0 | 22% | 6% | 386px | sword 52%, pit 19%, bomb 9%, bow 6% |
| factory | 8 | 45.3 | 7% | 6% | 441px | sword 59%, bomb 13%, bow 8%, cannon 5% |
| dungeon | 8 | 48.5 | 15% | 9% | 414px | sword 53%, lava 12%, bomb 11%, bees 8% |
| roof | 8 | 62.5 | 62% | 25% | 502px | pit 60%, sword 21%, bomb 6%, bees 4% |
| bog | 8 | 42.4 | 4% | 6% | 472px | sword 51%, bomb 17%, cannon 8%, bow 8% |

## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 3947 | 49% |
| pit | 1248 | 16% |
| bomb | 852 | 11% |
| bow | 515 | 6% |
| bees | 467 | 6% |
| cannon | 348 | 4% |
| mine | 146 | 2% |
| lava | 142 | 2% |
| spike | 82 | 1% |
| chickens | 58 | 1% |
| norr | 57 | 1% |
| catapult | 55 | 1% |
| meteor | 46 | 1% |
| thorns | 35 | 0% |
| steve | 11 | 0% |

## Combat feel

- Sword swings that connected: humans 48% of 3214, bots 81% of 12449
- Ranged shots that hit: humans 33% of 468, bots 41% of 7048
- Blocks (clangs): 1614; dashes: 5619

## Power-ups picked up

| power-up | pickups |
|---|---|
| ghost | 183 |
| giant | 180 |
| bees | 171 |
| banana | 170 |
| swap | 162 |
| mines | 158 |
| bouncy | 153 |
| heart | 124 |
| shield | 118 |
| speed | 111 |
| big | 109 |
| norr | 107 |
| thorns | 106 |
| magnet | 99 |
| meteors | 77 |
| custard | 72 |
| boss | 71 |
| disco | 68 |
| blackout | 67 |
| swapparty | 66 |
| chicken | 60 |
| jelly | 59 |
| tiny | 55 |
| steve | 55 |
| mirror | 47 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 67 | 238 |
| boss | 71 | 371 |
| bounty | 28 | 122 |
| catapult | 25 | 119 |
| chicken | 60 | 178 |
| custard | 72 | 321 |
| disco | 68 | 219 |
| gust | 41 | 221 |
| jelly | 59 | 207 |
| meteors | 77 | 323 |
| mirror | 47 | 127 |
| slowmo | 32 | 70 |
| stampede | 29 | 200 |
| supply | 39 | 63 |
| swapparty | 66 | 197 |
| tiny | 55 | 209 |
| trapdoor | 26 | 195 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| chill | rusher | 1 | 46.0 | 13.0 |
| chill | pro | 1 | 53.0 | 13.0 |
| spicy | rusher | 6 | 35.0 | 25.5 |
| spicy | pro | 6 | 30.8 | 24.8 |
| spicy | collector | 6 | 21.3 | 23.0 |
| brutal | rusher | 1 | 29.0 | 25.0 |
| brutal | pro | 1 | 20.0 | 22.0 |
| brutal | collector | 1 | 23.0 | 21.0 |

## Teams

- frost with pro: red 40, blue 44
- factory with rusher: red 53, blue 47

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| roof (1240,280) | 15 |
| roof (1200,600) | 14 |
| roof (320,760) | 13 |
| roof (120,240) | 10 |
| roof (160,240) | 9 |
| roof (1080,600) | 6 |
| roof (280,640) | 6 |
| roof (120,600) | 6 |

## Sim speed

Average 0.4s of CPU per 3-minute match (update only, no rendering).
