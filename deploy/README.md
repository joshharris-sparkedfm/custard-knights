# Faction server deployment preparation

This packages the existing anonymous, unranked server. It does not add Steam authentication, persistent rankings, fleet matchmaking or operational acceptance. No public service has been deployed. Hosting account/domain selection is pending.

From the repository root on a Docker host:

```
docker compose -f deploy/compose.yaml config --quiet
docker compose -f deploy/compose.yaml up --build -d
```

The default publishes only `127.0.0.1:8787`. The desktop can connect to `ws://127.0.0.1:8787/battle`. The container runs as Node's unprivileged user with a read-only filesystem, no Linux capabilities and bounded process/memory/log settings. The memory cap is an initial operating limit, not a supported player-capacity claim. `/health` reports room/connection counts; check `docker compose -f deploy/compose.yaml ps` and `logs --tail 100`. A health check does not itself restart an unhealthy running process; an operator or monitor must handle that condition.

The optional public overlay requires an owned hostname in `BATTLE_DOMAIN`, DNS pointing at the intended host, reachable ports 80/443, and completed service acceptance. After those inputs and deployment approval, combine `-f deploy/compose.yaml -f deploy/compose.public.yaml`. Caddy terminates HTTPS/WSS and forwards WebSocket traffic to the private service. Buyers would use `wss://YOUR_HOST/battle`. Only the exact packaged `custard://game` Origin is configured; add an explicit browser origin only if that client is intentionally served. Origin filtering is not authentication.

Matches and anonymous sessions live in memory. Restarting/replacing the container disconnects players and loses those results; plan a maintenance window. Pin tested image digests and retain the previous image/repository revision before rollout. Do not use `down -v` as routine maintenance: proxy volumes contain certificate state. Back up and restore those volumes under the chosen host's procedures. Do not promise zero-downtime updates or persistent ranks.

The public overlay remains unlaunched. Its syntax can be checked with a placeholder hostname without requesting certificates or publishing ports. This machine's Docker CLI is installed but its Linux daemon was not running; container execution is delegated to the repository's isolated CI job, with results retained separately.

Official references checked 9 October 2026: [Docker required environment interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), [Compose service configuration](https://docs.docker.com/reference/compose-file/services/), [Caddy automatic HTTPS prerequisites](https://caddyserver.com/docs/automatic-https). Complete WAN/client acceptance, hosting traffic estimates, monitoring/incident ownership, support contact and authentication/ranking decisions before a sales promise of public hosted battles.

CI result: Actions run 37899639763 built the image, verified health and a desktop-Origin CTF connection with three decoded deltas, then stopped the isolated container. The Node base is pinned to the digest used in that pass. This does not validate public DNS, certificates, WAN performance or the Caddy image for rollout.
