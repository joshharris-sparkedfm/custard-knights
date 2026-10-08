"""Create an isolated great-helmet runtime preview from a partial staged bake.

The result is for motion QA only. It retains all baseline variants and companion
assets, replacing only great helm layers and adding 85-frame weapon-arm sockets.
"""
import argparse
import json
from pathlib import Path


def parse_sprite(path, key):
    text = path.read_text(encoding='utf-8')
    prefix = 'window.CK_SPRITES=Object.assign(window.CK_SPRITES||{},'
    return json.loads(text.split(prefix, 1)[1].rsplit(');', 1)[0])[key]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('baseline_js', type=Path)
    parser.add_argument('pilot_js', type=Path)
    parser.add_argument('output_js', type=Path)
    args = parser.parse_args()
    baseline = parse_sprite(args.baseline_js, 'knight')
    pilot = parse_sprite(args.pilot_js, 'knight')
    if pilot.get('rig', {}).get('version') != 1 or len(pilot['rig'].get('weaponArm', [])) != 85:
        raise ValueError('Pilot needs 85 real arm sockets')
    great = pilot['helms']['great']
    for layer in ('base', 'mask', 'metal', 'armfreeBase', 'armfreeMask', 'armfreeMetal'):
        if len(great[layer]['r']) != 85:
            raise ValueError(f'Pilot great helm {layer} has wrong frame count')
    baseline['helms']['great'] = great
    baseline['rig'] = pilot['rig']
    args.output_js.parent.mkdir(parents=True, exist_ok=True)
    args.output_js.write_text('// great-helm motion preview; generated from staged pilot and baseline\n'
                              'window.CK_SPRITES=Object.assign(window.CK_SPRITES||{},'
                              + json.dumps({'knight': baseline}, separators=(',', ':')) + ');\n',
                              encoding='utf-8')
    print(f'PILOT_PREVIEW {args.output_js}')


if __name__ == '__main__':
    main()
