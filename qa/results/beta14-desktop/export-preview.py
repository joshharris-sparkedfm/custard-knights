"""Additive beta.14 export adapted from work/export-preview.py; stdlib only."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys, zipfile

repo = Path(__file__).resolve().parents[3]
out = repo.parent.parent / 'outputs'
commit = sys.argv[1]
assert len(commit) == 40 and all(c in '0123456789abcdef' for c in commit)
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip() == commit
subprocess.run(['git', 'diff', '--exit-code', 'HEAD', '--', 'index.html', 'game', 'desktop', 'art', 'sprites', 'audio', 'vendor', 'package.json', 'package-lock.json', 'scripts/package.cjs', 'release/playtest'], cwd=repo, check=True)
version = json.loads((repo / 'package.json').read_text())['version']
assert version == '0.3.0-beta.14'
src = repo / 'dist' / 'Custard Knights-win32-x64'
dest = out / f'Custard-Knights-Windows-{version}-preview'
archive = out / f'Custard-Knights-Windows-{version}-preview.zip'
partial = archive.with_suffix('.zip.partial')
assert not any(p.exists() for p in (dest, archive, partial)), 'Refusing to overwrite any export'
out.mkdir(exist_ok=True)
shutil.copytree(src, dest)
digest = lambda p: hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()
files = []
for p in sorted(src.rglob('*')):
    if p.is_file():
        relative = p.relative_to(src)
        assert digest(p) == digest(dest / relative), relative
        files.append(dict(path=relative.as_posix(), bytes=p.stat().st_size, sha256=digest(p)))
readme = f'''Custard Knights {version} - private Windows x64 preview
Sparked FM Ltd | Frozen source: {commit}

Extract the whole ZIP and open Custard Knights.exe. Keep all sibling files
together. Close earlier copies normally before launch. F11 toggles fullscreen.
Options > Remap gameplay controls edits Solo keyboard, both keyboard halves
and logical Player 1-4 controller combat profiles. Apply saves locally;
Cancel discards drafts. Reset all prepares defaults, then Apply confirms.
Conflicts block Apply. Release held controls after applying. Follow the
updated prompts. Arena, Cup, Story and practice use these maps; Faction Front,
mouse actions, stick axes/d-pad, menus, keyboard join and shout stay fixed.
If saving fails, the message says changes apply for this session only.
Missing couch controllers keep their seat/outfit reserved. Offline arena/Cup
pauses for recovery; online play continues with the lost seat neutral.
Release controls on an unassigned pad, choose the missing seat with left/right,
then press A to reclaim. Keyboard takeover is available when unassigned.
Deliberate Leave keeps fixed logical Player 1-4 slots, leaving a vacancy.
Survivors keep controls/outfits. Cup results offer Leave seat, preserving
past points and clearing that seat's Ready/vote. Rejoin fills a room vacancy
but waits for a fresh Cup; there is no late current-Cup admission.
Remaining connected players ready up for the next round. Faction Front
is a separate service. Use the same beta for Roomier.
This beta retains optional first-launch welcome and safe controls practice.
Choose Learn by playing or Jump straight in. How to Play lets you replay practice.
Normal saves are local under %APPDATA%/Custard Knights.
Human balance, physical controllers, WAN, second-PC, minimum hardware and
Steam acceptance remain open. This local private beta has not been uploaded.
'''
(dest / 'READ-ME-FIRST.txt').write_text(readme, encoding='utf-8')
shutil.copy2(repo / 'release' / 'RESUME-CHECKPOINT.md', dest / 'RESUME-CHECKPOINT.md')
with zipfile.ZipFile(partial, 'w', zipfile.ZIP_DEFLATED, compresslevel=4) as z:
    for p in sorted(dest.rglob('*')):
        if p.is_file():
            z.write(p, Path(dest.name) / p.relative_to(dest))
with zipfile.ZipFile(partial) as z:
    assert z.testzip() is None
partial.rename(archive)
record = dict(version=version, sourceCommit=commit, folder=str(dest), zip=str(archive),
              bytes=archive.stat().st_size, sha256=digest(archive), gameFiles=files,
              zipIntegrity=True, publiclyUploaded=False)
(Path(__file__).parent / 'preview-export.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({k:v for k,v in record.items() if k != 'gameFiles'}, indent=2))
