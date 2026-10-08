# QA host and limits

Observed 8 October 2026: Windows desktop with Intel Core i9-14900K (24 cores, 32 logical processors), NVIDIA GeForce RTX 4080 SUPER, graphics driver 32.0.16.1088 and approximately 64 GiB installed RAM. Automated browser and Electron checks were run on this machine, sometimes concurrently with packaging and other tests.

A short headless browser sample near 60 FPS is not a minimum-spec measurement. The real-time soak checks that frames continue, captures JavaScript errors and verifies the audio voice ceiling. Speakers are muted while the Web Audio graph remains active, so the test does not certify audible quality or clipping. The 41-second trailer is actual rendered gameplay captured with deterministic simulation stepping at 30 FPS, not a performance measurement.

Controller mappings and seat continuity have automated evidence. Real hardware, Steam Input, a second PC and cross-network NAT conditions remain manual/platform checks. Scripted campaign policies use the real input controls but are not a human usability/playtime study.
