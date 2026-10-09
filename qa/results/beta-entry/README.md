# Beta entry focus review — 9 October 2026

Review started from clean `main` at `b2e1d1b` (alpha.6 merged). Static review of the offline story/Cup launch and quit wiring found no additional confirmed fresh-player blocker. Faction online remains optional, defaults to casual, reports unavailable servers and requires a host-issued key for private ladder access; offline play remains the initial focused action.

## Confirmed issue and narrow fix

Shift+Tab from the first Faction setup select escaped onto the battle canvas behind the setup overlay. The handler returned early for input/select targets before executing its Tab boundary handling. Enabling that handling exposed a second part of the same focus issue: Chromium returns nonempty client rects for controls inside a closed online `details` element, so the focus list also included invisible controls. This affected gamepad navigation as well.

`game/mass-battle-ui.js` now allows Tab through its typing guard and uses one focus-list helper that excludes hidden closed-details controls while retaining the summary. Normal typing, selection, battle inputs, simulation, saves and online protocol are unchanged.

## Evidence

- `focus-before/report.json`: original failure reproduced; backward focus landed on `CANVAS`, outside setup.
- `focus-after` and `focus-diagnostic`: intermediate guard-only fix retained focus on the first select because it attempted to focus an invisible online button; diagnostic visibility observations retained.
- `focus-final`: keyboard boundary checks passed, but the initial fixed 80 ms synthetic gamepad pulse ended before navigation fired.
- `focus-final-bounded/report.json`: all 10 affected checks passed, with a bounded wait for the gamepad navigation event. Covers collapsed/expanded online details, forward/backward keyboard wrapping, gamepad up/down wrapping, ordinary name-field Tab, Escape return to the menu, private-key clearing and zero browser exceptions.

QA used a separate headless Chrome profile. It did not touch the user's running game or normal save profile. No unchanged story/Cup/ranked/network suites were repeated, and synthetic controls are not physical-controller acceptance.
