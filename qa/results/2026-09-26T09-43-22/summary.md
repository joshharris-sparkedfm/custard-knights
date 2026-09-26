# Custard Knights QA summary

90 simulated matches, 270 minutes of play, run 2026-09-26T09-43-22.

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
| sword | 1407 | 32% |
| peck | 851 | 19% |
| pit | 532 | 12% |
| heavy | 393 | 9% |
| bow | 236 | 5% |
| bomb | 229 | 5% |
| cannon | 181 | 4% |
| spike | 113 | 3% |
| bees | 72 | 2% |
| mine | 60 | 1% |
| chickens | 54 | 1% |
| catapult | 46 | 1% |
| lava | 44 | 1% |
| hotpie | 41 | 1% |
| thorns | 33 | 1% |
| stab | 32 | 1% |
| norr | 25 | 1% |
| meteor | 20 | 0% |
| steve | 12 | 0% |

## Combat feel

- Sword swings that connected: humans 30% of 2703, bots 46% of 11700
- Ranged shots that hit: humans 39% of 514, bots 46% of 3182
- Blocks (clangs): 974; parries: 169; guard breaks: 35; dashes: 6906
- Heavy swings: 3118; dash-stabs: 216; shield bashes: 947; hits absorbed by spawn protection: 21
- Ring-outs (pit deaths credited to an attacker): 259 of 4381 KOs (6%)
- Share of the match a human persona spent dead (deaths x 1.8s / match): 9%

## Power-ups picked up

| power-up | pickups |
|---|---|
| giant | 129 |
| bouncy | 111 |
| mines | 108 |
| ghost | 106 |
| bees | 104 |
| shield | 101 |
| thorns | 97 |
| swap | 92 |
| potion | 86 |
| magnet | 85 |
| speed | 84 |
| heart | 81 |
| big | 81 |
| banana | 79 |
| norr | 73 |
| blackout | 48 |
| boss | 46 |
| disco | 41 |
| tiny | 40 |
| jelly | 40 |
| chicken | 39 |
| meteors | 38 |
| custard | 34 |
| steve | 31 |

## Events fired and KOs during them

| event | times | KOs while active |
|---|---|---|
| blackout | 48 | 126 |
| boss | 46 | 192 |
| bounty | 33 | 99 |
| catapult | 34 | 129 |
| chicken | 39 | 168 |
| custard | 34 | 112 |
| disco | 41 | 165 |
| gust | 27 | 100 |
| jelly | 40 | 115 |
| meteors | 38 | 145 |
| slowmo | 22 | 28 |
| stampede | 30 | 123 |
| supply | 31 | 41 |
| tiny | 40 | 117 |
| trapdoor | 21 | 100 |

## Difficulty

| bots | persona | matches | KOs | deaths |
|---|---|---|---|---|
| spicy | rusher | 30 | 11.4 | 9.4 |
| brutal | collector | 30 | 5.9 | 9.5 |

## Modes

Every mode must end on its own with no errors.

