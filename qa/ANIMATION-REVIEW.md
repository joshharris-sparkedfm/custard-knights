# Animation and gameplay presentation review - 0.2.1

The refined sheets come from the actual game drawKnight renderer, with fixed entity states and labeled elapsed attack times. They show four attacks, charge/dash/hitstun/guard-break/whiff cues, and Golden Whisk + Rooster Crown + Tea Towel in five directions. Both refined sheets use 1.25x game drawing scale; the original baseline uses 1.7x, so compare poses rather than absolute size.

## Changes

- Light: compact raised anticipation, short pale contact trail and explicit recovery.
- Heavy: deeper wind-up/body compression and broader warm contact trail. Charged reach is reflected in the weapon presentation.
- Dash-stab: straight thrust and retract rather than rotating sword. The procedural weapon no longer receives the old extra half-range extension on top of a full-length blade.
- Shield bash: shield-led shove with sword suppressed. The classic shield sorts in front when facing forward during the bash.
- Charge: held wind-up with steady progress arc. Dash lean/trails follow velocity. Hitstun keeps a geometric pose and stars with white flashes disabled. Guard break and whiff have separate brief cues.
- Baked body frames follow actual startup/contact/recovery. Procedural weapon and costume layers share body transforms; away-facing custom weapons sort behind the knight. Overhead labels clear the taller earned crown.
- Online swing timers retain millisecond precision instead of rounding to 100ms. Charged reach, guard-break and whiff cues travel with snapshots; guest presentation timers advance between packets.
- Controller A toggles checkboxes; Left/Right adjust sliders, while Up/Down navigate. Collection rerenders preserve semantic focus/scroll. Minimum desktop window no longer overflows horizontally. Result portraits remain 180 x 150 pixels.

## Timing and validation

Simulation attack durations, damage, range, cumulative hit arcs, cooldowns, input rules and hitstop are unchanged. Existing contact is strictly after 60ms and strictly before duration minus 60ms:

| Attack | Duration | Contact window |
|---|---:|---:|
| Light | 220ms | 60-160ms exclusive |
| Heavy | 300ms | 60-240ms exclusive |
| Dash-stab | 180ms | 60-120ms exclusive |
| Shield bash | 180ms | 60-120ms exclusive |

41 focused browser checks pass: actual update/doHit startup, contact and recovery for every attack; distinct contact images; charge vs idle; reduced flash; five-direction costume rendering without entity mutation; overhead clearance; host snapshot/guest cue parity; controller menus; focus/scroll retention; actual result portrait dimensions. Screenshot labels use fixed collision-window expectations independently of the new presentation helper.

24 release regression checks and 21 real PeerJS acceptance checks pass after the changes. Native Electron journey passes six targeted checks including 784 x 561 client area at the minimum 800 x 600 outer window.

Commands: node qa/animation-review.cjs delivered; node qa/animation-review.cjs delivered classic; node qa/run.js regression; node qa/network-acceptance.cjs.

This is a visual/correctness refinement, not evidence of a balance improvement. Rendered image differences do not substitute for a novice observer study. Controller inputs were simulated through the real polling path; physical controllers and different-network latency/NAT remain unverified. Network acceptance used isolated profiles on one machine/network. Performance and refined-build soak are recorded separately by the release audit.
