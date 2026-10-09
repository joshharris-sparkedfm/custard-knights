# Authoritative faction battle server

Implemented 9 October 2026. This is an independently runnable Node server for the new faction battle simulation. It supports 4v4, 20v20 and 50v50 room capacities, human participants replacing bots, and Brawl, Capture the Flag and Castle Siege. It does not route these battles through the existing four-seat PeerJS arena protocol.

## Run locally

Use Node 22 or later and the repository's locked dependencies (`ws` 8.22.0). The integration suite was run with Node 22.23.1 on Windows.

```powershell
npm ci
node server/mass-battle-server.cjs
```

Default endpoint: `ws://127.0.0.1:8787/battle`. `/` also accepts WebSocket upgrades. `GET http://127.0.0.1:8787/health` reports protocol, connection/room counts and whether the server is ranked. All other HTTP paths return 404; the server does not expose repository files or serve the game.

To deliberately accept network connections, set `CK_BATTLE_HOST` to an appropriate interface. `CK_BATTLE_PORT` changes the port. `CK_BATTLE_ORIGINS` is a comma-separated exact list of allowed browser Origins. A configured list replaces the development defaults; include `null` explicitly if a packaged/file client should connect. This list is a browser cross-site guard, **not authentication**: native clients can omit or forge Origin.

Without a configured list, localhost HTTP/HTTPS origins, file-based `null` origins and clients without an Origin are permitted. The default loopback binding keeps the service local. The implementation does not open firewall rules, deploy cloud infrastructure or provision certificates. A remotely hosted service needs a TLS reverse proxy (`wss://`), explicit allowed origins, authentication, abuse controls and operating/monitoring arrangements. HTTPS pages must use WSS. A game client pointing at localhost connects only to that same machine.

## Protocol version 1

Client messages are JSON text, at most 2,048 bytes. Clients should send input at 30 Hz or less. Server combat advances at a nominal 30 Hz, with core substeps, and replication broadcasts at 20 Hz by default. `CK_BATTLE_SNAPSHOT_HZ` or the `snapshotHz` constructor option may set 10–30 Hz. Elapsed steps clamp at 100 ms; server overload slows simulation instead of applying an unlimited catch-up burst.

Join an existing room with matching settings or create one:

```json
{"type":"join","wire":1,"room":"my-battle","mode":"siege","teamSize":50,"difficulty":"medium","name":"Custard Knight","role":"engineer","visor":"open"}
```

Modes: `brawl`, `ctf`, `siege`. Team size: `4`, `20`, `50`. Roles: `vanguard`, `ranger`, `engineer`, `support`. Room code: 1–32 ASCII letters, digits, hyphens or underscores. Omit the room field to use a shared `${mode}-${teamSize}` default. Names are capped at 24 characters with control characters and angle brackets removed; clients must still render them as text.

Server reply:

```json
{"type":"welcome","protocol":1,"wire":1,"snapshotHz":20,"sessionId":"server UUID","resumeToken":"48-character secret","room":"my-battle","playerId":"server UUID","slot":"c-0","team":"custardia","ranked":false,"rankingLabel":"Unranked — anonymous session"}
```

`slot` identifies the stable player object in `state.players`. `sessionId`/`playerId` match its `humanId`. `team` is assigned by the core based on human counts first, then the supplied server-owned skill estimates. Clients cannot request a team or submit a skill rating. Currently all anonymous humans start at the neutral estimate of 1,000; adaptive bot targets use those estimates. This is balancing, not calibrated skill matchmaking.

The optional `resumeToken` field on a subsequent join resumes the same ephemeral session and replaces its previous connection. Keep the token private; never put it in an invite URL. There is no account identity behind it, and it expires after an hour disconnected or immediately when the server restarts. Reconnection fills an available balanced slot; it does not promise the original team, position or in-match score.

Input contains intentions, never health, damage, position, winner or rating:

```json
{"type":"input","seq":1,"moveX":0,"moveY":1,"aimX":1,"aimY":0,"attack":true,"heavy":false,"guard":false,"dash":false,"ability":false}
```

Sequence numbers must be increasing safe nonnegative integers for each join. Axes must be finite numbers and clamp to [-1, 1]; the core normalizes directions. Actions are booleans. Unknown fields are discarded. Out-of-order/repeated sequences are ignored. If input stops for 350 ms, movement and actions return to neutral. The server decides hits, stamina, attack timing, objectives, deaths, respawns, results and bots.

