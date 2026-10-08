# Player review for candidate 0.2.2

This is an unperformed acceptance session, not a claim that people have tested the game. Use the candidate identified by BUILD-INFO.txt. Record the build, PC, controller models, Steam Input setting and actual completion times. Use a fresh profile or an exported save backup, without deleting existing progress.

## First-time player — approximately 20 minutes

Let someone unfamiliar with the game start without coaching. Record observations before explaining a control. Duration is a session budget, not an advertised story length.

1. From the menu, find the controls and start a courtyard match. Ask them to show a light attack, heavy attack, block and dash. Observe whether wind-up, contact and recovery read as different states, whether the hand appears attached to the sword, and whether either visor becomes distracting at normal game scale.
2. Ask what happened after a blocked attack, guard break, knockout and respawn. Record their own explanation and any mismatch with the rules. Do not ask whether a cue was "clear" before observing their response.
3. Play the campaign from the banquet through the first objectives. Observe whether they identify the destination, understand a contested objective and know how to retry. Record repeated wrong actions and the screen visible when they occurred.
4. In a separate prepared QA profile, try Marshal Rind. Ask what the warning predicts and when they think he is vulnerable. Observe at least five attack cycles. Check whether the spoon impact, recovery countdown and checkpoint wording support their decisions.
5. After a result, find an earned reward, pin a goal and save an outfit. Switch the visor open and closed, save an outfit, return to play and confirm the selected outfit. Restart and check that each local player retains their own visor choice. Ask what they expect to earn next.
6. Enable reduced flashing and repeat a short fight. Record whether important hit and guard-break information remains understandable. This is not a medical accessibility assessment.

Treat failure to start/retry, invisible important cues, misunderstanding that persists across repeated cycles, lost rewards or inability to operate a required control as defects to investigate. Prioritize observed blockers over requests for extra content. Do not retune damage or boss health from one player's win/loss result alone.

## Couch and online hardware acceptance

- Connect two to four physical controllers. Reverse join order, mix keyboard and pads, play five rematches, unplug/reconnect a pad and verify the correct seat and rewards. Exercise settings sliders/toggles and wardrobe presets using only the pad. Repeat with the intended Steam Input configuration.
- Install the uploaded private Steam branch on another PC. Check launch, fullscreen/Alt-Tab, normal quit/restart, update and retained saves. Record frame rate on the intended minimum-spec machine before publishing specifications.
- With two computers on different household networks, test code/invite joining, three complete Cup rounds, late arrival, guest departure, host departure, reconnect and full-room rejection. Record connection time and failure messages. Same-machine PeerJS checks already passed, but do not replace this test.

## Observation record

| Build / device | Task | Expected behavior | What the player actually did or saw | Repro steps / capture | Severity | Fix and retest |
|---|---|---|---|---|---|---|
| Pending | | | | | | |

Release sign-off remains pending until the relevant hardware/platform results and human observations are recorded. Automated evidence is in GAMEPLAY-REVIEW.md, DESKTOP-ACCEPTANCE.md and LAUNCH-STATUS.md.
