# Couch device continuity — independent browser review

13 October 2026. Frozen final source: **23 checks passed, 0 failed, 0 browser runtime exceptions**. Before/after source hashes matched. Evidence: `qa/results/couch-device-2026-10-13/final/report.json` and its eight minimum-window screenshots. Harness: `qa/couch-device-browser.cjs`; `CK_QA_ROOT` accepts an extracted packaged runtime without editing that runtime.

The implementation owner separately reported 60 focused unit checks plus one focused How To Play text/alias assertion passing. Those are owner-run evidence and are not included in this review's independent 23-browser-check count.

Actual Chrome animation-frame polling and browser input handlers were exercised using CDP keyboard/mouse plus injected standard gamepad objects. Actual input joined four mixed seats in reverse controller order, routed mouse attack to the WASD seat, retained ownership through navigator-array reorder and a held Start button, and deliberately reclaimed devices with A or keyboard Tab/Enter. Disconnect tests covered event and polling-only loss, held attack release, different-device index reuse, same-model ambiguity, occupied-controller refusal, setup launch blocking, results recovery and a real Rematch button click. Offline loss stopped the actual match timer; recovery required fresh input.

Two isolated browsers established an actual bundled PeerJS DataConnection. Loss of one host-local pad neutralized its seat while the other local stick input, remote guest D input and authoritative timer continued. No FakePeer or direct hostRecv injection replaced this evidence. This was one machine/network, not WAN acceptance.

Five direct endMatch/rematch fixtures preserved seat/device/outfit/team state. A four-pad fixture recovered a changed controller index, supplied three direct Cup outcomes/readiness transitions, and started a second Cup with stable entrant keys and seat bindings. **These are continuity checks, not an input-only played Cup, reward fairness, balance or human completion acceptance.**

Computed styles, ancestor clipping, text rectangles, viewport bounds and element hit targets verified recovery status, keyboard recovery buttons, fixed binding prompts/Start controls and How To Play pad ownership/aliases at 800×600 and 800×500. Screenshots were independently viewed. In the single-missing-seat screenshot the selected Recover Player 1 button and both keyboard choices are visibly distinct. The custom setup remains scrollable; the controls and Start button are simultaneously visible after ordinary scrolling. Text is 13–14px; screenshots do not establish TV-distance human readability.

Earlier evidence is retained. `baseline` loaded a mid-edit candidate and recorded the new recovery handler's `$` initialization error, which was corrected; it is **not original-base evidence**. `candidate1` recorded 21/22 passes: its setup visibility failure came from scrolling the note to the viewport bottom and demanding that the later button already be visible. The harness now scrolls the button normally and then measures both rendered regions; source remained unchanged for `candidate2` (22/22). The final text-only How To Play correction removed the false controller-number/player-number equivalence; the added rendered assertion and complete final harness passed on its frozen new hash.

Frozen SHA-256 values:

- `index.html`: `07a3c1be07ab18f3fe1625ed5a3a06e15f24aad6e37210f8fb15c7132c246e8a`
- `game/input-aim.js`: `54040dd96e1360a46cd36c5fc6f92b05abeeb7db34af7f5cca3d75a9dcb9baee`
- `game/cup.js`: `790949bce5c2ce54f5a93aa5d13d226fddb735e1426475e9a7c5297987422a12`
- Harness: `5baf3511b63844a1a1052be1b51947f0ba4407990fbab34f82b293ac24dced94`

Limits: no physical controller, Steam Input, touch, human couch ergonomics, minimum-PC performance, exported EXE or second Windows PC was accepted here. Explicit Leave still compacts party seats; leave/rejoin identity persistence remains a separate FE-05 gap. Fixed binding prompts were checked; no remapping UI was implemented or accepted. Four simultaneously missing seats and real-device ID/index behavior remain physical/expanded-device acceptance work. Temporary QA profiles were used; normal saves and the owner's game were untouched.
