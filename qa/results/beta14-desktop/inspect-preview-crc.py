from pathlib import Path
import zipfile,struct,zlib,hashlib,json
root=Path(__file__).resolve().parents[3]
archive=root.parent.parent/'outputs/Custard-Knights-Windows-0.3.0-beta.14-preview.zip.partial'
with zipfile.ZipFile(archive) as z:
    info=next(i for i in z.infolist() if i.filename.endswith('/resources/app.asar'))
    with archive.open('rb') as stream:
        stream.seek(info.header_offset)
        head=stream.read(30)
        names,extra=struct.unpack_from('<HH',head,26)
        stream.seek(names+extra,1)
        compressed=stream.read(info.compress_size)
    data=zlib.decompress(compressed,-15)
    digest=lambda b:hashlib.sha256(b).hexdigest()
    source=(root/'dist/Custard Knights-win32-x64/resources/app.asar').read_bytes()
    folder=(archive.parent/'Custard-Knights-Windows-0.3.0-beta.14-preview/resources/app.asar').read_bytes()
    record=dict(archive=str(archive),entry=info.filename,archiveBytes=archive.stat().st_size,compressedBytes=info.compress_size,declaredBytes=info.file_size,decompressedBytes=len(data),declaredCrc=info.CRC,actualCrc=zlib.crc32(data),decompressedSha256=digest(data),sourceSha256=digest(source),folderSha256=digest(folder),sourceFolderExact=source==folder,archiveSourceExact=data==source)
(Path(__file__).parent/'preview-crc-details.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record,indent=2))
