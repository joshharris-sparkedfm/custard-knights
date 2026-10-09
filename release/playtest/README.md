# Private friends beta kit

The latest exported kit is **0.3.0-beta.4**, including disappearance/spawn and guest-prediction fixes, two additional ordinary weapons, chaos choices, rare powers and their original song. Its exact source, hashes and acceptance limits are recorded in [PREVIEW-BUILD.md](../PREVIEW-BUILD.md). It wraps a frozen Windows build with `START-HERE.txt`, a local feedback page and `BUILD-INFO.json`; it has not been sent to friends or publicly uploaded. Later source changes are not in that kit until another versioned export is recorded. It is for private feedback; it does not deploy an online server or certify sale readiness. See [BETA-PLAN.md](../BETA-PLAN.md) for the distribution checkpoint.

Send the complete ZIP using a private download link, together with its version, size and SHA256. Friends should download it, use Extract All and launch `Game/Custard Knights.exe`; do not send the EXE alone or ask them to run it inside the ZIP. Keep prior builds and archives separate. No hosting account or recipient list is assumed, and nothing is sent automatically.

The feedback page does not transmit data, collect system information or read game saves. Answers remain in the open page until the player downloads or copies the JSON report. The report includes the exact game build identity. Players send it back through their existing conversation with Joshua. Screenshots and clips are optional and sent separately. There is no persistent browser draft; the page tells players to keep it open until saved.

## Build another kit

Use Python 3 (standard library only) and an already verified Windows export ZIP after the source freeze. Supply the hashes and source commit recorded when that export was made, not the current Git HEAD if it has moved. Use the version actually built into that export:

```powershell
python scripts/playtest-bundle.py SOURCE.zip FRIENDS.zip --sha256 SOURCE_ZIP_SHA256 --version VERSION --source-commit FULL_EXPORT_COMMIT --asar-sha256 APP_ASAR_SHA256
```

The script verifies the frozen source ZIP and application archive, streams the packaged files unchanged under `Game/`, excludes the two developer handover documents, and adds the friend-facing materials. It rejects unsafe/duplicate ZIP paths and existing destinations. No application is executed; no player save profile is read or copied. Keep the resulting SHA256 and build manifest alongside release evidence. Friends need only Windows x64 and the ZIP, not Python, Node or Steam. Creating a kit does not close or replace the alpha.6 game currently being reviewed.

For a changed feedback page, extract the resulting ZIP to a new review folder, then run `node qa/playtest-feedback.cjs PATH_TO_FEEDBACK.html OUTPUT_DIRECTORY`. This verifies the actual downloaded report, preserved free text and build identity, copy fallback, optional answers, narrow layout and lack of HTTP requests. Reuse existing behavior checks while that page is unchanged; still verify the new kit's substituted version/commit/hashes against its manifest. This is synthetic browser evidence, not a claim of human playtesting.

## Run the first session

Invite a few novice and experienced players. Let each begin without coaching; observe confusing moments before explaining. The short guide covers combat, story, a Cup or faction match, and save/restart. Ask whether they would choose to play again and why. The optional purchase question uses the proposed price only; it does not publish or set a store price.

Begin with offline/couch sessions, then test original-arena room codes across households. Faction online needs a separately supplied reachable test endpoint; do not tell players to connect to your localhost. An optional persistent private ladder needs a host-issued key and configured server; no public Steam-ranked service is deployed. Track crashes, lost progress, failed objectives or persistent input delay as blockers, and link each fix to a repeat of the failed task. See `release/PLAYER-REVIEW.md` for the fuller device and mode matrix.

The soundtrack now includes twelve original Suno WAV candidates (including the requested Oh Nae Nae song) and the retained menu MP3. Ask about musical fit, volume against gameplay, unintended voices and awkward repeats; these have not been signed off by human listening. Another Helping retains an approximately 1.595-second silent tail. Track links, hashes and inspection limitations are in [music/source-provenance.json](../music/source-provenance.json); the prepared listening bundle is an optional review aid, not a required game download.

For optional private ranked play, schedule eight distinct accounts for 4v4 before inviting anyone into the queue. Explain the total 20-second absence budget and forfeit behavior. The host must supply a reachable authenticated endpoint and individual credentials privately. Do not publish keys, assume party support, or treat 100 bot slots as an accepted 100-human service. Keep any real endpoint and invitation details out of the reusable public repository materials.
