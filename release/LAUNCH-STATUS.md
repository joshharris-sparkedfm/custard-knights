# Required launch scope — 8 October 2026

The expanded release is implemented. Joshua requires the Great Pudding War's first eight encounters, Custard Cup and six additional earned cosmetics alongside the original game; the earlier arena-only cutline is superseded. Developer/publisher: Sparked FM Ltd. Recommended price: £7.99 / US$9.99.

The 0.1.0 ZIP is the earlier arena-only test candidate. Version 0.2.0 is the expanded candidate; its BUILD-INFO records the final source revision and package hash. A working candidate is not Steam approval or public release.

| Area | Implemented | Evidence / remaining work |
|---|---|---|
| Existing arenas/combat | Eight modes, six arenas, existing swordplay, bots, hazards and power-ups preserved; audio voices bounded and released | Latest expanded-source 72-match full suite completed without errors. Original 108-mode sweep passed. Baseline 60-minute and expanded-source 10-minute real-time soaks tracked separately in QA-evidence. |
| Local and online | Round-bound input/results, seat continuity, capacity, late joins, departures, guest outfit updates on rematch | 24 browser regressions and 21 live PeerJS checks pass on this machine; physical controllers and different networks remain external tests. |
| Great Pudding War | Eight authored encounters, winding map/story, spoons, assistance, checkpoints, Steve rescue, two-phase boss, playable final rescue | 18 unit tests, 46 engine checks and all eight normal encounters completed by real-input-only automated policy. Pause/resume checked. Human playtime/usability still unmeasured. |
| Custard Cup | Three rounds, human standings/ties, arena vote, ready-up, recorded-event awards, late-join policy | Six unit checks, fourteen Cup browser checks, live complete Cup and malformed/stale packet validation pass. |
| New collection | First reward choice, pinned goals, partial progress, two-scale previews, three presets and six authored cosmetics | Eleven unit checks and 42 collection/integration/packet checks pass. Actual baked/classic costume renders inspected. Legacy ownership and campaign backups preserved. |
| Desktop delivery | Offline assets, restricted protocol, single instance, fresh install save directory, genuine process restart, relocation and SteamPipe preview generation | Source acceptance passes for campaign spoons/assistance, legacy kit, first cape choice, pinned partial progress, preset and settings. Final packaged acceptance and byte-for-byte runtime comparison recorded with output build. |
| Store presentation | Eleven capsule/library/icon exports, actual gameplay screenshots, 41-second 1080p H.264/AAC trailer and revised copy | Art sizes and alpha verified; review sheet inspected. Steamworks account preview/submission still required. |
| Soundtrack | Twelve named slots, fallback routing and detailed Suno prompts | Only the existing commercially cleared menu theme recording is supplied. New songs still need Suno exports and listening checks. |

Combined unit suite: **53 passing tests** at source freeze. Automated tests use isolated saves. Campaign integration uses controlled setup for collision cases; the separate input-only policy injects no combat damage or positions during play. Neither is a human playtest. Headless soak speakers are muted while the audio graph runs.

The baseline hour started before the new formats were implemented and cannot certify them. The expanded ten-minute soak exercises arena rendering/audio on integrated source; campaign, Cup and collection have their separate acceptance evidence. Read the actual JSON status before claiming either soak passed.

Remaining release gates: Steam account/fee/bank/tax verification and App/depot IDs; private-branch installation on a second PC; physical controller and Steam Input testing; different-network online acceptance; measured minimum specifications; additional soundtrack exports; public support contact; final store content/price selection and Valve review/timing. Existing asset ownership and Suno commercial rights were confirmed by Joshua. New generated store art is recorded separately for the content survey.

No public publication, Steam fee payment or store price submission has been performed. The 30-minute follow-up continues remaining actionable preparation and reports meaningful changes rather than claiming launch approval.
