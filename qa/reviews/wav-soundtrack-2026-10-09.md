# WAV soundtrack integration — 9 October 2026

The user authorized generating the missing songs in the logged-in Suno account and requested WAV. Eleven prompts produced two variants each; the first exported variant from each prompt is installed as a playback candidate. The existing menu MP3 remains unchanged. No MP3-to-WAV conversion, resampling, trimming or mastering was performed.

All twelve game cues are enabled. The eleven WAVs total 378,261,680 bytes and are retained in Git so a fresh clone contains the actual music. Each is 48 kHz stereo, 16-bit integer PCM. Original download, retained master and installed bytes match recorded SHA-256 hashes. Source links, observed generation settings and the existing rights confirmation are in `release/music/source-provenance.json`. Suno publication was not requested or performed.

## Technical evidence

- The PCM inspector produced complete records for all eleven files, with no reported malformed/truncated audio or full-scale samples. This is not a distortion or loudness assessment. The full invocation produced valid complete JSON but the local wrapper then reported nonzero completion; this anomaly remains recorded. An earlier four-file pass completed cleanly. Local native runtime failures remain unresolved.
- Five synthetic PCM-inspector tests passed. Ten focused catalog/desktop tests passed, including WAV staging, WAV preference and MP3 fallback.
- Actual Chrome checks passed 83 assertions: all twelve native playback clocks advance, eleven WAV decodes match their stereo/sample-rate/frame metadata, scene routing/volume/mute/fade-stop work, and only one music instance exists. Zero media errors or browser exceptions were recorded.
- Twenty-six release regression checks passed, including installed cues and missing-catalog fallback behavior. Earlier browser harness setup/timing failures are retained and explained in `qa/results/soundtrack-browser/README.md`.
- Packaging, packaged media and export evidence is recorded separately in `qa/results/wav-soundtrack/` and PREVIEW-BUILD.md. Source/browser checks alone do not establish packaged acceptance.

## Listening remains necessary

These tracks were not selected by a human best-of-two audition. Musical fit, absence of unwanted sung phrases, physical playback, mix balance against combat cues and loop seams remain unassessed. Another Helping has 1.595 seconds below the inspection silence threshold at its tail; repeating it may leave a gap. It is preserved unchanged for review.

Run `python scripts/soundtrack-review.py --repo . --output <review-folder>` to create an offline page with all twelve players and source links. The local review is under `outputs/Soundtrack-WAV/index.html`. This addition removes the missing-export dependency; it does not certify soundtrack artistic quality or overall sales readiness.

Independent CI on source d15c4b66f66b489241343f9c4e282f4e58b46868 passed on the first attempt: soundtrack run37926851264 on Windows/Linux verified ten JavaScript tests, five Python tests and all original WAV/menu hashes and cues; general run37926851163 passed all six jobs. Both frozen ZIPs passed integrity and73 game-file equality checks. See qa/results/wav-soundtrack/ci-summary.json and export.json. These passes do not resolve the separately documented local native runtime fault.
