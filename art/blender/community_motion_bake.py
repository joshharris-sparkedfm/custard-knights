"""Bake sampled community walking motion onto the existing rounded knight.
Uses the existing visor geometry, layered art and weapon-socket exporter.
No external service is contacted during baking. Source motion provenance below.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
base = HERE / 'visor_bake.py'
wrapper = base.read_text(encoding='utf-8')
marker = "namespace={'__name__':'knight_face_bake','__file__':ORIGINAL}"
if wrapper.count(marker) != 1:
    raise RuntimeError('Visor baker changed: review the motion wrapper')
namespace = {'__file__': str(base), '__name__': 'community_motion_bake'}
exec(compile(wrapper.split(marker)[0], str(base), 'exec'), namespace)
replace_once = namespace['replace_once']
# Meshy rig task: 01a16839-17ea-7012-adb3-584c04771204
# Walk source SHA-256: 09dc9325c1ff4ccda61bb749ba6e819db248d3542a766ec0f9ffdbe81fb2ddcc
replace_once('    def pose(anim, k):', '    COMMUNITY_WALK = '+'[[[[-0.003295, 0.010667, -0.040402], [0.001278, 0.070825, 0.05222]], 0.063067, 0.07], [[[0.130503, 0.005943, -0.16], [-0.20506, 0.042103, 0.16]], 0.028157, 0.091651], [[[0.194168, 0.045648, -0.148906], [-0.131852, 0.001771, 0.16]], 0.000914, 0.048349], [[[-0.00157, 0.083754, 0.04667], [-0.005309, 0.010888, -0.066897]], 0.045766, 0.07], [[[-0.191402, 0.026556, 0.16], [0.142045, 0.014012, -0.16]], 0.033121, 0.091651], [[[-0.126288, 0, 0.157839], [0.192454, 0.052832, -0.16]], 0.001837, 0.048349]]'+'\n    def pose(anim, k):')
replace_once('            ph = k / 6 * 2 * math.pi; s1 = math.sin(ph)\n            leg(-1, .3 * s1, max(0, s1) * .18); leg(1, -.3 * s1, max(0, -s1) * .18)\n            arm(-1, -.18 * s1, .04); arm(1, .18 * s1, .04)\n            return abs(math.cos(ph)) * .1, .1', '            motion, body_lift, tilt = COMMUNITY_WALK[k]\n            for side, (dy, ground_lift, hand_dy) in zip((-1, 1), motion):\n                # Foot samples are already world-space lift; subtract root bob so\n                # the planted foot stays on the floor while the torso rises.\n                leg(side, -dy, ground_lift - body_lift)\n                arm(side, -hand_dy, .04)\n                equipment = SW if side == -1 else SH\n                equipment.location.y += hand_dy\n                equipment.location.z += .04\n            return body_lift, tilt')
replace_once("'faceRevision': 'visor-v1-all-six'", "'faceRevision': 'visor-v1-all-six', 'motionRevision': 'community-walk-v1'")
exec(compile(namespace["source"], str(HERE / "knight.py") + " [community motion]", "exec"), namespace)