Full snapshots have `{type:"snapshot",wire:1,seq,room,humans,bots,capacity,state}`. `state` is the shared core's public snapshot and includes players, objectives, projectiles, timer and result. No session secrets or skill estimates are included. `humans+bots===capacity`; a disconnect immediately returns its slot to AI. Human sides are balanced when joining; existing humans are not forcibly moved mid-match after a departure. Each player's independent `visor` is `open` or `closed`; invalid/missing join choices default closed, and bots default closed. Other wardrobe choices are currently local presentation, not replicated by this new protocol. Cosmetics never change combat statistics or faction assignment. Bot `difficulty` may be `easy`, `medium`, `hard` or `steve`; a room's setting is fixed at creation. An omitted difficulty inherits the existing room's setting or defaults to medium for a new room.

The bundled UI negotiates `wire:1`. After an initial full snapshot the server sends `{type:"delta",wire:1,seq,base,patch,room,humans,bots,capacity}`. Use `game/mass-battle-wire.js`: `CKMassBattleWire.createDecoder().apply(message)` returns the reconstructed state, or `null` for malformed/unsupported input or a sequence gap. The versioned field table packs changed player fields, changed top-level state and compact projectile/effect/objective arrays. Unchanged names, roles, appearance and map metadata are omitted. Numeric state remains lossless; there is no quantization or combat change.

WebSocket delivery is ordered/reliable. A room uses one canonical baseline, advancing its sequence for every published frame. A joining/reconnecting/resyncing client receives that exact baseline; its new human slot may first appear in the next delta, within the next normal replication interval. It must not substitute a newer private snapshot under the old sequence. A full baseline is also published every 200 frames. A decoder gap requests `{type:"resync"}` once while awaiting a replacement full snapshot; the server caps resync responses to two per second. A slow socket exceeding the backlog cap is closed, never silently skipped and left on a mismatched baseline. Each new join gets a fresh decoder. Legacy clients omitting `wire` still receive complete snapshots; they do not receive the bandwidth savings.

Other messages:

- `{type:"leave"}` → `{type:"left"}` and bot replacement.
- `{type:"ping"}` → `{type:"pong",time:<server milliseconds>}`.
- `{type:"leaderboard"}` → `{type:"leaderboard",ranked:false,label:"Session results — unranked",entries:[...]}`.
- Invalid requests → `{type:"error",code,message}`. Capacity/settings/finished-session errors do not silently create a different battle.

Finished rooms remain viewable while a participant is connected. Their final public scoreboard is frozen, so a departing participant does not erase their final score. Start another match with a different room code. Empty rooms expire after 60 seconds, so their codes can then be reused.

## Capacity, abuse controls and ranking boundary

Defaults cap the process at 8 rooms and 128 simultaneous sockets. Constructor options permit an operator to lower these caps; higher caps are not performance certifications. Per socket there is a 60-message/second token bucket with a 120-message initial burst, a 10-join/minute limit, bounded input size, stale-input neutralization, heartbeat-based dead-connection cleanup and a 512 KiB outbound backlog ceiling. Slow clients are disconnected rather than growing an unlimited send queue. Expired disconnected sessions are removed; the session map caps at 2,048. These are basic resource bounds, not a complete public-service abuse/DDoS solution.

The session results list is explicitly unranked and noncompetitive. It records completed-match participation. Wins and score accrue only if **every simulation tick** of that room contained humans in all slots; a single bot-assisted tick makes the match ineligible. Bot victories therefore cannot farm that list. Results are recorded once. A late join, session reset, multiple anonymous identities or collusion means even the human-only list is not a trustworthy competitive ranking. No MMR/rating is awarded or persisted; the server never consumes client-provided wins, results or ratings.

A real ranked launch needs authenticated platform identities verified server-side, durable transactional match results, per-account rating history and calibrated uncertainty, party/skill-aware matchmaking, reconnect/leaver rules, eligibility thresholds, sanctions/reporting and exploit review. Ranked queues should exclude bot-assisted results, while keeping mixed bot matches as a separate unranked playlist. Do not advertise this anonymous session list as a ranked ladder.

## Evidence and remaining gates

Run the focused real-connection suite:

```powershell
node --test tests/mass-battle-server.test.cjs
```

