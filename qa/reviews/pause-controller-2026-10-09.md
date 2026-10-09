# Controller pause review — 9 October 2026

The shared arena/story/Cup controller router continued treating a paused match as active gameplay. It discarded directional menu navigation and made A unconditionally resume. A controller-only player could open Pause but could not select **Quit to menu**. The real pause panel contains Resume and Quit; it does not contain Settings.

The focused reproduction extracted the shipped `padEdges` function into a Node VM with an active, paused game and a standard-pad input fixture. Right followed by A emitted only `setPause(false)`, with no navigation or activation call. This was a routing defect, independent of physical device mapping or rendering.

The fix routes paused directional input through the existing `menuNav`, and A through the existing `menuActivate`. B and Menu resume. Live-match movement/attack routing and assigned couch-seat shouts remain separate; Menu plus A in one frame opens pause without immediately resuming it.

`node --test tests/pause-controller.test.cjs` passed **7/7** focused tests. These execute the actual extracted router and activation function, with arena, story and Cup state fixtures, Quit/Resume selection, all four navigation directions, B/Menu, live controls and main-menu/couch routing. The DOM navigation and gamepad are mocked; this is not physical-controller or complete browser-journey acceptance.

An additional release issue was reported to the parent for independent handling: the default faction-server Origin filter rejects `custard://game`, used by the packaged desktop's registered standard scheme. A real server and WebSocket upgrade carrying that exact Origin returned HTTP 403. Actual Electron header capture and packaged integration belong to that separate fix.

## Integrated browser acceptance

`node qa/pause-controller-browser.cjs` passed **36 checks** in a real Chrome renderer with a disposable profile and synthetic standard gamepad. Evidence: `qa/results/2026-10-09T07-25-28-pause-controller/report.json`, plus three pause screenshots. Runtime SHA256: `fb4cee753c138b4f9f5a07905fe57cfe05ef89994c7b21ea248c246b7e0cffd1`; verified unchanged from start to finish.

Each arena/story/Cup journey uses the game's match-launch function as fixture setup, then its actual animation loop, pad polling, DOM navigation and activation. Menu opens pause, the real match timer stops, A resumes and time advances again, B/Menu resume, right selects Quit with the visible yellow focus outline, and A exits to the main menu while stopping the campaign/Cup session. No timer, damage, progress or combat state is injected. No runtime exceptions were captured. This remains synthetic-controller coverage, not physical-controller or Electron shell acceptance.

The first pass completed 33 functional assertions without browser focus emulation; screenshots did not show focus rings. Adding focus emulation exposed a harness timing failure: a 100 ms press could precede sufficient animation frames during initial load. The final harness holds and releases each synthetic button over three actual animation frames, and also checks the computed focus outline. The intermediate failed report at `2026-10-09T07-25-00-pause-controller` is retained; no game code changed to make it pass.

Set `CK_RUNTIME_ROOT` to an unpacked package root containing `index.html` to check those exact runtime files. An optional first CLI argument selects the evidence directory. The script hashes source at start/end and still uses Chrome, so pointing it at packaged files does not establish custom-protocol/Electron shell behavior.
