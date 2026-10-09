# Persistent private faction ladder

This provides host-issued player identities, durable per-mode/size ratings and a human-only matchmaking queue. It is an opt-in private-test service. It is not Steam authentication, a public server deployment, or an accepted competitive season. Existing anonymous mixed human/bot battles remain available without accounts.

## Start a private server

Use Node 24 and install locked dependencies with `npm ci`. Create a private data directory; do not commit or share its contents. In PowerShell, from the repository root:

```powershell
New-Item -ItemType Directory -Force data
node scripts/player-admin.cjs --db data/players.sqlite issue "First Knight"
$env:CK_PLAYER_DB = (Resolve-Path data/players.sqlite).Path
npm run battle:server
```

The issue command deliberately prints a new account ID and secret access key once. Send each key privately to its intended tester. No email delivery, public registration or billing is implemented. An access key is a bearer credential: anyone holding it can act as that account. The database stores a SHA256 hash rather than the raw key. The default listener stays on loopback. A remote service still needs an owned host, WSS/TLS and operational acceptance; no public endpoint has been created.

For Docker, add `-f deploy/compose.ladder.yaml` to the base Compose command. The optional overlay mounts a persistent named volume at `/data` and sets `CK_PLAYER_DB=/data/players.sqlite`; the image creates this directory owned by the unprivileged Node user. Issue an account inside the running container with:

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.ladder.yaml exec battle node scripts/player-admin.cjs --db /data/players.sqlite issue "First Knight"
```

Do not paste credential output into CI logs, issue trackers, invite URLs or public chat. Public TLS deployment remains the separate `compose.public.yaml` overlay. No ports are exposed beyond loopback by the private-ladder overlay itself.

## Play and matchmaking rules

In Faction Front, open online play, enter the supplied server and player access key, then choose **Private test ladder**. Pick Brawl, Capture the Flag or Siege and a supported army size. The queue waits for 8, 40 or 100 distinct authenticated players respectively; it does not fill ranked slots with bots. Cancel search returns to setup. To play immediately with bots, choose the casual playlist or local **Play with bots**.

Queues are independent for each mode and army size. Players initially search within a 200-point rating span, widening by 100 points per 15 seconds to a maximum of 800. A group must satisfy every member's current permitted span. The oldest eligible group starts first, and the existing server-owned team assignment balances human counts and ratings. Roles remain player choices; there is no party grouping or role-composition guarantee. These are implemented rules, not human-calibrated matchmaking claims.

Each queue starts an account at 1000. Team expected outcome uses average team ratings; completed eligible matches apply a fixed K=32 update, with ratings bounded between 500 and 2500. A profile is marked provisional for its first ten rated matches. Provisional is an explicit match-count label, not a calibrated statistical confidence estimate. Ratings are separate across mode and army size.

Only the server records a result. Client-supplied ratings, winners and scores cannot award ladder changes. Result IDs are unique and transactional; an identical retry does not pay twice, and conflicting reuse is rejected. The database retains result and participant history. A disconnect makes that match ineligible: bot-assisted continuation never awards ratings. This deliberately conservative test rule can be exploited to avoid a loss; reconnect grace, leaver penalties, sanctions and anti-collusion work remain requirements for a public competitive season. Never advertise this private ladder as cheat-proof or a finished Steam ranked service.

## Keys, storage and recovery

The client masks the key, retains it only in memory and clears it when exiting Faction Front. It does not save keys to browser storage or put them in invitation URLs. Remote authenticated joins require WSS; plaintext WS is allowed only for loopback development. The server rejects a second simultaneous connection for the same account and checks credentials again before a ranked launch and result. Revocation is an operator action:

```powershell
node scripts/player-admin.cjs --db data/players.sqlite revoke ACCOUNT_ID
node scripts/player-admin.cjs --db data/players.sqlite profile ACCOUNT_ID brawl-4
node scripts/player-admin.cjs --db data/players.sqlite leaderboard brawl-4
```

For a backup, stop the server cleanly and close every administration process, then copy the entire database directory, including any WAL/SHM companions. Keep it private and outside the live directory. Restore only while all database users are stopped, keep the previous directory as a rollback copy, then start the server and verify known profiles. Do not copy only a live SQLite main file, and do not use Compose `down -v` for ordinary maintenance. The named volume preserves results across container replacement; losing that volume loses identities and the ladder. Match simulations and queues remain in memory; a server crash/restart does not resume a live battle.

Store errors do not produce a success message or award speculative ratings. Investigate the logged health state, preserve the database and record the affected match before restarting. Local native-runtime failures documented in the release checkpoint remain unresolved; this feature does not establish their cause or repair them.

## Steam integration boundary

Steam identities require a game-issued ticket verified by a secure server against the configured App ID and Steam credentials. A host-issued private key does not prove Steam ownership. Real App/depot IDs and platform setup are still missing. See [Valve authentication documentation](https://partner.steamgames.com/doc/features/auth) and [AuthenticateUserTicket](https://partner.steamgames.com/doc/webapi/isteamuserauth). Persistence uses Node's built-in SQLite API, documented in [Node SQLite](https://nodejs.org/api/sqlite.html). These official sources were checked on 9 October 2026.

Physical controllers, actual human fun/balance, multiple household networks, server load/latency, minimum hardware, Steam installation and public support remain release acceptance work. Automated result tests deliberately set terminal state to exercise bookkeeping; they are not completed human matches.
