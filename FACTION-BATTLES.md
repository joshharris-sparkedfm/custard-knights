# Faction battles: implementation brief

9 October 2026. User-requested expansion alongside the existing arena and story modes. This document separates intended experience from release acceptance; it is not a claim that public 100-human matches have been proved.

## The experience

Custardia and the Rice Pudding Kingdom fight across a broad battlefield with a castle at each end. Start with symmetric faction mechanics and different colours, banners and fiction so choosing a favourite faction does not impose a statistical handicap. The Angelic Delight Empire can become a later faction once the two-team game is stable.

Offer **4v4, 20v20 and 50v50**. These describe total slots, including bots. In a 50v50 room with 50 humans connected, aim for 25 humans and 25 bots on each side. Fill vacancies immediately; a disconnect should not turn a balanced match into a permanent numbers disadvantage. Humans replace bot slots at a safe spawn, not by possessing a vulnerable bot mid-duel. Never switch a living human's faction without an explicit rule and clear communication.

Balance human counts first, then estimated skill. Bots should use team-level skill targets with bounded variation, not perfect reactions that invisibly counter a winning player. Local practice difficulty is a player choice. Online skill must be a server-owned estimate; clients must not be allowed to submit their own trusted rank. Party-aware assignment and trustworthy account ratings are later acceptance requirements for serious matchmaking.

| Mode | Main objective | Why play it |
|---|---|---|
| Faction Brawl | Score team eliminations before the score/time limit | Immediate large-scale combat without an objective tutorial |
| Capture the Flag | Bring the enemy flag home while defending your own | Raiders, escorts, interceptors and a reason to split up |
| Castle Siege | Break the enemy defences and defeat its castle objective | Front lines, defence, flanking and support roles |

The castle map needs at least a main approach and flank routes, protected rear spawns, clear team landmarks, and a central area that creates meaningful contest. Use a player-following camera and minimap; fitting 100 knights into the old 1280×800 arena would make individual decisions unreadable.

| Role | Purpose | Necessary tradeoff |
|---|---|---|
| Vanguard | Hold space, protect allies, lead a push | Shorter effective range |
| Ranger | Support at range and punish exposed approaches | Vulnerable when rushed; bounded firing rate |
| Engineer | Contribute to siege and objectives | Must commit to a position/action rather than deal best duel damage |
| Support | Help nearby allies sustain a push | Limited support cadence; cannot stack infinite healing |

Make roles free and available at match start/respawn. Earned cosmetics and story ownership must not buy combat power. Score objective and support contribution so rankings do not teach everybody to ignore the flag.

## Why the old online room cannot simply become 100 players

The audited original game creates exactly eight entities, assigns teams in groups of four, rejects network setups whose entity array is not length eight, and fits a fixed 32×18 tile arena to one shared view. It also uses global hitstop and broadcasts full snapshots to each guest. Raising a lobby limit alone would leave these assumptions broken.

A synthetic snapshot diagnostic measured the JSON representation of the old snapshot schema at 1,122 bytes for eight quiet entities and 10,412 bytes for 100. At 20 snapshots/second, sending that 100-entity representation to 99 guests would be about 164.9 Mbit/s of host application payload; to seven guests about 11.7 Mbit/s. These are arithmetic estimates, not measured PeerJS wire traffic: binary serialization, active projectiles/events, transport overhead, compression and packet cadence change the actual value. No 100-player connection or frame-rate claim follows from this diagnostic.

[PeerJS documentation](https://peerjs.com/client/faq) explains that peer data travels directly between participants and is limited by their connections. [Glenn Fiedler's snapshot compression article](https://gafferongames.com/post/snapshot_compression/) describes reducing repeated state and encoding deltas against acknowledged baselines. [Photon's topology documentation](https://doc.photonengine.com/fusion/v2/fusion-choose) illustrates the distinction between a player host and a dedicated authoritative server. These inform the architecture; they are not a recommendation to migrate the game to Unity or buy Photon.

## Implementation and validation sequence

1. Isolated authoritative simulation with deterministic bots, team slots, objective rules and bounded attacks. Keep existing eight-knight modes, story and saves intact.
2. Playable local practice at each size using the accepted knight art, a larger camera/map and clear role/objective controls.
3. Authoritative server and real client connections, disconnect recovery, input validation and bounded queues. This is private test infrastructure until deployment and abuse controls are reviewed.
4. Test bot population at 8, 40 and 100 with worst-case crowding, projectiles and effects. Record simulation and rendered frame times separately on named hardware; do not infer minimum specs from this developer PC.
5. Test clients under latency/loss, including remote aim, parry/collision consistency, reconnects, final results and human/bot replacement. Add spatial filtering and delta snapshots where measurements require them.
6. Run actual human sessions to tune spawn travel, stalemates, flag returns, castle pacing, support contribution and role counters. Population alone is not evidence of fun.
7. Add authenticated persistent competitive ratings and matchmaking only when results are authoritative and bot participation cannot farm rank. A session scoreboard is useful but must not be presented as a global competitive ladder.

Current work is a private playable expansion. The accepted 0.2.2 ZIP, story and current promotional video remain distinct until a new package and refreshed capture have passed their own checks. Any new trailer must show actual implemented play and label bots honestly; it must not imply a successful public 100-human test.

## Retained simulation acceptance: 9 October 2026

The isolated core passed **23/23 tests**, covering full rosters at 4v4/20v20/50v50, balanced human joins and bot refill, trusted-rating adaptation, deterministic inputs, directional contact, timed parry, stun/dash restrictions, simultaneous-hit fairness, role abilities, flag recovery/capture, castle destruction, timer results and simultaneous-result draws. Guard energy is for blocking; ordinary attacks and dash retain their own timing/cooldown constraints without an added stamina cost. Faction light attacks deliberately use 160 ms startup, 120 ms contact and 240 ms recovery for crowd readability; this is not a claim of exact parity with arena combat.

A separate hidden Node v24.19.0 child process completed **nine 100-bot matches** on seeds 123, 987 and 456, with actual exit code 0 and empty stderr. All three brawls reached their score limit in 124–132 simulated seconds. All three CTF matches ended 3–2 in 126–284 seconds. Two siege matches ended by castle destruction in 94 and 181 seconds; the third reached the 600-second limit with both castles damaged. Dedicated objective squads now continue their flank approaches instead of every bot abandoning objectives to fight in the centre.

The exact audited core SHA-256 is `796475c3d6c29406f96e8b1e103465b95621bf96e788843c4f0371e3038f6d3a`. Retained measurements, exit status, small stdout transcript and limitations are in [qa/results/mass-battle-objectives](qa/results/mass-battle-objectives/README.md). Mean simulation-step cost was 0.02154–0.03034 ms, excluding rendering/serialization/networking, on the development machine. These are simulation checks, not proof of human enjoyment, faction balance, minimum hardware, public online capacity or a trustworthy competitive ladder. Earlier inline tool sessions were interrupted; the retained detached run completed, and no root cause for the earlier interruptions was established.

A subsequent cosmetic-only amendment preserves independent open/closed visor choices in shared snapshots. The amended core (`1e08cc3c46fa360d32592315fe1d3470a998f5580cd31baab7f32ac15e9fedfd`) passed **24/24 tests**, including the visor checks and existing objective regressions. The retained nine-match audit remains explicitly tied to the preceding hash; its snapshot byte counts exclude this added visor field.
