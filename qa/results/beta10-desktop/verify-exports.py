from pathlib import Path
import hashlib, json, zipfile
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
with zipfile.ZipFile(friend_path) as z:
    assert z.testzip() is None
    info = json.loads(z.read('BUILD-INFO.json'))
    assert info['sourceCommit'] == preview['sourceCommit']
    assert info['version'] == preview['version'] == '0.3.0-beta.10'
    assert info['sourceZipSha256'] == preview['sha256']
    assert len(info['gameFiles']) == len(preview['gameFiles']) == 73
    for item in info['gameFiles']:
        data = z.read(item['path'])
        relative = item['path'].removeprefix('Game/')
        assert len(data) == item['bytes'] and digest(data) == item['sha256']
        assert data == (Path(preview['folder']) / relative).read_bytes()
        assert data == (repo / 'dist/Custard Knights-win32-x64' / relative).read_bytes()
    (here / 'friends-build-info.json').write_text(json.dumps(info, indent=2) + '\n')
package = json.loads((here / 'package-evidence.json').read_text())
assert len(package['files']) == 61
assert any(x['file'] == 'game/onboarding.js' for x in package['files'])
assert info['appAsarSha256'] == package['archiveSha256']
assert digest((Path(preview['folder']) / 'resources/app.asar').read_bytes()) == package['archiveSha256']
assert digest((Path(preview['folder']) / 'Custard Knights.exe').read_bytes()) == package['executableSha256']
aim = json.loads((repo / 'qa/results/beta10-packaged-onboarding/report.json').read_text())
assert len(aim['checks']) == 38 and all(x['pass'] for x in aim['checks'])
assert aim['sourceHashes'] == aim['sourceHashesAfter'] and not aim['consoleErrors'] and not aim.get('failure')
by_source = {x['file']: x for x in package['files']}
assert all(by_source[name]['sha256'] == value for name, value in aim['sourceHashes'].items())
actual_home = json.loads((here / 'actual-onboarding.json').read_text())
assert actual_home['pass'] and len(actual_home['checks']) == 9
assert all(x['pass'] for x in actual_home['checks']) and actual_home['origin'] == 'custard://game'
record = dict(version=preview['version'], sourceCommit=preview['sourceCommit'],
    asarSha256=package['archiveSha256'], executableSha256=package['executableSha256'],
    packageEntries=61, friendsGameFiles=73, preview={k:preview[k] for k in ('bytes','sha256')},
    friends={k:friends[k] for k in ('bytes','sha256')}, zipIntegrity=True,
    exactCopiedGameBytes=True, packagedOnboardingChecks=38, actualDesktopOnboardingChecks=len(actual_home['checks']), publiclyUploaded=False)
(here / 'exports.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2))
