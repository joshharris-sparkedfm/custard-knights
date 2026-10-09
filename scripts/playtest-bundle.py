"""Wrap a checksum-verified Windows preview ZIP with offline playtest materials.

Python 3 standard library only. Never executes or changes the supplied game.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import stat
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def digest(file):
    h = hashlib.sha256()
    with file.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def bundle(source, destination, expected_sha, version, commit, expected_asar):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if destination.exists():
        raise ValueError('Output already exists; choose a new filename to preserve prior kits')
    if not re.fullmatch(r'[0-9A-Za-z.-]+', version):
        raise ValueError('Invalid version')
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('Use the full exported source commit')
    if not all(re.fullmatch(r'[0-9a-f]{64}', x) for x in (expected_sha, expected_asar)):
        raise ValueError('SHA256 values must be 64 lowercase hex digits')
    if digest(source) != expected_sha:
        raise ValueError('Source ZIP checksum mismatch; no bundle created')
    build = dict(version=version, sourceCommit=commit, sourceZipSha256=expected_sha,
                 appAsarSha256=expected_asar)
    materials = ROOT / 'release' / 'playtest'
    readme = (materials / 'START-HERE.txt').read_text(encoding='utf-8').replace('{{VERSION}}', version)
    feedback = (materials / 'FEEDBACK.html').read_text(encoding='utf-8').replace(
        '/*BUILD_METADATA*/ null', json.dumps(build))
    if '/*BUILD_METADATA*/' in feedback:
        raise ValueError('Feedback identity substitution failed')
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Create only our own temporary file beside the destination; remove it on failure.
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix='.partial', delete=False) as f:
        partial = Path(f.name)
    inventory, skipped = [], []
    try:
        with zipfile.ZipFile(source) as original, zipfile.ZipFile(
                partial, 'w', zipfile.ZIP_DEFLATED, compresslevel=4) as target:
            roots, names = set(), set()
            for entry in original.infolist():
                p = PurePosixPath(entry.filename)
                if ('\\' in entry.filename or p.is_absolute() or '..' in p.parts
                        or ':' in entry.filename or not p.parts
                        or stat.S_ISLNK(entry.external_attr >> 16)):
                    raise ValueError('Unsafe ZIP member: ' + entry.filename)
                roots.add(p.parts[0])
                if entry.is_dir():
                    continue
                if len(p.parts) < 2:
                    raise ValueError('Preview must contain a single game folder')
                relative = PurePosixPath(*p.parts[1:]).as_posix()
                if relative.casefold() in names:
                    raise ValueError('Duplicate ZIP member: ' + relative)
                names.add(relative.casefold())
                # Developer handover paths are not needed by friends.
                if relative in ('READ-ME-FIRST.txt', 'RESUME-CHECKPOINT.md'):
                    skipped.append(relative)
                    continue
                h = hashlib.sha256()
                with original.open(entry) as src, target.open('Game/' + relative, 'w') as dst:
                    for chunk in iter(lambda: src.read(1024 * 1024), b''):
                        h.update(chunk)
                        dst.write(chunk)
                inventory.append(dict(path='Game/' + relative, bytes=entry.file_size, sha256=h.hexdigest()))
            if len(roots) != 1:
                raise ValueError('Preview must contain exactly one root folder')
            by_name = {f['path']: f for f in inventory}
            for required in ('Game/Custard Knights.exe', 'Game/resources/app.asar'):
                if required not in by_name:
                    raise ValueError('Missing packaged game file: ' + required)
            if by_name['Game/resources/app.asar']['sha256'] != expected_asar:
                raise ValueError('Packaged runtime checksum mismatch')
            target.writestr('START-HERE.txt', readme)
            target.writestr('FEEDBACK.html', feedback)
            target.writestr('BUILD-INFO.json', json.dumps(dict(
                **build, gameFiles=inventory, excludedHandoverFiles=skipped), indent=2))
        with zipfile.ZipFile(partial) as check:
            if check.testzip() is not None:
                raise ValueError('Bundle ZIP integrity failed')
        # Same-directory rename, refusing to overwrite another finished kit.
        if destination.exists():
            raise ValueError('Output appeared during packaging; refusing overwrite')
        partial.rename(destination)
    finally:
        partial.unlink(missing_ok=True)
    result = dict(zip=destination.name, bytes=destination.stat().st_size,
                  sha256=digest(destination), gameFiles=len(inventory), build=build)
    print(json.dumps(result, indent=2))
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_zip', type=Path)
    parser.add_argument('destination_zip', type=Path)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--version', required=True)
    parser.add_argument('--source-commit', required=True)
    parser.add_argument('--asar-sha256', required=True)
    args = parser.parse_args()
    bundle(args.source_zip, args.destination_zip, args.sha256, args.version,
           args.source_commit, args.asar_sha256)
