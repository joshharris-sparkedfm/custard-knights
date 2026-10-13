# Player controls: live network check

Two real PeerJS peers connected by a DataConnection in isolated headless Chrome profiles on one machine/network. CDP dispatches mouse and keyboard events; normal client serialization, transport, host authority and guest snapshots run live. Not cross-network NAT, human playtesting, or physical input-device certification.

Host QA hooks place humans, disable bots/chaos and give a bow. A read-only data listener records host acceptance of real transport packets. Tagged legacy/invalid input probes use the existing real guest DataConnection, without invoking hostRecv directly. A short host sampler observes transient peck and projectile effects.

- PASS: Two isolated profiles establish a real PeerJS DataConnection
- PASS: Guest D movement and upward mouse aim travel separately and drive authoritative movement/facing
- PASS: Real guest left-click fires a host-owned upward bow projectile while moving right
- PASS: Authoritative ammo consumption returns to the guest through snapshots
- PASS: Guest right-click activates authoritative block
- PASS: Focus loss releases pointer buttons and transports the explicit no-aim sentinel
- PASS: Legacy seven-field input remains movement-facing over the real connection
- PASS: Eight-field no-aim sentinel preserves independent movement
- PASS: Finite explicit aim survives real PeerJS serialization
- PASS: Host rejects outside aim arriving through real transport
- PASS: Host rejects nan aim arriving through real transport
- PASS: Host rejects infinity aim arriving through real transport
- PASS: Guest chicken click produces authoritative knockback without damage or death
- PASS: Network chicken peck creates the visible ring effect on the host
- PASS: Guest receives the shoved rival position and unchanged health through snapshots
- PASS: No browser runtime exceptions during live controls scenario
