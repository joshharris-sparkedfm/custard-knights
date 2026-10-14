# FE10 faction identity visual QA — 2026-10-14

Candidate runtime freeze: `0b3d2c69adcedac51a7786c71043afd4bcd54743`.
Comparison base: `5899a2eb759f02d04144dcdc3384e79ffcbcff42`.

Focused checks pass in `checks.json` and `dense-capes-checks.json`. `manifest.json` records file hashes and the exact index source diff; both check reports contain raw before/after source hashes and LF-normalized source hashes. Existing Windows checkout conversion means raw Git-blob versus checkout hashes differ even for unchanged files. LF-normalized hashes match for the battle core, battle UI, protocol and all four accepted knight/hero visor sprite sources. Index changes are limited to loading faction art, the shared draw hook, and the battle entity faction opt-in; no stats or hitbox code changes.

## Results

- 32 inactive-faction and 32 unknown-faction actual-renderer PNG fixtures exactly match the baseline HTML renderer. Both visor families, four facings, idle/guard/attack/bow are covered. Baseline HTML is served with identical current static assets in the isolated local read-only fixture server.
- 32 faction pairs produce different visible pixels for each faction, while rendering preserves entity JSON and canvas state.
- 64 cache on/off actual-renderer pixel comparisons match exactly. Cache eviction finishes at 33,484,800 bytes against a 33,554,432-byte limit. Faction geometry remains outside composition/cache keys.
- Eight-direction color/grayscale shared-renderer sheets cover closed/open visors, front/back, guard, attack, bow and cosmetics. `actual` sheets use 1x local draw scale; `detail` uses 1.6x. Actual gameplay camera scale appears in the crowd captures.
- All eight cape variants retain faction pixels in four facings for both factions and both visors (128 fixtures). Inspected rear capes leave the outboard handles or stepped shoulders/grains visible.
- 32 moving/falling fixtures preserve entity/canvas state and retain faction pixels.
- Bot practice at 4v4, 20v20 and 50v50 renders within cache budget. Additional dense positional fixtures interleave both teams in the center at the real gameplay zoom. Instrumentation confirms that the actual battle bridge draws both factions using both visor families.
- No runtime exceptions in either successful run. Runtime file hashes remain unchanged across each evidence run.

## Review images

Start with `sheet-open-actual-grayscale.png`, `sheet-closed-actual-grayscale.png`, `capes-open-grayscale.png`, `dense-50v50.png` and `dense-50v50-grayscale.png`. The ordinary `crowd-*` captures show naturally initialized bot practice at three simulated seconds, mostly home-side groups. `dense-*` captures deliberately reposition players into an overlapping mixed central crowd; they are scripted renderer fixtures, not naturally evolved combat.

I inspected the open grayscale eight-direction sheet, open grayscale all-cape sheet and dense50v50 grayscale frame. The saucepan handles/rounded rim versus stepped shoulders/grain attachments remain distinct in exposed silhouettes, with accepted bodies, faces, weapons and capes drawn in front. Dense overlap and health bars obscure many interior combatants. These images and pixel differences do not establish human faction recognition, role silhouette differentiation, online compatibility, hardware performance, or a human playtest.

## Preserved failures

The first `failure-*.json` records the QA helper rejecting raw hashes because Git stores LF while this existing Windows checkout uses CRLF; the corrected check retains raw hashes and also compares normalized content. The first `dense-failure-*.json` records a QA helper typo calling `toDataURL` on a context; it was corrected to export its canvas. Both failures are preserved and neither represents a candidate runtime defect. Successful reports are authoritative for the stated frozen sources.

The helpers use a newly generated temporary Chrome profile and terminate only the Chrome child they create. No normal game saves or user game sessions are touched. No broad unchanged suite or soak was rerun.
