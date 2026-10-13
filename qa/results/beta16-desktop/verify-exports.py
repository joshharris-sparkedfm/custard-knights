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
    assert info['version'] == preview['version'] == '0.3.0-beta.16'
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
adapter=json.loads((here/'friends-adapter.json').read_text(encoding='utf-8'))
bundler=(repo/'scripts/playtest-bundle.py').read_bytes()
frozen_bundler=subprocess.check_output(['git','show',preview['sourceCommit']+':scripts/playtest-bundle.py'],cwd=repo)
assert bundler.decode('utf-8').replace('\r\n','\n')==frozen_bundler.decode('utf-8').replace('\r\n','\n')
assert digest(bundler)==adapter['sourceSha256']
transformed=bundler.decode('utf-8')
for substitution in adapter['substitutions']:
    assert transformed.count(substitution['before'])==1
    transformed=transformed.replace(substitution['before'],substitution['after'])
assert digest(transformed.encode('utf-8'))==adapter['inMemorySha256']
assert adapter['compression']=='ZIP_STORED' and adapter['frozenSourceUnchanged']
for stored_archive in (Path(preview['zip']),friend_path):
    with zipfile.ZipFile(stored_archive) as z:
        assert all(i.compress_type==zipfile.ZIP_STORED for i in z.infolist())
assert len(package['files']) == 66
assert all(any(x['file']==name for x in package['files']) for name in ('game/controls.js','game/warnings.js','audio/warning-mixer.js','game/bakery-opening.js'))
assert info['appAsarSha256'] == package['archiveSha256']
assert digest((Path(preview['folder']) / 'resources/app.asar').read_bytes()) == package['archiveSha256']
assert digest((Path(preview['folder']) / 'Custard Knights.exe').read_bytes()) == package['executableSha256']
aim = json.loads((repo / 'qa/results/beta16-packaged-bakery/report.json').read_text())
assert len(aim['checks']) == 36 and all(x['pass'] for x in aim['checks'])
assert aim['sourceHashes'] == aim['sourceHashesAfter'] and not aim['errors'] and not aim.get('failure')
assert aim['stableSources'] is True
by_source = {x['file']: x for x in package['files']}
assert all(by_source[name]['sha256'] == value for name, value in aim['sourceHashes'].items())
followup=json.loads((repo/'qa/results/beta16-packaged-bakery-followup/report.json').read_text())
assert len(followup['checks'])==7 and all(x['pass'] for x in followup['checks'])
assert followup['sourceHashes']==followup['sourceHashesAfter']==aim['sourceHashes'] and not followup['errors'] and not followup.get('failure') and followup['stableSources']
actual_home = json.loads((here / 'actual-bakery.json').read_text())
assert actual_home['pass'] and len(actual_home['checks']) == 8
assert all(x['pass'] for x in actual_home['checks']) and actual_home['origin'] == 'custard://game'
assert actual_home['asarSha256Before']==actual_home['asarSha256After']==package['archiveSha256'] and actual_home['stableAsar']
assert actual_home['rendererInstrumented'] is False and actual_home['fixtureManifest']['gameStateInjection'] is False and actual_home['fixtureManifest']['autoplayOverride'] is False and actual_home['gates']
assert actual_home['originalIndexSha256']==by_source['index.html']['sha256'] and actual_home['bootstrapQaQuery'] is True and actual_home['checkedDocumentQuery']=='' and actual_home['checkedDocumentQaHelpers'] is False
record = dict(version=preview['version'], sourceCommit=preview['sourceCommit'],
    asarSha256=package['archiveSha256'], executableSha256=package['executableSha256'],
    packageEntries=len(package['files']), friendsGameFiles=len(info['gameFiles']), preview={k:preview[k] for k in ('bytes','sha256')},
    friends={k:friends[k] for k in ('bytes','sha256')}, zipIntegrity=True,
    exactCopiedGameBytes=True, exactPreviewZipGameBytes=True, exactFrozenNormalizedMaterials=True, packagedBakeryChecks=len(aim['checks']), packagedBakeryFollowupChecks=len(followup['checks']), actualDesktopBakeryChecks=len(actual_home['checks']), nativeRendererInstrumented=False, nativeBootstrapQaQuery=True, nativeCheckedDocumentQuery='', publiclyUploaded=False, compression='ZIP_STORED', friendsBundlerSourceFrozenNormalizedExact=True, friendsAdapterSubstitutionsExact=True)
(here / 'exports.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2))
