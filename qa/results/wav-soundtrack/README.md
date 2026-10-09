# Alpha.6 packaged soundtrack evidence — 9 October 2026

Frozen runtime source: `d15c4b66f66b489241343f9c4e282f4e58b46868`.

- `package-build.txt`: Windows x64 alpha.6 built with Electron 44.7.0; all 12 soundtrack slots enabled (11 new WAVs plus the retained menu MP3).
- `desktop-package.txt` and `desktop-evidence.json`: all 53 packaged runtime/metadata entries match source. Packaged ASAR SHA256 is `d23dacaf2ebe5464a83a67ba7e50aa5e03211209199524978ad9ef996253cf45`.
- `packaged-media/report.json`: 85/85 checks, all 12 cues, 11 native WAV decodes with matching source channel/sample/frame dimensions, advancing playback clocks, mute/volume/fade-stop/scene routing and one music instance. Zero media errors or browser exceptions.
- `desktop-acceptance.txt`: the actual distributed EXE passed isolated write/read, launcher reuse and relocated-install read checks, including save persistence, fullscreen and offline assets.

The media check uses a hidden Electron QA runner with the frozen ASAR, its packaged `desktop/assets.cjs` handler and the real `custard://game` origin. Renderer sandbox/context isolation remain enabled and external requests are blocked. It is distinct from the separate actual-EXE lifecycle check. Audio output is silenced and autoplay is explicitly permitted. No auditory quality, physical speakers, human listening, loop-seam, controller, WAN or minimum-hardware acceptance is claimed. Unchanged ranked/network checks were not repeated.

`export.json` records the frozen preview/friends ZIP hashes and byte-identity checks. Earlier alpha.5 and older outputs remain preserved. No runtime source was edited during this packaging/export pass.
