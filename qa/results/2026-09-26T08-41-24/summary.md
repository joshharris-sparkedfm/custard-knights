# Custard Knights QA summary

72 simulated matches, 216 minutes of play, run 2026-09-26T08-41-24.

## Crashes and errors

None.

## Personas (spicy bots, free-for-all)

How each scripted player type fares against the bots. Rank is out of 8. "Spawn deaths" is the share of the persona's deaths that came within 3 seconds of respawning.

| persona | matches | KOs | deaths | avg rank | spawn deaths | median life |
|---|---|---|---|---|---|---|
| rusher | 0 | NaN | NaN | NaN | - | 0.0s |
| collector | 0 | NaN | NaN | NaN | - | 0.0s |

## Arenas

KOs per minute is pace. Hazard share is KOs from pits, spikes, lava, chickens, meteors and the catapult. Respawn distance is the median distance to the nearest enemy at the moment of respawn (a knight is about 44px wide).

| arena | matches | KOs/min | hazard share | spawn deaths | respawn distance | top KO sources |
|---|---|---|---|---|---|---|


## What actually kills people

| source | KOs | share |
|---|---|---|
| sword | 1228 | 30% |
| pit | 975 | 24% |
| peck | 486 | 12% |
| heavy | 289 | 7% |
| bomb | 282 | 7% |
| bow | 248 | 6% |
| cannon | 141 | 3% |
| lava | 91 | 2% |
| mine | 65 | 2% |
| spike | 63 | 2% |
| bees | 59 | 1% |
| catapult | 47 | 1% |
| chickens | 36 | 1% |
| thorns | 28 | 1% |
| stab | 23 | 1% |
| norr | 16 | 0% |
| meteor | 10 | 0% |
| steve | 8 | 0% |

## Combat feel

