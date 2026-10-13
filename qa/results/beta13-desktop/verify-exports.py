from pathlib import Path
import hashlib, json, zipfile, subprocess
here = Path(__file__).resolve().parent
repo = here.parents[2]
preview = json.loads((here / 'preview-export.json').read_text())
friends = json.loads((here / 'friends-export-run.json').read_text())
out = repo.parent.parent / 'outputs'
digest = lambda data: hashlib.sha256(data).hexdigest()
assert digest(Path(preview['zip']).read_bytes()) == preview['sha256']
friend_path = out / friends['zip']
assert digest(friend_path.read_bytes()) == friends['sha256']
with zipfile.ZipFile(preview['zip']) as z:
    assert z.testzip() is None
    root=Path(preview['folder']).name
    for item in preview['gameFiles']:
        data=z.read(root+'/'+item['path'])
        assert len(data)==item['bytes'] and digest(data)==item['sha256']
        assert data==(repo/'dist/Custard Knights-win32-x64'/item['path']).read_bytes()
with zipfile.ZipFile(friend_path) as z:
    assert z.testzip() is None
    info = json.loads(z.read('BUILD-INFO.json'))
    assert info['sourceCommit'] == preview['sourceCommit']
    assert info['version'] == preview['version'] == '0.3.0-beta.13'
    assert info['sourceZipSha256'] == preview['sha256']
    assert len(info['gameFiles']) == len(preview['gameFiles']) == 73
    for item in info['gameFiles']:
        data = z.read(item['path'])
        relative = item['path'].removeprefix('Game/')
        assert len(data) == item['bytes'] and digest(data) == item['sha256']
        assert data == (Path(preview['folder']) / relative).read_bytes()
        assert data == (repo / 'dist/Custard Knights-win32-x64' / relative).read_bytes()
    for material in ('START-HERE.txt','FEEDBACK.html'):
        frozen=subprocess.check_output(['git','show',preview['sourceCommit']+':release/playtest/'+material],cwd=repo)
        assert frozen.decode('utf-8').replace('\r\n','\n')==(repo/'release/playtest'/material).read_text(encoding='utf-8')
    assert z.read('START-HERE.txt').decode() == (repo / 'release/playtest/START-HERE.txt').read_text(encoding='utf-8').replace('{{VERSION}}',preview['version'])
    expected_feedback=(repo / 'release/playtest/FEEDBACK.html').read_text(encoding='utf-8').replace('/*BUILD_METADATA*/ null',json.dumps({k:info[k] for k in ('version','sourceCommit','sourceZipSha256','appAsarSha256')}))
    assert z.read('FEEDBACK.html').decode() == expected_feedback
    materials={name:{'bytes':len(z.read(name)),'sha256':digest(z.read(name))} for name in ('START-HERE.txt','FEEDBACK.html','BUILD-INFO.json')}
    (here/'friends-materials-verification.json').write_text(json.dumps({'sourceCommit':preview['sourceCommit'],'frozenTemplatesNormalizedExact':True,'normalization':'UTF-8 decoding and CRLF to LF, as standard playtest-bundle read_text' ,'renderedMaterialsExact':True,'files':materials},indent=2)+'\n')
    (here / 'friends-build-info.json').write_text(json.dumps(info, indent=2) + '\n')
package = json.loads((here / 'package-evidence.json').read_text())
assert len(package['files']) == 63
assert any(x['file'] == 'game/controls.js' for x in package['files'])
assert info['appAsarSha256'] == package['archiveSha256']
assert digest((Path(preview['folder']) / 'resources/app.asar').read_bytes()) == package['archiveSha256']
assert digest((Path(preview['folder']) / 'Custard Knights.exe').read_bytes()) == package['executableSha256']
aim = json.loads((repo / 'qa/results/beta13-packaged-controls/report.json').read_text())
assert len(aim['checks']) == 33 and all(x['pass'] for x in aim['checks'])
assert aim['sourceHashes'] == aim['sourceHashesAfter'] and not aim['errors'] and not aim.get('failure')
assert aim['stableSources'] is True
by_source = {x['file']: x for x in package['files']}
assert all(by_source[name]['sha256'] == value for name, value in aim['sourceHashes'].items())
actual_home = json.loads((here / 'actual-controls.json').read_text())
assert actual_home['pass'] and len(actual_home['checks']) == 9
assert all(x['pass'] for x in actual_home['checks']) and actual_home['origin'] == 'custard://game'
record = dict(version=preview['version'], sourceCommit=preview['sourceCommit'],
    asarSha256=package['archiveSha256'], executableSha256=package['executableSha256'],
    packageEntries=len(package['files']), friendsGameFiles=len(info['gameFiles']), preview={k:preview[k] for k in ('bytes','sha256')},
    friends={k:friends[k] for k in ('bytes','sha256')}, zipIntegrity=True,
    exactCopiedGameBytes=True, exactPreviewZipGameBytes=True, exactFrozenNormalizedMaterials=True, packagedRemapChecks=len(aim['checks']), actualDesktopControlsChecks=len(actual_home['checks']), publiclyUploaded=False)
(here / 'exports.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2))
