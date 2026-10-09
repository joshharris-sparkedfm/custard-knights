# Friends playtest kit

The kit wraps a frozen Windows preview with `START-HERE.txt`, a local feedback page and a file manifest. It is for private feedback; it does not deploy an online server or certify sale readiness. Send the complete ZIP using your preferred private file-sharing service, then pass on `START-HERE.txt`. Do not send the EXE alone. No hosting account or recipient list is assumed, and nothing is sent automatically.

The feedback page does not transmit data, collect system information or read game saves. Answers remain in the open page until the player downloads or copies the JSON report. The report includes the exact game build identity. Players send it back through their existing conversation with Joshua. Screenshots and clips are optional and sent separately. There is no persistent browser draft; the page tells players to keep it open until saved.

## Build another kit

Use Python 3 (standard library only) and an already verified preview ZIP. Supply the hashes and source commit recorded when that preview was exported, not the current Git HEAD if it has moved:

```powershell
python scripts/playtest-bundle.py SOURCE.zip FRIENDS.zip --sha256 SOURCE_ZIP_SHA256 --version VERSION --source-commit FULL_EXPORT_COMMIT --asar-sha256 APP_ASAR_SHA256
```

The script verifies the frozen source ZIP and application archive, streams the packaged files unchanged under `Game/`, excludes the two developer handover documents, and adds the friend-facing materials. It rejects unsafe/duplicate ZIP paths and existing destinations. No application is executed; no player save profile is read or copied. Keep the resulting SHA256 and build manifest alongside release evidence. Friends need only Windows x64 and the ZIP, not Python, Node or Steam.

For the UI check, extract the resulting ZIP to a new review folder, then run `node qa/playtest-feedback.cjs PATH_TO_FEEDBACK.html OUTPUT_DIRECTORY`. This verifies the actual downloaded report, preserved free text and build identity, copy fallback, optional answers, narrow layout and lack of HTTP requests. It is synthetic browser evidence, not a claim of human playtesting.

## Run the first session

Invite a few novice and experienced players. Let each begin without coaching; observe confusing moments before explaining. The short guide covers combat, story, a Cup or faction match, and save/restart. Ask whether they would choose to play again and why. The optional purchase question uses the proposed price only; it does not publish or set a store price.

Begin with offline/couch sessions, then test original-arena room codes across households. Faction online needs a separately supplied reachable test endpoint; do not tell players to connect to your localhost. No persistent ranked service exists. Track crashes, lost progress, failed objectives or persistent input delay as blockers, and link each fix to a repeat of the failed task. See `release/PLAYER-REVIEW.md` for the fuller device and mode matrix.