- Sword swings that connected: humans 42% of 2112, bots 46% of 10173
- Ranged shots that hit: humans 36% of 341, bots 39% of 3593
- Blocks (clangs): 1053; parries: 168; guard breaks: 41; dashes: 4857
- Heavy swings: 2606; dash-stabs: 207; shield bashes: 855; hits absorbed by spawn protection: 18
- Ring-outs (pit deaths credited to an attacker): 418 of 4095 KOs (10%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 9%

## Power-ups picked up

| power-up | pickups |
|---|---|
| mines | 94 |
| bouncy | 93 |
| banana | 87 |
| swap | 85 |
| heart | 84 |
| bees | 84 |
| magnet | 82 |
| shield | 81 |
| speed | 80 |
| giant | 78 |
| thorns | 78 |
| big | 68 |
| ghost | 65 |
| norr | 48 |
| boss | 41 |
| disco | 39 |
| blackout | 34 |
| custard | 33 |
| chicken | 33 |
| meteors | 33 |
| jelly | 29 |
| tiny | 25 |
| steve | 21 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 34 | 99 |
| boss | 41 | 226 |
| bounty | 13 | 58 |
| catapult | 27 | 127 |
| chicken | 33 | 177 |
| custard | 33 | 115 |
| disco | 39 | 136 |
| gust | 20 | 92 |
| jelly | 29 | 104 |
| meteors | 33 | 121 |
| slowmo | 18 | 33 |
| stampede | 19 | 116 |
| supply | 16 | 27 |
| tiny | 25 | 77 |
| trapdoor | 14 | 77 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 24 | 12.3 | 9.2 |
| brutal | collector | 24 | 6.0 | 9.1 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | idle | ended | 38s | Dame Crumpet 7 | 0 |
| lks | courtyard | rusher | ended | 62s | Duchess Dumpling 9 | 0 |
| lks | courtyard | collector | ended | 34s | You 6 | 0 |
| lks | frost | idle | ended | 23s | Count Custard 5 | 0 |
| lks | frost | rusher | ended | 32s | You 5 | 0 |
| lks | frost | collector | ended | 27s | Earl Grey 4 | 0 |
| lks | factory | idle | ended | 41s | Lady Bug 6 | 0 |
| lks | factory | rusher | ended | 34s | You 5 | 0 |
| lks | factory | collector | ended | 46s | Dame Crumpet 8 | 0 |
| lks | dungeon | idle | ended | 50s | Count Custard 11 | 0 |
| lks | dungeon | rusher | ended | 56s | You 21 | 0 |
| lks | dungeon | collector | ended | 42s | You 5 | 0 |
| lks | roof | idle | ended | 26s | Lady Bug 4 | 0 |
| lks | roof | rusher | ended | 24s | You 5 | 0 |
| lks | roof | collector | ended | 33s | Squire Squish 7 | 0 |
| lks | bog | idle | ended | 36s | Duchess Dumpling 7 | 0 |
| lks | bog | rusher | ended | 75s | You 20 | 0 |
| lks | bog | collector | ended | 39s | Sir Render 5 | 0 |
| kotp | courtyard | idle | ended | 180s | Sir Loin 32 | 0 |
| kotp | courtyard | rusher | ended | 180s | You 40 | 0 |
| kotp | courtyard | collector | ended | 180s | Dame Crumpet 30 | 0 |
| kotp | frost | idle | ended | 180s | Sir Loin 23 | 0 |
| kotp | frost | rusher | ended | 180s | You 32 | 0 |
| kotp | frost | collector | ended | 180s | Baron Von Bap 22 | 0 |
| kotp | factory | idle | ended | 180s | Sir Cumference 25 | 0 |
| kotp | factory | rusher | ended | 180s | You 49 | 0 |
| kotp | factory | collector | ended | 180s | Squire Squish 28 | 0 |
| kotp | dungeon | idle | ended | 180s | Sir Prize 28 | 0 |
| kotp | dungeon | rusher | ended | 180s | You 41 | 0 |
| kotp | dungeon | collector | ended | 180s | Count Custard 31 | 0 |
| kotp | roof | idle | ended | 180s | Sir Render 30 | 0 |
| kotp | roof | rusher | ended | 180s | You 34 | 0 |
| kotp | roof | collector | ended | 180s | Sir Render 23 | 0 |
| kotp | bog | idle | ended | 180s | Squire Squish 28 | 0 |
| kotp | bog | rusher | ended | 180s | You 37 | 0 |
| kotp | bog | collector | ended | 180s | You 31 | 0 |
| heist | courtyard | idle | ended | 86s | Duchess Dumpling 3 | 0 |
| heist | courtyard | rusher | ended | 63s | Count Custard 2 | 0 |
| heist | courtyard | collector | ended | 91s | Count Custard 2 | 0 |
| heist | frost | idle | ended | 64s | Count Custard 1 | 0 |
| heist | frost | rusher | ended | 100s | Squire Squish 2 | 0 |
| heist | frost | collector | ended | 42s | Sir Cumference 2 | 0 |
| heist | factory | idle | ended | 38s | Duchess Dumpling 2 | 0 |
| heist | factory | rusher | ended | 69s | Sir Prize 2 | 0 |
| heist | factory | collector | ended | 65s | Sir Cumference 3 | 0 |
| heist | dungeon | idle | ended | 40s | Sir Cumference 1 | 0 |
| heist | dungeon | rusher | ended | 99s | Lady Bug 2 | 0 |
| heist | dungeon | collector | ended | 43s | Earl Grey 3 | 0 |
| heist | roof | idle | ended | 41s | Duchess Dumpling 2 | 0 |
| heist | roof | rusher | ended | 48s | Sir Loin 2 | 0 |
| heist | roof | collector | ended | 37s | Baron Von Bap 2 | 0 |
| heist | bog | idle | ended | 40s | Sir Cumference 2 | 0 |
| heist | bog | rusher | ended | 66s | Sir Cumference 2 | 0 |
| heist | bog | collector | ended | 46s | Squire Squish 2 | 0 |
| race | courtyard | idle | ended | 29s | Sir Render 83 | 0 |
| race | courtyard | rusher | ended | 28s | Dame Crumpet 84 | 0 |
| race | courtyard | collector | ended | 24s | Sir Cumference 88 | 0 |
| race | frost | idle | ended | 30s | Sir Prize 82 | 0 |
| race | frost | rusher | ended | 30s | Sir Cumference 82 | 0 |
| race | frost | collector | ended | 28s | Count Custard 84 | 0 |
| race | factory | idle | ended | 30s | Earl Grey 82 | 0 |
| race | factory | rusher | ended | 38s | Sir Cumference 74 | 0 |
| race | factory | collector | ended | 31s | Sir Cumference 81 | 0 |
| race | dungeon | idle | ended | 27s | Lord Nibbles 85 | 0 |
| race | dungeon | rusher | ended | 31s | Earl Grey 81 | 0 |
| race | dungeon | collector | ended | 26s | Dame Crumpet 86 | 0 |
| race | roof | idle | ended | 42s | Earl Grey 70 | 0 |
| race | roof | rusher | ended | 52s | Baron Von Bap 60 | 0 |
| race | roof | collector | ended | 43s | Sir Prize 69 | 0 |
| race | bog | idle | ended | 29s | Dame Crumpet 83 | 0 |
| race | bog | rusher | ended | 35s | Earl Grey 77 | 0 |
| race | bog | collector | ended | 27s | Count Custard 85 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| frost (520,320) | 5 |
| frost (560,320) | 4 |
| frost (800,160) | 4 |
| factory (560,200) | 4 |
| frost (160,360) | 3 |
| dungeon (840,440) | 3 |
| roof (1120,240) | 3 |
| bog (840,560) | 3 |

## Sim speed

Average 0.2s of CPU per 3-minute match (update only, no rendering).
