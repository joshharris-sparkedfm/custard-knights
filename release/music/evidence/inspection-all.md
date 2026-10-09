# Suno soundtrack playback candidates

Eleven original Suno WAV downloads were copied unchanged into `masters/` and installed byte-identically into the game on 9 October 2026. SHA-256 hashes were checked against the downloads, masters, inspection report and installed files. Original downloads remain intact. The catalog now enables eleven WAV candidates plus the existing menu MP3; no menu WAV was manufactured.

**Status: playback candidates, pending human musical and loop review.** Two variants were generated per prompt; the first exported variant was selected without an auditory best-of-two judgment.

All eleven files are 48,000 Hz stereo 16-bit integer PCM. The complete report contains no structural errors or full-scale samples indicating possible digital clipping. Sample peaks are not loudness measurements.

| Slot | Recording | Duration | Peak dBFS | Trailing silence |
| --- | --- | ---: | ---: | ---: |
| 02 | A Very Noble Food Fight | 2:59.72 | -3.17 | 0.000 s |
| 03 | Slippery When Knighted | 2:58.80 | -3.42 | 0.000 s |
| 04 | The Pie Production Line | 2:58.00 | -3.37 | 0.000 s |
| 05 | Too Hot for Armour | 2:59.60 | -2.79 | 0.000 s |
| 06 | Mind the Battlements | 2:58.80 | -3.21 | 0.000 s |
| 07 | Bog Standard Heroics | 3:00.00 | -2.90 | 0.000 s |
| 08 | Run, Little Chicken, Run | 2:58.76 | -3.43 | 0.000 s |
| 09 | Pass the Pie | 2:58.76 | -2.61 | 0.000 s |
| 10 | Dressed to Spill | 2:59.48 | -3.18 | 0.000 s |
| 11 | The Golden Spoon | 2:58.80 | -2.61 | 0.000 s |
| 12 | Another Helping | 2:58.60 | -2.82 | 1.595 s |

**Review flag:** Another Helping ends with approximately 1.595 seconds below the −60 dBFS silence threshold, which may leave an audible gap on repeat. This was retained unchanged. Other tracks have effectively no leading/trailing silence; their boundary clicks and musical transitions still need listening. No loop, perceived loudness, vocal absence or musical suitability has been verified by this file inspection.

## Inspection execution record

The initial PATH Hermes Python 3.11.15 attempt failed with a TypeError involving a range iterator during sample scanning. It did not produce a claimed successful report. A subsequent isolated bundled Python 3.12.14 pass for slots 02–05 completed with a clean exit. The all-eleven isolated pass emitted complete valid JSON with eleven records and no reported file errors, but its PowerShell wrapper then reported nonzero process completion; the exact native code was not captured. The anomaly is retained in provenance. All reported hashes were independently verified after this pass. Five synthetic inspector tests passed under the bundled runtime.

## Provenance

Per-track source links, original download filenames, hashes, encoding and creation settings are recorded in the project’s `release/music/source-provenance.json`. Creation context: Suno v6, logged-in josh_harris Pro account observed, blank instrumental lyrics, custom three-minute duration, default Weirdness 50 / Style 50. Prior commercial-use rights confirmation came from Joshua; this is context, not a new legal declaration or independent license check. Account screenshot: `suno-generated.jpg`.

No audio was trimmed, normalized, resampled, re-encoded or otherwise modified. No build or Git commit was made by this intake step.
