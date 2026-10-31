# Art direction reset — 29 October 2026

The user rejected the merged community bakery as a visually inconsistent mashup: older cartoon knights alongside more realistic community models. This feedback supersedes the asset-by-asset intake plan. Passing technical tests did not establish visual acceptance. Do not continue the vampire-chef Pip intake or add more isolated scenery to the rejected mixture.

## First reviewable proof

`art/blender/coherent_toy_study.py` builds an editable, consistently modelled scene with two NEW knight proportion studies, Mabel, Alf, Pip, the bakery, bread and trees. Every object shares simple painted materials, softened edges, restrained detail, the same lighting and camera. No photographic texture maps, cel-shaded sprite overlays, image generation or new Meshy generation are used. The preview PNGs are in `art/reviews/coherent-toy-study/`.

This is a **rough 3D consistency/proportion study**, not a finished hero design, production replacement, approved direction or gameplay screenshot. The deliberately simple forms need further character design. The knight still needs its custard identity, distinct helmet families, strong weapon silhouettes, visor alternatives and production rigging. Chef variation, expressions, bakery detail and gameplay-camera checks also remain. Do not substitute this study for the existing production atlas without completing that work.

Rebuild using Blender 4.1.1:

```text
blender --background --threads 4 --python art/blender/coherent_toy_study.py -- <absolute-output-directory>
```

The output includes the real editable `.blend` scene, whole-scene and cast PNGs, and a manifest. The script was executed and both renders visually inspected. Production gameplay files are unchanged; no extra gameplay tests are implied by this standalone study.

## Continuation for Codex and Claude

Review the cast AND environment together before choosing a production style. Update the knights alongside the rest of the game; do not retain the old rendering language by default. Match proportions, detail density, material response, light direction, projection and scale. Source community assets only when they fit or can be reasonably adapted to that agreed language. A free model is not automatically a useful model. Generation remains a last resort for a demonstrated essential gap.

Show the visual proof to Joshua for directional feedback before wider integration. Keep the study on its separate branch until that feedback is incorporated. Then stage a complete small gameplay area with a working knight, cooks, props, animation, lighting and UI together, validate readable silhouettes at gameplay size and retain all saves, cosmetics, equipment sockets and combat timing. Do not declare success from tests or asset quantity alone.

The hourly automation has been updated to prioritize this correction. Historical PR #45 and its technical checks remain true, but its artwork is rejected as the target visual direction.

## Integration checkpoint — 31 October 2026

Joshua requested merging and pushing all completed work. The community scenery/Pip implementation and this separate toy art study are now included together in main. The study remains reference material; it does not replace the production sprites. Earlier instructions to keep the study on its branch are superseded by that merge request.

This checkpoint preserves the work, not visual acceptance. Scale, camera consistency, prop placement and label overlaps still need refinement. The merged code passes all 358 automated tests (none skipped); that result does not establish live gameplay or visual approval.
