"""Crop baked prop renders to their visible bounds and write game sprites with provenance.

python art/blender/pack_props.py --spec <props.json> --baked <bake output> --output <staging dir>
"""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('--spec', required=True); p.add_argument('--baked', required=True); p.add_argument('--output', required=True)
a = p.parse_args()
spec = {e['id']: e for e in json.loads(Path(a.spec).read_text(encoding='utf-8'))}
baked = json.loads((Path(a.baked) / 'bake.json').read_text(encoding='utf-8'))
out = Path(a.output); out.mkdir(parents=True, exist_ok=True)
entries = []
for b in baked:
    e = spec[b['id']]
    im = Image.open(Path(a.baked) / b['raw']).convert('RGBA')
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box or box[0] < 2 or box[1] < 2 or box[2] > im.width - 2 or box[3] > im.height - 2:
        raise SystemExit(f"{b['id']}: render touches the frame edge; widen the camera before packing")
    im = im.crop(box); im.thumbnail((e.get('maxPx', 512),) * 2, Image.Resampling.LANCZOS)
    sprite = out / f"{e['sprite']}.png"; im.save(sprite, optimize=True)
    entries.append({**{k: e[k] for k in ('id', 'title', 'author', 'source', 'license', 'accessed') if k in e},
                    'sourceModel': 'models/' + b['file'], 'sha256': b['sha256'], 'bytes': b['bytes'], 'triangles': b['triangles'],
                    'sprite': sprite.name, 'spriteSize': list(im.size), 'spriteSha256': hashlib.sha256(sprite.read_bytes()).hexdigest(),
                    'processing': 'Shared prop rig (art/blender/bake_props.py): orthographic, 38.7 degree elevation, '
                                  f"yaw {b['yaw']}, three-light studio, AgX; cropped and resized to <= {e.get('maxPx', 512)} px."
                                  + (' Local palette tint: ' + ', '.join(t['to'] for t in e['tint']) + '.' if e.get('tint') else '')})
    print('PACKED', e['sprite'], im.size)
(out / 'props-sources.json').write_text(json.dumps(entries, indent=2), encoding='utf-8')
