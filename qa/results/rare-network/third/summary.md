# Rare-event network check

Three real PeerJS connections in isolated Chrome profiles on one machine/network. Not cross-network NAT, public hosting, or physical controller certification.

QA hooks choose the host rare plan and its recipient deterministically; ordinary host simulation, PeerJS transport, guest input and snapshot handling run live. Bots are disabled and human spawn protection extended to isolate protocol behavior. The recipient disconnects through the normal leave path.

- PASS: Three isolated profiles establish real PeerJS connections
- PASS: Simple policy arrives in both guest round setups
- PASS: Simple host rejects a rare event
- PASS: Insane policy arrives in both guest round setups
- PASS: Guest cannot activate a rare event through the authority helper
- PASS: Host ignores forged client rare-event and snapshot messages
- PASS: Host-selected recipient and 30-round AK47 hydrate on both guests
- PASS: Host and both guests switch to and play the rare WAV cue
- PASS: Real guest keyboard input consumes authoritative AK47 ammo and propagates to witness
- PASS: Recipient renders rare HUD and held AK47 without exception
- PASS: Witness renders rare HUD and held AK47 without exception
- PASS: Host removes departed recipient weapon and restores arena music
- PASS: Surviving guest receives bot takeover, no AK47, and restored arena cue
- PASS: Departing recipient returns to menu music
- PASS: Host and guest ordinary weapon pools exclude AK47
- PASS: No browser runtime exceptions during network scenario
- PASS: Production source and audio hashes remain unchanged during the run
