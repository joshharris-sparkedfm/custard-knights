"""Validate staged Custard Knights PNG sheets and packed sprite atlases.

Usage: python validate_sheet.py SHEET_DIR [PACKED_JS] [--kind knight|hero|chicken|pilot]
This deliberately never writes into the game's sprites directory.
"""
import argparse
import base64
import io
import json
from pathlib import Path

from PIL import Image

DIRS = ['S', 'SE', 'E', 'NE', 'N']
KNIGHT_ANIMS = [['idle', 2], ['walk', 6], ['swing', 4], ['block', 2], ['hit', 1], ['win', 2]]
CHICKEN_ANIMS = [['idle', 2], ['walk', 4]]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def expected_frames(meta, kind, directory):
    if kind == 'pilot':
        layers = [('helm_great', 'base')]
        if (directory / 'helm_great_armfreeBase_000.png').exists():
            layers = [('helm_great', suffix) for suffix in
                      ('base', 'mask', 'metal', 'armfreeBase', 'armfreeMask', 'armfreeMetal')]
        return layers
    if kind == 'chicken':
        require(meta['cell'] == 160, 'Chicken cell must be 160px')
        require(meta['dirs'] == DIRS and meta['anims'] == CHICKEN_ANIMS, 'Chicken directions or animations changed')
        require(len(meta['frames']) == 30, 'Chicken needs 30 frames')
        require(len(meta.get('chicks', [])) == 6, 'Chicken needs six skins')
        return [(f'chick_{skin}', layer) for skin in meta['chicks'] for layer in ('base', 'mask')]
    require(meta['dirs'] == DIRS and meta['anims'] == KNIGHT_ANIMS, 'Knight directions or animations changed')
    require(len(meta.get('helms', [])) == 6, f'{kind} needs six helms')
    require(len(meta.get('plumes', [])) == 5, f'{kind} needs five plumes')
    require(len(meta.get('blades', [])) == 6, f'{kind} needs six blades')
    require(len(meta.get('pats', [])) == 5, f'{kind} needs five cape patterns')
    require(len(meta.get('embs', [])) == 8, f'{kind} needs eight emblems')
    if kind == 'hero':
        require(meta['cell'] == 384, 'Menu hero cell must remain 384px')
        require(len(meta['frames']) == 6, 'Menu hero needs five idle views and one win pose')
    else:
        require(meta['cell'] == 160, 'Gameplay knight cell must remain 160px')
        require(len(meta['frames']) == 85, 'Gameplay knight needs 85 frames')
        require([tuple(f) for f in meta['frames']] ==
                [(di, an, k) for di in range(5) for an, count in KNIGHT_ANIMS for k in range(count)],
                'Gameplay frame order differs from 5 directions x 17 poses')
    # Hero metadata keeps per=17 intentionally; only its six selected source poses are rendered.
    layers = [(f'helm_{helm}', suffix) for helm in meta['helms'] for suffix in ('base', 'mask', 'metal')]
    if meta.get('rig', {}).get('version') == 1:
        layers += [(f'helm_{helm}', suffix) for helm in meta['helms']
                   for suffix in ('armfreeBase', 'armfreeMask', 'armfreeMetal')]
    layers += [(f'plume_{name}', 'plume') for name in meta['plumes']]
    layers += [(f'blade_{name}', 'solo') for name in meta['blades']]
    layers += [('cape', 'solo')]
    layers += [(f'capepat_{name}', 'mask') for name in meta['pats']]
    layers += [(f'emb_{name}', 'solo') for name in meta['embs']]
    return layers


def validate_rig(meta, kind):
    if kind not in ('knight', 'hero', 'pilot'):
        return
    rig = meta.get('rig')
    require(isinstance(rig, dict) and rig.get('version') == 1, f'{kind} requires rig.version=1')
    sockets = rig.get('weaponArm')
    require(isinstance(sockets, list) and len(sockets) == len(meta['frames']),
            f'Rig needs {len(meta["frames"])} weaponArm sockets')
    for i, socket in enumerate(sockets):
        require(isinstance(socket, dict), f'Rig socket {i} is not an object')
        for name in ('shoulder', 'elbow', 'grip'):
            point = socket.get(name)
            require(isinstance(point, list) and len(point) == 2, f'Rig socket {i} missing {name}')
            require(all(isinstance(v, (float, int)) and 0 <= v <= meta['cell'] for v in point),
                    f'Rig socket {i} {name} outside cell: {point}')
        require(isinstance(socket.get('behind'), bool), f'Rig socket {i} missing behind flag')


