# Remappable controls focused QA — 2026-10-13

Independent review of FE04 Arena/Cup/Story/practice controls. Faction Front retains its distinct controls. Browser evidence is Chrome with an isolated temporary profile, actual CDP keyboard/mouse actions and synthetic standard gamepad objects injected only at `navigator.getGamepads`. Each synthetic neutral/press/release phase is held until at least two actual polls observe it, with a five-second bound. This establishes sampled input, not responsiveness, physical-controller, Steam Input, human couch, or packaged EXE acceptance.

The UI uses explicit selectors, not a live recorder/capture mode. Selector edits, Apply, Cancel, Reset and Back use browser input. Direct CK launch/seat fixtures isolate ownership; direct NET-client role fixtures test local guest routing without signaling/network acceptance. The blur/focus and storage-failure/corrupt-save fixtures are labeled in the report. Temporary profiles do not read or alter the user's normal saves or running game.

Small-window checks use 800×600 and 800×500. Each text/control is measured after its own normal scrolling, including computed style, clipping/viewport bounds, text bounds and hit testing; simultaneous visibility is not claimed. Screenshots accompany these measurements. The focused runner supports `CK_QA_ROOT` for a later extracted-ASAR rerun. Source hashes before/after and the harness hash are preserved per candidate.

## Retained candidate and correction evidence

- Candidate 1: `qa/results/controls-remap-2026-10-13/candidate1/report.json`, 14 pass / 1 fail, unchanged before/after runtime hashes. The failing QA assertion incorrectly expected solo R in setup even though a retained keyboard-half-1 seat truthfully showed Q. Computed text/button reachability passed at both windows. The assertion was corrected; this is a QA fixture correction, not a product defect.
- Author review found that returning an edited row to its visible “current aliases” option did not restore those aliases. Candidate 2 restores the copied original alias list and reruns validation; the focused browser runner now tests keyboard and pad roundtrips through Apply.
- Independent Node UTF-8 inspection found 10 actual U+FFFD characters in edited `index.html` copy during preparation. The author corrected the inserted bytes before frozen candidate 1; subsequent frozen source checks show zero U+FFFD. No archived browser result claims acceptance of the earlier text.
- Author unit-test preparation failures were reported in coordination: seven missing-dependency fixtures, three paused/home fixtures, then one cross-realm array comparison in the alias case. The author corrected these fixtures. This review does not claim archived logs or independent execution for those reported unit-test attempts.

- Candidate 2: qa/results/controls-remap-2026-10-13/candidate2/report.json, 13 pass / 1 fail, stable runtime hashes. Saved Help text correctly showed the remaps, but the How To Play Back button was covered at its center by the fixed Sound toolbar at both minimum windows. Screenshots and computed hit tests preserve the defect. Candidate 3 reserves toolbar clearance for the How To Play panel.

The author reported 108 new/affected unit tests passing for the first frozen candidate, then 12 focused controls tests after the alias fixture correction, and 21 focused controls/home tests after the layout fix. These are successive scoped runs, not a sum of unique tests, and are author-reported rather than independently executed in this browser review.
## Final focused result

Candidate 3 passed **33 / 33 focused browser checks**, with zero Runtime exceptions and unchanged before/after hashes. The final run took approximately 68 seconds. The 27 synthetic-pad pulse records preserve bounded observed traces for their neutral, press/held and release phases.

Final runtime SHA-256:

- `index.html`: `e8d08e7589c9222d5753f8f57b5f1b8424807d2827b46bff3f1745b9b7d58b6f`
- `game/controls.js`: `a65a941fbe3614ab467207d8b216eecdffa77668d1f1bb171f4ad4a6c2405b40`

The passed cases include actual controller d-pad profile/field edits and A Apply; native HTML keyboard selector edits; current-alias roundtrips; untouched default topology and edited alias removal; cross-half and remaining-alias conflicts; reserved options; Apply/reload; Cancel/Escape/pad B; keyboard movement/combat ownership and shared-to-alone continuity; pad logical-seat ownership, array reorder and recovery; dash/block/shout; remapped prompts and minimum-window text/control reachability; distinct fixed Faction input; blur and held keyboard/pad release; local online-client profile routing; draft Reset then Apply/reload; corrupt-save normalization; and truthful session-only storage failure.

Screenshots of candidate 3's How To Play header and saved keyboard controls at 800×500 were also visually inspected: Back clears the Sound toolbar, remap text is readable, and ordinary panel scrolling reaches it. No broad prior soaks were rerun. The currently retained beta.12 package is not new acceptance; a later beta.13/extracted-ASAR or packaged EXE run must identify its own hashes and evidence.

Evidence: `qa/results/controls-remap-2026-10-13/candidate3/report.json` and sibling PNG files. Runner: `qa/controls-remap-browser.cjs`.

## Frozen package review

Beta.13 frozen dd4906bcae1266355a11e50072bdccaff930f6f8 now has its own acceptance: 63 source/metadata entries, 33 extracted-ASAR remapping checks, 9 native-origin programmatic editor/storage/reload checks and isolated desktop lifecycle acceptance. All six hosted CI jobs passed at this exact freeze. All 73 Friends game files, preview ZIP payloads, both ZIP hashes/CRC and exact rendered materials match the recorded inventory. The template comparison explicitly follows the standard bundler's UTF-8/CRLF-to-LF transformation.

Independent final read-only review by /root/controls_review (gpt-6-luna, high) cleared source and these final exports with no blocker. It inspected helpers, identities, reports and limitations without rerunning tests. ASAR5cc759db8a29a1d415bf4785e5991b55538e56682ec76e85b67613ca66d5bcfd. The evidence-only Python extraction adapter, inherited newline-escaping failure, UTF-8 comparator failure and raw-Git-versus-checkout newline comparison failure are preserved in qa/results/beta13-desktop. Corrected verifiers did not change the runtime or ZIPs. Prior native faults remain unresolved; scoped synthetic/programmatic tests are not physical-controller, WAN, human usability or Steam acceptance.
