# Local product observations — 12 October 2026

Beta.5 adds the local reporting foundation of CK-04. Recording is disabled until a tester enables it in Settings. A strict schema rejects arbitrary fields, identifiers and strings. Reports use independent local opaque tokens, bounded local storage, explicit export/clear/opt-out, and no transport service.

## Instrumented paths

Arena host/local and admitted guests record starts, one first deliberate input/attributed combat action, terminal results and explicit rematch intent. Joining records a valid room-code attempt and either accepted admission or a bounded failure reason; a transport opening alone is not admission. Raw room, peer, round and Cup identifiers never leave the adapter. Story records launches after encounter creation and deduplicated results. Faction Front records accepted human play and terminal results, with late arrival and reconnect context. Cup completion, explicit goal pinning, earned-item equip and goal unlocks are observed; these do not imply enjoyment or desirability.

The browser test uses the real menu, Settings handlers, JSON download, combat loop and integration hooks in an isolated profile. Forced results and fake PeerJS admission packets are labelled synthetic fixture operations. Tests verify clear and mid-round opt-in do not create a false round denominator; demos, bots and QA do not contribute human baseline counts. No normal player profile is accessed.

## Evidence

- Eleven module tests cover consent, schema/privacy, duplicates, bounded storage, report immutability, join matching, continuation, QA/demo/bot/late-arrival exclusion, corrupt/blocked storage, reload and session expiry. A long round crossing a session boundary remains unmatched rather than inventing an outcome.
- Final source and frozen-package browser passes each have 30 checks and zero exceptions. Four runtime source hashes match between the final reports. All 57 package entries match source/generated metadata; actual EXE save/restart/launcher/relocation checks pass. Evidence remains under `qa/results/product-events/`.
- Two earlier packaged harness failures are retained: fixed 150 ms input and 250 ms faction-result waits were too short for the hidden window. The final harness waits up to eight seconds for the actual observations and passes without a runtime change. These waits do not measure responsiveness. Embedded image data URLs are omitted from network inventories to avoid duplicating atlases; request schemes are preserved for the no-upload check.
- The modified campaign adapter passed the existing 24 focused campaign unit tests. No combat, reward, movement, network payload or matchmaking rule is changed.

## Limits

This creates a measurement tool, not measured player outcomes. No human cohort baseline, experiment assignment, referral attribution, retention, people/group identity, live-service analytics or external telemetry is claimed. Reserved highlight/share/referral schema events are not hooked to nonexistent features. First deliberate movement/attack/block input is not proof of a landed hit or understanding. Exits based on inactivity are inferred, and close/crash delivery is best effort. Truncation and cleared storage affect retained denominators.

Network fixtures prove hook/admission semantics only; they are not a new WAN acceptance run. Human playtests, actual controllers, hardware and platform acceptance remain open. Existing development-runtime native faults are not explained or fixed by this work. See [tester guidance](../../release/playtest/LOCAL-REPORTS.md).