def validate_pngs(directory, meta, kind, layers):
    count = 85 if kind == 'pilot' else len(meta['frames'])
    expected = {f'{prefix}_{suffix}_{i:03d}.png' for prefix, suffix in layers for i in range(count)}
    actual = {p.name for p in directory.glob('*.png')}
    missing = expected - actual
    require(not missing, f'Missing {len(missing)} PNGs; first: {sorted(missing)[:5]}')
    if kind != 'pilot':
        require(not (actual - expected), f'Unexpected PNGs; first: {sorted(actual - expected)[:5]}')
    cell = meta['cell']
    for filename in sorted(expected):
        with Image.open(directory / filename) as image:
            require(image.size == (cell, cell), f'{filename} is {image.size}, expected {cell}x{cell}')
            require(image.mode == 'RGBA', f'{filename} is {image.mode}, expected RGBA')
            image.load()
    if kind in ('knight', 'hero') or (kind == 'pilot' and len(layers) == 6):
        for helm in (['great'] if kind == 'pilot' else meta['helms']):
            changed = 0
            for i in range(count):
                prefix = f'helm_{helm}'
                with Image.open(directory / f'{prefix}_base_{i:03d}.png') as normal, \
                     Image.open(directory / f'{prefix}_armfreeBase_{i:03d}.png') as armfree:
                    if normal.getchannel('A').tobytes() != armfree.getchannel('A').tobytes():
                        changed += 1
            require(changed > 0, f'{helm} armfreeBase alpha duplicates the normal base')
    return len(expected)


def validate_atlas(layer, count, cell, label):
    require(isinstance(layer, dict) and isinstance(layer.get('u'), str), f'{label} missing atlas URL')
    require(layer['u'].startswith('data:image/webp;base64,'), f'{label} is not embedded WebP')
    require(isinstance(layer.get('r'), list) and len(layer['r']) == count, f'{label} has wrong rect count')
    data = base64.b64decode(layer['u'].split(',', 1)[1], validate=True)
    with Image.open(io.BytesIO(data)) as atlas:
        require(atlas.format == 'WEBP', f'{label} atlas is not WebP')
        width, height = atlas.size
        atlas.load()
    for i, rect in enumerate(layer['r']):
        require(isinstance(rect, list) and len(rect) == 6 and all(isinstance(v, int) for v in rect),
                f'{label} frame {i} has invalid rect')
        x, y, w, h, ox, oy = rect
        require(min(x, y, w, h, ox, oy) >= 0 and x+w <= width and y+h <= height and
                ox+w <= cell and oy+h <= cell, f'{label} frame {i} exceeds atlas or cell')


def validate_packed(path, meta, kind, layers, key=None, allow_legacy_face_revision=False):
    prefix = 'window.CK_SPRITES=Object.assign(window.CK_SPRITES||{},'
    data = path.read_text(encoding='utf-8')
    require(prefix in data and data.rstrip().endswith(');'), f'{path} has wrong JS wrapper')
    obj = json.loads(data.split(prefix, 1)[1].rsplit(');', 1)[0])
    key = key or ('chicken' if kind == 'chicken' else 'hero' if kind == 'hero' else 'knight')
    require(list(obj) == [key], f'{path} has wrong sprite key')
    sprite = obj[key]
    require(sprite['cell'] == meta['cell'] and sprite['dirs'] == meta['dirs'], 'Packed cell or directions differ')
    require(sprite['per'] == sum(count for _, count in meta['anims']), 'Packed poses per direction differ')
    for field in ('faceRevision', 'visorStyle'):
        if field in meta:
            if field == 'faceRevision' and allow_legacy_face_revision and field not in sprite:
                continue
            require(sprite.get(field) == meta[field], f'Packed {field} differs from source')
    if kind in ('knight', 'hero'):
        require(sprite.get('rig') == meta['rig'], 'Packed rig differs from source')
    for prefix_name, suffix in layers:
        if prefix_name.startswith('helm_'):
            group = sprite['helms'][prefix_name[5:]]
            layer = group.get(suffix)
        elif prefix_name.startswith('chick_'):
            layer = sprite['chicks'][prefix_name[6:]].get(suffix)
        elif prefix_name.startswith('plume_'):
            layer = sprite['plumes'].get(prefix_name[6:])
        elif prefix_name.startswith('blade_'):
            layer = sprite['blades'].get(prefix_name[6:])
        elif prefix_name.startswith('capepat_'):
            layer = sprite['pats'].get(prefix_name[8:])
        elif prefix_name.startswith('emb_'):
            layer = sprite['embs'].get(prefix_name[4:])
        else:
            layer = sprite.get('cape')
        require(layer is not None, f'Packed layer missing: {prefix_name}_{suffix}')
        validate_atlas(layer, len(meta['frames']), meta['cell'], f'{prefix_name}_{suffix}')
    return len(layers)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sheet_dir', type=Path)
    parser.add_argument('packed_js', nargs='?', type=Path)
    parser.add_argument('--kind', choices=('knight', 'hero', 'chicken', 'pilot'), default='knight')
    parser.add_argument('--key', help='Expected CK_SPRITES key, for example knightOpen')
    parser.add_argument('--allow-legacy-face-revision', action='store_true',
                        help='Archive an older review atlas packed before faceRevision was embedded')
    args = parser.parse_args()
    meta = json.loads((args.sheet_dir / 'sheet.json').read_text(encoding='utf-8'))
    layers = expected_frames(meta, args.kind, args.sheet_dir)
    validate_rig(meta, args.kind)
    png_count = validate_pngs(args.sheet_dir, meta, args.kind, layers)
    atlas_count = validate_packed(args.packed_js, meta, args.kind, layers, args.key,
                                  args.allow_legacy_face_revision) if args.packed_js else 0
    print(f'VALIDATED {args.kind}: {png_count} PNGs, {atlas_count} atlases, {len(meta["frames"])} frames, {meta["cell"]}px cell')


if __name__ == '__main__':
    main()
