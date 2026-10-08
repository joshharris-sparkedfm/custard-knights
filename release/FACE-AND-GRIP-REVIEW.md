# Face and sword-grip refinement

Owner direction: retain the current rounded knight, armour, proportions and painted art style. Improve the face substantially, with a more cartoon-like expression, and improve how the sword is held and swung. The independent blockier `hero_v2` study is superseded as the chosen direction.

## Latest face direction

The owner reviewed the large exposed eyes and found them too strange. That bright-eye direction is now set aside. `art/blender/visor_review.py` provides actual great-helmet proofs of (A) a closed steel visor with no visible eyes and (B) small shallow eyes recessed inside a steel-framed opening. The outputs Face-review page shows front, southeast and side views at equal scales. The owner then requested both open and shut as selectable options. Closed is the default; open uses small recessed eyes. Both are implemented in wardrobe, outfit saves and online appearance. All-six-helmet proofs exist; complete production sheets have passed validation. The expensive bright-face bake is staging material only and must not be promoted as the selected release art.

## Findings and sword approach

The original eye geometry and elevated camera leave the pupils difficult to see, resembling bright specks below the visor. The first bright-face study made the pupils readable but exaggerated the exposed whites. The follow-up moves the emphasis to the helmet and narrows the opening. The existing body, custard, plume, colours, weapons and emblems remain the basis of the character.

The current attack renderer can draw a separate arm over a base sprite that already contains a hand. The new path uses an optional arm-free base and projected shoulder, elbow and grip attachment points. Its compact segmented arm, brown mitten and blade move together through ready, charge, contact and recovery. This is a presentation change: attack windows, damage, collision radius, movement, reach and saved cosmetic IDs must remain unchanged.

The visual review also found the shield-side glove floating beside the helmet during block/bash. The original primitive creation bakes its position into the mesh; the block pose then added its target position a second time. The staged generator now places that glove and cuff by visible mesh centre. The complete new families include all ten block frames per layer and their matching occluded companion layers. A corrected great-helmet pilot was inspected across all eight gameplay directions and the detached glove is gone.

## Acceptance before a new candidate

- All six original helmet types retain their identity and have readable faces in front, southeast and side views; pupil and visor edges survive gameplay scale.
- Body, face, team mask, metal mask and occluded companion layers come from a consistent bake. Frame order, cells, anchors and projected attachment points match the runtime contract.
- Each sword has one visible weapon hand. The wrist meets the hilt, elbows bend plausibly, and idle-to-charge-to-strike-to-recovery does not jump between unrelated hands.
- Light, heavy, stab and bash remain visually distinct in all stored directions and mirrored directions. Bash uses one shield. Alternate blades, earned headgear, mount and held-power-up fallback remain coherent.
- Actual hit-window regression checks, reduced flashing, remote presentation, sprite loading, menu/wardrobe hero previews, rendering performance and packaged asset comparisons pass after integration.

Version 0.2.2 passed the acceptance above and is packaged for local review. The existing 0.2.1 archive remains available as the previous tested baseline. The Face-review output page and controlled slow-motion clips are visual review material, not human playtest results or footage of a shipped update.

The frozen sword renderer passed 298 real great-helmet pilot assertions. The final visor-enabled source passed 59 unit tests, 27 wardrobe/persistence/visor checks, 25 live PeerJS checks, 41 animation/collision checks and 24 release regressions. Rear cape/plume views showed no visible arm-shaped holdout holes in the pilot. Those preliminary checks were followed by the complete-family acceptance recorded next. Heavy wrist offsets have been smoothed through the unchanged anticipation/contact/recovery phases; winning poses raise the sword. Final closed/open full-family checks passed 3,225/3,207 grip assertions and 31 combined visor checks. All six helmets, 384px heroes, capes, metal tints, earned headgear, mount and attacks were visually inspected. Six-arena mixed-visor performance measured 60.0–60.2 FPS on this host; packaged offline/online/restart/relocation and eight journey checks passed.

The first complete export stopped during native Blender/OpenSubdiv evaluation. The failure was reproduced with the unmodified original model and in a second Blender version. Diagnostic exports remain separate from candidate assets. The adopted recovery evaluates finite subdivision once at mesh construction, before adding the ink outline. Closed and open six-layer pilots each passed 510 PNGs; their sockets drifted by at most 0.0001 cell pixels. Roughly 2.6% of full-cell pixels differ from the earlier proofs, primarily around shaded edges. Paired front and three-quarter views were inspected and retain the rounded style. Every candidate layer was rebuilt coherently from this generator; old interrupted renders are not reused. The source implementation originated at `af3d7ef`; BUILD-INFO identifies the complete 0.2.2 artifact revision. The staged art manifest records pinned source hashes, all five asset hashes and a recovered Pillow packing failure. No rendered frames were repeated during that packing recovery.
