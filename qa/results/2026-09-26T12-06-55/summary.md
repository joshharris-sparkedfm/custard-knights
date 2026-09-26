# Custard Knights QA summary

108 simulated matches, 324 minutes of play, run 2026-09-26T12-06-55.

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
| sword | 1459 | 30% |
| peck | 801 | 16% |
| pit | 601 | 12% |
| heavy | 420 | 9% |
| bow | 357 | 7% |
| bomb | 335 | 7% |
| cannon | 232 | 5% |
| spike | 155 | 3% |
| bees | 89 | 2% |
| chickens | 77 | 2% |
| mine | 67 | 1% |
| stab | 57 | 1% |
| lava | 55 | 1% |
| hotpie | 54 | 1% |
| catapult | 50 | 1% |
| thorns | 29 | 1% |
| meteor | 25 | 1% |
| norr | 18 | 0% |
| steve | 15 | 0% |

## Combat feel

- Sword swings that connected: humans 25% of 3335, bots 43% of 13150
- Ranged shots that hit: humans 31% of 501, bots 46% of 4376
- Blocks (clangs): 1210; parries: 130; guard breaks: 36; dashes: 8613
- Heavy swings: 3631; dash-stabs: 479; shield bashes: 955; hits absorbed by spawn protection: 41
- Ring-outs (pit deaths credited to an attacker): 266 of 4896 KOs (5%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 9%

## Power-ups picked up

| power-up | pickups |
|---|---|
| banana | 134 |
| potion | 133 |
| shield | 133 |
| giant | 124 |
| mines | 122 |
| bees | 117 |
| ghost | 117 |
| speed | 111 |
| swap | 109 |
| heart | 107 |
| bouncy | 104 |
| thorns | 102 |
| big | 100 |
| magnet | 85 |
| norr | 83 |
| disco | 57 |
| jelly | 54 |
| chicken | 51 |
| boss | 47 |
| meteors | 46 |
| steve | 45 |
| custard | 44 |
| blackout | 44 |
| tiny | 40 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 44 | 122 |
| boss | 47 | 174 |
| bounty | 36 | 103 |
| catapult | 33 | 114 |
| chicken | 51 | 211 |
| custard | 44 | 133 |
| disco | 57 | 177 |
| gust | 30 | 100 |
| jelly | 54 | 152 |
| meteors | 46 | 187 |
| slowmo | 35 | 51 |
| stampede | 39 | 185 |
| supply | 30 | 39 |
| tiny | 40 | 103 |
| trapdoor | 32 | 111 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 36 | 11.9 | 9.1 |
| brutal | collector | 36 | 6.9 | 8.8 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | idle | ended | 37s | Squire Squish 4 | 0 |
| lks | courtyard | rusher | ended | 44s | Baron Von Bap 9 | 0 |
| lks | courtyard | collector | ended | 61s | Dame Crumpet 8 | 0 |
| lks | frost | idle | ended | 38s | Sir Prize 5 | 0 |
| lks | frost | rusher | ended | 29s | You 8 | 0 |
| lks | frost | collector | ended | 43s | Dame Crumpet 5 | 0 |
| lks | factory | idle | ended | 27s | Count Custard 4 | 0 |
| lks | factory | rusher | ended | 62s | You 13 | 0 |
| lks | factory | collector | ended | 54s | Sir Cumference 9 | 0 |
| lks | dungeon | idle | ended | 74s | Baron Von Bap 8 | 0 |
| lks | dungeon | rusher | ended | 32s | You 5 | 0 |
| lks | dungeon | collector | ended | 68s | Duchess Dumpling 9 | 0 |
| lks | roof | idle | ended | 180s | Lady Bug 4 | 0 |
| lks | roof | rusher | ended | 84s | You 14 | 0 |
| lks | roof | collector | ended | 137s | Earl Grey 4 | 0 |
| lks | bog | idle | ended | 38s | Sir Loin 5 | 0 |
| lks | bog | rusher | ended | 34s | Sir Prize 7 | 0 |
| lks | bog | collector | ended | 44s | Baron Von Bap 7 | 0 |
| kotp | courtyard | idle | ended | 180s | Sir Cumference 25 | 0 |
| kotp | courtyard | rusher | ended | 180s | You 37 | 0 |
| kotp | courtyard | collector | ended | 180s | You 28 | 0 |
| kotp | frost | idle | ended | 180s | Sir Prize 34 | 0 |
| kotp | frost | rusher | ended | 180s | You 44 | 0 |
| kotp | frost | collector | ended | 180s | Count Custard 23 | 0 |
| kotp | factory | idle | ended | 180s | Sir Prize 30 | 0 |
| kotp | factory | rusher | ended | 180s | You 35 | 0 |
| kotp | factory | collector | ended | 180s | You 34 | 0 |
| kotp | dungeon | idle | ended | 180s | Baron Von Bap 30 | 0 |
| kotp | dungeon | rusher | ended | 180s | You 32 | 0 |
| kotp | dungeon | collector | ended | 180s | Duchess Dumpling 20 | 0 |
| kotp | roof | idle | ended | 180s | Sir Prize 57 | 0 |
| kotp | roof | rusher | ended | 180s | You 27 | 0 |
| kotp | roof | collector | ended | 180s | Duchess Dumpling 21 | 0 |
| kotp | bog | idle | ended | 180s | Baron Von Bap 39 | 0 |
| kotp | bog | rusher | ended | 180s | You 37 | 0 |
| kotp | bog | collector | ended | 180s | You 29 | 0 |
| heist | courtyard | idle | ended | 56s | Baron Von Bap 3 | 0 |
| heist | courtyard | rusher | ended | 55s | Count Custard 2 | 0 |
| heist | courtyard | collector | ended | 50s | Sir Loin 2 | 0 |
| heist | frost | idle | ended | 180s | Earl Grey 0 | 0 |
| heist | frost | rusher | ended | 180s | Count Custard 2 | 0 |
| heist | frost | collector | ended | 180s | You 0 | 0 |
| heist | factory | idle | ended | 46s | Sir Prize 2 | 0 |
| heist | factory | rusher | ended | 42s | Sir Render 2 | 0 |
| heist | factory | collector | ended | 59s | Dame Crumpet 3 | 0 |
| heist | dungeon | idle | ended | 122s | Lord Nibbles 2 | 0 |
| heist | dungeon | rusher | ended | 158s | You 1 | 0 |
| heist | dungeon | collector | ended | 108s | Sir Render 2 | 0 |
| heist | roof | idle | ended | 180s | Sir Cumference 0 | 0 |
| heist | roof | rusher | ended | 180s | You 0 | 0 |
| heist | roof | collector | ended | 180s | You 0 | 0 |
| heist | bog | idle | ended | 77s | Sir Prize 2 | 0 |
| heist | bog | rusher | ended | 96s | Duchess Dumpling 3 | 0 |
| heist | bog | collector | ended | 39s | Lady Bug 2 | 0 |
| race | courtyard | idle | ended | 40s | Sir Prize 76 | 0 |
| race | courtyard | rusher | ended | 43s | Sir Cumference 73 | 0 |
| race | courtyard | collector | ended | 31s | Duchess Dumpling 85 | 0 |
| race | frost | idle | ended | 39s | Baron Von Bap 77 | 0 |
| race | frost | rusher | ended | 45s | Baron Von Bap 71 | 0 |
| race | frost | collector | ended | 42s | Count Custard 74 | 0 |
| race | factory | idle | ended | 56s | Sir Loin 60 | 0 |
| race | factory | rusher | ended | 61s | Squire Squish 55 | 0 |
| race | factory | collector | ended | 47s | Sir Cumference 69 | 0 |
| race | dungeon | idle | ended | 151s | Dame Crumpet 14 | 0 |
| race | dungeon | rusher | ended | 95s | Squire Squish 21 | 0 |
| race | dungeon | collector | ended | 180s | Sir Prize 10 | 0 |
| race | roof | idle | ended | 180s | Sir Loin 2 | 0 |
| race | roof | rusher | ended | 180s | Duchess Dumpling 7 | 0 |
| race | roof | collector | ended | 180s | Duchess Dumpling 2 | 0 |
| race | bog | idle | ended | 47s | Earl Grey 69 | 0 |
| race | bog | rusher | ended | 49s | Earl Grey 67 | 0 |
| race | bog | collector | ended | 43s | Sir Cumference 73 | 0 |
| hotpie | courtyard | idle | ended | 47s | Baron Von Bap 8 | 0 |
| hotpie | courtyard | rusher | ended | 62s | You 12 | 0 |
| hotpie | courtyard | collector | ended | 67s | You 11 | 0 |
| hotpie | frost | idle | ended | 50s | Lady Bug 7 | 0 |
| hotpie | frost | rusher | ended | 30s | You 7 | 0 |
| hotpie | frost | collector | ended | 46s | Sir Loin 5 | 0 |
| hotpie | factory | idle | ended | 48s | Baron Von Bap 5 | 0 |
| hotpie | factory | rusher | ended | 37s | You 5 | 0 |
| hotpie | factory | collector | ended | 54s | Sir Loin 8 | 0 |
| hotpie | dungeon | idle | ended | 49s | Squire Squish 7 | 0 |
| hotpie | dungeon | rusher | ended | 61s | You 10 | 0 |
| hotpie | dungeon | collector | ended | 46s | Earl Grey 5 | 0 |
| hotpie | roof | idle | ended | 88s | Sir Loin 3 | 0 |
| hotpie | roof | rusher | ended | 52s | You 8 | 0 |
| hotpie | roof | collector | ended | 88s | Count Custard 2 | 0 |
| hotpie | bog | idle | ended | 50s | Squire Squish 7 | 0 |
| hotpie | bog | rusher | ended | 46s | You 6 | 0 |
| hotpie | bog | collector | ended | 61s | Squire Squish 7 | 0 |
| flags | courtyard | idle | ended | 85s | Sir Prize 30 | 0 |
| flags | courtyard | rusher | ended | 88s | Sir Loin 30 | 0 |
| flags | courtyard | collector | ended | 129s | Sir Cumference 32 | 0 |
| flags | frost | idle | ended | 83s | Duchess Dumpling 32 | 0 |
| flags | frost | rusher | ended | 110s | Lord Nibbles 29 | 0 |
| flags | frost | collector | ended | 72s | Sir Render 32 | 0 |
| flags | factory | idle | ended | 97s | Sir Prize 29 | 0 |
| flags | factory | rusher | ended | 94s | Dame Crumpet 27 | 0 |
| flags | factory | collector | ended | 102s | Squire Squish 33 | 0 |
| flags | dungeon | idle | ended | 86s | Sir Cumference 34 | 0 |
| flags | dungeon | rusher | ended | 73s | You 31 | 0 |
| flags | dungeon | collector | ended | 82s | Duchess Dumpling 30 | 0 |
| flags | roof | idle | ended | 180s | Lord Nibbles 45 | 0 |
| flags | roof | rusher | ended | 111s | Duchess Dumpling 31 | 0 |
| flags | roof | collector | ended | 119s | Sir Loin 46 | 0 |
| flags | bog | idle | ended | 60s | Count Custard 32 | 0 |
| flags | bog | rusher | ended | 83s | Baron Von Bap 29 | 0 |
| flags | bog | collector | ended | 73s | Sir Prize 31 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| roof (120,400) | 5 |
| roof (720,160) | 4 |
| dungeon (560,280) | 3 |
| roof (800,560) | 3 |
| factory (520,240) | 3 |
| roof (720,200) | 3 |
| roof (1040,520) | 3 |
| roof (800,400) | 2 |

## Sim speed

Average 0.3s of CPU per 3-minute match (update only, no rendering).
