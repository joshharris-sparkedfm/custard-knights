# Optional first-launch setup and real-action practice — browser QA

13 October 2026. Actual isolated Chrome / CDP, bundled Node, temporary browser profiles only. The owner's normal game, saves and browser profile were not used. `qa/onboarding-browser.cjs` supports `CK_QA_ROOT` for an extracted packaged tree.

## Result

Final run4 passes **38/38** actual-browser checks with unchanged production hashes and **zero Runtime exceptions**. It adds the first-launch minimum-window and pause-Retry checks to the passing run3. Setup is exercised on the ordinary file URL (no QA query), then the same isolated profile navigates to `?qa=1` for read-only arena observations. Production actions are dispatched through real CDP keyboard/mouse events or a synthetic standard `navigator.getGamepads()` boundary; no lesson state or completion flag is directly set.

The implementation owner separately reports **65/65** affected tests covering onboarding, home navigation, preferences, pause/controller, first fight, product events, progression and weapons. These counts are owner-reported; this browser review does not relabel them as independently rerun checks.

## Evidence

- Fresh setup is optional; Skip persists; actual range/checkbox controls save and reload in Options. Existing settings/config/played data bypass setup without reset. Denied and corrupt storage remain navigable.
- Real keyboard movement, swing, held guard and dash advance their respective stages. Ranged remains incomplete after idle and completes after a changed mouse aim plus actual bow fire. Synthetic pad movement/A/X/B and changed right-stick aim plus A also complete practice.
- Waiting does not complete movement or ranged. Held entry Space cannot become a carried swing after movement. Pause freezes gameplay; retry resets the movement stage. Blur clears inputs; the harness supplies the matching focus event before further gameplay.
- Exit at each of the five phases restores remembered cfg and synthetic couch-seat ownership, leaves Cup/study absent, and makes no progression/collection/campaign/played writes. Local reporting is actually enabled in the isolated profile before event checks; genuine practice completion and phase exits create no normal-match product events.
- Retry, replay from How to Play, completed Leave and restored practice-trigger focus pass. Practice HUD fits 1280×800 and 800×600. Screenshots of first-launch setup at 1600×1000 and 800×600, and practice at 800×600, were visually inspected and are readable.

Production SHA-256 for stable runs3 and4:

- `index.html`: `7d46b89df2553d1249e244b6e20df0d77f09692123a36dbac59f2aa72322556f`
- `game/onboarding.js`: `9d4d863d67ae860c509f4198c8870b92051333db70870f47384a6e9bfe17be90`

Reports include before/after source hashes, screenshot hashes, action observations, environment and failures. Evidence: `qa/results/onboarding-2026-10-13/run4/report.json`, `fresh-offer-1600x1000.png`, `fresh-practice-800x600.png`, `setup-pad-completed.png`.

## Retained diagnostics

Run1 failed four later-phase exit preconditions because the harness dispatched blur without a matching focus. The arena correctly stayed input-suspended and the lesson remained at movement; restored config/seats/events were already correct. This is classified **QA fixture lifecycle**, not a production failure. The harness was corrected; production was not weakened. Run1 screenshots/report remain retained. Run2 passes 34/34 checks (before opt-in reporting assertions). Run3 incorporates opted-in event exclusion and final ranged/pickup hardening.

## Limits

This verifies actual Chrome with synthetic pad input. It does not establish physical controller behavior, human comprehension/fun, minimum hardware, native EXE, WAN/Steam or a second Windows PC. `CK_QA_ROOT` supports actual packaged-ASAR extraction verification next. Existing Cup/study instances are not fabricated or normal matches started to manufacture practice fixtures; their entry rejection and ownership contract are additionally covered by source review/affected tests.
