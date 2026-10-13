"""Additive ZIP_STORED recovery after preserved DEFLATE content corruption."""
from pathlib import Path
import hashlib,json,subprocess,zipfile
here=Path(__file__).resolve().parent
repo=here.parents[2]
out=repo.parent.parent/'outputs'
version='0.3.0-beta.14'
commit='14a5527b0cf56592ce752e74c4937aaba0625bb4'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==commit
subprocess.run(['git','diff','--exit-code','HEAD','--','index.html','game','desktop','art','sprites','audio','vendor','package.json','package-lock.json','scripts/package.cjs','release/playtest/START-HERE.txt','release/playtest/FEEDBACK.html'],cwd=repo,check=True)
source=repo/'dist/Custard Knights-win32-x64'
folder=out/f'Custard-Knights-Windows-{version}-preview'
archive=out/f'{folder.name}.zip'
partial=out/f'{folder.name}.zip.stored.partial'
failed=out/f'{folder.name}.zip.partial'
assert failed.is_file() and folder.is_dir()
assert not archive.exists() and not partial.exists(),'Refusing to overwrite outputs'
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
record=dict(version=version,sourceCommit=commit,folder=str(folder),zip=str(archive),bytes=archive.stat().st_size,sha256=digest(archive),gameFiles=game,zipIntegrity=True,publiclyUploaded=False,compression='ZIP_STORED',preservedFailedArchive=str(failed),allArchiveFiles=inventory)
(here/'preview-export.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in record.items() if k not in ('gameFiles','allArchiveFiles')},indent=2))
