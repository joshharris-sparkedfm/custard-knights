"""Restore generated assets to exact frozen Git bytes after normalized comparison."""
from pathlib import Path
import hashlib, json, subprocess
root=Path(__file__).resolve().parents[3]
commit='14a5527b0cf56592ce752e74c4937aaba0625bb4'
files=['audio/soundtrack.js']+subprocess.check_output(['git','ls-tree','-r','--name-only',commit,'vendor'],cwd=root,text=True).splitlines()
record=[]
for name in files:
    frozen=subprocess.check_output(['git','show',commit+':'+name],cwd=root)
    path=root/name
    current=path.read_bytes()
    assert current.replace(b'\r\n',b'\n')==frozen.replace(b'\r\n',b'\n'), name
    path.write_bytes(frozen)
    record.append(dict(path=name,changed=current!=frozen,sha256=hashlib.sha256(frozen).hexdigest()))
(Path(__file__).parent/'generated-restoration.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record,indent=2))
