# Story presentation and playable banquet revision

The owner rejected the earlier story's quality. Completing eight scripted encounters was not evidence of a satisfying story. This revision adds visible action and a more substantial opening; it does not certify the whole chapter as polished or finished.

Sixteen authored real-time Canvas scenes now accompany the eight encounters, using the accepted game knight renderer. The banquet shows the Golden Spoon, a thrown pie, a scuffle and the theft, then introduces the kitchen rescue. Its aftermath shows the bakery threatened by a siege bowl. These are animated scenes with subtitles, not prerecorded films or recorded dialogue. Pause, resume, replay, seeking, reduced motion and skipping are available. Finishing a scene waits for the player to choose Start encounter. Replaying scenes grants no rewards.

The banquet requires three real sword contacts to break the pantry barricade, proximity escort of three named cooks through the doorway, defeat of two reinforcements, a six-second pantry defence and final departure. Initial guards cannot be bypassed by visiting the exit. Cooks are visible noncombatants with guided routes. The other seven encounter mechanics and saved unlock/spoon ownership are preserved.

## Validation

- 26 campaign unit tests and four scene module tests pass. Scene tests traverse all sixteen timelines at half-second intervals.
- 58 campaign browser integration checks pass, including real sword/crate contact and staged objectives. Fixture teleports/damage are explicitly distinct from ordinary-input acceptance.
- The input-only runner completed all eight encounters without assistance; the revised banquet took 23.12 seconds with three cooks rescued. This is a scripted acceptance route, not a novice playtime estimate.
- 25 presentation browser checks pass, covering deliberate start, replay, visibility suspension, UI cleanup, reduced motion, reward invariance and 640px layout. Final scaled render evidence: `qa/results/story-presentation-scaled/`.
- Visual review inspected actual pie-impact, pantry and theft/aftermath captures. A body-scale mismatch that left hats/crowns floating was corrected in the game renderer adapter.

Earlier QA errors are retained. Input routing originally tried to return through a solid wall; the test route was corrected. Presentation QA initially omitted native Enter text and later exposed 640px canvas overflow and ambiguous duplicate return buttons; the latter two were corrected in the UI. Synthetic visibility/controller checks are not genuine OS backgrounding or physical-controller acceptance. Human story pacing, clarity and enjoyment remain unassessed.