Ten server test cases passed using the actual shared simulation and Node's native WebSocket client. They cover input authority/type bounds; malformed messages; stale input; session replacement; origin/connection limits; rate and payload limits; 4v4 capacity/team balancing; 40/100-combatant bot rooms; 100 simultaneous loopback sockets in one 50v50 room, overflow rejection and ten disconnect-to-bot replacements; room expiry; frozen final standings; one-time, bot-ineligible session results; negotiated deltas and gap/resync recovery; and two simultaneous clients with different visor choices. Four wire tests additionally cover 630 exact snapshot reconstructions across all three modes, periodic baselines, join/reconnect, lost/duplicate/reordered messages, state limits and malformed field indices/prototype attempts. The results bookkeeping test sets the server's terminal state directly to avoid a long match; it does not claim a human-completed match.

The test suite is a short local capacity/protocol check. A separate bounded active load can be reproduced with `node qa/mass-battle-load.cjs 60 qa/results/mass-battle-load.json`. It starts 100 real loopback sockets, parses and decodes replication in every client, and sends movement, aiming, light/heavy attacks, guards, dashes and role abilities while clients chase opponents. The harness records source hashes at process startup, so later edits do not falsely describe the loaded code.

The completed 9 October 2026 load is recorded in `qa/results/mass-battle-load-100-clients-2026-10-09.json`: 60.006 seconds, 104,200 inputs, 60,100 received snapshots, 400 combat kills, no socket disconnects/errors/rate rejections, and 59.992 seconds of simulated time. Server tick cost was 3.20 ms at p95, 5.27 ms at p99 and 6.77 ms maximum on the documented i9-14900K host. Peak combined server/client RSS was approximately 163.5 MiB. The input target was 20 Hz; actual aggregate input delivery averaged 17.37 Hz per client because server and all clients share this one Node event loop. This measures scripted load, not human responsiveness.

**Bandwidth is the principal measured warning:** full JSON snapshots peaked at 70,210 bytes; received application payload totalled 3.22 GB in one minute, or approximately 430 Mbps aggregate / 4.30 Mbps per client. These figures exclude WebSocket/TCP/TLS overhead. The busiest snapshot size at 10 Hz would require approximately 562 Mbps for 100 clients before overhead. The 512 KiB backlog ceiling will intentionally disconnect connections that cannot sustain the stream. Snapshot filtering, delta/binary encoding and precision/field reduction need to be evaluated before treating this as a public 100-person service. This load is not a proved worst-case ceiling: maximum projectiles/effects, multiple busy rooms and hostile clients can cost more.

Neither load is evidence of 100 people playing reliably over the internet, representative latency/loss, low-end client rendering or cloud economics. Before advertising public 100-human play, measure worst-case long matches and hosting traffic, exercise real distributed clients and network impairments, and test reconnect/abuse/failure operations on the intended host. No public endpoint or production hosting has been created by this work. The interrupted first foreground attempt produced no completed result; only completed JSON artifacts supply evidence.

### Delta transport validation update — 9 October

Independent Windows/Linux Actions runners completed the full 110-test suite and a 60-second active 100-client delta load with no disconnections or decoding/input errors. Retained JSON/TAP evidence and exact limits are in `qa/results/stability-2026-10-09/` and `qa/reviews/battle-stability-2026-10-09.md`. Aggregate payload was 122–132 Mbps, about 76% below the same-run extrapolated full-snapshot traffic. This is not a controlled comparison to the earlier local-host run.

Actual snapshot delivery was only 12–12.5 Hz against the configured 20 Hz target. Server and all clients shared one event loop; the Windows simulation advanced 54.5 seconds in 60 seconds. These passes establish bounded connection/protocol behaviour on independent hosts, not acceptable latency or production capacity. Separate-process load attribution is the next test. Local native failures remain unresolved; avoid declaring the user's local server stable solely from remote success.

### Separate-process attribution update — 9 October, 07:00 UTC

The next test is now complete: `node qa/mass-battle-process-load.cjs 60 result.json 4` isolates one server from four 25-client workers. Local and independent Windows/Linux 60-second runs sustained approximately 20 broadcasts/sec and real-time simulation without protocol errors. Shared hardware and random match seeds remain limitations. This supports shared-event-loop contention in the older result; no server runtime change was made.

Timing is still not accepted. Inputs reached only 15.62–18.58 Hz at the slowest clients; Linux recorded a 1.77-second receive stall, and Windows' simulation timer ran at 24.11 Hz while maintaining real-time advancement. Aggregate payload was 205–212 Mbps at the higher snapshot delivery rate. Full results, CPU metrics, provenance and the remaining client profiling task are in `qa/reviews/battle-process-load-2026-10-09.md`. The alpha.2 package is unchanged and native local failures remain unresolved. Passing protocol status is not a smooth-play or WAN certification.
