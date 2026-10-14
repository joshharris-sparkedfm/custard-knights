# FE09-D Rind witnessed rescue: independent browser QA

14 October 2026. **44 distinct selected checks pass; no unresolved browser-check failure.** Evidence is actual keyboard/CDP movement and sword inputs in a temporary isolated headless Chrome profile, with individually labeled copied-save, transition/hazard, stun, failed-outcome and theatre-preview fixtures. It is not an input-only Rind boss playthrough or physical controller, human recognition, TV-distance, WAN, Steam Input, native startup, GPU or packaging acceptance.

Initial behavior source: `8c48d17d7f58917a80d789cba914195f561c9114`. Final source: `706a31286c166517c268123c4183bb6f42e2590d`. Initial campaign SHA256 `de6846b9f1eeb0c1b6f27c3bf291bb3ca3a1ac9744ae9f7439294d8189adae19`; final campaign `f9927fb37cf1668954a45dc1427659540545dddc3fcf55ef021d9eb2ec16d722`. Unchanged helper `07d9977b5b3a9c90271a52a08b448702d500dd3e8aa4de92193dc5d87e4b7cb1`, scenes `babf46ee01857b11faffae1b7973d5a3b42b7e750ea6e1b2af9ac8f30725de20`, index `2c36260d4822db1ed39b08599b6980b218df9733da4628628255e75406dc8bdb`. Both reports record complete runtime hashes before/after and confirm stable bytes.

## Evidence

`../results/rind-rescue-2026-10-14/summary.json` selects the latest result per named assertion: 44 pass, 0 fail. `manifest.json` hashes retained reports, screenshots, this review and the harness. `qa/rind-rescue-browser.cjs` supports `CK_QA_ROOT` for a separately reported packaged-assets check.

`run1/report.json`: 39 pass, 2 harness assertion failures. Actual guard/Rind intro/outro theatre captions and compact bounds pass; replaying/viewing cannot award again. Bran retains the service-crossing name and recognisable cream-striped shield at the actual membrane tile (22,8). Rind remains visible with a lowered spoon as neutral scenery. Legacy phase1 reconstructs the 4HP shield wall; phase2 reconstructs safe rescue. Both saved checkpoints survive document reload without save/collection mutation.

The adversarial transition fixture seeds valid projectile, bomb, mine, bees, flock, banana, warning/effect, buff and attack fields immediately before an injected defeated-boss KO event. All clear on the same-frame rescue transition. A separately labeled dead-flag fallback fixture clears them on the next update. Ten seconds of live rescue waiting holds a finite countdown, causes no lash or damage, regenerates no hazards, and awards no completion/collection receipt. Actual movement remains available; `quietStory` remains false. The fixture does not introduce arbitrary new hazards after the production transition.

Actual keyboard sword inputs cut the real membrane. Bran becomes free while the encounter is still playing and rewards remain unchanged. Bran visibly walks clear; Rind moves to the winch side; only after both settle does the existing terminal result award once. Resumed rescue cannot earn the fresh flawless spoon. Duplicate terminal calls leave save and collection unchanged. Actual pause → Quit to menu clears the rescue countdown flag; the next ordinary guard arena counts down normally and contains no rescue state.

`corrections/report.json`: 12 pass, 0 fail on final source. Corrected phase1/2 UI Retry assertions pass. The added regression seeds a tracked opened trapdoor, pending trapdoor and unrelated untracked pit before the KO transition: only the tracked open trapdoor returns to floor, pending holes clear, and the untracked pit remains. Player stun/slip/goo/fall fields clear and actual movement works afterward. This is adversarial residual robustness; ordinary Rind has no trapdoor generator. The unchanged full route/theatre suites were not repeated.

No uncaught browser exception occurred in either run. All normal user profiles and saves remained isolated from this QA.

## Preserved failures and visual limits

The original UI Retry assertions required `results.rind` to be absent after failure. The existing save contract correctly records a failed attempt/receipt with false spoon booleans. Retained states show the expected phase, resumed flag, healthy player, 4HP phase1 boss and safe phase2. The corrected assertions require the completion spoon to remain false; no runtime retry change was needed.

At 1280×800 and 800×500, the persistent HUD, actual membrane/Bran and neutral Rind can appear together. `03-safe-witness-after-wait-800x500.png` records this after the opening banner expires. The crossing and rescue captures show the same shield detail. Some transient in-world name/speech lines overlap as the recruit and witnesses cluster or walk after the cut; the persistent objective and target remain readable. These captures establish local rendering and route state, not that an uncoached player recognises Bran or understands Rind’s change of allegiance.

This D stage retains the existing terminal award after rescue and has no phase3 diversion. Its actual outro says the bowl is still aimed at the ovens; it does not claim the bakery has already been saved. The cooperative finale/homecoming remains later work.
