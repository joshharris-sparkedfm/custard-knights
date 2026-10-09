# Soundtrack browser checks — 9 October 2026

`final/report.json` records 83 passing checks, all 12 enabled cues, 11 native WAV decodes and zero browser/media errors. Every WAV decoded as two channels at 48 kHz with frame count and duration matching its RIFF metadata; native playback clocks advanced. The original menu MP3 remained selected. All source hashes remained unchanged during the run.

Mute pauses playback; changing scenes while muted stays paused; unmute resumes the selected cue. Music volume changes, zero volume, fade-stop, wardrobe/menu/faction/race/hot-pie/arena routing and exactly one native music instance were verified. Browser output was silenced and autoplay explicitly allowed. No claim is made about musical quality, physical speakers, human listening, loop seams or packaged Electron playback.

Earlier harness attempts are retained:

- `first-run/report.json`: the Audio-observation initialization was absent because the CDP Page domain was not enabled; fixed by enabling Page before installing the new-document observer and guarding startup polling.
- `second-run/report.json`: a fixed 300 ms playback-clock assertion failed during menu startup. That early harness did not retain the sampled fields, so the precise cause is unproven. `diagnostic-run/report.json` retained those fields and passed. The final harness replaces the fixed delay with an eight-second bounded wait for more than 0.1 seconds of actual native clock advancement; the final run passed.

These are harness corrections, not production fixes. No game source or build was changed by these browser checks. `qa/release-checks.js` was separately updated to assert installed WAV paths while preserving missing-track and wardrobe-fallback coverage through temporary catalog removal and restoration.
