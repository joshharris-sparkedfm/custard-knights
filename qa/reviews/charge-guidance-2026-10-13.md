# FE06 sword guidance browser review — 13 October 2026

The bounded automated observations support the corrected instruction: press for a light sword swing, continue holding through the swing/recovery until charging, then release for a heavy. This is combined evidence from focused runs, not a claim of one clean uninterrupted suite. No combat source defect was established by this review.

## Evidence and source scope

`qa/results/charge-guidance-2026-10-13/report.json` combines 10 passing observations. Each original report, failure, log and screenshot is retained. Final copy source is `index.html` SHA256 `8342eb96fef62905b7e42de81bfe922416666730997044fa0eb74385208dd42f`; focused final reports record matching before/after hashes. Keyboard/default early-card observations used the immediately preceding `e614402a0013939c9218191325ae5e1307a6ba2791cc91764b0c03d7d8a0992c` copy revision. The later edit named left click in help/setup/onboarding; combat and those early cards did not change.

- `help-final/report.json`: compact Fight instruction range, default keyboard help and actual Back return; 1/1, final source, no runtime exceptions.
- `attempt-4-report.json`: keyboard RAF sequence and actual canvas-rendered early sword/pickup cards; first 4 observations passed, subsequent mouse observation timed out. Retain only the relevant first 3 mechanical/card checks alongside final help in the combined report.
- `remaining-final/report.json`: mouse and sampled standard-pad RAF sequences passed, 2/2 before an unrelated direct-fixture UI error; final source.
- `ui-final/report.json`: remapped keyboard Q and controller L3 help, actual Q sword sequence, practice tap prompt plus guidance, and touch practice/help presentation; 4/4, final source, no runtime exceptions.

Chrome ran in isolated temporary profiles at 800×500. CK start/seat setup and a distant inert opponent are direct fixtures. Sword checks use real CDP key/mouse events or injected standard gamepad objects sampled by the game's actual animation-frame poller, with the normal simulation running. No direct `update`, `adv` or `startSwing` invokes drive these checks. Recorded RAF states show light swing → recovery with cooldown and no charge → held charge → release heavy. Pad phases retain actual poll samples. The final combat fixture removes weapon pads/pickups and requires two neutral observed frames before pressing.

## Rendered findings

The new Fight instruction text, including the one-heart/knockback/guard-break explanation and pickup distinction, is fully visible after ordinary scrolling. Its exact DOM Range spans y=96.85–334.98 at 800×500. The entire Fight card extends to y=557.11 because it also contains unrelated block/dash rules; that full-card box is not the new guidance's bounds. Final help and Back each remain reachable by ordinary scroll, and Back was activated through CDP mouse input.

Practice preserves the tap lesson and adds a separate bound hint. Both are visible simultaneously: prompt y=383–406, hint y=406–444. Q / left click appears in keyboard practice; touch uses Swing. Remapped pad help names L3. Touch is an explicit synthetic PointerEvent presentation fixture, not physical touch execution.

The actual early-card draw path produces the hold/recovery/release sequence for a sword and fits the compact canvas. An all-local-pickup bow fixture shows firing guidance without a heavy/charge promise. Canvas capture uses a direct early-clock fixture and `CK.draw`; this is rendered evidence, not input-only navigation.

Useful final screenshots:

- `help-final/guidance-howto-fight-guidance-800x500.png`
- `help-final/guidance-howto-keyboard-800x500.png`
- `help-final/guidance-howto-back-800x500.png`
- `guidance-early-sword-800x500.png` and `guidance-early-pickup-800x500.png`
- `ui-final/guidance-howto-remapped-pad-800x500.png`
- `ui-final/guidance-practice-swing-800x500.png`
- `ui-final/guidance-practice-touch-800x500.png`
- `ui-final/guidance-howto-touch-800x500.png`

## Preserved failures and limits

Attempt 1 incorrectly required the whole Fight card to fit simultaneously. Exact guidance Range measurement and separate normal-scroll screenshots corrected the assertion. Attempts 2/3 used an insufficiently bounded initial fixture (a removed opponent and/or unbounded match time); no useful pre-input diagnostics were retained, so they do not establish a game defect.

Attempt 4 and the first focused mouse diagnostic recorded a held input reaching charge but failed to observe initial light. The focused trace proves the recorder was active; its absent pre-input/weapon state means the cause cannot be established retrospectively. A subsequent focused run retained a neutral pre-press state (no weapon, no charge/swing, `atkWas=false`) and the complete ordered light/recovery/charge/release trace. That successful observation does not erase or explain the earlier failure. The bounded final fixture additionally removes arena weapon contact and gates on live neutral frames.

The first remaining run passed mouse/pad checks, then direct UI setup hit an existing missing-pad recovery overlay when the fixture removed a still-owned pad. Clearing fixture seats before removing the pad allowed the separate UI run to complete. No runtime code was changed for these harness issues.

Physical input, novice/experienced comprehension, controller ergonomics, responsiveness, packaged EXE behavior, human couch acceptance and WAN play were not tested. These remain human/product acceptance, and this review does not close all FE06 work.

## Independent source/evidence review

/root/room_contract_audit (gpt-6-luna high, read-only) cleared the final bounded task at index SHA256 `8342eb96fef62905b7e42de81bfe922416666730997044fa0eb74385208dd42f`. The reviewer checked the actual first-light/held-recovery/charge/release state machine, one-heart/guard-break/extended-reach claims, Long Sword versus pickup distinction, source tester guide, final mouse wording and each retained report's scope. Initial whole-card overflow was separated from the visible new instruction Range. Remaining-run UI error was not counted as remap/practice/touch acceptance; the separate final UI report supplies that evidence. Root also visually inspected compact Fight, practice and touch screenshots. Neither review reran tests or established human/device acceptance.
