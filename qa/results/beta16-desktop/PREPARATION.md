# Historical beta.16 preparation — superseded

This records preparation before root authorized frozen source `a7e5ed4b653823ee2a84cb6df84d425206c46072`. It is superseded by [final package evidence](README.md) and [verified export identities](exports.json). Beta.16 has since been built, tested and exported; current PREVIEW-BUILD/playtest README record the latest verified kit.

The prepared extraction helper was copied byte-identically from the reviewed corrected beta.15 Python adapter. The later verified exports use ZIP_STORED directly and refuse existing targets. Standard Friends bundler validation/rendering stays unchanged, with reviewed in-memory compression and failed-partial-retention substitutions. Export/restoration helpers take the full frozen SHA rather than inferring changing HEAD. Old exports and the beta.14 failed partial remain preserved.

During this historical preparation phase, no build/tests/exports had run. The QA owner subsequently added CK_QA_ROOT support; exact extracted broad 36 and overlapping focused 7 checks, native clean-reload UI 8, lifecycle and archive verification are recorded in the final evidence. Preparation/package work did not edit gameplay/campaign/WIP or normal saves, and did not close user windows.
