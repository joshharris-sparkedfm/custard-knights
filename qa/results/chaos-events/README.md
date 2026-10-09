# Chaos settings and rare events: actual-browser QA

`final/report.json` passes **83/83 checks**, with zero recorded browser exceptions and zero native media errors. The harness uses isolated headless Chromium profiles, the actual game engine, and the installed original WAV. No production files, user game window, or normal player profile were changed by this QA.

The final report records source hashes before navigation and verifies they remain unchanged after testing. Runtime index SHA-256: `3c27c03c9593b91c03afbf002c03387ae0d83dd32009774d0d40784d8a17df5d`. Installed rare music SHA-256: `b0a29f48c7300e2a9e807f0b616b127c237f4436e5929d007c15e1d2655de917`.

## Coverage

- Actual settings UI persists Simple/Normal/Insane. Fresh document reloads of legacy `fast` and `unhinged` saves both produce Insane while retaining Hard difficulty.
- All eight arena modes keep Simple at zero after a real KO and scheduled escalation opportunities. Explicit mayhem, global-event, Steve, Norr and higher-tier pickup entry paths are blocked; generated pickups stay tier one. Ordinary Crossbow combat remains available.
- Normal retains its 115-second clock pacing at all four difficulty settings. Insane starts at 0.33 and remains bounded by 1 at all four settings.
- Forced low-roll plans for each rare event initialize only once, wait unchanged while busy, select a living eligible human, and cannot activate a second rare event. Controlled first/last recipient samples select different humans. Event odds themselves are covered by the separate pure-module tests; this fixture does not claim statistical sampling evidence.
- Race, Simple, actual campaign boot and actual Faction entry cannot activate arena rare events. Campaign boot allocates neither an arena policy nor a rare plan. Faction's separate simulation carries no rare plan or AK equipment. Guests cannot choose a rare activation. The pure eligibility tests separately cover ranked/faction flags; no ranked network replay was added to this browser fixture.
- AK: actual attack input, 30 starting rounds, 0.12-second firing cadence, ammunition exhaustion, 12-second expiry, and cleanup after death, falling, weapon replacement, round end, menu and rematch.
- McGinley: enemy eligibility, spawn protection, guarding, ally exclusion, actual map line-of-sight obstruction and range; no more than eight one-damage strikes over ten seconds; cleanup after death, falling, end, menu and rematch.
- Review regressions: a real normal dash is immune at `dashT=0.16` and vulnerable after it reaches `0.043333...`. The actual `hostDrop` callback converts a recipient into a bot, and both powers clear on the following rare-event update. Fractional start time `63.9` produces valid guest snapshots with remaining time exactly bounded to 12/10 seconds.
- Installed `audio/13-oh-nae-nae-whats-your-name.wav` loads and plays through the native music element, reports 90 seconds, and advances its playhead. Paused activation waits for resume. Sixty repeated guest snapshots do not change native play/load counts or reset the playhead.
- Guest lightning snapshots remain presentation-only: no local HP, score or death changes. Removal packets and local guest expiry restore match music. Match expiry/rematch, result and menu transitions retain their respective music priority. A late rare snapshot cannot replace a completed round's result cue. Exactly one native `Audio` instance remains in use.

## Visual evidence

- `final/nae-reduced-flash.png`: actual AK equipment, ammunition pips and rare-event owner/time/ammo HUD.
- `final/mcginley-reduced-flash.png`: actual unobstructed lightning strike with reduced flashes and zero shake, struck knight feedback and event owner/countdown HUD. The fixture asserts that an actual lightning particle was emitted. The reduced-flash connecting effect is intentionally faint at this scale.

The final visual fixtures remove the initial player-location overlays and place both actors on real open Courtyard terrain. They do not fabricate map hazards or pickup locations.

## Preserved iterations and review changes

- `first-mechanics`: 60 mechanics checks passed before the music-specific extension.
- `with-music`: 76 checks passed with native media and guest snapshot presentation. Its diagnostic screenshots still showed initial player overlays and used a line blocked by the central fountain, so they are not the final lightning visual evidence.
- Independent source review then identified missing recipient-to-bot cleanup and dash immunity guards; the implementing agent corrected them. A fractional-time snapshot clamp was also added to avoid rejecting a first packet with floating-point duration slightly above the limit.
- `review-fixes`: 83 checks passed, including those new regressions and an actual reduced-flash lightning effect.
- `final`: the two shallow legacy-normalization checks were replaced with actual saved-profile page reloads. All 83 checks pass against the final source. No failing checks were hidden or weakened.

## Limits

This is focused integration coverage with controlled inputs and deterministic forced rare plans, not a gameplay soak or evidence that a particular unforced match will receive a rare event. The disconnect check invokes the real callback with a synthetic peer record; guest presentation checks deliver real serialized snapshots through `clientRecv` without a transport connection. Live multi-profile PeerJS acceptance is separate. Media output is silenced at the browser; native decoding/playback and routing are verified, not speakers, musical quality, licensing, or human listening. Reduced-flash screenshots do not establish physical-device or every-resolution accessibility acceptance.

## Frozen beta 4 package

`node qa/chaos-events.cjs qa/results/chaos-events/packaged --packaged` passed **85/85 checks**, with zero browser exceptions or native media errors. This reruns all 83 final checks against the frozen `app.asar`, adding checks for the real `custard://game` protocol with renderer isolation and blocked external network.

- Runtime source commit: `6eec04154419dbab0c3cc5f2a5a6936a60ce3f45`.
- Packaged version: `0.3.0-beta.4`.
- Archive SHA-256: `1920f8077f0c15af57d36d346eba84ee6ef6c172838f546e233f3f51caad4a95`.
- The six content hashes in `packaged/report.json` are computed from files extracted from that archive. The archive and content hashes are checked again after testing; all stayed unchanged.
- The installed rare-event WAV reports 90 seconds and advances through native playback. Sixty repeated guest snapshots retain the same play/load counts. Expiry, menu, rematch and result music priority pass, with one music element and no media errors.
- `packaged/nae-reduced-flash.png` and `packaged/mcginley-reduced-flash.png` were visually reviewed: held AK, ammunition, rare-event HUD, struck-knight feedback and the reduced-flash lightning effect are readable at the packaged runner size.

This is packaged asset/protocol acceptance through the existing hidden Electron QA runner, using a fresh temporary profile. It does not launch the normal packaged EXE entry point; its lifecycle acceptance is recorded separately by the release task. No production files, source assets, or archive contents were changed for this run.
