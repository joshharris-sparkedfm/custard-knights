"""Additive ZIP_STORED export, bypassing the known DEFLATE roundtrip anomaly."""
from pathlib import Path
import hashlib,json,subprocess,zipfile,sys,shutil
here=Path(__file__).resolve().parent
repo=here.parents[2]
out=repo.parent.parent/'outputs'
version='0.3.0-beta.16'
commit=sys.argv[1]
assert len(commit)==40 and all(c in '0123456789abcdef' for c in commit)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==commit
subprocess.run(['git','diff','--exit-code','HEAD','--','index.html','game','desktop','art','sprites','audio','vendor','package.json','package-lock.json','scripts/package.cjs','release/playtest/START-HERE.txt','release/playtest/FEEDBACK.html'],cwd=repo,check=True)
source=repo/'dist/Custard Knights-win32-x64'
folder=out/f'Custard-Knights-Windows-{version}-preview'
archive=out/f'{folder.name}.zip'
partial=out/f'{folder.name}.zip.stored.partial'
assert not folder.exists() and not archive.exists() and not partial.exists(),'Refusing to overwrite outputs'
out.mkdir(exist_ok=True)
shutil.copytree(source,folder)
readme=f'''Custard Knights {version} - private Windows x64 preview
Sparked FM Ltd | Frozen source: {commit}

Extract the whole ZIP and open Custard Knights.exe. Keep all sibling files
together. Close older copies normally first. F11 toggles fullscreen.
Fresh Story profiles offer Begin at the bakery: move to people/marked objects
and Interact using the current Solo Swing map or left click. Talk to Mabel,
take the covered tray and deliver it at the banquet gate. Steve steals a bun
on his own. Normal combat returns in the pantry rescue of Mabel, Alf and Pip.
On returning, collect their prepared supplies and head east to the actual
bakery defence with its visible siege bowl. Returning profiles can replay; quiet
sequences offer explicit pause/skip/replay. This first story slice is expanded;
the fuller playable treatment of the remaining story is unfinished.
Critical arena/campaign warning banners retain priority, reserve warning
sound capacity and dip music while active. Local volume/mute settings apply.
Pause, menus and leaving restore music. Single critical banner; world tells
remain. Spike sound is at rise, not a new prewarning. Faction Front and
cinematic/status presentation remain separate. Physical input, human listening,
WAN, minimum hardware and Steam acceptance remain open.
Sword: tap Swing for a light swing, keep holding through recovery to charge,
then release for a heavy. Pickup weapons fire instead. Gameplay remaps save
locally; fixed logical room slots retain surviving controls/outfits on Leave.
Cup Leave seat retains past points and clears Ready/vote; room rejoin waits
for a fresh Cup. This private beta has not been publicly uploaded.
Normal saves stay local under %APPDATA%/Custard Knights.
'''
(folder/'READ-ME-FIRST.txt').write_text(readme,encoding='utf-8')
shutil.copy2(repo/'release/RESUME-CHECKPOINT.md',folder/'RESUME-CHECKPOINT.md')
digest=lambda p:hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
game=[]
for p in sorted(source.rglob('*')):
    if p.is_file():
        name=p.relative_to(source).as_posix()
        assert digest(p)==digest(folder/name),name
        game.append(dict(path=name,bytes=p.stat().st_size,sha256=digest(p)))
assert len(game)==73
inventory=[dict(path=p.relative_to(folder).as_posix(),bytes=p.stat().st_size,sha256=digest(p)) for p in sorted(folder.rglob('*')) if p.is_file()]
with zipfile.ZipFile(partial,'w',zipfile.ZIP_STORED) as z:
    for item in inventory:
        z.write(folder/item['path'],folder.name+'/'+item['path'])
with zipfile.ZipFile(partial) as z:
    assert z.testzip() is None
    assert len(z.infolist())==len(inventory)
    for item in inventory:
        data=z.read(folder.name+'/'+item['path'])
        assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'],item['path']
partial.rename(archive)
record=dict(version=version,sourceCommit=commit,folder=str(folder),zip=str(archive),bytes=archive.stat().st_size,sha256=digest(archive),gameFiles=game,zipIntegrity=True,publiclyUploaded=False,compression='ZIP_STORED',allArchiveFiles=inventory)
(here/'preview-export.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in record.items() if k not in ('gameFiles','allArchiveFiles')},indent=2))
