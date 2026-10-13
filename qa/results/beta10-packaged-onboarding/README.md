# Actual-ASAR beta.10 onboarding checks

Frozen runtime `88a974bc1b5ec1166c1cae62e03d3aa9b1d7f61e` was built, its actual app.asar extracted to build/beta10-packaged-payload, and qa/onboarding-browser.cjs run with CK_QA_ROOT pointing to that extracted payload. The first attempt passes all 38 checks with zero console errors, no failure, and stable before/after source hashes matching the package inventory.

Coverage includes optional fresh welcome/skip/reload, 800x600 reachability, genuine keyboard/mouse lesson actions, pause/retry/blur/leave at every stage, remembered rules/couch seats and no progression/report events, existing profiles, sound/effect settings, synthetic standard pad movement/aim/fire, held-entry input, denied storage and corrupt records. report.json records checks, source hashes and screenshot hashes; PNGs preserve observed states.

Chrome uses temporary isolated profiles. These checks run the actual packaged source in Chrome, not the native EXE. Separate native package acceptance and welcome/skip/replay smoke are in ../beta10-desktop. Physical controllers, human usability/fun/balance, WAN/second-PC, minimum hardware and Steam acceptance remain open. No normal user saves, user game, sending or public upload are involved.
