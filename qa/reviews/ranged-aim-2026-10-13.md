# Ranged aim engineering review

13 October 2026. Bounded FE-04 prerequisite on `codex/ranged-aim-contract`, based on `ca0ec8e`. Implementation owner: Sol; independent browser QA: Luna; independent source reviewer: Sol. This records source, synthetic input and same-machine live PeerJS checks. Physical controller ergonomics, household/WAN play and packaged acceptance remain separate.

## Input and cue policy

- Arena, Story and Cup share a circular right-stick deadzone of `.22`; Faction Front uses the same helper. The raw vector angle survives outside the deadzone, including diagonal vectors whose components are individually below `.22`. Left-stick movement and existing fire/heavy/guard bindings are unchanged.
- Explicit pad aim persists when the stick centers, including during left-stick movement. Keyboard movement can return to movement-facing when the right stick is neutral. Mouse movement/click or a deliberate stick change reclaims aim; a parked pointer or unchanged stick cannot reclaim it each frame. A `.015` cumulative raw-stick change detects deliberate ownership switching.
- Mouse input belongs to the `kb1` couch seat, wherever that seat sits, or classic local P1. Prompt device state does not decide gameplay ownership. Classic pad assignments latch actual device indices per local entity and exclude indices already owned by another local entity. Faction selects a standard pad index and retains it until disconnect. A native guest resolves its local entity through `NET.me`; host-side remote input continues through the existing wire contract.
- Controller arena cues show a dotted direction and outlined crosshair up to 110 world units ahead; the cue shortens along the same ray at viewport/world edges without changing the shot angle. Faction shows the mouse world point or a pad crosshair 150 units ahead, using its camera/zoom transform. HUD instructions include right-stick aim and Faction click/right-click bindings.
- Pause/modal/blur clears held local keys and pointer actions. Held pad combat actions require release after input reset; menu navigation still reads the raw buttons. Faction UI blocks aim updates behind its modal. Aim ownership lives in closure state/WeakMaps, without new saves, snapshot fields or protocol versions.

## Changed source

`index.html`: arena ownership, retention, cues, input reset, prompts and QA observations. `game/mass-battle-ui.js`: Faction ownership, retention, cue, input reset, HUD and QA observations. New `game/input-aim.js`: shared radial aim and crosshair drawing. Combat damage, saves, cosmetics and `game/mass-battle.js` remain unchanged.

## Focused checks and review

Using `C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`:

```powershell
$node = 'C:/Users/Joshua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
& $node --test tests/pause-controller.test.cjs tests/mass-battle-private-ui.test.cjs tests/desktop.test.cjs
& $node --check game/input-aim.js
& $node --check game/mass-battle-ui.js
git diff --check
```

The combined focused run passed 26/26. After the final classic ownership/shout adjustment, the affected pause/controller run passed 7/7. Inline scripts parsed successfully; direct shared-helper assertions passed axis-boundary, diagonal and invalid-value cases. A shipped-function VM check passed sparse initial index, late connection and disconnection ownership. Existing staging tests verify inclusion of future game modules; no package was produced.

The reviewer caught a late-connect collision: with P1 initially owning sole pad index 1, inserting index 0 made an unbound P2 select the already-owned index 1. The fix excludes all latched local indices during assignment and resolves shouts through the latched owner. Static review cleared this finding.

## Browser and live PeerJS evidence

[`qa/ranged-aim-browser.cjs`](../ranged-aim-browser.cjs) runs Chrome with a temporary profile and synthetic devices at the navigator/CDP boundary. Evidence and source hashes are in [`qa/results/ranged-aim-2026-10-13`](../results/ranged-aim-2026-10-13). Earlier failures included fixed Faction-ID assumptions, circular entity serialization and pointer targets outside the canvas; bounded targets now log the hit canvas and actual pointer events, and scaled Roomier firing passes.

Final focused Chrome evidence passes 20 checks with unchanged production hashes. Earlier fixture corrections included recognizing that a parked cursor's world-facing angle correctly changes while the player/camera moves, and wiring the sparse-pad array through the actual navigator boundary. The final cases cover retained mouse ownership, real Roomier bow trajectory, neutral pad aim while moving, radial diagonals, per-seat mouse and late-connected pad ownership, cues, camera transforms and input clearing. They do not establish physical-controller feel.

The full relevant live PeerJS fixture passes all 16 checks, including guest aiming, host-owned projectiles, guard, protocol validation, Chicken Race pecking and snapshots, with no runtime exceptions. Its first attempt failed after deliberately dispatching blur and then starting another scenario without restoring focus. The new production input suspension correctly continued until focus; the fixture now dispatches focus after verifying the blur sentinel and before subsequent play. The original failed report is retained under `online-guest/attempt-1-unfocused-report.json`. Independent review confirmed the narrow fixture correction, stable production hashes and passing final evidence. This is same-machine two-peer evidence, not household/WAN acceptance.
