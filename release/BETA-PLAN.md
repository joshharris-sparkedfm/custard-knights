# Private Windows friends beta

**Target: 0.3.0-beta.4.** Movement/spawn fixes, expanded weapons and bounded guest prediction have been exported through beta.3. The next kit adds chaos presets and rare events after focused checks and source freeze. PREVIEW-BUILD.md identifies the latest completed export. Keep Joshua's existing player window intact while building separately. This is a feedback milestone, not a finished-game or public Steam-release claim.

## What friends receive

One versioned ZIP containing the complete Windows x64 game under `Game/`, `START-HERE.txt`, the offline `FEEDBACK.html` form and `BUILD-INFO.json`. Offline arena/bot play, the eight-encounter story chapter, the three-round Cup, Faction Front bot practice and saved wardrobe/progression are the starting scope. Twelve native WAV candidates (including the rare Oh Nae Nae song) and the existing menu theme are included; musical fit and repeat points remain under review. Friends do not need Steam, Node, Python or a separately downloaded runtime.

## Freeze, export and invite

1. Finish the current UI/server fixes, review the changes and record the frozen source revision. Keep the currently running alpha.6 window intact while Joshua reviews it; packaging does not require replacing that running installation.
2. Build the actual `0.3.0-beta.4` Windows candidate after the version bump. Record source revision, export ZIP SHA256 and packaged `app.asar` SHA256. Extract into a fresh folder and verify that the exported game launches with its sibling files and supplied music; preserve older archives separately.
3. Wrap that verified export with `scripts/playtest-bundle.py`, using its recorded version and hashes. Verify the kit's integrity and embedded identity. The feedback page is unchanged; reuse its existing behavior evidence rather than repeating that entire UI check solely for a new version string.
4. Provide the complete friends ZIP through a private download link, with its size, SHA256 and the invitation message below. No public upload, endpoint or recipient list is assumed. Record the actual archive/link only after it exists.

Suggested invitation, filled with the actual version and download link:

> Here is the private Custard Knights Windows beta: [download]. Download the ZIP, use Extract All, then open Game and run Custard Knights.exe. Start with the short guide in START-HERE.txt and try about twenty minutes without coaching. When finished, open FEEDBACK.html, save your report and send it back here. This is a test build: getting stuck or finding something frustrating is useful feedback. Please include the build number if anything fails.

## First-session feedback

Start with two quick brawls, the opening story objectives, a Cup or 4v4 faction bot battle, and a wardrobe/save/restart check. Ask what felt good, what was confusing, and whether the player would choose another round. Request the build, mode, difficulty, input device, human/bot counts, reproduction steps and exact message for failures. Optional screenshots/clips should exclude credentials and unrelated private information. The feedback form sends nothing automatically; the player chooses when and where to send the saved report.

Treat crashes, lost saves, blocked objectives, persistent input delay or failed basic joining as blockers to wider invitations. Keep reports linked to their build and verify the specific failed task after a fix. Do not label hardware or cross-household tests complete until someone has actually performed them.

## Optional online session

Original arena room-code play needs internet connectivity and still requires different-household testing. Faction Front uses a separate host-operated server; offline bot practice is the default unless a reachable test endpoint is supplied. For a private 4v4 ladder session, schedule eight distinct players and issue keys individually; 20v20/50v50 queues need 40/100 humans and do not add bots. Explain the total 20-second absence budget and forfeit policy before joining. A server restart does not resume a live match. There is no deployed public service, Steam authentication or party queue. Keep access keys and private endpoint details out of public materials.

## Known limits to communicate

- Windows x64 only; unsigned executable and minimum hardware still unestablished. A blocked launch should be reported with its exact message, without asking friends to weaken security settings.
- Physical pads, Steam Input, different-household connectivity, large human faction matches and gameplay balance need real-player/device evidence. Automated tests are supporting evidence, not replacements.
- Music is supplied and playable, but human listening/loop approval is open. Another Helping retains roughly 1.595 seconds of trailing silence; no claim of seamless loops is made.
- Native failures in development automation remain under investigation; do not infer that a later pass establishes their cause or repair. Report actual beta crashes separately with their build and steps.
- Saves remain under `%APPDATA%/Custard Knights` and are shared by builds. Keep installation folders separate and use the game's backup/export workflow before experimenting; do not delete the save directory as troubleshooting.

This private beta does not resolve Steam onboarding, store review, pricing, platform features, public hosting or release acceptance. The distribution checkpoint records what friends can download and test now, with those limits visible.
