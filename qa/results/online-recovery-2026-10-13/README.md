# Bounded online recovery evidence

Final independent source browser run: `final7-visible/report.json`,38 passes/0 failures, zero Runtime exceptions, source stable. Runtime index SHA256 `dd26f208c774eff508da43a210eb7602ef9f8e1a72920570ffc34c69b9a67715`; `game/online-recovery.js` SHA256 `54d36241bbdc607a18a451cb590cbf268e41238ed304c5f252e21c9b07fbd5f2`. Harness SHA256 `0c4505342d06aeadd8c3cecbd75af79c982cdcafc80a021616b366c8809e261e`.

Run `node qa/online-recovery-browser.cjs <new-output-directory>`. Set `CK_QA_ROOT` to an extracted ASAR root for the package owner's same-suite check. Use a new output directory to preserve failures. The fixture creates temporary isolated Chrome profiles, writes only its evidence directory, and closes only the processes it started. The240-second watchdog bounds it; the final run takes roughly85 seconds including ordinary15-second admission/snapshot deadlines.

Real input is CDP keyboard/mouse plus explicitly synthetic gamepad polling. Real bundled PeerJS signaling and same-PC/network DataConnections cover joins, full/missing refusal, a deliberately legacy-capability hello, host/guest Menu transitions, actual timer results while Options is open, departures and controlled signaling disconnection. FakePeer callbacks, script loading failure, admission silence, suppressed snapshots and document-hidden events are explicitly injected faults. The detailed review is `qa/reviews/online-recovery-2026-10-13.md`.

Retained runs:

- `baseline`: early implementation candidate,19 passes/2 failures; its name does not imply untouched pre-fix source. Fixture persistent-CDP `const p` redeclaration and an early Retry failure retained.
- `candidate2`:25 passes on its stable recorded source.
- `candidate3`:29 passes, but index changed during execution; exits nonzero and is not final acceptance.
- `final4`:35 passes on stable6d637 source, before the new host seat-continuity assertion.
- `final5`:35 passes/1 failure on stable6d637 source. The host two-keyboard-seat Menu→lobby→Start journey lost `SEATS`; null `.length` surfaced the production finding. The implementation now retains seats when player count matches; final6 verifies the repair. The harness uses optional access so recurrence yields a false assertion instead of a fixture exception.
- `final6`:36 passes on stablead016 source, including the seat repair. Retained as insufficient critical-status visibility evidence: root found its800x600 pending screenshot lacked the status text. Global compact `.tag`/`.note` hides affected critical explanations; DOM text and a visible button alone did not prove the explanation was rendered.
- `final7-visible`:38 passes on stabledd26 source. New computed checks cover pending/error/online-Menu explanations plus visible enabled hit-testable Cancel/Retry/Resume at800x600 and800x500. They include ancestor visibility/opacity/display/clipping, text/element viewport bounds and actual screenshots, independently inspected. The full source suite also reruns the existing transport, seat, reward and pause regressions after the CSS repair.

Physical controllers, human playtesting, household/WAN networks, second Windows PC, actual EXE and Steam acceptance are unperformed here. Package/extracted-ASAR evidence belongs to the package owner. No normal saves or user game processes were accessed. This bounded increment does not close the full FE-03 or acceptance matrix.

