"""Bake a complete, validated sprite candidate outside the production sprites folder.

Pilot: python scripts/stage-sprites.py pilot --source art/blender/face_bake.py
Full:  python scripts/stage-sprites.py full --run-dir ../sprite-build/RUN
The pilot and full build can share a run directory. Nothing is promoted automatically.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
BUILD_ROOT = REPO.parent / 'sprite-build'
BLENDER = REPO.parent / 'tools' / 'blender-3.6.23-windows-x64' / 'blender.exe'
PACKER = REPO / 'art/blender/pack.py'
VALIDATOR = REPO / 'art/blender/validate_sheet.py'
MERGER = REPO / 'scripts/merge-pilot-sprites.py'
CHICKEN_SOURCE = REPO / 'art/blender/knight.py'
FACE_GEOMETRY = REPO / 'art/blender/face_review.py'
VISOR_SOURCE = REPO / 'art/blender/visor_bake.py'
VISOR_GEOMETRY = REPO / 'art/blender/visor_review.py'
BLENDER_THREADS = 4


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()

def decoded_rgba_equal(left, right):
    with Image.open(left) as left_image, Image.open(right) as right_image:
        if left_image.size != right_image.size:
            return False
        return left_image.convert('RGBA').tobytes() == right_image.convert('RGBA').tobytes()


def run_logged(command, logfile, env=None):
    logfile.parent.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    renders = 0
    with logfile.open('w', encoding='utf-8', errors='replace') as log:
        process = subprocess.Popen([str(part) for part in command], cwd=REPO,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                   text=True, encoding='utf-8', errors='replace', bufsize=1,
                                   env={**os.environ, **(env or {})})
        for line in process.stdout:
            log.write(line)
            if 'Saved:' in line:
                renders += 1
                if renders % 100 == 0:
                    print(f'RENDER_PROGRESS {renders}', flush=True)
            if any(tag in line for tag in ('PART_OK', 'SHEET_OK', 'BAKE_OK', 'Traceback', 'Error:')):
                print(line.strip(), flush=True)
        exit_code = process.wait()
    if exit_code:
        raise RuntimeError(f'Command exited {exit_code}; see {logfile}')
    return {'seconds': round(time.monotonic()-started, 2), 'renderMessages': renders}


def blender_command(source, out, size, mode, jobs=None, layers=None):
    command = [BLENDER, '--threads', str(BLENDER_THREADS),
               '--background', '--python', source,
               '--', out, str(size), mode]
    if jobs is not None:
        command.append(jobs)
    if layers is not None:
        command.append(layers)
    return command


def validate(sheet, kind, packed=None, key=None, legacy_face_revision=False):
    command = [sys.executable, VALIDATOR, sheet]
    if packed is not None:
        command.append(packed)
    command.extend(['--kind', kind])
    if key:
        command.extend(['--key', key])
    if legacy_face_revision:
        command.append('--allow-legacy-face-revision')
    subprocess.run([str(part) for part in command], cwd=REPO, check=True)


def baseline(run_dir):
    target = run_dir / 'baseline'
    target.mkdir(parents=True, exist_ok=True)
    for name in ('knight.js', 'hero.js', 'chicken.js'):
        source = REPO / 'sprites' / name
        destination = target / name
        if not destination.exists():
            shutil.copy2(source, destination)


def pilot(args, run_dir, manifest):
    sheet = run_dir / 'pilot' / 'sheet'
    if args.pilot_sheet:
        if not (args.pilot_sheet / 'sheet.json').is_file():
            raise FileNotFoundError(args.pilot_sheet / 'sheet.json')
        shutil.copytree(args.pilot_sheet, sheet, dirs_exist_ok=True)
        timestamps = [p.stat().st_mtime for p in sheet.glob('*.png')]
        duration = {'seconds': round(max(timestamps)-min(timestamps), 2),
                    'renderMessages': len(timestamps), 'adoptedFrom': str(args.pilot_sheet)}
    else:
        sheet.mkdir(parents=True, exist_ok=True)
        duration = run_logged(blender_command(args.source, sheet, 160, 'sheet', 'helm_great', 'base'),
                              run_dir / 'logs' / 'pilot.log')
    validate(sheet, 'pilot')
    png_count = len(list(sheet.glob('*.png')))
    if png_count not in (85, 510):
        raise ValueError(f'Pilot has {png_count} frames; expected 85 or 510')
    # Full sheets: 61 gameplay layers x 85 and 61 hero layers x 6.
    # Rendering the same scene is the dominant cost; startup/packing are recorded separately.
    estimate = round(duration['seconds'] / png_count * (61*85 + 61*6) / 60, 1)
    manifest['pilot'] = {'duration': duration, 'fullEstimateMinutes': estimate,
                         'frameCount': png_count, 'source': str(args.source),
                         'sourceSha256': sha(args.source)}
    print(f'PILOT_OK {duration["seconds"]}s / {png_count} frames; estimated full render {estimate}min', flush=True)


def full(args, run_dir, manifest):
    prior = manifest.get('pilot')
    if not prior:
        raise ValueError('Run the 85-frame pilot in this run directory first')
    if prior['sourceSha256'] != sha(args.source):
        raise ValueError('Baker source changed after pilot; run a fresh pilot')
    if prior['fullEstimateMinutes'] > args.max_estimate_minutes:
        raise ValueError(f'Pilot estimated {prior["fullEstimateMinutes"]}min; limit is '
                         f'{args.max_estimate_minutes}min')
    jobs = [('knight', args.source, 160, 'sheet'), ('hero', args.source, 384, 'hero')]
    helm_layers = 'base,mask,metal,armfreeBase,armfreeMask,armfreeMetal'
    manifest['builds'] = {}
    for kind, source, size, mode in jobs:
        sheet = run_dir / 'sheets' / kind
        sheet.mkdir(parents=True, exist_ok=True)
        print(f'BAKE_START {kind} {size}px', flush=True)
        duration = run_logged(blender_command(source, sheet, size, mode, 'all', helm_layers),
                              run_dir / 'logs' / f'{kind}.log')
        validate(sheet, kind)
        print(f'BAKE_VALID {kind} {duration["seconds"]}s', flush=True)
        manifest['builds'][kind] = {'duration': duration, 'sheet': str(sheet)}
        save_manifest(run_dir, manifest)
    assets = run_dir / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(run_dir / 'baseline' / 'chicken.js', assets / 'chicken.js')
    if sha(assets / 'chicken.js') != sha(REPO / 'sprites' / 'chicken.js'):
        raise ValueError('Production chicken.js changed since the baseline snapshot')
    for kind, _, _, _ in jobs:
        sheet = run_dir / 'sheets' / kind
        destination = assets / f'{kind}.js'
        print(f'PACK_START {kind}', flush=True)
        run_logged([sys.executable, PACKER, sheet, destination.name, kind, assets],
                   run_dir / 'logs' / f'pack-{kind}.log')
        validate(sheet, kind, destination)
        print(f'PACK_VALID {kind}', flush=True)
    manifest['assets'] = {path.name: {'sha256': sha(path), 'bytes': path.stat().st_size}
                          for path in sorted(assets.glob('*.js'))}
    manifest['chickenPreservedByteForByte'] = True
    for relative, digest in manifest['sourceHashes'].items():
        if sha(REPO / relative) != digest:
            raise ValueError(f'Source changed during bake: {relative}')
    manifest['status'] = 'validated_staged_candidate'
    print(f'STAGED_CANDIDATE {assets}', flush=True)


def patch_block(args, run_dir, manifest):
    """Overlay a source-corrected block pose after an older full bake finishes."""
    sheet = run_dir / 'sheets' / 'knight'
    hero_sheet = run_dir / 'sheets' / 'hero'
    assets = run_dir / 'assets'
    if not (sheet / 'sheet.json').exists() or not (hero_sheet / 'sheet.json').exists():
        raise ValueError('Full knight and hero sheets must exist before patching')
    indices = [12, 13, 29, 30, 46, 47, 63, 64, 80, 81]
    selection = ','.join(map(str, indices))
    patch_dir = run_dir / 'patches' / 'block-hand'
    patch_dir.mkdir(parents=True, exist_ok=True)
    expected = {p.name for p in sheet.glob('*.png') if int(p.stem[-3:]) in indices}
    if len(expected) != 61 * 10:
        raise ValueError(f'Expected 610 full-sheet block PNGs, found {len(expected)}')
    helm_layers = 'base,mask,metal,armfreeBase,armfreeMask,armfreeMetal'
    print(f'PATCH_START {len(expected)} selected frames', flush=True)
    duration = run_logged(blender_command(args.source, patch_dir, 160, 'sheet', 'all', helm_layers),
                          run_dir / 'logs' / 'patch-block-hand.log',
                          env={'CK_FRAME_FILTER': selection})
    actual = {p.name for p in patch_dir.glob('*.png')}
    if actual != expected:
        raise ValueError(f'Patch PNG set mismatch: {len(actual)} actual, {len(expected)} expected; '
                         f'missing {sorted(expected-actual)[:3]}, extra {sorted(actual-expected)[:3]}')
    for name in sorted(expected):
        shutil.copy2(patch_dir / name, sheet / name)
    validate(sheet, 'knight')
    validate(hero_sheet, 'hero', assets / 'hero.js')
    run_logged([sys.executable, PACKER, sheet, 'knight.js', 'knight', assets],
               run_dir / 'logs' / 'pack-knight-patched.log')
    validate(sheet, 'knight', assets / 'knight.js')
    if sha(assets / 'chicken.js') != sha(run_dir / 'baseline' / 'chicken.js'):
        raise ValueError('Staged chicken.js changed since baseline')
    manifest['patchBlockHand'] = {'indices': indices, 'duration': duration,
                                   'pngCount': len(expected), 'sourceSha256': sha(args.source)}
    manifest['sourceHashes'] = {str(p.relative_to(REPO)): sha(p) for p in
                                (CHICKEN_SOURCE, FACE_GEOMETRY, args.source, PACKER, VALIDATOR, Path(__file__))
                                if p.is_file() and p.is_relative_to(REPO)}
    manifest['assets'] = {path.name: {'sha256': sha(path), 'bytes': path.stat().st_size}
                          for path in sorted(assets.glob('*.js'))}
    manifest['chickenPreservedByteForByte'] = True
    manifest.pop('lastError', None)
    manifest['status'] = 'validated_staged_candidate'
    print(f'PATCHED_CANDIDATE {assets}', flush=True)


def preview_patch(args, run_dir, manifest):
    if not args.pilot_patch_dir:
        raise ValueError('--pilot-patch-dir is required for preview-patch')
    source = run_dir / 'pilot' / 'sheet'
    target = run_dir / 'preview-corrected' / 'sheet'
    shutil.copytree(source, target, dirs_exist_ok=True)
    indices = [12, 13, 29, 30, 46, 47, 63, 64, 80, 81]
    expected = {f'helm_great_{suffix}_{i:03d}.png' for suffix in
                ('base', 'mask', 'metal', 'armfreeBase', 'armfreeMask', 'armfreeMetal') for i in indices}
    actual = {p.name for p in args.pilot_patch_dir.glob('*.png')}
    if actual != expected:
        raise ValueError(f'Great pilot patch has {len(actual)} PNGs; expected 60; '
                         f'missing {sorted(expected-actual)[:3]}, extra {sorted(actual-expected)[:3]}')
    for name in sorted(expected):
        shutil.copy2(args.pilot_patch_dir / name, target / name)
    validate(target, 'pilot')
    partial = run_dir / 'preview-corrected' / 'partial-knight.js'
    run_logged([sys.executable, PACKER, target, partial.name, 'knight', partial.parent],
               run_dir / 'logs' / 'pack-preview-corrected.log')
    merged = run_dir / 'preview' / 'knight.js'
    subprocess.run([sys.executable, MERGER, run_dir / 'baseline' / 'knight.js', partial, merged],
                   cwd=REPO, check=True)
    if args.preview_root:
        destination = args.preview_root / 'sprites' / 'knight.js'
        if not destination.parent.is_dir():
            raise FileNotFoundError(destination.parent)
        shutil.copy2(merged, destination)
    manifest['previewPatch'] = {'indices': indices, 'source': str(args.pilot_patch_dir),
                                'pngCount': len(expected), 'previewSha256': sha(merged)}
    print(f'PREVIEW_PATCHED {merged}', flush=True)


def visor_pilot(args, run_dir, manifest):
    results = {}
    for style in ('closed', 'open'):
        sheet = run_dir / 'pilot' / f'visor-{style}'
        sheet.mkdir(parents=True, exist_ok=True)
        duration = run_logged(blender_command(args.source, sheet, 160, 'sheet', 'helm_great', 'base'),
                              run_dir / 'logs' / f'visor-pilot-{style}.log',
                              env={'CK_VISOR_STYLE': style})
        validate(sheet, 'pilot')
        count = len(list(sheet.glob('*.png')))
        if count != 85:
            raise ValueError(f'{style} visor pilot has {count} PNGs; expected 85')
        meta = json.loads((sheet / 'sheet.json').read_text(encoding='utf-8'))
        if meta.get('visorStyle') != style or meta.get('faceRevision') != 'visor-v1-all-six':
            raise ValueError(f'{style} visor pilot has wrong style or face revision metadata')
        results[style] = {'seconds': duration['seconds'], 'pngCount': count,
                          'sheet': str(sheet)}
    total = sum(result['seconds'] for result in results.values())
    estimate = round(total / 85 * (61*85 + 61*6) / 60, 1)
    manifest['visorPilot'] = {'styles': results, 'sourceSha256': sha(args.source),
                               'fullEstimateMinutes': estimate}
    print(f'VISOR_PILOT_OK estimated two-family render {estimate}min', flush=True)


def visor_full(args, run_dir, manifest):
    prior = manifest.get('visorPilot')
    if not prior or prior['sourceSha256'] != sha(args.source):
        raise ValueError('Run fresh closed/open visor pilots using this baker source first')
    if prior['fullEstimateMinutes'] > args.max_visor_estimate_minutes:
        raise ValueError(f'Visor pilots estimated {prior["fullEstimateMinutes"]}min; limit is '
                         f'{args.max_visor_estimate_minutes}min')
    pilot_closed = run_dir / 'pilot' / 'visor-closed'
    pilot_open = run_dir / 'pilot' / 'visor-open'
    differences = sum(not decoded_rgba_equal(p, pilot_open / p.name)
                      for p in pilot_closed.glob('helm_great_base_*.png'))
    if differences < 20:
        raise ValueError(f'Closed/open pilot images differ in only {differences}/85 frames')
    manifest['visorPilot']['differentGreatFrames'] = differences
    helm_layers = 'base,mask,metal,armfreeBase,armfreeMask,armfreeMetal'
    jobs = [(style, kind, size, mode) for style in ('closed', 'open')
            for kind, size, mode in (('knight', 160, 'sheet'), ('hero', 384, 'hero'))]
    manifest['visorBuilds'] = {}
    for style, kind, size, mode in jobs:
        sheet = run_dir / 'sheets' / style / kind
        sheet.mkdir(parents=True, exist_ok=True)
        print(f'VISOR_BAKE_START {style} {kind} {size}px', flush=True)
        duration = run_logged(blender_command(args.source, sheet, size, mode, 'all', helm_layers),
                              run_dir / 'logs' / f'visor-{style}-{kind}.log',
                              env={'CK_VISOR_STYLE': style})
        validate(sheet, kind)
        meta = json.loads((sheet / 'sheet.json').read_text(encoding='utf-8'))
        if meta.get('visorStyle') != style or meta.get('faceRevision') != 'visor-v1-all-six':
            raise ValueError(f'{style} {kind} has wrong style or face revision metadata')
        manifest['visorBuilds'][f'{style}/{kind}'] = {'duration': duration, 'sheet': str(sheet)}
        save_manifest(run_dir, manifest)
        print(f'VISOR_BAKE_VALID {style} {kind}', flush=True)
        if style == 'closed' and kind == 'hero':
            closed_assets = pack_closed_review(run_dir)
            manifest['closedReviewAssets'] = str(closed_assets)
            save_manifest(run_dir, manifest)
    assets = run_dir / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(run_dir / 'baseline' / 'chicken.js', assets / 'chicken.js')
    if sha(assets / 'chicken.js') != sha(REPO / 'sprites' / 'chicken.js'):
        raise ValueError('Production chicken.js changed since baseline')
    for style, kind, _, _ in jobs:
        sheet = run_dir / 'sheets' / style / kind
        key = kind if style == 'closed' else kind + 'Open'
        filename = f'{kind}.js' if style == 'closed' else f'{kind}-open.js'
        path = assets / filename
        run_logged([sys.executable, PACKER, sheet, filename, key, assets],
                   run_dir / 'logs' / f'pack-visor-{style}-{kind}.log')
        validate(sheet, kind, path, key=key)
        print(f'VISOR_PACK_VALID {style} {kind}', flush=True)
    style_differences = {}
    for kind, frames in (('knight', 85), ('hero', 6)):
        closed_sheet = run_dir / 'sheets' / 'closed' / kind
        open_sheet = run_dir / 'sheets' / 'open' / kind
        count = sum(not decoded_rgba_equal(
                    closed_sheet / f'helm_great_base_{i:03d}.png',
                    open_sheet / f'helm_great_base_{i:03d}.png') for i in range(frames))
        if count == 0:
            raise ValueError(f'Closed/open {kind} great-helmet frames are identical')
        style_differences[kind] = {'differentGreatFrames': count, 'totalGreatFrames': frames}
    manifest['visorStyleDifferences'] = style_differences
    manifest['assets'] = {path.name: {'sha256': sha(path), 'bytes': path.stat().st_size}
                          for path in sorted(assets.glob('*.js'))}
    for relative, digest in manifest['sourceHashes'].items():
        if sha(REPO / relative) != digest:
            raise ValueError(f'Source changed during visor bake: {relative}')
    manifest['chickenPreservedByteForByte'] = True
    manifest['status'] = 'validated_staged_visor_candidate'
    print(f'STAGED_VISOR_CANDIDATE {assets}', flush=True)


def visor_jobs(meta):
    helm_suffixes = ('base', 'mask', 'metal', 'armfreeBase', 'armfreeMask', 'armfreeMetal')
    jobs = [(f'helm_{name}', helm_suffixes) for name in meta['helms']]
    jobs += [(f'plume_{name}', ('plume',)) for name in meta['plumes']]
    jobs += [(f'blade_{name}', ('solo',)) for name in meta['blades']]
    jobs += [('cape', ('solo',))]
    jobs += [(f'capepat_{name}', ('mask',)) for name in meta['pats']]
    jobs += [(f'emb_{name}', ('solo',)) for name in meta['embs']]
    return jobs


def valid_png(path, cell):
    if not path.is_file():
        return False
    try:
        with Image.open(path) as image:
            if image.mode != 'RGBA' or image.size != (cell, cell):
                return False
            image.load()
        return True
    except (OSError, ValueError):
        return False


def job_missing(sheet, job, count, cell):
    prefix, suffixes = job
    return tuple(i for i in range(count)
                 if any(not valid_png(sheet / f'{prefix}_{suffix}_{i:03d}.png', cell)
                        for suffix in suffixes))


def pack_closed_review(run_dir):
    assets = run_dir / 'closed-review-assets'
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(run_dir / 'baseline' / 'chicken.js', assets / 'chicken.js')
    for kind in ('knight', 'hero'):
        sheet = run_dir / 'sheets' / 'closed' / kind
        filename = f'{kind}.js'
        run_logged([sys.executable, PACKER, sheet, filename, kind, assets],
                   run_dir / 'logs' / f'pack-closed-review-{kind}.log')
        validate(sheet, kind, assets / filename, key=kind)
    print(f'CLOSED_REVIEW_READY {assets}', flush=True)
    return assets


def visor_resume(args, run_dir, manifest):
    prior = manifest.get('visorPilot')
    if not prior or prior['sourceSha256'] != sha(args.source):
        raise ValueError('Visor baker differs from the validated closed/open pilots')
    old_pilots = run_dir / 'pilot-pre-filter-fix'
    if old_pilots.is_dir():
        compared = 0
        for style in ('closed', 'open'):
            for i in range(85):
                filename = f'helm_great_base_{i:03d}.png'
                with Image.open(old_pilots / f'visor-{style}' / filename) as old_image, \
                     Image.open(run_dir / 'pilot' / f'visor-{style}' / filename) as new_image:
                    if old_image.convert('RGBA').tobytes() != new_image.convert('RGBA').tobytes():
                        raise ValueError(f'Filter-only fix changed pilot pixels: {style} {filename}')
                compared += 1
        manifest['pilotPixelEquivalence'] = {'comparedFrames': compared,
                                              'identicalDecodedRgbaFrames': compared,
                                              'originalPilots': str(old_pilots)}
    manifest.setdefault('resume', {'interruptedError': manifest.get('lastError'),
                                   'interruptedSourceHashes': manifest.get('sourceHashes', {}).copy(),
                                   'batches': []})
    if manifest.get('lastError'):
        history = manifest['resume'].setdefault('interruptions', [])
        if not history or history[-1] != manifest['lastError']:
            history.append(manifest['lastError'])
    manifest.pop('lastError', None)
    manifest['resume']['blenderThreads'] = BLENDER_THREADS
    helm_layers = 'base,mask,metal,armfreeBase,armfreeMask,armfreeMetal'
    for style in ('closed', 'open'):
        for kind, cell, mode in (('knight', 160, 'sheet'), ('hero', 384, 'hero')):
            sheet = run_dir / 'sheets' / style / kind
            sheet.mkdir(parents=True, exist_ok=True)
            pilot_meta = json.loads((run_dir / 'pilot' / f'visor-{style}' / 'sheet.json').read_text())
            count = 85 if kind == 'knight' else 6
            groups = {}
            for job in visor_jobs(pilot_meta):
                missing = job_missing(sheet, job, count, cell)
                if missing:
                    groups.setdefault(missing, []).append(job)
            for missing, group in groups.items():
                batch = []
                batch_cost = 0
                for job in group:
                    cost = len(missing) * len(job[1])
                    if batch and batch_cost + cost > 800:
                        render_visor_batch(args, run_dir, manifest, style, kind, cell, mode,
                                           sheet, batch, missing, helm_layers)
                        batch, batch_cost = [], 0
                    batch.append(job)
                    batch_cost += cost
                if batch:
                    render_visor_batch(args, run_dir, manifest, style, kind, cell, mode,
                                       sheet, batch, missing, helm_layers)
            if not (sheet / 'sheet.json').is_file():
                # A complete unfiltered small job reconstructs the full rig metadata.
                run_logged(blender_command(args.source, sheet, cell, mode, 'helm_great', helm_layers),
                           run_dir / 'logs' / f'visor-meta-{style}-{kind}.log',
                           env={'CK_VISOR_STYLE': style})
            validate(sheet, kind)
            meta = json.loads((sheet / 'sheet.json').read_text(encoding='utf-8'))
            if meta.get('visorStyle') != style or meta.get('faceRevision') != 'visor-v1-all-six':
                raise ValueError(f'{style} {kind} has wrong visor metadata')
            manifest.setdefault('visorBuilds', {})[f'{style}/{kind}'] = {
                'sheet': str(sheet), 'validated': True, 'pngCount': 61*count}
            save_manifest(run_dir, manifest)
            print(f'VISOR_RESUME_VALID {style} {kind}', flush=True)
            if style == 'closed' and kind == 'hero':
                closed_assets = pack_closed_review(run_dir)
                manifest['closedReviewAssets'] = str(closed_assets)
                save_manifest(run_dir, manifest)
    assets = run_dir / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(run_dir / 'baseline' / 'chicken.js', assets / 'chicken.js')
    if sha(assets / 'chicken.js') != sha(REPO / 'sprites' / 'chicken.js'):
        raise ValueError('Production chicken.js changed since baseline')
    for style in ('closed', 'open'):
        for kind in ('knight', 'hero'):
            sheet = run_dir / 'sheets' / style / kind
            key = kind if style == 'closed' else kind + 'Open'
            filename = f'{kind}.js' if style == 'closed' else f'{kind}-open.js'
            run_logged([sys.executable, PACKER, sheet, filename, key, assets],
                       run_dir / 'logs' / f'pack-visor-{style}-{kind}.log')
            validate(sheet, kind, assets / filename, key=key)
            print(f'VISOR_PACK_VALID {style} {kind}', flush=True)
    differences = {}
    for kind, count in (('knight', 85), ('hero', 6)):
        closed = run_dir / 'sheets' / 'closed' / kind
        opened = run_dir / 'sheets' / 'open' / kind
        diff = sum(not decoded_rgba_equal(
                   closed / f'helm_great_base_{i:03d}.png',
                   opened / f'helm_great_base_{i:03d}.png') for i in range(count))
        if diff == 0:
            raise ValueError(f'{kind} closed/open great-helmet renders are identical')
        differences[kind] = {'differentGreatFrames': diff, 'totalGreatFrames': count}
    manifest['visorStyleDifferences'] = differences
    manifest['assets'] = {path.name: {'sha256': sha(path), 'bytes': path.stat().st_size}
                          for path in sorted(assets.glob('*.js'))}
    for relative, digest in manifest['sourceHashes'].items():
        if sha(REPO / relative) != digest:
            raise ValueError(f'Source changed during visor resume: {relative}')
    manifest['chickenPreservedByteForByte'] = True
    manifest['status'] = 'validated_staged_visor_candidate'
    print(f'STAGED_VISOR_CANDIDATE {assets}', flush=True)


def render_visor_batch(args, run_dir, manifest, style, kind, cell, mode, sheet,
                       batch, missing, helm_layers):
    number = len(manifest['resume']['batches']) + 1
    names = [job[0] for job in batch]
    frame_filter = ','.join(map(str, missing))
    expected_pngs = sum(len(job[1]) * len(missing) for job in batch)
    canonical = ((run_dir / 'pilot' / f'visor-{style}' / 'sheet.json') if kind == 'knight'
                 else sheet / 'sheet.json')
    if len(missing) < (85 if kind == 'knight' else 6) and not canonical.is_file():
        raise ValueError(f'Filtered {style}/{kind} batch needs a complete canonical rig: {canonical}')
    print(f'VISOR_RESUME_BATCH {number} {style}/{kind} {names} '
          f'{len(missing)} frames, {expected_pngs} PNGs', flush=True)
    logfile = run_dir / 'logs' / f'visor-resume-{number:03d}.log'
    attempt = 2
    while logfile.exists():
        logfile = run_dir / 'logs' / f'visor-resume-{number:03d}-attempt{attempt}.log'
        attempt += 1
    duration = run_logged(blender_command(args.source, sheet, cell, mode,
                                          ','.join(names), helm_layers),
                          logfile,
                          env={'CK_VISOR_STYLE': style, 'CK_FRAME_FILTER': frame_filter,
                               'CK_CANONICAL_RIG_PATH': str(canonical)})
    for job in batch:
        still_missing = job_missing(sheet, job, 85 if kind == 'knight' else 6, cell)
        if still_missing:
            raise ValueError(f'Batch {number} left {len(still_missing)} {job[0]} frames missing')
    manifest['resume']['batches'].append({'number': number, 'style': style, 'kind': kind,
                                          'jobs': names, 'frames': list(missing),
                                          'expectedPngCount': expected_pngs, 'duration': duration,
                                          'blenderThreads': BLENDER_THREADS,
                                          'bakerSha256': sha(args.source), 'log': str(logfile)})
    save_manifest(run_dir, manifest)


def archive_review(run_dir, manifest):
    assets = run_dir / 'assets'
    for kind in ('knight', 'hero'):
        validate(run_dir / 'sheets' / kind, kind, assets / f'{kind}.js',
                 legacy_face_revision=True)
    chicken = assets / 'chicken.js'
    if sha(chicken) != sha(run_dir / 'baseline' / 'chicken.js'):
        raise ValueError('Review chicken asset changed from baseline')
    manifest['assets'] = {path.name: {'sha256': sha(path), 'bytes': path.stat().st_size}
                          for path in sorted(assets.glob('*.js'))}
    manifest['reviewArchive'] = {
        'reason': 'Superseded by the user-requested closed/open visor wardrobe variants',
        'bakeSourceHash': manifest.get('sourceHashes', {}).get(str(Path('art/blender/face_bake.py')),
                                                           manifest.get('sourceHashes', {}).get('art\\blender\\face_bake.py')),
        'currentSourceHash': sha(REPO / 'art/blender/face_bake.py'),
        'sourceChangedDuringBake': True,
        'validatedUtc': datetime.now(timezone.utc).isoformat()}
    manifest.pop('lastError', None)
    manifest['status'] = 'validated_review_only_obsolete_bright'
    print(f'ARCHIVED_BRIGHT_REVIEW {assets}', flush=True)


def save_manifest(run_dir, manifest):
    (run_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')


def main():
    global BLENDER_THREADS
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=('pilot', 'full', 'patch-block', 'preview-patch',
                                          'visor-pilot', 'visor-full', 'visor-resume',
                                          'archive-review'))
    parser.add_argument('--run-dir', type=Path)
    parser.add_argument('--source', type=Path, default=REPO / 'art/blender/face_bake.py')
    parser.add_argument('--pilot-sheet', type=Path, help='Adopt an already completed pilot sheet')
    parser.add_argument('--pilot-patch-dir', type=Path, help='Directory with 60 corrected great-helm PNGs')
    parser.add_argument('--preview-root', type=Path, help='Optional isolated runtime root to receive knight.js')
    parser.add_argument('--max-estimate-minutes', type=float, default=15)
    parser.add_argument('--max-visor-estimate-minutes', type=float, default=60)
    parser.add_argument('--blender-threads', type=int, choices=(1, 2, 4), default=4)
    args = parser.parse_args()
    BLENDER_THREADS = args.blender_threads
    if args.phase.startswith('visor-') and args.source == REPO / 'art/blender/face_bake.py':
        args.source = VISOR_SOURCE
    args.source = args.source.resolve()
    if args.pilot_sheet:
        args.pilot_sheet = args.pilot_sheet.resolve()
    if args.pilot_patch_dir:
        args.pilot_patch_dir = args.pilot_patch_dir.resolve()
    if args.preview_root:
        args.preview_root = args.preview_root.resolve()
    if not BLENDER.is_file():
        raise FileNotFoundError(BLENDER)
    if not args.source.is_file():
        raise FileNotFoundError(args.source)
    run_dir = args.run_dir.resolve() if args.run_dir else BUILD_ROOT / datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
    run_dir.mkdir(parents=True, exist_ok=True)
    baseline(run_dir)
    manifest_path = run_dir / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {
        'runDirectory': str(run_dir), 'createdUtc': datetime.now(timezone.utc).isoformat(),
        'baseline': {p.name: {'sha256': sha(p), 'bytes': p.stat().st_size}
                     for p in sorted((run_dir / 'baseline').glob('*.js'))},
        'status': 'building'}
    if args.phase == 'visor-resume' and 'resume' not in manifest:
        manifest['resume'] = {'interruptedError': manifest.get('lastError'),
                              'interruptedSourceHashes': manifest.get('sourceHashes', {}).copy(),
                              'batches': []}
    geometry = VISOR_GEOMETRY if args.phase.startswith('visor-') else FACE_GEOMETRY
    if args.phase != 'archive-review':
        current_hashes = {str(p.relative_to(REPO)): sha(p) for p in
                          (CHICKEN_SOURCE, geometry, args.source, PACKER, VALIDATOR, Path(__file__))
                          if p.is_file() and p.is_relative_to(REPO)}
        pinned_hashes = manifest.get('sourceHashes')
        if args.phase in ('visor-full', 'visor-resume'):
            if not pinned_hashes:
                raise ValueError('Visor full/resume requires source hashes pinned by pilot')
            changed = {name: {'pilot': pinned_hashes.get(name), 'current': current_hashes.get(name)}
                       for name in sorted(set(pinned_hashes) | set(current_hashes))
                       if pinned_hashes.get(name) != current_hashes.get(name)}
            if changed:
                raise ValueError(f'Visor source changed since pilot: {changed}')
        elif args.phase == 'visor-pilot' and pinned_hashes and pinned_hashes != current_hashes:
            raise ValueError('Existing visor run has different source hashes; start a fresh run')
        else:
            manifest['sourceHashes'] = current_hashes
    try:
        if args.phase == 'pilot':
            pilot(args, run_dir, manifest)
        elif args.phase == 'full':
            full(args, run_dir, manifest)
        elif args.phase == 'patch-block':
            patch_block(args, run_dir, manifest)
        elif args.phase == 'visor-pilot':
            visor_pilot(args, run_dir, manifest)
        elif args.phase == 'visor-full':
            visor_full(args, run_dir, manifest)
        elif args.phase == 'visor-resume':
            visor_resume(args, run_dir, manifest)
        elif args.phase == 'archive-review':
            archive_review(run_dir, manifest)
        else:
            preview_patch(args, run_dir, manifest)
    except Exception as error:
        manifest['lastError'] = str(error)
        save_manifest(run_dir, manifest)
        raise
    save_manifest(run_dir, manifest)
    print(f'RUN_DIR {run_dir}', flush=True)


if __name__ == '__main__':
    main()
