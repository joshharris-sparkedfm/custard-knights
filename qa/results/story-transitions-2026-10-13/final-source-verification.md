# FE09-A final source verification

13 October 2026. Recovered implementation owner `/root/fe09_transitions_impl`. Source checkout: `C:\Users\Joshua\Documents\Codex\2026-10-08\rea\work\custard-knights-room`. Root subsequently froze and pushed source at `c79dad537d50a4cb343c8d2c824705d6fab60487`.

This record reuses completed tool output. No checks were rerun to write it. It is source verification, not browser, native, package or human acceptance.

## Recovery corrections

The retained FE09-A runtime diff was preserved. Guard node fallback dialogue/outro was aligned with its already-authored Bran/service-crossing/channel/winch theatre cues. The live striped shield was already connected through campaign foreground rendering and the existing index hook; index.html remained unchanged.

Independent Luna review identified a real routing regression: universal concise consequence handling suppressed the authored bridge/Stirling/Steve/Rind outros. `continueResult` now confines the concise consequence to Puddings, guard and optional Biscuit. Other nonterminal encounters retain full outro theatre followed by the next briefing. Terminal Continue renders the existing full outro and then returns to the story map. No later FE09 story or checkpoint content was added.

Two new focused UI regressions mount the real campaign UI with real scene durations and captions. They verify bridge/Stirling/Steve default Continue uses the full outro and next intro without launching early, and terminal Rind Continue exposes the final authored outro caption before returning to the completed map. Existing crossing contract test also checks guard fallback identity and optional onward-route wording.

## Completed checks

Final affected command, run in the source checkout:

```text
node --test tests/story-transitions.test.cjs
```

Observed final output: tests 5; suites 0; pass 5; fail 0; cancelled 0; skipped 0; todo 0; duration_ms 65.1457. The five passing test names were:

- natural first delivery pauses before combat without changing rewards or reporting a combat round
- unchanged encounters retain full authored outro and next briefing on default Continue
- terminal Continue retains the full Rind outro before returning to the completed map
- explicit opening skip and a delivery replay after an attempt intentionally enter combat directly
- crossing identity and optional practice retain the eight-node save and spoon contract

`node --check` succeeded for `game/campaign.js`, `game/campaign-ui.js`, `game/campaign-integration.js`, `game/story-scenes.js` and `game/bakery-opening.js`. After the final routing correction, `node --check game/campaign-ui.js` succeeded again. `git diff --check` was clean after the final correction; only Git LF/CRLF conversion warnings were printed.

Root recovered the earlier exact command `node --test tests/campaign.test.cjs tests/bakery-opening.test.cjs tests/story-scenes.test.cjs tests/story-transitions.test.cjs`: exit 0, TAP 1..43, tests 43, pass 43, fail 0, skipped 0, duration 330ms. That earlier output is separate retained evidence. The final five overlap its three transition tests and add two UI regressions: 45 distinct tests are covered by retained and affected evidence, but no full 45-test run is claimed. The initially suggested 47 count was incorrect.

## Final stable SHA256

| File | SHA256 |
|---|---|
| game/bakery-opening.js | dbbff764f547da6fdee9f290233c4b6bb5b79c0b0e8282d803b971389267f5e8 |
| game/campaign-integration.js | 03d3805e177fbce92540f53adbbecf6f254cc3d0501e4ec4e8016af206816001 |
| game/campaign-ui.js | b96a9d8fb80bf470225112bf62e68e482031fab5554ddc589cf354606a49799a |
| game/campaign.js | c4deee57e403492f3d80e80323c5f97038758f4bf64455fdda73287236f066ce |
| game/story-scenes.js | a64dce7318f2b769fe6320814e34c05b04c6e14abc63c7168f106d05ffaf4c2d |
| tests/story-scenes.test.cjs | 55cabc391192d533c7f4f4b66db5709317b4a1e57e536901955ba7de2ac6c121 |
| tests/story-transitions.test.cjs | 25b5f689c5184f98f5490ed3b13f868f15cb81fc6f43dcfb49c2149177ada4d0 |
| index.html (unchanged) | c140afd3e72185bdedbabecf91f4e776c68fa040c61a1a9212ad06dfe9994163 |

These seven changed implementation/test files are the exact source-owner scope. Final stable hashes were sent to root, QA and Luna before handoff. The retained 15:47 browser report (9 pass / 5 fixture or cascade failures) remains distinct and is not final acceptance evidence.
