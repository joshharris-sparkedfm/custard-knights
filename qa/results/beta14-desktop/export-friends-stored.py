"""Evidence-only in-memory compression substitution; frozen bundler stays unchanged."""
from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent
repo=here.parents[2]
source=repo/'scripts/playtest-bundle.py'
before=source.read_bytes()
text=before.decode('utf-8')
substitutions=[('zipfile.ZIP_DEFLATED, compresslevel=4','zipfile.ZIP_STORED'),('partial.unlink(missing_ok=True)','pass # Preserve failed partial evidence')]
for old,new in substitutions:
    assert text.count(old)==1,old
    text=text.replace(old,new)
sha=lambda b:hashlib.sha256(b).hexdigest()
record=dict(source='scripts/playtest-bundle.py',sourceSha256=sha(before),inMemorySha256=sha(text.encode('utf-8')),substitutions=[dict(before=a,after=b) for a,b in substitutions],compression='ZIP_STORED',reason='Preserved DEFLATE preview roundtrip produced different app.asar bytes; ZIP_STORED bypasses compression/decompression path. Root cause not established.',frozenSourceUnchanged=True)
(here/'friends-adapter.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
namespace=dict(__name__='beta14_evidence_bundler',__file__=str(source))
exec(compile(text,str(source),'exec'),namespace)
preview=json.loads((here/'preview-export.json').read_text(encoding='utf-8'))
package=json.loads((here/'package-evidence.json').read_text(encoding='utf-8'))
result=namespace['bundle'](Path(preview['zip']),repo.parent.parent/'outputs/Custard-Knights-Friends-0.3.0-beta.14.zip',preview['sha256'],preview['version'],preview['sourceCommit'],package['archiveSha256'])
assert source.read_bytes()==before
(here/'friends-export-run.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
