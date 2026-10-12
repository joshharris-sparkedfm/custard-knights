# Optional local playtest reports

From beta.5, Settings offers optional local playtest recording. It starts disabled. A tester may enable it before a session, export a JSON report afterwards, and send that file back with their feedback. Nothing uploads automatically. Playing does not require consent or an account.

The export contains a version, anonymous local installation/session tokens, timestamps and allowlisted observations such as match starts/results, deliberate input, join outcomes and continuation. It excludes names, room codes, server URLs, account IDs, credentials, chat, free text and game-save contents. Raw network round identifiers are replaced with independent local tokens. Exported timestamps still reveal when the tester played; they choose whether to share them.

At most 2,000 records are retained. Clear removes the existing records and rotates anonymous identities while keeping the selected recording preference. Turning recording off erases both records and consent. Neither action changes progress, wardrobe, campaign or control settings. Storage blocking or corruption must not interrupt play; an in-memory report may still be available during that window.

## Reading the baseline

- Join success/failure requires an observed attempt and outcome in the same local session. Pending or unobserved attempts are not labelled failures. Connecting a socket alone is not successful game admission.
- Completion uses observed starts and completed results with a positive human count. Late joins, demonstrations, bot-only rounds and QA harness observations are excluded. A match started before opting in does not become an observed start retroactively.
- Rematch selection is intent. Actual continuation requires a later human round start after a completed round in the same session. Neither proves enjoyment.
- First action means an observed deliberate gameplay input or attributed combat action, according to the recorded action. An attack input is not proof of a successful hit, and movement is not proof that the player understood combat.
- Sessions expire after 30 minutes without a recorded event, evaluated when the next event arrives. Such exits are labelled inferred. Page lifecycle exits are best-effort observations; crashes and forced shutdowns may leave no exit. A round crossing an expired session boundary may be unmatched.
- Counts describe retained observations on one installation, not unique people, households, friends, population-wide reliability or D1/D7 retention. Couch seats and repeated visits cannot establish identity. Clearing, truncation and missing context affect denominators.

The schema reserves event names for future sharing/referral features; their presence is not evidence those features or referral attribution exist. Experiment assignments, cross-device aggregation and human cohort baseline collection remain separate roadmap work. Review event coverage and evidence in `qa/reviews/local-product-events-2026-10-12.md` before interpreting a report.
