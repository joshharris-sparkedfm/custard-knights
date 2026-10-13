# Focused remappable-controls browser evidence

`candidate3/report.json` is the final frozen-source focused run: 33 pass, 0 fail, no Runtime exceptions, stable before/after runtime hashes. Candidate 1 and candidate 2 are retained with screenshots and failures; see `qa/reviews/controls-remap-2026-10-13.md` for their diagnoses and corrections.

Run from the project root:

```powershell
node qa/controls-remap-browser.cjs qa/results/controls-remap-2026-10-13/new-candidate
```

For a later extracted package, set `CK_QA_ROOT` to the directory containing its `index.html`, then run the same source harness with a fresh output directory. The Chrome profile is isolated. The synthetic pad fixture waits for actual navigator polls at every phase; it makes no physical-pad or responsiveness claim. Each small-window element is measured after its own ordinary scrolling.

Source QA does not establish packaged EXE acceptance. Retained beta.12 evidence remains prior evidence; any new beta.13 package needs its own identity/hash check and scoped acceptance.

Author-reported unit checks progressed through 108 new/affected tests, 12 focused controls tests after the alias correction, then 21 focused controls/home tests after the layout correction. These successive runs are not added as unique tests. Browser candidate 1's retained failure is a corrected QA expectation; candidate 2's retained failure is the real How To Play Back/Sound overlap corrected for candidate 3.

Frozen harness SHA-256: `32b5b2960986958740c0bdca8eef0de3d38e01bf8ef743bb69635940f4d3571d`.