| mode | arena | persona | result | length | leader | errors |
|---|---|---|---|---|---|---|
| lks | courtyard | idle | ended | 54s | Earl Grey 8 | 0 |
| lks | courtyard | rusher | ended | 28s | You 4 | 0 |
| lks | courtyard | collector | ended | 49s | Count Custard 6 | 0 |
| lks | frost | idle | ended | 71s | Lord Nibbles 8 | 0 |
| lks | frost | rusher | ended | 39s | You 6 | 0 |
| lks | frost | collector | ended | 49s | Sir Cumference 6 | 0 |
| lks | factory | idle | ended | 32s | Duchess Dumpling 7 | 0 |
| lks | factory | rusher | ended | 38s | Earl Grey 6 | 0 |
| lks | factory | collector | ended | 37s | Sir Cumference 6 | 0 |
| lks | dungeon | idle | ended | 61s | Sir Cumference 6 | 0 |
| lks | dungeon | rusher | ended | 39s | You 13 | 0 |
| lks | dungeon | collector | ended | 41s | Sir Prize 6 | 0 |
| lks | roof | idle | ended | 132s | Lord Nibbles 5 | 0 |
| lks | roof | rusher | ended | 66s | You 8 | 0 |
| lks | roof | collector | ended | 180s | Count Custard 5 | 0 |
| lks | bog | idle | ended | 58s | Sir Loin 6 | 0 |
| lks | bog | rusher | ended | 29s | You 9 | 0 |
| lks | bog | collector | ended | 76s | Earl Grey 11 | 0 |
| kotp | courtyard | idle | ended | 180s | Baron Von Bap 32 | 0 |
| kotp | courtyard | rusher | ended | 180s | You 48 | 0 |
| kotp | courtyard | collector | ended | 180s | You 25 | 0 |
| kotp | frost | idle | ended | 180s | Sir Loin 47 | 0 |
| kotp | frost | rusher | ended | 180s | Sir Loin 37 | 0 |
| kotp | frost | collector | ended | 180s | Lady Bug 21 | 0 |
| kotp | factory | idle | ended | 180s | Squire Squish 28 | 0 |
| kotp | factory | rusher | ended | 180s | You 34 | 0 |
| kotp | factory | collector | ended | 180s | Sir Render 32 | 0 |
| kotp | dungeon | idle | ended | 180s | Baron Von Bap 24 | 0 |
| kotp | dungeon | rusher | ended | 180s | You 37 | 0 |
| kotp | dungeon | collector | ended | 180s | You 33 | 0 |
| kotp | roof | idle | ended | 180s | Sir Cumference 56 | 0 |
| kotp | roof | rusher | ended | 180s | You 36 | 0 |
| kotp | roof | collector | ended | 180s | Squire Squish 33 | 0 |
| kotp | bog | idle | ended | 180s | Sir Cumference 32 | 0 |
| kotp | bog | rusher | ended | 180s | You 44 | 0 |
| kotp | bog | collector | ended | 180s | You 33 | 0 |
| heist | courtyard | idle | ended | 42s | Sir Prize 2 | 0 |
| heist | courtyard | rusher | ended | 116s | Lord Nibbles 2 | 0 |
| heist | courtyard | collector | ended | 110s | Lord Nibbles 2 | 0 |
| heist | frost | idle | ended | 180s | Sir Prize 1 | 0 |
| heist | frost | rusher | ended | 180s | You 0 | 0 |
| heist | frost | collector | ended | 180s | You 1 | 0 |
| heist | factory | idle | ended | 84s | Duchess Dumpling 2 | 0 |
| heist | factory | rusher | ended | 104s | Sir Cumference 3 | 0 |
| heist | factory | collector | ended | 58s | Sir Render 2 | 0 |
| heist | dungeon | idle | ended | 65s | Sir Render 2 | 0 |
| heist | dungeon | rusher | ended | 102s | Lord Nibbles 2 | 0 |
| heist | dungeon | collector | ended | 68s | Sir Cumference 3 | 0 |
| heist | roof | idle | ended | 180s | Sir Prize 0 | 0 |
| heist | roof | rusher | ended | 180s | You 0 | 0 |
| heist | roof | collector | ended | 180s | You 0 | 0 |
| heist | bog | idle | ended | 63s | Sir Render 2 | 0 |
| heist | bog | rusher | ended | 100s | Earl Grey 2 | 0 |
| heist | bog | collector | ended | 75s | Sir Cumference 3 | 0 |
| race | courtyard | idle | ended | 36s | Earl Grey 80 | 0 |
| race | courtyard | rusher | ended | 38s | Count Custard 78 | 0 |
| race | courtyard | collector | ended | 33s | Duchess Dumpling 84 | 0 |
| race | frost | idle | ended | 42s | Dame Crumpet 74 | 0 |
| race | frost | rusher | ended | 49s | Baron Von Bap 67 | 0 |
| race | frost | collector | ended | 38s | Squire Squish 78 | 0 |
| race | factory | idle | ended | 63s | Sir Loin 53 | 0 |
| race | factory | rusher | ended | 46s | Squire Squish 70 | 0 |
| race | factory | collector | ended | 47s | Duchess Dumpling 69 | 0 |
| race | dungeon | idle | ended | 89s | Sir Prize 27 | 0 |
| race | dungeon | rusher | ended | 119s | Sir Render 14 | 0 |
| race | dungeon | collector | ended | 180s | Sir Render 9 | 0 |
| race | roof | idle | ended | 142s | Sir Loin 10 | 0 |
| race | roof | rusher | ended | 180s | Count Custard 7 | 0 |
| race | roof | collector | ended | 180s | Baron Von Bap 5 | 0 |
| race | bog | idle | ended | 53s | Sir Prize 63 | 0 |
| race | bog | rusher | ended | 50s | Baron Von Bap 66 | 0 |
| race | bog | collector | ended | 43s | Squire Squish 73 | 0 |
| hotpie | courtyard | idle | ended | 49s | Dame Crumpet 7 | 0 |
| hotpie | courtyard | rusher | ended | 54s | You 15 | 0 |
| hotpie | courtyard | collector | ended | 88s | You 8 | 0 |
| hotpie | frost | idle | ended | 57s | Lady Bug 6 | 0 |
| hotpie | frost | rusher | ended | 41s | You 11 | 0 |
| hotpie | frost | collector | ended | 39s | Dame Crumpet 5 | 0 |
| hotpie | factory | idle | ended | 46s | Sir Render 5 | 0 |
| hotpie | factory | rusher | ended | 50s | You 11 | 0 |
| hotpie | factory | collector | ended | 46s | Sir Prize 5 | 0 |
| hotpie | dungeon | idle | ended | 44s | Baron Von Bap 5 | 0 |
| hotpie | dungeon | rusher | ended | 61s | You 14 | 0 |
| hotpie | dungeon | collector | ended | 61s | You 6 | 0 |
| hotpie | roof | idle | ended | 81s | Count Custard 3 | 0 |
| hotpie | roof | rusher | ended | 38s | You 6 | 0 |
| hotpie | roof | collector | ended | 80s | Sir Render 4 | 0 |
| hotpie | bog | idle | ended | 48s | Lord Nibbles 9 | 0 |
| hotpie | bog | rusher | ended | 35s | Sir Render 7 | 0 |
| hotpie | bog | collector | ended | 61s | Baron Von Bap 9 | 0 |

## Spawn-death hot spots (top 8)

| arena and tile | spawn deaths |
|---|---|
| roof (1160,480) | 7 |
| roof (520,440) | 6 |
| roof (200,240) | 4 |
| frost (840,160) | 4 |
| roof (720,200) | 4 |
| frost (920,200) | 3 |
| roof (1120,600) | 3 |
| bog (800,400) | 3 |

## Sim speed

Average 0.3s of CPU per 3-minute match (update only, no rendering).
